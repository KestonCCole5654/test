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
                className="relative cursor-pointer w-[150px] h-[18px] mt-[-1.00px] [font-family:'Cal_Sans',Helvetica] font-normal text-gray-600 text-md text-center tracking-[0] leading-[normal] whitespace-nowrap"
                style={{ width: item.width }}
              >
                {item.title}
              </div>
            ))}
          </nav>

          <Button className="inline-flex items-center justify-center gap-2.5 px-[53px] py-3 relative flex-[0_0_auto] bg-green-800 rounded-sm text-white text-lg">
            Get Started
          </Button>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center gap-[33px] px-[123px] py-[35px] relative self-stretch w-full ">
        <div className="inline-flex items-center relative flex-[0_0_auto]">
          <div className="relative w-[138px] h-8 [font-family:'Cal_Sans',Helvetica] font-normal text-gray-600 text-xl text-center tracking-[0] leading-[normal]">
            Powered by
          </div>

          <Card className="relative w-[185px] h-[55px] bg-white rounded-[9px] overflow-hidden shadow-[0px_4px_4px_#1ea952a6]">
            <div className="flex w-[178px] items-center relative top-[9px] left-[7px]">
              <img
                className="relative w-[52px] h-[42px] object-contain"
                alt="Google Sheets logo"
                src="https://upload.wikimedia.org/wikipedia/commons/1/1a/Google_Sheets_2020_Logo.svg"
              />

              <div className="relative w-[107px] h-[22px] [font-family:'Cal_Sans',Helvetica] font-normal text-green-800 text-base text-center tracking-[0] leading-[normal]">
                Google Sheets
              </div>
            </div>
          </Card>
        </div>

        <section className="flex flex-col w-[849px] items-center gap-6 relative flex-[0_0_auto]">
          <h1 className="relative self-stretch h-[161px] mt-[-1.00px] [font-family:'Cal_Sans',Helvetica] font-normal text-transparent text-[50px] text-center tracking-[0] leading-[normal]">
            <span className="text-black">Tired of </span>
            <span className="text-green-800">Wrestling</span>
            <span className="text-black"> with </span>
            <span className="text-green-800">Invoices</span>
            <span className="text-black"> in </span>
            <span className="text-green-800">Google Sheets ?</span>
          </h1>

          <p className="relative w-[600px] h-[77px] [font-family:'Cal_Sans',Helvetica] font-normal text-gray-600 text-xl text-center tracking-[0] leading-[normal]">
            Ditch the templates. formulas and frustration. SheetBills makes
            invoicing in Google Sheets fast, simple and professional
          </p>
        </section>

        <div className="flex flex-col w-[210px] items-center justify-center gap-[11px] relative flex-[0_0_auto]">
          {benefitItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 relative self-stretch w-full flex-[0_0_auto]"
            >
              <CheckIcon className="w-[20px] h-[20px] text-green-800" />
              <div className="relative w-[154px] h-[15px] mt-[-1.00px] [font-family:'Cal_Sans',Helvetica] font-normal text-gray-600 text-[20px] tracking-[0] leading-[normal] whitespace-nowrap">
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
