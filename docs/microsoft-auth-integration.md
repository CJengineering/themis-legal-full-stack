# Microsoft Account Integration for Themis Legal

**Date:** 2026-06-11  
**Status:** Not yet implemented (Google OAuth only currently active)

## Current State

### What's Working
- ✅ Better Auth v1.6.3 installed (supports Microsoft OAuth out of the box)
- ✅ Google OAuth fully functional with Drive API scopes
- ✅ Email allowlist enforced in `lib/auth.ts`
- ✅ Audit logging on successful authentication
- ✅ Database schema supports multiple OAuth providers via `Account` table

### What's Missing for Microsoft
- ❌ Microsoft OAuth credentials (Client ID + Client Secret)
- ❌ Microsoft provider configuration in `lib/auth.ts`
- ❌ "Sign in with Microsoft" button on login page
- ❌ Provider detection in auth callback (currently hardcoded to 'google')

---

## How Microsoft Authentication Would Work

### For Workflow Creators
1. User clicks "Sign in with Microsoft" on `/login` page
2. Redirected to Microsoft's OAuth consent screen
3. After consent, redirected back to Themis with access token
4. Better Auth creates or updates `Account` record with `providerId = "microsoft"`
5. Email checked against allowlist (`AUTHORIZED_EMAILS` in `lib/auth.ts`)
6. Session created, audit log written with `AUTH_SUCCESS` event
7. User lands on `/dashboard`

### For Signers
**Important:** Signers don't need to be on the allowlist for authentication to work. The signing flow works like this:

1. Signer receives email invitation with link to `/sign/[workflowId]`
2. Page checks if user has a session:
   - **If logged in:** Verify `session.user.email` matches `Signer.email` in database
   - **If not logged in:** Redirect to `/login?from=/sign/[workflowId]`
3. Signer signs in with Microsoft (or Google)
4. After successful OAuth, Better Auth callback runs:
   - **Current issue:** Allowlist check will BLOCK non-allowlisted signers
   - **Solution needed:** Conditional allowlist bypass for signer authentication (see below)

---

## Required Changes

### 1. Environment Variables

Add to `.env.local` (and eventually to Vercel):

```bash
# Microsoft OAuth (Azure AD App Registration)
MICROSOFT_CLIENT_ID="your-azure-app-client-id"
MICROSOFT_CLIENT_SECRET="your-azure-app-client-secret"
MICROSOFT_TENANT_ID="common"  # Or specific tenant ID for single-tenant app
```

### 2. Azure AD App Registration Setup

To get the credentials above:

1. Go to [Azure Portal](https://portal.azure.com) → **App Registrations** → **New registration**
2. **Name:** "Themis Legal Signing Platform"
3. **Supported account types:** 
   - Choose "Accounts in any organizational directory and personal Microsoft accounts" for widest compatibility
   - Or "Accounts in this organizational directory only" if you want to restrict to a specific organization
4. **Redirect URI:** 
   - Platform: Web
   - URL: `http://localhost:3000/api/auth/callback/microsoft` (dev)
   - URL: `https://themis.communityjameel.io/api/auth/callback/microsoft` (prod)
5. After creation:
   - Copy **Application (client) ID** → use as `MICROSOFT_CLIENT_ID`
   - Go to **Certificates & secrets** → **New client secret** → copy value → use as `MICROSOFT_CLIENT_SECRET`
   - Note the **Directory (tenant) ID** → use as `MICROSOFT_TENANT_ID` (or use "common")

### 3. Code Changes

#### `lib/auth.ts` — Add Microsoft Provider

**Current code (line 31-44):**
```typescript
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
```

**Updated code:**
```typescript
socialProviders: {
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? {
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
  } : {}),
  ...(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET ? {
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      tenantId: process.env.MICROSOFT_TENANT_ID || "common",
      // Microsoft scopes for basic auth (no Drive access needed)
      scope: [
        "openid",
        "email",
        "profile",
      ],
    },
  } : {}),
},
```

#### `lib/auth.ts` — Fix Provider Detection in Callback

**Current code (line 69-92):**
```typescript
callbacks: {
  async signIn({ user, request, account }: { 
    user: { email: string; id: string; name: string }; 
    request?: Request;
    account?: { providerId: string };  // Add account parameter
  }) {
    // Check allowlist - block unauthorized emails
    if (!AUTHORIZED_EMAILS.includes(user.email)) {
      throw new Error("Access not authorized")
    }

    // Write AUTH_SUCCESS audit log
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
        provider: account?.providerId || 'unknown',  // Dynamic provider detection
      },
    })

    return true
  },
},
```

#### `app/(auth)/login/page.tsx` — Add Microsoft Button

**Add after the Google button (after line 64):**

```tsx
<button
  onClick={() => signIn.social({
    provider: "microsoft",
    callbackURL: from,
  })}
  className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors mt-3"
>
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path fill="#f25022" d="M1 1h10v10H1z"/>
    <path fill="#00a4ef" d="M13 1h10v10H13z"/>
    <path fill="#7fba00" d="M1 13h10v10H1z"/>
    <path fill="#ffb900" d="M13 13h10v10H13z"/>
  </svg>
  Sign in with Microsoft
</button>
```

---

## Signer Authentication Strategy

### Problem
Current implementation blocks all non-allowlisted emails in the `signIn` callback. This means:
- ✅ Workflow creators can sign in (they're on the allowlist)
- ❌ External signers CANNOT sign in (they're not on the allowlist)

### Solution Options

#### Option A: Conditional Allowlist (Recommended)
Check if the user is trying to authenticate as a signer before enforcing allowlist:

```typescript
callbacks: {
  async signIn({ user, request }: { 
    user: { email: string; id: string; name: string }; 
    request?: Request;
  }) {
    // Check if this email is a pending signer in any active workflow
    const pendingSigner = await prisma.signer.findFirst({
      where: {
        email: user.email.toLowerCase(),
        status: { in: ['PENDING', 'NOTIFIED', 'SIGNING'] },
        workflow: { status: 'ACTIVE' },
      },
    })

    // Allow signers to authenticate, enforce allowlist for everyone else
    if (!pendingSigner && !AUTHORIZED_EMAILS.includes(user.email)) {
      throw new Error("Access not authorized")
    }

    // ... rest of callback
  },
},
```

**Pros:**
- Signers can authenticate without being on allowlist
- Security maintained for dashboard access
- No separate login pages needed

**Cons:**
- Adds database query on every sign-in
- Signers could theoretically access dashboard if they sign in before being assigned

#### Option B: Public Sign-In, Protected Routes
Remove the allowlist from `signIn` callback entirely. Check permissions at the route level instead:

```typescript
// In dashboard pages and API routes
const session = await auth.api.getSession({ headers: await headers() })
if (!session) redirect('/login')

if (!AUTHORIZED_EMAILS.includes(session.user.email)) {
  return { error: 'Access denied' }
}

// In signing pages
const signer = await prisma.signer.findFirst({
  where: { 
    email: session.user.email.toLowerCase(),
    workflowId: params.id,
  },
})
if (!signer) return { error: 'Not authorized to sign this document' }
```

**Pros:**
- Cleaner separation of concerns
- More flexible for future features (e.g., viewer-only accounts)
- No extra DB query on every sign-in

**Cons:**
- Must protect EVERY route individually
- Risk of forgetting to add protection to new routes

#### Option C: Two Better Auth Instances (Not Recommended)
Create separate auth configurations for creators vs. signers.

**Pros:**
- Complete isolation
- Different session durations, security policies, etc.

**Cons:**
- Complex to maintain
- Duplicate code
- Confusing for users who might be both a creator and a signer

---

## Recommended Implementation Plan

### Phase 1: Add Microsoft for Creators Only
1. Set up Azure AD App Registration
2. Add environment variables to `.env.local` and Vercel
3. Update `lib/auth.ts` to add Microsoft provider
4. Add "Sign in with Microsoft" button to login page
5. Test with allowlisted Microsoft accounts
6. Fix provider detection in audit logs

**Estimated effort:** 2-3 hours

### Phase 2: Enable Signer Authentication
1. Decide on signer authentication strategy (recommend Option A)
2. Update `signIn` callback to allow pending signers
3. Add middleware to protect dashboard routes from non-allowlisted users
4. Test full signing flow with external Microsoft accounts
5. Update docs/lessons.md with new patterns

**Estimated effort:** 4-6 hours

### Phase 3: Production Deployment
1. Add production redirect URIs to Azure AD app
2. Deploy environment variables to Vercel
3. Test both providers in production
4. Monitor audit logs for auth failures
5. Update user documentation

**Estimated effort:** 2-3 hours

---

## Testing Checklist

### Google OAuth (Existing)
- [ ] Allowlisted user can sign in with Google
- [ ] Non-allowlisted user is blocked
- [ ] Drive scopes are granted
- [ ] Audit log records 'google' as provider

### Microsoft OAuth (New)
- [ ] Allowlisted user can sign in with Microsoft
- [ ] Non-allowlisted user is blocked (Phase 1)
- [ ] Audit log records 'microsoft' as provider
- [ ] Session persists across page reloads

### Signer Flow (Phase 2)
- [ ] External signer receives email with signing link
- [ ] Signer can authenticate with Microsoft (not on allowlist)
- [ ] Signer email matches `Signer.email` in database
- [ ] Signer can only access their assigned workflow
- [ ] Signer CANNOT access dashboard or create workflows
- [ ] Audit log records signer authentication

### Edge Cases
- [ ] User switches from Google to Microsoft for same email
- [ ] User has both Google and Microsoft accounts with different emails
- [ ] Session expires during signing flow
- [ ] OAuth consent denied/cancelled
- [ ] Azure AD app credentials expire

---

## Security Considerations

### Microsoft-Specific Risks
1. **Tenant Isolation:** Using `tenantId: "common"` allows any Microsoft account. Consider restricting to specific tenant if only Community Jameel employees should use Microsoft auth.

2. **Email Verification:** Microsoft accounts are email-verified by default, but check `email_verified` claim if needed.

3. **Account Linking:** If a user signs in with Google (`user@example.com`) then later tries Microsoft with the same email, Better Auth will link the accounts automatically via the `Account` table.

### Signer Security
1. **Email Matching:** Always use case-insensitive email comparison (`toLowerCase()`)
2. **Workflow Context:** Signers should only access workflows where they're assigned
3. **Session Duration:** Consider shorter sessions for signers vs. creators
4. **IP Logging:** Already implemented in audit logs — good for compliance

---

## Documentation Updates Needed

After implementation, update:
- [ ] `CLAUDE.md` — Add Microsoft to auth skill reference
- [ ] `.claude/skills/auth.md` — Add Microsoft sign-in example
- [ ] `docs/lessons.md` — Add entry about conditional allowlist pattern
- [ ] `README.md` — Add Azure AD setup instructions
- [ ] User-facing docs — Mention both Google and Microsoft are supported

---

## Open Questions

1. **Drive Access for Microsoft Users:** Microsoft accounts won't have Google Drive access. How should this work?
   - Option A: Require Microsoft users to also link a Google account for Drive scopes
   - Option B: Allow Microsoft-only creators to use OneDrive/SharePoint (major feature addition)
   - Option C: Microsoft users are signers-only, not creators (simplest)

2. **Session Duration:** Should Microsoft sessions have different expiry than Google?

3. **Branding:** Should the login page show "Community Jameel" branding to clarify this is the organization's app?

4. **Error Messages:** What should non-allowlisted users see when blocked? Current message is generic.

---

## Useful Resources

- [Better Auth Microsoft Provider Docs](https://www.better-auth.com/docs/providers/microsoft)
- [Azure AD App Registration Guide](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app)
- [Microsoft OAuth Scopes Reference](https://learn.microsoft.com/en-us/entra/identity-platform/scopes-oidc)
- [Better Auth Callbacks API](https://www.better-auth.com/docs/concepts/callbacks)
