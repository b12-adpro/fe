"use client"

import type React from "react"
import { createPortal } from "react-dom"

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export const Dialog = ({ isOpen, onClose, children }: DialogProps) => {
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

export const DialogHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4 border-b border-gray-200">{children}</div>
)

export const DialogTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-medium text-gray-900">{children}</h3>
)

export const DialogContent = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4">{children}</div>
)

export const DialogFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">{children}</div>
)
