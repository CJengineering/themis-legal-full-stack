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

    // 4. Build query
    // - If folderId provided: list contents of that folder
    // - If no folderId: list root level files/folders
    // - Filter: folders OR (PDF OR DOCX) files only
    // - Exclude trashed items
    const folderQuery = folderId
      ? `'${folderId}' in parents`
      : "'root' in parents"

    const typeQuery = `(mimeType='application/vnd.google-apps.folder' or mimeType='application/pdf' or mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document')`

    const q = `${folderQuery} and ${typeQuery} and trashed=false`

    // 5. Fetch files
    const response = await drive.files.list({
      q,
      fields: 'files(id, name, mimeType, modifiedTime, size, parents)',
      orderBy: 'folder,name',
      pageSize: 100,
    })

    // 6. Separate folders and files
    const items = response.data.files ?? []
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
