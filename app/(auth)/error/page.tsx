"use client"

import { signOut } from "@/lib/auth-client"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const handleSignOut = async () => {
    await signOut()
    window.location.href = "/login"
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-6 px-4">
        <div className="rounded-lg bg-white p-8 shadow">
          <div className="text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Access Not Authorized
              </h1>
              <p className="mt-2 text-gray-600">
                {error === "Access not authorized"
                  ? "Your email is not authorized to access this application."
                  : "An error occurred during authentication."}
              </p>
              <p className="mt-4 text-sm text-gray-500">
                Please contact your administrator if you believe this is a
                mistake.
              </p>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  )
}
