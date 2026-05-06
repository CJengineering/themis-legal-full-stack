import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

// Prevent static optimization and ensure runtime-only execution
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Use lazy handler initialization to avoid build-time execution
const handler = toNextJsHandler(auth)

export const GET = handler.GET
export const POST = handler.POST
