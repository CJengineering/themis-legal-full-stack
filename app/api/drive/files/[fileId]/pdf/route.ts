import { auth } from '@/lib/auth'
import { getDriveClient } from '@/lib/drive'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * GET /api/drive/files/[fileId]/pdf
 * Streams a PDF file from Google Drive.
 * NEVER stores file content — streams directly to client.
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

    // 4. Fetch file metadata to verify it exists and is a PDF
    const metadata = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType',
    })

    if (
      metadata.data.mimeType !== 'application/pdf' &&
      metadata.data.mimeType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return NextResponse.json(
        { error: 'File must be PDF or DOCX format' },
        { status: 400 }
      )
    }

    // 5. Stream file content from Drive
    const response = await drive.files.get(
      {
        fileId,
        alt: 'media',
      },
      { responseType: 'stream' }
    )

    // 6. Convert Readable stream to Web ReadableStream and return
    const stream = response.data as unknown as NodeJS.ReadableStream

    // Create a Web ReadableStream from Node stream
    const webStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk: Buffer) => {
          controller.enqueue(new Uint8Array(chunk))
        })
        stream.on('end', () => {
          controller.close()
        })
        stream.on('error', (err) => {
          controller.error(err)
        })
      },
    })

    return new Response(webStream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Drive API error:', error)

    if (error && typeof error === 'object' && 'code' in error) {
      const driveError = error as { code: number }
      if (driveError.code === 404) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 })
      }
      if (driveError.code === 403) {
        return NextResponse.json(
          { error: 'Insufficient permissions to access file' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to stream PDF file' },
      { status: 500 }
    )
  }
}
