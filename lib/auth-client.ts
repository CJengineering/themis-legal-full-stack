"use client"

import { createAuthClient } from "better-auth/react"

// DEBUG: Log the baseURL being used
const baseURL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000"
console.log("=== AUTH CLIENT CONFIG ===")
console.log("baseURL:", baseURL)
console.log("NEXT_PUBLIC_BETTER_AUTH_URL:", process.env.NEXT_PUBLIC_BETTER_AUTH_URL)
console.log("========================")

export const { signIn, signOut, useSession } = createAuthClient({
  baseURL,
})

export { type Session } from "./auth"
