const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Generate a secure token for quotation sharing
function generateShareToken(quotationId, userId) {
  const data = `${quotationId}-${userId}-${Date.now()}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Create a shareable link for a quotation
router.post('/create-link', async (req, res) => {
  try {
    const { quotationId } = req.body;
    const supabaseToken = req.headers['x-supabase-token'];
    
    if (!supabaseToken || !quotationId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Verify the user's session
    const { data: { user }, error: authError } = await supabase.auth.getUser(supabaseToken);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Generate a unique token for this quotation
    const shareToken = generateShareToken(quotationId, user.id);
    
    // Store the token in the database with an expiration date (30 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    const { data, error } = await supabase
      .from('shared_quotations')
      .insert([
        { 
          quotation_id: quotationId,
          user_id: user.id,
          token: shareToken,
          expires_at: expiresAt.toISOString()
        }
      ]);
    
    if (error) {
      console.error('Error storing share token:', error);
      return res.status(500).json({ error: 'Failed to create shareable link' });
    }
    
    // Generate the full URL for the shared quotation
    const shareUrl = `${process.env.CLIENT_URL}/quotation/${quotationId}/${shareToken}`;
    
    return res.status(200).json({ 
      shareUrl,
      expiresAt: expiresAt.toISOString()
    });
    
  } catch (error) {
    console.error('Error creating shareable link:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a shared quotation by ID and token
router.get('/:quotationId', async (req, res) => {
  try {
    const { quotationId } = req.params;
    const { token } = req.query;
    
    if (!quotationId || !token) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Verify the token is valid and not expired
    const { data: shareData, error: shareError } = await supabase
      .from('shared_quotations')
      .select('*')
      .eq('quotation_id', quotationId)
      .eq('token', token)
      .gte('expires_at', new Date().toISOString())
      .single();
    
    if (shareError || !shareData) {
      return res.status(404).json({ error: 'Invalid or expired link' });
    }
    
    // Get the user's Google credentials
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('google_refresh_token')
      .eq('id', shareData.user_id)
      .single();
    
    if (userError || !userData) {
      return res.status(500).json({ error: 'Failed to retrieve user data' });
    }
    
    // Set up Google OAuth client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    
    // Set credentials using the refresh token
    oauth2Client.setCredentials({
      refresh_token: userData.google_refresh_token
    });
    
    // Get a new access token
    await oauth2Client.getAccessToken();
    
    // Initialize Google Sheets API
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    
    // Get the spreadsheet ID from the database
    const { data: spreadsheetData, error: spreadsheetError } = await supabase
      .from('spreadsheets')
      .select('sheet_url')
      .eq('user_id', shareData.user_id)
      .eq('is_default', true)
      .single();
    
    if (spreadsheetError || !spreadsheetData) {
      return res.status(500).json({ error: 'Failed to retrieve spreadsheet data' });
    }
    
    // Extract spreadsheet ID from the URL
    const spreadsheetId = spreadsheetData.sheet_url.match(/[-\w]{25,}/)[0];
    
    // Get all quotations from the spreadsheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Quotations!A:Z',
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'No quotations found' });
    }
    
    // Get the headers (first row)
    const headers = rows[0];
    
    // Find the quotation with the matching ID
    let quotationRow = null;
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[headers.indexOf('Quotation ID')] === quotationId) {
        quotationRow = row;
        break;
      }
    }
    
    if (!quotationRow) {
      return res.status(404).json({ error: 'Quotation not found' });
    }
    
    // Parse the quotation data
    const quotation = {
      id: quotationRow[headers.indexOf('Quotation ID')],
      date: quotationRow[headers.indexOf('Date')],
      validUntil: quotationRow[headers.indexOf('Valid Until')],
      amount: parseFloat(quotationRow[headers.indexOf('Amount')]),
      status: quotationRow[headers.indexOf('Status')],
      customer: {
        name: quotationRow[headers.indexOf('Customer Name')],
        email: quotationRow[headers.indexOf('Customer Email')],
        address: quotationRow[headers.indexOf('Customer Address')]
      },
      items: JSON.parse(quotationRow[headers.indexOf('Items')] || '[]'),
      tax: JSON.parse(quotationRow[headers.indexOf('Tax')] || '{"type":"percentage","value":0}'),
      discount: JSON.parse(quotationRow[headers.indexOf('Discount')] || '{"type":"percentage","value":0}'),
      notes: quotationRow[headers.indexOf('Notes')],
      template: quotationRow[headers.indexOf('Template')] || 'classic'
    };
    
    // Get business details
    const businessResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Business!A:B',
    });
    
    const businessRows = businessResponse.data.values;
    let businessData = {
      companyName: '',
      phone: '',
      address: '',
      email: '',
      logo: ''
    };
    
    if (businessRows && businessRows.length > 0) {
      for (const row of businessRows) {
        if (row.length >= 2) {
          const key = row[0];
          const value = row[1];
          
          if (key === 'Company Name') businessData.companyName = value;
          else if (key === 'Phone Number') businessData.phone = value;
          else if (key === 'Address') businessData.address = value;
          else if (key === 'Business Email') businessData.email = value;
          else if (key === 'Logo') businessData.logo = value;
        }
      }
    }
    
    return res.status(200).json({
      quotation,
      businessData
    });
    
  } catch (error) {
    console.error('Error retrieving shared quotation:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 