import { CheckIcon } from "lucide-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { useNavigate } from "react-router-dom";
import { FileTextIcon, RefreshCwIcon, RocketIcon, ZapIcon } from "lucide-react";
import React from "react";
import { Card as CardComponent } from "../../components/ui/card";
import { CardContent } from "../../components/ui/card";

// Feature card data for mapping
const featureCards = [
  {
    icon: <ZapIcon className="w-[41px] h-[41px]" />,
    title: "Designed for Simplicity & Speed",
    description:
      "Transform your Google Sheets Into a powerful invoicing system. No more complex formulas or messy templates.",
  },
  {
    icon: <FileTextIcon className="w-[49px] h-[49px]" />,
    title: "Built on Google Sheets - No Extra Tools Needed",
    description:
      "Skip the learning curve! SheetBills works directly inside the Google Sheets you already use, so there's no need to install software or migrate data.",
  },
  {
    icon: <RefreshCwIcon className="w-[51px] h-[51px]" />,
    title: "Tired of Messy Invoice Spreadsheets?",
    description:
      "Stop battling copy-paste errors, broken formulas, and clunky templates.",
  },
  {
    icon: <RocketIcon className="w-[49px] h-[49px]" />,
    title: "Confused by Complex Invoicing Software?",
    description:
      "No need for heavy software — SheetBills simplifies invoicing right where you're already working: Google Sheets.",
  },
];


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
      <header className="max-w-7xl bg-white  flex flex-col md:flex-row items-center justify-between px-4 py-4 md:px-6 md:py-4 gap-2 md:gap-0">
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

      <section className="flex flex-col items-center justify-center mt-20 w-full gap-y-10">

        <div className="flex flex-col items-center justify-center w-full gap-y-2">
          {/* Made for Google Sheets */}
          <div className="flex items-center space-x-2">
            <span className="font-normal text-sm" style={{ color: "#5C5B6A" }}>
              Made for
            </span>
            <span className="flex items-center bg-white  px-3 py-1 " >
              <img
                className="w-5 h-5 mr-1"
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

      </section>

      <section className="flex flex-col items-center justify-center w-full gap-y-10">


       
          <div className="flex flex-col items-center gap-[30px]">
            <header className="flex flex-col items-center justify-center">
              <h2 className="text-xl text-green-800 [font-family:'Cal_Sans',Helvetica] font-normal">
                Why Us ?
              </h2>

              <div className="flex flex-col items-start">
                <h1 className="w-[686px] text-[50px] text-center [font-family:'Cal_Sans',Helvetica] font-normal">
                  <span className="text-green-800">Invoice</span>
                  <span className="text-black">
                    &nbsp;&nbsp;Creation&nbsp;&nbsp;Made{" "}
                  </span>
                  <span className="text-green-800">Simple</span>
                </h1>

                <p className="w-[686px] text-xl text-gray-600 text-center [font-family:'Cal_Sans',Helvetica] font-normal">
                  Transform your Google Sheets Into a powerful invoicing system. No
                  more complex formulas or messy templates.
                </p>
              </div>
            </header>

            <div className="flex w-[982px] items-center justify-center gap-[35px] px-[62px] py-[38px]">

              <div className="flex flex-col items-start gap-[35px] ml-[-17.50px]">
                <div className="flex flex-col items-start gap-[73px]">
                  {featureCards.slice(0, 2).map((card, index) => (
                    <CardComponent
                      key={index}
                      className="w-[434px] h-[284px] rounded-[10px] overflow-hidden"
                    >
                      <CardContent className="flex flex-col items-center gap-[7px] pt-5">
                        <div className="w-[102px] h-[95px] bg-white rounded-[9px] overflow-hidden border-4 border-solid border-green-800 shadow-[0px_4px_4px_#00000040] flex items-center justify-center">
                          {card.icon}
                        </div>
                        <h3 className="h-[45px] [font-family:'Cal_Sans',Helvetica] font-normal text-black text-[25px] text-center">
                          {card.title}
                        </h3>
                        <p className="h-[77px] [font-family:'Cal_Sans',Helvetica] font-normal text-gray-600 text-xl text-center">
                          {card.description}
                        </p>
                      </CardContent>
                    </CardComponent>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-start gap-[59px] mr-[-17.50px]">
                <div className="flex flex-col h-[655px] items-start gap-[70px]">
                  {featureCards.slice(2, 4).map((card, index) => (
                    <CardComponent
                      key={index}
                      className="w-[424px] h-[276px] rounded-[10px] overflow-hidden"
                    >
                      <CardContent className="flex flex-col items-center gap-[7px] pt-5">
                        <div className="w-[102px] h-[95px] bg-white rounded-[9px] overflow-hidden border-4 border-solid border-green-800 shadow-[0px_4px_4px_#00000040] flex items-center justify-center">
                          {card.icon}
                        </div>
                        <h3 className="h-[45px] [font-family:'Cal_Sans',Helvetica] font-normal text-black text-[25px] text-center">
                          {card.title}
                        </h3>
                        <p className="h-[77px] [font-family:'Cal_Sans',Helvetica] font-normal text-gray-600 text-xl text-center">
                          {card.description}
                        </p>
                      </CardContent>
                    </CardComponent>
                  ))}
                </div>
              </div>



            </div>
          </div>
      </section>




    </div>
  );
};

export default MacbookAir;
