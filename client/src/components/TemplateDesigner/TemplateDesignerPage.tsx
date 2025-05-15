import React, { useState } from 'react';
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
  Settings
} from 'lucide-react';

interface TemplateDesignerPageProps {
  onSave?: (templateId: string) => void;
}

const TemplateDesignerPage: React.FC<TemplateDesignerPageProps> = ({ onSave }) => {
  const [activeTab, setActiveTab] = useState('design');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // This would be replaced with actual Google Sheets embed
  const mockSheetEmbed = (
    <div className="w-full h-[600px] bg-white border rounded-lg shadow-sm">
      <div className="h-full flex items-center justify-center text-gray-400">
        Google Sheets Editor will be embedded here
      </div>
    </div>
  );

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
            <h1 className="text-2xl font-medium">Invoice Template Designer</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                {isPreviewMode ? 'Edit Mode' : 'Preview Mode'}
              </Button>
              <Button className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Template
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
                  {mockSheetEmbed}
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
              <h2 className="font-med mb-4">Properties</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Template Name</label>
                  <input
                    type="text"
                    className="w-full mt-1 p-2 border rounded"
                    placeholder="My Invoice Template"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Description</label>
                  <textarea
                    className="w-full mt-1 p-2 border rounded"
                    placeholder="Template description..."
                    rows={3}
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