// app/auth/register/page.tsx
"use client"

import { useState, FormEvent, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export default function RegisterPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [address, setAddress] = useState("")

  const { register, isAuthenticated, loading: authLoading, authError, clearAuthError } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
        router.push("/")
    }
  }, [isAuthenticated, authLoading, router])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await register({
      fullNameInput: fullName,
      emailInput: email,
      phoneNumberInput: phoneNumber,
      passwordInput: password,
      addressInput: address,
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {authError && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md">
              <p>{authError}</p>
            </div>
          )}
          <div className="rounded-md shadow-sm">
            {/* Full Name */}
            <div className="mb-2">
              <label htmlFor="fullName" className="sr-only">Full Name</label>
              <input id="fullName" name="fullName" type="text" autoComplete="name" required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Full Name" value={fullName}
                onChange={(e) => { setFullName(e.target.value); if (authError) clearAuthError(); }}
                disabled={authLoading} />
            </div>
            {/* Email */}
            <div className="mb-2">
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input id="email-address" name="email" type="email" autoComplete="email" required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Email address" value={email}
                onChange={(e) => { setEmail(e.target.value); if (authError) clearAuthError(); }}
                disabled={authLoading} />
            </div>
            {/* Phone Number */}
            <div className="mb-2">
              <label htmlFor="phoneNumber" className="sr-only">Phone Number</label>
              <input id="phoneNumber" name="phoneNumber" type="tel" autoComplete="tel" required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Phone Number (e.g., +628123456789)" value={phoneNumber}
                onChange={(e) => { setPhoneNumber(e.target.value); if (authError) clearAuthError(); }}
                disabled={authLoading} />
            </div>
            {/* Password */}
            <div className="mb-2">
              <label htmlFor="password" className="sr-only">Password</label>
              <input id="password" name="password" type="password" autoComplete="new-password" required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Password" value={password}
                onChange={(e) => { setPassword(e.target.value); if (authError) clearAuthError(); }}
                disabled={authLoading} />
            </div>
            {/* Address */}
            <div>
              <label htmlFor="address" className="sr-only">Address</label>
              <textarea id="address" name="address" rows={3} required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Address" value={address}
                onChange={(e) => { setAddress(e.target.value); if (authError) clearAuthError(); }}
                disabled={authLoading} />
            </div>
          </div>

          <div>
            <button type="submit" disabled={authLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400">
              {authLoading ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          <Link href="/auth/login" className="font-medium text-green-600 hover:text-green-500">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}