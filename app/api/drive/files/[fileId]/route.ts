import { auth } from '@/lib/auth'
import { getDriveClient } from '@/lib/drive'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

// Prevent static optimization
export const dynamic = 'force-dynamic'

/**
 * GET /api/drive/files/[fileId]
 * Returns metadata for a single file.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  // 1. Check authentication
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { fileId } = await params

  try {
    // 2. Initialize Drive client
    const drive = await getDriveClient(session.user.id)

    // 3. Fetch file metadata
    const response = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, modifiedTime, size, parents, webViewLink',
    })

    return NextResponse.json(response.data)

  } catch (error) {
    console.error('Drive API error:', error)

    if (error && typeof error === 'object' && 'code' in error) {
      const driveError = error as { code: number }
      if (driveError.code === 404) {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to fetch file metadata' },
      { status: 500 }
    )
  }
}
