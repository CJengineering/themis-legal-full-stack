import { auth } from '@/lib/auth'
import { hasDriveAccess } from '@/lib/drive'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

// Prevent static optimization - this route needs runtime data
export const dynamic = 'force-dynamic'

/**
 * GET /api/drive/connect
 * Returns whether the current user has Google Drive connected.
 */
export async function GET() {
  // Check authentication
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Check if user has Drive access
  const connected = await hasDriveAccess(session.user.id)

  return NextResponse.json({
    connected,
    email: session.user.email,
    userId: session.user.id,
  })
}
