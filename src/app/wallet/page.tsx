"use client"

import { Suspense } from "react"
import { WalletPageContent } from "./wallet-content"
import { LoaderIcon } from "./components/icons"

export default function WalletPage() {
  return (
    <Suspense fallback={<WalletPageFallback />}>
      <WalletPageContent />
    </Suspense>
  )
}

function WalletPageFallback() {
  return (
    <div className="p-6 max-w-4xl mx-auto text-center flex flex-col items-center justify-center min-h-[400px]">
      <div className="mb-4">
        <LoaderIcon className="animate-spin h-12 w-12 text-green-600" />
      </div>
      <p className="text-gray-600">Loading Wallet...</p>
    </div>
  )
}
