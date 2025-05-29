"use client"

import { useState, type FormEvent, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const { login, isAuthenticated, loading: authLoading, authError, clearAuthError } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const registered = searchParams.get("registered")
    const registeredEmail = searchParams.get("email")
    const redirectTo = searchParams.get("redirect")

    if (registered === "true") {
      setSuccessMessage("Registration successful! Please log in.")
      if (registeredEmail) {
        setEmail(decodeURIComponent(registeredEmail))
      }
    }

    if (isAuthenticated && !authLoading) {
      router.push(redirectTo || "/")
    }
  }, [isAuthenticated, authLoading, router, searchParams])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      await login(email, password)
    } catch (error) {
      // Error is handled by AuthContext
      console.error("Login error:", error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {authError && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md">
              <p>{authError}</p>
            </div>
          )}
          {successMessage && !authError && (
            <div className="p-3 bg-green-100 text-green-700 rounded-md">
              <p>{successMessage}</p>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (authError) clearAuthError()
                }}
                disabled={authLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (authError) clearAuthError()
                }}
                disabled={authLoading}
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={authLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
            >
              {authLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          <Link href="/auth/register" className="font-medium text-green-600 hover:text-green-500">
            Don&apos;t have an account? Register
          </Link>
        </div>
      </div>
    </div>
  )
}
