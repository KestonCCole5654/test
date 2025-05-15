import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  LayoutGrid, 
  Table, 
  Image, 
  Type, 
  Palette,
  Save,
  Eye,
  Settings,
  Plus
} from 'lucide-react';
import { useToast } from '../ui/use-toast';
import supabase from '../Auth/supabaseClient';

interface TemplateDesignerPageProps {
  onSave?: (templateId: string) => void;
}

interface Template {
  id: string;
  name: string;
  description: string;
  spreadsheetId: string;
  spreadsheetUrl: string;
  createdAt: string;
  isDefault: boolean;
}

const TemplateDesignerPage: React.FC<TemplateDesignerPageProps> = ({ onSave }) => {
  const [activeTab, setActiveTab] = useState('design');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [isCooldown, setIsCooldown] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(60);

  // Load templates on component mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        throw new Error('No active session');
      }

      const response = await fetch('https://sheetbills-server.vercel.app/api/sheets', {
        headers: {
          'Authorization': `Bearer ${session.data.session.provider_token}`,
          'x-supabase-token': session.data.session.access_token
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }

      const data = await response.json();
      const templatesList = data.sheets.map((sheet: any) => ({
        id: sheet.id,
        name: sheet.name,
        description: sheet.description || '',
        spreadsheetId: sheet.id,
        spreadsheetUrl: sheet.sheetUrl,
        createdAt: sheet.createdAt,
        isDefault: sheet.isDefault
      }));
      setTemplates(templatesList);

      // Set current template to the most recently created one (last in the list)
      if (templatesList.length > 0) {
        setCurrentTemplate(templatesList[templatesList.length - 1]);
      } else {
        setCurrentTemplate(null);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load templates. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewTemplate = async () => {
    if (isCooldown) return;
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        throw new Error('No active session');
      }

      const response = await fetch('https://sheetbills-server.vercel.app/api/create-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.provider_token}`,
          'x-supabase-token': session.data.session.access_token
        },
        body: JSON.stringify({
          name: 'New Invoice Template',
          description: 'Created from template designer'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Check for 429 rate limit error
        if (response.status === 429 || errorData?.details?.error?.reason === 'rateLimitExceeded' || errorData?.details?.error?.status === 'RESOURCE_EXHAUSTED') {
          setIsCooldown(true);
          setCooldownSeconds(60);
          toast({
            title: 'Rate Limit Exceeded',
            description: 'You are creating templates too quickly. Please wait a minute and try again.',
            variant: 'destructive',
          });
          // Start cooldown timer
          const interval = setInterval(() => {
            setCooldownSeconds((prev) => {
              if (prev <= 1) {
                clearInterval(interval);
                setIsCooldown(false);
                return 60;
              }
              return prev - 1;
            });
          }, 1000);
          return;
        }
        throw new Error('Failed to create template');
      }

      const data = await response.json();
      // Add the new template to the list and set as current
      const newTemplate = {
        id: data.sheetId,
        name: 'New Invoice Template',
        description: 'Created from template designer',
        spreadsheetId: data.spreadsheetId,
        spreadsheetUrl: data.spreadsheetUrl,
        createdAt: new Date().toISOString(),
        isDefault: false
      };
      setTemplates(prev => [...prev, newTemplate]);
      setCurrentTemplate(newTemplate);
      toast({
        title: 'Success',
        description: 'New template created successfully'
      });
    } catch (error) {
      console.error('Error creating template:', error);
      if (!isCooldown) {
        toast({
          title: 'Error',
          description: 'Failed to create template. Please try again.',
          variant: 'destructive'
        });
      }
    }
  };

  const renderGoogleSheetsEmbed = () => {
    if (!currentTemplate) {
      return (
        <div className="w-full h-[600px] bg-white border rounded-lg shadow-sm flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 mb-4">No template selected</p>
            <Button onClick={createNewTemplate} className="flex items-center gap-2" disabled={isCooldown}>
              <Plus className="w-4 h-4" />
              {isCooldown ? `New Template (${cooldownSeconds})` : 'New Template'}
            </Button>
          </div>
        </div>
      );
    }

    const spreadsheetId = currentTemplate.spreadsheetId;
    const embedUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?usp=sharing&rm=minimal`;

    return (
      <iframe
        src={embedUrl}
        className="w-full h-[600px] border-0"
        allowFullScreen
        title="Template Designer"
      />
    );
  };

  const templateElements = [
    { icon: <Table className="w-5 h-5" />, label: 'Line Items Table', type: 'table' },
    { icon: <Type className="w-5 h-5" />, label: 'Text Field', type: 'text' },
    { icon: <Image className="w-5 h-5" />, label: 'Image', type: 'image' },
    { icon: <LayoutGrid className="w-5 h-5" />, label: 'Section', type: 'section' },
  ];

  return (
    <div className="min-h-screen bg-background font-cal-sans">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-medium">Invoice Designer</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                {isPreviewMode ? 'Edit Mode' : 'Preview Mode'}
              </Button>
              <Button 
                onClick={createNewTemplate}
                className="flex items-center gap-2"
                disabled={isCooldown}
              >
                <Plus className="w-4 h-4" />
                {isCooldown ? `New Template (${cooldownSeconds})` : 'New Template'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Template Elements */}
          <div className="col-span-2">
            <Card className="p-4">
              <h2 className="font-medium mb-4">Template Elements</h2>
              <div className="space-y-2">
                {templateElements.map((element) => (
                  <Button
                    key={element.type}
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    {element.icon}
                    {element.label}
                  </Button>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Editor Area */}
          <div className="col-span-8">
            <Card className="p-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="design">Design</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="design">
                  {renderGoogleSheetsEmbed()}
                </TabsContent>
                <TabsContent value="preview">
                  <div className="w-full h-[600px] bg-white border rounded-lg shadow-sm">
                    <div className="h-full flex items-center justify-center text-gray-400">
                      Preview with sample data will be shown here
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="settings">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Template Settings</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="autoNumber" />
                          <label htmlFor="autoNumber">Auto-number invoices</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="saveAsPDF" />
                          <label htmlFor="saveAsPDF">Default to PDF export</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Right Sidebar - Properties */}
          <div className="col-span-2">
            <Card className="p-4">
              <h2 className="font-medium mb-4">Properties</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Template Name</label>
                  <input
                    type="text"
                    className="w-full mt-1 p-2 border rounded"
                    placeholder="My Invoice Template"
                    value={currentTemplate?.name || ''}
                    onChange={(e) => {
                      if (currentTemplate) {
                        setCurrentTemplate({
                          ...currentTemplate,
                          name: e.target.value
                        });
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Description</label>
                  <textarea
                    className="w-full mt-1 p-2 border rounded"
                    placeholder="Template description..."
                    rows={3}
                    value={currentTemplate?.description || ''}
                    onChange={(e) => {
                      if (currentTemplate) {
                        setCurrentTemplate({
                          ...currentTemplate,
                          description: e.target.value
                        });
                      }
                    }}
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full font-cal-sans text-center text-md text-gray-400 mt-10 mb-2">
        Powered by <span className="font-cal-sans font-medium text-green-800">SheetBills™</span>
      </footer>
    </div>
  );
};

export default TemplateDesignerPage; 