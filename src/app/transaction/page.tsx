"use client"

import { useEffect, useState, useCallback } from "react"
import type { Transaction, ApiResponse } from "./types"
import { TransactionList } from "./components/transaction-list"
import { TransactionFilters } from "./components/transaction-filters"
import { LoaderIcon, ErrorIcon } from "./components/icons"

const API_BASE_URL = "https://comfortable-tonia-aryaraditya-081c5726.koyeb.app/api"

export default function TransactionPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState("all")

  // In a real app, this would come from authentication
  const userId = "550e8400-e29b-41d4-a716-044665544000"

  // Fetch transactions directly in the transactions page
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true)

      const response = await fetch(`${API_BASE_URL}/transaction/user/${userId}`)

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`)
      }

      const data: ApiResponse<Transaction[]> = await response.json()
      setTransactions(data.data)
      applyFilter(data.data, activeFilter)
      setError(null)
    } catch (error) {
      console.error("Failed to fetch transactions:", error)
      setError("Failed to load transactions. Please try again later.")
    } finally {
      setLoading(false)
    }
  }, [userId, activeFilter])

  const applyFilter = (data: Transaction[], filter: string) => {
    switch (filter) {
      case "topup":
        setFilteredTransactions(data.filter((t) => t.type === "TOP_UP"))
        break
      case "donation":
        setFilteredTransactions(data.filter((t) => t.type === "DONATION"))
        break
      case "withdrawal":
        setFilteredTransactions(data.filter((t) => t.type === "WITHDRAWAL"))
        break
      default:
        setFilteredTransactions(data)
    }
  }

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter)
    applyFilter(transactions, filter)
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/transaction/${transactionId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`)
      }

      // Refresh transactions after deletion
      fetchTransactions()
    } catch (error) {
      console.error("Failed to delete transaction:", error)
      setError("Failed to delete transaction. Please try again.")
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">All Transactions</h1>

        <TransactionFilters activeFilter={activeFilter} onFilterChange={handleFilterChange} />
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-start">
          <ErrorIcon />
          <div>{error}</div>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-16 text-center">
          <div className="flex justify-center mb-4">
            <LoaderIcon />
          </div>
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      ) : (
        <TransactionList transactions={filteredTransactions} showDelete={true} onDelete={handleDeleteTransaction} />
      )}
    </div>
  )
}
