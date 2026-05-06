import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

export async function GET() {
  try {
    // 1. Authenticate user
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Count pending signatures for this user
    const count = await prisma.signer.count({
      where: {
        email: {
          equals: session.user.email,
          mode: 'insensitive',
        },
        status: 'NOTIFIED', // It's their turn to sign
        workflow: {
          status: 'ACTIVE', // Workflow is still running
        },
      },
    })

    // 3. Return count
    return Response.json({ count })
  } catch (error) {
    console.error('Error fetching pending signatures count:', error)
    return Response.json(
      { error: 'Failed to fetch pending signatures count' },
      { status: 500 }
    )
  }
}
