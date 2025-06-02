import React, { useState, useEffect } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import axios from 'axios';

interface LogoUploadProps {
  onLogoUploaded?: (url: string) => void; // Callback for when logo is uploaded
  className?: string; // For custom styling
  showPreview?: boolean; // Whether to show the preview
}

const LogoUpload: React.FC<LogoUploadProps> = ({ 
  onLogoUploaded, 
  className = '', 
  showPreview = true 
}) => {
  // State management
  const [uploading, setUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabaseClient();
  const user = useUser();

  // Fetch existing logo when component mounts
  useEffect(() => {
    fetchExistingLogo();
  }, []);

  // Function to fetch existing logo
  const fetchExistingLogo = async () => {
    try {
      const { data, error } = await supabase
        .from('user_business_settings')
        .select('logo_url')
        .single();
      
      if (error) throw error;
      
      if (data?.logo_url) {
        setLogoUrl(data.logo_url);
        onLogoUploaded?.(data.logo_url);
      }
    } catch (err) {
      console.error('Error fetching logo:', err);
      setError('Failed to load existing logo');
    }
  };

  // Function to handle file upload
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError(null);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Please select a logo to upload.');
      }

      const file = event.target.files[0];
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(filePath);

      // Update user settings with new logo URL
      const { error: updateError } = await supabase
        .from('user_business_settings')
        .upsert({ 
          id: user.id,
          logo_url: publicUrl,
          updated_at: new Date().toISOString()
        });

      if (updateError) throw updateError;

      // --- NEW: Update the business details sheet with the logo URL ---
      // Get the current sheet URL from localStorage
      const sheetUrl = typeof window !== 'undefined' ? localStorage.getItem("defaultSheetUrl") : "";
      if (sheetUrl) {
        // Get the current session for tokens
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.provider_token) {
          throw new Error("Google authentication required");
        }
        // Call backend API to update the Logo field
        await axios.put(
          "https://sheetbills-server.vercel.app/api/update-business-details",
          {
            logo: publicUrl,
            sheetUrl: sheetUrl
          },
          {
            headers: {
              Authorization: `Bearer ${session.provider_token}`,
              "X-Supabase-Token": session.access_token
            }
          }
        );
      }
      // --- END NEW ---

      setLogoUrl(publicUrl);
      onLogoUploaded?.(publicUrl);
      
    } catch (err) {
      console.error('Error uploading logo:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Logo Preview */}
      {showPreview && logoUrl && (
        <div className="mb-4">
          <img 
            src={logoUrl} 
            alt="Company Logo" 
            className="h-20 w-auto object-contain border rounded-lg shadow-sm"
          />
        </div>
      )}

      {/* Upload Input */}
      <div className="flex items-center space-x-4">
        <label className="flex flex-col items-center justify-center w-full">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg 
              className="w-8 h-8 mb-4 text-gray-500" 
              aria-hidden="true" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 20 16"
            >
              <path 
                stroke="currentColor" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 5MB)</p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Loading State */}
      {uploading && (
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <svg className="animate-spin h-5 w-5 text-green-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Uploading...</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default LogoUpload; 