"use client"
import { cn } from "../utils"

interface RadioOption {
  value: string
  label: string
}

interface RadioGroupProps {
  name: string
  options: RadioOption[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export const RadioGroup = ({ name, options, value, onChange, className }: RadioGroupProps) => {
  return (
    <div className={cn("space-y-2", className)}>
      {options.map((option) => (
        <div key={option.value} className="flex items-center">
          <input
            id={`${name}-${option.value}`}
            name={name}
            type="radio"
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
          />
          <label htmlFor={`${name}-${option.value}`} className="ml-3 block text-sm font-medium text-gray-700">
            {option.label}
          </label>
        </div>
      ))}
    </div>
  )
}
