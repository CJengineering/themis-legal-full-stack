import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./prisma"
import { writeAuditLog } from "./audit"

// Hardcoded email allowlist (will move to env var + DB later)
const AUTHORIZED_EMAILS = [
  "tim@communityjameel.org",
  "timour.spiridonov@gmail.com"
]

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: false, // OAuth only for now
  },
  socialProviders: process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      scope: [
        "openid",
        "email",
        "profile",
        "https://www.googleapis.com/auth/drive.readonly",
        "https://www.googleapis.com/auth/drive.file",
      ],
    },
    // Microsoft will be added later
  } : {},
  user: {
    // Additional user fields that we already have in Prisma schema
    additionalFields: {
      company: {
        type: "string",
        required: false,
      },
      title: {
        type: "string",
        required: false,
      },
      locale: {
        type: "string",
        required: false,
        defaultValue: "en",
      },
      timezone: {
        type: "string",
        required: false,
        defaultValue: "UTC",
      },
    },
  },
  callbacks: {
    async signIn({ user, request }: { user: { email: string; id: string; name: string }; request?: Request }) {
      // Check allowlist - block unauthorized emails
      if (!AUTHORIZED_EMAILS.includes(user.email)) {
        throw new Error("Access not authorized")
      }

      // Write AUTH_SUCCESS audit log (no workflow context for auth events)
      const ipAddress = request?.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
      const userAgent = request?.headers.get('user-agent') ?? 'unknown'

      await writeAuditLog({
        workflowId: null,
        eventType: 'AUTH_SUCCESS',
        actorId: user.id,
        ipAddress,
        userAgent,
        metadata: {
          email: user.email,
          provider: 'google', // Currently only Google OAuth is enabled
        },
      })

      return true
    },
  },
})

export type Session = typeof auth.$Infer.Session.session
export type User = typeof auth.$Infer.Session.user
