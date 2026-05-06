import { PDFDocument, StandardFonts } from 'pdf-lib'
import { Readable } from 'stream'
import { getDriveClient } from './drive'
import { prisma } from './prisma'
import { writeAuditLog } from './audit'
import { format } from 'date-fns'

interface SignatureData {
  base64Image: string
  page: number
  x: number
  y: number
  width: number
  height: number
  type?: string
}

/**
 * Convert a Buffer to a Readable stream for Google Drive upload.
 */
function bufferToStream(buffer: Buffer): Readable {
  const stream = new Readable()
  stream.push(buffer)
  stream.push(null)
  return stream
}

/**
 * Embed signature images into a PDF document.
 * Fetches the PDF from Google Drive, embeds all signatures, and returns the modified PDF as a Buffer.
 *
 * CRITICAL: All operations are in-memory only — never writes to disk.
 *
 * @param driveFileId - Google Drive file ID of the source PDF
 * @param userId - User ID to get Drive access
 * @param signatures - Array of signature data with positions and images
 * @returns Modified PDF as Buffer
 */
export async function embedSignaturesInPdf({
  driveFileId,
  userId,
  signatures,
}: {
  driveFileId: string
  userId: string
  signatures: SignatureData[]
}): Promise<Buffer> {
  // 1. Fetch PDF from Drive
  const drive = await getDriveClient(userId)
  const response = await drive.files.get(
    {
      fileId: driveFileId,
      alt: 'media',
    },
    { responseType: 'arraybuffer' }
  )

  if (!response.data) {
    throw new Error('Failed to fetch PDF from Drive')
  }

  // Convert to Buffer (response.data is ArrayBuffer)
  const pdfBuffer = Buffer.from(response.data as ArrayBuffer)

  // 2. Load PDF with pdf-lib
  const pdfDoc = await PDFDocument.load(pdfBuffer)

  // 3. Embed each signature
  for (const sig of signatures) {
    const page = pdfDoc.getPage(sig.page - 1)  // DB stores 1-indexed, pdf-lib is 0-indexed
    const { width: pageWidth, height: pageHeight } = page.getSize()

    // Convert percentages to points
    // Database stores: x, y, width, height as percentages (0-100)
    // Database coordinates are from top-left
    // PDF coordinates are from bottom-left
    const actualWidth = (sig.width / 100) * pageWidth
    const actualHeight = (sig.height / 100) * pageHeight
    const actualX = (sig.x / 100) * pageWidth
    // Invert Y coordinate (PDF origin is bottom-left, our DB is top-left)
    const actualY = pageHeight - ((sig.y / 100) * pageHeight) - actualHeight

    // Handle DATE fields differently
    if (sig.type === 'DATE') {
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const dateText = new Date(sig.base64Image).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      page.drawText(dateText, { x: actualX, y: actualY, size: 10, font })
      continue
    }

    // Convert base64 data URI to just the base64 string
    // Format: "data:image/png;base64,iVBOR..." or "data:image/jpeg;base64,/9j..."
    const base64Match = sig.base64Image.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/)
    if (!base64Match) {
      console.warn(`Skipping invalid base64 image on page ${sig.page}`)
      continue
    }

    const imageType = base64Match[1]
    const base64Data = base64Match[2]

    // Embed the image
    let embeddedImage
    try {
      if (imageType === 'png') {
        embeddedImage = await pdfDoc.embedPng(base64Data)
      } else {
        // jpeg or jpg
        embeddedImage = await pdfDoc.embedJpg(base64Data)
      }
    } catch (error) {
      console.error(`Failed to embed signature on page ${sig.page}:`, error)
      continue
    }

    // Draw the signature on the page
    page.drawImage(embeddedImage, {
      x: actualX,
      y: actualY,
      width: actualWidth,
      height: actualHeight,
    })
  }

  // 4. Serialize and return as Buffer
  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}

/**
 * Save a signed document back to Google Drive.
 * Orchestrates the full flow: fetch workflow data, embed signatures, upload to Drive, update DB.
 *
 * @param workflowId - Workflow ID
 * @param userId - User ID (workflow creator)
 * @returns New Google Drive file ID of the signed document
 */
export async function saveSignedDocumentToDrive({
  workflowId,
  userId,
}: {
  workflowId: string
  userId: string
}): Promise<string> {
  // 1. Fetch workflow with related data
  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
    include: {
      creator: true,
      signers: {
        orderBy: { order: 'asc' },
      },
      fields: {
        where: {
          AND: [
            { value: { not: null } },
            { value: { not: '' } },
          ],
        },
      },
    },
  })

  if (!workflow) {
    throw new Error('Workflow not found')
  }

  // 2. Fetch or use default DriveSettings
  let driveSettings = await prisma.driveSettings.findUnique({
    where: { userId },
  })

  if (!driveSettings) {
    // Use defaults if no settings exist
    driveSettings = {
      id: '',
      userId,
      saveLocation: 'SAME_FOLDER',
      targetFolderId: null,
      namingPattern: '{name}_Signed_{date}',
      autoSave: true,
    }
  }

  // 3. Prepare signature data for embedding
  const signatures: SignatureData[] = workflow.fields.map((field) => ({
    base64Image: field.value!,
    page: field.page,
    x: field.x,
    y: field.y,
    width: field.width,
    height: field.height,
    type: field.type,
  }))

  // 4. Embed signatures into PDF
  const signedPdfBuffer = await embedSignaturesInPdf({
    driveFileId: workflow.driveFileId,
    userId,
    signatures,
  })

  // 5. Determine destination folder
  const drive = await getDriveClient(userId)
  let destinationFolderId: string | null = null

  if (driveSettings.saveLocation === 'SPECIFIC_FOLDER' && driveSettings.targetFolderId) {
    destinationFolderId = driveSettings.targetFolderId
  } else {
    // SAME_FOLDER or ASK (fallback to SAME_FOLDER)
    // Fetch parent folder of original file
    const fileMetadata = await drive.files.get({
      fileId: workflow.driveFileId,
      fields: 'parents',
    })

    if (fileMetadata.data.parents && fileMetadata.data.parents.length > 0) {
      destinationFolderId = fileMetadata.data.parents[0]
    }
  }

  // 6. Generate filename from pattern
  const today = format(new Date(), 'yyyy-MM-dd')
  const filename = driveSettings.namingPattern
    .replace('{name}', workflow.name)
    .replace('{date}', today)
    .concat('.pdf') // Ensure .pdf extension

  // 7. Upload to Drive
  const uploadResponse = await drive.files.create({
    requestBody: {
      name: filename,
      parents: destinationFolderId ? [destinationFolderId] : undefined,
      mimeType: 'application/pdf',
    },
    media: {
      mimeType: 'application/pdf',
      body: bufferToStream(signedPdfBuffer),
    },
    fields: 'id',
  })

  const newFileId = uploadResponse.data.id
  if (!newFileId) {
    throw new Error('Failed to upload signed document to Drive')
  }

  // 8. Update Workflow.signedFileId
  await prisma.workflow.update({
    where: { id: workflowId },
    data: { signedFileId: newFileId },
  })

  // 9. Write audit log
  await writeAuditLog({
    workflowId,
    eventType: 'WORKFLOW_COMPLETED',
    actorId: userId,
    ipAddress: 'system',
    userAgent: 'system',
    metadata: {
      action: 'DOCUMENT_SAVED',
      driveFileId: newFileId,
      filename,
      signatureCount: signatures.length,
    },
  })

  return newFileId
}
