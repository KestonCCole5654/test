const axios = require('axios');
const { createAuthClient } = require('./index');

async function testUpdateInvoice() {
    try {
        // First, create a test invoice
        const testInvoice = {
            invoiceNumber: `TEST-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            customer: {
                name: "Test Customer",
                email: "test@example.com",
                address: "123 Test St"
            },
            items: [{
                name: "Test Item",
                description: "Test Description",
                quantity: 1,
                price: 100
            }],
            tax: {
                type: "percentage",
                value: 10
            },
            discount: {
                type: "fixed",
                value: 0
            },
            notes: "Test invoice",
            template: "classic",
            status: "Pending"
        };

        // Get the auth client
        const authClient = await createAuthClient(process.env.GOOGLE_ACCESS_TOKEN);
        const accessToken = await authClient.getAccessToken();

        // Create the invoice
        const createResponse = await axios.post('http://localhost:5000/api/saveInvoice', {
            accessToken: accessToken.token,
            invoiceData: testInvoice,
            sheetUrl: process.env.TEST_SHEET_URL
        }, {
            headers: {
                Authorization: `Bearer ${process.env.SUPABASE_TOKEN}`
            }
        });

        if (!createResponse.data.success) {
            throw new Error('Failed to create test invoice');
        }

        const invoiceId = createResponse.data.invoiceId;
        console.log('Created test invoice with ID:', invoiceId);

        // Now update the invoice
        const updatedInvoice = {
            ...testInvoice,
            customer: {
                ...testInvoice.customer,
                name: "Updated Test Customer"
            },
            items: [{
                ...testInvoice.items[0],
                price: 200
            }]
        };

        const updateResponse = await axios.post('http://localhost:5000/api/update-invoice', {
            accessToken: accessToken.token,
            invoiceData: updatedInvoice,
            invoiceId: invoiceId,
            sheetUrl: process.env.TEST_SHEET_URL
        }, {
            headers: {
                Authorization: `Bearer ${process.env.SUPABASE_TOKEN}`
            }
        });

        if (!updateResponse.data.success) {
            throw new Error('Failed to update test invoice');
        }

        console.log('Successfully updated invoice');
        console.log('Original invoice:', testInvoice);
        console.log('Updated invoice:', updatedInvoice);

    } catch (error) {
        console.error('Test failed:', error.message);
        process.exit(1);
    }
}

// Run the test
testUpdateInvoice(); 