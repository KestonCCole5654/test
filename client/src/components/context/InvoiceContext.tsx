import { createContext, useContext, useState, ReactNode } from "react";

// Define the structure of invoice settings
interface InvoiceSettings {
  businessName: string;
  businessAddress: string;
  businessEmail: string;
  businessPhone: string;
}

// Create default values
const defaultSettings: InvoiceSettings = {
  businessName: "Your Company",
  businessAddress: "123 Business Street, City, State ZIP",
  businessEmail: "contact@yourcompany.com",
  businessPhone: "(123) 456-7890",
};

// Define context type
interface InvoiceContextType {
  settings: InvoiceSettings;
  updateSettings: (newSettings: InvoiceSettings) => void;
}

// Create context
const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

// Provider component
export const InvoiceProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<InvoiceSettings>(defaultSettings);

  const updateSettings = (newSettings: InvoiceSettings) => {
    setSettings(newSettings);
  };

  return (
    <InvoiceContext.Provider value={{ settings, updateSettings }}>
      {children}
    </InvoiceContext.Provider>
  );
};

// Custom hook for using context
export const useInvoiceSettings = () => {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error("useInvoiceSettings must be used within an InvoiceProvider");
  }
  return context;
};
