"use client"

import { useEffect, useState, useCallback } from "react"
import type { Wallet, Transaction, ApiResponse } from "./types"
import { WalletCard } from "./components/wallet-card"
import { TransactionList } from "./components/transaction-list"
import { TopUpModal } from "./components/top-up-modal"
import { ConfirmationModal } from "./components/confirmation-modal"
import { LoaderIcon, RefreshIcon, ErrorIcon, ChevronRightIcon } from "./components/icons"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_WALLET

export function WalletPageContent() {
  const { user, isAuthenticated, initialAuthCheckComplete, token } = useAuth()
  const router = useRouter()

  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false)
  const [confirmationState, setConfirmationState] = useState<{
    isOpen: boolean
    status: "success" | "error"
    amount?: number
    errorMessage?: string
  }>({ isOpen: false, status: "success" })

  const currentUserId = user?.id

  const fetchWalletData = useCallback(async () => {
    if (!currentUserId || !token) {
      console.log('[WalletPageContent] fetchWalletData: Aborting, no currentUserId or token. initialAuthCheckComplete:', initialAuthCheckComplete, 'isAuthenticated:', isAuthenticated);
      if (initialAuthCheckComplete && !isAuthenticated) {
        setLoadingData(false)
      }
      return
    }

    setLoadingData(true)
    setIsRefreshing(true)
    setError(null)

    try {
      const headers = { Authorization: `Bearer ${token}` }

      const walletRes = await fetch(`${API_BASE_URL}/wallet?userId=${currentUserId}`, { headers })
      if (!walletRes.ok) {
        if (walletRes.status === 401 || walletRes.status === 403) {
          return
        }
        const errorData = await walletRes.json().catch(() => ({}))
        throw new Error(errorData.message || `Error fetching wallet: ${walletRes.statusText}`)
      }
      const walletData: ApiResponse<Wallet> = await walletRes.json()
      setWallet(walletData.data)

      const transactionRes = await fetch(`${API_BASE_URL}/transaction/user/${currentUserId}`, { headers })
      if (!transactionRes.ok) {
        if (transactionRes.status === 401 || transactionRes.status === 403) {
          return
        }
        const errorData = await transactionRes.json().catch(() => ({}))
        throw new Error(errorData.message || `Error fetching transactions: ${transactionRes.statusText}`)
      }
      const transactionData: ApiResponse<Transaction[]> = await transactionRes.json()
      setTransactions(transactionData.data)
    } catch (err) {
      let errorMessage = "Failed to load wallet data. Please try again later."
      if (err instanceof Error) errorMessage = err.message
      setError(errorMessage)
      console.error("Fetch wallet data error:", err)
    } finally {
      setLoadingData(false)
      setIsRefreshing(false)
    }
  }, [currentUserId, token, initialAuthCheckComplete, isAuthenticated])

  const handleTopUp = async (amount: number) => {
    if (!currentUserId || !token) {
      setError("User not authenticated for top-up.")
      throw new Error("User not authenticated for top-up.")
    }

    try {
      const response = await fetch(`${API_BASE_URL}/wallet/topup?userId=${currentUserId}&amount=${amount}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to process top up." }))
        throw new Error(errorData.message || "Top up failed.")
      }

      setConfirmationState({ isOpen: true, status: "success", amount: amount })
      fetchWalletData();

    } catch (error) {
      setConfirmationState({
        isOpen: true,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Failed to process top up.",
      })
      throw error;
    }
  }

  useEffect(() => {
    console.log('[WalletPageContent] useEffect triggered. initialAuthCheckComplete:', initialAuthCheckComplete, 'isAuthenticated:', isAuthenticated, 'currentUserId:', currentUserId, 'token:', token ? 'present' : 'absent');
    if (initialAuthCheckComplete) {
      if (isAuthenticated && currentUserId) {
        console.log('[WalletPageContent] Conditions met, calling fetchWalletData.');
        fetchWalletData()
      } else if (!isAuthenticated) {
        console.log('[WalletPageContent] Not authenticated, redirecting to login.');
        router.push("/auth/login?redirect=/wallet")
      } else {
        console.log('[WalletPageContent] Else block hit: User info not fully loaded or other issue. currentUserId:', currentUserId);
        setLoadingData(false)
        setError("User information is not fully loaded. Please try refreshing.")
      }
    } else {
      console.log('[WalletPageContent] initialAuthCheckComplete is false, waiting...');
    }
  }, [initialAuthCheckComplete, isAuthenticated, currentUserId, router, fetchWalletData, token])

  if (!initialAuthCheckComplete) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center flex flex-col items-center justify-center min-h-[calc(100vh-var(--navbar-height,8rem))]">
        <LoaderIcon className="animate-spin h-12 w-12 text-green-600" />
        <p className="mt-4 text-gray-600">Initializing Wallet...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center min-h-[calc(100vh-var(--navbar-height,8rem))] flex flex-col items-center justify-center">
        <ErrorIcon className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-xl text-gray-700">You need to be logged in to view your wallet.</p>
        <Link
          href="/auth/login?redirect=/wallet"
          className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
          <h1 className="text-3xl font-bold text-gray-800">My Wallet</h1>
          <button
            onClick={fetchWalletData}
            disabled={isRefreshing || loadingData}
            className="px-4 py-2 flex items-center gap-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRefreshing || loadingData ? (
              <>
                {" "}
                <LoaderIcon className="animate-spin" /> <span>Refreshing...</span>{" "}
              </>
            ) : (
              <>
                {" "}
                <RefreshIcon /> <span>Refresh</span>{" "}
              </>
            )}
          </button>
        </div>
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

      {loadingData && !wallet && !error ? (
        <div className="bg-white rounded-lg shadow-md p-16 text-center">
          <div className="flex justify-center mb-4">
            {" "}
            <LoaderIcon className="animate-spin h-10 w-10" />{" "}
          </div>
          <p className="text-gray-600">Loading wallet data...</p>
        </div>
      ) : wallet ? (
        <>
          <WalletCard wallet={wallet} onTopUp={() => setIsTopUpModalOpen(true)} />
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
              <Link
                href="/transaction"
                className="text-green-600 hover:text-green-700 flex items-center gap-1 text-sm font-medium"
              >
                View All <ChevronRightIcon />
              </Link>
            </div>
            {transactions.length > 0 ? (
              <>
                <TransactionList transactions={transactions} limit={5} />
              </>
            ) : (
              <p className="text-gray-500 italic">No transactions yet.</p>
            )}
          </div>
        </>
      ) : (
        !error && <p className="text-gray-500 text-center">Could not load wallet information.</p>
      )}

      <TopUpModal isOpen={isTopUpModalOpen} onClose={() => setIsTopUpModalOpen(false)} onTopUp={handleTopUp} />
      <ConfirmationModal
        isOpen={confirmationState.isOpen}
        onClose={() => setConfirmationState({ ...confirmationState, isOpen: false })}
        status={confirmationState.status}
        amount={confirmationState.amount}
        currentBalance={wallet?.balance !== undefined ? wallet.balance : 0}
        errorMessage={confirmationState.errorMessage}
        onRetry={() => {
          setConfirmationState({ ...confirmationState, isOpen: false })
          setIsTopUpModalOpen(true)
        }}
      />
    </div>
  )
}
