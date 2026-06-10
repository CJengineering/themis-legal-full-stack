"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import {
  CheckCircle2,
  Clock,
  PenTool,
  Download,
  HardDrive,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { SignaturePad } from "@/components/signature-pad"

// Document will be streamed from Google Drive via PDF endpoint

type Workflow = {
  id: string
  name: string
  status: string
  driveFileId: string
  documentHash: string
  creator: {
    id: string
    name: string
    email: string
  }
  signers: Array<{
    id: string
    name: string
    email: string
    order: number
    status: string
    signedAt: string | null
  }>
}

type CurrentSigner = {
  id: string
  name: string
  email: string
  order: number
  status: string
  signedAt: string | null
}

export default function SigningPage({
  params,
}: {
  params: Promise<{ workflowId: string }>
}) {
  const { workflowId } = use(params)
  const [showSignatureDialog, setShowSignatureDialog] = useState(false)
  const [signature, setSignature] = useState<string | null>(null)
  const [agreed, setAgreed] = useState(false)
  const [signed, setSigned] = useState(false)

  // API state
  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [currentSigner, setCurrentSigner] = useState<CurrentSigner | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [waitingFor, setWaitingFor] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch workflow on mount
  useEffect(() => {
    async function fetchWorkflow() {
      try {
        const res = await fetch(`/api/workflows/${workflowId}`)

        if (!res.ok) {
          if (res.status === 401) {
            window.location.href = '/login'
            return
          }

          const data = await res.json()

          // Handle "not your turn" error
          if (data.waitingFor) {
            setWaitingFor(data.waitingFor)
          }

          throw new Error(data.error || 'Failed to load workflow')
        }

        const data = await res.json()
        setWorkflow(data.workflow)
        setCurrentSigner(data.currentSigner)

        // Check if already signed
        if (data.currentSigner && data.currentSigner.status === 'SIGNED') {
          setSigned(true)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchWorkflow()
  }, [workflowId])

  const convertTypedSignatureToBase64 = (typedValue: string): string => {
    const parts = typedValue.split(':')
    if (parts[0] !== 'typed') return typedValue // already base64, return as-is

    const fontIndex = parseInt(parts[1])
    const name = parts.slice(2).join(':')

    const fonts = [
      'italic 32px Georgia, serif',           // Classic
      '32px Arial, sans-serif',               // Modern
      'italic 32px "Brush Script MT", cursive', // Script
      'bold 32px Arial, sans-serif',          // Bold
    ]

    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 100
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, 400, 100)
    ctx.fillStyle = '#000000'
    ctx.font = fonts[fontIndex] || fonts[0]
    ctx.textBaseline = 'middle'
    ctx.fillText(name, 20, 50)

    return canvas.toDataURL('image/png')
  }

  const handleSign = async () => {
    if (!signature || !agreed) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/workflows/${workflowId}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signatureBase64: convertTypedSignatureToBase64(signature),
          consentGiven: agreed,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit signature')
      }

      setSigned(true)
      setShowSignatureDialog(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to sign')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading workflow...</p>
        </div>
      </div>
    )
  }

  // Error state - not your turn
  if (waitingFor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-warning/10">
              <Clock className="h-8 w-8 text-warning" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">
              Not Your Turn Yet
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Waiting for <strong>{waitingFor}</strong> to sign first.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              You will be notified when it's your turn.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state - general
  if (error && !workflow) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">
              Error Loading Workflow
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {error}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!workflow || !currentSigner) {
    return null
  }

  // Cancelled workflow state
  if (workflow.status === 'CANCELLED') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">
              Workflow Cancelled
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This workflow has been cancelled. No further signatures are required.
            </p>
            <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4 text-left">
              <p className="text-sm font-medium text-foreground">
                {workflow.name}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Created by {workflow.creator.name}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const signedCount = workflow.signers.filter((s) => s.status === "SIGNED").length
  const totalSigners = workflow.signers.length
  const progressPercentage = ((signedCount + (signed ? 1 : 0)) / totalSigners) * 100
  const isAuthorized = true // Already checked by API

  // Success view after signing
  if (signed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">
              Document Signed Successfully
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Thank you for signing. {totalSigners - signedCount - 1 > 0
                ? "The next signer has been notified."
                : "All signatures have been collected. The document will be updated in Google Drive."}
            </p>
            <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4 text-left">
              <p className="text-sm font-medium text-foreground">
                {workflow.name}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Signed on {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <HardDrive className="h-3 w-3" />
              Document will be saved to Google Drive
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <Button asChild className="w-full">
                <a href="/dashboard">
                  Return to Dashboard
                </a>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <a href="/signatures">
                  View My Signatures
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <PenTool className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-base font-semibold tracking-tight text-foreground">
              Themis Legal
            </span>
            <span className="hidden sm:inline text-sm text-muted-foreground">•</span>
            <span className="hidden sm:inline text-sm text-muted-foreground truncate max-w-xs">
              {workflow.name}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-xs bg-primary/20">
                  {currentSigner.name.split(" ").map((n: string) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground hidden sm:inline">{currentSigner.name}</span>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href={`https://drive.google.com/file/d/${workflow.driveFileId}/view`} target="_blank" rel="noopener noreferrer">
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline ml-1.5">Download</span>
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Signing Progress Bar - Horizontal */}
      <div className="sticky top-14 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                Signing Progress:
              </span>
              <span className="text-sm text-muted-foreground">
                {signedCount} of {totalSigners} signed
              </span>
            </div>
            <span className="text-sm font-medium text-foreground">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-1.5 mb-3" />

          {/* Horizontal Signer List */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {workflow.signers.map((signer, index) => (
              <div
                key={signer.id}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 whitespace-nowrap ${
                  signer.email === currentSigner.email && signer.status !== "SIGNED"
                    ? "border-warning/50 bg-warning/10"
                    : signer.status === "SIGNED"
                    ? "border-success/30 bg-success/5"
                    : "border-border bg-muted/30"
                }`}
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium shrink-0">
                  {index + 1}
                </div>
                <Avatar className={`h-6 w-6 shrink-0 ${
                  signer.status === "SIGNED"
                    ? "ring-2 ring-success ring-offset-1"
                    : signer.email === currentSigner.email
                    ? "ring-2 ring-warning ring-offset-1"
                    : ""
                }`}>
                  <AvatarFallback className={`text-xs ${
                    signer.status === "SIGNED"
                      ? "bg-success/20"
                      : signer.email === currentSigner.email
                      ? "bg-warning/20"
                      : "bg-muted"
                  }`}>
                    {signer.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground">
                  {signer.name}
                  {signer.email === currentSigner.email && (
                    <span className="ml-1 text-xs text-muted-foreground">(You)</span>
                  )}
                </span>
                {signer.status === "SIGNED" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                ) : signer.email === currentSigner.email ? (
                  <Clock className="h-3.5 w-3.5 text-warning shrink-0" />
                ) : (
                  <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="px-4 py-6">
        {/* Document Preview - Full Width */}
        <div className="mx-auto max-w-7xl space-y-4">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-muted/20 p-4">
                <div className="mx-auto bg-card shadow-lg rounded-sm overflow-hidden">
                  <iframe
                    src={`/api/drive/files/${workflow.driveFileId}/pdf#view=FitH&toolbar=0&navpanes=0`}
                    className="w-full"
                    style={{ height: 'calc(100vh - 280px)', minHeight: '600px' }}
                    title={workflow.name}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Signature Section */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <PenTool className="h-4 w-4 text-primary" />
                  Your Signature Required
                </CardTitle>
                <Badge className="bg-warning/20 text-warning">
                  Step {currentSigner.order + 1} of {totalSigners}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 p-6">
                {signature ? (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-border bg-card p-4">
                      {signature.startsWith("typed:") ? (
                        <p className="text-2xl font-serif italic text-foreground">
                          {signature.split(":")[2]}
                        </p>
                      ) : (
                        <img
                          src={signature}
                          alt="Your signature"
                          className="max-h-20"
                        />
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setSignature(null)}
                      className="w-full"
                    >
                      Change Signature
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setShowSignatureDialog(true)}
                    className="w-full"
                    size="lg"
                  >
                    <PenTool className="mr-2 h-4 w-4" />
                    Add Your Signature
                  </Button>
                )}
              </div>

              {signature && (
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="agree"
                      checked={agreed}
                      onCheckedChange={(checked) => setAgreed(checked as boolean)}
                    />
                    <label
                      htmlFor="agree"
                      className="text-sm leading-relaxed text-muted-foreground"
                    >
                      I acknowledge that I am authorized to sign this document as{" "}
                      <strong className="text-foreground">{currentSigner.name}</strong> and that my
                      electronic signature has the same legal effect as a handwritten signature.
                    </label>
                  </div>
                  <Button
                    onClick={handleSign}
                    className="w-full"
                    size="lg"
                    disabled={!agreed || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Complete Signature
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Signature Dialog */}
      <Dialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Your Signature</DialogTitle>
            <DialogDescription>
              Draw or type your signature below. This will be your legally binding electronic signature.
            </DialogDescription>
          </DialogHeader>

          <SignaturePad
            onSignatureChange={setSignature}
            signerName={currentSigner.name}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignatureDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowSignatureDialog(false)} disabled={!signature}>
              Apply Signature
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
