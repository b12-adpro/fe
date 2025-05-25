"use client"
import type { Wallet } from "../types"
import { formatCurrency } from "../utils"
import { Button } from "./button"

interface WalletCardProps {
  wallet: Wallet
  onTopUp: () => void
}

export const WalletCard = ({ wallet, onTopUp }: WalletCardProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="text-sm font-medium text-gray-500 mb-1">Current Balance</div>
          <div className="text-3xl font-bold text-green-600">Rp {formatCurrency(wallet.balance)}</div>
        </div>

        <Button onClick={onTopUp} className="bg-green-600 hover:bg-green-700 text-white">
          Top Up
        </Button>
      </div>
    </div>
  )
}
