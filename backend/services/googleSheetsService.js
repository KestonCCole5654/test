import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Function to verify and refresh a token
async function verifyAndRefreshToken(token, refreshToken) {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    try {
        // Verify the token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        // If the token is valid, return it
        return token;
    } catch (error) {
        // If the token is expired, refresh it
        if (error.message.includes('Token used too late')) {
            const { tokens } = await client.refreshToken(refreshToken);
            return tokens.access_token;
        }

        // If the token is invalid, throw an error
        throw new Error('Invalid or expired token');
    }
}

// Function to verify and refresh a token
export async function getGoogleSheetsAuth(token, refreshToken) {
    const client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );

    try {
        client.setCredentials({
            access_token: token,
            refresh_token: refreshToken
        });
        
        return client;
    } catch (error) {
        console.error('Error setting credentials:', error);
        throw new Error('Failed to authenticate with Google Sheets');
    }
}

// Function to fetch data from a specific Google Sheet
export async function getSheetData(auth, spreadsheetId, range = 'Sheet1!A1:Z1000') {
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        if (!response.data.values) {
            throw new Error('No data found in the specified range');
        }

        return response.data.values;
    } catch (error) {
        console.error('Error fetching sheet data:', error);
        throw error;
    }
}

// Function to get or create the SheetBills database sheet
export async function getOrCreateDatabaseSheet(auth, userId) {
    const drive = google.drive({ version: 'v3', auth });
    const sheets = google.sheets({ version: 'v4', auth });
    const dbSheetName = `SheetBills_DB_${userId}`;

    try {
        // Search for existing SheetBills DB sheet in Google Drive
        const response = await drive.files.list({
            q: `name='${dbSheetName}' and mimeType='application/vnd.google-apps.spreadsheet'`,
            fields: 'files(id, name)',
        });

        let dbSheet = response.data.files[0];

        // If DB sheet doesn't exist, create it
        if (!dbSheet) {
            const newSpreadsheet = await sheets.spreadsheets.create({
                requestBody: {
                    properties: {
                        title: dbSheetName,
                    },
                    sheets: [
                        {
                            properties: {
                                title: 'ConnectedSheets',
                            },
                        },
                    ],
                },
            });

            dbSheet = {
                id: newSpreadsheet.data.spreadsheetId,
                name: dbSheetName,
            };

            // Add headers to the DB sheet
            await sheets.spreadsheets.values.update({
                spreadsheetId: dbSheet.id,
                range: 'ConnectedSheets!A1:H1',
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: [
                        [
                            'id',
                            'name',
                            'googleSheetId',
                            'url',
                            'lastSync',
                            'status',
                            'rowCount',
                            'isDefault',
                        ],
                    ],
                },
            });

            // Format the header row
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId: dbSheet.id,
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
        }

        return dbSheet;
    } catch (error) {
        console.error('Error getting or creating DB sheet:', error);
        throw error;
    }
}

// Function to get all connected sheets from the DB sheet
export async function getConnectedSheets(auth, dbSheetId) {
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: dbSheetId,
            range: 'ConnectedSheets!A2:H',
        });

        if (!response.data.values || response.data.values.length === 0) {
            return [];
        }

        // Map row data to sheet objects
        return response.data.values.map((row) => ({
            id: row[0],
            name: row[1],
            googleSheetId: row[2],
            url: row[3],
            lastSync: row[4],
            status: row[5],
            rowCount: parseInt(row[6]) || 0,
            isDefault: row[7] === 'TRUE',
        }));
    } catch (error) {
        console.error('Error fetching connected sheets:', error);
        throw error;
    }
}

// Function to add a sheet to the DB
export async function addSheetToDb(auth, dbSheetId, sheetData) {
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        // Generate a unique ID for the sheet
        const id = Date.now().toString();

        const values = [
            [
                id,
                sheetData.name,
                sheetData.googleSheetId,
                sheetData.url,
                new Date().toISOString(),
                sheetData.status || 'active',
                sheetData.rowCount || 0,
                sheetData.isDefault ? 'TRUE' : 'FALSE',
            ],
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId: dbSheetId,
            range: 'ConnectedSheets!A2:H',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values,
            },
        });

        return {
            id,
            ...sheetData,
        };
    } catch (error) {
        console.error('Error adding sheet to DB:', error);
        throw error;
    }
}

// Function to update a sheet in the DB
export async function updateSheetInDb(auth, dbSheetId, sheetId, updateData) {
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        // Get all sheets to find the row index for the target sheet
        const allSheets = await getConnectedSheets(auth, dbSheetId);
        const rowIndex = allSheets.findIndex((sheet) => sheet.id === sheetId);

        if (rowIndex === -1) {
            throw new Error('Sheet not found in database');
        }

        // Row index in the sheet (add 2 to account for header and 0-indexing)
        const sheetRowIndex = rowIndex + 2;

        // Get the current data for the sheet
        const currentSheet = allSheets[rowIndex];

        // Merge the update data with the current data
        const updatedSheet = {
            ...currentSheet,
            ...updateData,
            lastSync: new Date().toISOString(),
        };

        const values = [
            [
                updatedSheet.id,
                updatedSheet.name,
                updatedSheet.googleSheetId,
                updatedSheet.url,
                updatedSheet.lastSync,
                updatedSheet.status,
                updatedSheet.rowCount,
                updatedSheet.isDefault ? 'TRUE' : 'FALSE',
            ],
        ];

        await sheets.spreadsheets.values.update({
            spreadsheetId: dbSheetId,
            range: `ConnectedSheets!A${sheetRowIndex}:H${sheetRowIndex}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values,
            },
        });

        return updatedSheet;
    } catch (error) {
        console.error('Error updating sheet in DB:', error);
        throw error;
    }
}

// Function to delete a sheet from the DB
export async function deleteSheetFromDb(auth, dbSheetId, sheetId) {
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        // Get all sheets
        const allSheets = await getConnectedSheets(auth, dbSheetId);
        const rowIndex = allSheets.findIndex((sheet) => sheet.id === sheetId);

        if (rowIndex === -1) {
            throw new Error('Sheet not found in database');
        }

        // Row index in the sheet (add 2 to account for header and 0-indexing)
        const sheetRowIndex = rowIndex + 2;

        // Get the current data for the sheet (we need to know if it's the default)
        const deletedSheet = allSheets[rowIndex];

        // Delete the row by clearing its contents
        await sheets.spreadsheets.values.clear({
            spreadsheetId: dbSheetId,
            range: `ConnectedSheets!A${sheetRowIndex}:H${sheetRowIndex}`,
        });

        // If there are rows below, move them up
        if (rowIndex < allSheets.length - 1) {
            const remainingRows = await sheets.spreadsheets.values.get({
                spreadsheetId: dbSheetId,
                range: `ConnectedSheets!A${sheetRowIndex + 1}:H`,
            });

            if (remainingRows.data.values && remainingRows.data.values.length > 0) {
                await sheets.spreadsheets.values.update({
                    spreadsheetId: dbSheetId,
                    range: `ConnectedSheets!A${sheetRowIndex}:H`,
                    valueInputOption: 'USER_ENTERED',
                    requestBody: {
                        values: remainingRows.data.values,
                    },
                });

                // Clear the duplicate rows at the end
                const lastRowIndex = sheetRowIndex + remainingRows.data.values.length;
                await sheets.spreadsheets.values.clear({
                    spreadsheetId: dbSheetId,
                    range: `ConnectedSheets!A${lastRowIndex}:H${lastRowIndex}`,
                });
            }
        }

        // If we deleted the default sheet, set a new default
        if (deletedSheet.isDefault) {
            const remainingSheets = allSheets.filter((sheet) => sheet.id !== sheetId);

            if (remainingSheets.length > 0) {
                // Set the first remaining sheet as default
                await updateSheetInDb(auth, dbSheetId, remainingSheets[0].id, { isDefault: true });
            }
        }

        return true;
    } catch (error) {
        console.error('Error deleting sheet from DB:', error);
        throw error;
    }
}

// Function to set a sheet as default
export async function setSheetAsDefault(auth, dbSheetId, sheetId) {
    try {
        // Get all sheets
        const allSheets = await getConnectedSheets(auth, dbSheetId);

        // Update all sheets to not be default
        for (const sheet of allSheets) {
            if (sheet.isDefault) {
                await updateSheetInDb(auth, dbSheetId, sheet.id, { isDefault: false });
            }
        }

        // Set the target sheet as default
        return await updateSheetInDb(auth, dbSheetId, sheetId, { isDefault: true });
    } catch (error) {
        console.error('Error setting sheet as default:', error);
        throw error;
    }
}

// Function to create a new invoice sheet
export async function createInvoiceSheet(auth, name) {
    const sheets = google.sheets({ version: 'v4', auth });

    try {
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

        return {
            googleSheetId: spreadsheetId,
            url: spreadsheetUrl,
        };
    } catch (error) {
        console.error('Error creating invoice sheet:', error);
        throw error;
    }
}