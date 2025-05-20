router.put("/partial-payment", async (req, res) => {
  try {
    const { invoiceId, amount, paymentDate, sheetUrl } = req.body

    if (!invoiceId || !amount || !paymentDate || !sheetUrl) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const auth = await authenticateRequest(req)
    if (!auth.success) {
      return res.status(401).json({ error: auth.error })
    }

    const { google } = auth

    const sheets = google.sheets({ version: "v4" })
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: getSheetIdFromUrl(sheetUrl),
      ranges: ["Invoices!A:Z"],
    })

    const range = spreadsheet.data.sheets?.[0].properties?.gridProperties
    if (!range) {
      throw new Error("Could not get sheet range")
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: getSheetIdFromUrl(sheetUrl),
      range: "Invoices!A:Z",
    })

    const rows = response.data.values || []
    if (rows.length === 0) {
      return res.status(404).json({ error: "No data found" })
    }

    // Find the invoice row
    const invoiceRowIndex = rows.findIndex((row) => row[0] === invoiceId)
    if (invoiceRowIndex === -1) {
      return res.status(404).json({ error: "Invoice not found" })
    }

    const invoiceRow = rows[invoiceRowIndex]
    const totalAmount = parseFloat(invoiceRow[3]) // Assuming amount is in column D
    const currentPaidAmount = parseFloat(invoiceRow[4] || "0") // Assuming paid amount is in column E
    const newPaidAmount = currentPaidAmount + parseFloat(amount)

    // Update the invoice row
    const updateData = [
      [
        invoiceId, // ID
        invoiceRow[1], // Date
        invoiceRow[2], // Due Date
        totalAmount, // Total Amount
        newPaidAmount, // Paid Amount
        paymentDate, // Last Payment Date
        newPaidAmount >= totalAmount ? "Paid" : "Partially Paid", // Status
        ...invoiceRow.slice(7), // Rest of the columns
      ],
    ]

    await sheets.spreadsheets.values.update({
      spreadsheetId: getSheetIdFromUrl(sheetUrl),
      range: `Invoices!A${invoiceRowIndex + 1}:Z${invoiceRowIndex + 1}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: updateData,
      },
    })

    res.json({
      success: true,
      message: "Partial payment recorded successfully",
      newStatus: newPaidAmount >= totalAmount ? "Paid" : "Partially Paid",
      paidAmount: newPaidAmount,
    })
  } catch (error) {
    console.error("Error recording partial payment:", error)
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to record partial payment",
    })
  }
})

router.delete("/bulk-delete", async (req, res) => {
  try {
    const { invoiceIds, sheetUrl } = req.body

    if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0 || !sheetUrl) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const auth = await authenticateRequest(req)
    if (!auth.success) {
      return res.status(401).json({ error: auth.error })
    }

    const { google } = auth

    const sheets = google.sheets({ version: "v4" })
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: getSheetIdFromUrl(sheetUrl),
      ranges: ["Invoices!A:Z"],
    })

    const range = spreadsheet.data.sheets?.[0].properties?.gridProperties
    if (!range) {
      throw new Error("Could not get sheet range")
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: getSheetIdFromUrl(sheetUrl),
      range: "Invoices!A:Z",
    })

    const rows = response.data.values || []
    if (rows.length === 0) {
      return res.status(404).json({ error: "No data found" })
    }

    // Find the rows to delete (in reverse order to avoid index shifting)
    const rowsToDelete = rows
      .map((row, index) => ({ row, index }))
      .filter(({ row }) => invoiceIds.includes(row[0]))
      .sort((a, b) => b.index - a.index)

    // Delete rows in reverse order
    for (const { index } of rowsToDelete) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: getSheetIdFromUrl(sheetUrl),
        requestBody: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: spreadsheet.data.sheets?.[0].properties?.sheetId,
                  dimension: "ROWS",
                  startIndex: index,
                  endIndex: index + 1,
                },
              },
            },
          ],
        },
      })
    }

    res.json({
      success: true,
      message: `${rowsToDelete.length} invoice(s) deleted successfully`,
    })
  } catch (error) {
    console.error("Error deleting invoices:", error)
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to delete invoices",
    })
  }
}) 