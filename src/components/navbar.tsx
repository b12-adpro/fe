// components/navbar.tsx
"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext" // Import useAuth

export default function Navbar() {
  const { isAuthenticated, user, logout, loading: authLoading } = useAuth()


  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-green-600">
              GatherLove
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/campaign" className="text-gray-700 hover:bg-green-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Campaigns
              </Link>
              <Link href="/donation" className="text-gray-700 hover:bg-green-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Donate
              </Link>
              <Link href="/wallet" className="text-gray-700 hover:bg-green-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Wallet
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {!authLoading && isAuthenticated ? ( // Tampilkan hanya jika tidak loading DAN sudah terotentikasi
                <>
                  <span className="text-gray-700 mr-4">Hi, {user?.username || "User"}!</span>
                  <button
                    onClick={logout} // Panggil fungsi logout dari context
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : !authLoading && ( // Tampilkan hanya jika tidak loading DAN BELUM terotentikasi
                <>
                  <Link href="/auth/login" className="text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium">
                    Login
                  </Link>
                  <Link href="/auth/register" className="ml-4 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium">
                    Register
                  </Link>
                </>
              )}
              {authLoading && <span className="text-gray-500">Loading user...</span> /* Opsional: indikator loading */}
            </div>
          </div>
          {/* Mobile menu button (jika diperlukan) */}
        </div>
      </div>
    </nav>
  )
}