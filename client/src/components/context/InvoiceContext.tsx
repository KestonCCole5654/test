import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of your invoice settings
interface InvoiceSettings {
  businessName: string;
  // Add more fields as needed
}

interface InvoiceContextType {
  settings: InvoiceSettings;
  setSettings: React.Dispatch<React.SetStateAction<InvoiceSettings>>;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const InvoiceProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<InvoiceSettings>({
    businessName: '',
    // Add more default fields as needed
  });

  return (
    <InvoiceContext.Provider value={{ settings, setSettings }}>
      {children}
    </InvoiceContext.Provider>
  );
};

export function useInvoiceSettings() {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error('useInvoiceSettings must be used within an InvoiceProvider');
  }
  return context;
} 