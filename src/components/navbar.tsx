"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

type UserRole = "Admin" | "User" | null
type AuthState = {
  isLoggedIn: boolean
  role: UserRole
  username?: string
}

const useAuth = (): AuthState => {
  return {
    isLoggedIn: true,
    role: "Admin", 
    username: "John Doe",
  }
}

const Navbar = () => {
  const pathname = usePathname()
  const { isLoggedIn, role, username } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  const NavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => (
    <Link
      href={href}
      onClick={onClick}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive(href) ? "bg-green-100 text-green-700" : "text-gray-700 hover:text-green-600 hover:bg-gray-50"
      }`}
    >
      {children}
    </Link>
  )

  const MobileNavLink = ({
    href,
    children,
    onClick,
  }: { href: string; children: React.ReactNode; onClick?: () => void }) => (
    <Link
      href={href}
      onClick={onClick}
      className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
        isActive(href) ? "bg-green-100 text-green-700" : "text-gray-700 hover:text-green-600 hover:bg-gray-50"
      }`}
    >
      {children}
    </Link>
  )

  const handleLogout = () => {
    console.log("Logout clicked")
    setIsMobileMenuOpen(false)
  }

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-green-600">GatherLove</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {!isLoggedIn ? (
              // Not logged in
              <>
                <NavLink href="/auth-profile/login">Login</NavLink>
                <NavLink href="/auth-profile/register">Register</NavLink>
              </>
            ) : role === "Admin" ? (
              // Admin navigation
              <>
                <NavLink href="/admin/dashboard">Dashboard</NavLink>
                <NavLink href="/admin/campaign">Campaign</NavLink>
                <NavLink href="/admin/donation">Donation</NavLink>
                <NavLink href="/admin/users">Users</NavLink>
                <NavLink href="/admin/notifications">Notifications</NavLink>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              // User navigation
              <>
                <NavLink href="/campaign">Campaigns</NavLink>
                <NavLink href="/my-campaign">My Campaigns</NavLink>
                <NavLink href="/donation">Donations</NavLink>
                <NavLink href="/wallet">Wallet</NavLink>
                <NavLink href="/profile">Profile</NavLink>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">Welcome, {username}</span>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {!isLoggedIn ? (
              // Not logged in
              <>
                <MobileNavLink href="/auth-profile/login" onClick={closeMobileMenu}>
                  Login
                </MobileNavLink>
                <MobileNavLink href="/auth-profile/register" onClick={closeMobileMenu}>
                  Register
                </MobileNavLink>
              </>
            ) : role === "Admin" ? (
              // Admin navigation
              <>
                <MobileNavLink href="/dashboard" onClick={closeMobileMenu}>
                  Dashboard
                </MobileNavLink>
                <MobileNavLink href="/users" onClick={closeMobileMenu}>
                  Users
                </MobileNavLink>
                <MobileNavLink href="/notifications" onClick={closeMobileMenu}>
                  Notifications
                </MobileNavLink>
                <div className="px-3 py-2">
                  <span className="text-sm text-gray-600">Welcome, {username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (

              <>
                <MobileNavLink href="/campaign" onClick={closeMobileMenu}>
                  Campaigns
                </MobileNavLink>
                <MobileNavLink href="/my-campaign" onClick={closeMobileMenu}>
                  My Campaigns
                </MobileNavLink>
                <MobileNavLink href="/donation" onClick={closeMobileMenu}>
                  Donations
                </MobileNavLink>
                <MobileNavLink href="/wallet" onClick={closeMobileMenu}>
                  Wallet
                </MobileNavLink>
                <MobileNavLink href="/profile" onClick={closeMobileMenu}>
                  Profile
                </MobileNavLink>
                <div className="px-3 py-2">
                  <span className="text-sm text-gray-600">Welcome, {username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
