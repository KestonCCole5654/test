import { useState } from 'react';
import { templateService, Template } from '@/lib/templateService';
import { LoadingSpinner } from '@/components/ui/loadingSpinner';
import { useToast } from '@/components/ui/use-toast';

interface TemplateUploadProps {
  accessToken: string;
  userId: string;
  onUploadComplete: (template: Template) => void;
}

export const TemplateUpload = ({ accessToken, userId, onUploadComplete }: TemplateUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF, Word, or Excel file');
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, Word, or Excel file",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploadedFile = await templateService.uploadTemplate(accessToken, userId, file);
      onUploadComplete(uploadedFile);
      toast({
        title: "Template uploaded",
        description: "Your template has been uploaded successfully",
      });
    } catch (error) {
      setError('Failed to upload template');
      toast({
        title: "Upload failed",
        description: "Failed to upload template. Please try again.",
        variant: "destructive"
      });
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <label className="block">
        <span className="sr-only">Choose template file</span>
        <input
          type="file"
          accept=".pdf,.docx,.xlsx"
          onChange={handleFileUpload}
          disabled={uploading}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-green-50 file:text-green-700
            hover:file:bg-green-100"
        />
      </label>
      {uploading && <LoadingSpinner />}
      {error && (
        <div className="mt-2 text-sm text-red-500">
          {error}
        </div>
      )}
    </div>
  );
}; 