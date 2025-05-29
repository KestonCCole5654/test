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

      {/* Why Us Section */}
      <section className="flex flex-col items-center justify-center pt-40 pb-20 w-full gap-y-10">
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
              <p className="w-[600px] text-lg text-gray-600 pb-10 text-center font-cal-sans font-normal">
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

      {/* How it Works Section */}
      <section className="flex flex-col items-center justify-center w-full pb-10 py-8">
        <div className="flex flex-col md:flex-col items-center justify-center w-full max-w-7xl px-4 gap-8">
          {/* Left: Subtitle and Heading */}
          <div className="flex-1 flex flex-col justify-center items-center">
            <span className="text-green-800 font-normal text-md mb-2">How it Works ?</span>
            <h2 className="text-5xl font-extrabold text-gray-800 ">
              Built For Freelancers & Small Businesses
            </h2>
          </div>
          
          {/* Right: Description and Button */}
          <div className="flex-1 flex flex-col items-center md:items-center">
            <p className="text-gray-700 text-md text-center md:text-center mb-6 max-w-2xl">
              SheetBills makes creating and managing invoices easy with a simple streamlined process that takes you from sign-up to sending professional invoices in just a few steps
            </p>
          </div>
        </div>

        {/* Step 1 Row */}
        <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-6xl px-4 gap-8 mt-16">
          {/* Left: Just the provided image */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <img src="/step1.png" alt="How it works visual" className="w-full max-w-xs md:max-w-sm rounded-lg shadow" />
          </div>

          {/* Right: Step Number and Description */}
          <div className="flex-1 flex flex-col items-center md:items-center">
            <div className="text-[120px] font-bold text-green-800 leading-none mb-2">01</div>
            <div className="text-2xl font-normal mb-2 text-center md:text-center">Sign In with Google — That's It.</div>
            <div className="text-gray-700 text-md max-w-2xl text-center md:text-center">
            Skip the signup struggle. With Google sign-in, you're in — fast, secure, and ready to generate invoices immediately.
            </div>
          </div>
        </div>


        {/* Step 2 Row */}
        <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-6xl px-4 gap-8 mt-16">
          {/* Right: Step Number and Description */}
          <div className="flex-1 flex flex-col items-center md:items-center">
            <div className="text-[120px] font-bold text-green-800 leading-none mb-2">02</div>
            <div className="text-2xl font-normal mb-2 text-center md:text-center">Set Up Your Business Details</div>
            <div className="text-gray-700 text-md max-w-2xl text-center md:text-center">
              Set up your business info once — We'll Handle the Rest. Enjoy perfectly branded invoices every time — no extra steps needed
            </div>
          </div>

            {/* Left: Just the provided image */}
            <div className="flex-1 flex flex-col items-center justify-center">
            <img src="/step2.png" alt="How it works visual" className="w-full max-w-xs md:max-w-sm rounded-lg shadow" />
          </div>
        </div>

         {/* Step 3 Row */}
        <div className="flex flex-col pt-10 md:flex-row items-center justify-center w-full max-w-6xl px-4 gap-8 mt-16">
          {/* Left: Just the provided image */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <img src="/Step3.png" alt="How it works visual" className="w-full max-w-xs md:max-w-sm rounded-lg shadow" />
          </div>

          {/* Right: Step Number and Description */}
          <div className="flex-1 flex flex-col items-center md:items-center">
            <div className="text-[120px] font-bold text-green-800 leading-none mb-2">03</div>
            <div className="text-2xl font-normal mb-2 text-center md:text-center">Create Your First Invoice</div>
            <div className="text-gray-700 text-md max-w-2xl text-center md:text-center">
            It's That Simple. Add your client's details, enter the items, and SheetBills will craft a polished, branded invoice ready to share or print.
            </div>
          </div>
        </div>

         {/* Step 4 Row */}
         <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-6xl px-4 gap-8 mt-16">
          {/* Right: Step Number and Description */}
          <div className="flex-1 flex flex-col items-center md:items-center">
            <div className="text-[120px] font-bold text-green-800 leading-none mb-2">04</div>
            <div className="text-2xl font-normal mb-2 text-center md:text-center">Done! Now Share, Edit or Print Your Invoice</div>
            <div className="text-gray-700 text-md max-w-2xl text-center md:text-center">
            Whether you want to email a live and secure invoice link or hand over a printed copy, SheetBills makes it easy. 
        
            </div>
          </div>

            {/* Left: Just the provided image */}
            <div className="flex-1 pt-10 flex flex-col items-center justify-center">
            <img src="/step5.png" alt="How it works visual" className="w-full max-w-xs md:max-w-sm bg-white" />
          </div>
        </div>
      </section>

  

         {/* Pricing Section */}
         <section className="w-full bg-white py-20 flex flex-col items-center">
        <h2 className="text-4xl md:text-4xl font-extrabold leading-loose text-gray-800 text-center mb-4"> Quit Wasting In Google Sheets, <br /> Get Your SheetBills Free Plan</h2>
        <p className="text-lg md:text-lg text-gray-600 text-center mb-10 max-w-2xl">All the essentials for $0.00 — forever. <span className='text-green-800 font-normal'> <br/> Paid plans with advanced features are coming soon!</span></p>
        <div className="flex flex-col items-center w-full">
          <div className="relative bg-white border-2 border-green-800 rounded-2xl shadow p-8 max-w-md w-full flex flex-col items-center mb-8">
            {/* Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-800 text-white text-sm font-normal px-4 py-1 rounded-full">SheetBills Essentials</div>
            {/* Price */}
            <div className="flex items-end gap-2 mb-2 mt-4">
              
              <span className="text-5xl font-normal text-gray-800">$0.00</span>
              <span className="text-gray-500 font-normal mb-1 ml-1">USD</span>
            </div>
            {/* Features */}
            <ul className="w-full space-y-3 text-base mb-6 mt-2">
              <li className="flex items-center text-gray-800"><span className="text-green-800 mr-2">✔</span> Unlimited invoices</li>
              <li className="flex items-center text-gray-800"><span className="text-green-800 mr-2">✔<span className='bg-green-100 text-green-800 px-2 py-0.5 rounded mr-1 text-sm font-normal'>Unlimited</span></span> Invoice Link Generation</li>
              <li className="flex items-center text-gray-800"><span className="text-green-800 mr-2">✔</span>  Automatic formatting — no templates or formulas</li>
            </ul>
            {/* CTA Button */}
            <Button onClick={() => navigate('/login')} className="w-full bg-green-800 hover:bg-green-900 rounded-lg text-white py-2 mb-3 font-Normal flex items-center justify-center gap-2">Get SheetBills <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor' className='w-5 h-5'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 8l4 4m0 0l-4 4m4-4H3' /></svg></Button>
            {/* Note */}
            <div className="text-xs text-gray-600 text-center">This is SheetBills free plan, <a href="/login" className="underline text-green-800">it's yours forever</a></div>
          </div>
        </div>
      </section>
      
      {/* FAQs Section */}
      <section className="w-full bg-white py-20 flex flex-col items-center">
        <h2 className="text-4xl font-extrabold text-gray-800 text-center mb-12">Frequently Asked Questions</h2>
        <div className="w-full max-w-2xl mx-auto divide-y divide-gray-200">
          {/* FAQ 1 - open by default */}
          <details open className="group py-6">
            <summary className="flex items-center justify-between cursor-pointer  font-normal text-lg focus:outline-none">
              <span>How do you bill your servers?</span>
              <span className="ml-2">
                <svg className="w-6 h-6 text-green-800 group-open:block hidden" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </span>
            </summary>
            <div className="mt-4 text-gray-700 text-base">
              Servers have both a monthly price cap and a price per hour. Your server's bill will never exceed its monthly price cap. If you delete your Cloud Server before the end of the billing month, you will only be billed the hourly rate. We will bill you for each cloud server until you choose to delete them. Even if you aren't actively using your server, we will bill you for it.
            </div>
          </details>
          {/* FAQ 2 */}
          <details className="group py-6">
            <summary className="flex items-center justify-between cursor-pointer text-lg text-gray-800 font-medium focus:outline-none">
              <span>Do you bill servers that are off?</span>
              <span className="ml-2">
                <svg className="w-6 h-6 text-green-800 group-open:hidden" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                <svg className="w-6 h-6 text-green-800 group-open:block hidden" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </span>
            </summary>
            <div className="mt-4 text-gray-700 text-base">
              Yes, servers that are off are still billed until they are deleted from your account.
            </div>
          </details>
          {/* FAQ 3 */}
          <details className="group py-6">
            <summary className="flex items-center justify-between cursor-pointer text-lg text-gray-800 font-medium focus:outline-none">
              <span>Is there any way to get a custom configuration?</span>
              <span className="ml-2">
                <svg className="w-6 h-6 text-green-800 group-open:hidden" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                <svg className="w-6 h-6 text-green-800 group-open:block hidden" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </span>
            </summary>
            <div className="mt-4 text-gray-700 text-base">
              Yes, you can contact our support team to discuss custom configurations for your needs.
            </div>
          </details>
          {/* FAQ 4 */}
          <details className="group py-6">
            <summary className="flex items-center justify-between cursor-pointer text-lg text-gray-800 font-medium focus:outline-none">
              <span>How reliable are local storage disks for servers?</span>
              <span className="ml-2">
                <svg className="w-6 h-6 text-green-800 group-open:hidden" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                <svg className="w-6 h-6 text-green-800 group-open:block hidden" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </span>
            </summary>
            <div className="mt-4 text-gray-700 text-base">
              Our local storage disks are enterprise-grade and highly reliable, but we always recommend regular backups for mission-critical data.
            </div>
          </details>
        </div>
      </section>


     

 

    </div>
  );
};

export default MacbookAir;
