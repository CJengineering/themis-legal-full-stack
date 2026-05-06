import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Prevent multiple Prisma Client instances during Next.js hot reload in development
// This is critical for avoiding "too many clients" errors in dev mode
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | undefined
}

// Get DATABASE_URL and ensure it's a string
const connectionString = process.env.DATABASE_URL

// During build time, DATABASE_URL might not be available - that's OK since
// we don't actually connect to the DB during builds, only during runtime
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build'

let prismaInstance: PrismaClient

if (!connectionString && !isBuildTime) {
  throw new Error('DATABASE_URL environment variable is not set')
}

if (connectionString) {
  // Create connection pool for PostgreSQL (reuse across hot reloads)
  const pool = globalForPrisma.pool ?? new Pool({ connectionString })
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.pool = pool
  }

  const adapter = new PrismaPg(pool)

  prismaInstance =
    globalForPrisma.prisma ??
    new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    })

  // In development, store the Prisma Client on globalThis to preserve it across hot reloads
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance
  }
} else {
  // Build time fallback - create a basic Prisma client without adapter
  // This won't actually connect but allows the module to load
  prismaInstance = new PrismaClient()
}

export const prisma = prismaInstance
