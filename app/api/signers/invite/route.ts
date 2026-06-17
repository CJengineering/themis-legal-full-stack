import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendSignerCredentials, sendAdminNewUserNotification } from '@/lib/email'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Generate secure random password
function generatePassword(length = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  const values = crypto.randomBytes(length)
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset[values[i] % charset.length]
  }
  return password
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check that user is ADMIN
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (adminUser?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only administrators can invite signers' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await req.json()
    const { email, name } = body

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      )
    }

    // Generate secure password
    const password = generatePassword()

    // Create user account using Better Auth
    const result = await auth.api.signUpEmail({
      body: {
        email: email.toLowerCase(),
        password,
        name,
      },
    })

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Update user role to SIGNER
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { role: 'SIGNER' },
    })

    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login`

    // 1. Send credentials to the new user
    await sendSignerCredentials({
      to: email.toLowerCase(),
      signerName: name,
      email: email.toLowerCase(),
      password,
      loginUrl,
    })

    // 2. Send confirmation copy to the admin who created the account
    await sendAdminNewUserNotification({
      to: session.user.email,
      adminName: session.user.name ?? session.user.email,
      newUserName: name,
      newUserEmail: email.toLowerCase(),
      password,
    })

    return NextResponse.json({
      success: true,
      message: 'Signer account created. Credentials emailed to the user and a copy sent to you.',
    })
  } catch (error) {
    console.error('Error inviting signer:', error)
    return NextResponse.json(
      { error: 'Failed to create signer account' },
      { status: 500 }
    )
  }
}
