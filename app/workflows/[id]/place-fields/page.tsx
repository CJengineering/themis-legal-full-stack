"use client"

import { useState, useEffect, use, useRef } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { FileText, Check, X, ChevronLeft, ChevronRight, Loader2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"

const Document = dynamic(() => import("react-pdf").then(m => ({ default: m.Document })), { ssr: false })
const Page = dynamic(() => import("react-pdf").then(m => ({ default: m.Page })), { ssr: false })

interface Signer {
  id: string
  name: string
  email: string
  order: number
}

interface Workflow {
  id: string
  name: string
  driveFileId: string
  signers: Signer[]
}

interface PlacedField {
  id: string // temporary client-side ID
  signerId: string
  type: "SIGNATURE" | "INITIALS" | "DATE"
  page: number
  x: number // percentage
  y: number // percentage
  width: number // percentage
  height: number // percentage
}

// Signer color palette
const SIGNER_COLORS = [
  { bg: "bg-blue-100", border: "border-blue-500", text: "text-blue-700", hex: "#3b82f6" },
  { bg: "bg-green-100", border: "border-green-500", text: "text-green-700", hex: "#22c55e" },
  { bg: "bg-orange-100", border: "border-orange-500", text: "text-orange-700", hex: "#f97316" },
  { bg: "bg-purple-100", border: "border-purple-500", text: "text-purple-700", hex: "#a855f7" },
]

// Default field sizes (percentages)
const FIELD_DEFAULTS = {
  SIGNATURE: { width: 25, height: 6 },
  INITIALS: { width: 12, height: 6 },
  DATE: { width: 18, height: 5 },
}

export default function PlaceFieldsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [placedFields, setPlacedFields] = useState<PlacedField[]>([])
  const [selectedSigner, setSelectedSigner] = useState<Signer | null>(null)
  const [selectedFieldType, setSelectedFieldType] = useState<"SIGNATURE" | "INITIALS" | "DATE">("SIGNATURE")
  const [isSaving, setIsSaving] = useState(false)
  const [pageWidth, setPageWidth] = useState(0)
  const [pageHeight, setPageHeight] = useState(0)

  const workflowId = id

  // Configure PDF.js worker
  useEffect(() => {
    import("react-pdf").then(({ pdfjs }) => {
      pdfjs.GlobalWorkerOptions.workerSrc =
        `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
    })
  }, [])

  // Fetch workflow data
  useEffect(() => {
    async function fetchWorkflow() {
      try {
        const response = await fetch(`/api/workflows/${workflowId}`)
        if (!response.ok) throw new Error("Failed to fetch workflow")
        const data = await response.json()
        setWorkflow(data.workflow)

        // Auto-select first signer
        if (data.workflow.signers.length > 0) {
          setSelectedSigner(data.workflow.signers[0])
        }
      } catch (err) {
        console.error(err)
        setError("Failed to load workflow")
      } finally {
        setLoading(false)
      }
    }
    fetchWorkflow()
  }, [workflowId])

  const getSignerColor = (order: number) => {
    return SIGNER_COLORS[order % SIGNER_COLORS.length]
  }

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }

  const handlePageLoadSuccess = (page: any) => {
    const { width, height } = page.getViewport({ scale: 1 })
    setPageWidth(width)
    setPageHeight(height)
  }


  const handleDeleteField = (fieldId: string) => {
    setPlacedFields((fields) => fields.filter((f) => f.id !== fieldId))
  }

  const handleSaveAndSend = async () => {
    if (!workflow) return

    // Validate: every signer must have at least 1 SIGNATURE field
    const signerIds = workflow.signers.map((s) => s.id)
    const signaturesBySigner = new Map<string, number>()

    for (const field of placedFields) {
      if (field.type === "SIGNATURE") {
        signaturesBySigner.set(
          field.signerId,
          (signaturesBySigner.get(field.signerId) ?? 0) + 1
        )
      }
    }

    for (const signer of workflow.signers) {
      if ((signaturesBySigner.get(signer.id) ?? 0) === 0) {
        setError(`Signer "${signer.name}" must have at least one SIGNATURE field`)
        return
      }
    }

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/workflows/${workflowId}/fields`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: placedFields.map((f) => ({
            signerId: f.signerId,
            type: f.type,
            page: f.page,
            x: f.x,
            y: f.y,
            width: f.width,
            height: f.height,
          })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save fields")
      }

      // Redirect to workflow detail page
      router.push(`/workflows/${workflowId}`)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Failed to save fields")
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error && !workflow) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="p-6">
          <p className="text-destructive">{error}</p>
          <Button asChild className="mt-4">
            <Link href="/workflows">Back to Workflows</Link>
          </Button>
        </Card>
      </div>
    )
  }

  if (!workflow) return null

  const fieldsOnCurrentPage = placedFields.filter((f) => f.page === currentPage)

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Signers & Field Types */}
      <div className="w-[280px] border-r bg-card p-4 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Signers</h2>
          <div className="space-y-2">
            {workflow.signers.map((signer, index) => {
              const color = getSignerColor(signer.order)
              const isSelected = selectedSigner?.id === signer.id
              const signerFields = placedFields.filter((f) => f.signerId === signer.id)
              const signerSignatures = signerFields.filter((f) => f.type === "SIGNATURE").length

              return (
                <button
                  key={signer.id}
                  onClick={() => setSelectedSigner(signer)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                    isSelected
                      ? `${color.border} ${color.bg}`
                      : "border-transparent hover:border-muted"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{signer.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{signer.email}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{signerFields.length} fields</span>
                    {signerSignatures === 0 && (
                      <Badge variant="destructive" className="text-xs">No signature</Badge>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Field Type</h3>
          <div className="space-y-2">
            {(["SIGNATURE", "INITIALS", "DATE"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedFieldType(type)}
                className={`w-full text-left px-3 py-2 rounded border transition-colors ${
                  selectedFieldType === type
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {type === "SIGNATURE" ? "Signature" : type === "INITIALS" ? "Initials" : "Date"}
              </button>
            ))}
          </div>
        </div>

        {selectedSigner && (
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">
              Click on the document to place a <strong>{selectedFieldType.toLowerCase()}</strong> field for{" "}
              <strong>{selectedSigner.name}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Center - PDF Viewer */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="border-b bg-card px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (placedFields.length > 0) {
                  if (confirm('Are you sure? Your field placements will be lost.')) {
                    router.push(`/workflows/${workflowId}`)
                  }
                } else {
                  router.push(`/workflows/${workflowId}`)
                }
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{workflow.name}</h1>
              <p className="text-sm text-muted-foreground">Place signature fields</p>
            </div>
          </div>
          <Button onClick={handleSaveAndSend} disabled={isSaving || placedFields.length === 0}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Save & Send
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* PDF Canvas */}
        <div className="flex-1 overflow-auto bg-muted/30 p-8">
          <div className="mx-auto" style={{ maxWidth: "800px" }}>
            <div
              id="pdf-container"
              className="relative inline-block bg-white shadow-lg select-none"
              style={{ cursor: 'crosshair' }}
              onClick={(e) => {
                const target = e.target as HTMLElement
                if (target.closest('[data-field-id]')) return

                // Click on empty area — place new field
                if (!selectedSigner) {
                  setError("Please select a signer first")
                  return
                }
                const canvas = document.querySelector('.react-pdf__Page__canvas') as HTMLElement
                if (!canvas) return
                const rect = canvas.getBoundingClientRect()

                // Only place field if click is within canvas bounds
                const x = e.clientX - rect.left
                const y = e.clientY - rect.top
                if (x < 0 || y < 0 || x > rect.width || y > rect.height) return

                const xPercent = (x / rect.width) * 100
                const yPercent = (y / rect.height) * 100

                const { width, height } = FIELD_DEFAULTS[selectedFieldType]
                const newField: PlacedField = {
                  id: `field-${Date.now()}-${Math.random()}`,
                  signerId: selectedSigner.id,
                  type: selectedFieldType,
                  page: currentPage,
                  x: Math.min(xPercent, 100 - width),
                  y: Math.min(yPercent, 100 - height),
                  width,
                  height,
                }

                setPlacedFields(prev => [...prev, newField])
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const fieldId = e.dataTransfer.getData('fieldId')
                const offsetX = parseFloat(e.dataTransfer.getData('offsetX'))
                const offsetY = parseFloat(e.dataTransfer.getData('offsetY'))
                const canvas = document.querySelector('.react-pdf__Page__canvas') as HTMLElement
                if (!canvas) return
                const rect = canvas.getBoundingClientRect()
                const x = ((e.clientX - rect.left - offsetX) / rect.width) * 100
                const y = ((e.clientY - rect.top - offsetY) / rect.height) * 100
                const field = placedFields.find(f => f.id === fieldId)
                if (!field) return
                setPlacedFields(prev => prev.map(f =>
                  f.id === fieldId
                    ? { ...f,
                        x: Math.max(0, Math.min(100 - f.width, x)),
                        y: Math.max(0, Math.min(100 - f.height, y))
                      }
                    : f
                ))
              }}
            >
              <Document
                file={`/api/drive/files/${workflow.driveFileId}/pdf`}
                onLoadSuccess={handleDocumentLoadSuccess}
                loading={
                  <div className="flex items-center justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                }
              >
                <Page
                  pageNumber={currentPage}
                  width={800}
                  onLoadSuccess={handlePageLoadSuccess}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>

              {/* Placed fields overlay */}
              <div
                className="pointer-events-none"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
              >
                {fieldsOnCurrentPage.map((field) => {
                  const signer = workflow.signers.find((s) => s.id === field.signerId)
                  if (!signer) return null
                  const color = getSignerColor(signer.order)
                  return (
                    <div
                      key={field.id}
                      data-field-id={field.id}
                      draggable={true}
                      style={{
                        position: 'absolute',
                        left: `${field.x}%`,
                        top: `${field.y}%`,
                        width: `${field.width}%`,
                        height: `${field.height}%`,
                        pointerEvents: 'auto',
                        cursor: 'grab',
                      }}
                      className={`rounded border-2 ${color.border} ${color.bg}
                        flex items-center justify-between px-2 group`}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('fieldId', field.id)
                        const rect = e.currentTarget.getBoundingClientRect()
                        e.dataTransfer.setData('offsetX', String(e.clientX - rect.left))
                        e.dataTransfer.setData('offsetY', String(e.clientY - rect.top))
                      }}
                    >
                      <span className={`text-xs font-medium ${color.text} pointer-events-none`}>
                        {field.type === "SIGNATURE" ? "Signature" : field.type === "INITIALS" ? "Initials" : "Date"}
                        {' '}({signer.name.split(" ").map(n => n[0]).join("")})
                      </span>
                      <button
                        className="h-5 w-5 opacity-0 group-hover:opacity-100 rounded hover:bg-red-100 flex items-center justify-center pointer-events-auto"
                        onMouseDown={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                          setPlacedFields(prev => prev.filter(f => f.id !== field.id))
                        }}
                      >
                        <X className="h-3 w-3 text-red-500" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Page Navigation */}
            {numPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {numPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                  disabled={currentPage === numPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Field Summary */}
      <div className="w-[240px] border-l bg-card p-4 overflow-y-auto">
        <h2 className="text-sm font-semibold mb-4">Fields Placed</h2>

        {placedFields.length === 0 ? (
          <p className="text-xs text-muted-foreground">No fields placed yet. Click on the document to add fields.</p>
        ) : (
          <div className="space-y-4">
            {workflow.signers.map((signer) => {
              const color = getSignerColor(signer.order)
              const signerFields = placedFields.filter((f) => f.signerId === signer.id)

              if (signerFields.length === 0) return null

              return (
                <div key={signer.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${color.bg} border ${color.border}`} />
                    <p className="text-xs font-medium truncate">{signer.name}</p>
                  </div>
                  <div className="pl-5 space-y-1">
                    {signerFields.map((field) => (
                      <div key={field.id} className="text-xs text-muted-foreground">
                        {field.type} - Page {field.page}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
