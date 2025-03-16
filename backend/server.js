import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors'; // Import the cors package
import { google } from 'googleapis'; // Add this line

dotenv.config();

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from this origin
  credentials: true, // Allow cookies and credentials
}));

app.use(express.json());


function extractSheetIdFromUrl(url) {
  const regex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Endpoint to handle Google OAuth callback
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

// Endpoint to create a new Google Sheet
app.post('/api/create-sheet', async (req, res) => {
    const { 
      accessToken, 
      name = 'New Sheet', 
      description = ''
    } = req.body;
  
    // Updated headers to match the Invoice interface
    const headers = [
      'Invoice ID', 
      'Invoice Date',
      'Due Date', 
      'Customer Name', 
      'Customer Email',
      'Customer Address',
      'Items',
      'Amount',
      'Notes',
      'Template',
      'Status'
    ];
  
    if (!accessToken) {
      return res.status(400).json({ error: 'Access token is required' });
    }
  
    try {
      // Get user info
      const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      const userId = userInfoResponse.data.sub;
      
      // First, get or create the master tracking sheet
      const masterSheet = await getOrCreateMasterSheet(accessToken, userId);
      
      // Initialize the Google Sheets API client
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: accessToken });
  
      const sheets = google.sheets({ version: 'v4', auth });
  
      // Create a new spreadsheet
      const newSheet = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: `${name} - ${new Date().toLocaleDateString()}`,
          },
          sheets: [
            {
              properties: {
                title: 'Sheet1',
                gridProperties: {
                  frozenRowCount: 1
                }
              }
            }
          ]
        },
      });
  
      const newSheetId = newSheet.data.spreadsheetId;
      const newSheetUrl = newSheet.data.spreadsheetUrl;
      
      // Get the first sheet's actual sheetId (not always 0)
      const firstSheetId = newSheet.data.sheets[0].properties.sheetId;
      
      // Add invoice headers to the new sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId: newSheetId,
        range: 'Sheet1!A1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [headers]
        }
      });
      
      // Format headers (make them bold) using the correct sheet ID
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: newSheetId,
        requestBody: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: firstSheetId,  // Use the actual sheet ID 
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: headers.length
                },
                cell: {
                  userEnteredFormat: {
                    textFormat: {
                      bold: true
                    },
                    backgroundColor: {
                      red: 0.9,
                      green: 0.9,
                      blue: 0.9
                    }
                  }
                },
                fields: 'userEnteredFormat(textFormat,backgroundColor)'
              }
            },
            // Resize columns to fit content
            {
              autoResizeDimensions: {
                dimensions: {
                  sheetId: firstSheetId,
                  dimension: 'COLUMNS',
                  startIndex: 0,
                  endIndex: headers.length
                }
              }
            }
          ]
        }
      });
      
      // Generate a unique sheet ID
      const sheetId = `SHEET-${Date.now().toString().slice(-6)}`;
      
      // Add this sheet to the master tracking sheet
      await sheets.spreadsheets.values.append({
        spreadsheetId: masterSheet.id,
        range: 'My Sheets!A:E',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [
            [
              sheetId,
              name,
              new Date().toLocaleDateString(),
              description,
              newSheetUrl
            ]
          ]
        }
      });
  
      // Return the spreadsheet ID and URL
      res.json({
        message: 'Google Sheet created and tracked successfully',
        sheetId,
        spreadsheetId: newSheetId,
        spreadsheetUrl: newSheetUrl,
        masterSheetId: masterSheet.id,
        masterSheetUrl: masterSheet.webViewLink
      });
    } catch (error) {
      console.error('Error creating sheet:', error.response ? error.response.data : error.message);
      res.status(500).json({ error: 'Failed to create and track Google Sheet' });
    }
});


// Endpoint to get sheets data from Google Sheets API
app.get('/api/sheets', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication token is required' });
    }

    const accessToken = authHeader.split(' ')[1];
    
    // Initialize the Google Sheets API client
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    
    // Get user info to find their master sheet
    const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    const userId = userInfoResponse.data.sub;
    
    // Get the master sheet
    const masterSheet = await getOrCreateMasterSheet(accessToken, userId);
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Get the data from the master sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: masterSheet.id,
      range: 'My Sheets!A:E',
    });
    
    const rows = response.data.values || [];
    
    // Skip the header row and convert to objects
    const sheetsList = rows.slice(1).map(row => ({
      id: row[0] || '',
      name: row[1] || '',
      createdAt: row[2] || '',
      description: row[3] || '',
      sheetUrl: row[4] || ''
    }));
    
    res.json({
      sheets: sheetsList,
      totalCount: sheetsList.length,
      masterSheetUrl: masterSheet.webViewLink
    });
  } catch (error) {
    console.error('Error fetching sheets:', error);
    res.status(500).json({ error: 'Failed to fetch Google Sheets' });
  }
});

// Endpoint to add a new sheet to the master sheet
async function getOrCreateMasterSheet(accessToken, userId) {
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

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

// Endpoint to create a business sheet
app.post('/api/create-business-sheet', async (req, res) => {
  const { accessToken, businessData } = req.body;

  console.log("Received accessToken:", accessToken); // Log the access token
  console.log("Received businessData:", businessData); // Log the business data

  if (!accessToken) {
    console.error("Access token is missing in the request body");
    return res.status(400).json({ error: 'Access token is required' });
  }

  if (!businessData) {
    console.error("Business data is missing in the request body");
    return res.status(400).json({ error: 'Business data is required' });
  }

  try {
    // Initialize the Google Sheets API client
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: 'v4', auth });
    const drive = google.drive({ version: 'v3', auth });

    // Get user info
    const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const userId = userInfoResponse.data.sub;

    // First, get or create the master tracking sheet
    const masterSheet = await getOrCreateMasterSheet(accessToken, userId);

    // Create a new spreadsheet for business details
    const newSheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: `Business Details`,
        },
        sheets: [
          {
            properties: {
              title: 'Business Info',
              gridProperties: {
                frozenRowCount: 1,
              },
            },
          },
        ],
      },
    });

    const newSheetId = newSheet.data.spreadsheetId;
    const newSheetUrl = newSheet.data.spreadsheetUrl;

    // Get the sheetId of the newly created sheet
    const sheetId = newSheet.data.sheets[0].properties.sheetId;

    console.log("New Sheet ID:", newSheetId);
    console.log("Sheet ID of the first sheet:", sheetId);

    // Define headers and data for business details
    const headers = ['Field', 'Value'];
    const businessDetailsRows = [
      ['Company Name', businessData.companyName],
      ['Business Email', businessData.email],
      ['Phone Number', businessData.phone],
      ['Address Line 1', businessData.addressLine1],
      ['Address Line 2', businessData.addressLine2],
      ['Setup Date', new Date().toLocaleDateString()],
    ];

    // Add headers to the new sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId: newSheetId,
      range: 'Business Info!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers],
      },
    });

    // Add business details data
    await sheets.spreadsheets.values.append({
      spreadsheetId: newSheetId,
      range: 'Business Info!A2',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: businessDetailsRows,
      },
    });

    // Format headers (make them bold)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: newSheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: sheetId, // Use the correct sheetId
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: headers.length,
              },
              cell: {
                userEnteredFormat: {
                  textFormat: {
                    bold: true,
                  },
                  backgroundColor: {
                    red: 0.9,
                    green: 0.9,
                    blue: 0.9,
                  },
                },
              },
              fields: 'userEnteredFormat(textFormat,backgroundColor)',
            },
          },
          // Format first column (field names) to be bold
          {
            repeatCell: {
              range: {
                sheetId: sheetId, // Use the correct sheetId
                startRowIndex: 1,
                endRowIndex: businessDetailsRows.length + 1,
                startColumnIndex: 0,
                endColumnIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  textFormat: {
                    bold: true,
                  },
                },
              },
              fields: 'userEnteredFormat(textFormat)',
            },
          },
          // Resize columns to fit content
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: sheetId, // Use the correct sheetId
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: headers.length,
              },
            },
          },
        ],
      },
    });

    // Generate a unique business sheet ID
    const businessSheetId = `BUSINESS-${Date.now().toString().slice(-6)}`;

    // Add this sheet to the master tracking sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: masterSheet.id,
      range: 'My Sheets!A:E',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [
          [
            businessSheetId,
            `Business Details`,
            new Date().toLocaleDateString(),
            'Business information for invoicing',
            newSheetUrl,
          ],
        ],
      },
    });

    // Return the spreadsheet ID and URL
    res.json({
      message: 'Business details saved to Google Sheet successfully',
      businessSheetId,
      spreadsheetId: newSheetId,
      spreadsheetUrl: newSheetUrl,
    });
  } catch (error) {
    console.error('Error creating business sheet:', error);
    console.error('Error details:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to save business details to Google Sheet' });
  }
});

// Endpoint to fetch business details
app.get('/api/business-details', async (req, res) => {
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

    // Step 1: Fetch the master tracking sheet to get the business details sheet ID
    const masterSheet = await getOrCreateMasterSheet(accessToken, req.user?.sub || req.user?.id);
    const masterSheetResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: masterSheet.id,
      range: 'My Sheets!A:E', // Adjust the range to match your master sheet
    });

    const rows = masterSheetResponse.data.values || [];

    // Step 2: Find the business details sheet
    const businessSheet = rows.find((row) => row[1].includes('Business Details'));
    if (!businessSheet) {
      return res.status(404).json({ error: 'Business details sheet not found' });
    }

    const spreadsheetId = extractSheetIdFromUrl(businessSheet[4]); // Extract spreadsheet ID from URL
    const sheetName = 'Business Info'; // Default sheet name for business details
    const range = 'A2:B'; // Default range for business details

    // Step 3: Fetch the business details from the Google Sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!${range}`,
    });

    const dataRows = response.data.values || [];

    // Convert rows to an object
    const businessDetails = {};
    dataRows.forEach((row) => {
      if (row.length >= 2) {
        businessDetails[row[0]] = row[1];
      }
    });

    res.json({ businessDetails });
  } catch (error) {
    console.error('Error fetching business details:', error);
    res.status(500).json({ error: 'Failed to fetch business details' });
  }
});

app.post('/api/update-business-details', async (req, res) => {
  try {
    const { accessToken, businessData } = req.body;

    if (!accessToken || !businessData) {
      return res.status(400).json({ error: 'Access token and business data are required' });
    }

    // Initialize the Google Sheets API client
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: 'v4', auth });

    // Prepare the data to update
    const values = [
      ['Company Name', businessData.companyName],
      ['Business Email', businessData.email],
      ['Phone Number', businessData.phone],
      ['Address Line 1', businessData.addressLine1],
      ['Address Line 2', businessData.addressLine2],
    ];

    // Update the Google Sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId: 'YOUR_SPREADSHEET_ID', // Replace with your spreadsheet ID
      range: 'Business Info!A2', // Adjust the range to match your sheet
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });

    res.json({ message: 'Business details updated successfully' });
  } catch (error) {
    console.error('Error updating business details:', error);
    res.status(500).json({ error: 'Failed to update business details' });
  }
});

app.post('/api/sync-business-sheet', async (req, res) => {
  try {
    const { accessToken, businessData } = req.body;

    if (!accessToken || !businessData) {
      return res.status(400).json({ error: 'Access token and business data are required' });
    }

    // Initialize the Google Sheets API client
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: 'v4', auth });

    // Prepare the data to sync
    const values = [
      ['Company Name', businessData.companyName],
      ['Business Email', businessData.email],
      ['Phone Number', businessData.phone],
      ['Address Line 1', businessData.addressLine1],
      ['Address Line 2', businessData.addressLine2],
    ];

    // Sync the Google Sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId: 'YOUR_SPREADSHEET_ID', // Replace with your spreadsheet ID
      range: 'Business Info!A2', // Adjust the range to match your sheet
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });

    res.json({ message: 'Business details synced successfully' });
  } catch (error) {
    console.error('Error syncing business details:', error);
    res.status(500).json({ error: 'Failed to sync business details' });
  }
});


app.get('/api/sheets/data', async (req, res) => {
  try {
    const { sheetUrl } = req.query; // Get the sheet URL from query parameters
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication token is required' });
    }

    if (!sheetUrl) {
      return res.status(400).json({ error: 'Sheet URL is required' });
    }

    // Extract the sheet ID from the sheet URL
    const sheetId = extractSheetIdFromUrl(sheetUrl);
    if (!sheetId) {
      return res.status(400).json({ error: 'Invalid sheet URL' });
    }

    const accessToken = authHeader.split(' ')[1];

    // Initialize the Google Sheets API client
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: 'v4', auth });

    // Fetch data from the specified sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId, // Use the extracted sheet ID
      range: 'Sheet1!A2:L', // Adjust the range to include all columns (A to L)
    });

    const rows = response.data.values || [];

    // Convert rows to invoice objects with the correct structure
    const invoices = rows.map(row => ({
      id: row[0] || '', // Invoice ID
      date: row[1] || '', // Invoice Date
      dueDate: row[2] || '', // Due Date
      customer: {
        name: row[3] || '', // Customer Name
        email: row[4] || '', // Customer Email
        address: row[5] || '', // Customer Address
      },
      items: JSON.parse(row[6] || '[]'), // Items (stored as JSON string)
      amount: parseFloat(row[7]) || 0, // Amount
      notes: row[8] || '', // Notes
      template: row[9] || 'modern', // Template
      status: row[10] || 'Pending', // Status
    }));

    res.json(invoices);
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    res.status(500).json({ error: 'Failed to fetch sheet data', details: error.message });
  }
});

app.put('/api/sheets/set-default', async (req, res) => {
    try {
      const { sheetUrl } = req.body; // Get the sheet URL from the request body
      const authHeader = req.headers.authorization;
  
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication token is required' });
      }
  
      if (!sheetUrl) {
        return res.status(400).json({ error: 'Sheet URL is required' });
      }
  
      console.log("Received Sheet URL:", sheetUrl); // Log the sheet URL for debugging
  
      // Extract the sheet ID from the sheet URL
      const sheetId = extractSheetIdFromUrl(sheetUrl);
      if (!sheetId) {
        console.error("Invalid Sheet URL:", sheetUrl); // Log invalid sheet URLs
        return res.status(400).json({ error: 'Invalid sheet URL' });
      }
  
      console.log("Extracted Sheet ID:", sheetId); // Log the extracted sheet ID for debugging
  
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
  
      // Update the master sheet to mark this sheet as default
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: masterSheet.id,
        range: 'My Sheets!A:E',
      });
  
      const rows = response.data.values || [];
      const rowIndex = rows.findIndex(row => row[4] === sheetUrl); // Compare sheet URLs
  
      if (rowIndex > 0) { // Skip header row (index 0)
        // Update the row to mark this sheet as default
        await sheets.spreadsheets.values.update({
          spreadsheetId: masterSheet.id,
          range: `My Sheets!A${rowIndex + 1}:F${rowIndex + 1}`, // Include column F
          valueInputOption: 'RAW',
          requestBody: {
            values: [
              [
                rows[rowIndex][0], // Sheet ID
                rows[rowIndex][1], // Name
                rows[rowIndex][2], // Created Date
                rows[rowIndex][3], // Description
                sheetUrl, // Sheet URL
                true, // Mark as default (new column)
              ],
            ],
          },
        });
  
        res.json({ success: true, message: 'Sheet set as default successfully' });
      } else {
        res.status(404).json({ error: 'Sheet not found in tracker' });
      }
    } catch (error) {
      console.error('Error setting default sheet:', error);
      res.status(500).json({ error: 'Failed to set default sheet', details: error.message });
    }
});

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

app.post('/api/save-draft', async (req, res) => {
  try {
    const { accessToken, sheetUrl, invoiceData } = req.body;

    if (!accessToken || !sheetUrl || !invoiceData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Extract the sheet ID from the sheet URL
    const sheetId = extractSheetIdFromUrl(sheetUrl);
    if (!sheetId) {
      return res.status(400).json({ error: 'Invalid sheet URL' });
    }

    // Initialize the Google Sheets API client
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: 'v4', auth });

    // Prepare the data to be appended
    const values = [
      [
        invoiceData.invoiceNumber, // Invoice ID (Column A)
        invoiceData.date, // Invoice Date (Column B)
        invoiceData.dueDate, // Due Date (Column C)
        invoiceData.customerName, // Customer Name (Column D)
        invoiceData.customerEmail, // Customer Email (Column E)
        invoiceData.customerAddress, // Customer Address (Column F)
        invoiceData.items, // Items (Column G, stored as JSON string)
        invoiceData.amount, // Amount (Column H)
        invoiceData.notes, // Notes (Column I)
        invoiceData.template, // Template (Column J)
        invoiceData.status, // Status (Column K)
      ],
    ];

    // Append the data to the sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Sheet1!A1', // Append to the first empty row
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values,
      },
    });

    res.json({ success: true, message: 'Draft saved successfully', response: response.data });
  } catch (error) {
    console.error('Error saving draft:', error);
    res.status(500).json({ error: 'Failed to save draft', details: error.message });
  }
});

app.put('/api/sheets/mark-as-pending', async (req, res) => {
  try {
    const { sheetUrl, invoiceId } = req.body; // Get sheet URL and invoice ID from the request body
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication token is required' });
    }

    if (!sheetUrl || !invoiceId) {
      return res.status(400).json({ error: 'Sheet URL and Invoice ID are required' });
    }

    // Extract the sheet ID from the sheet URL
    const sheetId = extractSheetIdFromUrl(sheetUrl);
    if (!sheetId) {
      return res.status(400).json({ error: 'Invalid sheet URL' });
    }

    const accessToken = authHeader.split(' ')[1];

    // Initialize the Google Sheets API client
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: 'v4', auth });

    // Fetch the data from the sheet to find the row index of the invoice
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Sheet1!A2:L', // Adjust the range to include all columns (A to L)
    });

    const rows = response.data.values || [];

    // Find the row index of the invoice
    const rowIndex = rows.findIndex((row) => row[0] === invoiceId); // Invoice ID is in column A

    if (rowIndex === -1) {
      return res.status(404).json({ error: 'Invoice not found in the sheet' });
    }

    // Update the status column (column K, index 10) to "Pending"
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `Sheet1!K${rowIndex + 2}`, // +2 because rows start from 1 and header is row 1
      valueInputOption: 'RAW',
      requestBody: {
        values: [['Pending']],
      },
    });

    res.json({ success: true, message: 'Invoice marked as pending successfully' });
  } catch (error) {
    console.error('Error marking invoice as pending:', error);
    res.status(500).json({ error: 'Failed to mark invoice as pending', details: error.message });
  }
});

app.put('/api/sheets/mark-as-paid', async (req, res) => {
  try {
    const { sheetUrl, invoiceId } = req.body; // Get sheet URL and invoice ID from the request body
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication token is required' });
    }

    if (!sheetUrl || !invoiceId) {
      return res.status(400).json({ error: 'Sheet URL and Invoice ID are required' });
    }

    // Extract the sheet ID from the sheet URL
    const sheetId = extractSheetIdFromUrl(sheetUrl);
    if (!sheetId) {
      return res.status(400).json({ error: 'Invalid sheet URL' });
    }

    const accessToken = authHeader.split(' ')[1];

    // Initialize the Google Sheets API client
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: 'v4', auth });

    // Fetch the data from the sheet to find the row index of the invoice
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Sheet1!A2:L', // Adjust the range to include all columns (A to L)
    });

    const rows = response.data.values || [];

    // Find the row index of the invoice
    const rowIndex = rows.findIndex((row) => row[0] === invoiceId); // Invoice ID is in column A

    if (rowIndex === -1) {
      return res.status(404).json({ error: 'Invoice not found in the sheet' });
    }

    // Update the status column (column K, index 10) to "Paid"
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `Sheet1!K${rowIndex + 2}`, // +2 because rows start from 1 and header is row 1
      valueInputOption: 'RAW',
      requestBody: {
        values: [['Paid']],
      },
    });

    res.json({ success: true, message: 'Invoice marked as paid successfully' });
  } catch (error) {
    console.error('Error marking invoice as paid:', error);
    res.status(500).json({ error: 'Failed to mark invoice as paid', details: error.message });
  }
});

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

app.put('/api/update-invoice', async (req, res) => {
  const { accessToken, sheetUrl, invoiceData, invoiceId } = req.body;

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: 'v4', auth });

    // Extract the spreadsheet ID from the URL
    const spreadsheetId = extractSheetIdFromUrl(sheetUrl);

    // Fetch the spreadsheet metadata to get the first sheet's name
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    const firstSheet = spreadsheet.data.sheets[0];
    if (!firstSheet) {
      throw new Error('No sheets found in the document');
    }

    const sheetName = firstSheet.properties.title;

    // Use the dynamic sheet name
    const range = `${sheetName}!A:A`;

    // Find the row to update
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    const rowIndex = rows.findIndex((row) => row[0] === invoiceId);

    if (rowIndex === -1) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Prepare the updated row data
    const updatedRow = [
      invoiceData.invoiceNumber,
      invoiceData.date,
      invoiceData.dueDate,
      invoiceData.customerName,
      invoiceData.customerEmail,
      invoiceData.customerAddress,
      invoiceData.items,
      invoiceData.amount,
      invoiceData.notes,
      invoiceData.template,
      invoiceData.status,
    ];

    // Update the row using the dynamic sheet name
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A${rowIndex + 1}:K${rowIndex + 1}`,
      valueInputOption: 'RAW',
      resource: {
        values: [updatedRow],
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});