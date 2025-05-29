import { CheckIcon } from "lucide-react";
import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

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
  const navItems = [
    { title: "Why SheetBills ?", width: "150px" },
    { title: "How it Works", width: "150px" },
    { title: "FAQs", width: "70px" },
  ];

  const benefitItems = [
    { text: "No more scattered files" },
    { text: "No more formulas" },
    { text: "No more copying and pasting" },
  ];

  return (
    <div className="flex flex-col items-center relative bg-white">
      <header className="flex flex-col items-center justify-center gap-2.5 px-6 py-3 relative self-stretch w-full  bg-white ">
        <div className="flex items-center justify-center gap-[217px] relative self-stretch w-full flex-[0_0_auto]">
          <div className="inline-flex items-center gap-[7px] relative flex-[0_0_auto]">
            <div className="flex flex-col w-[54px] items-start gap-2.5 px-0 py-3 relative">
              <img
                className="relative self-stretch w-full h-10"
                alt="Sheetbills"
                src="/sheetbills-logo.svg"
              />
            </div>

            <div className="relative w-fit [font-family:'Cal_Sans',Helvetica] font-normal text-green-800 text-xl tracking-[0] leading-[normal]">
              SheetBills
            </div>
          </div>

          <nav className="inline-flex items-center justify-center gap-[13px] relative flex-[0_0_auto]">
            {navItems.map((item, index) => (
              <div
                key={index}
                className="relative cursor-pointer w-[150px] h-[18px] mt-[-1.00px] [font-family:'Cal_Sans',Helvetica] font-normal text-md text-center tracking-[0] leading-[normal] whitespace-nowrap"
                style={{ width: item.width, color: '#5C5B6A' }}
              >
                {item.title}
              </div>
            ))}
          </nav>

          <Button className="inline-flex items-center justify-center gap-2.5 px-[45px] py-3 relative  bg-green-800 rounded-sm text-white font-normal text-md">
            Get Started
          </Button>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center align-middle gap-[33px] relative self-stretch w-full ">
        <div className="inline-flex items-center relative ">
          <div
            className="relative h-8 font-extralight text-sm text-center"
            style={{ color: "#5C5B6A" }}
          >
            Made for
          </div>

          <Card className="relative flex items-center ml-4 px-4 py-2 bg-white rounded-[12px] shadow-[0_4px_12px_#1ea95233]">
            <img
              className="w-8 h-8 object-contain mr-2"
              alt="Google Sheets logo"
              src="/Google_Sheets_logo_(2014-2020).svg"
            />
            <span
              className="font-normal text-md"
              style={{ color: "#1EA952" }}
            >
              Google Sheets
            </span>
          </Card>
        </div>

        <section className="flex flex-col items-center text-center justify-center gap-4 w-full">
          <h1 className="font-sans font-bold text-[56px] leading-tight w-full">
            <span className="text-black">Stop </span>
            <span className="text-green-800 font-normal">Wrestling</span>
            <span className="text-black"> with</span>
            <br />
            <span className="text-green-800 font-bold">Invoices in Google Sheets ?</span>
          </h1>
          <p
            className="font-medium text-lg mt-2"
            style={{ color: "#5C5B6A" }}
          >
            Ditch the templates, formulas and frustration. SheetBills makes invoicing in<br />
            Google Sheets fast, simple and professional
          </p>
        </section>

        <div className="flex flex-col w-[210px] items-center justify-center gap-[11px] relative flex-[0_0_auto]">
          {benefitItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 relative self-stretch w-full"
            >
              <CheckIcon className="w-[20px] h-[20px] text-green-800" />
              <div className="relative font-extralight text-sm whitespace-nowrap" style={{ color: '#5C5B6A' }}>
                {item.text}
              </div>
            </div>
          ))}
        </div>

        <Button className="flex w-60 items-center justify-center gap-2.5 px-[53px] py-[17px] relative flex-[0_0_auto] bg-green-800 rounded-sm text-white text-lg">
          Try for Free
        </Button>
      </main>
    </div>
  );
};

export default MacbookAir;
