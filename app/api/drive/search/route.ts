import { auth } from '@/lib/auth'
import { getDriveClient } from '@/lib/drive'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * GET /api/drive/search?q=contract
 * Searches file names across Drive for PDF/DOCX files.
 */
export async function GET(request: Request) {
  // 1. Check authentication
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Get query param
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ error: 'Search query required' }, { status: 400 })
  }

  try {
    // 3. Initialize Drive client
    const drive = await getDriveClient(session.user.id)

    // 4. Build search query
    // - Search in file name
    // - Filter to PDF/DOCX only
    // - Exclude folders and trashed items
    const escapedQuery = query.replace(/'/g, "\\'")
    const q = `name contains '${escapedQuery}' and (mimeType='application/pdf' or mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document') and trashed=false`

    // 5. Fetch matching files
    const response = await drive.files.list({
      q,
      fields: 'files(id, name, mimeType, modifiedTime, size, parents)',
      orderBy: 'modifiedTime desc',
      pageSize: 50,
    })

    return NextResponse.json({
      items: response.data.files ?? [],
      query,
    })

  } catch (error) {
    console.error('Drive search error:', error)

    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
