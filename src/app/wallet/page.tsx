"use client"

import { useEffect, useState } from "react"
import type { Wallet, Transaction, ApiResponse, UserRole } from "./types"
import { WalletCard } from "./components/wallet-card"
import { TransactionList } from "./components/transaction-list"
import { TopUpModal } from "./components/top-up-modal"
import { ConfirmationModal } from "./components/confirmation-modal"
import { LoaderIcon, RefreshIcon, ErrorIcon, ChevronRightIcon } from "./components/icons"
import Link from "next/link"

const API_BASE_URL = "https://comfortable-tonia-aryaraditya-081c5726.koyeb.app/api"

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [userRole, setUserRole] = useState<UserRole>("Donatur")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false)
  const [confirmationState, setConfirmationState] = useState<{
    isOpen: boolean
    status: "success" | "error"
    amount?: number
    errorMessage?: string
  }>({
    isOpen: false,
    status: "success",
  })

  const userId = "550e8400-e29b-41d4-a716-044665544000"

  const fetchUserRole = async () => {
    try {
      // Menunggu API dari multiservice lain
      // const response = await fetch(`${API_BASE_URL}/user/${userId}/role`)
      // if (response.ok) {
      //   const data = await response.json()
      //   setUserRole(data.role)
      // } else {
      //   setUserRole("Donatur") // Default fallback
      // }

      // For now, set default value
      setUserRole("Donatur")
    } catch (error) {
      console.error("Failed to fetch user role:", error)
      setUserRole("Donatur") // Default fallback
    }
  }

  // Fetch wallet data directly in the wallet page
  const fetchWalletData = async () => {
    try {
      setIsRefreshing(true)

      // Fetch user role
      await fetchUserRole()

      // Fetch wallet data
      const walletRes = await fetch(`${API_BASE_URL}/wallet?userId=${userId}`)

      if (!walletRes.ok) {
        throw new Error(`Error: ${walletRes.status} ${walletRes.statusText}`)
      }

      const walletData: ApiResponse<Wallet> = await walletRes.json()
      setWallet(walletData.data)

      // Fetch transaction data
      const transactionRes = await fetch(`${API_BASE_URL}/transaction/user/${userId}`)

      if (!transactionRes.ok) {
        throw new Error(`Error: ${transactionRes.status} ${transactionRes.statusText}`)
      }

      const transactionData: ApiResponse<Transaction[]> = await transactionRes.json()
      setTransactions(transactionData.data)

      setError(null)
    } catch (error) {
      console.error("Failed to fetch data:", error)
      setError("Failed to load wallet data. Please try again later.")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleTopUp = async (amount: number, method: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/wallet/topup?userId=${userId}&amount=${amount}`, {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to process top up. Please try again.")
      }

      const data: ApiResponse<Wallet> = await response.json()
      setWallet(data.data)

      // Refresh transactions after top up
      const transactionRes = await fetch(`${API_BASE_URL}/transaction/user/${userId}`)
      const transactionData: ApiResponse<Transaction[]> = await transactionRes.json()
      setTransactions(transactionData.data)

      // Show success confirmation
      setConfirmationState({
        isOpen: true,
        status: "success",
        amount: amount,
      })
    } catch (error: any) {
      // Show error confirmation
      setConfirmationState({
        isOpen: true,
        status: "error",
        errorMessage: error.message || "Failed to process top up. Please try again.",
      })
    } finally {
      setIsTopUpModalOpen(false)
    }
  }

  useEffect(() => {
    fetchWalletData()
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Wallet</h1>

          <button
            onClick={fetchWalletData}
            disabled={isRefreshing}
            className="px-4 py-2 flex items-center gap-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {isRefreshing ? (
              <>
                <LoaderIcon />
                <span>Refreshing...</span>
              </>
            ) : (
              <>
                <RefreshIcon />
                <span>Refresh</span>
              </>
            )}
          </button>
        </div>
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
          <p className="text-gray-600">Loading wallet data...</p>
        </div>
      ) : (
        <>
          {/* Wallet Card */}
          {wallet && <WalletCard wallet={wallet} onTopUp={() => setIsTopUpModalOpen(true)} />}

          {/* Transaction List */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Transaction History</h2>
              <Link
                href="/transaction"
                className="text-green-600 hover:text-green-700 flex items-center gap-1 text-sm font-medium"
              >
                View All <ChevronRightIcon />
              </Link>
            </div>

            <TransactionList transactions={transactions} limit={3} />
          </div>
        </>
      )}

      {/* Top Up Modal */}
      <TopUpModal isOpen={isTopUpModalOpen} onClose={() => setIsTopUpModalOpen(false)} onTopUp={handleTopUp} />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationState.isOpen}
        onClose={() => setConfirmationState({ ...confirmationState, isOpen: false })}
        status={confirmationState.status}
        amount={confirmationState.amount}
        currentBalance={wallet?.balance || 0}
        errorMessage={confirmationState.errorMessage}
        onRetry={() => {
          setConfirmationState({ ...confirmationState, isOpen: false })
          setIsTopUpModalOpen(true)
        }}
      />
    </div>
  )
}
