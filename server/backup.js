import express from 'express'; // Import express package
import axios from 'axios'; // Import the axios package
import dotenv from 'dotenv'; // Import the dotenv package
import cors from 'cors'; // Import the cors package
import { google } from 'googleapis'; // Import the googleapis package
import { createClient } from '@supabase/supabase-js';

dotenv.config(); // Load environment variables
const app = express(); // Create an Express app
// This is used to rap the backend server to the frontend server using (Cross Origin Resource Sharing)
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from this origin
  credentials: true, // Allow cookies and credentials
}));
app.use(express.json()); // Enable JSON body parsing


// Creation of Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize with API key
function createAuthClient(accessToken) {
  const auth = new OAuth2(process.env.GOOGLE_API_KEY); // <-- Only new line
  auth.setCredentials({ access_token: accessToken }); // Existing Supabase flow
  return auth;
}



////////////////////////////////////////////////////////////////////
{/*Helper Methods*/}
////////////////////////////////////////////////////////////////////
// Function to Extract Sheet ID from URL
function extractSheetIdFromUrl(url) {
  if (!url) {
    console.error("Sheet URL is undefined");
    return null;
  }

  try {
    // Your existing extraction logic
    const match = url.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  } catch (error) {
    console.error("Error extracting sheet ID:", error);
    return null;
  }
}
// Function to get or create the master sheet
async function getOrCreateMasterSheet(googleToken, userId) {
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: googleToken});

    const drive = google.drive({ version: 'v3', auth });
    const sheets = google.sheets({ version: 'v4', auth });

    // Look for existing master sheet
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet' and name='Google Sheets Tracker' and trashed=false",
      fields: 'files(id, name, webViewLink)'
    });

    // If master sheet exists, return it
    if (response.data.files.length > 0) {
      return response.data.files[0];
    }

    // Create a new master sheet if none exists
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: 'Google Sheets Tracker',
        },
        sheets: [
          {
            properties: {
              title: 'My Sheets',
              gridProperties: {
                frozenRowCount: 1
              }
            }
          }
        ]
      },
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId;

    // Set up the headers
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'My Sheets!A1:E1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          ['Sheet ID', 'Name', 'Created Date', 'Description', 'Sheet URL']
        ]
      }
    });

    // Format headers
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            updateCells: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: 5,
              },
              rows: [
                {
                  values: Array(5).fill({
                    userEnteredFormat: {
                      textFormat: { bold: true },
                      backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 }
                    }
                  })
                }
              ],
              fields: 'userEnteredFormat'
            }
          }
        ]
      }
    });

    return {
      id: spreadsheetId,
      name: 'Google Sheets Tracker',
      webViewLink: spreadsheet.data.spreadsheetUrl
    };
  } catch (error) {
    console.error('Error creating master sheet:', error);
    throw error;
  }
}
// Helper function to get or create default sheet
async function getDefaultSheetId(accessToken) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const sheets = google.sheets({ version: 'v4', auth });

  try {
    // 1. Get master sheet reference
    const masterSheet = await getOrCreateMasterSheet(accessToken);

    // 2. Read master sheet data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: masterSheet.id,
      range: 'My Sheets!A:F'
    });

    // 3. Find existing default sheet
    const defaultSheet = response.data.values?.find(row => row[5]?.trim() === 'TRUE');

    if (defaultSheet) {
      const sheetId = extractSheetIdFromUrl(defaultSheet[4]);
      if (sheetId) return sheetId;
      console.error('Found default sheet but invalid URL:', defaultSheet[4]);
    }

    // 4. Create new default sheet if none found
    const newSheet = await sheets.spreadsheets.create({
      resource: {
        properties: {
          title: 'Default Invoices',
          locale: 'en_US',
          timeZone: 'America/New_York'
        },
        sheets: [{
          properties: {
            title: 'Invoices',
            gridProperties: {
              rowCount: 1000,
              columnCount: 15
            }
          }
        }]
      }
    });

    // 5. Add to master sheet
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${newSheet.data.spreadsheetId}`;
    await sheets.spreadsheets.values.append({
      spreadsheetId: masterSheet.id,
      range: 'My Sheets!A:F',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          new Date().toISOString(),
          'Default Invoices',
          'Business',
          'Invoices',
          sheetUrl,
          'TRUE' // Mark as default
        ]]
      }
    });

    return newSheet.data.spreadsheetId;

  } catch (error) {
    console.error('Failed to get default sheet:', error);
    throw new Error('Could not retrieve or create default sheet');
  }
}


////////////////////////////////////////////////////////////////////
{/*Helper Methods for calculations*/}
////////////////////////////////////////////////////////////////////
function calculateSubtotal(items) {
  return items.reduce((total, item) => total + item.quantity * item.price, 0);
}
function calculateDiscount(subtotal, discount) {
  if (discount.type === "percentage") {
    return (subtotal * discount.value) / 100;
  } else {
    return Math.min(subtotal, discount.value); // Ensure discount doesn't exceed subtotal
  }
}
function calculateTax(subtotal, discountAmount, tax) {
  const afterDiscount = subtotal - discountAmount;

  if (tax.type === "percentage") {
    return (afterDiscount * tax.value) / 100;
  } else {
    return tax.value;
  }
}
function calculateFinalTotal(invoiceData) {
  const subtotal = calculateSubtotal(invoiceData.items);
  const discountAmount = calculateDiscount(subtotal, invoiceData.discount);
  const taxAmount = calculateTax(subtotal, discountAmount, invoiceData.tax);

  return (subtotal - discountAmount + taxAmount).toFixed(2);
}





////////////////////////////////////////////////////////////////////
{/*Methods to Hanlde Google Sheet Operations*/}
////////////////////////////////////////////////////////////////////
// Function to Create Invoice 
app.post('/api/create-sheet', async (req, res) => {
  try {
    // Verify Supabase session first
    const supabaseToken = req.headers['x-supabase-token'];
    if (!supabaseToken) {
      return res.status(401).json({ error: 'Missing Supabase session token' });
    }

    // Validate Supabase user
    const { data: { user }, error } = await supabase.auth.getUser(supabaseToken);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid Supabase session' });
    }

    // Get Google access token from headers
    const accessToken = req.headers.authorization?.split(' ')[1];
    if (!accessToken) {
      return res.status(400).json({ error: 'Google access token required' });
    }

    // Get request parameters
    const { name = 'New Sheet', description = '' } = req.body;

    // Initialize Google Sheets client
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const sheets = google.sheets({ version: 'v4', auth });

    // Create new spreadsheet
    const newSheet = await sheets.spreadsheets.create({
      resource: {
        properties: {
          title: `${name} - ${new Date().toLocaleDateString()}`,
        },
        sheets: [{
          properties: {
            title: 'Sheet1',
            gridProperties: { frozenRowCount: 1 }
          }
        }]
      }
    });

    const newSheetId = newSheet.data.spreadsheetId;
    const newSheetUrl = newSheet.data.spreadsheetUrl;

    // Prepare invoice headers
    const headers = [
      'Invoice ID', 'Invoice Date', 'Due Date', 'Customer Name',
      'Customer Email', 'Customer Address', 'Items', 'Amount',
      'Tax', 'Discount', 'Notes', 'Template', 'Status'
    ];

    // Add headers to the sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId: newSheetId,
      range: 'Sheet1!A1',
      valueInputOption: 'RAW',
      resource: { values: [headers] }
    });

    // Format headers
    const firstSheetId = newSheet.data.sheets[0].properties.sheetId;
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: newSheetId,
      resource: {
        requests: [{
          repeatCell: {
            range: {
              sheetId: firstSheetId,
              startRowIndex: 0,
              endRowIndex: 1
            },
            cell: {
              userEnteredFormat: {
                textFormat: { bold: true },
                backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 }
              }
            },
            fields: 'userEnteredFormat(textFormat,backgroundColor)'
          }
        }, {
          autoResizeDimensions: {
            dimensions: {
              sheetId: firstSheetId,
              dimension: 'COLUMNS'
            }
          }
        }]
      }
    });

    // Add to master sheet
    const masterSheet = await getOrCreateMasterSheet(accessToken, user.id);
    const sheetId = `SHEET-${Date.now().toString().slice(-6)}`;

    await sheets.spreadsheets.values.append({
      spreadsheetId: masterSheet.id,
      range: 'My Sheets!A:E',
      valueInputOption: 'RAW',
      resource: {
        values: [[
          sheetId,
          name,
          new Date().toISOString(),
          description,
          newSheetUrl
        ]]
      }
    });

    res.json({
      success: true,
      sheetId,
      spreadsheetId: newSheetId,
      spreadsheetUrl: newSheetUrl,
      headers
    });

  } catch (error) {
    console.error('Sheet creation error:', error);
    res.status(500).json({
      error: 'Sheet creation failed',
      details: error.response?.data || error.message
    });
  }
});
// read data from a Google Sheet 
app.get('/api/sheets', async (req, res) => {
  try {
    // Validate headers
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Invalid authorization header format' });
    }

    // Verify Google token
    const accessToken = authHeader.split(' ')[1];
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    try {
      await auth.getTokenInfo(accessToken); // Verify token validity
    } catch (error) {
      return res.status(401).json({ error: 'Invalid Google token' });
    }

    // Get user info
    const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // Get/create master sheet
    const masterSheet = await getOrCreateMasterSheet(accessToken, userInfo.data.sub);

    // Fetch sheet data
    const sheetsAPI = google.sheets({ version: 'v4', auth });
    const response = await sheetsAPI.spreadsheets.values.get({
      spreadsheetId: masterSheet.id,
      range: 'My Sheets!A:E',
    });

    // Transform response
    const sheetsList = (response.data.values || [])
      .slice(1) // Skip header
      .map(row => ({
        id: row[0] || '',
        name: row[1] || 'Unnamed Sheet',
        createdAt: row[2] || new Date().toISOString(),
        description: row[3] || '',
        sheetUrl: row[4] || '',
        isDefault: false // Frontend will update this
      }));

    res.json({
      sheets: sheetsList,
      totalCount: sheetsList.length,
      masterSheetUrl: masterSheet.webViewLink
    });

  } catch (error) {
    console.error('Sheets fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch sheets',
      details: error.response?.data?.error || error.message
    });
  }
});
// delete invoice 
app.delete('/api/sheets/delete-invoice', async (req, res) => {
  console.log('[DELETE-INVOICE] Request received');
  try {
    const { sheetUrl, invoiceId } = req.body;
    console.log('Request body:', { sheetUrl, invoiceId });

    // Validate Supabase token
    const supabaseToken = req.headers['x-supabase-token'];
    if (!supabaseToken) {
      console.error('[ERROR] Missing Supabase token');
      return res.status(401).json({ error: 'Supabase authentication required' });
    }

    // Validate Google token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('[ERROR] Missing Google token');
      return res.status(401).json({ error: 'Google authentication required' });
    }
    const googleToken = authHeader.split(' ')[1];

    // Input validation
    if (!sheetUrl || !invoiceId) {
      console.error('[ERROR] Missing required fields');
      return res.status(400).json({ error: 'Sheet URL and Invoice ID are required' });
    }

    // Extract sheet ID
    const spreadsheetId = extractSheetIdFromUrl(sheetUrl);
    console.log('Extracted spreadsheet ID:', spreadsheetId);
    if (!spreadsheetId) {
      console.error('[ERROR] Invalid sheet URL:', sheetUrl);
      return res.status(400).json({ error: 'Invalid sheet URL' });
    }

    // Initialize Google Sheets API
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: googleToken });
    const sheets = google.sheets({ version: 'v4', auth });

    // Get sheet metadata
    console.log('Fetching spreadsheet metadata...');
    const spreadsheetMetadata = await sheets.spreadsheets.get({ spreadsheetId });
    const firstSheet = spreadsheetMetadata.data.sheets?.[0];
    
    if (!firstSheet) {
      console.error('[ERROR] No sheets found in spreadsheet');
      return res.status(404).json({ error: 'No sheets found' });
    }

    const sheetId = firstSheet.properties.sheetId;
    console.log('Using sheet ID:', sheetId);

    // Fetch invoice data
    console.log('Searching for invoice row...');
    const valuesResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A2:L',
    });

    const rows = valuesResponse.data.values || [];
    console.log(`Found ${rows.length} rows`);

    // Find target row
    const rowIndex = rows.findIndex(row => row[0] === invoiceId);
    console.log('Found row index:', rowIndex);
    
    if (rowIndex === -1) {
      console.error('[ERROR] Invoice not found');
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Delete row
    const deleteRequest = {
      deleteDimension: {
        range: {
          sheetId,
          dimension: 'ROWS',
          startIndex: rowIndex + 1, // Account for header row
          endIndex: rowIndex + 2,
        },
      },
    };

    console.log('Executing delete request:', deleteRequest);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [deleteRequest] },
    });

    console.log('Delete successful');
    res.json({ success: true });
    
  } catch (error) {
    console.error('[ERROR]', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    res.status(500).json({ 
      error: 'Failed to delete invoice',
      details: error.message 
    });
  }
});
// fetch invoices from google sheets to dashbaord
app.get('/api/sheets/data', async (req, res) => {
  try {
    console.log('[API] /api/sheets/data request received');
    const { sheetUrl } = req.query;
  
    // Get both tokens - Supabase token for authentication and Google token for API access
    const supabaseToken = req.headers['x-supabase-token']; // Add this header from frontend
    const googleToken = req.headers.authorization?.split(' ')[1];

    // Validate inputs
    if (!googleToken) {
      console.error('[Error] Missing or invalid Google authorization token');
      return res.status(401).json({ error: 'Google authentication token required' });
    }

    if (!supabaseToken) {
      console.error('[Error] Missing Supabase token');
      return res.status(401).json({ error: 'Supabase authentication token required' });
    }


    if (!sheetUrl) {
      console.error('[Error] Missing sheetUrl parameter');
      return res.status(400).json({ error: 'Sheet URL required' });
    }

   // Extract and validate sheet ID
   const sheetId = extractSheetIdFromUrl(sheetUrl);
   if (!sheetId) {
     console.error('[Error] Invalid sheet URL format:', sheetUrl);
     return res.status(400).json({ error: 'Invalid sheet URL format' });
   }

   // Initialize Google Sheets API with the Google OAuth token
   const auth = new google.auth.OAuth2();
   auth.setCredentials({ access_token: googleToken });
   const sheets = google.sheets({ version: 'v4', auth });

   // Fetch data from Google Sheets
   console.log('[Google Sheets] Fetching data...');
   const response = await sheets.spreadsheets.values.get({
     spreadsheetId: sheetId,
     range: 'Sheet1!A2:M', // Get all invoice rows
   });



    const rows = response.data.values || [];
    console.log(`[Google Sheets] Found ${rows.length} invoice rows`);

    // Process each invoice row
    const invoices = rows.map((row, index) => {
      console.log(`[Processing] Row ${index + 1}`, row);

      // Helper function to parse financial fields with defaults
      const parseFinancialField = (value, defaultValue = { type: "percentage", value: 0 }) => {
        if (!value) return defaultValue;

        try {
          // Handle both stringified JSON and direct objects
          const parsed = typeof value === 'string' ? JSON.parse(value) : value;
          if (parsed && typeof parsed === 'object') {
            return {
              type: ["percentage", "fixed"].includes(parsed.type) ? parsed.type : "percentage",
              value: !isNaN(Number(parsed.value)) ? Number(parsed.value) : 0
            };
          }
        } catch (e) {
          console.error('Error parsing financial field:', value, e);
        }
        return defaultValue;
      };

      // Parse items array
      let items = [];
      try {
        items = row[6] ? JSON.parse(row[6]) : [];
        if (!Array.isArray(items)) items = [];
      } catch (e) {
        console.error('Error parsing items:', row[6], e);
        items = [];
      }

      // Parse tax and discount with defaults
      const tax = parseFinancialField(row[8]);
      const discount = parseFinancialField(row[9], { type: "fixed", value: 0 });

      // Calculate amount if not provided
      let amount = parseFloat(row[7]) || 0;
      if (!amount && items.length > 0) {
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const discountAmount = discount.type === "percentage" ?
          (subtotal * discount.value) / 100 :
          discount.value;
        const taxAmount = tax.type === "percentage" ?
          ((subtotal - discountAmount) * tax.value) / 100 :
          tax.value;
        amount = subtotal - discountAmount + taxAmount;
      }

      return {
        id: row[0] || '',
        invoiceNumber: row[0] || '',
        date: row[1] || '',
        dueDate: row[2] || '',
        customer: {
          name: row[3] || '',
          email: row[4] || '',
          address: row[5] || ''
        },
        items,
        amount,
        tax,
        discount,
        notes: row[10] || '',
        template: row[11] || 'classic',
        status: row[12] || 'Pending'
      };
    });

    console.log('[API] Returning processed invoices');
    res.json(invoices);
  } catch (error) {
    console.error('[API Error] Failed to fetch sheet data:', {
      error: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    res.status(500).json({
      error: 'Failed to fetch invoices',
      details: error.message,
      suggestion: 'Please check if the sheet URL is correct and you have proper permissions'
    });
  }
});
// set sheets as default
app.put('/api/sheets/set-default', async (req, res) => {
  try {
    // Verify Supabase session
    const supabaseToken = req.headers['x-supabase-token'];
    if (!supabaseToken) {
      return res.status(401).json({ error: 'Missing Supabase session' });
    }

    const { data: { user }, error: supabaseError } = await supabase.auth.getUser(supabaseToken);
    if (supabaseError || !user) {
      return res.status(401).json({ error: 'Invalid Supabase session' });
    }

    // Get parameters
    const { sheetUrl } = req.body;
    const googleToken = req.headers.authorization?.split(' ')[1]; // This is the Google OAuth token
    
    if (!sheetUrl) {
      return res.status(400).json({ error: 'Sheet URL required' });
    }
    
    if (!googleToken) {
      return res.status(400).json({ error: 'Google authentication required' });
    }

    // Initialize Google Auth with the Google OAuth token
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: googleToken });

    // Get master sheet
    const masterSheet = await getOrCreateMasterSheet(googleToken, user.id);
    const sheetsAPI = google.sheets({ version: 'v4', auth });

    // 1. First get the current data
    const response = await sheetsAPI.spreadsheets.values.get({
      spreadsheetId: masterSheet.id,
      range: 'My Sheets!A:F',
    });
    
    const currentData = response.data.values || [];
    
    // 2. Find the sheet in the data
    const sheetRowIndex = currentData.findIndex(row => row[4] === sheetUrl);
    if (sheetRowIndex === -1) {
      return res.status(404).json({ error: 'Sheet not found in tracker' });
    }

    // 3. Update all sheets to not be default (set F column to FALSE)
    await sheetsAPI.spreadsheets.values.update({
      spreadsheetId: masterSheet.id,
      range: 'My Sheets!F2:F',
      valueInputOption: 'RAW',
      resource: { 
        values: Array(currentData.length - 1).fill(['FALSE']) 
      }
    });

    // 4. Set the selected sheet as default
    await sheetsAPI.spreadsheets.values.update({
      spreadsheetId: masterSheet.id,
      range: `My Sheets!F${sheetRowIndex + 1}`,
      valueInputOption: 'RAW',
      resource: { values: [['TRUE']] }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Default sheet error:', error);
    
    // Detailed error logging
    if (error.response) {
      console.error('Google API error response:', error.response.data);
    }
    
    let errorMessage = 'Failed to set default';
    let errorDetails = {};
    
    if (error.response) {
      errorDetails = error.response.data || {};
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: errorDetails 
    });
  }
});
// fetch spreadsheets
app.get('/api/sheets/spreadsheets', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication token is required' });
    }

    const accessToken = authHeader.split(' ')[1];

    // Initialize the Google Sheets API client
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: 'v4', auth });

    // Fetch user info to find their master sheet
    const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const userId = userInfoResponse.data.sub;

    // Get the master sheet
    const masterSheet = await getOrCreateMasterSheet(accessToken, userId);

    // Get the data from the master sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: masterSheet.id,
      range: 'My Sheets!A:E',
    });

    const rows = response.data.values || [];

    // Skip the header row and convert to objects
    const spreadsheets = rows.slice(1).map(row => ({
      id: row[0] || '',
      name: row[1] || '',
      createdAt: row[2] || '',
      description: row[3] || '',
      sheetUrl: row[4] || '',
    }));

    res.json({ spreadsheets });
  } catch (error) {
    console.error('Error fetching spreadsheets:', error);
    res.status(500).json({ error: 'Failed to fetch spreadsheets', details: error.message });
  }
});
// save invoice 
app.post('/api/saveInvoice', async (req, res) => {

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
    const { accessToken, invoiceData, sheetUrl } = req.body;
    if (!accessToken) {
      return res.status(401).json({ error: 'Missing Google credentials' });
    }

    // Proceed with Google auth
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const sheets = google.sheets({ version: 'v4', auth });

    // Calculate totals
    const subtotal = invoiceData.items.reduce(
      (sum, item) => sum + (item.quantity * item.price), 0
    );

    const discountAmount = invoiceData.discount.type === 'percentage'
      ? subtotal * (invoiceData.discount.value / 100)
      : Math.min(subtotal, invoiceData.discount.value);

    const taxableAmount = subtotal - discountAmount;

    const taxAmount = invoiceData.tax.type === 'percentage'
      ? taxableAmount * (invoiceData.tax.value / 100)
      : invoiceData.tax.value;

    const total = subtotal - discountAmount + taxAmount;

    // Prepare data for Google Sheets
    const values = [
      [
        invoiceData.invoiceNumber || `INV-${Date.now()}`,
        invoiceData.date || new Date().toISOString().split('T')[0],
        invoiceData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        invoiceData.customer?.name || '',
        invoiceData.customer?.email || '',
        invoiceData.customer?.address || '',
        JSON.stringify(invoiceData.items),
        total.toFixed(2),
        JSON.stringify({ // Store tax as object
          type: invoiceData.tax?.type || 'percentage',
          value: invoiceData.tax?.value || 0
        }),
        JSON.stringify({ // Store discount as object
          type: invoiceData.discount?.type || 'percentage',
          value: invoiceData.discount?.value || 0
        }),
        invoiceData.notes || '',
        invoiceData.template || 'classic',
        invoiceData.status || 'Pending'
      ]
    ];

    // Get spreadsheet ID
    const spreadsheetId = sheetUrl
      ? extractSheetIdFromUrl(sheetUrl)
      : (await getDefaultSheetId(accessToken));

    if (!spreadsheetId) {
      // This should never happen now, but just in case
      return res.status(500).json({ error: 'Failed to resolve sheet ID' });
    }

    // Get first sheet name dynamically
    const sheetInfo = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetName = sheetInfo.data.sheets[0].properties.title;


    // Save to Google Sheets
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: { values }
    });

    res.json({
      success: true,
      invoiceData: {
        ...invoiceData,
        subtotal,
        discountAmount,
        taxAmount,
        total
      }
    });

  } catch (error) {
    console.error('Failed to save invoice:', error);
    res.status(500).json({
      error: 'Failed to save invoice',
      details: error.message
    });
  }
});
// mark invoices as pending
app.put('/api/sheets/mark-as-pending', async (req, res) => {
  console.log('[MARK-AS-PENDING] Request received');
  try {
    const { sheetUrl, invoiceId } = req.body;
    console.log('Request body:', { sheetUrl, invoiceId });

    // Validate Supabase token first
    const supabaseToken = req.headers['x-supabase-token'];
    if (!supabaseToken) {
      console.error('[ERROR] Missing Supabase token');
      return res.status(401).json({ error: 'Supabase authentication required' });
    }

    // Validate Google token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('[ERROR] Missing Google token');
      return res.status(401).json({ error: 'Google authentication required' });
    }
    const googleToken = authHeader.split(' ')[1];

    // Input validation
    if (!sheetUrl || !invoiceId) {
      console.error('[ERROR] Missing required fields');
      return res.status(400).json({ error: 'Sheet URL and Invoice ID are required' });
    }

    // Extract sheet ID
    const sheetId = extractSheetIdFromUrl(sheetUrl);
    console.log('Extracted sheet ID:', sheetId);
    if (!sheetId) {
      console.error('[ERROR] Invalid sheet URL:', sheetUrl);
      return res.status(400).json({ error: 'Invalid sheet URL' });
    }

    // Initialize Google Sheets API
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: googleToken });
    const sheets = google.sheets({ version: 'v4', auth });

    // Fetch data from sheet
    console.log('Fetching sheet data...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Sheet1!A2:M',
    });

    const rows = response.data.values || [];
    console.log(`Found ${rows.length} rows`);

    // Find invoice row
    const rowIndex = rows.findIndex(row => row[0] === invoiceId);
    console.log('Found row index:', rowIndex);
    
    if (rowIndex === -1) {
      console.error('[ERROR] Invoice not found in sheet');
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Update status (column M)
    const updateRange = `Sheet1!M${rowIndex + 2}`;
    console.log('Updating range:', updateRange);
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: updateRange,
      valueInputOption: 'RAW',
      requestBody: { values: [['Pending']] },
    });

    console.log('Update successful');
    res.json({ success: true });
    
  } catch (error) {
    console.error('[ERROR]', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    res.status(500).json({ 
      error: 'Operation failed',
      details: error.message 
    });
  }
});
// mark invoices as paid 
app.put('/api/sheets/mark-as-paid', async (req, res) => {
  console.log('[MARK-AS-PAID] Request received');
  try {
    const { sheetUrl, invoiceId } = req.body;
    console.log('Request body:', { sheetUrl, invoiceId });

    // Validate Supabase token first
    const supabaseToken = req.headers['x-supabase-token'];
    if (!supabaseToken) {
      console.error('[ERROR] Missing Supabase token');
      return res.status(401).json({ error: 'Supabase authentication required' });
    }

    // Validate Google token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('[ERROR] Missing Google token');
      return res.status(401).json({ error: 'Google authentication required' });
    }
    const googleToken = authHeader.split(' ')[1];

    // Input validation
    if (!sheetUrl || !invoiceId) {
      console.error('[ERROR] Missing required fields');
      return res.status(400).json({ error: 'Sheet URL and Invoice ID are required' });
    }

    // Extract sheet ID
    const sheetId = extractSheetIdFromUrl(sheetUrl);
    console.log('Extracted sheet ID:', sheetId);
    if (!sheetId) {
      console.error('[ERROR] Invalid sheet URL:', sheetUrl);
      return res.status(400).json({ error: 'Invalid sheet URL' });
    }

    // Initialize Google Sheets API
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: googleToken });
    const sheets = google.sheets({ version: 'v4', auth });

    // Fetch data from sheet
    console.log('Fetching sheet data...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Sheet1!A2:M',
    });

    const rows = response.data.values || [];
    console.log(`Found ${rows.length} rows`);

    // Find invoice row
    const rowIndex = rows.findIndex(row => row[0] === invoiceId);
    console.log('Found row index:', rowIndex);
    
    if (rowIndex === -1) {
      console.error('[ERROR] Invoice not found in sheet');
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Update status
    const updateRange = `Sheet1!M${rowIndex + 2}`;
    console.log('Updating range:', updateRange);
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: updateRange,
      valueInputOption: 'RAW',
      requestBody: { values: [['Paid']] },
    });

    console.log('Update successful');
    res.json({ success: true });
    
  } catch (error) {
    console.error('[ERROR]', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    res.status(500).json({ 
      error: 'Operation failed',
      details: error.message 
    });
  }
});
// delete a sheet - (Completed & Corrected Code)
app.delete('/api/sheets/:sheetUrl', async (req, res) => {
  try {
    const { sheetUrl } = req.params; // Get the sheet URL from the URL params
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication token is required' });
    }

    const accessToken = authHeader.split(' ')[1];

    // Extract the sheet ID from the sheet URL
    const sheetId = extractSheetIdFromUrl(sheetUrl);
    if (!sheetId) {
      return res.status(400).json({ error: 'Invalid sheet URL' });
    }

    console.log('Extracted Sheet ID:', sheetId); // Log the extracted sheet ID

    // Initialize the Google Drive API client
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: 'v3', auth });

    // Verify that the sheet exists before attempting to delete it
    try {
      const file = await drive.files.get({
        fileId: sheetId,
        fields: 'id, name, trashed',
      });

      console.log('File Details:', file.data); // Log file details

      if (file.data.trashed) {
        return res.status(404).json({ error: 'Sheet has already been moved to trash' });
      }
    } catch (error) {
      console.error('Error verifying sheet:', error);
      if (error.code === 404) {
        return res.status(404).json({ error: 'Sheet not found in Google Drive' });
      }
      throw error;
    }

    // Delete the sheet from Google Drive using the extracted sheet ID
    await drive.files.delete({
      fileId: sheetId,
    });

    console.log('Sheet deleted from Google Drive:', sheetId); // Log successful deletion

    // Remove the sheet from the master tracking sheet
    const sheets = google.sheets({ version: 'v4', auth });

    // Fetch the master sheet
    const masterSheet = await getOrCreateMasterSheet(accessToken, req.user?.sub || req.user?.id); // Use req.user.id if sub is not available

    // Get the metadata of the master sheet to find the correct sheetId
    const masterSheetMetadata = await sheets.spreadsheets.get({
      spreadsheetId: masterSheet.id,
    });

    // Find the sheetId of the first sheet (assuming the data is in the first sheet)
    const firstSheetId = masterSheetMetadata.data.sheets?.[0]?.properties?.sheetId;

    if (!firstSheetId) {
      return res.status(404).json({ error: 'No sheets found in the master tracking sheet' });
    }

    console.log('First Sheet ID in Master Sheet:', firstSheetId); // Log the sheetId

    // Get the data from the master sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: masterSheet.id,
      range: 'My Sheets!A:E', // Adjust the range to include all columns
    });

    const rows = response.data.values || [];

    // Find the row index of the sheet to delete (compare sheet URLs)
    const rowIndex = rows.findIndex((row) => row[4] === sheetUrl); // Column E contains the sheet URL

    if (rowIndex === -1) {
      return res.status(404).json({ error: 'Sheet not found in tracker' });
    }

    // Delete the row from the master sheet
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: masterSheet.id,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: firstSheetId, // Use the correct sheetId
                dimension: 'ROWS',
                startIndex: rowIndex, // Row index (0-based)
                endIndex: rowIndex + 1, // Delete one row
              },
            },
          },
        ],
      },
    });

    console.log('Sheet removed from master tracking sheet:', sheetUrl); // Log successful removal

    res.json({ success: true, message: 'Sheet deleted successfully' });
  } catch (error) {
    console.error('Error deleting sheet:', error);
    res.status(500).json({ error: 'Failed to delete sheet', details: error.message });
  }
});
// update invoice in Google Sheets - Fixed Version
app.post('/api/update-invoice', async (req, res) => {
  const { accessToken, invoiceData, invoiceId, sheetUrl } = req.body;

  try {
    console.log("Received request to update invoice:", { invoiceId, sheetUrl });

    // Validate inputs
    if (!accessToken || !invoiceData || !invoiceId || !sheetUrl) {
      console.error("Missing required parameters");
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const sheets = google.sheets({ version: 'v4', auth });

    // Extract spreadsheet ID
    const spreadsheetId = extractSheetIdFromUrl(sheetUrl);
    if (!spreadsheetId) {
      console.error("Invalid sheet URL:", sheetUrl);
      return res.status(400).json({ error: 'Invalid sheet URL' });
    }

    // Get sheet metadata to determine the sheet name
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const firstSheet = spreadsheet.data.sheets?.[0];
    if (!firstSheet) {
      console.error("No sheets found in the document");
      return res.status(404).json({ error: 'No sheets found' });
    }

    const sheetName = firstSheet.properties.title;
    console.log("Working with sheet:", sheetName);

    // Get all data to find the exact row
    const fullResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:M`, // Get all columns
    });

    const rows = fullResponse.data.values || [];
    if (rows.length < 2) { // Header row + at least one data row
      console.error("No invoice data found in sheet");
      return res.status(404).json({ error: 'No invoices found in sheet' });
    }

    // Find the exact row index (skip header row)
    const rowIndex = rows.findIndex((row, index) =>
      index > 0 && row[0] === invoiceId
    );

    if (rowIndex === -1) {
      console.error("Invoice not found in sheet");
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Calculate the actual row number (1-based index)
    const rowNumber = rowIndex + 1;
    console.log(`Updating row ${rowNumber}`);

    // Calculate totals
    const subtotal = calculateSubtotal(invoiceData.items);
    const discountAmount = calculateDiscount(subtotal, invoiceData.discount);
    const taxAmount = calculateTax(subtotal, discountAmount, invoiceData.tax);
    const total = (subtotal - discountAmount + taxAmount).toFixed(2);

    // Prepare updated data with stringified objects
    const updatedRow = [
      invoiceData.id || invoiceId,
      invoiceData.date || new Date().toISOString().split('T')[0],
      invoiceData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      invoiceData.customer?.name || '',
      invoiceData.customer?.email || '',
      invoiceData.customer?.address || '',
      JSON.stringify(invoiceData.items || []),
      total,
      JSON.stringify(invoiceData.tax || { type: 'percentage', value: 0 }),
      JSON.stringify(invoiceData.discount || { type: 'percentage', value: 0 }),
      invoiceData.notes || '',
      invoiceData.template || 'classic',
      invoiceData.status || 'Pending'
    ];

    console.log("Prepared update data:", updatedRow);

    // Update the specific row
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A${rowNumber}:M${rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [updatedRow],
      },
    });

    console.log("Invoice updated successfully");
    return res.json({
      success: true,
      updatedInvoice: {
        ...invoiceData,
        subtotal,
        discountAmount,
        taxAmount,
        total
      }
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return res.status(500).json({
      error: 'Failed to update invoice',
      details: error.message
    });
  }
});



////////////////////////////////////////////////////////////////////
{/*Methods to Hanlde Business Details Logic*/}
////////////////////////////////////////////////////////////////////
// Save business details to Google Sheet 
app.get('/api/business-details', async (req, res) => {
  try {
    // Step 1: Verify Supabase authentication
    const supabaseToken = req.headers['x-supabase-token'];
    if (!supabaseToken) {
      return res.status(401).json({ error: 'Missing Supabase token' });
    }

    // Verify the Supabase user session is valid
    const { data: { user }, error } = await supabase.auth.getUser(supabaseToken);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid Supabase session' });
    }

    // Step 2: Extract and validate Google authentication token
    const googleToken = req.headers['authorization']?.split(' ')[1];
    if (!googleToken) {
      return res.status(401).json({ error: 'Missing Google credentials' });
    }

    // Step 3: Initialize Google OAuth client with the token
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: googleToken });

    // Initialize Google Sheets API client
    const sheets = google.sheets({ version: 'v4', auth });

    // Step 4: Get Google user information to identify the user
    const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${googleToken}` },
    });

    const userId = userInfoResponse.data.sub; // Google's unique user identifier

    // Step 5: Fetch or create the master tracking sheet for this user
    const masterSheet = await getOrCreateMasterSheet(googleToken, userId);

    // Step 6: Read the master tracking sheet to find the business details sheet
    const masterSheetResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: masterSheet.id,
      range: 'My Sheets!A:E', // Assuming columns A-E contain sheet metadata
    });

    const rows = masterSheetResponse.data.values || [];

    // Step 7: Look for a sheet with "Business" or "Details" in its name (case insensitive)
    const businessSheet = rows.find((row) =>
      row[1] && (
        row[1].includes('Business') ||
        row[1].includes('business') ||
        row[1].includes('Details') ||
        row[1].includes('details')
      )
    );

    if (!businessSheet) {
      return res.status(404).json({ error: 'Business details sheet not found' });
    }

    // Log for debugging
    console.log("Found business sheet:", businessSheet);

    // Step 8: Extract the spreadsheet ID from the URL in column E
    const spreadsheetId = extractSheetIdFromUrl(businessSheet[4]);

    if (!spreadsheetId) {
      console.error("Failed to extract spreadsheet ID from URL:", businessSheet[4]);
      return res.status(500).json({ error: 'Invalid spreadsheet URL format' });
    }

    const sheetName = 'Business Info'; // Default sheet name for business details
    const range = 'A2:B'; // Default range for business details (key-value pairs)

    // Step 9: Fetch the business details from the Google Sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!${range}`,
    });

    const dataRows = response.data.values || [];

    // Step 10: Convert rows to a structured object
    const businessDetails = {};
    dataRows.forEach((row) => {
      if (row.length >= 2) {
        businessDetails[row[0]] = row[1]; // Key in column A, value in column B
      }
    });

    // Step 11: Return the business details as JSON
    res.json({ businessDetails });

  } catch (error) {
    // Comprehensive error logging
    console.error('Error fetching business details:', error);
    console.error('Error details:', error.response ? error.response.data : error.message);

    // Return a meaningful error response
    res.status(500).json({
      error: 'Failed to fetch business details',
      details: error.message
    });
  }
});
app.put('/api/update-business-details', async (req, res) => {
  try {
    // Get authentication tokens from headers
    const supabaseToken = req.headers['x-supabase-token'];
    const googleToken = req.headers.authorization?.split(' ')[1];

    if (!supabaseToken || !googleToken) {
      return res.status(401).json({ error: 'Authentication tokens required' });
    }

    // Verify Supabase session
    const { data: { user }, error } = await supabase.auth.getUser(supabaseToken);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid Supabase session' });
    }

    // Get business data from request body
    const businessData = req.body;

    // Initialize Google Sheets API
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: googleToken });
    const sheets = google.sheets({ version: 'v4', auth });

    // Get user's master sheet
    const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${googleToken}` }
    });
    const masterSheet = await getOrCreateMasterSheet(googleToken, userInfo.data.sub);

    // Find business sheet in master
    const masterData = await sheets.spreadsheets.values.get({
      spreadsheetId: masterSheet.id,
      range: 'My Sheets!A:E',
    });

    const businessSheet = masterData.data.values?.find(row => 
      row[1]?.toLowerCase().includes('business')
    );

    if (!businessSheet) {
      return res.status(404).json({ error: 'Business sheet not found' });
    }

    const spreadsheetId = extractSheetIdFromUrl(businessSheet[4]);
    if (!spreadsheetId) {
      return res.status(400).json({ error: 'Invalid sheet URL' });
    }

    // Update business details
    const updateData = [
      ['Company Name', businessData.companyName],
      ['Business Email', businessData.email],
      ['Phone Number', businessData.phone],
      ['Address', businessData.address],
      ['Created At', new Date().toISOString()]
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Business Info!A2:B6',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: updateData
      },
    });

    res.json({ 
      success: true,
      message: 'Business details updated successfully'
    });

  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ 
      error: 'Failed to update business details',
      details: error.message 
    });
  }
});
app.post('/api/check-business-sheet', async (req, res) => {
  try {
    // 1. Validate request format
    if (!req.headers['content-type']?.includes('application/json')) {
      return res.status(415).json({
        hasBusinessSheet: false,
        error: 'Invalid content type - requires JSON'
      });
    }

    // 2. Extract tokens with proper validation
    const supabaseToken = req.headers['x-supabase-token'];
    const { accessToken } = req.body;

    if (!supabaseToken?.startsWith('sbp_')) {
      return res.status(400).json({
        hasBusinessSheet: false,
        error: 'Invalid Supabase token format'
      });
    }

    if (!accessToken?.startsWith('ya29.')) {
      return res.status(400).json({
        hasBusinessSheet: false,
        error: 'Invalid Google token format'
      });
    }

    // 3. Verify Supabase session
    const { data: { user }, error: supabaseError } = await supabase.auth.getUser(supabaseToken);
    if (supabaseError || !user) {
      console.error('Supabase auth failed:', supabaseError?.message || 'No user');
      return res.status(401).json({
        hasBusinessSheet: false,
        error: 'Invalid Supabase session'
      });
    }

    // 4. Verify Google token scopes
    const tokenInfo = await axios.get('https://www.googleapis.com/oauth2/v3/tokeninfo', {
      params: { access_token: accessToken }
    });

    if (!tokenInfo.data.scope?.includes('https://www.googleapis.com/auth/drive')) {
      return res.status(403).json({
        hasBusinessSheet: false,
        error: 'Missing required Google Drive scope'
      });
    }

    // 5. Get user ID with validation
    const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 5000
    });

    if (!userInfo.data.sub) {
      return res.status(400).json({
        hasBusinessSheet: false,
        error: 'Failed to retrieve Google user ID'
      });
    }

    // 6. Master sheet handling with error wrapping
    let masterSheet;
    try {
      masterSheet = await getOrCreateMasterSheet(accessToken, userInfo.data.sub);
    } catch (err) {
      console.error('Master sheet error:', err);
      return res.status(500).json({
        hasBusinessSheet: false,
        error: 'Failed to access master sheet repository'
      });
    }

    // 7. Read sheet data with proper range handling
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: masterSheet.id,
      range: 'My Sheets!A2:E', // Skip header row
      majorDimension: 'ROWS'
    });

    // 8. Validate response structure
    const rows = response.data.values || [];
    if (!Array.isArray(rows)) {
      console.error('Unexpected sheets data format:', response.data);
      return res.status(500).json({
        hasBusinessSheet: false,
        error: 'Invalid master sheet structure'
      });
    }

    // 9. Business sheet detection logic
    const hasBusinessSheet = rows.some(row => {
      try {
        const name = row[1]?.toString().toLowerCase() || '';
        return name.includes('business') || name.includes('details');
      } catch (e) {
        console.warn('Invalid row format:', row);
        return false;
      }
    });

    // 10. Final response
    return res.json({
      hasBusinessSheet,
      masterSheetVersion: masterSheet.created ? 'new' : 'existing',
      detectedSheets: rows.length
    });

  } catch (error) {
    // Unified error handling
    const errorMessage = error.response?.data?.error || error.message;
    console.error('Endpoint failure:', errorMessage);

    return res.status(500).json({
      hasBusinessSheet: false,
      error: 'Business sheet verification failed',
      details: errorMessage
    });
  }
});






////////////////////////////////////////////////////////////////////
{/*Method to Hanlde Getting User Data Logic*/}
////////////////////////////////////////////////////////////////////
// Get user data
app.get('/api/user', async (req, res) => {
  try {
    // Verify authentication tokens
    const supabaseToken = req.headers['x-supabase-token'];
    const googleToken = req.headers.authorization?.split(' ')[1];

    if (!supabaseToken || !googleToken) {
      return res.status(401).json({ error: 'Authentication tokens required' });
    }

    // Verify Supabase session
    const { data: { user }, error } = await supabase.auth.getUser(supabaseToken);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid Supabase session' });
    }

    // Get Google user info
    const googleUser = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${googleToken}` }
    });

    // Return combined user data
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: googleUser.data.name || user.email,
        avatarUrl: googleUser.data.picture || '',
        createdAt: user.created_at,
        lastLogin: user.last_sign_in_at,
        accountType: user.user_metadata?.account_type || "Standard",
        phone: user.phone || ''
      }
    });

  } catch (error) {
    console.error('User endpoint error:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});
// Vaildate User 
app.post('/auth/callback', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Authorization code is required' });
  }

  try {
    // Exchange the code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback',
      grant_type: 'authorization_code',
    });

    const { access_token, refresh_token, id_token } = tokenResponse.data;

    // Fetch user info using the access token
    const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const userData = {
      id: userInfoResponse.data.sub,
      name: userInfoResponse.data.name,
      email: userInfoResponse.data.email,
      picture: userInfoResponse.data.picture,
    };

    // Return tokens and user data to the frontend
    res.json({
      access_token,
      refresh_token,
      user: userData,
    });
  } catch (error) {
    console.error('Error during OAuth callback:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to exchange code for tokens' });
  }
});




// Function to test if the backend if running properly 
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});
// Used to sepcify the port number
const PORT = process.env.PORT || 5000;
// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
