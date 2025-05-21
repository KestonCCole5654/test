router.delete("/delete-account", async (req, res) => {
  try {
    const { deleteInvoices, sheetUrl } = req.body;
    const auth = await authenticateRequest(req);
    
    if (!auth.success) {
      return res.status(401).json({ error: auth.error });
    }

    const { google, supabaseToken } = auth;

    // 1. Delete Google Sheet if requested and URL is provided
    if (deleteInvoices && sheetUrl) {
      try {
        const drive = google.drive({ version: 'v3' });
        const sheetId = getSheetIdFromUrl(sheetUrl);
        
        // Delete the sheet
        await drive.files.delete({
          fileId: sheetId
        });
      } catch (error) {
        console.error("Error deleting Google Sheet:", error);
        // Continue with account deletion even if sheet deletion fails
      }
    }

    // 2. Revoke Google OAuth token
    try {
      const oauth2Client = new google.auth.OAuth2();
      await oauth2Client.revokeToken(auth.googleToken);
    } catch (error) {
      console.error("Error revoking Google token:", error);
      // Continue with account deletion even if token revocation fails
    }

    // 3. Delete user from Supabase
    try {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(
        auth.userId,
        { headers: { Authorization: `Bearer ${supabaseToken}` } }
      );

      if (deleteError) {
        throw deleteError;
      }

      return res.json({
        success: true,
        message: "Account and associated data deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting user from Supabase:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to delete user account",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  } catch (error) {
    console.error("Delete account error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete account",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}); 