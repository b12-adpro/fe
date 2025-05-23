import type { TransactionType } from "../types"
import { ArrowDownCircleIcon, ArrowUpCircleIcon, GiftIcon } from "./icons"

interface TransactionIconProps {
  type: TransactionType
  className?: string
}

export const TransactionIcon = ({ type, className }: TransactionIconProps) => {
  switch (type) {
    case "TOP_UP":
      return (
        <span className={`text-green-500 ${className}`}>
          <ArrowDownCircleIcon />
        </span>
      )
    case "WITHDRAWAL":
      return (
        <span className={`text-red-500 ${className}`}>
          <ArrowUpCircleIcon />
        </span>
      )
    case "DONATION":
      return (
        <span className={`text-purple-500 ${className}`}>
          <GiftIcon />
        </span>
      )
    default:
      return null
  }
}

export const getTransactionLabel = (type: TransactionType): string => {
  switch (type) {
    case "TOP_UP":
      return "Top Up"
    case "WITHDRAWAL":
      return "Withdrawal"
    case "DONATION":
      return "Donation"
    default:
      return ""
  }
}

export const getTransactionColor = (type: TransactionType): string => {
  switch (type) {
    case "TOP_UP":
      return "text-green-600"
    case "WITHDRAWAL":
      return "text-red-600"
    case "DONATION":
      return "text-purple-600"
    default:
      return ""
  }
}
