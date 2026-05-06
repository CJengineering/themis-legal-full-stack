import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * GET /api/user/profile
 * Returns current user's profile data
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
        id: true,
        name: true,
        email: true,
        image: true,
        company: true,
        title: true,
        locale: true,
        timezone: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Failed to fetch user profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/user/profile
 * Updates current user's profile data
 * Email cannot be changed (managed by Better Auth/Google OAuth)
 */
export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, company, title, locale, timezone } = body

    // Validate that only allowed fields are being updated
    const allowedFields = ['name', 'company', 'title', 'locale', 'timezone']
    const providedFields = Object.keys(body)
    const invalidFields = providedFields.filter(field => !allowedFields.includes(field))

    if (invalidFields.length > 0) {
      return NextResponse.json(
        { error: `Invalid fields: ${invalidFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Build update data object with only provided fields
    const updateData: {
      name?: string
      company?: string | null
      title?: string | null
      locale?: string
      timezone?: string
    } = {}

    if (name !== undefined) updateData.name = name
    if (company !== undefined) updateData.company = company
    if (title !== undefined) updateData.title = title
    if (locale !== undefined) updateData.locale = locale
    if (timezone !== undefined) updateData.timezone = timezone

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        company: true,
        title: true,
        locale: true,
        timezone: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Failed to update user profile:', error)
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    )
  }
}
