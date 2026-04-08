# Themis Legal - E-Signature Platform

A professional e-signature application mockup built with Next.js, designed for lawyers and legal professionals to create, manage, and sign legal documents digitally. Features deep Google Drive integration where documents are sourced from and saved back to Google Drive.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Application Structure](#application-structure)
- [Core Concepts](#core-concepts)
- [Pages & Features](#pages--features)
  - [Dashboard](#dashboard)
  - [Workflows](#workflows)
  - [Document Preparation](#document-preparation)
  - [Signing Experience](#signing-experience)
  - [My Signatures](#my-signatures)
  - [Google Drive Browser](#google-drive-browser)
  - [Settings](#settings)
- [Components](#components)
- [Design System](#design-system)
- [Development](#development)

---

## Overview

Themis Legal is a UI/UX mockup for a professional e-signature platform tailored for legal professionals. The application demonstrates a complete workflow for:

- **Google Drive Integration**: Source documents directly from Google Drive
- **Workflow-Based Signing**: Create signature workflows with sequential signing order
- **Authenticated Signing**: All signers must log in to verify identity
- **Document Tracking**: Track workflow progress in real-time
- **Automatic Storage**: Signed documents are saved back to Google Drive

**Key Architectural Decisions:**
- Documents live in Google Drive, not uploaded to Themis Legal
- Workflows orchestrate the signing process across multiple signers
- All signers authenticate (no anonymous signing links)
- Completed documents automatically save to Google Drive

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
├── workflows/
│   ├── page.tsx               # Workflows list
│   ├── new/
│   │   └── page.tsx           # Create new workflow (document prep)
│   └── [id]/
│       └── page.tsx           # Workflow detail view
├── signatures/
│   └── page.tsx               # My signature requests
├── sign/
│   └── [workflowId]/
│       └── page.tsx           # Signing experience
├── drive/
│   └── page.tsx               # Google Drive browser
├── settings/
│   └── page.tsx               # User settings
└── layout.tsx                 # Root layout

components/
├── app-sidebar.tsx            # Main navigation sidebar
├── workflow-card.tsx          # Workflow list item card
├── stats-cards.tsx            # Dashboard statistics
├── signature-pad.tsx          # Draw/type signature component
└── ui/                        # shadcn/ui components
```

---

## Core Concepts

### Workflows

A **Workflow** is the central organizing concept in Themis Legal. It represents a signature process for a single document.

**Workflow Properties:**
- **Source Document**: A file from Google Drive (PDF, Word, etc.)
- **Signers**: Ordered list of people who need to sign
- **Status**: Draft → In Progress → Completed
- **Current Signer**: Who is currently responsible for signing

**Workflow Lifecycle:**
1. User selects a document from Google Drive
2. User configures signers and signing order
3. Workflow starts, first signer is notified
4. Each signer authenticates and signs in sequence
5. When all sign, the document is saved to Google Drive

### Authenticated Signing

Unlike traditional e-signature platforms that use anonymous links, Themis Legal requires all signers to authenticate:

- Signers must log in with email/password or Google
- Identity is verified before signing is allowed
- Provides stronger legal standing for signatures
- Creates full audit trail with verified identities

### Google Drive Integration

Documents are not uploaded to Themis Legal. Instead:

- **Source from Drive**: Select existing documents from your Google Drive
- **Save to Drive**: Signed documents are automatically saved back
- **Original Preserved**: Original files remain untouched
- **Permissions Apply**: Drive sharing settings are respected

---

## Pages & Features

### Dashboard

**Route:** `/`

The main landing page providing an overview of all workflow activity.

**Features:**
- **Statistics Cards:** Display key metrics including:
  - Active Workflows in progress
  - Awaiting Your Signature count
  - Completed This Month
  - Average completion time

- **Workflows Requiring Action:** Quick access to workflows where you're the current signer

- **Recent Workflows:** All workflows you've created or participate in:
  - Document title and Google Drive path
  - Current status with visual indicator
  - Signer progress (e.g., "2 of 3 signed")
  - Current signer name
  - Quick actions based on context

- **Quick Actions:**
  - "New Workflow" button to start a new signing process

---

### Workflows

**Route:** `/workflows`

Complete workflow management interface.

**Features:**
- **Workflow List:** All workflows with detailed information
- **Status Tabs:** 
  - All (total count)
  - Active (in progress)
  - Completed (fully signed)
  - Draft (not yet started)

- **Search & Filter:**
  - Text search across document titles
  - Filter by status
  - Sort options (Most Recent, Oldest)

- **Workflow Cards:** Each workflow displays:
  - Document title and Drive location
  - Current status with visual indicator
  - Signer progress timeline
  - Current signer highlighted
  - "Continue Setup" or "View Details" actions

---

### Document Preparation

**Route:** `/workflows/new`

Create a new signing workflow by selecting a document and configuring signers.

**Features:**

**Step 1: Select Document**
- Browse Google Drive file picker
- Filter by file type (PDF, Word)
- Search within Drive
- Show recently used documents
- Preview document before selection

**Step 2: Configure Signers**
- Add signers by email address
- Auto-populate from recent contacts
- Set signer display name
- Drag-and-drop to reorder signing sequence
- Assign signer roles (optional)

**Step 3: Signature Placement**
- Visual document preview
- Drag signature fields onto document
- Assign fields to specific signers
- Multiple field types: Signature, Date, Initials
- Resize and position fields

**Step 4: Review & Start**
- Summary of workflow configuration
- Preview signing order
- Set workflow name/description
- Choose save location for completed document
- "Start Workflow" to initiate

---

### Signing Experience

**Route:** `/sign/[workflowId]`

Clean, focused interface for signers to review and sign documents.

**Features:**

**Authentication Gate:**
- Login required before viewing document
- Email verification against workflow signer list
- "Not on the list" handling for wrong emails

**Document Review:**
- Full scrollable document preview
- Professional legal document formatting
- Highlighted signature fields for current signer
- Read-only view of other signers' completed signatures

**Signing Interface:**
- **Draw Tab:** Canvas for hand-drawn signatures
  - Mouse/touch drawing support
  - Clear and redo options
  
- **Type Tab:** Stylized font signatures
  - Multiple font style options
  - Real-time preview

**Legal Agreement:**
- Checkbox for electronic signature consent
- Identity confirmation
- Terms and conditions acceptance

**Completion:**
- Success confirmation
- Notification that next signer will be contacted
- Option to view workflow status

---

### My Signatures

**Route:** `/signatures`

View and manage signature requests assigned to you.

**Features:**

**Pending Tab:**
- Documents awaiting your signature
- Status indicators:
  - "Your Turn" - Ready to sign now
  - "Waiting" - Previous signers not yet complete
- Signing position (e.g., "Signer 2 of 4")
- "Sign Now" quick action for ready documents

**Signed Tab:**
- History of documents you've signed
- Signing timestamps
- Links to view completed workflows

**Action Required Banner:**
- Prominent alert when signatures are needed
- Direct link to sign

---

### Google Drive Browser

**Route:** `/drive`

Browse and select documents from Google Drive.

**Features:**
- **File Navigation:**
  - Folder breadcrumb trail
  - Click folders to navigate
  - Sort by name, date, size

- **Document Selection:**
  - Filter to signable documents (PDF, Word)
  - "Start Workflow" button on each document
  - Preview documents before selecting

- **Search:**
  - Search within current folder
  - Full Drive search option

---

### Settings

**Route:** `/settings`

User account and application preferences.

**Features:**

#### Profile Tab
- Personal information (name, email, company)
- Default signature configuration
- Signature preview

#### Drive Tab
- Google Drive connection status
- Connected account display
- Disconnect/reconnect option
- Sync settings:
  - Auto-save completed documents
  - Default save location
  - File naming convention

#### Notifications Tab
- Signature request notifications
- Reminder settings
- Workflow completion alerts
- Workflow update notifications

#### Security Tab
- Password management
- Two-factor authentication
- Session management

#### Preferences Tab
- Language selection
- Timezone
- Date format

---

## Components

### App Sidebar (`components/app-sidebar.tsx`)
Fixed navigation sidebar with:
- Logo and branding
- Navigation links (Dashboard, Workflows, My Signatures)
- Google Drive integration link
- Settings link
- User profile section

### Stats Cards (`components/stats-cards.tsx`)
Dashboard metrics cards showing:
- Active workflow count
- Awaiting your signature
- Completed this month
- Average completion time

### Signature Pad (`components/signature-pad.tsx`)
Signature input component with:
- Canvas drawing mode
- Typed signature mode
- Multiple font styles
- Clear/redo functionality

---

## Design System

### Color Palette
The application uses a professional, legal-focused color scheme:
- **Primary:** Deep Crimson (#c91432)
- **Accent:** Warm gold tones for highlights
- **Success:** Green for completed states
- **Warning:** Amber for attention-needed states
- **Background:** Light neutral
- **Sidebar:** Dark charcoal

### Typography
- **Headings:** Sans-serif (Geist)
- **Body:** Sans-serif (Geist)
- **Legal Documents:** Serif (Times New Roman style)

### Status Colors
- **Draft:** Gray
- **In Progress:** Blue
- **Your Turn:** Amber/Warning
- **Completed:** Green
- **Error:** Red

---

## Development

### Built with v0

This project was created with [v0.dev](https://v0.dev) by Vercel.

[Continue working on v0](https://v0.app/chat/projects/prj_12W442weWQFG7S2MS9gBJ43gFOVy)

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
