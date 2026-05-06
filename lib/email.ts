import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'
import { writeAuditLog } from '@/lib/audit'
import { saveSignedDocumentToDrive } from '@/lib/pdf'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const BRAND_COLOR = '#be185d'

// Dev email override: in development, send all emails to this address instead
const DEV_EMAIL_OVERRIDE = process.env.NODE_ENV === 'development'
  ? process.env.RESEND_DEV_EMAIL
  : null

// ============================================================================
// SHARED EMAIL TEMPLATE
// ============================================================================

interface EmailTemplateParams {
  title: string
  preheader: string
  body: string
  ctaText?: string
  ctaUrl?: string
}

function createEmailTemplate({
  title,
  preheader,
  body,
  ctaText,
  ctaUrl,
}: EmailTemplateParams): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background-color: #f9fafb;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: ${BRAND_COLOR};
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 40px 24px;
    }
    .content p {
      margin: 0 0 16px 0;
      color: #374151;
      font-size: 16px;
    }
    .cta-button {
      display: inline-block;
      margin: 24px 0;
      padding: 14px 32px;
      background-color: ${BRAND_COLOR};
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
    }
    .cta-button:hover {
      background-color: #9f1239;
    }
    .document-name {
      font-weight: 600;
      color: ${BRAND_COLOR};
    }
    .footer {
      padding: 24px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      background-color: #f9fafb;
    }
    .footer p {
      margin: 0 0 8px 0;
      color: #6b7280;
      font-size: 14px;
    }
    .legal {
      margin-top: 16px;
      font-size: 12px;
      color: #9ca3af;
    }
  </style>
</head>
<body>
  <span style="display: none !important; visibility: hidden; mso-hide: all; font-size: 1px; color: #ffffff; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${preheader}
  </span>
  <div class="container">
    <div class="header">
      <h1>Themis Legal</h1>
    </div>
    <div class="content">
      ${body}
      ${
        ctaText && ctaUrl
          ? `
      <div style="text-align: center;">
        <a href="${ctaUrl}" class="cta-button">${ctaText}</a>
      </div>
      `
          : ''
      }
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Themis Legal. All rights reserved.</p>
      <p class="legal">This is an automated message from Themis Legal</p>
      <p class="legal">Please do not reply to this email</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

// ============================================================================
// EMAIL FUNCTIONS
// ============================================================================

interface SendSignerNotificationParams {
  to: string
  signerName: string
  workflowName: string
  creatorName: string
  signUrl: string
  position: number
  total: number
}

export async function sendSignerNotification({
  to,
  signerName,
  workflowName,
  creatorName,
  signUrl,
  position,
  total,
}: SendSignerNotificationParams): Promise<{ success: boolean; error?: string }> {
  try {
    const isFirstSigner = position === 0
    const body = `
      <p>Hi ${signerName},</p>
      <p>${creatorName} has invited you to sign the document:</p>
      <p class="document-name">${workflowName}</p>
      ${
        isFirstSigner
          ? '<p>You are the first signer in this workflow. Your signature is required to proceed.</p>'
          : `<p>You are signer ${position + 1} of ${total}. The previous signer${position > 1 ? 's have' : ' has'} completed their signatures.</p>`
      }
      <p>Click the button below to review and sign the document:</p>
    `

    const html = createEmailTemplate({
      title: 'Document Ready for Your Signature',
      preheader: `${creatorName} has invited you to sign ${workflowName}`,
      body,
      ctaText: 'Review & Sign Document',
      ctaUrl: signUrl,
    })

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: DEV_EMAIL_OVERRIDE ?? to,
      subject: `Signature Required: ${workflowName}`,
      html,
    })

    if (result.error) {
      console.error('Resend error:', result.error)
      return { success: false, error: result.error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to send signer notification:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

interface SendWorkflowCompletedParams {
  to: string
  workflowName: string
  signers: Array<{ name: string; email: string }>
  driveFileUrl: string
}

export async function sendWorkflowCompleted({
  to,
  workflowName,
  signers,
  driveFileUrl,
}: SendWorkflowCompletedParams): Promise<{ success: boolean; error?: string }> {
  try {
    const signersList = signers
      .map((s) => `<li>${s.name} (${s.email})</li>`)
      .join('')

    const body = `
      <p>Great news! All signers have completed their signatures for:</p>
      <p class="document-name">${workflowName}</p>
      <p><strong>Signers who completed:</strong></p>
      <ul style="margin: 8px 0; padding-left: 24px;">
        ${signersList}
      </ul>
      <p>The signed document is now available in your Google Drive:</p>
    `

    const html = createEmailTemplate({
      title: 'Workflow Completed',
      preheader: `All signatures collected for ${workflowName}`,
      body,
      ctaText: 'View Signed Document in Drive',
      ctaUrl: driveFileUrl,
    })

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: DEV_EMAIL_OVERRIDE ?? to,
      subject: `Workflow Completed: ${workflowName}`,
      html,
    })

    if (result.error) {
      console.error('Resend error:', result.error)
      return { success: false, error: result.error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to send workflow completed email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

interface SendWorkflowCancelledParams {
  to: string
  workflowName: string
  cancelledBy: string
}

export async function sendWorkflowCancelled({
  to,
  workflowName,
  cancelledBy,
}: SendWorkflowCancelledParams): Promise<{ success: boolean; error?: string }> {
  try {
    const body = `
      <p>The following signing workflow has been cancelled:</p>
      <p class="document-name">${workflowName}</p>
      <p>Cancelled by: ${cancelledBy}</p>
      <p>No further action is required from you.</p>
    `

    const html = createEmailTemplate({
      title: 'Workflow Cancelled',
      preheader: `${workflowName} has been cancelled`,
      body,
    })

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: DEV_EMAIL_OVERRIDE ?? to,
      subject: `Workflow Cancelled: ${workflowName}`,
      html,
    })

    if (result.error) {
      console.error('Resend error:', result.error)
      return { success: false, error: result.error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to send workflow cancelled email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

interface SendReminderEmailParams {
  to: string
  signerName: string
  workflowName: string
  creatorName: string
  signUrl: string
  daysWaiting: number
}

export async function sendReminderEmail({
  to,
  signerName,
  workflowName,
  creatorName,
  signUrl,
  daysWaiting,
}: SendReminderEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const waitingText =
      daysWaiting === 0
        ? 'today'
        : daysWaiting === 1
          ? '1 day ago'
          : `${daysWaiting} days ago`

    const body = `
      <p>Hi ${signerName},</p>
      <p>This is a friendly reminder that your signature is still needed for:</p>
      <p class="document-name">${workflowName}</p>
      <p>This document was sent to you ${waitingText} by ${creatorName}.</p>
      <p>Please take a moment to review and sign the document:</p>
    `

    const html = createEmailTemplate({
      title: 'Reminder: Signature Required',
      preheader: `Reminder to sign ${workflowName}`,
      body,
      ctaText: 'Review & Sign Now',
      ctaUrl: signUrl,
    })

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: DEV_EMAIL_OVERRIDE ?? to,
      subject: `Reminder: Signature Required for ${workflowName}`,
      html,
    })

    if (result.error) {
      console.error('Resend error:', result.error)
      return { success: false, error: result.error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to send reminder email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================================================
// WORKFLOW ORCHESTRATION
// ============================================================================

interface NotifyNextSignerOrCompleteParams {
  workflowId: string
  completedSignerId: string
  ipAddress: string
  userAgent: string
}

export async function notifyNextSignerOrComplete({
  workflowId,
  completedSignerId,
  ipAddress,
  userAgent,
}: NotifyNextSignerOrCompleteParams): Promise<{ success: boolean; error?: string }> {
  try {
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        signers: {
          orderBy: {
            order: 'asc',
          },
          select: {
            id: true,
            name: true,
            email: true,
            order: true,
            status: true,
          },
        },
      },
    })

    if (!workflow) {
      return { success: false, error: 'Workflow not found' }
    }

    const remainingSigners = workflow.signers.filter((s) => s.status !== 'SIGNED')

    if (remainingSigners.length === 0) {
      // All signers complete — workflow is done
      await prisma.workflow.update({
        where: { id: workflowId },
        data: { status: 'COMPLETED', completedAt: new Date() },
      })

      await writeAuditLog({
        workflowId,
        eventType: 'WORKFLOW_COMPLETED',
        actorId: workflow.creator.id,
        ipAddress,
        userAgent,
        metadata: {
          completedSignerId,
          totalSigners: workflow.signers.length,
        },
      })

      // Save signed document to Drive
      let signedFileId: string | null = null
      try {
        signedFileId = await saveSignedDocumentToDrive({
          workflowId,
          userId: workflow.creator.id,
        })
      } catch (error) {
        // Log error but don't throw — signing is already complete, email is informational
        console.error('Failed to save signed document to Drive:', error)
      }

      // Build Drive URL for signed document (or fallback to original)
      const driveFileId = signedFileId ?? workflow.driveFileId
      const driveFileUrl = `https://drive.google.com/file/d/${driveFileId}/view`

      // Send completion email to creator
      await sendWorkflowCompleted({
        to: workflow.creator.email,
        workflowName: workflow.name,
        signers: workflow.signers.map((s) => ({
          name: s.name,
          email: s.email,
        })),
        driveFileUrl,
      })

      return { success: true }
    }

    // Notify next signer
    const nextSigner = remainingSigners[0]
    const signUrl = `${APP_URL}/sign/${workflowId}`

    const emailResult = await sendSignerNotification({
      to: nextSigner.email,
      signerName: nextSigner.name,
      workflowName: workflow.name,
      creatorName: workflow.creator.name,
      signUrl,
      position: nextSigner.order,
      total: workflow.signers.length,
    })

    if (!emailResult.success) {
      return emailResult
    }

    // Update signer status to NOTIFIED
    await prisma.signer.update({
      where: { id: nextSigner.id },
      data: { status: 'NOTIFIED' },
    })

    // Write audit log
    await writeAuditLog({
      workflowId,
      eventType: 'SIGNER_NOTIFIED',
      actorId: workflow.creator.id,
      ipAddress,
      userAgent,
      metadata: {
        signerId: nextSigner.id,
        signerEmail: nextSigner.email,
        signerOrder: nextSigner.order,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to notify next signer or complete:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
