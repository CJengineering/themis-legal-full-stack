# DB schema reference — load when writing Prisma queries or migrations

## Core models

### User
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  company       String?
  title         String?
  passwordHash  String?
  twoFactorSecret String?
  locale        String    @default("en")
  timezone      String    @default("UTC")
  createdAt     DateTime  @default(now())
  accounts      Account[]
  workflows     Workflow[] @relation("CreatedBy")
  signers       Signer[]
  auditLogs     AuditLog[]
  driveSettings DriveSettings?
}
```

### Workflow
```prisma
model Workflow {
  id             String         @id @default(cuid())
  name           String
  status         WorkflowStatus @default(DRAFT)
  creatorId      String
  creator        User           @relation("CreatedBy", fields: [creatorId], references: [id])
  driveFileId    String         // Google Drive file ID of source doc
  driveFolderId  String?        // destination folder for signed doc
  documentHash   String         // SHA-256 of source document at creation
  signedFileId   String?        // Drive file ID of completed signed doc
  createdAt      DateTime       @default(now())
  completedAt    DateTime?
  cancelledAt    DateTime?
  signers        Signer[]
  fields         SignatureField[]
  auditLogs      AuditLog[]
}

enum WorkflowStatus { DRAFT ACTIVE COMPLETED CANCELLED }
```

### Signer
```prisma
model Signer {
  id                String       @id @default(cuid())
  workflowId        String
  workflow          Workflow     @relation(fields: [workflowId], references: [id])
  userId            String?      // set when signer has a Themis account
  user              User?        @relation(fields: [userId], references: [id])
  email             String
  name              String
  order             Int          // signing sequence: 0, 1, 2...
  status            SignerStatus @default(PENDING)
  consentGiven      Boolean      @default(false)
  consentTimestamp  DateTime?
  signedAt          DateTime?
  lastReminderSentAt DateTime?
  fields            SignatureField[]
}

enum SignerStatus { PENDING NOTIFIED SIGNING SIGNED }
```

### SignatureField
```prisma
model SignatureField {
  id          String    @id @default(cuid())
  workflowId  String
  workflow    Workflow  @relation(fields: [workflowId], references: [id])
  signerId    String
  signer      Signer    @relation(fields: [signerId], references: [id])
  type        FieldType
  page        Int
  x           Float     // % of page width
  y           Float     // % of page height
  width       Float
  height      Float
  value       String?   // base64 sig image or ISO date string
  completedAt DateTime?
}

enum FieldType { SIGNATURE INITIALS DATE }
```

### AuditLog
```prisma
model AuditLog {
  id          String         @id @default(cuid())
  workflowId  String
  workflow    Workflow       @relation(fields: [workflowId], references: [id])
  eventType   AuditEventType
  actorId     String
  actor       User           @relation(fields: [actorId], references: [id])
  ipAddress   String
  userAgent   String
  metadata    Json?
  timestamp   DateTime       @default(now())
  // NO updatedAt — audit rows are immutable
}
```

### DriveSettings
```prisma
model DriveSettings {
  id              String  @id @default(cuid())
  userId          String  @unique
  user            User    @relation(fields: [userId], references: [id])
  saveLocation    String  @default("SAME_FOLDER") // SAME_FOLDER | SPECIFIC_FOLDER | ASK
  targetFolderId  String?
  namingPattern   String  @default("{name}_Signed_{date}")
  autoSave        Boolean @default(true)
}
```

## Key indexes to always include on migrations
```prisma
@@index([workflowId])       // on Signer, SignatureField, AuditLog
@@index([email])            // on Signer
@@index([status])           // on Workflow, Signer
@@index([creatorId])        // on Workflow
@@index([timestamp])        // on AuditLog
```
