import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

// Default Drive settings when user has no record yet
const DEFAULT_DRIVE_SETTINGS = {
  saveLocation: 'SAME_FOLDER',
  targetFolderId: null,
  namingPattern: '{name}_Signed_{date}',
  autoSave: true,
}

/**
 * GET /api/user/drive-settings
 * Returns current user's Drive settings, or defaults if none exist
 */
// Prevent static optimization
export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const settings = await prisma.driveSettings.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        saveLocation: true,
        targetFolderId: true,
        namingPattern: true,
        autoSave: true,
      },
    })

    // Return defaults if no settings exist yet
    if (!settings) {
      return NextResponse.json(DEFAULT_DRIVE_SETTINGS)
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Failed to fetch Drive settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Drive settings' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/user/drive-settings
 * Updates current user's Drive settings (upsert: create if not exists)
 */
export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { saveLocation, targetFolderId, namingPattern, autoSave } = body

    // Validate allowed fields
    const allowedFields = ['saveLocation', 'targetFolderId', 'namingPattern', 'autoSave']
    const providedFields = Object.keys(body)
    const invalidFields = providedFields.filter(field => !allowedFields.includes(field))

    if (invalidFields.length > 0) {
      return NextResponse.json(
        { error: `Invalid fields: ${invalidFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate saveLocation enum if provided
    const validSaveLocations = ['SAME_FOLDER', 'SPECIFIC_FOLDER', 'ASK']
    if (saveLocation !== undefined && !validSaveLocations.includes(saveLocation)) {
      return NextResponse.json(
        { error: `Invalid saveLocation. Must be one of: ${validSaveLocations.join(', ')}` },
        { status: 400 }
      )
    }

    // Build update data with only provided fields
    const updateData: {
      saveLocation?: string
      targetFolderId?: string | null
      namingPattern?: string
      autoSave?: boolean
    } = {}

    if (saveLocation !== undefined) updateData.saveLocation = saveLocation
    if (targetFolderId !== undefined) updateData.targetFolderId = targetFolderId
    if (namingPattern !== undefined) updateData.namingPattern = namingPattern
    if (autoSave !== undefined) updateData.autoSave = autoSave

    // Upsert: create if doesn't exist, update if exists
    const updatedSettings = await prisma.driveSettings.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...DEFAULT_DRIVE_SETTINGS,
        ...updateData,
      },
      update: updateData,
      select: {
        id: true,
        saveLocation: true,
        targetFolderId: true,
        namingPattern: true,
        autoSave: true,
      },
    })

    return NextResponse.json(updatedSettings)
  } catch (error) {
    console.error('Failed to update Drive settings:', error)
    return NextResponse.json(
      { error: 'Failed to update Drive settings' },
      { status: 500 }
    )
  }
}
