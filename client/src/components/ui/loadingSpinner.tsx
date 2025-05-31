import React from "react"
import { cn } from "../../lib/utils"

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function LoadingSpinner({ className, ...props }: LoadingSpinnerProps) {
  return (
    <div
      className={cn("animate-spin rounded-full border-4 border-gray-200 border-t-green-800", className)}
      {...props}
    />
  )
}

export default LoadingSpinner;