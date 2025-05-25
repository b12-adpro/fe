import type React from "react"
import { cn } from "../utils"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string
}

export const Input = ({ id, className = "", ...props }: InputProps) => (
  <input
    id={id}
    className={cn(
      "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500",
      className,
    )}
    {...props}
  />
)

export const Label = ({
  htmlFor,
  children,
  className = "",
}: {
  htmlFor: string
  children: React.ReactNode
  className?: string
}) => (
  <label htmlFor={htmlFor} className={cn("block text-sm font-medium text-gray-700", className)}>
    {children}
  </label>
)
