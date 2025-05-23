"use client"

import type React from "react"
import { cn } from "../utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  children: React.ReactNode
}

export const Button = ({
  children,
  onClick,
  disabled = false,
  variant = "default",
  size = "default",
  className = "",
  ...props
}: ButtonProps) => {
  const baseStyles = "font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-md"

  const variantStyles = {
    default: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    outline: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500",
  }

  const sizeStyles = {
    default: "px-4 py-2",
    sm: "px-3 py-1 text-sm",
    lg: "px-6 py-3 text-lg",
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        disabled ? "opacity-50 cursor-not-allowed" : "",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
