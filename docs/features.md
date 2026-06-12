# Themis Legal — Feature Changelog

This document tracks major features and improvements added to the platform.

---

## [2026-06-12] Full Google Drive Access & Shared Drives Support

### Overview
Complete overhaul of Google Drive integration to support all Drive storage locations, including organizational Shared Drives (Team Drives).

### Problem Solved
**Before:**
- Users could only access files in "My Drive"
- Shared files and folders were invisible
- Organizational Shared Drives (Team Drives) were inaccessible
- Limited to restrictive OAuth scopes (`drive.readonly` + `drive.file`)
- Could not save signed PDFs to user-specified folders

**After:**
- Full access to My Drive, Shared with me, and Shared Drives
- Industry-standard Drive permissions (same as DocuSign, HelloSign)
- Can browse and select documents from any accessible location
- Can save signed PDFs to any folder

### What Changed

#### 1. OAuth Scope Upgrade
**File:** `lib/auth.ts`

Changed from restrictive scopes to full Drive access:
```typescript
// Before
scope: [
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/drive.file",
]

// After
scope: [
  "https://www.googleapis.com/auth/drive", // Full Drive access
]
```

**Impact:** Users see updated consent screen on next login. Existing users need to re-authorize.

#### 2. Drive API Query Updates
**Files:** 
- `app/api/drive/files/route.ts`
- `app/api/drive/search/route.ts`

Added required parameters to all Drive API calls:
```typescript
{
  corpora: 'user,allDrives',           // Include My Drive + Shared Drives
  includeItemsFromAllDrives: true,     // Include shared drive items
  supportsAllDrives: true,              // Enable shared drive support
}
```

#### 3. Shared Drives (Team Drives) Implementation
**File:** `app/api/drive/files/route.ts`

Added three-tier API logic:

**At Root Level:**
- Fetches My Drive files (`'root' in parents`)
- Fetches "Shared with me" files (`sharedWithMe=true`)
- Fetches Shared Drives list (`drive.drives.list()`)
- Combines all results with Shared Drives at the top

**Browsing a Shared Drive:**
- Uses `driveId` parameter to scope queries
- Uses `corpora: 'drive'` instead of `'user,allDrives'`
- Special handling for Shared Drive root (no parent filter)

**Browsing Regular Folders:**
- Standard `'folderId' in parents` query
- Works for both My Drive and shared folders

#### 4. Frontend Navigation
**Files:**
- `app/drive/page.tsx`
- `components/drive/FilePicker.tsx`

Added state management for Shared Drives:
```typescript
const [currentDriveId, setCurrentDriveId] = useState<string | null>(null)
```

Features:
- Shared Drives appear with 📁 emoji prefix
- Clicking a Shared Drive enters that drive's context
- `currentDriveId` persists through folder navigation
- Breadcrumb navigation shows current location
- Going back to root clears `currentDriveId`

#### 5. Documentation Updates
**Files:**
- `.claude/skills/google-drive.md` — Added shared drive query patterns
- `docs/lessons.md` — Documented scope change and reasoning
- `docs/microsoft-auth-integration.md` — Created (future feature planning)

### Files Modified

```
lib/auth.ts                     —  OAuth scope change
app/api/drive/files/route.ts    —  Shared Drives logic + query fixes
app/api/drive/search/route.ts   —  Shared drive parameters
app/drive/page.tsx              —  Shared Drive navigation (browse page)
components/drive/FilePicker.tsx —  Shared Drive navigation (picker component)
app/workflows/new/page.tsx      —  DriveFile interface update
.claude/skills/google-drive.md  —  Updated patterns
docs/lessons.md                 —  Documented changes
```

**Stats:** 8 files changed, +246 insertions, -50 deletions

### How to Use

#### For End Users

1. **First Login After Update:**
   - Sign out if currently logged in
   - Sign in again with Google
   - Approve new permission: "See, edit, create, and delete all of your Google Drive files"

2. **Browsing Shared Drives:**
   - Navigate to `/drive` or start a new workflow
   - At root level, you'll see:
     - 📁 **Shared Drive Name** (your Team Drives)
     - Files/folders shared with you
     - Your My Drive files
   - Click a Shared Drive to browse its contents
   - Click folders to navigate deeper
   - Use breadcrumbs to go back

3. **Creating Workflows from Shared Drives:**
   - Start new workflow
   - Click a Shared Drive
   - Navigate to the document
   - Click "Start Workflow"
   - Works exactly like My Drive documents

#### For Developers

**API Endpoint Usage:**

```typescript
// Browse root (My Drive + Shared with me + Shared Drives)
GET /api/drive/files

// Browse a folder in My Drive or shared folder
GET /api/drive/files?folderId=xyz

// Browse root of a Shared Drive
GET /api/drive/files?driveId=abc

// Browse folder within a Shared Drive
GET /api/drive/files?folderId=xyz&driveId=abc

// Search across all accessible files
GET /api/drive/search?q=contract
```

**Response Format:**

```typescript
{
  items: [
    {
      id: string
      name: string
      mimeType: string
      modifiedTime: string | null
      size?: string
      parents?: string[]
      isSharedDrive?: boolean  // Only true for Shared Drive items at root
    }
  ],
  currentFolderId: string
  currentDriveId: string | null
}
```

### Technical Details

#### Why Full `drive` Scope?

**Alternatives considered:**
- `drive.readonly` + `drive.file` — Too restrictive, doesn't show shared files
- `drive.readonly` + custom write solution — Complex, inconsistent UX
- **`drive` (full access)** — ✅ Chosen

**Justification:**
- Industry standard (DocuSign, HelloSign, Adobe Sign all use full scope)
- Users understand why document signing needs Drive access
- We never delete or modify original files
- All access logged in audit trail
- Simplest and most reliable approach

#### Handling the `'root'` Incompatibility

**Problem:** The `'root'` keyword doesn't work with `corpora: 'user,allDrives'`

**Solution:** Conditional logic based on context:
- **Root level:** Use `corpora: 'user'` with `'root' in parents`
- **Specific folders:** Use `corpora: 'user,allDrives'`
- **Shared Drives:** Use `corpora: 'drive'` with `driveId` parameter

#### State Management

Frontend tracks two pieces of state:
- `currentFolderId` — Which folder we're viewing
- `currentDriveId` — Whether we're in a Shared Drive context

This allows proper API calls and breadcrumb navigation.

### Security & Compliance

✅ **Audit Logging:** All Drive access logged with user ID, IP, timestamp  
✅ **Document Integrity:** SHA-256 hash verification prevents tampering  
✅ **No File Storage:** Documents streamed from Drive, never saved to our servers  
✅ **Scope Transparency:** Clear explanation in UI about why Drive access is needed  
✅ **Session Security:** OAuth tokens stored securely in database, not client-side

### Known Limitations

1. **Re-authorization Required:** Existing users must sign out and back in to grant new permissions
2. **Search Scope:** File search queries all accessible locations (may be slower for large organizations)
3. **Shared Drive Permissions:** Users can only see Shared Drives they're members of (expected behavior)

### Future Enhancements

- [ ] Add Microsoft OneDrive support as alternative to Google Drive
- [ ] Add "Recent files" view across all Drive locations
- [ ] Add starred/favorited files filter
- [ ] Cache Shared Drives list for better performance
- [ ] Add Drive quota warnings for large organizations

### Testing Checklist

When deploying this feature, verify:

- [ ] OAuth consent screen shows updated permissions
- [ ] My Drive files appear at root
- [ ] "Shared with me" files appear at root
- [ ] Shared Drives appear at root with 📁 emoji
- [ ] Can click and enter a Shared Drive
- [ ] Can navigate folders within Shared Drive
- [ ] Breadcrumbs update correctly
- [ ] Search finds files in all locations
- [ ] Can select document from Shared Drive
- [ ] Can create workflow from Shared Drive document
- [ ] Audit logs record Drive access events

### Migration Notes

**For Production Deployment:**

1. **Environment Variables:** No changes needed (same `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`)

2. **Database:** No schema changes required

3. **User Communication:**
   - Send email notifying users of new Shared Drives feature
   - Explain they'll need to re-authorize on next login
   - Clarify that no data is stored, only orchestrated

4. **Rollback Plan:**
   - Revert `lib/auth.ts` to old scopes
   - Revert API route query parameters
   - Users will need to re-authorize again (downgrade permissions)

### References

- [Google Drive API Documentation](https://developers.google.com/drive/api/guides/about-sdk)
- [OAuth 2.0 Scopes for Google APIs](https://developers.google.com/identity/protocols/oauth2/scopes#drive)
- [Shared Drives API Guide](https://developers.google.com/drive/api/guides/enable-shareddrives)
- [Better Auth Documentation](https://www.better-auth.com/docs)

### Related Issues

- Initial request: User couldn't see shared documents
- Follow-up: User couldn't access organizational Shared Drives
- Resolution: Full Drive access with Shared Drives support

### Contributors

- Implementation: Claude Code
- Testing: Tim Spiridonov
- Date: 2026-06-11 to 2026-06-12

---

## Template for Future Features

```markdown
## [YYYY-MM-DD] Feature Name

### Overview
Brief description of what was added.

### Problem Solved
**Before:** What wasn't working  
**After:** What works now

### What Changed
Technical details of the implementation.

### Files Modified
List of changed files with brief descriptions.

### How to Use
User-facing instructions and developer API documentation.

### Testing Checklist
- [ ] Test case 1
- [ ] Test case 2

### Migration Notes
Deployment instructions and rollback plan.
```

---

**Last Updated:** 2026-06-12
