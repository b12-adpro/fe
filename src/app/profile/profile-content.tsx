"use client"

import type React from "react"

import { useEffect, useState, type FormEvent } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { LoaderIcon, ErrorIcon, EditIcon, SaveIcon, CancelIcon } from "./components/icons"
import Link from "next/link"

// Try HTTP instead of HTTPS first
const API_BASE_URL = "http://kind-danyelle-nout-721a9e0a.koyeb.app"

// Add fallback URLs in case the main one fails
const FALLBACK_URLS = ["https://kind-danyelle-nout-721a9e0a.koyeb.app", "http://kind-danyelle-nout-721a9e0a.koyeb.app"]

interface ProfileUpdatePayload {
  fullName?: string
  phoneNumber?: string
  address?: string
}

interface UserProfileData {
  id: string
  email: string
  fullName?: string
  username?: string
  phoneNumber?: string
  address?: string
  role?: string
  roles?: string[]
}

export function ProfilePageContent() {
  const { user, token, isAuthenticated, initialAuthCheckComplete, logout } = useAuth()
  const router = useRouter()

  const [profileData, setProfileData] = useState<UserProfileData | null>(null)
  const [editData, setEditData] = useState<ProfileUpdatePayload>({
    fullName: "",
    phoneNumber: "",
    address: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Update the fetchProfile function to handle network errors better
  const fetchProfile = async () => {
    if (!token) return

    setLoading(true)
    setError(null)

    // Try multiple URLs if one fails
    for (const baseUrl of [API_BASE_URL, ...FALLBACK_URLS]) {
      try {
        console.log(`Trying to fetch from: ${baseUrl}/profile`)

        const response = await fetch(`${baseUrl}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            logout()
            throw new Error("Authentication failed. Please login again.")
          }
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `Failed to fetch profile: ${response.status} ${response.statusText}`)
        }

        const data: UserProfileData = await response.json()
        console.log("Profile data received:", data)

        setProfileData(data)
        setEditData({
          fullName: data.fullName || "",
          phoneNumber: data.phoneNumber || "",
          address: data.address || "",
        })

        // If successful, break out of the loop
        break
      } catch (err) {
        console.error(`Failed to fetch from ${baseUrl}:`, err)

        // If this is the last URL to try, set the error
        if (baseUrl === FALLBACK_URLS[FALLBACK_URLS.length - 1]) {
          const errorMessage =
            err instanceof Error
              ? err.message
              : "Network error: Could not connect to server. Please check if the backend is running."
          setError(errorMessage)
        }

        // Continue to next URL
        continue
      }
    }

    setLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditData((prev) => ({ ...prev, [name]: value }))
  }

  // Also update the handleSubmitProfileUpdate function with the same approach
  const handleSubmitProfileUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!token) return

    setSaving(true)
    setError(null)
    setSuccessMessage(null)

    const payload: ProfileUpdatePayload = {}
    if (editData.fullName && editData.fullName !== profileData?.fullName) payload.fullName = editData.fullName
    if (editData.phoneNumber && editData.phoneNumber !== profileData?.phoneNumber)
      payload.phoneNumber = editData.phoneNumber
    if (editData.address && editData.address !== profileData?.address) payload.address = editData.address

    if (Object.keys(payload).length === 0) {
      setSuccessMessage("No changes to save.")
      setIsEditing(false)
      setSaving(false)
      return
    }

    // Try multiple URLs for update as well
    for (const baseUrl of [API_BASE_URL, ...FALLBACK_URLS]) {
      try {
        console.log(`Trying to update profile at: ${baseUrl}/profile`)

        const response = await fetch(`${baseUrl}/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `Failed to update profile: ${response.status} ${response.statusText}`)
        }

        const updatedProfileData: UserProfileData = await response.json()
        setProfileData(updatedProfileData)
        setEditData({
          fullName: updatedProfileData.fullName || "",
          phoneNumber: updatedProfileData.phoneNumber || "",
          address: updatedProfileData.address || "",
        })
        setSuccessMessage("Profile updated successfully!")
        setIsEditing(false)

        // If successful, break out of the loop
        break
      } catch (err) {
        console.error(`Failed to update at ${baseUrl}:`, err)

        // If this is the last URL to try, set the error
        if (baseUrl === FALLBACK_URLS[FALLBACK_URLS.length - 1]) {
          const errorMessage = err instanceof Error ? err.message : "Network error: Could not update profile."
          setError(errorMessage)
        }

        // Continue to next URL
        continue
      }
    }

    setSaving(false)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    if (profileData) {
      setEditData({
        fullName: profileData.fullName || "",
        phoneNumber: profileData.phoneNumber || "",
        address: profileData.address || "",
      })
    }
    setError(null)
    setSuccessMessage(null)
  }

  useEffect(() => {
    if (initialAuthCheckComplete) {
      if (!isAuthenticated) {
        router.push("/auth-profile/login?redirect=/profile")
      } else if (token && user?.id) {
        fetchProfile()
      } else {
        setLoading(false)
        setError("User data not available.")
      }
    }
  }, [initialAuthCheckComplete, isAuthenticated, token, user?.id, router])

  if (!initialAuthCheckComplete || loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center flex flex-col items-center justify-center min-h-[400px]">
        <LoaderIcon className="animate-spin h-12 w-12 text-green-600" />
        <p className="mt-4 text-gray-600">Loading profile...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center min-h-[400px] flex flex-col items-center justify-center">
        <div className="mb-4">
          <ErrorIcon className="h-12 w-12 text-red-500" />
        </div>
        <p className="text-xl text-gray-700 mb-4">You need to be logged in to view your profile.</p>
        <Link
          href="/auth-profile/login?redirect=/profile"
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Go to Login
        </Link>
      </div>
    )
  }

  if (!profileData && !loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <ErrorIcon className="h-5 w-5 inline mr-2" />
          <span>{error || "Could not load profile data."}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">My Profile</h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <div className="flex items-center">
            <ErrorIcon className="h-5 w-5 mr-2" />
            <div>
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p>{successMessage}</p>
          </div>
        </div>
      )}

      {profileData && (
        <div className="bg-white p-8 rounded-lg shadow-lg">
          {!isEditing ? (
            <div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-500">Full Name</label>
                <p className="mt-1 text-lg text-gray-900">{profileData.fullName || "-"}</p>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="mt-1 text-lg text-gray-900">{profileData.email}</p>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                <p className="mt-1 text-lg text-gray-900">{profileData.phoneNumber || "-"}</p>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-500">Address</label>
                <p className="mt-1 text-lg text-gray-900 whitespace-pre-wrap">{profileData.address || "-"}</p>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-500">Role</label>
                <p className="mt-1 text-lg text-gray-900">
                  {profileData.role || (profileData.roles && profileData.roles.join(", ")) || "USER"}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsEditing(true)
                  setError(null)
                  setSuccessMessage(null)
                }}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <EditIcon className="mr-2" /> Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitProfileUpdate} className="space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  id="fullName"
                  value={editData.fullName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email (cannot be changed)
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={profileData.email}
                  disabled
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  id="phoneNumber"
                  value={editData.phoneNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <textarea
                  name="address"
                  id="address"
                  rows={3}
                  value={editData.address}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
              <div className="flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  <CancelIcon className="mr-2" /> Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <LoaderIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  ) : (
                    <SaveIcon className="mr-2" />
                  )}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
