"use client"

import { signOut } from "@/lib/auth-client"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  const handleSignOut = async () => {
    await signOut()
    window.location.href = "/login"
  }

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </button>
  )
}
