const handleShare = async () => {
  try {
    const response = await fetch(`${API_URL}/api/invoices/shared/create-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-supabase-token': supabaseToken,
        'Authorization': `Bearer ${googleToken}`
      },
      body: JSON.stringify({
        invoiceId: invoice.invoiceNumber,
        sheetUrl: sheetUrl
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate share link');
    }

    const { shareUrl } = await response.json();
    setShareLink(shareUrl);
    setShowShareModal(true);
  } catch (error) {
    console.error('Error generating share link:', error);
    setError(error.message);
  }
}; 