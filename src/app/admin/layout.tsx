import type React from "react"
import "../globals.css"
import type { Metadata } from "next"
import Navbar from "@/components/navbar"

export const metadata: Metadata = {
  title: "GatherLove Platform",
  description: "Crowdfunding platform for campaigns and donations with love",
}

export default function  RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="min-h-screen bg-gray-50">{children}</main>
      </body>
    </html>
  )
}
