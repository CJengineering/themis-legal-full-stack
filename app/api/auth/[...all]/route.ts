import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

// Prevent static optimization
export const dynamic = 'force-dynamic'

export const { GET, POST } = toNextJsHandler(auth)
