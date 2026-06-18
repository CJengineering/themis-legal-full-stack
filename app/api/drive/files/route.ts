import { auth } from '@/lib/auth'
import { getDriveClient } from '@/lib/drive'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * GET /api/drive/files?folderId=xyz&driveId=abc
 * Lists files and folders in the specified folder (or root if no folderId).
 * Returns only folders, PDFs, and DOCX files.
 *
 * Query params:
 * - folderId: specific folder to browse (optional)
 * - driveId: specific Shared Drive to browse (optional)
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
  const driveId = searchParams.get('driveId')

  try {
    // 3. Initialize Drive client. If the token can't be refreshed, signal the
    //    client to show the "Reconnect Google Drive" flow (handled as 401).
    let drive
    try {
      drive = await getDriveClient(session.user.id)
    } catch (err) {
      if (err instanceof Error && err.message === 'DRIVE_REAUTH_REQUIRED') {
        return NextResponse.json(
          { error: 'Drive access expired. Please reconnect.' },
          { status: 401 }
        )
      }
      throw err
    }

    // 4. Build query and fetch files
    let items: any[] = []
    let sharedDrives: any[] = []

    if (driveId) {
      // Browsing a specific Shared Drive (with or without subfolder)
      const typeQuery = `(mimeType='application/vnd.google-apps.folder' or mimeType='application/pdf' or mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document')`

      let q: string
      if (folderId) {
        // Browsing a specific folder within the Shared Drive
        q = `'${folderId}' in parents and ${typeQuery} and trashed=false`
      } else {
        // Browsing Shared Drive root - get all files without parent filter
        // The driveId parameter will scope the query to that specific drive
        q = `${typeQuery} and trashed=false`
      }

      const response = await drive.files.list({
        q,
        fields: 'files(id, name, mimeType, modifiedTime, size, parents)',
        orderBy: 'folder,name',
        pageSize: 100,
        corpora: 'drive',
        driveId: driveId,
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
      })

      items = response.data.files ?? []
    } else if (folderId) {
      // Browsing a specific folder in My Drive or shared folders
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
      // Root level - fetch My Drive, Shared with me, AND Shared Drives
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

      // Fetch Shared Drives (Team Drives)
      const drivesResponse = await drive.drives.list({
        pageSize: 100,
        fields: 'drives(id, name)',
      })

      // Format Shared Drives as folder-like items
      sharedDrives = (drivesResponse.data.drives ?? []).map((d: any) => ({
        id: d.id,
        name: `📁 ${d.name}`, // Add emoji to distinguish Shared Drives
        mimeType: 'application/vnd.google-apps.folder',
        isSharedDrive: true, // Special flag to identify Shared Drives
        modifiedTime: null,
        size: null,
        parents: null,
      }))

      // Combine results (Shared Drives first, then shared files, then My Drive)
      items = [
        ...sharedDrives,
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
      currentFolderId: folderId ?? (driveId ? driveId : 'root'),
      currentDriveId: driveId ?? null,
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
