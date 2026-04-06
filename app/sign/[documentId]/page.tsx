"use client"

import { useState } from "react"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
import { cn } from "@/lib/utils"

// Mock document data
const mockDocument = {
  id: "1",
  title: "Software Development Agreement - TechCorp Inc.",
  type: "Contract",
  createdBy: {
    name: "John Doe",
    email: "john@lawfirm.com",
  },
  signers: [
    {
      id: "1",
      name: "John Doe",
      email: "john@lawfirm.com",
      role: "Creator",
      status: "signed",
      signedAt: "April 4, 2026 at 2:30 PM",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah@techcorp.com",
      role: "CEO, TechCorp Inc.",
      status: "current",
      signedAt: null,
    },
    {
      id: "3",
      name: "Michael Chen",
      email: "michael@techcorp.com",
      role: "Legal Counsel",
      status: "waiting",
      signedAt: null,
    },
  ],
  content: `
    <h1>Software Development Agreement</h1>
    <p>This Software Development Agreement ("Agreement") is entered into as of the date of last signature below, by and between:</p>
    <p><strong>Party A:</strong> TechCorp Inc., a corporation organized under the laws of Delaware, with its principal place of business at 123 Tech Boulevard, San Francisco, CA 94105 ("Client")</p>
    <p><strong>Party B:</strong> Law Firm LLP, a limited liability partnership, with its principal place of business at 456 Legal Street, New York, NY 10001 ("Developer")</p>
    <h2>1. Scope of Work</h2>
    <p>Developer agrees to provide software development services as described in Exhibit A attached hereto ("Services"). The Services shall be performed in accordance with the specifications, timelines, and deliverables set forth in Exhibit A.</p>
    <h2>2. Compensation</h2>
    <p>Client agrees to pay Developer the fees set forth in Exhibit B attached hereto. Payment terms and conditions are as specified in Exhibit B.</p>
    <h2>3. Intellectual Property</h2>
    <p>All intellectual property rights in the deliverables created under this Agreement shall be owned by Client upon full payment of all fees due hereunder.</p>
    <h2>4. Confidentiality</h2>
    <p>Each party agrees to maintain the confidentiality of any proprietary or confidential information disclosed by the other party during the term of this Agreement.</p>
    <h2>5. Term and Termination</h2>
    <p>This Agreement shall commence on the Effective Date and continue until all Services have been completed, unless earlier terminated in accordance with the provisions herein.</p>
  `,
  signatureFields: [
    {
      id: "sig1",
      signerEmail: "sarah@techcorp.com",
      signerName: "Sarah Johnson",
      role: "CEO, TechCorp Inc.",
      includeDate: true,
    },
  ],
}

export default function SigningPage({
  params,
}: {
  params: Promise<{ documentId: string }>
}) {
  const { documentId } = use(params)
  const [showSignatureDialog, setShowSignatureDialog] = useState(false)
  const [signature, setSignature] = useState<string | null>(null)
  const [agreed, setAgreed] = useState(false)
  const [signed, setSigned] = useState(false)
  const [showDocumentPreview, setShowDocumentPreview] = useState(true)

  const currentSigner = mockDocument.signers.find((s) => s.status === "current")
  const signedCount = mockDocument.signers.filter((s) => s.status === "signed").length
  const totalSigners = mockDocument.signers.length
  const progressPercentage = (signedCount / totalSigners) * 100

  const handleSign = () => {
    setSigned(true)
    setShowSignatureDialog(false)
  }

  if (signed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
              <CheckCircle2 className="h-8 w-8 text-accent" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">
              Document Signed Successfully
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Thank you for signing. The next signer has been notified.
            </p>
            <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4 text-left">
              <p className="text-sm font-medium text-foreground">
                {mockDocument.title}
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
            <p className="mt-4 text-xs text-muted-foreground">
              A copy of the signed document will be sent to your email once all parties have signed.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <PenTool className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">
              SignFlow
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1.5 hidden sm:flex">
              <Shield className="h-3 w-3" />
              Secure Signing
            </Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Document Preview */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      {mockDocument.type}
                    </Badge>
                    <CardTitle className="text-xl text-balance">
                      {mockDocument.title}
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Sent by {mockDocument.createdBy.name}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  variant="ghost"
                  className="w-full justify-between"
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
                  <div
                    className="prose prose-sm mt-4 max-w-none rounded-lg border border-border bg-card p-6"
                    dangerouslySetInnerHTML={{ __html: mockDocument.content }}
                  />
                )}
              </CardContent>
            </Card>

            {/* Signature Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your Signature</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockDocument.signatureFields
                  .filter((field) => field.signerEmail === currentSigner?.email)
                  .map((field) => (
                    <div
                      key={field.id}
                      className="rounded-lg border-2 border-dashed border-accent/50 bg-accent/5 p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {field.signerName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {field.role}
                          </p>
                        </div>
                        <Button onClick={() => setShowSignatureDialog(true)}>
                          <PenTool className="mr-2 h-4 w-4" />
                          Sign Here
                        </Button>
                      </div>
                      {field.includeDate && (
                        <div className="mt-4 flex items-end justify-between border-t border-accent/30 pt-4">
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">
                              Signature
                            </p>
                            <div className="mt-1 h-12 border-b border-muted-foreground/30" />
                          </div>
                          <div className="ml-6 text-right">
                            <p className="text-xs text-muted-foreground">Date</p>
                            <p className="mt-1 text-sm text-foreground">
                              {new Date().toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Progress Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Signing Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
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
                  {mockDocument.signers.map((signer, index) => (
                    <div
                      key={signer.id}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                        signer.status === "current"
                          ? "border-accent bg-accent/5"
                          : "border-border"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium",
                          signer.status === "signed"
                            ? "bg-accent/10 text-accent"
                            : signer.status === "current"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {signer.status === "signed" ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {signer.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {signer.status === "signed"
                            ? `Signed ${signer.signedAt}`
                            : signer.status === "current"
                            ? "Your turn to sign"
                            : "Waiting"}
                        </p>
                      </div>
                      {signer.status === "current" && (
                        <Badge variant="default" className="shrink-0">
                          You
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Secure & Legal
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      This document is protected and your signature is legally binding. All activity is logged for compliance.
                    </p>
                  </div>
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
            <DialogTitle>Sign Document</DialogTitle>
            <DialogDescription>
              Create your signature using one of the methods below.
            </DialogDescription>
          </DialogHeader>

          <SignaturePad
            onSignatureChange={setSignature}
            signerName={currentSigner?.name || ""}
          />

          <div className="flex items-start space-x-2">
            <Checkbox
              id="agree"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
            />
            <label
              htmlFor="agree"
              className="text-sm leading-relaxed text-muted-foreground"
            >
              I agree that my signature above is a legal representation of my
              signature on this document and I consent to conducting this
              transaction electronically.
            </label>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSignatureDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSign} disabled={!signature || !agreed}>
              Adopt and Sign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
