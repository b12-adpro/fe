"use client"

import { useEffect, useState, useCallback } from "react"
import type { Transaction, ApiResponse } from "./types"
import { TransactionList } from "./components/transaction-list"
import { TransactionFilters } from "./components/transaction-filters"
import { LoaderIcon, ErrorIcon } from "./components/icons"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_WALLET
export function TransactionPageContent() {
  const { user, isAuthenticated, initialAuthCheckComplete, token, logout } = useAuth()
  const router = useRouter()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState("all")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const currentUserId = user?.id

  const fetchTransactions = useCallback(async () => {
    if (!currentUserId || !token) {
      console.log('[TransactionPageContent] fetchTransactions: Aborting, no currentUserId or token. initialAuthCheckComplete:', initialAuthCheckComplete, 'isAuthenticated:', isAuthenticated);
      if (initialAuthCheckComplete && !isAuthenticated) {
        setLoading(false)
      }
      return
    }

    setLoading(true)
    setIsRefreshing(true)
    setError(null)

    try {
      const headers = { Authorization: `Bearer ${token}` }

      const response = await fetch(`${API_BASE_URL}/transaction/user/${currentUserId}`, { headers })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          logout()
          return
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`)
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
      setIsRefreshing(false)
    }
  }, [currentUserId, token, activeFilter, initialAuthCheckComplete, isAuthenticated, logout])

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
    if (!token) {
      setError("User not authenticated for deletion.")
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/transaction/${transactionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          logout()
          return
        }
        throw new Error(`Error: ${response.status} ${response.statusText}`)
      }

      // Refresh transactions after deletion
      fetchTransactions()
    } catch (error) {
      console.error("Failed to delete transaction:", error)
      setError("Failed to delete transaction. Please try again.")
    }
  }

  const handleRefresh = () => {
    fetchTransactions()
  }

  useEffect(() => {
    console.log('[TransactionPageContent] useEffect triggered. initialAuthCheckComplete:', initialAuthCheckComplete, 'isAuthenticated:', isAuthenticated, 'currentUserId:', currentUserId, 'token:', token ? 'present' : 'absent');
    if (initialAuthCheckComplete) {
      if (isAuthenticated && currentUserId) {
        console.log('[TransactionPageContent] Conditions met, calling fetchTransactions.');
        fetchTransactions()
      } else if (!isAuthenticated) {
        console.log('[TransactionPageContent] Not authenticated, redirecting to login.');
        router.push("/auth/login?redirect=/transaction")
      } else {
        console.log('[TransactionPageContent] Else block hit: User info not fully loaded or other issue. currentUserId:', currentUserId);
        setLoading(false)
        setError("User information is not fully loaded. Please try refreshing.")
      }
    } else {
      console.log('[TransactionPageContent] initialAuthCheckComplete is false, waiting...');
    }
  }, [initialAuthCheckComplete, isAuthenticated, currentUserId, router, fetchTransactions, token])

  if (!initialAuthCheckComplete) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center flex flex-col items-center justify-center min-h-[400px]">
        <LoaderIcon className="animate-spin h-12 w-12 text-green-600" />
        <p className="mt-4 text-gray-600">Initializing Transactions...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center min-h-[400px] flex flex-col items-center justify-center">
        <div className="mb-4">
          <ErrorIcon className="h-12 w-12 text-red-500" />
        </div>
        <p className="text-xl text-gray-700 mb-4">You need to be logged in to view your transactions.</p>
        <Link
          href="/auth/login?redirect=/transaction"
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Go to Login
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">All Transactions</h1>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            className="px-4 py-2 flex items-center gap-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRefreshing || loading ? (
              <>
                <LoaderIcon className="animate-spin" />
                <span>Refreshing...</span>
              </>
            ) : (
              <>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </>
            )}
          </button>
        </div>

        <TransactionFilters activeFilter={activeFilter} onFilterChange={handleFilterChange} />
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-start gap-3">
          <ErrorIcon className="h-5 w-5 mt-1" />
          <div>
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {loading && !transactions.length && !error ? (
        <div className="bg-white rounded-lg shadow-md p-16 text-center">
          <div className="flex justify-center mb-4">
            <LoaderIcon className="animate-spin h-10 w-10" />
          </div>
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      ) : (
        <TransactionList transactions={filteredTransactions} showDelete={true} onDelete={handleDeleteTransaction} />
      )}
    </div>
  )
}
