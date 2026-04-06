# Themis Legal - User Stories

This document contains all detailed user stories for the Themis Legal e-signature platform, organized by feature area and user role.

---

## Table of Contents

1. [User Roles](#user-roles)
2. [Epic 1: Dashboard & Overview](#epic-1-dashboard--overview)
3. [Epic 2: Document Management](#epic-2-document-management)
4. [Epic 3: Document Creation & Editing](#epic-3-document-creation--editing)
5. [Epic 4: Signature Fields & Placement](#epic-4-signature-fields--placement)
6. [Epic 5: Signer Management](#epic-5-signer-management)
7. [Epic 6: Signing Experience](#epic-6-signing-experience)
8. [Epic 7: Templates](#epic-7-templates)
9. [Epic 8: Signature Requests](#epic-8-signature-requests)
10. [Epic 9: Google Drive Integration](#epic-9-google-drive-integration)
11. [Epic 10: Settings & Profile](#epic-10-settings--profile)
12. [Epic 11: Notifications](#epic-11-notifications)
13. [Epic 12: Security & Compliance](#epic-12-security--compliance)

---

## User Roles

| Role | Description |
|------|-------------|
| **Document Creator** | A user who creates, edits, and sends documents for signature |
| **Signer** | A user who receives and signs documents |
| **Admin** | A user who manages organization settings, users, and integrations |
| **Viewer** | A user who can only view completed documents |

---

## Epic 1: Dashboard & Overview

### US-1.1: View Dashboard Overview
**As a** Document Creator  
**I want to** see an overview dashboard when I log in  
**So that** I can quickly understand the status of my documents and pending actions

**Acceptance Criteria:**
- [ ] Dashboard displays total document count
- [ ] Dashboard shows number of pending signatures
- [ ] Dashboard shows number of completed documents
- [ ] Dashboard displays completion rate percentage
- [ ] All stats are updated in real-time

---

### US-1.2: View Recent Documents
**As a** Document Creator  
**I want to** see a list of my recent documents on the dashboard  
**So that** I can quickly access documents I've been working on

**Acceptance Criteria:**
- [ ] Recent documents list shows last 5-10 documents
- [ ] Each document displays title, type, status, and date
- [ ] Documents are sorted by last modified date (newest first)
- [ ] Clicking a document navigates to the document view
- [ ] Status badges clearly indicate document state (Draft, Pending, Completed)

---

### US-1.3: Quick Document Creation
**As a** Document Creator  
**I want to** quickly create a new document from the dashboard  
**So that** I can start working on a new document without navigating away

**Acceptance Criteria:**
- [ ] "New Document" button is prominently displayed
- [ ] Clicking the button shows document type selection
- [ ] Available types include: Contract, NDA, Authorization
- [ ] Selecting a type navigates to the document editor

---

### US-1.4: Search Documents from Dashboard
**As a** Document Creator  
**I want to** search for documents from the dashboard  
**So that** I can quickly find a specific document

**Acceptance Criteria:**
- [ ] Search bar is visible on the dashboard
- [ ] Search works on document titles
- [ ] Search results appear as user types (debounced)
- [ ] Clicking a result navigates to the document

---

### US-1.5: Filter Documents by Status
**As a** Document Creator  
**I want to** filter documents by their status  
**So that** I can focus on documents that need my attention

**Acceptance Criteria:**
- [ ] Filter dropdown with options: All, Draft, Pending, Completed
- [ ] Selecting a filter updates the document list immediately
- [ ] Filter selection persists during the session
- [ ] Document count updates to reflect filtered results

---

### US-1.6: Sort Documents
**As a** Document Creator  
**I want to** sort documents by different criteria  
**So that** I can organize my document list according to my needs

**Acceptance Criteria:**
- [ ] Sort options include: Latest, Oldest, Name A-Z, Name Z-A
- [ ] Default sort is by Latest
- [ ] Sort selection updates the list immediately
- [ ] Sort icon indicates current sort direction

---

## Epic 2: Document Management

### US-2.1: View All Documents
**As a** Document Creator  
**I want to** view a comprehensive list of all my documents  
**So that** I can manage my entire document library

**Acceptance Criteria:**
- [ ] Documents page shows all documents in a table/list format
- [ ] Each row displays: checkbox, title, type, status, signers, date, actions
- [ ] Table supports bulk selection via header checkbox
- [ ] Pagination or infinite scroll for large document lists

---

### US-2.2: Filter Documents by Tab
**As a** Document Creator  
**I want to** filter documents using tabs  
**So that** I can quickly switch between document states

**Acceptance Criteria:**
- [ ] Tabs available: All, Drafts, Pending, Completed
- [ ] Each tab shows count of documents in that state
- [ ] Active tab is visually highlighted
- [ ] Tab switching is instant (client-side filtering)

---

### US-2.3: Bulk Document Actions
**As a** Document Creator  
**I want to** perform actions on multiple documents at once  
**So that** I can efficiently manage my documents

**Acceptance Criteria:**
- [ ] Checkbox on each document row for selection
- [ ] "Select All" checkbox in table header
- [ ] Bulk action buttons appear when documents are selected
- [ ] Bulk actions include: Delete, Archive, Download
- [ ] Confirmation dialog before destructive actions

---

### US-2.4: Document Quick Actions
**As a** Document Creator  
**I want to** access common actions for each document  
**So that** I can quickly perform operations without opening the document

**Acceptance Criteria:**
- [ ] Three-dot menu on each document row
- [ ] Menu options: View, Edit, Duplicate, Send Reminder, Delete
- [ ] Actions are context-sensitive based on document status
- [ ] Draft documents show "Continue Editing"
- [ ] Pending documents show "Send Reminder"

---

### US-2.5: View Document Details
**As a** Document Creator  
**I want to** view full details of a completed document  
**So that** I can review the signed content and signatures

**Acceptance Criteria:**
- [ ] Document view shows full document content in PDF-like format
- [ ] Professional legal document styling with letterhead
- [ ] All signatures are displayed with verification status
- [ ] Signed date and time shown for each signature
- [ ] Document metadata (created date, type, reference number) displayed

---

### US-2.6: Download Document as PDF
**As a** Document Creator  
**I want to** download a completed document as a PDF  
**So that** I can save it locally or share it externally

**Acceptance Criteria:**
- [ ] "Download PDF" button on document view page
- [ ] PDF includes all document content and signatures
- [ ] PDF has professional formatting matching the preview
- [ ] Download starts immediately upon clicking
- [ ] Filename includes document title and date

---

### US-2.7: Export to Google Drive
**As a** Document Creator  
**I want to** save a document to Google Drive  
**So that** I can store it with my other cloud files

**Acceptance Criteria:**
- [ ] "Save to Drive" button on document view page
- [ ] If not connected, prompts to connect Google Drive
- [ ] Folder selection dialog appears
- [ ] Success notification after export
- [ ] Document appears in selected Drive folder

---

### US-2.8: View Document Audit Trail
**As a** Document Creator  
**I want to** see a complete audit trail of a document  
**So that** I can track all actions taken on the document

**Acceptance Criteria:**
- [ ] Audit trail section on document view page
- [ ] Shows chronological list of all events
- [ ] Events include: Created, Sent, Viewed, Signed, Completed
- [ ] Each event shows timestamp and actor
- [ ] IP address logged for legal compliance

---

## Epic 3: Document Creation & Editing

### US-3.1: Create New Document
**As a** Document Creator  
**I want to** create a new document from scratch  
**So that** I can draft custom contracts and agreements

**Acceptance Criteria:**
- [ ] "New Document" navigates to document editor
- [ ] Document type selector appears first
- [ ] Empty document template loads based on type
- [ ] Auto-save functionality every 30 seconds
- [ ] Document starts in "Draft" status

---

### US-3.2: Select Document Type
**As a** Document Creator  
**I want to** choose the type of document I'm creating  
**So that** the system can provide appropriate templates and formatting

**Acceptance Criteria:**
- [ ] Document type options: Contract, NDA, Authorization
- [ ] Each type has icon and description
- [ ] Type can be changed while editing
- [ ] Type affects available template suggestions

---

### US-3.3: Edit Document Title
**As a** Document Creator  
**I want to** set a descriptive title for my document  
**So that** I can easily identify it later

**Acceptance Criteria:**
- [ ] Editable title field at top of editor
- [ ] Default title based on document type
- [ ] Title auto-saves on blur
- [ ] Title appears in document header when viewing

---

### US-3.4: Use Block-Based Editor
**As a** Document Creator  
**I want to** edit document content using a block-based editor  
**So that** I can easily structure and format my document

**Acceptance Criteria:**
- [ ] WYSIWYG block editor interface
- [ ] Each paragraph/section is a separate block
- [ ] Blocks can be added, deleted, reordered
- [ ] Click to edit any block inline
- [ ] Visual feedback for active/selected blocks

---

### US-3.5: Format Text Content
**As a** Document Creator  
**I want to** apply formatting to my text  
**So that** I can create professional-looking documents

**Acceptance Criteria:**
- [ ] Formatting toolbar with common options
- [ ] Bold, Italic, Underline text formatting
- [ ] Heading levels (H1, H2, H3)
- [ ] Bullet and numbered lists
- [ ] Text alignment (left, center, right, justify)
- [ ] Formatting persists when saved

---

### US-3.6: Add Document Sections
**As a** Document Creator  
**I want to** add structured sections to my document  
**So that** I can organize content logically

**Acceptance Criteria:**
- [ ] "Add Block" button to insert new sections
- [ ] Section types: Heading, Paragraph, List, Signature Field
- [ ] Sections auto-number (Article I, Article II, etc.)
- [ ] Drag-and-drop reordering of sections

---

### US-3.7: Preview Document
**As a** Document Creator  
**I want to** preview how my document will look when signed  
**So that** I can ensure it appears professional

**Acceptance Criteria:**
- [ ] Preview button in editor toolbar
- [ ] Preview shows document in final PDF-like format
- [ ] Signature placeholders shown in preview
- [ ] Close preview to return to editing
- [ ] Print option from preview

---

### US-3.8: Save Document as Draft
**As a** Document Creator  
**I want to** save my document without sending it  
**So that** I can continue working on it later

**Acceptance Criteria:**
- [ ] "Save Draft" button in editor
- [ ] Visual confirmation of save
- [ ] Document remains in "Draft" status
- [ ] Draft accessible from Documents page
- [ ] Auto-save doesn't change manual save behavior

---

### US-3.9: Load Document Template
**As a** Document Creator  
**I want to** start from a pre-built template  
**So that** I can save time on common document types

**Acceptance Criteria:**
- [ ] "Use Template" option in document type selector
- [ ] Template gallery with available templates
- [ ] Template preview before selection
- [ ] Template content loads into editor
- [ ] Template fields are editable

---

## Epic 4: Signature Fields & Placement

### US-4.1: Insert Signature Field
**As a** Document Creator  
**I want to** add signature fields to my document  
**So that** signers know where to sign

**Acceptance Criteria:**
- [ ] "Add Signature" button in editor toolbar
- [ ] Signature field appears as a block in the document
- [ ] Field shows placeholder text "Signature Required"
- [ ] Field visually distinct from regular content
- [ ] Multiple signature fields can be added

---

### US-4.2: Configure Signature Field
**As a** Document Creator  
**I want to** configure each signature field  
**So that** I can assign it to specific signers

**Acceptance Criteria:**
- [ ] Click signature field to open configuration dialog
- [ ] Assign field to a specific signer
- [ ] Set field as required or optional
- [ ] Add field label (e.g., "Employer Signature")
- [ ] Configuration saves automatically

---

### US-4.3: Add Date Field
**As a** Document Creator  
**I want to** add date fields alongside signatures  
**So that** the signing date is captured

**Acceptance Criteria:**
- [ ] Date field option in field types
- [ ] Date field auto-fills when signer signs
- [ ] Date format configurable (MM/DD/YYYY, etc.)
- [ ] Date field visually linked to signature field

---

### US-4.4: Add Initial Field
**As a** Document Creator  
**I want to** add initial fields for paragraph acknowledgment  
**So that** signers can initial specific sections

**Acceptance Criteria:**
- [ ] Initial field type available
- [ ] Smaller field size than full signature
- [ ] Can be placed inline with text
- [ ] Assigned to specific signer

---

### US-4.5: Position Signature Fields
**As a** Document Creator  
**I want to** position signature fields precisely  
**So that** they appear in the correct location

**Acceptance Criteria:**
- [ ] Drag-and-drop field positioning
- [ ] Snap-to-grid for alignment
- [ ] Visual guides during drag
- [ ] Fields can be moved after placement
- [ ] Undo/redo for position changes

---

### US-4.6: Delete Signature Field
**As a** Document Creator  
**I want to** remove signature fields I no longer need  
**So that** I can adjust my document requirements

**Acceptance Criteria:**
- [ ] Delete option in field context menu
- [ ] Confirmation before deletion
- [ ] Keyboard shortcut (Delete/Backspace)
- [ ] Undo available after deletion

---

## Epic 5: Signer Management

### US-5.1: Add Signers to Document
**As a** Document Creator  
**I want to** add signers to my document  
**So that** I can specify who needs to sign

**Acceptance Criteria:**
- [ ] Signer management panel in editor
- [ ] "Add Signer" button
- [ ] Enter signer name and email
- [ ] Assign signer role (e.g., Employer, Employee)
- [ ] Multiple signers can be added

---

### US-5.2: Set Signing Order
**As a** Document Creator  
**I want to** define the order signers must sign  
**So that** I can enforce a specific workflow

**Acceptance Criteria:**
- [ ] Signers displayed in numbered order
- [ ] Drag-and-drop to reorder signers
- [ ] Order numbers update automatically
- [ ] Sequential signing enforced at runtime
- [ ] Option for parallel signing (all at once)

---

### US-5.3: Edit Signer Details
**As a** Document Creator  
**I want to** edit signer information  
**So that** I can correct mistakes or update details

**Acceptance Criteria:**
- [ ] Edit button on each signer
- [ ] Modal dialog for editing
- [ ] Update name, email, and role
- [ ] Changes reflect in signature fields
- [ ] Validation for email format

---

### US-5.4: Remove Signer
**As a** Document Creator  
**I want to** remove a signer from the document  
**So that** I can adjust who needs to sign

**Acceptance Criteria:**
- [ ] Delete button on each signer
- [ ] Confirmation dialog
- [ ] Associated signature fields become unassigned
- [ ] Warning if signer has assigned fields

---

### US-5.5: Assign Color to Signer
**As a** Document Creator  
**I want to** assign colors to different signers  
**So that** I can visually distinguish their signature fields

**Acceptance Criteria:**
- [ ] Color indicator next to each signer
- [ ] Auto-assigned distinct colors
- [ ] Signature fields match signer color
- [ ] Color visible in editor and preview

---

### US-5.6: Send Document for Signature
**As a** Document Creator  
**I want to** send my document to all signers  
**So that** they can review and sign it

**Acceptance Criteria:**
- [ ] "Send for Signature" button
- [ ] Validation that all fields are assigned
- [ ] Validation that all signers have email
- [ ] Confirmation dialog with summary
- [ ] Email sent to first signer (or all if parallel)
- [ ] Document status changes to "Pending"

---

### US-5.7: Add Custom Message
**As a** Document Creator  
**I want to** include a custom message with the signature request  
**So that** signers have context about the document

**Acceptance Criteria:**
- [ ] Message field in send dialog
- [ ] Message included in email notification
- [ ] Message visible to signer before signing
- [ ] Optional - can be left blank

---

## Epic 6: Signing Experience

### US-6.1: Access Document via Email Link
**As a** Signer  
**I want to** access the document from an email link  
**So that** I can review and sign without creating an account

**Acceptance Criteria:**
- [ ] Email contains unique signing link
- [ ] Link opens document directly
- [ ] No login required
- [ ] Link expires after document is signed
- [ ] Invalid/expired links show appropriate message

---

### US-6.2: Review Document Before Signing
**As a** Signer  
**I want to** read the entire document before signing  
**So that** I understand what I'm agreeing to

**Acceptance Criteria:**
- [ ] Full document displayed in readable format
- [ ] Professional legal document styling
- [ ] Scroll through entire document
- [ ] Zoom in/out capability
- [ ] All sections clearly visible

---

### US-6.3: View Signing Progress
**As a** Signer  
**I want to** see my progress through the signing process  
**So that** I know how many fields remain

**Acceptance Criteria:**
- [ ] Progress indicator (e.g., "Step 2 of 4")
- [ ] Progress bar showing completion percentage
- [ ] List of required fields with status
- [ ] Current field highlighted
- [ ] Completed fields show checkmark

---

### US-6.4: Navigate to Signature Fields
**As a** Signer  
**I want to** easily find where I need to sign  
**So that** I don't miss any required fields

**Acceptance Criteria:**
- [ ] "Next" button to jump to next field
- [ ] "Previous" button to go back
- [ ] Signature fields highlighted/pulsing
- [ ] Auto-scroll to next field
- [ ] Field list in sidebar for quick navigation

---

### US-6.5: Draw Signature
**As a** Signer  
**I want to** draw my signature using mouse/touch  
**So that** I can provide a personalized signature

**Acceptance Criteria:**
- [ ] Signature pad/canvas for drawing
- [ ] Works with mouse on desktop
- [ ] Works with touch on mobile/tablet
- [ ] Adjustable pen thickness
- [ ] Clear button to start over
- [ ] Signature scales to fit field

---

### US-6.6: Type Signature
**As a** Signer  
**I want to** type my name as a signature  
**So that** I can sign quickly without drawing

**Acceptance Criteria:**
- [ ] "Type" tab option in signature dialog
- [ ] Text input field for name
- [ ] Multiple font styles to choose from
- [ ] Preview of typed signature
- [ ] Signature rendered in script/cursive font

---

### US-6.7: Apply Signature to All Fields
**As a** Signer  
**I want to** apply my signature to all my assigned fields  
**So that** I don't have to sign multiple times

**Acceptance Criteria:**
- [ ] Option to "Apply to all fields"
- [ ] Shows count of fields to be signed
- [ ] Can still sign individually if preferred
- [ ] Confirmation before applying
- [ ] All fields update simultaneously

---

### US-6.8: Agree to Legal Terms
**As a** Signer  
**I want to** acknowledge the legal agreement before submitting  
**So that** my signature is legally binding

**Acceptance Criteria:**
- [ ] Checkbox for legal agreement
- [ ] Text explaining e-signature validity
- [ ] Cannot submit without checking
- [ ] Agreement timestamp recorded
- [ ] Terms link for full legal text

---

### US-6.9: Submit Signed Document
**As a** Signer  
**I want to** submit my completed signature  
**So that** the document can proceed to the next signer

**Acceptance Criteria:**
- [ ] "Complete & Submit" button
- [ ] Validation that all required fields are signed
- [ ] Confirmation dialog with summary
- [ ] Success message after submission
- [ ] Redirect to confirmation page

---

### US-6.10: Receive Confirmation
**As a** Signer  
**I want to** receive confirmation that I've signed  
**So that** I have proof of my signature

**Acceptance Criteria:**
- [ ] Confirmation page after signing
- [ ] Email confirmation sent
- [ ] Option to download signed document
- [ ] Summary of what was signed
- [ ] Next steps information

---

### US-6.11: Decline to Sign
**As a** Signer  
**I want to** decline to sign a document  
**So that** I can refuse if I don't agree

**Acceptance Criteria:**
- [ ] "Decline" button available
- [ ] Reason field (optional)
- [ ] Confirmation before declining
- [ ] Creator notified of decline
- [ ] Document status updates to "Declined"

---

## Epic 7: Templates

### US-7.1: View Template Library
**As a** Document Creator  
**I want to** browse available templates  
**So that** I can find one that fits my needs

**Acceptance Criteria:**
- [ ] Templates page with grid/list view
- [ ] Each template shows name, type, and preview
- [ ] Filter templates by type
- [ ] Search templates by name
- [ ] Usage count displayed

---

### US-7.2: Create New Template
**As a** Document Creator  
**I want to** create a new template  
**So that** I can reuse document structures

**Acceptance Criteria:**
- [ ] "Create Template" button
- [ ] Dialog for template details
- [ ] Enter name, type, description
- [ ] Choose to start blank or upload
- [ ] Template saves to library

---

### US-7.3: Edit Template
**As a** Document Creator  
**I want to** edit an existing template  
**So that** I can update its content

**Acceptance Criteria:**
- [ ] Edit option in template menu
- [ ] Opens in document editor
- [ ] All editing features available
- [ ] Save updates the template
- [ ] Version history maintained

---

### US-7.4: Duplicate Template
**As a** Document Creator  
**I want to** duplicate a template  
**So that** I can create variations

**Acceptance Criteria:**
- [ ] Duplicate option in template menu
- [ ] New template created with "(Copy)" suffix
- [ ] Opens in editor immediately
- [ ] All content copied
- [ ] Independent from original

---

### US-7.5: Delete Template
**As a** Document Creator  
**I want to** delete templates I no longer need  
**So that** I can keep my library organized

**Acceptance Criteria:**
- [ ] Delete option in template menu
- [ ] Confirmation dialog
- [ ] Warning if template has been used
- [ ] Template removed from library
- [ ] Existing documents unaffected

---

### US-7.6: Use Template to Create Document
**As a** Document Creator  
**I want to** create a document from a template  
**So that** I can quickly start with pre-built content

**Acceptance Criteria:**
- [ ] "Use Template" button on each template
- [ ] New document created from template
- [ ] All template content copied
- [ ] Opens in document editor
- [ ] Template usage count increments

---

### US-7.7: Preview Template
**As a** Document Creator  
**I want to** preview a template before using it  
**So that** I can verify it's the right one

**Acceptance Criteria:**
- [ ] Preview option in template card
- [ ] Modal showing template content
- [ ] Full document preview
- [ ] Close to return to library
- [ ] "Use Template" button in preview

---

## Epic 8: Signature Requests

### US-8.1: View Pending Signatures
**As a** Document Creator  
**I want to** see all documents awaiting my signature  
**So that** I can complete my signing tasks

**Acceptance Criteria:**
- [ ] "Awaiting My Signature" section
- [ ] List of documents to sign
- [ ] Shows sender, document name, date
- [ ] "Sign Now" button on each
- [ ] Badge count in navigation

---

### US-8.2: View Sent Signature Requests
**As a** Document Creator  
**I want to** see documents I've sent for signature  
**So that** I can track their progress

**Acceptance Criteria:**
- [ ] "Sent for Signature" section
- [ ] List of sent documents
- [ ] Shows recipient(s) and status
- [ ] Progress indicator for each
- [ ] Filter by pending/completed

---

### US-8.3: Send Signature Reminder
**As a** Document Creator  
**I want to** send reminders to pending signers  
**So that** I can prompt them to complete signing

**Acceptance Criteria:**
- [ ] "Send Reminder" button on pending documents
- [ ] Confirmation before sending
- [ ] Custom message option
- [ ] Reminder email sent to signer
- [ ] Reminder count tracked

---

### US-8.4: Cancel Signature Request
**As a** Document Creator  
**I want to** cancel a pending signature request  
**So that** I can revoke access if needed

**Acceptance Criteria:**
- [ ] "Cancel Request" option
- [ ] Confirmation dialog
- [ ] Signing links invalidated
- [ ] Signers notified of cancellation
- [ ] Document returns to draft status

---

### US-8.5: View Signature Status
**As a** Document Creator  
**I want to** see detailed signature status  
**So that** I know who has signed and who hasn't

**Acceptance Criteria:**
- [ ] Status panel showing all signers
- [ ] Signed/Pending indicator for each
- [ ] Timestamp for completed signatures
- [ ] Last viewed timestamp
- [ ] Reminder sent indicator

---

## Epic 9: Google Drive Integration

### US-9.1: Connect Google Drive
**As a** Document Creator  
**I want to** connect my Google Drive account  
**So that** I can sync documents to the cloud

**Acceptance Criteria:**
- [ ] Google Drive settings page
- [ ] "Connect Google Drive" button
- [ ] OAuth flow for authorization
- [ ] Connection status displayed
- [ ] Connected account email shown

---

### US-9.2: Disconnect Google Drive
**As a** Document Creator  
**I want to** disconnect my Google Drive  
**So that** I can revoke access if needed

**Acceptance Criteria:**
- [ ] "Disconnect" button when connected
- [ ] Confirmation dialog
- [ ] OAuth tokens revoked
- [ ] Connection removed
- [ ] Existing exports unaffected

---

### US-9.3: Configure Sync Folder
**As a** Document Creator  
**I want to** choose where documents are saved  
**So that** they go to the right folder

**Acceptance Criteria:**
- [ ] Folder path configuration
- [ ] Browse/select folder option
- [ ] Create new folder option
- [ ] Default folder suggestion
- [ ] Path displayed after selection

---

### US-9.4: Enable Auto-Sync
**As a** Document Creator  
**I want to** automatically sync completed documents  
**So that** I don't have to export manually

**Acceptance Criteria:**
- [ ] Auto-sync toggle option
- [ ] Settings for what to sync
- [ ] Options: completed documents, all documents
- [ ] Sync happens on document completion
- [ ] Notification of sync success/failure

---

### US-9.5: View Sync History
**As a** Document Creator  
**I want to** see a history of synced documents  
**So that** I can verify exports completed

**Acceptance Criteria:**
- [ ] List of synced documents
- [ ] Timestamp for each sync
- [ ] Status (success/failed)
- [ ] Link to file in Drive
- [ ] Retry option for failed syncs

---

## Epic 10: Settings & Profile

### US-10.1: Update Profile Information
**As a** User  
**I want to** update my profile details  
**So that** my information is accurate

**Acceptance Criteria:**
- [ ] Profile settings section
- [ ] Edit name, email, phone
- [ ] Upload profile photo
- [ ] Save changes button
- [ ] Validation for required fields

---

### US-10.2: Change Password
**As a** User  
**I want to** change my password  
**So that** I can maintain account security

**Acceptance Criteria:**
- [ ] Password change form
- [ ] Current password required
- [ ] New password with confirmation
- [ ] Password strength indicator
- [ ] Validation for password requirements

---

### US-10.3: Configure Email Notifications
**As a** User  
**I want to** customize my notification preferences  
**So that** I only receive relevant emails

**Acceptance Criteria:**
- [ ] Notification settings section
- [ ] Toggle for each notification type
- [ ] Types: document sent, signed, completed
- [ ] Reminder frequency settings
- [ ] Changes save automatically

---

### US-10.4: Set Default Signature
**As a** User  
**I want to** save a default signature  
**So that** I can sign documents faster

**Acceptance Criteria:**
- [ ] Signature settings section
- [ ] Draw or type signature
- [ ] Preview of saved signature
- [ ] Option to use for all documents
- [ ] Can update anytime

---

### US-10.5: Configure Two-Factor Authentication
**As a** User  
**I want to** enable 2FA on my account  
**So that** my account is more secure

**Acceptance Criteria:**
- [ ] 2FA settings section
- [ ] Enable/disable toggle
- [ ] QR code for authenticator app
- [ ] Backup codes provided
- [ ] Verification required to enable

---

### US-10.6: Manage API Keys
**As an** Admin  
**I want to** manage API keys  
**So that** I can integrate with other systems

**Acceptance Criteria:**
- [ ] API keys section in settings
- [ ] Generate new API key
- [ ] View existing keys (masked)
- [ ] Revoke keys
- [ ] Usage statistics per key

---

### US-10.7: View Account Activity
**As a** User  
**I want to** see my account activity  
**So that** I can monitor for unauthorized access

**Acceptance Criteria:**
- [ ] Activity log section
- [ ] Login history with timestamps
- [ ] IP addresses and locations
- [ ] Device information
- [ ] Option to sign out all devices

---

## Epic 11: Notifications

### US-11.1: Receive Document Sent Notification
**As a** Signer  
**I want to** receive notification when a document is sent to me  
**So that** I know I need to sign

**Acceptance Criteria:**
- [ ] Email notification sent immediately
- [ ] Contains document name and sender
- [ ] Direct link to sign
- [ ] Preview of document description
- [ ] Deadline if applicable

---

### US-11.2: Receive Signature Complete Notification
**As a** Document Creator  
**I want to** be notified when someone signs my document  
**So that** I can track progress

**Acceptance Criteria:**
- [ ] Email sent when signer completes
- [ ] Shows who signed and when
- [ ] Link to view document
- [ ] Progress update (2 of 3 signed)
- [ ] In-app notification as well

---

### US-11.3: Receive Document Complete Notification
**As a** Document Creator  
**I want to** be notified when all signatures are complete  
**So that** I know the document is finalized

**Acceptance Criteria:**
- [ ] Email sent on final signature
- [ ] Contains completed document attachment
- [ ] Summary of all signers
- [ ] Link to view/download
- [ ] Option to export to Drive

---

### US-11.4: Receive Reminder Notifications
**As a** Signer  
**I want to** receive reminder notifications  
**So that** I don't forget to sign

**Acceptance Criteria:**
- [ ] Reminder email after X days
- [ ] Customizable reminder schedule
- [ ] Contains original document link
- [ ] Shows deadline if applicable
- [ ] Unsubscribe option

---

### US-11.5: View In-App Notifications
**As a** User  
**I want to** see notifications within the app  
**So that** I can stay updated while working

**Acceptance Criteria:**
- [ ] Notification bell icon in header
- [ ] Badge count for unread
- [ ] Dropdown with recent notifications
- [ ] Mark as read functionality
- [ ] Link to related document

---

## Epic 12: Security & Compliance

### US-12.1: Verify Signature Authenticity
**As a** Document Creator  
**I want to** verify that signatures are authentic  
**So that** I can trust the signed document

**Acceptance Criteria:**
- [ ] Verification badge on each signature
- [ ] Shows verification method
- [ ] Timestamp and IP recorded
- [ ] Certificate of completion available
- [ ] Tamper-evident seal

---

### US-12.2: Generate Audit Certificate
**As a** Document Creator  
**I want to** generate an audit certificate  
**So that** I have legal proof of the signing process

**Acceptance Criteria:**
- [ ] Download certificate option
- [ ] Contains all signing events
- [ ] Timestamps with timezone
- [ ] IP addresses logged
- [ ] Cryptographic hash of document

---

### US-12.3: Ensure E-Signature Compliance
**As a** Document Creator  
**I want to** ensure documents comply with e-signature laws  
**So that** signatures are legally binding

**Acceptance Criteria:**
- [ ] Compliance with ESIGN Act
- [ ] Compliance with eIDAS (EU)
- [ ] Intent to sign captured
- [ ] Consent to electronic records
- [ ] Association of signature with document

---

### US-12.4: Encrypt Documents at Rest
**As an** Admin  
**I want to** ensure documents are encrypted  
**So that** sensitive data is protected

**Acceptance Criteria:**
- [ ] AES-256 encryption at rest
- [ ] TLS 1.3 in transit
- [ ] Encryption keys managed securely
- [ ] No plaintext storage
- [ ] Compliance certifications

---

### US-12.5: Set Document Retention Policy
**As an** Admin  
**I want to** configure document retention  
**So that** documents are kept or deleted appropriately

**Acceptance Criteria:**
- [ ] Retention policy settings
- [ ] Auto-delete after X days/years
- [ ] Legal hold option
- [ ] Notification before deletion
- [ ] Export before deletion option

---

## Appendix: Acceptance Criteria Legend

| Symbol | Meaning |
|--------|---------|
| [ ] | Not implemented |
| [x] | Implemented |
| [~] | Partially implemented |
| [-] | Not applicable |

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | April 2026 | Themis Legal Team | Initial user stories |

---

*This document is maintained as part of the Themis Legal project documentation.*
