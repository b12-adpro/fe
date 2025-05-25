"use client"
import { Tabs } from "./tabs"
import type { UserRole } from "../types"

interface TransactionFiltersProps {
  activeFilter: string
  onFilterChange: (filter: string) => void
  userRole: UserRole
}

export const TransactionFilters = ({ activeFilter, onFilterChange, userRole }: TransactionFiltersProps) => {
  const donaturTabs = [
    { id: "all", label: "All Transactions" },
    { id: "donation", label: "Donations" },
    { id: "topup", label: "Top Ups" },
  ]

  const fundraiserTabs = [{ id: "withdrawals", label: "Withdrawals" }]

  const tabs = userRole === "Donatur" ? donaturTabs : fundraiserTabs

  return <Tabs tabs={tabs} activeTab={activeFilter} onChange={onFilterChange} className="mb-6" />
}
