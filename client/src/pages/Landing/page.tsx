import { CheckIcon } from "lucide-react";
import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { useNavigate } from "react-router-dom";

// Utils
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Button Component
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// Card Component
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

// Main App Component
const MacbookAir = (): React.ReactElement => {
  const navigate = useNavigate();

  const navItems = [
    { title: "Why SheetBills ?", width: "150px" },
    { title: "How it Works", width: "150px" },
    { title: "FAQs", width: "150px" },
  ];

  const benefitItems = [
    { text: "No more Scattered Files/Sheets" },
    { text: "No more Complex Invocie Generation" },
    { text: "No more Formulas" },

  ];

  return (
    <div className="flex flex-col items-center relative bg-white">
      {/* Responsive Header */}
      <header className="w-full bg-white  flex flex-col md:flex-row items-center justify-between px-4 py-2 md:px-6 md:py-3 gap-2 md:gap-0">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2">
          <img
            className="h-10 w-auto"
            alt="Sheetbills"
            src="/sheetbills-logo.svg"
          />
          <span className="font-normal text-green-800 text-xl">SheetBills</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col md:flex-row items-center gap-2 md:gap-6 mt-2 md:mt-0">
          {navItems.map((item, index) => (
            <div
              key={index}
              className="text-md md:text-md text-center"
              style={{ color: '#5C5B6A' }}
            >
              {item.title}
            </div>
          ))}
        </nav>

        {/* Button */}
        <div className="w-full md:w-auto mt-2 md:mt-0">
          <Button onClick={() => navigate('/login')} className="w-full md:w-auto bg-green-800 rounded-sm text-white text-sm">
            Login
          </Button>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center mt-20 w-full gap-y-8">

        <div className="flex flex-col items-center justify-center w-full gap-y-2">
          {/* Made for Google Sheets */}
          <div className="flex items-center space-x-2">
            <span className="font-normal text-sm" style={{ color: "#5C5B6A" }}>
              Made for
            </span>
            <span className="flex items-center bg-white  px-3 py-1 " >
              <img
                className="w-5 h-5 mr-2"
                alt="Google Sheets logo"
                src="/Google_Sheets_logo_(2014-2020).svg"
              />
              <span className="font-normal text-base" style={{ color: "#1EA952" }}>
                Google Sheets
              </span>
            </span>
          </div>

          {/* Heading and subheading */}
          <div className="flex flex-col items-center text-center w-full">
            <h1 className="font-cal-sans font-normal text-[56px] w-full">
              <span className="text-black font-normal">Stop </span>
              <span className="text-green-800 font-normal">Wrestling</span>
              <span className="text-black font-normal"> with</span>
              <br />
              <span className="text-green-800 font-normal">Invoices in Google Sheets ?</span>
            </h1>
            <p className="font-medium text-lg mt-2" style={{ color: "#5C5B6A" }}>
              Ditch the templates, formulas and frustration. SheetBills makes invoicing in<br />
              Google Sheets fast, simple and professional
            </p>
          </div>
        </div>

        {/* Benefit list */}
        <div className="flex flex-col justify-start gap-3">
          {benefitItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3"
            >
              <CheckIcon className="w-[20px] h-[20px] text-green-800" />
              <div className="font-extralight text-sm whitespace-nowrap" style={{ color: '#5C5B6A' }}>
                {item.text}
              </div>
            </div>
          ))}
        </div>

        {/* Try for Free button */}
        <Button onClick={() => navigate('/login')} className="flex w-60 items-center hover:bg-green-900 justify-center bg-green-800 rounded-sm text-white text-sm">
          Try for Free
        </Button>

      </main>
    </div>
  );
};

export default MacbookAir;
