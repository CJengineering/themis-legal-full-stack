import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

// Type for notification preferences
type NotificationPreferences = {
  signatureRequests: boolean
  reminders: boolean
  completions: boolean
  workflowUpdates: boolean
}

// Default notification preferences
const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  signatureRequests: true,
  reminders: true,
  completions: true,
  workflowUpdates: true,
}

/**
 * GET /api/user/notifications
 * Returns current user's notification preferences from User.notificationPreferences JSON field
 */
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        notificationPreferences: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Return defaults if preferences are null
    if (!user.notificationPreferences) {
      return NextResponse.json(DEFAULT_NOTIFICATION_PREFERENCES)
    }

    // Merge saved preferences with defaults (in case new fields were added)
    const preferences = {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...(user.notificationPreferences as Record<string, unknown>),
    }

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Failed to fetch notification preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification preferences' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/user/notifications
 * Updates current user's notification preferences
 * Merges with existing preferences instead of replacing
 */
export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { signatureRequests, reminders, completions, workflowUpdates } = body

    // Validate allowed fields
    const allowedFields = ['signatureRequests', 'reminders', 'completions', 'workflowUpdates']
    const providedFields = Object.keys(body)
    const invalidFields = providedFields.filter(field => !allowedFields.includes(field))

    if (invalidFields.length > 0) {
      return NextResponse.json(
        { error: `Invalid fields: ${invalidFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate that values are booleans
    for (const field of providedFields) {
      if (typeof body[field] !== 'boolean') {
        return NextResponse.json(
          { error: `Field '${field}' must be a boolean` },
          { status: 400 }
        )
      }
    }

    // Fetch current preferences
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { notificationPreferences: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Merge with existing preferences
    const currentPreferences = (user.notificationPreferences as Record<string, unknown>) || {}
    const updatedPreferences: NotificationPreferences = {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...currentPreferences,
    }

    // Update only provided fields
    if (signatureRequests !== undefined) updatedPreferences.signatureRequests = signatureRequests
    if (reminders !== undefined) updatedPreferences.reminders = reminders
    if (completions !== undefined) updatedPreferences.completions = completions
    if (workflowUpdates !== undefined) updatedPreferences.workflowUpdates = workflowUpdates

    // Save to database
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        notificationPreferences: updatedPreferences,
      },
    })

    return NextResponse.json(updatedPreferences)
  } catch (error) {
    console.error('Failed to update notification preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update notification preferences' },
      { status: 500 }
    )
  }
}
