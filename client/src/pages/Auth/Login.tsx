import { Link } from "react-router-dom"

export default function Login() {
  return (
    <div>
      <div className="flex flex-col items-center justify-center mt-8 mb-4">
        <img src="/sheetbills-logo.svg" alt="SheetBills Logo" className="h-12 w-auto mb-6" />
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-slate-500 font-normal font-cal-sans">
          By signing in, you agree to our{" "}
          <Link to="/legal" className="text-emerald-600 hover:text-emerald-700 font-medium font-cal-sans">
            Terms
          </Link>{" "}
          and{" "}
          <Link to="/legal" className="text-emerald-600 hover:text-emerald-700 font-medium font-cal-sans">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  )
} 