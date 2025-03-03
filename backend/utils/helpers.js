const formatSheetData = (data) => {
    // Skip the first row (headers)
    const dataRows = data.slice(1);
    
    return dataRows.map(row => {
        // Extract the invoice number from the format "invoice#423"
        const invoiceId = row[0].replace('invoice', '');
        
        // Remove the dollar sign and commas from the amount string
        const amountStr = row[3].replace('$', '').replace(/,/g, '');
        const amount = parseFloat(amountStr);
        
        // Generate a date (since it's not in your original data)
        // In a real app, you'd want to get this from your data source
        const date = new Date().toDateString() + " " + 
                     new Date().getHours() + ":" + 
                     new Date().getMinutes();
        
        return {
            id: invoiceId,
            date: date,
            status: row[2], // "Paid" or "Pending"
            amount: amount,
            customer: row[1]
        };
    });
};

export default { formatSheetData };