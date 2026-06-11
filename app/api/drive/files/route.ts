import { auth } from '@/lib/auth'
import { getDriveClient } from '@/lib/drive'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * GET /api/drive/files?folderId=xyz
 * Lists files and folders in the specified folder (or root if no folderId).
 * Returns only folders, PDFs, and DOCX files.
 */
// Prevent static optimization
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // 1. Check authentication
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Get query params
  const { searchParams } = new URL(request.url)
  const folderId = searchParams.get('folderId')

  try {
    // 3. Initialize Drive client
    const drive = await getDriveClient(session.user.id)

    // 4. Build query and fetch files
    let items: any[] = []

    if (folderId) {
      // Browsing a specific folder - include shared drives
      const q = `'${folderId}' in parents and (mimeType='application/vnd.google-apps.folder' or mimeType='application/pdf' or mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document') and trashed=false`

      const response = await drive.files.list({
        q,
        fields: 'files(id, name, mimeType, modifiedTime, size, parents)',
        orderBy: 'folder,name',
        pageSize: 100,
        corpora: 'user,allDrives',
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
      })

      items = response.data.files ?? []
    } else {
      // Root level - fetch both My Drive root AND shared files
      const typeQuery = `(mimeType='application/vnd.google-apps.folder' or mimeType='application/pdf' or mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document')`

      // Fetch My Drive root
      const myDriveResponse = await drive.files.list({
        q: `'root' in parents and ${typeQuery} and trashed=false`,
        fields: 'files(id, name, mimeType, modifiedTime, size, parents)',
        orderBy: 'folder,name',
        pageSize: 100,
        corpora: 'user',
      })

      // Fetch "Shared with me" files
      const sharedResponse = await drive.files.list({
        q: `sharedWithMe=true and ${typeQuery} and trashed=false`,
        fields: 'files(id, name, mimeType, modifiedTime, size, parents)',
        orderBy: 'folder,name',
        pageSize: 100,
        corpora: 'user',
      })

      // Combine results (shared files first to make them visible)
      items = [
        ...(sharedResponse.data.files ?? []),
        ...(myDriveResponse.data.files ?? []),
      ]
    }

    // 6. Separate folders and files
    const folders = items.filter(
      (item) => item.mimeType === 'application/vnd.google-apps.folder'
    )
    const files = items.filter(
      (item) => item.mimeType !== 'application/vnd.google-apps.folder'
    )

    // 7. Return sorted list (folders first)
    return NextResponse.json({
      items: [...folders, ...files],
      currentFolderId: folderId ?? 'root',
    })

  } catch (error) {
    console.error('Drive API error:', error)

    // Log full error details for debugging
    if (error && typeof error === 'object') {
      console.error('Error details:', JSON.stringify(error, null, 2))
    }

    // Handle specific Drive API errors
    if (error && typeof error === 'object' && 'code' in error) {
      const driveError = error as { code: number; message?: string }
      console.error(`Drive API error code: ${driveError.code}, message: ${driveError.message}`)

      if (driveError.code === 401) {
        return NextResponse.json(
          { error: 'Drive access token expired. Please reconnect.' },
          { status: 401 }
        )
      }
      if (driveError.code === 403) {
        return NextResponse.json(
          { error: 'Insufficient Drive permissions. Please reconnect.' },
          { status: 403 }
        )
      }
      if (driveError.code === 404) {
        return NextResponse.json(
          { error: 'Folder not found or no longer accessible.' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to fetch Drive files' },
      { status: 500 }
    )
  }
}
