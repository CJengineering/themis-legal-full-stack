import { auth } from '@/lib/auth'
import { getDriveClient } from '@/lib/drive'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { Readable } from 'stream'

// Prevent static optimization
export const dynamic = 'force-dynamic'

/**
 * GET /api/drive/files/[fileId]/hash
 * Streams file from Drive and computes SHA-256 hash for document integrity.
 *
 * CRITICAL: This route NEVER stores the file content.
 * It streams chunks, hashes them, and returns only the hash digest.
 *
 * Used by workflow creation to store documentHash for compliance.
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
    // 2. Find the workflow to get the creator's ID
    // The file lives in the CREATOR's Drive, not the requester's
    const workflow = await prisma.workflow.findFirst({
      where: { driveFileId: fileId },
      select: { creatorId: true },
    })

    if (!workflow) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // 3. Initialize Drive client with creator's credentials
    const drive = await getDriveClient(workflow.creatorId)

    // 4. Fetch file metadata first to get the file name
    const metadata = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType',
    })

    if (!metadata.data.name) {
      return NextResponse.json(
        { error: 'File metadata incomplete' },
        { status: 500 }
      )
    }

    // 5. Stream file content and compute hash
    // Using alt: 'media' to get file content instead of metadata
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    )

    // 6. Create hash instance
    const hash = createHash('sha256')

    // 7. Stream data through hash
    // The response.data is a Node.js Readable stream
    const stream = response.data as Readable

    return new Promise<NextResponse>((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => {
        hash.update(chunk)
      })

      stream.on('end', () => {
        const digest = hash.digest('hex')
        resolve(
          NextResponse.json({
            hash: digest,
            fileId,
            fileName: metadata.data.name,
            mimeType: metadata.data.mimeType,
          })
        )
      })

      stream.on('error', (error) => {
        console.error('Stream error while hashing file:', error)
        reject(error)
      })
    })
  } catch (error) {
    console.error('Failed to compute file hash:', error)

    // Handle specific Drive API errors
    if (error && typeof error === 'object' && 'code' in error) {
      const driveError = error as { code: number }
      if (driveError.code === 401) {
        return NextResponse.json(
          { error: 'Drive access token expired. Please reconnect.' },
          { status: 401 }
        )
      }
      if (driveError.code === 403) {
        return NextResponse.json(
          { error: 'Insufficient Drive permissions.' },
          { status: 403 }
        )
      }
      if (driveError.code === 404) {
        return NextResponse.json(
          { error: 'File not found or no longer accessible.' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to compute file hash' },
      { status: 500 }
    )
  }
}
