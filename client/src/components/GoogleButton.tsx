"use client"

import type React from "react"

interface GoogleButtonProps {
  onClick?: () => void
  loading?: boolean
  disabled?: boolean
  text?: string
  className?: string
}

const GoogleButton: React.FC<GoogleButtonProps> = ({
  onClick,
  loading = false,
  disabled = false,
  text = "Continue with Google",
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center
        bg-[#4285F4] hover:bg-[#3367D6] active:bg-[#2C5AA0]
        text-white font-medium text-base
        rounded-full
        px-6 py-3
        transition-all duration-200
        shadow-md hover:shadow-lg
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:ring-offset-2
        ${className}
      `}
    >
      {/* Google Logo Container */}
      <div className="flex items-center justify-center w-5 h-5 bg-white rounded-full mr-3 flex-shrink-0">
        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
          <path
            fill="#4285F4"
            d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18Z"
          />
          <path
            fill="#34A853"
            d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-2.7.75c-2.09 0-3.87-1.4-4.5-3.32H1.83v2.07A7.98 7.98 0 0 0 8.98 17Z"
          />
          <path fill="#FBBC05" d="M4.48 10.45a4.77 4.77 0 0 1 0-3.09V5.29H1.83a7.98 7.98 0 0 0 0 7.24l2.65-2.08Z" />
          <path
            fill="#EA4335"
            d="M8.98 4.72c1.17 0 2.23.4 3.06 1.2l2.3-2.3A7.95 7.95 0 0 0 8.98 1a7.98 7.98 0 0 0-7.15 4.29l2.65 2.07c.63-1.92 2.41-3.32 4.5-3.32Z"
          />
        </svg>
      </div>

      {/* Button Text */}
      <span className="whitespace-nowrap">{loading ? "Signing in..." : text}</span>

      {/* Loading Spinner */}
      {loading && <div className="ml-2 w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
    </button>
  )
}

export default GoogleButton 