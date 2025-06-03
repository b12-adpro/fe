"use client"
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "./dialog"
import { Button } from "./button"
import { formatCurrency } from "../utils"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  status: "success" | "error"
  amount?: number
  currentBalance?: number
  errorMessage?: string
  onRetry?: () => void
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  status,
  amount = 0,
  currentBalance = 0,
  errorMessage = "",
  onRetry,
}: ConfirmationModalProps) => {
  if (status === "success") {
    return (
      <Dialog isOpen={isOpen} onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Top Up Successful</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="text-center py-4">
            <div className="mb-4 text-green-500">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Top Up Successful</h3>
            <div className="text-sm text-gray-500 mb-4">
              <p className="mb-1">Amount added: Rp {formatCurrency(amount)}</p>
              <p>Current balance: Rp {formatCurrency(currentBalance)}</p>
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </DialogFooter>
      </Dialog>
    )
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Top Up Failed</DialogTitle>
      </DialogHeader>
      <DialogContent>
        <div className="text-center py-4">
          <div className="mb-4 text-red-500">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Top Up Failed</h3>
          <p className="text-sm text-gray-500">{errorMessage}</p>
        </div>
      </DialogContent>
      <DialogFooter>
        <div className="flex justify-between"> {/* className dipindahkan ke div pembungkus */}
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onRetry}>Try Again</Button>
        </div>
      </DialogFooter>
    </Dialog>
  )
}
