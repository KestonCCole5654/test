const { google } = require('googleapis');
const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const { accessToken, invoiceData, sheetUrl } = req.body;

    if (!accessToken || !invoiceData || !sheetUrl) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        access_token: accessToken
      }
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Extract sheet ID from URL
    const sheetId = sheetUrl.match(/[-\w]{25,}/)?.[0];
    if (!sheetId) {
      return res.status(400).json({ error: 'Invalid sheet URL' });
    }

    // Get the sheet data to find the invoice row
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Invoices!A:Z', // Adjust range as needed
    });

    const rows = response.data.values || [];
    const headers = rows[0];
    
    // Find the invoice row
    const invoiceRowIndex = rows.findIndex(row => 
      row[headers.indexOf('Invoice Number')] === invoiceData.invoiceNumber
    );

    if (invoiceRowIndex === -1) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Update the invoice status in Google Sheets
    const updateData = {
      spreadsheetId: sheetId,
      range: `Invoices!${String.fromCharCode(65 + headers.indexOf('sent_status'))}${invoiceRowIndex + 1}`,
      valueInputOption: 'RAW',
      resource: {
        values: [['sent']]
      }
    };

    await sheets.spreadsheets.values.update(updateData);

    // Update channel_sent field
    const channelUpdateData = {
      spreadsheetId: sheetId,
      range: `Invoices!${String.fromCharCode(65 + headers.indexOf('channel_sent'))}${invoiceRowIndex + 1}`,
      valueInputOption: 'RAW',
      resource: {
        values: [['email']] // Default to email, can be updated based on actual channel used
      }
    };

    await sheets.spreadsheets.values.update(channelUpdateData);

    // Update date_sent field
    const dateUpdateData = {
      spreadsheetId: sheetId,
      range: `Invoices!${String.fromCharCode(65 + headers.indexOf('date_sent'))}${invoiceRowIndex + 1}`,
      valueInputOption: 'RAW',
      resource: {
        values: [[new Date().toISOString()]]
      }
    };

    await sheets.spreadsheets.values.update(dateUpdateData);

    // Here you would trigger the Make webhook
    // Replace with your actual Make webhook URL
    const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;
    if (makeWebhookUrl) {
      await axios.post(makeWebhookUrl, {
        invoiceData,
        sheetUrl,
        timestamp: new Date().toISOString()
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
}; 