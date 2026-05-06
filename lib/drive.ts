import { google } from 'googleapis'
import { prisma } from './prisma'

/**
 * Get a configured Google Drive v3 client for the given user.
 * Automatically refreshes expired access tokens.
 *
 * @throws Error if user has no Google account connected or refresh fails
 */
export async function getDriveClient(userId: string) {
  // Fetch the user's Google OAuth account
  const account = await prisma.account.findFirst({
    where: {
      userId,
      providerId: 'google',
    },
  })

  if (!account) {
    throw new Error('No Google account connected for this user')
  }

  if (!account.accessToken) {
    throw new Error('No access token found for Google account')
  }

  // Initialize OAuth2 client
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )

  // Set credentials
  oauth2Client.setCredentials({
    access_token: account.accessToken,
    refresh_token: account.refreshToken ?? undefined,
    expiry_date: account.accessTokenExpiresAt?.getTime(),
  })

  // If token is expired, refresh it
  const now = new Date()
  if (account.accessTokenExpiresAt && account.accessTokenExpiresAt < now) {
    try {
      const { credentials } = await oauth2Client.refreshAccessToken()

      // Update DB with new tokens
      await prisma.account.update({
        where: { id: account.id },
        data: {
          accessToken: credentials.access_token ?? account.accessToken,
          accessTokenExpiresAt: credentials.expiry_date
            ? new Date(credentials.expiry_date)
            : account.accessTokenExpiresAt,
          refreshToken: credentials.refresh_token ?? account.refreshToken,
        },
      })

      // Update oauth2Client with refreshed credentials
      oauth2Client.setCredentials(credentials)
    } catch (error) {
      console.error('Failed to refresh access token:', error)
      throw new Error('Failed to refresh Google Drive access token')
    }
  }

  // Return configured Drive v3 client
  return google.drive({ version: 'v3', auth: oauth2Client })
}

/**
 * Check if a user has Drive access connected.
 * Does NOT make API calls — just checks DB for stored credentials.
 */
export async function hasDriveAccess(userId: string): Promise<boolean> {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      providerId: 'google',
    },
  })

  if (!account?.accessToken) {
    return false
  }

  // Check if scope includes drive.file or drive.readonly
  return account.scope?.includes('drive') ?? false
}
