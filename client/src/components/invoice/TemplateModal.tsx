import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TemplateUpload } from './TemplateUpload';
import { TemplateList } from './TemplateList';
import { Template } from '@/lib/templateService';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: Template) => void;
  accessToken: string;
  userId: string;
}

export const TemplateModal = ({
  isOpen,
  onClose,
  onSelect,
  accessToken,
  userId,
}: TemplateModalProps) => {
  const handleTemplateSelect = (template: Template) => {
    onSelect(template);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-lg font-medium mb-2">Upload New Template</h3>
            <TemplateUpload
              accessToken={accessToken}
              userId={userId}
              onUploadComplete={handleTemplateSelect}
            />
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Your Templates</h3>
            <TemplateList
              accessToken={accessToken}
              userId={userId}
              onSelect={handleTemplateSelect}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 