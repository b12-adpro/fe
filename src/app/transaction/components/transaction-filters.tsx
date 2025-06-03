"use client"
import { Tabs } from "./tabs"

interface TransactionFiltersProps {
  activeFilter: string
  onFilterChange: (filter: string) => void
}

export const TransactionFilters = ({ activeFilter, onFilterChange }: TransactionFiltersProps) => {
  // All users can see all transaction types
  const tabs = [
    { id: "all", label: "All Transactions" },
    { id: "topup", label: "Top Ups" },
    { id: "donation", label: "Donations" },
    { id: "withdrawal", label: "Withdrawals" },
  ]

  return <Tabs tabs={tabs} activeTab={activeFilter} onChange={onFilterChange} className="mb-6" />
}
