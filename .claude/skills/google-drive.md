# Google Drive skill — load when working on Drive integration (CJ-616, CJ-617, CJ-621, CJ-629)

## Core rule — NEVER violate this
Themis does NOT store document content. No blobs in DB, no files on disk,
no caching file content in memory beyond a single streaming request.
Google Drive is the single source of truth for all documents.

## CRITICAL: Shared Drive Support
**EVERY Drive API operation must include `supportsAllDrives: true` when working with files that might be in Shared Drives.**
This applies to ALL operations: `files.get()`, `files.list()`, `files.create()`, `files.update()`, etc.
Without this parameter, files in Shared Drives will return 404 "File not found" errors even when the user has access.

## OAuth Scope
As of 2026-06-11, we use full Drive access:
- `https://www.googleapis.com/auth/drive` — Full access to read all files (including shared) and write signed PDFs to user-specified folders
- This is the industry standard for e-signature platforms (DocuSign, HelloSign, etc.)
- All Drive API calls must include `corpora`, `includeItemsFromAllDrives`, and `supportsAllDrives` parameters to access shared files and Shared Drives

## Auth setup
Use the user's OAuth access token from NextAuth Account table:
```typescript
import { getToken } from 'next-auth/jwt'

const token = await getToken({ req })
const accessToken = token?.accessToken as string
// Refresh if expired using token.refreshToken
```

## Drive client initialisation
```typescript
import { google } from 'googleapis'

function getDriveClient(accessToken: string) {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: accessToken })
  return google.drive({ version: 'v3', auth })
}
```

## Listing files (CJ-617)
```typescript
const drive = getDriveClient(accessToken)
const res = await drive.files.list({
  q: "mimeType='application/pdf' or mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document'",
  fields: 'files(id, name, mimeType, modifiedTime, parents, size)',
  pageSize: 50,
  orderBy: 'modifiedTime desc',
  corpora: 'user,allDrives',           // Include both My Drive and Shared Drives
  includeItemsFromAllDrives: true,     // Include files from shared drives
  supportsAllDrives: true,              // Enable shared drive support
})
return res.data.files
```

## Fetching a single file
```typescript
// Get file metadata
const metadata = await drive.files.get({
  fileId,
  fields: 'id, name, mimeType, parents',
  supportsAllDrives: true, // REQUIRED for shared drive files
})

// Get file content
const response = await drive.files.get(
  { fileId, alt: 'media', supportsAllDrives: true },
  { responseType: 'stream' }
)
```

## Saving completed signed document (CJ-629)
```typescript
// Stream PDF back to Drive — do NOT buffer entire file
const drive = getDriveClient(accessToken)
await drive.files.create({
  requestBody: {
    name: `${originalName}_Signed_${format(new Date(), 'yyyy-MM-dd')}`,
    parents: [destinationFolderId],
    mimeType: 'application/pdf',
  },
  media: {
    mimeType: 'application/pdf',
    body: pdfStream,   // Node.js Readable stream
  },
  fields: 'id',
  supportsAllDrives: true, // REQUIRED when uploading to shared drive folders
})
```

## Browsing folders (CJ-617)
```typescript
// List folders only
const res = await drive.files.list({
  q: `'${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
  fields: 'files(id, name)',
  corpora: 'user,allDrives',           // Include both My Drive and Shared Drives
  includeItemsFromAllDrives: true,     // Include folders from shared drives
  supportsAllDrives: true,              // Enable shared drive support
})
```

## Error handling
Always handle these Drive API errors explicitly:
- 401 → access token expired → trigger refresh → retry once
- 403 → insufficient scope → show "reconnect Drive" UI
- 404 → file deleted from Drive → mark workflow as errored
