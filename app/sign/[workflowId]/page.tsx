"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import {
  CheckCircle2,
  Clock,
  FileText,
  PenTool,
  ChevronDown,
  ChevronUp,
  Download,
  Shield,
  Scale,
  User,
  HardDrive,
  AlertCircle,
  Lock,
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
  const [showDocumentPreview, setShowDocumentPreview] = useState(true)

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
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <PenTool className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">
              Themis Legal
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1.5">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-primary/20">
                  {currentSigner.name.split(" ").map((n: string) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground">{currentSigner.name}</span>
            </div>
            <Badge variant="outline" className="gap-1.5 hidden sm:flex">
              <Shield className="h-3 w-3" />
              Authenticated
            </Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Auth Notice */}
        <div className="mb-6 rounded-lg border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Authenticated Signing Session</p>
              <p className="text-sm text-muted-foreground">
                You are signing as <strong>{currentSigner.name}</strong> ({currentSigner.email}).
                Only authenticated users can sign documents.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Document Preview */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border bg-muted/30 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="gap-1">
                        <Scale className="h-3 w-3" />
                        NDA
                      </Badge>
                      <Badge className="bg-warning/20 text-warning gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Your Turn to Sign
                      </Badge>
                    </div>
                    <CardTitle className="text-xl text-balance">
                      {workflow.name}
                    </CardTitle>
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <HardDrive className="h-4 w-4" />
                      Google Drive
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0" asChild>
                    <a href={`https://drive.google.com/file/d/${workflow.driveFileId}/view`} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Button
                  variant="ghost"
                  className="w-full justify-between rounded-none border-b border-border px-6 py-3"
                  onClick={() => setShowDocumentPreview(!showDocumentPreview)}
                >
                  <span className="text-sm font-medium">Document Content</span>
                  {showDocumentPreview ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                {showDocumentPreview && (
                  <div className="bg-muted/20 p-6">
                    <div className="mx-auto max-w-[8.5in] bg-card shadow-lg rounded-sm overflow-hidden">
                      <iframe
                        src={`/api/drive/files/${workflow.driveFileId}/pdf`}
                        className="w-full"
                        style={{ height: '800px' }}
                        title={workflow.name}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Signature Section */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <PenTool className="h-4 w-4 text-primary" />
                  Your Signature Required
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-base font-semibold text-foreground">
                        {currentSigner.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Signer {currentSigner.order + 1}
                      </p>
                    </div>
                    <Badge className="bg-warning/20 text-warning">
                      Step {currentSigner.order + 1} of {totalSigners}
                    </Badge>
                  </div>

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

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Progress */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Signing Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">
                      {signedCount} of {totalSigners} signed
                    </span>
                    <span className="font-medium text-foreground">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>

                <div className="space-y-2">
                  {workflow.signers.map((signer, index) => (
                    <div
                      key={signer.id}
                      className={`flex items-center gap-3 rounded-lg border p-3 ${
                        signer.email === currentSigner.email && signer.status !== "SIGNED"
                          ? "border-primary/50 bg-primary/5"
                          : ""
                      }`}
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </div>
                      <Avatar className={`h-8 w-8 ${
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
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {signer.name}
                          {signer.email === currentSigner.email && (
                            <span className="ml-1 text-xs text-muted-foreground">(You)</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          Signer {signer.order + 1}
                        </p>
                      </div>
                      {signer.status === "SIGNED" ? (
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                      ) : signer.email === currentSigner.email ? (
                        <Clock className="h-4 w-4 text-warning shrink-0" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Workflow Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Workflow Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created by:</span>
                  <span className="font-medium text-foreground">{workflow.creator.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium text-foreground truncate">Google Drive</span>
                </div>
              </CardContent>
            </Card>
          </div>
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
