const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to extract sheet ID from URL
function extractSheetIdFromUrl(url) {
  const match = url.match(/[-\w]{25,}/);
  return match ? match[0] : null;
}

// Helper function to calculate subtotal
function calculateSubtotal(items) {
  return items.reduce((sum, item) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price) || 0 : item.price;
    const quantity = item.quantity || 0;
    return sum + (price * quantity);
  }, 0);
}

// Helper function to calculate discount
function calculateDiscount(items) {
  return items.reduce((sum, item) => {
    const subtotal = (typeof item.price === 'string' ? parseFloat(item.price) || 0 : item.price) * (item.quantity || 0);
    const discountValue = typeof item.discount.value === 'string' ? parseFloat(item.discount.value) || 0 : item.discount.value;
    
    if (item.discount.type === 'percentage') {
      return sum + (subtotal * discountValue / 100);
    }
    return sum + discountValue;
  }, 0);
}

// Helper function to calculate tax
function calculateTax(items) {
  return items.reduce((sum, item) => {
    const subtotal = (typeof item.price === 'string' ? parseFloat(item.price) || 0 : item.price) * (item.quantity || 0);
    const discountValue = typeof item.discount.value === 'string' ? parseFloat(item.discount.value) || 0 : item.discount.value;
    const taxValue = typeof item.tax.value === 'string' ? parseFloat(item.tax.value) || 0 : item.tax.value;
    
    const discountedSubtotal = item.discount.type === 'percentage' 
      ? subtotal * (1 - discountValue / 100)
      : subtotal - discountValue;
    
    if (item.tax.type === 'percentage') {
      return sum + (discountedSubtotal * taxValue / 100);
    }
    return sum + taxValue;
  }, 0);
}

// Save quotation
router.post('/save', async (req, res) => {
  try {
    // Verify Supabase session first
    const supabaseToken = req.headers.authorization?.split(' ')[1];
    if (!supabaseToken) {
      return res.status(401).json({ error: 'Missing Supabase token' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(supabaseToken);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid Supabase session' });
    }

    // Now use Google token from request body
    const { accessToken, quotationData, sheetUrl } = req.body;
    if (!accessToken) {
      return res.status(401).json({ error: 'Missing Google credentials' });
    }

    // Proceed with Google auth
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const sheets = google.sheets({ version: 'v4', auth });

    // Calculate totals
    const subtotal = calculateSubtotal(quotationData.items);
    const discountAmount = calculateDiscount(quotationData.items);
    const taxAmount = calculateTax(quotationData.items);
    const total = (subtotal - discountAmount + taxAmount).toFixed(2);

    // Get spreadsheet ID
    const spreadsheetId = sheetUrl
      ? extractSheetIdFromUrl(sheetUrl)
      : (await getDefaultSheetId(accessToken));

    if (!spreadsheetId) {
      return res.status(500).json({ error: 'Failed to resolve sheet ID' });
    }

    // Get sheet metadata to determine the sheet name
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const quotationSheet = spreadsheet.data.sheets.find(
      s => s.properties.title === "SheetBills Quotations"
    );
    if (!quotationSheet) {
      console.error("SheetBills Quotations tab not found in spreadsheet");
      return res.status(404).json({ error: 'SheetBills Quotations tab not found' });
    }
    const sheetName = quotationSheet.properties.title;

    // Fetch all quotation numbers
    const existingRows = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A2:A`,
    });
    const existingIds = (existingRows.data.values || []).map(row => row[0]?.trim());
    if (existingIds.includes(quotationData.quotationNumber.trim())) {
      return res.status(400).json({ error: 'Quotation number already exists. Use update instead.' });
    }

    // Prepare data for Google Sheets
    const values = [
      [
        quotationData.quotationNumber,
        quotationData.date,
        quotationData.validUntil,
        quotationData.customer.name,
        quotationData.customer.email,
        quotationData.customer.address,
        JSON.stringify(quotationData.items),
        total,
        JSON.stringify(quotationData.tax),
        JSON.stringify(quotationData.discount),
        quotationData.notes,
        quotationData.template || 'classic',
        quotationData.status || 'Pending'
      ]
    ];

    // Append the new quotation to the sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:M`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: { values }
    });

    res.json({
      success: true,
      quotationData: {
        ...quotationData,
        subtotal,
        discountAmount,
        taxAmount,
        total
      }
    });
  } catch (error) {
    console.error('Error saving quotation:', error);
    return res.status(500).json({
      error: 'Failed to save quotation',
      details: error.message
    });
  }
});

// Update quotation
router.post('/update', async (req, res) => {
  try {
    const { accessToken, quotationData, quotationId, sheetUrl } = req.body;

    // Validate input
    if (!accessToken || !quotationData || !quotationId || !sheetUrl) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Initialize Google Sheets API
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const sheets = google.sheets({ version: 'v4', auth });

    // Extract spreadsheet ID
    const spreadsheetId = extractSheetIdFromUrl(sheetUrl);
    if (!spreadsheetId) {
      return res.status(400).json({ error: 'Invalid sheet URL' });
    }

    // Get sheet metadata
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const quotationSheet = spreadsheet.data.sheets.find(
      s => s.properties.title === "SheetBills Quotations"
    );
    if (!quotationSheet) {
      return res.status(404).json({ error: 'SheetBills Quotations tab not found' });
    }
    const sheetName = quotationSheet.properties.title;

    // Get all rows
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:M`,
    });

    const rows = response.data.values || [];
    if (rows.length < 2) {
      return res.status(404).json({ error: 'No quotations found' });
    }

    // Find the exact row index (skip header row)
    const rowIndex = rows.findIndex((row) => row[0]?.trim() === quotationId.trim());

    if (rowIndex === -1) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    // Calculate totals
    const subtotal = calculateSubtotal(quotationData.items);
    const discountAmount = calculateDiscount(quotationData.items);
    const taxAmount = calculateTax(quotationData.items);
    const total = (subtotal - discountAmount + taxAmount).toFixed(2);

    // Prepare updated data
    const updatedRow = [
      quotationId,
      quotationData.date,
      quotationData.validUntil,
      quotationData.customer.name,
      quotationData.customer.email,
      quotationData.customer.address,
      JSON.stringify(quotationData.items),
      total,
      JSON.stringify(quotationData.tax),
      JSON.stringify(quotationData.discount),
      quotationData.notes,
      quotationData.template || 'classic',
      quotationData.status || 'Pending'
    ];

    // Update the row
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A${rowIndex + 1}:M${rowIndex + 1}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [updatedRow]
      }
    });

    res.json({
      success: true,
      quotationData: {
        ...quotationData,
        subtotal,
        discountAmount,
        taxAmount,
        total
      }
    });
  } catch (error) {
    console.error('Error updating quotation:', error);
    return res.status(500).json({
      error: 'Failed to update quotation',
      details: error.message
    });
  }
});

// Delete quotation
router.delete('/delete', async (req, res) => {
  try {
    const { quotationId, sheetUrl } = req.body;
    
    // Get authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header is required' });
    }
    const accessToken = authHeader.split(' ')[1];

    if (!quotationId || !sheetUrl) {
      return res.status(400).json({ error: 'Quotation ID and sheet URL are required' });
    }

    // Initialize Google Sheets API
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const sheets = google.sheets({ version: 'v4', auth });

    // Extract spreadsheet ID
    const spreadsheetId = extractSheetIdFromUrl(sheetUrl);
    if (!spreadsheetId) {
      return res.status(400).json({ error: 'Invalid sheet URL' });
    }

    // Get sheet metadata
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const quotationSheet = spreadsheet.data.sheets.find(
      s => s.properties.title === "SheetBills Quotations"
    );
    if (!quotationSheet) {
      return res.status(404).json({ error: 'SheetBills Quotations tab not found' });
    }
    const sheetName = quotationSheet.properties.title;

    // Get all rows
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:M`,
    });

    const rows = response.data.values || [];
    if (rows.length < 2) {
      return res.status(404).json({ error: 'No quotations found' });
    }

    // Find the exact row index (skip header row)
    const rowIndex = rows.findIndex((row) => row[0]?.trim() === quotationId.trim());

    if (rowIndex === -1) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    // Delete the row
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: quotationSheet.properties.sheetId,
                dimension: 'ROWS',
                startIndex: rowIndex + 1, // Account for header row
                endIndex: rowIndex + 2,
              },
            },
          },
        ],
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting quotation:', error);
    res.status(500).json({ 
      error: 'Failed to delete quotation',
      details: error.message 
    });
  }
});

// Get quotation by ID
router.get('/:quotationId', async (req, res) => {
  try {
    const { quotationId } = req.params;
    const { sheetUrl } = req.query;

    // Validate input
    if (!quotationId || !sheetUrl) {
      return res.status(400).json({ error: 'Missing quotationId or sheetUrl' });
    }

    // Extract spreadsheetId from sheetUrl
    const spreadsheetId = extractSheetIdFromUrl(sheetUrl);
    if (!spreadsheetId) {
      return res.status(400).json({ error: 'Invalid sheetUrl' });
    }

    // Auth: get Google token from headers
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Google authentication required' });
    }
    const googleToken = authHeader.split(' ')[1];

    // Initialize Google Sheets API
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: googleToken });
    const sheets = google.sheets({ version: 'v4', auth });

    // Find the correct sheet/tab
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const quotationSheet = spreadsheet.data.sheets.find(
      s => s.properties.title === "SheetBills Quotations"
    );
    if (!quotationSheet) {
      return res.status(404).json({ error: 'SheetBills Quotations tab not found' });
    }
    const sheetName = quotationSheet.properties.title;

    // Fetch all quotation rows
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A2:M`,
    });

    const rows = response.data.values || [];
    const row = rows.find(r => r[0] === quotationId);
    if (!row) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    // Parse items, tax, discount, customer
    let items = [];
    let tax = { type: 'percentage', value: 0 };
    let discount = { type: 'percentage', value: 0 };
    try { items = JSON.parse(row[6] || '[]'); } catch {}
    try { tax = JSON.parse(row[8] || '{"type":"percentage","value":0}'); } catch {}
    try { discount = JSON.parse(row[9] || '{"type":"percentage","value":0}'); } catch {}

    // Build quotation object
    const quotation = {
      id: row[0],
      quotationNumber: row[0],
      date: row[1],
      validUntil: row[2],
      customer: {
        name: row[3],
        email: row[4],
        address: row[5],
      },
      items,
      amount: parseFloat(row[7]) || 0,
      tax,
      discount,
      notes: row[10],
      template: row[11] || 'classic',
      status: row[12] || 'Pending',
    };

    res.json({ quotation });
  } catch (error) {
    console.error('Error fetching quotation:', error);
    res.status(500).json({ error: 'Failed to fetch quotation', details: error.message });
  }
});

module.exports = router; 