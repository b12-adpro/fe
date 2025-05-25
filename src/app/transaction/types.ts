export interface Wallet {
  id: string
  userId: string
  balance: number
}

export type TransactionType = "TOP_UP" | "WITHDRAWAL" | "DONATION"

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  timestamp: string
  wallet: Wallet
  campaignId?: string | null
  donationId?: string | null
}

export interface ApiResponse<T> {
  status: string
  message: string
  data: T
}

export type UserRole = "Donatur" | "Fundraiser"

export interface CampaignData {
  campaignId: string
  judul: string
}
