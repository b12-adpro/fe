"use client"
import { useEffect, useState, useMemo } from "react"
import type { Transaction, CampaignData } from "../types"
import { formatDate, formatCurrency } from "../utils"
import { TransactionIcon, getTransactionLabel, getTransactionColor } from "./transaction-icon"

interface TransactionListProps {
  transactions: Transaction[]
  limit?: number
}

export const TransactionList = ({ transactions, limit }: TransactionListProps) => {
  const [campaignNames, setCampaignNames] = useState<Record<string, string>>({})
  const displayTransactions = limit ? transactions.slice(0, limit) : transactions

  const campaignIdsToFetch = useMemo(() => {
    return displayTransactions
      .filter((transaction) => transaction.campaignId && !campaignNames[transaction.campaignId]) // Only fetch if not already fetched
      .map((transaction) => transaction.campaignId!)
      .filter((id, index, self) => self.indexOf(id) === index) // Remove duplicates
  }, [displayTransactions, campaignNames])

  // Fetch campaign names for transactions with campaignId
  useEffect(() => {
    if (campaignIdsToFetch.length === 0) {
      return
    }

    const fetchCampaignNames = async () => {
      const campaignPromises = campaignIdsToFetch.map(async (campaignId) => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_CAMPAIGN_API_URL}/campaignId/${campaignId}`)
          if (response.ok) {
            const data: CampaignData = await response.json()
            return { campaignId, judul: data.judul }
          }
          return { campaignId, judul: "Unknown Campaign" }
        } catch (error) {
          console.error(`Failed to fetch campaign ${campaignId}:`, error)
          return { campaignId, judul: "Unknown Campaign" }
        }
      })

      const campaignResults = await Promise.all(campaignPromises)
      const campaignMap = campaignResults.reduce(
        (acc, { campaignId, judul }) => {
          acc[campaignId] = judul
          return acc
        },
        {} as Record<string, string>,
      )

      setCampaignNames(prevCampaignNames => ({ ...prevCampaignNames, ...campaignMap }))
    }

    fetchCampaignNames()
    // useEffect now depends on the memoized campaignIdsToFetch
  }, [campaignIdsToFetch])

  if (displayTransactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500">No transactions found.</p>
      </div>
    )
  }

  const getCampaignName = (campaignId: string | null | undefined): string => {
    if (!campaignId) return ""
    return campaignNames[campaignId] || "Loading..."
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayTransactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <TransactionIcon type={transaction.type} />
                    <div className="flex flex-col">
                      <span className="font-medium">{getTransactionLabel(transaction.type)}</span>
                      {transaction.campaignId &&
                        (transaction.type === "DONATION" || transaction.type === "WITHDRAWAL") && (
                          <span className="text-sm text-gray-500">{getCampaignName(transaction.campaignId)}</span>
                        )}
                    </div>
                  </div>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap font-medium ${getTransactionColor(transaction.type)}`}>
                  {transaction.type === "TOP_UP" ? "+ " : "- "}
                  Rp {formatCurrency(transaction.amount)}
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
  )
}
