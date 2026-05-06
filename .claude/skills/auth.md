# Auth skill — Better Auth (Google + Microsoft, allowlist only)

## Package: better-auth

## Protect an API route
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

const session = await auth.api.getSession({ headers: await headers() })
if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
// session.user.id, session.user.email

## Protect a Server Component
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

const session = await auth.api.getSession({ headers: await headers() })
if (!session) redirect('/login')

## Client-side session
import { useSession } from '@/lib/auth-client'
const { data: session, isPending } = useSession()

## Trigger sign-in (client)
import { signIn } from '@/lib/auth-client'
signIn.social({ provider: 'google', callbackURL: '/dashboard' })
signIn.social({ provider: 'microsoft', callbackURL: '/dashboard' })

## Allowlist
Managed in AUTHORIZED_EMAILS env var + hardcoded array in lib/auth.ts.
If a user signs in with an email not on the list, the signIn callback throws
and Better Auth shows an error — user never gets a session.

## Signer identity verification
Same as before — check session.user.email against Signer.email in DB.