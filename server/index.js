import express from 'express'; // Import express package
import axios from 'axios'; // Import the axios package
import dotenv from 'dotenv'; // Import the dotenv package
import cors from 'cors'; // Import the cors package
import { google } from 'googleapis'; // Import the googleapis package
import nodemailer from 'nodemailer'; // Import nodemailer package

import { createClient } from '@supabase/supabase-js';

dotenv.config(); // Load environment variables
const app = express(); // Create an Express app
const drive = google.drive('v3'); // Initialize Drive API
// CORS configuration for Vercel deployment
app.use(cors({
  origin: [
    'https://sheetbills-client.vercel.app',
    'http://localhost:3000',
    'http://localhost:5000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200
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



async function getOrCreateMasterSheet(accessToken, userId) {
  // Initialize authentication with API key
  const auth = new google.auth.OAuth2({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  });
  auth.setCredentials({ access_token: accessToken });

  // Initialize API clients with authentication
  const drive = google.drive({
    version: 'v3',
    auth,
    params: { key: process.env.GOOGLE_API_KEY }
  });

  const sheetsAPI = google.sheets({
    version: 'v4',
    auth,
    params: { key: process.env.GOOGLE_API_KEY }
  });

  try {
    // 1. Search for existing master sheet with combined credentials
    const driveResponse = await drive.files.list({
      q: "name='Master Tracking Sheet' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
      fields: 'files(id, name, webViewLink)',
      spaces: 'drive',
      auth: auth,
      key: process.env.GOOGLE_API_KEY
    });

    if (driveResponse.data.files.length > 0) {
      return {
        id: driveResponse.data.files[0].id,
        url: driveResponse.data.files[0].webViewLink,
        created: false
      };
    }

    // 2. Create new master sheet with enhanced security
    const createResponse = await sheetsAPI.spreadsheets.create({
      requestBody: {
        properties: {
          title: 'Master Tracking Sheet',
          locale: 'en_US',
          timeZone: 'UTC'
        }
      },
      auth: auth,
      key: process.env.GOOGLE_API_KEY
    });

    const spreadsheetId = createResponse.data.spreadsheetId;
    const spreadsheetUrl = createResponse.data.spreadsheetUrl;

    // 3. Initialize sheet structure with proper authentication
    await sheetsAPI.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          updateSheetProperties: {
            properties: {
              sheetId: 0,
              title: 'My Sheets',
              gridProperties: { 
                rowCount: 1000, 
                columnCount: 5,
                frozenRowCount: 1
              }
            },
            fields: 'title,gridProperties'
          }
        }]
      },
      auth: auth,
      key: process.env.GOOGLE_API_KEY
    });

    // 4. Add headers with validation
    await sheetsAPI.spreadsheets.values.update({
      spreadsheetId,
      range: 'My Sheets!A1:E1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          'Created At', 
          'Sheet Name', 
          'Sheet Type', 
          'Status', 
          'URL'
        ]]
      },
      auth: auth,
      key: process.env.GOOGLE_API_KEY
    });

    // 5. Add basic protection to header row
    await sheetsAPI.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          addProtectedRange: {
            protectedRange: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1
              },
              description: 'Header row protection',
              warningOnly: true
            }
          }
        }]
      },
      auth: auth,
      key: process.env.GOOGLE_API_KEY
    });

    return {
      id: spreadsheetId,
      url: spreadsheetUrl,
      created: true
    };

  } catch (error) {
    console.error('[CREATE] Master sheet error:', error);
    throw new Error(`Master sheet initialization failed: ${error.message}`);
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
    const defaultSheet = response.data.values?.find(row => row[1]?.trim() === 'SheetBills Invoices');

    if (defaultSheet) {
      const sheetId = extractSheetIdFromUrl(defaultSheet[4]);
      if (sheetId) return sheetId;
      console.error('Found default sheet but invalid URL:', defaultSheet[4]);
    }

    // 4. Create new default sheet if none found
    const newSheet = await sheets.spreadsheets.create({
      resource: {
        properties: {
          title: 'SheetBills Invoices',
          locale: 'en_US',
          timeZone: 'America/New_York'
        },
        sheets: [{
          properties: {
            title: 'SheetBills Invoices',
            gridProperties: {
              rowCount: 1000,
              columnCount: 15
            }
          }
        }]
      }
    });

    // Add headers to the new sheet
    const headers = [
      'Invoice ID',        // 0
      'Date',              // 1
      'Due Date',          // 2
      'Customer Name',     // 3
      'Customer Email',    // 4
      'Customer Address',  // 5
      'Items',             // 6
      'Amount',            // 7
      'Tax',               // 8
      'Discount',          // 9
      'Notes',             // 10
      'Template',          // 11
      'Status'             // 12
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: newSheet.data.spreadsheetId,
      range: `'SheetBills Invoices'!A1:M1`,
      valueInputOption: 'RAW',
      resource: { values: [headers] }
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
          'SheetBills Invoices',
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

    const invoicesSheet = sheetsList.find(sheet => sheet.name === "SheetBills Invoices");
    const selectedSpreadsheetUrl = invoicesSheet.sheetUrl;

    res.json({
      sheets: sheetsList,
      totalCount: sheetsList.length,
      masterSheetUrl: masterSheet.webViewLink,
      selectedSpreadsheetUrl
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
  try {
    const { invoiceId } = req.body;
    
    // Get authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header is required' });
    }
    const accessToken = authHeader.split(' ')[1];

    if (!invoiceId) {
      return res.status(400).json({ error: 'Invoice ID is required' });
    }

    // Initialize Google Sheets API
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const sheets = google.sheets({ version: 'v4', auth });

    // Get the default invoices sheet
    const masterSheet = await getOrCreateMasterSheet(accessToken);
    const masterData = await sheets.spreadsheets.values.get({
      spreadsheetId: masterSheet.id,
      range: 'My Sheets!A:F',
    });

    // Find the default invoices sheet
    const defaultSheet = masterData.data.values?.find(row => row[1]?.trim() === 'SheetBills Invoices');
    if (!defaultSheet) {
      return res.status(404).json({ error: 'SheetBills Invoices sheet not found' });
    }

    const defaultSheetUrl = defaultSheet[4];
    const spreadsheetId = extractSheetIdFromUrl(defaultSheetUrl);
    if (!spreadsheetId) {
      return res.status(400).json({ error: 'Invalid default sheet URL format' });
    }

    // Get sheet metadata
    const spreadsheetMetadata = await sheets.spreadsheets.get({ spreadsheetId });
    const firstSheet = spreadsheetMetadata.data.sheets?.[0];
    
    if (!firstSheet) {
      return res.status(404).json({ error: 'No sheets found' });
    }

    const sheetId = firstSheet.properties.sheetId;
    const sheetName = firstSheet.properties.title;

    // Fetch invoice data
    const valuesResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A2:M`,
    });

    const rows = valuesResponse.data.values || [];
    const rowIndex = rows.findIndex((row) => row[0]?.trim() === invoiceId.trim());

    if (rowIndex === -1) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Delete row
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
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
    console.error('Error deleting invoice:', error);
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

    // Authentication validation
    const supabaseToken = req.headers['x-supabase-token'];
    const googleToken = req.headers.authorization?.split(' ')[1];
    if (!googleToken) return res.status(401).json({ error: 'Google authentication token required' });
    if (!supabaseToken) return res.status(401).json({ error: 'Supabase authentication token required' });

    // Initialize Google Sheets API
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: googleToken });
    const sheets = google.sheets({ version: 'v4', auth });

    // Get user info to find their master sheet
    const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${googleToken}` }
    });

    // Get the master sheet
    const masterSheet = await getOrCreateMasterSheet(googleToken, userInfo.data.sub);

    // Get the data from the master sheet to find the default invoices sheet
    const masterData = await sheets.spreadsheets.values.get({
      spreadsheetId: masterSheet.id,
      range: 'My Sheets!A:F',
    });

    // Find the default invoices sheet (marked with TRUE in column F)
    const defaultSheet = masterData.data.values?.find(row => row[1]?.trim() === 'SheetBills Invoices');
    if (!defaultSheet) {
      return res.status(404).json({ error: 'SheetBills Invoices sheet not found' });
    }

    const defaultSheetUrl = defaultSheet[4];
    const spreadsheetId = extractSheetIdFromUrl(defaultSheetUrl);
    if (!spreadsheetId) {
      return res.status(400).json({ error: 'Invalid default sheet URL format' });
    }

    // Get sheet metadata to verify structure
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
      fields: 'sheets(properties(title,gridProperties))'
    });

    // Validate sheet exists and get first sheet name
    if (!spreadsheet.data.sheets || spreadsheet.data.sheets.length === 0) {
      return res.status(400).json({ error: 'No sheets found in document' });
    }
    const sheetName = spreadsheet.data.sheets[0].properties.title;

    // Fetch data with dynamic sheet name
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A2:M`,
    });

    // Process rows with validation
    const rawRows = response.data.values || [];
    const rows = rawRows
      .filter(row => row.length >= 10) // Minimum required columns
      .map(row => row.slice(0, 13)); // Ensure max 13 columns

    console.log(`[Google Sheets] Processing ${rows.length} valid invoice rows`);

    // Invoice processing with enhanced validation
    const invoices = rows.map((row, index) => {
      try {
        // Helper function with type safety
        const parseFinancialField = (value, defaultValue = { type: "percentage", value: 0 }) => {
          try {
            const parsed = typeof value === 'string' ? JSON.parse(value) : value;
            if (!parsed || typeof parsed !== 'object') return defaultValue;
            
            return {
              type: ["percentage", "fixed"].includes(parsed.type) ? parsed.type : "percentage",
              value: Math.max(0, Number(parsed.value)) || 0
            };
          } catch (e) {
            return defaultValue;
          }
        };

        // Parse customer
        let customer = row[3];
        try {
          if (typeof customer === 'string' && customer.startsWith('{')) {
            customer = JSON.parse(customer);
          } else {
            customer = {
              name: row[3]?.toString() || '',
              email: row[4]?.toString() || '',
              address: row[5]?.toString() || ''
            };
          }
        } catch {
          customer = {
            name: row[3]?.toString() || '',
            email: row[4]?.toString() || '',
            address: row[5]?.toString() || ''
          };
        }

        // Parse items
        let items = [];
        try {
          items = row[6] ? JSON.parse(row[6]) : [];
          if (!Array.isArray(items)) items = [];
        } catch {
          items = [];
        }

        // Financial calculations
        const tax = parseFinancialField(row[8]);
        const discount = parseFinancialField(row[9], { type: "fixed", value: 0 });
        
        // Calculate totals using helper functions
        const subtotal = calculateSubtotal(items);
        const discountAmount = calculateDiscount(subtotal, discount);
        const taxAmount = calculateTax(subtotal, discountAmount, tax);
        const amount = (subtotal - discountAmount + taxAmount).toFixed(2);

        return {
          id: row[0]?.toString() || `temp-${index}`,
          invoiceNumber: row[0]?.toString() || '',
          date: row[1] || new Date().toISOString().split('T')[0],
          dueDate: row[2] || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          customer,
          items: items.filter(item => item?.name && !isNaN(item.price)),
          amount: parseFloat(amount),
          tax,
          discount,
          notes: row[10]?.toString() || '',
          template: ['classic', 'modern'].includes(row[11]) ? row[11] : 'classic',
          status: ['Pending', 'Paid', 'Overdue'].includes(row[12]) ? row[12] : 'Pending'
        };
      } catch (error) {
        console.error(`Error processing row ${index + 1}:`, error);
        return null;
      }
    }).filter(invoice => invoice !== null);

    console.log(`[API] Successfully processed ${invoices.length} invoices`);
    res.json(invoices);

  } catch (error) {
    const errorDetails = {
      message: error.message,
      code: error.code,
      suggestion: error.response?.status === 403 
        ? 'Verify Google Sheets sharing permissions' 
        : 'Check sheet structure and URL'
    };

    console.error('[API Error] Sheet data fetch failed:', errorDetails);
    res.status(error.response?.status || 500).json({
      error: 'Invoice data fetch failed',
      ...errorDetails
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
    const saveSubtotal = calculateSubtotal(invoiceData.items);
    const saveDiscountAmount = calculateDiscount(saveSubtotal, invoiceData.discount);
    const saveTaxAmount = calculateTax(saveSubtotal, saveDiscountAmount, invoiceData.tax);
    const saveTotal = (saveSubtotal - saveDiscountAmount + saveTaxAmount).toFixed(2);

    // Get spreadsheet ID
    const spreadsheetId = sheetUrl
      ? extractSheetIdFromUrl(sheetUrl)
      : (await getDefaultSheetId(accessToken));

    if (!spreadsheetId) {
      return res.status(500).json({ error: 'Failed to resolve sheet ID' });
    }

    // Get sheet metadata to determine the sheet name
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const invoiceSheet = spreadsheet.data.sheets.find(
      s => s.properties.title === "SheetBills Invoices"
    );
    if (!invoiceSheet) {
      console.error("SheetBills Invoices tab not found in spreadsheet");
      return res.status(404).json({ error: 'SheetBills Invoices tab not found' });
    }
    const sheetName = invoiceSheet.properties.title;
    console.log("Using sheet name:", sheetName);

    // Fetch all invoice numbers
    const existingRows = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A2:A`,
    });
    const existingIds = (existingRows.data.values || []).map(row => row[0]?.trim());
    if (existingIds.includes(invoiceData.invoiceNumber.trim())) {
      return res.status(400).json({ error: 'Invoice number already exists. Use update instead.' });
    }

    // Prepare data for Google Sheets
    const values = [
      [
        invoiceData.invoiceNumber,
        invoiceData.date,
        invoiceData.dueDate,
        invoiceData.customer.name,
        invoiceData.customer.email,
        invoiceData.customer.address,
        JSON.stringify(invoiceData.items),
        saveTotal,
        JSON.stringify(invoiceData.tax),
        JSON.stringify(invoiceData.discount),
        invoiceData.notes,
        invoiceData.template || 'classic',
        invoiceData.status || 'Pending'
      ]
    ];

    // Append the new invoice to the sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:M`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: { values }
    });

    res.json({
      success: true,
      invoiceData: {
        ...invoiceData,
        subtotal: saveSubtotal,
        discountAmount: saveDiscountAmount,
        taxAmount: saveTaxAmount,
        total: saveTotal
      }
    });
  } catch (error) {
    console.error('Error saving invoice:', error);
    return res.status(500).json({
      error: 'Failed to save invoice',
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
    console.log('[Business Details] Starting request processing');
    
    // Step 1: Verify Supabase authentication
    const supabaseToken = req.headers['x-supabase-token'];
    if (!supabaseToken) {
      console.log('[Business Details] Missing Supabase token');
      return res.status(401).json({ error: 'Missing Supabase token' });
    }

    // Verify the Supabase user session is valid
    const { data: { user }, error } = await supabase.auth.getUser(supabaseToken);
    if (error || !user) {
      console.log('[Business Details] Invalid Supabase session:', error?.message);
      return res.status(401).json({ error: 'Invalid Supabase session' });
    }

    // Step 2: Extract and validate Google authentication token
    const googleToken = req.headers['authorization']?.split(' ')[1];
    if (!googleToken) {
      console.log('[Business Details] Missing Google token');
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

    const userId = userInfoResponse.data.sub;
    console.log('[Business Details] User ID:', userId);

    // Step 5: Fetch or create the master tracking sheet for this user
    const masterSheet = await getOrCreateMasterSheet(googleToken, userId);
    console.log('[Business Details] Master sheet ID:', masterSheet.id);

    // Step 6: Read the master tracking sheet to find the business details sheet
    const masterSheetResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: masterSheet.id,
      range: 'My Sheets!A:E',
    });

    const rows = masterSheetResponse.data.values || [];
    console.log('[Business Details] Master sheet rows:', rows);

    // Step 7: Look specifically for "Business Details" sheet
    const businessSheet = rows.find(row => row[1]?.trim() === 'Business Details');
    console.log('[Business Details] Found business sheet:', businessSheet);

    if (!businessSheet) {
      console.log('[Business Details] Business details sheet not found in master sheet');
      return res.status(404).json({ error: 'Business details sheet not found' });
    }

    // Step 8: Extract the spreadsheet ID from the URL in column E
    const spreadsheetId = extractSheetIdFromUrl(businessSheet[4]);
    console.log('[Business Details] Extracted spreadsheet ID:', spreadsheetId);

    if (!spreadsheetId) {
      console.error('[Business Details] Failed to extract spreadsheet ID from URL:', businessSheet[4]);
      return res.status(500).json({ error: 'Invalid spreadsheet URL format' });
    }

    // Step 9: Fetch the business details from the Google Sheet
    console.log('[Business Details] Fetching business details from sheet');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Business Info!A2:B6',
    });

    const dataRows = response.data.values || [];
    console.log('[Business Details] Raw business details data:', dataRows);

    // Step 10: Convert rows to a structured object with proper field names
    const businessDetails = {};
    dataRows.forEach((row) => {
      if (row.length >= 2) {
        const key = row[0]?.trim();
        const value = row[1]?.trim();
        console.log(`[Business Details] Processing field: "${key}" = "${value}"`);
        
        // Handle variations in field names
        if (key.toLowerCase().includes('company') || key.toLowerCase().includes('name')) {
          businessDetails['Company Name'] = value;
        } else if (key.toLowerCase().includes('email') || key.toLowerCase().includes('business email')) {
          businessDetails['Business Email'] = value;
          console.log('[Business Details] Found email field:', value);
        } else if (key.toLowerCase().includes('phone') || key.toLowerCase().includes('number')) {
          businessDetails['Phone Number'] = value;
          console.log('[Business Details] Found phone field:', value);
        } else if (key.toLowerCase().includes('address 1') || key.toLowerCase().includes('address line 1')) {
          businessDetails['Address Line 1'] = value;
        } else if (key.toLowerCase().includes('address 2') || key.toLowerCase().includes('address line 2')) {
          businessDetails['Address Line 2'] = value;
        }
      }
    });

    console.log('[Business Details] Final business details object:', businessDetails);
    console.log('[Business Details] Email field exists:', 'Business Email' in businessDetails);
    console.log('[Business Details] Phone field exists:', 'Phone Number' in businessDetails);

    // Step 11: Return the business details as JSON
    const responseData = { 
      businessDetails,
      sheetConnection: {
        connected: true,
        sheetName: 'Business Details',
        sheetId: spreadsheetId,
        lastSynced: new Date().toISOString()
      }
    };
    
    console.log('[Business Details] Sending response:', responseData);
    res.json(responseData);

  } catch (error) {
    // Comprehensive error logging
    console.error('[Business Details] Error:', error);
    console.error('[Business Details] Error details:', error.response ? error.response.data : error.message);
    console.error('[Business Details] Error stack:', error.stack);

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
      ['Address Line 1', businessData.addressLine1],
      ['Address Line 2', businessData.addressLine2 || '']
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


app.post('/api/create-business-sheet', async (req, res) => {
  console.log('[CREATE] Initiating business sheet creation request');
  
  try {
    // 1. Validate request format
    console.log('[CREATE] Validating request headers');
    if (!req.headers['content-type']?.includes('application/json')) {
      console.warn('[CREATE] Rejected - Invalid content type:', req.headers['content-type']);
      return res.status(415).json({
        success: false,
        error: 'Invalid content type - requires JSON'
      });
    }

    // 2. Validate tokens
    console.log('[CREATE] Validating token formats');
    const supabaseToken = req.headers['x-supabase-token'];
    const { accessToken, businessData } = req.body;

    if (!supabaseToken?.startsWith('eyJ')) {
      console.warn('[CREATE] Invalid Supabase token format');
      return res.status(400).json({
        success: false,
        error: 'Invalid Supabase token format'
      });
    }

    if (!accessToken?.startsWith('ya29.')) {
      console.warn('[CREATE] Invalid Google token format');
      return res.status(400).json({
        success: false,
        error: 'Invalid Google token format'
      });
    }

    // 3. Verify Supabase session
    console.log('[CREATE] Verifying Supabase session');
    const { data: { user }, error: supabaseError } = await supabase.auth.getUser(supabaseToken);
    if (supabaseError || !user) {
      console.error('[CREATE] Supabase auth failed:', supabaseError?.message);
      return res.status(401).json({
        success: false,
        error: 'Invalid Supabase session'
      });
    }
    console.log(`[CREATE] Verified user: ${user.email}`);

    // 4. Verify Google scopes
    console.log('[CREATE] Checking Google scopes');
    const tokenInfo = await axios.get('https://www.googleapis.com/oauth2/v3/tokeninfo', {
      params: { access_token: accessToken }
    });
    
    const requiredScopes = [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/spreadsheets'
    ];
    
    if (!requiredScopes.every(scope => tokenInfo.data.scope?.includes(scope))) {
      console.warn('[CREATE] Missing required scopes:', tokenInfo.data.scope);
      return res.status(403).json({
        success: false,
        error: 'Missing required Google Drive & Sheets permissions'
      });
    }

    // 5. Get Google user ID
    console.log('[CREATE] Getting Google user info');
    const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 5000
    });

    if (!userInfo.data.sub) {
      console.error('[CREATE] Missing Google user ID');
      return res.status(400).json({
        success: false,
        error: 'Failed to retrieve Google user ID'
      });
    }

    // 6. Validate business data
    console.log('[CREATE] Validating business data');
    if (!businessData?.companyName || !businessData?.email) {
      console.error('[CREATE] Missing required business data');
      return res.status(400).json({
        success: false,
        error: 'Missing required business details (companyName and email are required)'
      });
    }

    // 7. Get master sheet reference
    console.log('[CREATE] Getting master sheet reference');
    let masterSheet;
    try {
      masterSheet = await getOrCreateMasterSheet(accessToken, userInfo.data.sub);
      console.log(`[CREATE] Master sheet: ${masterSheet.id} (${masterSheet.created ? 'new' : 'existing'})`);
    } catch (err) {
      console.error('[CREATE] Master sheet error:', err.message);
      return res.status(500).json({
        success: false,
        error: 'Master sheet initialization failed'
      });
    }

    // 8. Create business sheet
    console.log('[CREATE] Creating business sheet');
    try {
      const businessSheet = await createBusinessSheet(accessToken, businessData);
      
      // 9. Update master sheet
      console.log('[CREATE] Updating master registry');
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: accessToken });
      const sheetsAPI = google.sheets({ version: 'v4', auth });
      
      await sheetsAPI.spreadsheets.values.append({
        spreadsheetId: masterSheet.id,
        range: 'My Sheets!A:E',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[
            new Date().toISOString(),
            'Business Details',
            'Primary',
            'Active',
            businessSheet.spreadsheetUrl
          ]]
        }
      });

      return res.json({
        success: true,
        businessSheetId: businessSheet.spreadsheetId,
        spreadsheetUrl: businessSheet.spreadsheetUrl,
        masterSheetUpdated: true
      });

    } catch (createError) {
      console.error('[CREATE] Sheet creation failed:', createError.message);
      return res.status(500).json({
        success: false,
        error: 'Business sheet creation failed',
        details: createError.message
      });
    }

  } catch (error) {
    console.error('[CREATE] Endpoint failure:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Business sheet creation failed',
      details: error.message
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

app.post('/api/check-business-sheet', async (req, res) => {
  try {
    // 1. Validate request format
    if (!req.headers['content-type']?.includes('application/json')) {
      return res.status(415).json({ 
        success: false,
        error: 'Invalid content type - requires JSON' 
      });
    }

    // 2. Extract tokens from request
    const supabaseToken = req.headers['x-supabase-token'];
    const { accessToken, createIfMissing = false } = req.body;

    // 3. Validate token formats
    if (!supabaseToken?.startsWith('eyJ') || !accessToken?.startsWith('ya29.')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token format'
      });
    }

    // 4. Verify Supabase session
    const { data: { user }, error: supabaseError } = await supabase.auth.getUser(supabaseToken);
    if (supabaseError || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Supabase session'
      });
    }

    // 5. Verify Google access token
    const tokenInfo = await axios.get('https://www.googleapis.com/oauth2/v3/tokeninfo', {
      params: { access_token: accessToken }
    });

    if (!tokenInfo.data.sub) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Google access token'
      });
    }

    // 6. Get master sheet reference
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    
    const masterSheet = await getOrCreateMasterSheet(accessToken, tokenInfo.data.sub);

    // 7. Check for business sheet entries
    const sheetsAPI = google.sheets({ version: 'v4', auth });
    const response = await sheetsAPI.spreadsheets.values.get({
      spreadsheetId: masterSheet.id,
      range: 'My Sheets!B:B', // Check Sheet Name column
    });

    const hasBusinessSheet = (response.data.values || [])
      .some(row => row[0] === 'Business Details');

    // 8. Return appropriate response
    res.json({
      success: true,
      hasBusinessSheet,
      masterSheetUrl: masterSheet.url
    });

  } catch (error) {
    console.error('[CHECK] Business sheet check failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Business sheet check failed'
    });
  }
});





// Function to test if the backend if running properly 
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running!' });
});
// Used to specify the port number
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error('Error starting server:', err);
    return;
  }
  console.log(`Server running on port ${PORT}`);
});

// update invoice in Google Sheets
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
    const invoiceSheet = spreadsheet.data.sheets.find(
      s => s.properties.title === "SheetBills Invoices"
    );
    if (!invoiceSheet) {
      console.error("SheetBills Invoices tab not found in spreadsheet");
      return res.status(404).json({ error: 'SheetBills Invoices tab not found' });
    }
    const sheetName = invoiceSheet.properties.title;
    console.log("Using sheet name:", sheetName);

    // Get all data to find the exact row
    const fullResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:M`, // Get all columns
    });

    const rows = fullResponse.data.values || [];
    console.log(`Found ${rows.length} rows in sheet`);
    
    if (rows.length < 2) { // Header row + at least one data row
      console.error("No invoice data found in sheet");
      return res.status(404).json({ error: 'No invoices found in sheet' });
    }

    // Find the exact row index (skip header row)
    const rowIndex = rows.findIndex((row) => row[0]?.trim() === invoiceId.trim());

    if (rowIndex === -1) {
      console.error(`Invoice ${invoiceId} not found in sheet. Available IDs:`, 
        rows.slice(1).map(row => row[0]).join(', '));
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Calculate totals
    const invoiceSubtotal = calculateSubtotal(invoiceData.items);
    const invoiceDiscountAmount = calculateDiscount(invoiceSubtotal, invoiceData.discount);
    const invoiceTaxAmount = calculateTax(invoiceSubtotal, invoiceDiscountAmount, invoiceData.tax);
    const invoiceTotal = (invoiceSubtotal - invoiceDiscountAmount + invoiceTaxAmount).toFixed(2);

    // Prepare updated data with stringified objects
    const updatedRow = [
      invoiceId, // Use the original invoice ID
      invoiceData.date,
      invoiceData.dueDate,
      invoiceData.customer.name,
      invoiceData.customer.email,
      invoiceData.customer.address,
      JSON.stringify(invoiceData.items),
      invoiceTotal,
      JSON.stringify(invoiceData.tax),
      JSON.stringify(invoiceData.discount),
      invoiceData.notes,
      invoiceData.template || 'classic',
      invoiceData.status || 'Pending'
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
      invoiceData: {
        ...invoiceData,
        subtotal: invoiceSubtotal,
        discountAmount: invoiceDiscountAmount,
        taxAmount: invoiceTaxAmount,
        total: invoiceTotal
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

    // Get sheet metadata to determine the sheet name
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
    const invoiceSheet = spreadsheet.data.sheets.find(
      s => s.properties.title === "SheetBills Invoices"
    );
    if (!invoiceSheet) {
      console.error("SheetBills Invoices tab not found in spreadsheet");
      return res.status(404).json({ error: 'SheetBills Invoices tab not found' });
    }
    const sheetName = invoiceSheet.properties.title;
    console.log("Using sheet name:", sheetName);

    // Fetch data from sheet
    console.log('Fetching sheet data...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!A2:M`,
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
    const updateRange = `${sheetName}!M${rowIndex + 2}`;
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

// Add this near the other route handlers
app.post("/api/contact", async (req, res) => {
  try {
    const { email, subject, message, userName } = req.body

    // Validate required fields
    if (!email || !subject || !message) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL, // Your email address
      subject: `[SheetBills Support] ${subject}`,
      html: `
        <h2>New Support Request</h2>
        <p><strong>From:</strong> ${userName || email}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    }

    // Send email
    await transporter.sendMail(mailOptions)

    res.json({ success: true, message: "Email sent successfully" })
  } catch (error) {
    console.error("Contact form error:", error)
    res.status(500).json({ error: "Failed to send email" })
  }
})

app.get('/', (req, res) => {
  res.send('SheetBills API is running! Visit /health for status.');
});
