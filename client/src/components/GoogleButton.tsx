"use client"

import type React from "react"


interface GoogleButtonProps {
  onClick?: () => void
  loading?: boolean
  disabled?: boolean
  text?: string
  className?: string
  href?: string
}

const GoogleButton: React.FC<GoogleButtonProps> = ({
  onClick,
  loading = false,
  disabled = false,
  text = "Sign up with Google",
  className = "",
  href,
}) => {
  const buttonContent = (
    <>
      {/* Google Logo Container */}
      <div className="absolute left-1 z-20 mr-6 inline h-[42px] w-[42px]">
        <img
          alt="Sign up with Google"
          src="https://copper-nextjs.s3.amazonaws.com/icons/google-logo.webp"
          className="object-cover"
          sizes="42px"
        />
      </div>

      {/* Button Text */}
      <span className="mx-auto my-auto min-w-60 pl-7 text-center text-base font-medium md:pl-14 md:pr-4 md:text-left">
        {loading ? "Signing in..." : text}
      </span>

      {/* Loading Spinner */}
      {loading && <div className="ml-2 w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
    </>
  )

  const commonClasses = `
    relative mb-6 flex h-[52px] w-[240px] overflow-hidden
    rounded-full border border-green-800 bg-green-800
    p-1 text-sm text-white transition-colors
    hover:bg-transparent hover:text-green-800 hover:no-underline
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-green-800 focus:ring-offset-2
    ${className}
  `

  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={commonClasses}
        style={{ width: '240px' }}
      >
        {buttonContent}
      </a>
    )
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={commonClasses}
      style={{ width: '240px' }}
    >
      {buttonContent}
    </button>
  )
}

export default GoogleButton 