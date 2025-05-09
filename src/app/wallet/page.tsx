"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

interface Wallet {
  id: string
  userId: string
  balance: number
}

type TransactionType = "TOP_UP" | "WITHDRAWAL" | "DONATION"

interface Transaction {
  id: string
  type: TransactionType
  amount: number
  timestamp: string
  wallet: Wallet
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

const LoaderIcon = () => (
  <svg
    className="animate-spin"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)

const RefreshIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

const ArrowDownCircleIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v8" />
    <path d="m8 12 4 4 4-4" />
  </svg>
)

const ArrowUpCircleIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16V8" />
    <path d="m8 12 4-4 4 4" />
  </svg>
)

const GiftIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 12v10H4V12" />
    <path d="M2 7h20v5H2z" />
    <path d="M12 22V7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
)

const ErrorIcon = () => (
  <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
      clipRule="evenodd"
    />
  </svg>
)

const Button = ({
  children,
  onClick,
  disabled = false,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: "default" | "outline"
  className?: string
}) => {
  const baseStyles =
    "px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
  const variantStyles =
    variant === "default"
      ? "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500"

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </button>
  )
}

const Dialog = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}) => {
  if (!isOpen) return null

  return typeof document !== "undefined"
    ? createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={onClose} />
          <div className="z-10 bg-white rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden">{children}</div>
        </div>,
        document.body,
      )
    : null
}

const DialogHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4 border-b border-gray-200">{children}</div>
)

const DialogTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-medium text-gray-900">{children}</h3>
)

const DialogContent = ({ children }: { children: React.ReactNode }) => <div className="px-6 py-4">{children}</div>

const DialogFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">{children}</div>
)

const Input = ({
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  className = "",
}: {
  id: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  className?: string
}) => (
  <input
    id={id}
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${className}`}
  />
)

const Label = ({
  htmlFor,
  children,
  className = "",
}: {
  htmlFor: string
  children: React.ReactNode
  className?: string
}) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 ${className}`}>
    {children}
  </label>
)

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isTopUpDialogOpen, setIsTopUpDialogOpen] = useState(false)
  const [topUpAmount, setTopUpAmount] = useState("")
  const [isMounted, setIsMounted] = useState(false)

  const userId = "550e8400-e29b-41d4-a716-44665544000"

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  const fetchWalletData = async () => {
    try {
      setIsRefreshing(true)

      // Fetch wallet data
      const walletRes = await fetch(
        `https://comfortable-tonia-aryaraditya-081c5726.koyeb.app/api/wallet?userId=${userId}`,
      )

      if (!walletRes.ok) {
        throw new Error(`Error: ${walletRes.status} ${walletRes.statusText}`)
      }

      const walletData = await walletRes.json()
      setWallet(walletData.data)

      // Fetch transaction data
      const transactionRes = await fetch(
        `https://comfortable-tonia-aryaraditya-081c5726.koyeb.app/api/transaction?userId=${userId}`,
      )

      if (!transactionRes.ok) {
        throw new Error(`Error: ${transactionRes.status} ${transactionRes.statusText}`)
      }

      const transactionData = await transactionRes.json()
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

  const handleTopUp = () => {
    // This would be implemented to call the API
    // For now, just close the dialog
    setIsTopUpDialogOpen(false)
    setTopUpAmount("")
  }

  useEffect(() => {
    fetchWalletData()
  }, [])

  if (!isMounted) {
    return null
  }

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
          {wallet && (
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Current Balance</div>
                  <div className="text-3xl font-bold text-green-600">Rp {wallet.balance.toLocaleString("id-ID")}</div>
                </div>

                <Button
                  onClick={() => setIsTopUpDialogOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Top Up
                </Button>
              </div>
            </div>
          )}

          {/* Transaction List */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Transaction History</h2>

            {transactions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500">No transactions found.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {transaction.type === "TOP_UP" && (
                                <span className="text-green-500">
                                  <ArrowDownCircleIcon />
                                </span>
                              )}
                              {transaction.type === "WITHDRAWAL" && (
                                <span className="text-red-500">
                                  <ArrowUpCircleIcon />
                                </span>
                              )}
                              {transaction.type === "DONATION" && (
                                <span className="text-purple-500">
                                  <GiftIcon />
                                </span>
                              )}
                              <span className="font-medium">
                                {transaction.type === "TOP_UP" && "Top Up"}
                                {transaction.type === "WITHDRAWAL" && "Withdrawal"}
                                {transaction.type === "DONATION" && "Donation"}
                              </span>
                            </div>
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap font-medium ${
                              transaction.type === "TOP_UP"
                                ? "text-green-600"
                                : transaction.type === "WITHDRAWAL"
                                  ? "text-red-600"
                                  : "text-purple-600"
                            }`}
                          >
                            {transaction.type === "TOP_UP" ? "+ " : "- "}
                            Rp {transaction.amount.toLocaleString("id-ID")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{formatDate(transaction.timestamp)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Completed
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Top Up Dialog */}
      {isTopUpDialogOpen && (
        <Dialog isOpen={isTopUpDialogOpen} onClose={() => setIsTopUpDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>Top Up Wallet</DialogTitle>
          </DialogHeader>
          <DialogContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <div className="col-span-3 flex items-center">
                  <span className="mr-2">Rp</span>
                  <Input
                    id="amount"
                    type="number"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                </div>
              </div>
            </div>
          </DialogContent>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTopUpDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTopUp} disabled={!topUpAmount || Number.parseFloat(topUpAmount) <= 0}>
              Top Up
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  )
}
