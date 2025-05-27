import { useState, useEffect } from 'react';
import { templateService, Template } from '@/lib/templateService';
import { LoadingSpinner } from '@/components/ui/loadingSpinner';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, FileText, FileSpreadsheet, File } from 'lucide-react';

interface TemplateListProps {
  accessToken: string;
  userId: string;
  onSelect: (template: Template) => void;
}

export const TemplateList = ({ accessToken, userId, onSelect }: TemplateListProps) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, [accessToken, userId]);

  const loadTemplates = async () => {
    try {
      const files = await templateService.listTemplates(accessToken, userId);
      setTemplates(files);
    } catch (error) {
      setError('Failed to load templates');
      toast({
        title: "Error",
        description: "Failed to load templates. Please try again.",
        variant: "destructive"
      });
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    try {
      await templateService.deleteTemplate(accessToken, templateId);
      await loadTemplates(); // Refresh the list
      toast({
        title: "Template deleted",
        description: "The template has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete template. Please try again.",
        variant: "destructive"
      });
      console.error('Error deleting template:', error);
    }
  };

  const getFileIcon = (mimeType: string) => {
    switch (mimeType) {
      case 'application/pdf':
        return <FileText className="w-6 h-6 text-red-500" />;
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return <FileSpreadsheet className="w-6 h-6 text-green-500" />;
      default:
        return <File className="w-6 h-6 text-blue-500" />;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No templates found. Upload your first template above.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <div
          key={template.id}
          className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
        >
          <div className="aspect-video bg-gray-50 rounded mb-2 flex items-center justify-center">
            {template.thumbnailLink ? (
              <img
                src={template.thumbnailLink}
                alt={template.name}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                {getFileIcon(template.mimeType)}
              </div>
            )}
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold truncate">{template.name}</h3>
              <p className="text-sm text-gray-500">
                {new Date(template.createdTime).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onSelect(template)}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                Select
              </button>
              <button
                onClick={() => handleDelete(template.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}; 