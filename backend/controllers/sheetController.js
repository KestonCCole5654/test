import { getGoogleSheetsAuth } from '../services/googleSheetsService.js';
import { google } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';

// Function to list user spreadsheets
export const listUserSpreadsheets = async (req, res) => {
    try {
        const auth = await getGoogleSheetsAuth(req.user.token); // Use the token from the authenticated user
        const sheets = google.sheets({ version: 'v4', auth });

        // List spreadsheets (example logic)
        const response = await sheets.spreadsheets.get({
            spreadsheetId: 'your-spreadsheet-id', // Replace with actual logic to list spreadsheets
        });

        res.json({ spreadsheets: response.data });
    } catch (error) {
        console.error('Error listing spreadsheets:', error);
        res.status(500).json({ error: 'Failed to retrieve spreadsheets' });
    }
};

// Function to fetch data from a specific spreadsheet
export const fetchSheetData = async (req, res) => {
    try {
        const { spreadsheetId } = req.params;

        if (!spreadsheetId) {
            return res.status(400).json({ error: 'Spreadsheet ID is required' });
        }

        const auth = await getGoogleSheetsAuth(req.user.token); // Use the token from the authenticated user
        const sheets = google.sheets({ version: 'v4', auth });

        // Fetch data from the spreadsheet
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Sheet1!A1:Z1000', // Adjust the range as needed
        });

        if (!response.data.values) {
            return res.status(404).json({ error: 'No data found in the specified range' });
        }

        res.json({ data: response.data.values });
    } catch (error) {
        console.error('Error fetching sheet data:', error);
        res.status(500).json({ error: 'Failed to retrieve spreadsheet data' });
    }
};

// Function to create a new spreadsheet
export const createSpreadsheet = async (req, res) => {
    try {
        const { name, refreshToken } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Spreadsheet name is required' });
        }

        // Use the auth client from the middleware
        const auth = req.auth;
        const sheets = google.sheets({ version: 'v4', auth });

        // Create a new spreadsheet for invoices
        const spreadsheet = await sheets.spreadsheets.create({
            requestBody: {
                properties: {
                    title: name,
                },
                sheets: [
                    {
                        properties: {
                            title: 'Invoices',
                        },
                    },
                ],
            },
        });

        const spreadsheetId = spreadsheet.data.spreadsheetId;
        const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

        // Add invoice headers to the sheet
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: 'Invoices!A1:H1',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [
                    [
                        'Invoice #',
                        'Date',
                        'Customer',
                        'Description',
                        'Amount',
                        'Status',
                        'Due Date',
                        'Notes',
                    ],
                ],
            },
        });

        // Format the header row
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [
                    {
                        repeatCell: {
                            range: {
                                sheetId: 0,
                                startRowIndex: 0,
                                endRowIndex: 1,
                                startColumnIndex: 0,
                                endColumnIndex: 8,
                            },
                            cell: {
                                userEnteredFormat: {
                                    backgroundColor: {
                                        red: 0.2,
                                        green: 0.2,
                                        blue: 0.2,
                                    },
                                    textFormat: {
                                        foregroundColor: {
                                            red: 1,
                                            green: 1,
                                            blue: 1,
                                        },
                                        bold: true,
                                        fontSize: 12,
                                    },
                                },
                            },
                            fields: 'userEnteredFormat(backgroundColor,textFormat)',
                        },
                    },
                    {
                        updateSheetProperties: {
                            properties: {
                                sheetId: 0,
                                gridProperties: {
                                    frozenRowCount: 1,
                                },
                            },
                            fields: 'gridProperties.frozenRowCount',
                        },
                    },
                ],
            },
        });

        // If we generated a new token during authentication, include it in the response
        const responseData = {
            spreadsheet: {
                id: uuidv4(), // Generate a unique ID for the sheet in your app
                googleSheetId: spreadsheetId,
                name: name,
                url: spreadsheetUrl,
                lastSync: new Date().toISOString(),
                status: "active",
                rowCount: 0,
                isDefault: false
            }
        };

        if (req.newToken) {
            responseData.newToken = req.newToken;
        }

        res.status(201).json(responseData);
    } catch (error) {
        console.error('Error creating spreadsheet:', error);
        res.status(500).json({ error: 'Failed to create spreadsheet' });
    }
};

// Add other controller functions here