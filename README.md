# Themis Legal - E-Signature Platform

A professional e-signature application mockup built with Next.js, designed for lawyers and legal professionals to create, manage, and sign legal documents digitally.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Application Structure](#application-structure)
- [Pages & Features](#pages--features)
  - [Dashboard](#dashboard)
  - [Documents](#documents)
  - [Document Editor](#document-editor)
  - [Document View](#document-view)
  - [Signing Experience](#signing-experience)
  - [Templates](#templates)
  - [Signatures](#signatures)
  - [Google Drive Integration](#google-drive-integration)
  - [Settings](#settings)
- [Components](#components)
- [Design System](#design-system)
- [Development](#development)

---

## Overview

Themis Legal is a UI/UX mockup for a professional e-signature platform tailored for legal professionals. The application demonstrates a complete workflow for:

- Creating legal documents (contracts, NDAs, authorizations)
- Adding signature fields and managing signers
- Sequential signing workflows
- Document tracking and management
- Cloud storage integration (Google Drive)

**Note:** This is a frontend mockup with mock data. No actual backend or database integration is implemented.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui
- **Icons:** Lucide React

---

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/LeDjinn/v0-e-signature-app-mockup.git
cd v0-e-signature-app-mockup

# Install dependencies
npm install
# or
yarn install
# or
pnpm install

# Run the development server
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Application Structure

```
app/
├── page.tsx                    # Dashboard (home page)
├── documents/
│   ├── page.tsx               # Documents list
│   ├── new/
│   │   └── page.tsx           # Document editor (create new)
│   └── [id]/
│       └── page.tsx           # Document view (completed document)
├── templates/
│   └── page.tsx               # Templates library
├── signatures/
│   └── page.tsx               # Signature requests
├── sign/
│   └── [documentId]/
│       └── page.tsx           # Signing experience
├── drive/
│   └── page.tsx               # Google Drive integration
├── settings/
│   └── page.tsx               # User settings
└── layout.tsx                 # Root layout

components/
├── app-sidebar.tsx            # Main navigation sidebar
├── document-card.tsx          # Document list item card
├── stats-cards.tsx            # Dashboard statistics
├── block-editor.tsx           # Rich text document editor
├── signature-field-dialog.tsx # Add signature field modal
├── signer-management.tsx      # Manage document signers
├── signature-pad.tsx          # Draw/type signature component
└── ui/                        # shadcn/ui components
```

---

## Pages & Features

### Dashboard

**Route:** `/`

The main landing page providing an overview of all document activity.

**Features:**
- **Statistics Cards:** Display key metrics including:
  - Total Documents count
  - Pending Signatures awaiting action
  - Completed Documents this month
  - Average completion time

- **Recent Documents List:** Shows the most recent documents with:
  - Document title and type badge (Contract, NDA, Authorization)
  - Status indicator (Draft, Pending, Waiting, Completed)
  - Signer progress (e.g., "1 of 3 signed")
  - Last updated timestamp
  - Created by information

- **Document Filtering:** 
  - Tabs: All, Drafts, Pending, Completed
  - Search by document name
  - Filter by document type
  - Sort by date or name

- **Quick Actions:**
  - "New Document" button to create documents

---

### Documents

**Route:** `/documents`

Complete document management interface.

**Features:**
- **Full Document List:** All documents with detailed information
- **Status Tabs:** 
  - All (total count)
  - Drafts (unsigned documents)
  - Pending (awaiting signatures)
  - Completed (fully signed)

- **Search & Filter:**
  - Text search across document titles
  - Type filter (Contracts, NDAs, Authorizations)
  - Sort options (Most Recent, Oldest, Name A-Z, Name Z-A)

- **Document Cards:** Each document displays:
  - Title and document type
  - Current status with visual indicator
  - Signer progress bar
  - Dropdown menu with actions (Edit, Download, Delete)

---

### Document Editor

**Route:** `/documents/new`

Rich document creation interface with WYSIWYG editing.

**Features:**
- **Document Type Selection:**
  - Contract
  - Non-Disclosure Agreement (NDA)
  - Authorization Letter

- **Pre-filled Legal Templates:** Each document type includes realistic legal content:
  - **NDA:** Full confidentiality agreement with Articles covering:
    - Definitions
    - Obligations of Receiving Party
    - Intellectual Property Rights
    - Term and Termination
    - Remedies
    - General Provisions
  
  - **Contract:** Professional Services Agreement with:
    - Engagement terms
    - Compensation structure
    - Term and termination clauses
    - Intellectual property provisions
    - Limitation of liability
  
  - **Authorization:** Grant of Authority with:
    - Scope of authority
    - Limitations
    - Acknowledgments

- **Rich Text Editing Toolbar:**
  - Bold, Italic, Underline formatting
  - Heading levels (H1, H2, H3)
  - Bullet and numbered lists
  - Text alignment (left, center, right, justify)
  - Undo/Redo actions

- **Signature Field Insertion:**
  - Click to add signature fields at any position
  - Assign fields to specific signers
  - Choose field types (Signature, Initials, Date)
  - Mark fields as required or optional

- **Signer Management Panel:**
  - Add multiple signers with name and email
  - Drag-and-drop to reorder signing sequence
  - Define signing order (sequential or parallel)
  - Send invitation emails to signers

- **Document Preview:**
  - Professional PDF-like preview
  - Paper-style formatting (8.5" x 11")
  - Legal typography (serif fonts, justified text)

- **Save Options:**
  - Save as Draft
  - Send for Signature

---

### Document View

**Route:** `/documents/[id]`

View completed and signed documents with professional PDF-style rendering.

**Features:**
- **Professional Document Display:**
  - Law firm letterhead with logo
  - Document reference number
  - Formal legal formatting
  - Signature blocks with verification badges

- **Document Header:**
  - Back navigation
  - Status badge (Completed, Pending, etc.)
  - Document type indicator
  - Creation date and author

- **Status Panel:**
  - Signing progress (e.g., "2 of 2 signed - 100%")
  - Progress bar visualization
  - Completion timestamp

- **Signers List:**
  - All signers with their roles
  - Signature verification status (green checkmark)
  - Signing timestamps

- **Export Options:**
  - Download PDF
  - Save to Google Drive
  - Send copy via Email
  - Export to Google Drive

- **Audit Trail:**
  - Complete history of document actions
  - Timestamps for each event
  - User identification for each action

---

### Signing Experience

**Route:** `/sign/[documentId]`

Clean, focused interface for signers to review and sign documents.

**Features:**
- **Signer Verification:**
  - Email verification step
  - Signer identification

- **Document Review:**
  - Full scrollable document preview
  - Professional legal document formatting
  - Highlighted signature fields

- **Signing Progress:**
  - Multi-step progress indicator
  - Current step highlighting
  - Remaining steps count

- **Signature Creation:**
  - **Draw Tab:** Canvas for hand-drawn signatures
    - Mouse/touch drawing support
    - Clear and redo options
    - Multiple stroke colors
  
  - **Type Tab:** Stylized font signatures
    - Multiple font style options (Elegant, Classic, Modern, Formal)
    - Real-time preview
    - Custom text input

- **Legal Agreement:**
  - Checkbox for electronic signature consent
  - Terms and conditions link
  - Legal disclaimer text

- **Signature Placement:**
  - Click to place signature in designated fields
  - Preview before confirming
  - Edit option before final submission

- **Completion:**
  - Success confirmation
  - Option to download signed copy
  - Return to dashboard

---

### Templates

**Route:** `/templates`

Reusable document template library.

**Features:**
- **Pre-built Templates:**
  - Standard Contract
  - Non-Disclosure Agreement
  - Employment Contract
  - Authorization Letter
  - Service Agreement
  - Confidentiality Agreement

- **Template Cards:** Each template shows:
  - Template name and icon
  - Description of use case
  - Usage count statistics
  - "Use Template" quick action

- **Template Management:**
  - Edit existing templates
  - Duplicate templates
  - Delete templates
  - View template details

- **Create Template Dialog:**
  - Template name input
  - Document type selection (Contract, NDA, Authorization, Employment, Service, Other)
  - Description field
  - Starting options:
    - Blank Template (start from scratch)
    - Upload Document (import existing file)

---

### Signatures

**Route:** `/signatures`

Manage incoming signature requests and view signing history.

**Features:**
- **Pending Signatures Tab:**
  - Documents awaiting your signature
  - Request details (who requested, when)
  - Due dates
  - Signing position (e.g., "3 of 4")
  - Status indicators:
    - "Ready to Sign" - Your turn to sign
    - "Waiting" - Waiting for previous signers
  - Quick "Sign Now" action for ready documents

- **Completed Signatures Tab:**
  - History of documents you've signed
  - Signing dates
  - Requester information
  - "View Document" link

- **Empty State:**
  - Friendly message when no pending signatures

---

### Google Drive Integration

**Route:** `/drive`

Connect and sync documents with Google Drive.

**Features:**
- **Connection Status:**
  - Current connection state
  - Connected Google account email
  - Last sync timestamp

- **Connect/Disconnect:**
  - OAuth flow initiation
  - Account switching
  - Disconnect option

- **Sync Settings:**
  - **Auto-sync completed documents:** Toggle to automatically save signed documents
  - **Default folder selection:** Choose where to save documents
  - Custom folder path input

- **Sync History:**
  - List of recently synced documents
  - Sync timestamps
  - Document titles
  - View in Drive links

- **Manual Sync:**
  - Sync now button
  - Last sync time display

---

### Settings

**Route:** `/settings`

User account and application preferences.

**Features:**

#### Profile Tab
- **Personal Information:**
  - First name / Last name
  - Email address
  - Company / Organization
  - Job title
  - Save changes button

- **Default Signature:**
  - Preview of current signature
  - Update signature option

#### Notifications Tab
- **Email Notification Toggles:**
  - Signature requests (when you need to sign)
  - Signature reminders (for pending signatures)
  - Completion notifications (when documents are fully signed)

#### Security Tab
- **Password Management:**
  - Current password verification
  - New password input
  - Confirm new password
  - Update password button

- **Two-Factor Authentication:**
  - Current status display
  - Enable/Disable toggle
  - Setup flow

#### Preferences Tab
- **Regional Settings:**
  - Language selection (English US, English UK, Spanish, French, German)
  - Timezone selection (PT, MT, CT, ET, UTC)
  - Date format (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
  - Save preferences button

---

## Components

### App Sidebar (`components/app-sidebar.tsx`)
Fixed navigation sidebar with:
- Logo and branding
- Navigation links (Dashboard, Documents, Templates, Signatures)
- Integrations section (Google Drive)
- Settings link
- User profile section

### Document Card (`components/document-card.tsx`)
Reusable card component displaying:
- Document title
- Type badge with icon
- Status indicator with color coding
- Signer progress
- Timestamp
- Action dropdown menu

### Stats Cards (`components/stats-cards.tsx`)
Dashboard metrics cards showing:
- Total document count
- Pending signatures
- Completed this month
- Average completion time

### Block Editor (`components/block-editor.tsx`)
Rich text editor with:
- Formatting toolbar
- Document type templates
- Real-time editing
- Signature field insertion

### Signature Pad (`components/signature-pad.tsx`)
Signature input component with:
- Canvas drawing mode
- Typed signature mode
- Multiple font styles
- Clear/redo functionality

### Signer Management (`components/signer-management.tsx`)
Signer configuration panel with:
- Add/remove signers
- Email validation
- Drag-and-drop reordering
- Signing order configuration

---

## Design System

### Color Palette
The application uses a vibrant primary color scheme:
- **Primary:** Crimson Red (#d02146)
- **Accent:** Magenta Pink (#ff00c1)
- **Secondary:** Purple (#9600ff)
- **Background:** Light neutral
- **Sidebar:** Dark charcoal

### Typography
- **Headings:** Sans-serif (Geist)
- **Body:** Sans-serif (Geist)
- **Legal Documents:** Serif (Times New Roman style)

### Status Colors
- **Draft:** Gray
- **Pending:** Amber/Yellow
- **Waiting:** Blue
- **Completed:** Green
- **Error:** Red

---

## Development

### Built with v0

This project was created with [v0.dev](https://v0.dev) by Vercel.

[Continue working on v0 →](https://v0.app/chat/projects/prj_12W442weWQFG7S2MS9gBJ43gFOVy)

### Scripts

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Lint
npm run lint
```

### Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [v0 Documentation](https://v0.dev/docs)

---

## License

This project is a UI mockup for demonstration purposes.

---

<a href="https://v0.app/chat/api/kiro/clone/LeDjinn/v0-e-signature-app-mockup" alt="Open in Kiro"><img src="https://pdgvvgmkdvyeydso.public.blob.vercel-storage.com/open%20in%20kiro.svg?sanitize=true" /></a>
