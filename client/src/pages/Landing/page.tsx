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
    icon: <ZapIcon className="w-[35px] h-[35px] " />,
    title: "Designed for Simplicity & Speed",
    description:
      "Transform your Google Sheets Into a powerful invoicing system. No more complex formulas or messy templates.",
  },
  {
    icon: <FileTextIcon className="w-[49px] h-[49px]" />,
    title: "Google Sheets Powered",
    description:
      "Skip the learning curve! SheetBills works directly inside the Google Sheets you already use, so there's no need to install software or migrate data.",
  },
  {
    icon: <RefreshCwIcon className="w-[51px] h-[51px]" />,
    title: "No More Messy Invoice Spreadsheets",
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
      <header className="max-w-7xl bg-white flex items-center justify-between px-4 py-4 md:px-6 md:py-4 w-full">
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
        <nav className="flex items-center gap-8">
          <span className="text-md text-[#5C5B6A]">Why SheetBills ?</span>
          <span className="text-md text-[#5C5B6A]">How it Works</span>
          <span className="text-md text-[#5C5B6A]">FAQs</span>
        </nav>

        {/* Button */}
        <Button onClick={() => navigate('/login')} className="bg-green-800 rounded-sm text-white text-sm px-6 py-2">
          Login
        </Button>
      </header>

      <section className="flex flex-col items-center justify-center mt-20 w-full gap-y-10">

        <div className="flex flex-col items-center justify-center w-full gap-y-2">
          {/* Made for Google Sheets */}
          <div className="flex items-center space-x-2">
            <span className="font-normal text-sm" style={{ color: "#5C5B6A" }}>
              Made for
            </span>
            <span className="flex items-center   bg-white  px-1 py-1 " >
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
            <h1 className="font-cal-sans font-normal leading-tight text-[56px] w-full">
              <span className="text-black font-normal">Stop </span>
              <span className="text-green-800 font-normal">Wrestling</span>
              <span className="text-black font-normal"> with</span>
              <br />
              <span className="text-green-800 font-normal">Invoices in Google Sheets ?</span>
            </h1>

            <p className="font-medium text-lg pt-6" style={{ color: "#5C5B6A" }}>
              Ditch the templates, formulas and frustration. SheetBills makes invoicing in<br />
              Google Sheets fast, simple and professional
            </p>
          </div>
        </div>

        {/* Benefit list */}
        <div className="flex flex-col max-w-2xl justify-start gap-3">
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

        {/* Social Proof/Testimonial */}
        <div className="flex items-center gap-4 ">
          {/* Avatars */}
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((n, i) => (
              <img
                key={i}
                src="https://www.shutterstock.com/image-photo/smiling-african-american-millennial-businessman-600nw-1437938108.jpg"
                alt={`User ${n}`}
                className={`w-10 h-10 rounded-full object-cover ring-2 ring-white shadow ${i !== 0 ? '-ml-3' : ''}`}
                style={{ background: "#eee" }}
              />
            ))}
          </div>

          <div className="flex flex-col ">


            {/* Stars */}
            <div className="flex pl-2 text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <svg key={i} xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" className="w-5 h-5">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.385-2.46c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
                </svg>
              ))}
            </div>

            {/* Text */}
            <span className="ml-2 text-lg"><span className="font-normal">Join</span> 250+ Satisfied Users</span>

          </div>

        </div>

      </section>

      <section className="flex flex-col items-center justify-center pt-40 w-full gap-y-10">
        <div className="flex flex-col items-center gap-[30px]">
          <header className="flex flex-col items-center justify-center">
            <h2 className="text-lg text-green-800 font-cal-sans font-normal">
              Why Us ?
            </h2>
            <div className="flex flex-col justify-center gap-y-2 items-center">
              <h1 className="w-[686px] text-[50px] text-center font-cal-sans font-normal">
                <span className="text-green-800">Invoice</span>
                <span className="text-green-800"> Creation</span>
                <span className="text-black"> Made </span>

                <span className="text-green-800">Simple</span>
              </h1>
              <p className="w-[600px] text-lg text-gray-600 text-center font-cal-sans font-normal">
                Transform your Google Sheets Into a powerful invoicing system. No
                more complex formulas or messy templates.
              </p>
            </div>
          </header>

          <div className="flex max-w-4xl items-center justify-center gap-5 px-5 py-5">

            {/* First Column */}
            <div className="flex  flex-col items-start ">
              <div className="flex flex-col items-start gap-y-4">
                {featureCards.slice(0, 2).map((card, index) => (
                  <CardComponent
                    key={index}
                    className="max-w-md  border-none"
                  >
                    <CardContent className="flex  border border-gray-200 rounded-md  flex-col items-center gap-[7px]">
                      <div className=" bg-white  border-green-800 p-8 flex items-center justify-center">
                        {card.icon}
                      </div>
                      <h3 className=" font-normal text-black text-2xl text-center">
                        {card.title}
                      </h3>
                      <p className="font-normal text-gray-600 text-md max-w-sm text-center">
                        {card.description}
                      </p>
                    </CardContent>
                  </CardComponent>
                ))}
              </div>
            </div>

            {/* Second Column */}
            <div className="flex  flex-col items-start ">
              <div className="flex flex-col items-start gap-y-4">
                {featureCards.slice(0, 2).map((card, index) => (
                  <CardComponent
                    key={index}
                    className="max-w-md  border-none"
                  >
                    <CardContent className="flex border border-gray-200 rounded-md flex-col items-center gap-[7px]">
                      <div className=" bg-white   p-8 flex items-center justify-center">
                        {card.icon}
                      </div>
                      <h3 className=" font-normal  text-2xl text-center">
                        {card.title}
                      </h3>
                      <p className="font-normal text-gray-600 text-md max-w-sm text-center">
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
