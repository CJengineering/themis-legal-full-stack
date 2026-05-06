import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Health check endpoint
 * Tests database connectivity and returns server status
 */
// Prevent static optimization
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Execute a simple query to verify database connection
    // This will throw if the database is unreachable
    await prisma.$queryRaw`SELECT 1`

    return NextResponse.json({
      status: 'ok',
      db: 'connected',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Health check failed:', error)

    return NextResponse.json(
      {
        status: 'error',
        db: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 } // Service Unavailable
    )
  }
}
