import { useState, useEffect } from 'react';

export const useBrandLogo = (domain: string): string | null => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogo = async () => {
      if (!domain) return;
      
      try {
        const response = await fetch(`https://sheetbills-server.vercel.app/api/brand-fetch?domain=${encodeURIComponent(domain)}`);
        if (response.ok) {
          const data = await response.json();
          setLogoUrl(data.logo || null);
        }
      } catch (error) {
        console.error('Error fetching brand logo:', error);
      }
    };

    fetchLogo();
  }, [domain]);

  return logoUrl;
}; 