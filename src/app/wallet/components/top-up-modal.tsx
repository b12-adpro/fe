"use client"

import { useState } from "react"
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "./dialog"
import { Input, Label } from "./input"
import { Button } from "./button"
import { RadioGroup } from "./radio-group"

interface TopUpModalProps {
  isOpen: boolean
  onClose: () => void
  onTopUp: (amount: number, method: string) => Promise<void>
}

const paymentMethods = [
  { value: "DANA", label: "DANA" },
  { value: "Gopay", label: "Gopay" },
  { value: "OVO", label: "OVO" },
  { value: "VA", label: "Virtual Account" },
]

export const TopUpModal = ({ isOpen, onClose, onTopUp }: TopUpModalProps) => {
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState("DANA")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) return

    setIsSubmitting(true)
    try {
      await onTopUp(Number(amount), method)
      resetForm()
    } catch (error) {
      console.error("Top up failed:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setAmount("")
    setMethod("DANA")
    onClose()
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Top Up Wallet</DialogTitle>
      </DialogHeader>
      <DialogContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="payment-method">Payment Method</Label>
            <RadioGroup
              name="payment-method"
              options={paymentMethods}
              value={method}
              onChange={setMethod}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">Rp</span>
              </div>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Minimum Top Up: 10000"
                className="pl-12"
                min="10000"
              />
            </div>
            {Number(amount) > 0 && Number(amount) < 10000 && (
              <p className="mt-1 text-sm text-red-600">Amount must be at least Rp 10,000</p>
            )}
          </div>
        </div>
      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={resetForm} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting || !amount || Number(amount) < 10000}>
          {isSubmitting ? "Processing..." : "Top Up"}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
