# Themis Legal - User Stories

This document contains all detailed user stories for the Themis Legal e-signature platform, organized by feature area and user role. Updated to reflect the workflow-based architecture with Google Drive integration and authenticated signing.

---

## Table of Contents

1. [User Roles](#user-roles)
2. [Core Concepts](#core-concepts)
3. [Epic 1: Dashboard & Overview](#epic-1-dashboard--overview)
4. [Epic 2: Workflow Management](#epic-2-workflow-management)
5. [Epic 3: Document Preparation](#epic-3-document-preparation)
6. [Epic 4: Signer Configuration](#epic-4-signer-configuration)
7. [Epic 5: Signature Field Placement](#epic-5-signature-field-placement)
8. [Epic 6: Signing Experience](#epic-6-signing-experience)
9. [Epic 7: My Signatures](#epic-7-my-signatures)
10. [Epic 8: Google Drive Integration](#epic-8-google-drive-integration)
11. [Epic 9: Settings & Profile](#epic-9-settings--profile)
12. [Epic 10: Notifications](#epic-10-notifications)
13. [Epic 11: Security & Compliance](#epic-11-security--compliance)

---

## User Roles

| Role | Description |
|------|-------------|
| **Workflow Creator** | A user who creates signature workflows and manages the signing process |
| **Signer** | An authenticated user who signs documents within a workflow |
| **Admin** | A user who manages organization settings and integrations |

---

## Core Concepts

### Workflow
A workflow represents a signature process for a single document. It tracks the document source (Google Drive), the ordered list of signers, current progress, and completion status.

### Authenticated Signing
All signers must authenticate (login) to sign documents. This provides stronger legal standing and creates a verified audit trail.

### Google Drive Integration
Documents are sourced from and saved back to Google Drive. Themis Legal never stores the actual documents - it orchestrates the signing process.

---

## Epic 1: Dashboard & Overview

### US-1.1: View Dashboard Overview
**As a** Workflow Creator  
**I want to** see an overview dashboard when I log in  
**So that** I can quickly understand the status of my workflows and pending actions

**Acceptance Criteria:**
- [ ] Dashboard displays count of active workflows
- [ ] Dashboard shows signatures awaiting my action
- [ ] Dashboard shows workflows completed this month
- [ ] Dashboard displays average completion time
- [ ] All stats update in real-time

---

### US-1.2: View Workflows Requiring Action
**As a** User  
**I want to** see workflows where I need to take action  
**So that** I can prioritize my signature tasks

**Acceptance Criteria:**
- [ ] Prominently displays workflows awaiting my signature
- [ ] Shows "Your Turn" badge for actionable items
- [ ] Quick "Sign Now" action available
- [ ] Sorted by urgency/date

---

### US-1.3: View Recent Workflows
**As a** Workflow Creator  
**I want to** see a list of my recent workflows on the dashboard  
**So that** I can quickly access workflows I've been working on

**Acceptance Criteria:**
- [ ] Recent workflows list shows last 5-10 workflows
- [ ] Each workflow displays title, status, progress, and current signer
- [ ] Workflows sorted by last activity (newest first)
- [ ] Clicking a workflow navigates to workflow detail view
- [ ] Shows Google Drive path for document location

---

### US-1.4: Start New Workflow from Dashboard
**As a** Workflow Creator  
**I want to** quickly start a new workflow from the dashboard  
**So that** I can begin the signing process without navigating away

**Acceptance Criteria:**
- [ ] "New Workflow" button is prominently displayed
- [ ] Clicking opens the document preparation flow
- [ ] Can also start from Google Drive browser

---

### US-1.5: Search Workflows
**As a** User  
**I want to** search for workflows from the dashboard  
**So that** I can quickly find a specific workflow

**Acceptance Criteria:**
- [ ] Search bar is visible on the dashboard
- [ ] Search works on document titles
- [ ] Search results appear as user types (debounced)
- [ ] Clicking a result navigates to the workflow

---

## Epic 2: Workflow Management

### US-2.1: View All Workflows
**As a** User  
**I want to** view a comprehensive list of all workflows I'm involved in  
**So that** I can manage my signature activities

**Acceptance Criteria:**
- [ ] Workflows page shows all relevant workflows
- [ ] Each row displays: title, status, signers, progress, date
- [ ] Separate tabs for different statuses
- [ ] Pagination for large lists

---

### US-2.2: Filter Workflows by Status
**As a** User  
**I want to** filter workflows by their status  
**So that** I can focus on workflows that need attention

**Acceptance Criteria:**
- [ ] Tabs: All, Active, Completed, Draft
- [ ] Each tab shows count of workflows
- [ ] Active tab is default
- [ ] Filter persists during session

---

### US-2.3: View Workflow Detail
**As a** User  
**I want to** view complete details of a workflow  
**So that** I can understand its current state and history

**Acceptance Criteria:**
- [ ] Shows document title and Google Drive location
- [ ] Displays current workflow status
- [ ] Shows signer timeline with status for each
- [ ] Current signer highlighted
- [ ] Shows timestamps for each action
- [ ] Link to view/sign document when applicable

---

### US-2.4: Track Workflow Progress
**As a** Workflow Creator  
**I want to** see real-time progress of my workflows  
**So that** I know who has signed and who is pending

**Acceptance Criteria:**
- [ ] Visual timeline of signing order
- [ ] Completed signers show green checkmarks
- [ ] Current signer highlighted with "Current" badge
- [ ] Pending signers shown as upcoming
- [ ] Signing timestamps visible

---

### US-2.5: Send Reminder to Current Signer
**As a** Workflow Creator  
**I want to** send a reminder to the current signer  
**So that** I can prompt them to complete their signature

**Acceptance Criteria:**
- [ ] "Send Reminder" button on workflow detail
- [ ] Only available for in-progress workflows
- [ ] Reminder sent via email notification
- [ ] Confirmation message shown
- [ ] Rate limited to prevent spam

---

### US-2.6: Cancel Workflow
**As a** Workflow Creator  
**I want to** cancel an in-progress workflow  
**So that** I can stop a signing process that is no longer needed

**Acceptance Criteria:**
- [ ] "Cancel Workflow" option available
- [ ] Confirmation dialog required
- [ ] All pending signers notified of cancellation
- [ ] Workflow marked as "Cancelled"
- [ ] Original document in Drive unchanged

---

### US-2.7: View Completed Workflow Document
**As a** User  
**I want to** view and download the fully signed document  
**So that** I can access the completed agreement

**Acceptance Criteria:**
- [ ] "View Document" button for completed workflows
- [ ] Shows document with all signatures applied
- [ ] Download option available
- [ ] Link to document in Google Drive
- [ ] All signature details visible

---

## Epic 3: Document Preparation

### US-3.1: Start Workflow from Google Drive
**As a** Workflow Creator  
**I want to** select a document from Google Drive to start a workflow  
**So that** I can use my existing documents without uploading

**Acceptance Criteria:**
- [ ] Google Drive file picker integrated
- [ ] Can browse folders in Drive
- [ ] Filter to show only signable documents (PDF, Word)
- [ ] Search within Drive
- [ ] Preview document before selection

---

### US-3.2: Select Document for Workflow
**As a** Workflow Creator  
**I want to** choose which document to use for my workflow  
**So that** I can initiate signing on the correct file

**Acceptance Criteria:**
- [ ] Clear document selection interface
- [ ] Shows document name and location
- [ ] Preview option before proceeding
- [ ] Confirm selection to move to next step
- [ ] Can change selection before finalizing

---

### US-3.3: View Document Preview
**As a** Workflow Creator  
**I want to** preview my document during workflow creation  
**So that** I can verify it's the correct document

**Acceptance Criteria:**
- [ ] Document rendered in preview pane
- [ ] Scrollable for multi-page documents
- [ ] Zoom in/out capability
- [ ] Clear enough to read content
- [ ] Shows all pages

---

### US-3.4: Set Workflow Name
**As a** Workflow Creator  
**I want to** give my workflow a descriptive name  
**So that** I can easily identify it later

**Acceptance Criteria:**
- [ ] Editable name field
- [ ] Default name from document title
- [ ] Name appears in all workflow lists
- [ ] Required before starting workflow

---

### US-3.5: Set Save Location
**As a** Workflow Creator  
**I want to** choose where the signed document will be saved  
**So that** I can organize my completed agreements

**Acceptance Criteria:**
- [ ] Option to save in same folder as original
- [ ] Option to select different folder
- [ ] Default based on user preferences
- [ ] Shows full path before confirming

---

## Epic 4: Signer Configuration

### US-4.1: Add Signers to Workflow
**As a** Workflow Creator  
**I want to** add signers to my workflow  
**So that** I can specify who needs to sign the document

**Acceptance Criteria:**
- [ ] Signer input panel in workflow creation
- [ ] Enter signer email address
- [ ] Enter signer display name
- [ ] Multiple signers can be added
- [ ] Email validation

---

### US-4.2: Set Signing Order
**As a** Workflow Creator  
**I want to** define the order in which signers must sign  
**So that** I can enforce a specific workflow sequence

**Acceptance Criteria:**
- [ ] Signers displayed in numbered order
- [ ] Drag-and-drop to reorder signers
- [ ] Order numbers update automatically
- [ ] Sequential signing enforced at runtime
- [ ] Visual indication of order

---

### US-4.3: Edit Signer Details
**As a** Workflow Creator  
**I want to** edit signer information  
**So that** I can correct mistakes before starting

**Acceptance Criteria:**
- [ ] Edit button on each signer
- [ ] Update name and email
- [ ] Changes reflect immediately
- [ ] Validation on save
- [ ] Can only edit before workflow starts

---

### US-4.4: Remove Signer
**As a** Workflow Creator  
**I want to** remove a signer from the workflow  
**So that** I can adjust the signing requirements

**Acceptance Criteria:**
- [ ] Delete button on each signer
- [ ] Confirmation not required (easy undo)
- [ ] Order updates automatically
- [ ] Associated signature fields become unassigned
- [ ] Minimum of 1 signer required

---

### US-4.5: Add Myself as Signer
**As a** Workflow Creator  
**I want to** quickly add myself as a signer  
**So that** I can include myself in the signing process

**Acceptance Criteria:**
- [ ] "Add Myself" quick button
- [ ] Auto-fills my name and email
- [ ] Adds to signer list at bottom
- [ ] Can reorder as needed

---

### US-4.6: Select from Recent Contacts
**As a** Workflow Creator  
**I want to** quickly add signers from my recent contacts  
**So that** I don't have to re-enter email addresses

**Acceptance Criteria:**
- [ ] Recent contacts dropdown or autocomplete
- [ ] Shows name and email
- [ ] Click to add as signer
- [ ] Based on previous workflows

---

## Epic 5: Signature Field Placement

### US-5.1: Add Signature Fields to Document
**As a** Workflow Creator  
**I want to** place signature fields on my document  
**So that** signers know where to sign

**Acceptance Criteria:**
- [ ] Visual field placement interface
- [ ] Drag fields onto document preview
- [ ] Fields snap to position
- [ ] Visual feedback during placement
- [ ] Can add multiple fields

---

### US-5.2: Assign Field to Signer
**As a** Workflow Creator  
**I want to** assign each field to a specific signer  
**So that** the right person signs in the right place

**Acceptance Criteria:**
- [ ] Signer dropdown on each field
- [ ] Color coding matches signer
- [ ] Field shows signer name
- [ ] All fields must be assigned

---

### US-5.3: Add Date Field
**As a** Workflow Creator  
**I want to** add date fields alongside signatures  
**So that** signing dates are captured

**Acceptance Criteria:**
- [ ] Date field type available
- [ ] Auto-fills when signer signs
- [ ] Configurable date format
- [ ] Assign to specific signer

---

### US-5.4: Add Initials Field
**As a** Workflow Creator  
**I want to** add initial fields  
**So that** signers can initial specific sections

**Acceptance Criteria:**
- [ ] Initial field type available
- [ ] Smaller than full signature
- [ ] Assign to specific signer
- [ ] Can place inline

---

### US-5.5: Reposition Fields
**As a** Workflow Creator  
**I want to** move fields after placing them  
**So that** I can adjust positioning

**Acceptance Criteria:**
- [ ] Drag fields to new position
- [ ] Resize fields
- [ ] Delete fields
- [ ] Undo/redo support

---

### US-5.6: Review Field Summary
**As a** Workflow Creator  
**I want to** see a summary of all placed fields  
**So that** I can verify the configuration

**Acceptance Criteria:**
- [ ] List of all fields
- [ ] Shows field type and assigned signer
- [ ] Page number for each field
- [ ] Click to navigate to field

---

## Epic 6: Signing Experience

### US-6.1: Authenticate Before Signing
**As a** Signer  
**I want to** log in before accessing the document  
**So that** my identity is verified

**Acceptance Criteria:**
- [ ] Login required to view document
- [ ] Support email/password and Google login
- [ ] Email must match workflow signer list
- [ ] Clear error for mismatched email
- [ ] Option to sign in with different account

---

### US-6.2: Verify My Identity
**As a** Signer  
**I want to** confirm I am the correct signer  
**So that** the signature is attributed correctly

**Acceptance Criteria:**
- [ ] Shows name and email of expected signer
- [ ] "I am [Name]" confirmation
- [ ] Option if email doesn't match
- [ ] Clear next steps after verification

---

### US-6.3: Review Document Before Signing
**As a** Signer  
**I want to** read the entire document before signing  
**So that** I understand what I'm agreeing to

**Acceptance Criteria:**
- [ ] Full document displayed in readable format
- [ ] Professional legal document styling
- [ ] Scroll through entire document
- [ ] All sections clearly visible
- [ ] Can zoom in for details

---

### US-6.4: Navigate to My Signature Fields
**As a** Signer  
**I want to** easily find where I need to sign  
**So that** I don't miss any required fields

**Acceptance Criteria:**
- [ ] "Next Field" button navigation
- [ ] My signature fields highlighted
- [ ] Auto-scroll to next field
- [ ] Progress indicator shows remaining fields
- [ ] Other signers' fields visible but inactive

---

### US-6.5: Draw My Signature
**As a** Signer  
**I want to** draw my signature using mouse or touch  
**So that** I can provide a personalized signature

**Acceptance Criteria:**
- [ ] Signature canvas for drawing
- [ ] Works with mouse on desktop
- [ ] Works with touch on mobile
- [ ] Clear button to start over
- [ ] Preview before applying

---

### US-6.6: Type My Signature
**As a** Signer  
**I want to** type my name as a signature  
**So that** I can sign quickly

**Acceptance Criteria:**
- [ ] Type tab option
- [ ] Text input for name
- [ ] Multiple font styles to choose
- [ ] Real-time preview
- [ ] Script/cursive rendering

---

### US-6.7: Apply Signature to Field
**As a** Signer  
**I want to** apply my signature to the designated field  
**So that** the document is signed

**Acceptance Criteria:**
- [ ] Click field to apply signature
- [ ] Preview before confirming
- [ ] Can edit before final submission
- [ ] Visual confirmation when applied

---

### US-6.8: Agree to Legal Terms
**As a** Signer  
**I want to** acknowledge the legal agreement  
**So that** my signature is legally binding

**Acceptance Criteria:**
- [ ] Checkbox for e-signature consent
- [ ] Clear legal text
- [ ] Cannot submit without agreeing
- [ ] Timestamp recorded
- [ ] Terms link available

---

### US-6.9: Submit Signed Document
**As a** Signer  
**I want to** submit my completed signature  
**So that** the workflow can proceed

**Acceptance Criteria:**
- [ ] "Complete Signing" button
- [ ] Validation all fields completed
- [ ] Success confirmation
- [ ] Shows next signer info (if any)
- [ ] Option to view workflow status

---

### US-6.10: View Other Signatures
**As a** Signer  
**I want to** see signatures from previous signers  
**So that** I can verify the signing chain

**Acceptance Criteria:**
- [ ] Previous signatures visible on document
- [ ] Shows signer name and date
- [ ] Verification badge for each
- [ ] Read-only (cannot modify)

---

## Epic 7: My Signatures

### US-7.1: View Pending Signature Requests
**As a** Signer  
**I want to** see all documents awaiting my signature  
**So that** I know what needs my attention

**Acceptance Criteria:**
- [ ] List of pending signature requests
- [ ] Shows document title and requester
- [ ] Shows "Your Turn" or "Waiting" status
- [ ] Signing position (e.g., "2 of 3")
- [ ] Request date visible

---

### US-7.2: Identify Ready-to-Sign Documents
**As a** Signer  
**I want to** easily identify which documents I can sign now  
**So that** I can prioritize my actions

**Acceptance Criteria:**
- [ ] "Your Turn" badge prominent
- [ ] Sorted with actionable items first
- [ ] "Sign Now" quick action
- [ ] Visual distinction from waiting items

---

### US-7.3: View Waiting Documents
**As a** Signer  
**I want to** see documents waiting for previous signers  
**So that** I know what's coming

**Acceptance Criteria:**
- [ ] "Waiting" status clearly shown
- [ ] Shows current signer name
- [ ] Position in signing order
- [ ] Estimated timeline (if available)

---

### US-7.4: View Signed Document History
**As a** Signer  
**I want to** see documents I've already signed  
**So that** I can reference past agreements

**Acceptance Criteria:**
- [ ] Signed tab/filter
- [ ] Shows signing date
- [ ] Shows workflow status (complete or pending others)
- [ ] Link to view completed document

---

## Epic 8: Google Drive Integration

### US-8.1: Connect Google Drive Account
**As a** User  
**I want to** connect my Google Drive account  
**So that** I can access my documents

**Acceptance Criteria:**
- [ ] Google OAuth flow
- [ ] Clear permissions explanation
- [ ] Success confirmation
- [ ] Account email displayed
- [ ] Can disconnect and reconnect

---

### US-8.2: Browse Drive Files
**As a** User  
**I want to** browse my Google Drive files  
**So that** I can select documents for workflows

**Acceptance Criteria:**
- [ ] Folder navigation
- [ ] Breadcrumb trail
- [ ] File list with icons
- [ ] Sort and filter options
- [ ] Search within Drive

---

### US-8.3: Auto-Save Completed Documents
**As a** User  
**I want completed documents to automatically save to Drive  
**So that** I have the signed copies stored

**Acceptance Criteria:**
- [ ] Auto-save toggle in settings
- [ ] Saves to configured location
- [ ] Notification when saved
- [ ] Link to view in Drive

---

### US-8.4: Configure Save Location
**As a** User  
**I want to** set where completed documents are saved  
**So that** they're organized appropriately

**Acceptance Criteria:**
- [ ] Default folder setting
- [ ] Options: Same folder, specific folder, ask each time
- [ ] Folder picker for selection
- [ ] Settings persist

---

### US-8.5: Configure File Naming
**As a** User  
**I want to** configure how signed files are named  
**So that** they're easily identifiable

**Acceptance Criteria:**
- [ ] Naming convention options
- [ ] Include date, "Signed" suffix, etc.
- [ ] Preview of naming format
- [ ] Settings persist

---

## Epic 9: Settings & Profile

### US-9.1: Update Personal Information
**As a** User  
**I want to** update my profile information  
**So that** my details are current

**Acceptance Criteria:**
- [ ] Edit name, email, company, title
- [ ] Save changes button
- [ ] Validation on fields
- [ ] Success confirmation

---

### US-9.2: Configure Default Signature
**As a** User  
**I want to** set up my default signature  
**So that** signing is faster

**Acceptance Criteria:**
- [ ] Draw or type default signature
- [ ] Preview of saved signature
- [ ] Update signature option
- [ ] Used as default when signing

---

### US-9.3: Manage Notification Preferences
**As a** User  
**I want to** control which notifications I receive  
**So that** I'm not overwhelmed with emails

**Acceptance Criteria:**
- [ ] Toggle for signature requests
- [ ] Toggle for reminders
- [ ] Toggle for completion notifications
- [ ] Toggle for workflow updates
- [ ] Settings save immediately

---

### US-9.4: Update Password
**As a** User  
**I want to** change my password  
**So that** I can maintain account security

**Acceptance Criteria:**
- [ ] Current password required
- [ ] New password with confirmation
- [ ] Password strength requirements
- [ ] Success confirmation
- [ ] Logout other sessions option

---

### US-9.5: Enable Two-Factor Authentication
**As a** User  
**I want to** enable 2FA  
**So that** my account is more secure

**Acceptance Criteria:**
- [ ] Setup flow with QR code
- [ ] Backup codes provided
- [ ] Verification step
- [ ] Can disable later
- [ ] Required on next login

---

### US-9.6: Set Regional Preferences
**As a** User  
**I want to** set my language and timezone  
**So that** dates and times are displayed correctly

**Acceptance Criteria:**
- [ ] Language selection
- [ ] Timezone selection
- [ ] Date format selection
- [ ] Applies immediately
- [ ] Settings persist

---

## Epic 10: Notifications

### US-10.1: Receive Signature Request Email
**As a** Signer  
**I want to** receive an email when it's my turn to sign  
**So that** I know action is needed

**Acceptance Criteria:**
- [ ] Email sent when workflow reaches user
- [ ] Includes document name
- [ ] Includes requester name
- [ ] Link to sign (requires login)
- [ ] Preview of document (if enabled)

---

### US-10.2: Receive Reminder Email
**As a** Signer  
**I want to** receive reminders for pending signatures  
**So that** I don't forget to sign

**Acceptance Criteria:**
- [ ] Configurable reminder frequency
- [ ] Sent only if not signed
- [ ] Can disable reminders
- [ ] Includes days waiting

---

### US-10.3: Receive Workflow Completion Email
**As a** User  
**I want to** be notified when a workflow completes  
**So that** I know the document is fully signed

**Acceptance Criteria:**
- [ ] Email to workflow creator
- [ ] Email to all signers (optional)
- [ ] Includes link to completed document
- [ ] Shows all signer names

---

### US-10.4: Receive Workflow Update Email
**As a** Workflow Creator  
**I want to** be notified when signers complete  
**So that** I can track progress

**Acceptance Criteria:**
- [ ] Email when each signer completes
- [ ] Shows current progress
- [ ] Shows next signer
- [ ] Can disable these notifications

---

## Epic 11: Security & Compliance

### US-11.1: Verify Signer Identity
**As a** System  
**I want to** verify signer identity through authentication  
**So that** signatures are legally valid

**Acceptance Criteria:**
- [ ] All signers must authenticate
- [ ] Email must match workflow entry
- [ ] Authentication event logged
- [ ] IP address captured
- [ ] Timestamp recorded

---

### US-11.2: Maintain Audit Trail
**As a** User  
**I want to** access a complete audit trail  
**So that** I can prove the signing process

**Acceptance Criteria:**
- [ ] All events logged with timestamp
- [ ] Shows who did what when
- [ ] IP addresses recorded
- [ ] Cannot be modified
- [ ] Exportable for legal purposes

---

### US-11.3: Secure Document Handling
**As a** System  
**I want to** handle documents securely  
**So that** sensitive information is protected

**Acceptance Criteria:**
- [ ] Documents accessed via secure Google Drive API
- [ ] No permanent document storage in Themis Legal
- [ ] HTTPS for all communications
- [ ] Access tokens securely stored
- [ ] Session timeout for security

---

### US-11.4: E-Signature Legal Compliance
**As a** System  
**I want to** comply with e-signature regulations  
**So that** signatures are legally binding

**Acceptance Criteria:**
- [ ] Consent captured before signing
- [ ] Clear intent to sign recorded
- [ ] Identity verification completed
- [ ] Document integrity maintained
- [ ] Audit trail available

---

## Summary

This user story document covers the complete Themis Legal e-signature platform with:

- **11 Epics** covering all major feature areas
- **Workflow-based architecture** for managing signature processes
- **Authenticated signing** for legal validity
- **Deep Google Drive integration** for document storage
- **Comprehensive notifications** for workflow tracking
- **Security and compliance** features for legal requirements

Each user story follows the standard format with acceptance criteria to guide implementation and testing.
