// ==========================
// Imports and Configuration
// ==========================
import express from 'express'; // Express web framework
import axios from 'axios'; // HTTP client for API calls
import dotenv from 'dotenv'; // Loads environment variables from .env
import cors from 'cors'; // Cross-Origin Resource Sharing middleware
import { google } from 'googleapis'; // Google APIs client
import { createClient } from '@supabase/supabase-js'; // Supabase client
import { Resend } from 'resend';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

dotenv.config(); // Load environment variables
const app = express(); // Create Express app
const drive = google.drive('v3'); // Google Drive API

const resend = new Resend(process.env.RESEND_API_KEY);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = uuidv4()
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      return cb(new Error('Only image files are allowed!'), false)
    }
    cb(null, true)
  }
})

// ==========================
// Middleware
// ==========================
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['X-CSRF-Token', 'X-Requested-With', 'Accept', 'Accept-Version', 'Content-Length', 'Content-MD5', 'Content-Type', 'Date', 'X-Api-Version', 'Authorization', 'x-supabase-token'],
  credentials: true,
  maxAge: 86400
}));

app.use(express.json()); // Parse JSON request bodies
// ==========================
// Supabase Client
// ==========================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
// ==========================
// Helper Functions
// ==========================
/**
 * Extracts the Google Sheet ID from a full URL.
 * @param {string} url - The Google Sheet URL.
 * @returns {string|null} The extracted Sheet ID or null if not found.
 */
function extractSheetIdFromUrl(url) {
  if (!url) {
    console.error("Sheet URL is undefined");
    return null;
  }
  try {
    const match = url.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  } catch (error) {
    console.error("Error extracting sheet ID:", error);
    return null;
  }
}
/**
 * Gets or creates the master tracking sheet for a user.
 * @param {string} accessToken - Google OAuth access token.
 * @param {string} userId - Google user ID.
 * @returns {Promise<{id: string, url: string, created: boolean}>}
 */
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
    // 1. Search for existing master sheet
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
    // 2. Create new master sheet
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
    // 3. Initialize sheet structure
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
    // 4. Add headers
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
    // Improved logging: log the full error object, not just message
    console.error('[CREATE] Master sheet error (full object):', error);
    // Also log error.message for quick reference
    console.error('[CREATE] Master sheet error (message):', error.message);
    // Throw with full error message for upstream handling
    throw new Error(`Master sheet initialization failed: ${error.message}`);
  }
}
// Helper function to get or create default sheet
async function getDefaultSheetId(accessToken) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const sheets = google.sheets({ version: 'v4', auth });
  const drive = google.drive({ version: 'v3', auth });

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

    // Add service account as editor
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    if (serviceAccountEmail) {
      await drive.permissions.create({
        fileId: newSheet.data.spreadsheetId,
        requestBody: {
          role: 'writer',
          type: 'user',
          emailAddress: serviceAccountEmail
        },
        sendNotificationEmail: false
      });
    } else {
      console.warn('Service account email not configured. Sheet sharing not automated.');
    }

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
      range: 'My Sheets!A:E',
      valueInputOption: 'RAW',
      resource: {
        values: [[
          new Date().toISOString(), // Created At
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

// ==========================
// Calculation Utilities
// ==========================
/**
 * Calculates the subtotal for invoice items.
 * @param {Array} items - Array of invoice items.
 * @returns {number} The subtotal amount.
 */
function calculateSubtotal(items) {
  return items.reduce((total, item) => {
    const price = item.price === "" ? 0 : Number(item.price);
    return total + item.quantity * price;
  }, 0);
}
/**
 * Calculates the total discount for invoice items.
 * @param {Array} items - Array of invoice items.
 * @returns {number} The total discount amount.
 */
function calculateDiscount(items) {
  return items.reduce((total, item) => {
    const price = item.price === "" ? 0 : Number(item.price);
    const itemTotal = item.quantity * price;
    if (!item.discount?.value && item.discount?.value !== 0) {
      return total;
    }
    if (item.discount.type === "percentage") {
      return total + (itemTotal * Number(item.discount.value)) / 100;
    } else {
      return total + Math.min(itemTotal, Number(item.discount.value));
    }
  }, 0);
}
/**
 * Calculates the total tax for invoice items.
 * @param {Array} items - Array of invoice items.
 * @returns {number} The total tax amount.
 */
function calculateTax(items) {
  return items.reduce((total, item) => {
    const price = item.price === "" ? 0 : Number(item.price);
    const itemTotal = item.quantity * price;
    // Calculate item discount first
    let itemDiscount = 0;
    if (item.discount?.value && item.discount?.value !== "") {
      if (item.discount.type === "percentage") {
        itemDiscount = (itemTotal * Number(item.discount.value)) / 100;
      } else {
        itemDiscount = Math.min(itemTotal, Number(item.discount.value));
      }
    }
    const afterDiscount = itemTotal - itemDiscount;
    if (!item.tax?.value && item.tax?.value !== 0) {
      return total;
    }
    if (item.tax.type === "percentage") {
      return total + (afterDiscount * Number(item.tax.value)) / 100;
    } else {
      return total + Number(item.tax.value);
    }
  }, 0);
}

// ==========================
// Google Sheet Operations Endpoints
// ==========================

/**
 * Creates a new Google Sheet for invoices and adds it to the master sheet.
 * @route POST /api/create-sheet
 * @access Protected (Supabase + Google Auth)
 */
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
    // --- Add sharing permissions so anyone with the link can view ---
    const drive = google.drive({ version: 'v3', auth });
    try {
      await drive.permissions.create({
        fileId: newSheetId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
      console.log('Sharing permission set for sheet:', newSheetId);
    } catch (err) {
      console.error('Failed to set sharing permission:', err);
    }
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
        },
        // Add a new 'Business Details' tab to the spreadsheet
        {
          addSheet: {
            properties: {
              title: 'Business Details',
              gridProperties: { rowCount: 100, columnCount: 3 }
            }
          }
        }
        ]
      }
    });
    // Initialize the 'Business Details' tab with headers and default rows
    await sheets.spreadsheets.values.update({
      spreadsheetId: newSheetId,
      range: 'Business Details!A1:C1',
      valueInputOption: 'RAW',
      resource: { values: [['Field', 'Value', 'Last Updated']] }
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId: newSheetId,
      range: 'Business Details!A2:C6',
      valueInputOption: 'RAW',
      resource: {
        values: [
          ['Company Name', '', new Date().toISOString()],
          ['Business Email', '', new Date().toISOString()],
          ['Phone Number', '', new Date().toISOString()],
          ['Address', '', new Date().toISOString()],
          ['Created At', new Date().toISOString(), new Date().toISOString()]
        ]
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
          new Date().toISOString(), // Created At
          name,                     // Sheet Name
          'Business',               // Sheet Type
          'Active',                 // Status
          newSheetUrl              // URL
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
// Add this to your server/index.js
app.get('/api/invoices/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { sheetUrl } = req.query;

    // Validate input
    if (!invoiceId || !sheetUrl) {
      return res.status(400).json({ error: 'Missing invoiceId or sheetUrl' });
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
    const invoiceSheet = spreadsheet.data.sheets.find(
      s => s.properties.title === "SheetBills Invoices"
    );
    if (!invoiceSheet) {
      return res.status(404).json({ error: 'SheetBills Invoices tab not found' });
    }
    const sheetName = invoiceSheet.properties.title;

    // Fetch all invoice rows
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A2:M`,
    });

    const rows = response.data.values || [];
    const row = rows.find(r => r[0] === invoiceId);
    if (!row) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Parse items, tax, discount, customer
    let items = [];
    let tax = { type: 'percentage', value: 0 };
    let discount = { type: 'percentage', value: 0 };
    try { items = JSON.parse(row[6] || '[]'); } catch {}
    try { tax = JSON.parse(row[8] || '{"type":"percentage","value":0}'); } catch {}
    try { discount = JSON.parse(row[9] || '{"type":"percentage","value":0}'); } catch {}

    // Build invoice object
    const invoice = {
      id: row[0],
      invoiceNumber: row[0],
      date: row[1],
      dueDate: row[2],
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

    res.json({ invoice });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice', details: error.message });
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
        const discountAmount = calculateDiscount(items);
        const taxAmount = calculateTax(items);
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
    const saveDiscountAmount = calculateDiscount(invoiceData.items);
    const saveTaxAmount = calculateTax(invoiceData.items);
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
    // Verify Supabase authentication
    const supabaseToken = req.headers['x-supabase-token'];
    if (!supabaseToken) {
      return res.status(401).json({ error: 'Missing Supabase token' });
    }
    // Verify the Supabase user session is valid
    const { data: { user }, error } = await supabase.auth.getUser(supabaseToken);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid Supabase session' });
    }
    // Extract and validate Google authentication token
    const googleToken = req.headers.authorization?.split(' ')[1];
    if (!googleToken) {
      return res.status(401).json({ error: 'Missing Google credentials' });
    }
    // Get the invoice spreadsheet URL from query params
    const sheetUrl = req.query.sheetUrl;
    if (!sheetUrl) {
      return res.status(400).json({ error: 'Missing sheetUrl parameter' });
    }
    // Extract spreadsheetId from the URL
    const spreadsheetId = extractSheetIdFromUrl(sheetUrl);
    if (!spreadsheetId) {
      return res.status(400).json({ error: 'Invalid sheetUrl format' });
    }
    // Initialize Google Sheets API
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: googleToken });
    const sheets = google.sheets({ version: 'v4', auth });
    // Get business details from the 'Business Details' tab in the invoice spreadsheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Business Details!A2:C6',
    });
    const rows = response.data.values || [];
    const businessDetails = {};
    rows.forEach(row => {
      if (row[0] && row[1]) {
        businessDetails[row[0]] = row[1];
      }
    });
    res.json({ 
      businessDetails,
      sheetConnection: {
        connected: true,
        sheetName: 'Business Details',
        sheetId: spreadsheetId,
        lastSynced: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Business details fetch error:', error);
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
    // Get the invoice spreadsheet URL from request body
    const sheetUrl = req.body.sheetUrl;
    if (!sheetUrl) {
      return res.status(400).json({ error: 'Missing sheetUrl parameter' });
    }
    // Extract spreadsheetId from the URL
    const spreadsheetId = extractSheetIdFromUrl(sheetUrl);
    if (!spreadsheetId) {
      return res.status(400).json({ error: 'Invalid sheetUrl format' });
    }
    // Initialize Google Sheets API
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: googleToken });
    const sheets = google.sheets({ version: 'v4', auth });
    // Update business details in the 'Business Details' tab in the invoice spreadsheet
    const now = new Date().toISOString();
    const updateData = [
      ['Company Name', businessData.companyName, now],
      ['Business Email', businessData.email, now],
      ['Phone Number', businessData.phone, now],
      ['Address', businessData.address, now],
      ['Created At', now, now]
    ];
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Business Details!A2:C6',
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
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running!' });
});
// Used to specify the port number
const PORT = process.env.PORT || 5000;
// Add this before the app.listen call
app.get('/api/test-service-account', async (req, res) => {
  try {
    // Initialize Google Sheets API with service account
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    // Test the authentication
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Get the service account email
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    
    res.json({
      success: true,
      message: 'Service account configuration is valid',
      serviceAccountEmail,
      status: 'Service account is properly configured'
    });
  } catch (error) {
    console.error('Service account test error:', error);
    res.status(500).json({
      success: false,
      error: 'Service account configuration error',
      details: error.message
    });
  }
});
// Start the server
app.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error('Error starting server:', err);
    return;
  }
  console.log(`Server running on port ${PORT}`);
});
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
    const invoiceDiscountAmount = calculateDiscount(invoiceData.items);
    const invoiceTaxAmount = calculateTax(invoiceData.items);
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
    const tabNames = spreadsheet.data.sheets.map(s => s.properties.title);
    console.log('Available tab names:', tabNames);
    const invoiceSheet = spreadsheet.data.sheets.find(
      s => s.properties.title === "SheetBills Invoices"
    );
    if (!invoiceSheet) {
      console.error("SheetBills Invoices tab not found in spreadsheet. Tabs found:", tabNames);
      return res.status(404).json({ error: 'SheetBills Invoices tab not found', tabs: tabNames });
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
    const invoiceIds = rows.map(row => row[0]);
    console.log(`Found ${rows.length} rows. Invoice IDs:`, invoiceIds);

    // Find invoice row
    const rowIndex = rows.findIndex(row => row[0] === invoiceId);
    console.log('Found row index:', rowIndex);
    
    if (rowIndex === -1) {
      console.error('[ERROR] Invoice not found in sheet. Invoice IDs present:', invoiceIds);
      return res.status(404).json({ error: 'Invoice not found', invoiceIds });
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
    console.error('[ERROR] mark-as-paid failed:', error);
    res.status(500).json({ 
      error: 'Operation failed',
      details: error.message,
      stack: error.stack,
      googleError: error.response?.data || null
    });
  }
});
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
app.post("/api/contact", async (req, res) => {
  try {
    const { email, subject, message, userName } = req.body;

    // Validate required fields
    if (!email || !subject || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Log the request
    console.log("Attempting to send email to:", email);
    console.log("Subject:", subject);

    // Verify Resend API key
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set in environment variables");
      return res.status(500).json({ error: "Email service configuration error" });
    }

    // Send email using Resend
    try {
      const { data, error } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: `[SheetBills Support] ${subject}`,
        html: `
          <h2>New Support Request</h2>
          <p><strong>From:</strong> ${userName || email}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <h3>Message:</h3>
          <p>${message.replace(/\n/g, "<br>")}</p>
        `,
      });

      if (error) {
        console.error("Resend API error:", error);
      return res.status(500).json({
          error: "Failed to send email", 
          details: error.message,
          code: error.code 
        });
      }

      console.log("Email sent successfully:", data);
      res.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
      console.error("Resend API error (full):", error);
    res.status(500).json({
        error: "Failed to send email", 
        details: error.message,
        code: error.code,
        stack: error.stack
      });
    }
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({
      error: "Failed to process request",
      details: error.message
    });
  }
});
app.get('/', (req, res) => {
  res.send('SheetBills API is running! Visit /health for status.');
});
app.delete('/api/sheets/bulk-delete', async (req, res) => {
  try {
    const { invoiceIds, sheetUrl } = req.body;

    // Validate input
    if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0 || !sheetUrl) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate tokens
    const supabaseToken = req.headers['x-supabase-token'];
    if (!supabaseToken) return res.status(401).json({ error: 'Supabase authentication required' });
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Google authentication required' });
    const googleToken = authHeader.split(' ')[1];

    // Extract spreadsheet ID
    const spreadsheetId = extractSheetIdFromUrl(sheetUrl);
    if (!spreadsheetId) return res.status(400).json({ error: 'Invalid sheet URL' });

    // Initialize Google Sheets API
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: googleToken });
    const sheets = google.sheets({ version: 'v4', auth });

    // Get sheet metadata
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const firstSheet = spreadsheet.data.sheets?.[0];
    if (!firstSheet) return res.status(404).json({ error: 'No sheets found' });
    const sheetId = firstSheet.properties.sheetId;
    const sheetName = firstSheet.properties.title;

    // Fetch invoice data
    const valuesResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A2:M`,
    });
    const rows = valuesResponse.data.values || [];

    // Find the rows to delete (in reverse order to avoid index shifting)
    const rowsToDelete = rows
      .map((row, index) => ({ row, index }))
      .filter(({ row }) => invoiceIds.includes(row[0]))
      .sort((a, b) => b.index - a.index);

    // Delete rows in reverse order
    for (const { index } of rowsToDelete) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId,
                  dimension: 'ROWS',
                  startIndex: index + 1, // +1 because A2:M skips header
                  endIndex: index + 2,
                },
              },
            },
          ],
        },
      });
    }

    res.json({
      success: true,
      message: `${rowsToDelete.length} invoice(s) deleted successfully`,
    });
  } catch (error) {
    console.error('Error deleting invoices:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to delete invoices',
    });
  }
});
/**
 * Generate a shareable link for an invoice.
 * @route POST /api/invoices/shared/create-link
 * @access Protected (Supabase + Google Auth)
 */
app.post('/api/invoices/shared/create-link', async (req, res) => {
  try {
    // 1. Validate tokens
    const supabaseToken = req.headers['x-supabase-token'];
    const authHeader = req.headers.authorization;
    if (!supabaseToken) return res.status(401).json({ error: 'Supabase authentication required' });
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Google authentication required' });
    const googleToken = authHeader.split(' ')[1];

    // 2. Validate body
    const { invoiceId, sheetUrl } = req.body;
    if (!invoiceId || !sheetUrl) {
      return res.status(400).json({ error: 'Invoice ID and sheetUrl are required' });
    }

    // 3. Generate a shareable link with sheetUrl as a query parameter
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24; // 24 hours from now
    const shareToken = Buffer.from(`${invoiceId}:${expiresAt}`).toString('base64');
    const shareUrl = `https://sheetbills-client.vercel.app/invoice/shared/${shareToken}?sheetUrl=${encodeURIComponent(sheetUrl)}`;

    // 4. Return the link and expiration
    res.json({ shareUrl, expiresAt });
  } catch (error) {
    console.error('Error generating shareable link:', error);
    res.status(500).json({ error: 'Failed to generate shareable link' });
  }
});
/**
 * Public endpoint to view an invoice by share token
 * @route GET /api/invoices/shared/:token
 */
app.get('/api/invoices/shared/:token', async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) return res.status(400).json({ error: 'Missing token' });

    // Decode the token (format: base64(invoiceId:expiresAt))
    let decoded;
    try {
      decoded = Buffer.from(token, 'base64').toString('utf-8');
    } catch (e) {
      return res.status(400).json({ error: 'Invalid token format' });
    }
    const [invoiceId, expiresAt] = decoded.split(':');
    if (!invoiceId || !expiresAt) return res.status(400).json({ error: 'Invalid token data' });
    if (Date.now() > Number(expiresAt)) return res.status(410).json({ error: 'Link expired' });

    // Get sheetUrl from query params
    const { sheetUrl } = req.query;
    if (!sheetUrl) return res.status(400).json({ error: 'Missing sheetUrl' });

    // Extract spreadsheet ID
    const spreadsheetId = extractSheetIdFromUrl(sheetUrl);
    if (!spreadsheetId) return res.status(400).json({ error: 'Invalid sheetUrl' });

    // Initialize Google Sheets API with service account
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Get sheet metadata
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const invoiceSheet = spreadsheet.data.sheets.find(
      s => s.properties.title === "SheetBills Invoices"
    );
    if (!invoiceSheet) {
      return res.status(404).json({ error: 'SheetBills Invoices tab not found' });
    }
    const sheetName = invoiceSheet.properties.title;

    // Fetch invoice data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A2:M`,
    });

    const rows = response.data.values || [];
    const invoiceRow = rows.find(row => row[0] === invoiceId);
    if (!invoiceRow) return res.status(404).json({ error: 'Invoice not found' });

    // Parse items, tax, and discount
    let items = [];
    let tax = { type: 'percentage', value: 0 };
    let discount = { type: 'percentage', value: 0 };

    try {
      items = JSON.parse(invoiceRow[6] || '[]');
      tax = JSON.parse(invoiceRow[8] || '{"type":"percentage","value":0}');
      discount = JSON.parse(invoiceRow[9] || '{"type":"percentage","value":0}');
    } catch (e) {
      console.error('Error parsing JSON fields:', e);
    }

    // Map row to invoice object
    const invoice = {
      invoiceNumber: invoiceRow[0],
      date: invoiceRow[1],
      dueDate: invoiceRow[2],
      customer: {
        name: invoiceRow[3],
        email: invoiceRow[4],
        address: invoiceRow[5],
      },
      items,
      amount: parseFloat(invoiceRow[7]) || 0,
      tax,
      discount,
      notes: invoiceRow[10],
      template: invoiceRow[11] || 'classic',
      status: invoiceRow[12] || 'Pending',
    };

    // Get business details
    const businessResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Business Details!A2:C6',
    });

    const businessRows = businessResponse.data.values || [];
    const businessData = {
      companyName: '',
      phone: '',
      address: '',
      email: '',
      logo: ''
    };

    businessRows.forEach(row => {
      if (row[0] && row[1]) {
        switch (row[0]) {
          case 'Company Name':
            businessData.companyName = row[1];
            break;
          case 'Phone Number':
            businessData.phone = row[1];
            break;
          case 'Address':
            businessData.address = row[1];
            break;
          case 'Business Email':
            businessData.email = row[1];
            break;
          case 'Logo':
            businessData.logo = row[1];
            break;
        }
      }
    });

    res.json({ invoice, businessData });
  } catch (error) {
    console.error('Error fetching shared invoice:', error);
    res.status(500).json({ 
      error: 'Failed to fetch shared invoice',
      details: error.message,
      stack: error.stack,
      googleError: error.response?.data || null
    });
  }
});
/**
 * Checks if the user's Master Tracking Sheet exists (for onboarding status).
 * @route GET /api/onboarding/status
 * @access Protected (Supabase + Google Auth)
 * Returns: { onboarded: true } if exists, { onboarded: false } if not
 */
app.get('/api/onboarding/status', async (req, res) => {
  try {
    // Get Google access token from headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ onboarded: false, error: 'Missing or invalid authorization header' });
    }
    const accessToken = authHeader.split(' ')[1];

    // Get user info to get Google user ID
    const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userId = userInfo.data.sub;

    // Initialize Google Drive API
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const drive = google.drive({ version: 'v3', auth });

    // Search for Master Tracking Sheet by name and type
    const driveResponse = await drive.files.list({
      q: "name='Master Tracking Sheet' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
      fields: 'files(id, name, webViewLink)',
      spaces: 'drive',
    });

    // If found, user is onboarded
    if (driveResponse.data.files.length > 0) {
      return res.json({ onboarded: true });
    } else {
      return res.json({ onboarded: false });
    }
  } catch (error) {
    console.error('[ONBOARDING STATUS ERROR]', error);
    return res.status(500).json({ onboarded: false, error: error.message });
  }
});
/**
 * Creates a single spreadsheet with both 'SheetBills Invoices' and 'Business Details' tabs.
 * @param {string} accessToken - Google OAuth access token.
 * @param {object} businessData - Business details to initialize the sheet.
 * @returns {Promise<{spreadsheetId: string, spreadsheetUrl: string}>}
 */
async function createUnifiedBusinessSheet(accessToken, businessData) {
  try {
    // Initialize Google Sheets API
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const sheets = google.sheets({ version: 'v4', auth });
    const drive = google.drive({ version: 'v3', auth });

    // Create new spreadsheet with two tabs
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: `${businessData.companyName} - SheetBills Invoices`,
          locale: 'en_US',
          timeZone: 'America/New_York'
        },
        sheets: [
          {
            properties: {
              title: 'SheetBills Invoices',
              gridProperties: { rowCount: 1000, columnCount: 15 }
            }
          },
          {
            properties: {
              title: 'Business Details',
              gridProperties: { rowCount: 100, columnCount: 3 }
            }
          }
        ]
      }
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId;
    const spreadsheetUrl = spreadsheet.data.spreadsheetUrl;

    // Add service account as editor if configured
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    if (serviceAccountEmail) {
      try {
        await drive.permissions.create({
          fileId: spreadsheetId,
          requestBody: {
            role: 'writer',
            type: 'user',
            emailAddress: serviceAccountEmail
          },
          sendNotificationEmail: false
        });
      } catch (error) {
        console.warn('Failed to add service account as editor:', error.message);
      }
    }

    // Add headers to 'SheetBills Invoices' tab
    const invoiceHeaders = [
      'Invoice ID', 'Invoice Date', 'Due Date', 'Customer Name',
      'Customer Email', 'Customer Address', 'Items', 'Amount',
      'Tax', 'Discount', 'Notes', 'Template', 'Status'
    ];
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'SheetBills Invoices!A1:M1',
      valueInputOption: 'RAW',
      requestBody: { values: [invoiceHeaders] }
    });

    // Add headers and business details to 'Business Details' tab
    const businessHeaders = ['Field', 'Value', 'Last Updated'];
    const now = new Date().toISOString();
    const businessDetails = [
      ['Company Name', businessData.companyName, now],
      ['Business Email', businessData.email, now],
      ['Phone Number', businessData.phone || '', now],
      ['Address', businessData.address || '', now],
      ['Created At', now, now]
    ];

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: [
          { range: 'Business Details!A1:C1', values: [businessHeaders] },
          { range: 'Business Details!A2:C6', values: businessDetails }
        ]
      }
    });

    // Format headers for both tabs
    const invoiceSheetId = spreadsheet.data.sheets[0].properties.sheetId;
    const businessSheetId = spreadsheet.data.sheets[1].properties.sheetId;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: { sheetId: invoiceSheetId, startRowIndex: 0, endRowIndex: 1 },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.8, green: 0.8, blue: 0.8 },
                  textFormat: { bold: true }
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)'
            }
          },
          {
            repeatCell: {
              range: { sheetId: businessSheetId, startRowIndex: 0, endRowIndex: 1 },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.8, green: 0.8, blue: 0.8 },
                  textFormat: { bold: true }
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)'
            }
          }
        ]
      }
    });

    return { spreadsheetId, spreadsheetUrl };
  } catch (error) {
    console.error('Unified business sheet creation error:', error);
    throw new Error(`Failed to create unified business sheet: ${error.message}`);
  }
}
/**
 * Creates a new unified business sheet with both invoice and business details tabs.
 * @route POST /api/create-business-sheet
 * @access Protected (Supabase + Google Auth)
 */
/**
 * Creates a new unified business sheet with both invoice and business details tabs.
 * @route POST /api/create-business-sheet
 * @access Protected (Supabase + Google Auth)
 */
app.post('/api/create-business-sheet', async (req, res) => {
  console.log('[CREATE] ===== Business Sheet Creation Request Start =====');
  let supabaseUser = null;

  try {
    // 1. Log all incoming headers
    console.log('[CREATE] Request headers:', {
      contentType: req.headers['content-type'],
      hasAuth: !!req.headers.authorization,
      hasSupabaseToken: !!req.headers['x-supabase-token'],
      allHeaders: Object.keys(req.headers),
      authHeader: req.headers.authorization?.substring(0, 20) + '...',
      supabaseToken: req.headers['x-supabase-token']?.substring(0, 20) + '...'
    });

    // 2. Validate request content type
    if (!req.headers['content-type']?.includes('application/json')) {
      console.error('[CREATE] Invalid content type:', req.headers['content-type']);
      return res.status(415).json({ success: false, error: 'Invalid content type - requires JSON' });
    }

    // 3. Validate tokens
    const supabaseToken = req.headers['x-supabase-token'];
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.split(' ')[1];
    const { businessData } = req.body;

    // Log token details
    console.log('[CREATE] Token validation:', {
      hasSupabaseToken: !!supabaseToken,
      hasAuthHeader: !!authHeader,
      hasGoogleToken: !!accessToken,
      supabaseTokenLength: supabaseToken?.length || 0,
      googleTokenLength: accessToken?.length || 0,
      authHeaderFormat: authHeader?.startsWith('Bearer ') ? 'correct' : 'incorrect',
      supabaseTokenPrefix: supabaseToken?.substring(0, 20) + '...',
      googleTokenPrefix: accessToken?.substring(0, 20) + '...'
    });

    if (!supabaseToken) {
      console.error('[CREATE] Missing Supabase token');
      return res.status(401).json({ success: false, error: 'Missing Supabase token' });
    }

    if (!accessToken) {
      console.error('[CREATE] Missing Google access token');
      return res.status(401).json({ success: false, error: 'Missing Google access token' });
    }

    // 4. Verify Supabase session
    console.log('[CREATE] Verifying Supabase session...');
    try {
      const { data: { user }, error: supabaseError } = await supabase.auth.getUser(supabaseToken);
      console.log('[CREATE] Supabase verification result:', {
        hasUser: !!user,
        userId: user?.id,
        userEmail: user?.email,
        error: supabaseError?.message,
        errorCode: supabaseError?.code,
        errorStatus: supabaseError?.status
      });
      
      if (supabaseError || !user) {
        console.error('[CREATE] Supabase auth error:', {
          error: supabaseError?.message,
          code: supabaseError?.code,
          status: supabaseError?.status,
          stack: supabaseError?.stack
        });
        return res.status(401).json({ success: false, error: 'Invalid Supabase session' });
      }

      supabaseUser = user;
    } catch (supabaseError) {
      console.error('[CREATE] Supabase verification failed:', {
        message: supabaseError.message,
        code: supabaseError.code,
        stack: supabaseError.stack,
        response: supabaseError.response?.data
      });
      return res.status(401).json({ success: false, error: 'Failed to verify Supabase session' });
    }

    // 5. Verify Google token with enhanced error handling
    console.log('[CREATE] Verifying Google token...');
    let oauth2Client;
    try {
      oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });
      
      // First try to get token info with direct HTTP call for better error details
      console.log('[CREATE] Testing token with Google tokeninfo endpoint...');
      const tokenInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`);
      
      if (!tokenInfoResponse.ok) {
        const tokenError = await tokenInfoResponse.text();
        console.error('[CREATE] Google tokeninfo failed:', {
          status: tokenInfoResponse.status,
          statusText: tokenInfoResponse.statusText,
          error: tokenError
        });
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid Google token',
          details: `Token validation failed: ${tokenError}`
        });
      }
      
      const tokenInfo = await tokenInfoResponse.json();
      console.log('[CREATE] Google token info:', {
        email: tokenInfo.email,
        scope: tokenInfo.scope,
        expires_in: tokenInfo.expires_in,
        issued_to: tokenInfo.issued_to
      });

      // Then try to make a test API call
      console.log('[CREATE] Testing with Google Drive API...');
      const drive = google.drive({ version: 'v3', auth: oauth2Client });
      const testResponse = await drive.files.list({
        pageSize: 1,
        fields: 'files(id, name)'
      });
      console.log('[CREATE] Google API test successful:', {
        hasFiles: !!testResponse.data.files,
        fileCount: testResponse.data.files?.length
      });
    } catch (googleError) {
      console.error('[CREATE] Google token validation error:', {
        message: googleError.message,
        code: googleError.code,
        status: googleError.status,
        response: googleError.response?.data,
        stack: googleError.stack,
        errors: googleError.errors
      });
      
      // Provide more specific error messages
      let errorMessage = 'Invalid Google token';
      if (googleError.message?.includes('Login Required')) {
        errorMessage = 'Google token expired - please re-authenticate';
      } else if (googleError.message?.includes('insufficient authentication scopes')) {
        errorMessage = 'Insufficient Google permissions - please re-authenticate with proper scopes';
      } else if (googleError.message?.includes('Invalid Credentials')) {
        errorMessage = 'Invalid Google credentials - please re-authenticate';
      }
      
      return res.status(401).json({ 
        success: false, 
        error: errorMessage,
        details: googleError.message
      });
    }

    // 6. Validate business data
    console.log('[CREATE] Validating business data...');
    if (!businessData) {
      console.error('[CREATE] Missing business data');
      return res.status(400).json({ error: 'Business data is required' });
    }

    console.log('[CREATE] Business data validation:', {
      hasCompanyName: !!businessData.companyName,
      hasEmail: !!businessData.email,
      hasPhone: !!businessData.phone,
      hasAddress: !!businessData.address
    });

    // Create the unified business sheet
    console.log('[CREATE] Creating unified business sheet...');
    const unifiedSheet = await createUnifiedBusinessSheet(accessToken, businessData);
    console.log('[CREATE] Unified sheet created:', {
      spreadsheetId: unifiedSheet.spreadsheetId,
      hasUrl: !!unifiedSheet.spreadsheetUrl
    });

    // Add to master sheet
    console.log('[CREATE] Adding to master sheet...');
    const masterSheet = await getOrCreateMasterSheet(accessToken, supabaseUser.id);
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    await sheets.spreadsheets.values.append({
      spreadsheetId: masterSheet.id,
      range: 'My Sheets!A:E',
      valueInputOption: 'RAW',
      resource: {
        values: [[
          new Date().toISOString(),
          'SheetBills Invoices',
          'Business',
          'Active',
          unifiedSheet.spreadsheetUrl
        ]]
      }
    });

    console.log('[CREATE] Successfully completed business sheet creation:', {
      spreadsheetId: unifiedSheet.spreadsheetId,
      userId: supabaseUser.id,
      masterSheetId: masterSheet.id
    });

    res.json({
      success: true,
      businessSheetId: unifiedSheet.spreadsheetId,
      spreadsheetUrl: unifiedSheet.spreadsheetUrl
    });
  } catch (error) {
    console.error('[CREATE] Business sheet creation error:', {
      message: error.message,
      code: error.code,
      status: error.status,
      response: error.response?.data,
      stack: error.stack
    });
    res.status(500).json({
      error: 'Business sheet creation failed',
      details: error.message
    });
  } finally {
    console.log('[CREATE] ===== Business Sheet Creation Request End =====');
  }
});
app.post('/api/check-master-sheet', async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) return res.status(400).json({ error: 'Missing Google access token' });

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const drive = google.drive({ version: 'v3', auth });

  try {
    const { data } = await drive.files.list({
      q: "name = 'SheetBills Master' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false",
      fields: 'files(id, name)',
      pageSize: 1,
    });

    if (data.files && data.files.length > 0) {
      return res.json({ onboarded: true, masterSheetId: data.files[0].id });
    } else {
      return res.json({ onboarded: false });
    }
  } catch (error) {
    console.error('Error checking master sheet:', error);
    return res.status(500).json({ error: 'Failed to check master sheet' });
  }
});

////////////////////////////////////////////////////////////////////
{/*Methods to Handle Customer Logic*/}
////////////////////////////////////////////////////////////////////

// Initialize customer sheet
app.post('/api/customers/init-sheet', async (req, res) => {
  try {
    // Verify Supabase authentication
    const supabaseToken = req.headers['x-supabase-token'];
    if (!supabaseToken) {
      return res.status(401).json({ error: 'Missing Supabase token' });
    }

    // Verify the Supabase user session is valid
    const { data: { user }, error } = await supabase.auth.getUser(supabaseToken);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid Supabase session' });
    }

    // Extract and validate Google authentication token
    const googleToken = req.headers.authorization?.split(' ')[1];
    if (!googleToken) {
      return res.status(401).json({ error: 'Missing Google credentials' });
    }

    // Get master sheet
    const masterSheet = await getOrCreateMasterSheet(googleToken, user.id);

    // Initialize Google Sheets API
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: googleToken });
    const sheets = google.sheets({ version: 'v4', auth });

    // Create new customer sheet
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: masterSheet.id,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: 'Customers',
              gridProperties: {
                rowCount: 1000,
                columnCount: 10,
                frozenRowCount: 1
              }
            }
          }
        }]
      }
    });

    // Add headers
    await sheets.spreadsheets.values.update({
      spreadsheetId: masterSheet.id,
      range: 'Customers!A1:J1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          'Customer ID',
          'Name',
          'Email',
          'Phone',
          'Address',
          'Company',
          'Notes',
          'Created At',
          'Last Updated',
          'Status'
        ]]
      }
    });

    res.json({ success: true, message: 'Customer sheet initialized' });
  } catch (error) {
    console.error('Error initializing customer sheet:', error);
    res.status(500).json({ error: 'Failed to initialize customer sheet' });
  }
});

// Get all customers
app.get('/api/customers', async (req, res) => {
  try {
    // Verify authentication
    const supabaseToken = req.headers['x-supabase-token'];
    const googleToken = req.headers.authorization?.split(' ')[1];
    
    if (!supabaseToken || !googleToken) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify the Supabase user session is valid
    const { data: { user }, error: userError } = await supabase.auth.getUser(supabaseToken);
    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid Supabase session' });
    }

    // Get master sheet
    const masterSheet = await getOrCreateMasterSheet(googleToken, user.id);
    
    // Initialize Google Sheets API
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: googleToken });
    const sheets = google.sheets({ version: 'v4', auth });

    // Check if Customers sheet exists
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: masterSheet.id });
    const customerSheet = spreadsheet.data.sheets.find(s => s.properties.title === 'Customers');
    
    if (!customerSheet) {
      // Initialize customer sheet if it doesn't exist
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: masterSheet.id,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: 'Customers',
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 10,
                  frozenRowCount: 1
                }
              }
            }
          }]
        }
      });

      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: masterSheet.id,
        range: 'Customers!A1:J1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[
            'Customer ID',
            'Name',
            'Email',
            'Phone',
            'Address',
            'Company',
            'Notes',
            'Created At',
            'Last Updated',
            'Status'
          ]]
        }
      });

      return res.json({ customers: [] });
    }

    // Get customer data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: masterSheet.id,
      range: 'Customers!A2:J',
    });

    const rows = response.data.values || [];
    const customers = rows.map(row => ({
      id: row[0],
      name: row[1],
      email: row[2],
      phone: row[3],
      address: row[4],
      company: row[5],
      notes: row[6],
      created_at: row[7],
      last_updated: row[8],
      status: row[9] || 'active'
    }));

    res.json({ customers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Add new customer
app.post('/api/customers', async (req, res) => {
  try {
    const { name, email, phone, address, company, notes } = req.body;
    
    // Verify authentication
    const supabaseToken = req.headers['x-supabase-token'];
    const googleToken = req.headers.authorization?.split(' ')[1];
    
    if (!supabaseToken || !googleToken) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify the Supabase user session is valid
    const { data: { user }, error: userError } = await supabase.auth.getUser(supabaseToken);
    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid Supabase session' });
    }

    // Get master sheet
    const masterSheet = await getOrCreateMasterSheet(googleToken, user.id);
    
    // Initialize Google Sheets API
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: googleToken });
    const sheets = google.sheets({ version: 'v4', auth });

    // Check if Customers sheet exists
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: masterSheet.id });
    const customerSheet = spreadsheet.data.sheets.find(s => s.properties.title === 'Customers');
    
    if (!customerSheet) {
      // Initialize customer sheet if it doesn't exist
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: masterSheet.id,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: 'Customers',
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 10,
                  frozenRowCount: 1
                }
              }
            }
          }]
        }
      });

      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: masterSheet.id,
        range: 'Customers!A1:J1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[
            'Customer ID',
            'Name',
            'Email',
            'Phone',
            'Address',
            'Company',
            'Notes',
            'Created At',
            'Last Updated',
            'Status'
          ]]
        }
      });
    }

    // Generate a unique customer ID
    const customerId = `CUST-${Date.now().toString().slice(-6)}`;
    const timestamp = new Date().toISOString();

    // Add customer to sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: masterSheet.id,
      range: 'Customers!A:J',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          customerId,
          name,
          email,
          phone || '',
          address || '',
          company || '',
          notes || '',
          timestamp,
          timestamp,
          'active'
        ]]
      }
    });

    res.json({
      success: true,
      customer: {
        id: customerId,
        name,
        email,
        phone,
        address,
        company,
        notes,
        created_at: timestamp,
        last_updated: timestamp,
        status: 'active'
      }
    });
  } catch (error) {
    console.error('Error adding customer:', error);
    res.status(500).json({ error: 'Failed to add customer' });
  }
});

// Update customer
app.put('/api/customers/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { name, email, phone, address, company, notes, status } = req.body;
    
    // Verify authentication
    const supabaseToken = req.headers['x-supabase-token'];
    const googleToken = req.headers.authorization?.split(' ')[1];
    
    if (!supabaseToken || !googleToken) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get master sheet
    const masterSheet = await getOrCreateMasterSheet(googleToken, user.id);
    
    // Initialize Google Sheets API
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: googleToken });
    const sheets = google.sheets({ version: 'v4', auth });

    // Get current customer data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: masterSheet.id,
      range: 'Customers!A2:J',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === customerId);
    
    if (rowIndex === -1) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Update customer data
    const timestamp = new Date().toISOString();
    await sheets.spreadsheets.values.update({
      spreadsheetId: masterSheet.id,
      range: `Customers!A${rowIndex + 2}:J${rowIndex + 2}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          customerId,
          name,
          email,
          phone,
          address,
          company || '',
          notes || '',
          rows[rowIndex][7], // Keep original created_at
          timestamp,
          status || rows[rowIndex][9] // Keep original status if not provided
        ]]
      }
    });

    res.json({
      success: true,
      customer: {
        id: customerId,
        name,
        email,
        phone,
        address,
        company,
        notes,
        created_at: rows[rowIndex][7],
        last_updated: timestamp,
        status: status || rows[rowIndex][9]
      }
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// Delete customer (soft delete)
app.delete('/api/customers/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    // Verify authentication
    const supabaseToken = req.headers['x-supabase-token'];
    const googleToken = req.headers.authorization?.split(' ')[1];
    
    if (!supabaseToken || !googleToken) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get master sheet
    const masterSheet = await getOrCreateMasterSheet(googleToken, user.id);
    
    // Initialize Google Sheets API
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: googleToken });
    const sheets = google.sheets({ version: 'v4', auth });

    // Get current customer data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: masterSheet.id,
      range: 'Customers!A2:J',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === customerId);
    
    if (rowIndex === -1) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Update customer status to inactive
    const timestamp = new Date().toISOString();
    await sheets.spreadsheets.values.update({
      spreadsheetId: masterSheet.id,
      range: `Customers!J${rowIndex + 2}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['inactive']]
      }
    });

    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

// ==========================
// Bulk Delete Customers Endpoint
// ==========================
/**
 * Bulk deletes customers from the Customers sheet.
 * @route DELETE /api/customers/bulk-delete
 * @access Protected (Supabase + Google Auth)
 * @body { customerIds: string[] }
 */
app.delete('/api/customers/bulk-delete', async (req, res) => {
  try {
    // 1. Basic validation
    const { customerIds } = req.body;
    if (!customerIds?.length) {
      return res.status(400).json({ error: "No customer IDs provided" });
    }

    // 2. Get auth tokens
    const supabaseToken = req.headers['x-supabase-token'];
    const googleToken = req.headers.authorization?.split(' ')[1];

    if (!supabaseToken || !googleToken) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // 3. Verify Supabase session
    const { data: { user }, error: supabaseError } = await supabase.auth.getUser(supabaseToken);
    if (supabaseError || !user) {
      return res.status(401).json({ error: "Invalid session" });
    }

    // 4. Setup Google Sheets
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: googleToken });
    const sheets = google.sheets({ version: 'v4', auth });

    // 5. Get master sheet
    const masterSheet = await getOrCreateMasterSheet(googleToken, user.id);
    if (!masterSheet?.id) {
      return res.status(500).json({ error: "Failed to access master sheet" });
    }

    // 6. Get all customer data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: masterSheet.id,
      range: 'Customers!A:J',
    });

    if (!response.data.values || response.data.values.length <= 1) {
      return res.status(404).json({ error: "No customer data found" });
    }

    // 7. Process rows
    const headerRow = response.data.values[0];
    const dataRows = response.data.values.slice(1);
    
    // Find rows to keep (not in customerIds)
    const rowsToKeep = dataRows.filter(row => !customerIds.includes(row[0]));
    
    // If no rows were found to delete
    if (rowsToKeep.length === dataRows.length) {
      return res.status(404).json({ 
        error: "No matching customers found",
        details: "The provided customer IDs do not exist in the sheet"
      });
    }

    // 8. Clear the sheet and write back the data
    try {
      // First, clear the sheet
      await sheets.spreadsheets.values.clear({
        spreadsheetId: masterSheet.id,
        range: 'Customers!A:J',
      });

      // Then, write back the header and remaining rows
      await sheets.spreadsheets.values.update({
        spreadsheetId: masterSheet.id,
        range: 'Customers!A1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [headerRow, ...rowsToKeep]
        }
      });
    } catch (writeError) {
      console.error('Error writing to sheet:', writeError);
      return res.status(500).json({
        error: "Failed to update sheet",
        details: writeError.message
      });
    }

    // 9. Return success response
    const deletedCount = dataRows.length - rowsToKeep.length;
    return res.json({
      success: true,
      message: `Successfully deleted ${deletedCount} customer(s)`,
      deletedCount,
      deletedIds: customerIds.filter(id => !rowsToKeep.some(row => row[0] === id))
    });

  } catch (error) {
    console.error('Bulk delete error:', error);
    return res.status(500).json({
      error: "Failed to delete customers",
      details: error.message
    });
  }
});

// Add logo upload endpoint
app.post('/api/upload-logo', upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    // Get authentication tokens from headers
    const supabaseToken = req.headers['x-supabase-token']
    const googleToken = req.headers.authorization?.split(' ')[1]

    if (!supabaseToken || !googleToken) {
      return res.status(401).json({ error: 'Authentication tokens required' })
    }

    // Verify Supabase session
    const { data: { user }, error } = await supabase.auth.getUser(supabaseToken)
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid Supabase session' })
    }

    // Get the current sheet URL from localStorage
    const sheetUrl = req.body.sheetUrl
    if (!sheetUrl) {
      return res.status(400).json({ error: 'Missing sheetUrl parameter' })
    }

    // Extract spreadsheetId from the URL
    const spreadsheetId = extractSheetIdFromUrl(sheetUrl)
    if (!spreadsheetId) {
      return res.status(400).json({ error: 'Invalid sheetUrl format' })
    }

    // Initialize Google Sheets API
    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: googleToken })
    const sheets = google.sheets({ version: 'v4', auth })

    // Generate a public URL for the uploaded file
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`

    // Update the logo URL in the Business Details sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Business Details!A7:C7',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['Logo', fileUrl, new Date().toISOString()]]
      }
    })

    res.json({
      success: true,
      url: fileUrl,
      message: 'Logo uploaded successfully'
    })

  } catch (error) {
    console.error('Logo upload error:', error)
    res.status(500).json({
      error: 'Failed to upload logo',
      details: error.message
    })
  }
})

// Serve static files from the uploads directory
app.use('/uploads', express.static(uploadsDir))

// Logo upload endpoint
app.post('/api/upload-logo', upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    // Get authentication tokens
    const supabaseToken = req.headers['x-supabase-token']
    const googleToken = req.headers.authorization?.split(' ')[1]
    if (!supabaseToken || !googleToken) {
      return res.status(401).json({ error: 'Authentication tokens required' })
    }

    // Verify Supabase session
    const { data: { user }, error } = await supabase.auth.getUser(supabaseToken)
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid Supabase session' })
    }

    // Get sheetUrl from request body
    const { sheetUrl } = req.body
    if (!sheetUrl) {
      return res.status(400).json({ error: 'Sheet URL is required' })
    }

    // Initialize Google Sheets API
    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: googleToken })
    const sheets = google.sheets({ version: 'v4', auth })

    // Generate public URL for the uploaded file
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`

    // Update the logo URL in the business details sheet
    const spreadsheetId = extractSheetIdFromUrl(sheetUrl)
    if (!spreadsheetId) {
      return res.status(400).json({ error: 'Invalid sheetUrl format' })
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Business Details!A7:C7',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['Logo', fileUrl, new Date().toISOString()]]
      }
    })

    res.json({
      success: true,
      url: fileUrl
    })

  } catch (error) {
    console.error('Logo upload error:', error)
    res.status(500).json({
      error: 'Failed to upload logo',
      details: error.message
    })
  }
})



