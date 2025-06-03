"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"

export default function Navbar() {
  // Ambil loading juga untuk menampilkan UI yang lebih baik saat auth state berubah
  const { isAuthenticated, user, logout, isAdmin, initialAuthCheckComplete, loading: authOperationLoading } = useAuth()

  // Tampilkan UI loading yang lebih minimalis atau placeholder jika initialAuthCheck belum selesai
  // atau jika ada operasi auth (login/logout) yang sedang berjalan
  const showLoadingState = !initialAuthCheckComplete || authOperationLoading

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-green-600">
              GatherLove
            </Link>
          </div>

          {/* Navigasi Tengah */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {/* Link Umum yang mungkin selalu terlihat atau hanya saat login */}
              {isAuthenticated && ( // Tampilkan hanya jika sudah login
                <Link
                  href="/campaign"
                  className="text-gray-700 hover:bg-green-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Campaigns
                </Link>
              )}

              {/* Link untuk User Biasa (setelah login dan bukan admin) */}
              {isAuthenticated && !isAdmin && (
                <>
                  <Link
                    href="/donation/campaigns"
                    className="text-gray-700 hover:bg-green-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Make a Donation
                  </Link>
                  <Link
                    href="/wallet"
                    className="text-gray-700 hover:bg-green-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    My Wallet
                  </Link>
                  {/* Link Profile untuk User Biasa */}
                  <Link
                    href="/profile"
                    className="text-gray-700 hover:bg-green-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    My Profile
                  </Link>
                </>
              )}

              {/* Link Khusus Admin */}
              {isAuthenticated && isAdmin && (
                <>
                  <Link
                    href="/admin/dashboard"
                    className="text-blue-700 hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Admin Dashboard
                  </Link>
                  <Link
                    href="/admin/campaign"
                    className="text-blue-700 hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Manage Campaigns
                  </Link>
                  <Link
                    href="/admin/donation"
                    className="text-blue-700 hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Manage Donations
                  </Link>
                  <Link
                    href="/admin/users"
                    className="text-blue-700 hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Manage Users
                  </Link>
                  {/* Admin juga mungkin punya halaman profilnya sendiri, jika beda dari user biasa */}
                  {/* <Link href="/admin/profile" className="text-blue-700 hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                    Admin Profile
                  </Link> */}
                </>
              )}
            </div>
          </div>

          {/* Bagian Kanan Navbar (Login/Logout & Info User) */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {showLoadingState ? (
                <span className="text-gray-500 text-sm">Loading...</span>
              ) : isAuthenticated ? (
                <>
                  {/* Menggunakan user.username (atau user.fullName jika itu yang kamu simpan di context) */}
                  <span className="text-gray-700 mr-4">
                    Hi, {user?.fullName || user?.username || "User"}!{" "}
                    {isAdmin && <span className="text-sm text-blue-600">(Admin)</span>}
                  </span>
                  <button
                    onClick={logout}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="ml-4 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
          {/* Tombol menu mobile bisa ditambahkan di sini jika diperlukan */}
        </div>
      </div>
    </nav>
  )
}
