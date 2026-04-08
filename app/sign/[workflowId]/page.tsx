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
  Scale,
  User,
  HardDrive,
  AlertCircle,
  Lock,
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

// Current authenticated user (in real app, this would come from auth context)
const currentUser = {
  id: "u1",
  name: "John Doe",
  email: "john@lawfirm.com",
}

// Mock workflow data
const mockWorkflow = {
  id: "wf-001",
  title: "Mutual Non-Disclosure Agreement - Tech Ventures Inc.",
  drivePath: "Legal/NDAs/Tech Ventures",
  driveFileId: "1abc123",
  driveUrl: "https://drive.google.com/file/d/1abc123",
  createdBy: {
    name: "James Mitchell",
    email: "james@lawfirm.com",
  },
  signers: [
    {
      id: "s1",
      name: "James Mitchell",
      email: "james@lawfirm.com",
      role: "Initiator",
      status: "signed",
      signedAt: "April 5, 2026 at 10:15 AM",
      order: 1,
    },
    {
      id: "s2",
      name: "John Doe",
      email: "john@lawfirm.com",
      role: "Partner",
      status: "current",
      signedAt: null,
      order: 2,
    },
    {
      id: "s3",
      name: "Sarah Chen",
      email: "sarah@techventures.com",
      role: "External Party",
      status: "pending",
      signedAt: null,
      order: 3,
    },
  ],
}

const documentContent = `
<div class="legal-document">
  <div class="document-header">
    <h1>MUTUAL NON-DISCLOSURE AGREEMENT</h1>
    <p class="document-meta">Agreement No. NDA-2026-0847</p>
  </div>

  <p class="preamble">This Mutual Non-Disclosure Agreement (the "Agreement") is entered into as of the date of last signature below (the "Effective Date"), by and between:</p>

  <div class="parties">
    <p><strong>PARTY A:</strong> Mitchell & Associates LLP, a limited liability partnership organized under the laws of the State of New York, with its principal place of business at 450 Park Avenue, Suite 2800, New York, NY 10022 (hereinafter referred to as "Mitchell Associates")</p>
    <p style="margin-top: 16px;"><strong>PARTY B:</strong> Tech Ventures Inc., a corporation organized under the laws of the State of Delaware, with its principal place of business at 1 Innovation Drive, San Francisco, CA 94107 (hereinafter referred to as "Tech Ventures")</p>
    <p style="margin-top: 16px;">Mitchell Associates and Tech Ventures are hereinafter referred to individually as a "Party" and collectively as the "Parties."</p>
  </div>

  <div class="recitals">
    <h2>RECITALS</h2>
    <p><strong>WHEREAS,</strong> the Parties wish to explore a potential business relationship concerning the development and licensing of proprietary software solutions (the "Purpose"); and</p>
    <p><strong>WHEREAS,</strong> in connection with the Purpose, each Party may disclose to the other certain confidential and proprietary information; and</p>
    <p><strong>WHEREAS,</strong> the Parties desire to protect such confidential information from unauthorized disclosure and use;</p>
    <p><strong>NOW, THEREFORE,</strong> in consideration of the mutual covenants and agreements set forth herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the Parties agree as follows:</p>
  </div>

  <h2>ARTICLE I — DEFINITIONS</h2>
  
  <p><strong>1.1</strong> "Confidential Information" shall mean any and all non-public information, in any form or medium, whether written, oral, electronic, visual, or otherwise, that is disclosed by one Party (the "Disclosing Party") to the other Party (the "Receiving Party") in connection with the Purpose, including but not limited to: (a) trade secrets, inventions, ideas, processes, formulas, source code, object code, algorithms, data, programs, software, and other works of authorship; (b) technical information, research and development, know-how, designs, drawings, specifications, techniques, and models; (c) business information, including business plans, financial information, marketing plans, customer lists, pricing information, and supplier information.</p>

  <h2>ARTICLE II — OBLIGATIONS OF CONFIDENTIALITY</h2>

  <p><strong>2.1</strong> The Receiving Party agrees to: (a) hold all Confidential Information in strict confidence; (b) not disclose Confidential Information to any third party without the prior written consent of the Disclosing Party; (c) use Confidential Information solely for the Purpose and for no other purpose whatsoever; (d) protect Confidential Information using the same degree of care it uses to protect its own confidential information, but in no event less than reasonable care.</p>

  <h2>ARTICLE III — TERM AND TERMINATION</h2>

  <p><strong>3.1</strong> This Agreement shall remain in effect for a period of two (2) years from the Effective Date, unless earlier terminated by either Party upon thirty (30) days prior written notice to the other Party.</p>

  <p><strong>3.2</strong> The confidentiality obligations set forth in Article II shall survive the termination or expiration of this Agreement for a period of five (5) years following such termination or expiration.</p>

  <h2>ARTICLE IV — GENERAL PROVISIONS</h2>

  <p><strong>4.1</strong> <u>Governing Law.</u> This Agreement shall be governed by and construed in accordance with the laws of the State of New York, without regard to its conflict of laws principles.</p>

  <p><strong>4.2</strong> <u>Entire Agreement.</u> This Agreement constitutes the entire agreement between the Parties with respect to the subject matter hereof and supersedes all prior and contemporaneous agreements and understandings, whether written or oral, relating to such subject matter.</p>

  <div class="execution">
    <p><strong>IN WITNESS WHEREOF,</strong> the Parties have executed this Mutual Non-Disclosure Agreement as of the Effective Date first written above.</p>
  </div>
</div>
`

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

  // Check if current user is authorized to sign
  const currentSigner = mockWorkflow.signers.find(
    (s) => s.email === currentUser.email && s.status === "current"
  )
  const isAuthorized = currentSigner !== null
  const isTheirTurn = currentSigner?.status === "current"

  const signedCount = mockWorkflow.signers.filter((s) => s.status === "signed").length
  const totalSigners = mockWorkflow.signers.length
  const progressPercentage = ((signedCount + (signed ? 1 : 0)) / totalSigners) * 100

  const handleSign = () => {
    setSigned(true)
    setShowSignatureDialog(false)
  }

  // Not authorized view
  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <Lock className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">
              Access Denied
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              You are not authorized to sign this document, or it is not your turn in the signing order.
            </p>
            <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4 text-left">
              <p className="text-sm font-medium text-foreground">
                Signed in as: {currentUser.name}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {currentUser.email}
              </p>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              If you believe this is an error, please contact the workflow creator.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

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
                {mockWorkflow.title}
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
              Document will sync to: {mockWorkflow.drivePath}
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
                  {currentUser.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground">{currentUser.name}</span>
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
                You are signing as <strong>{currentUser.name}</strong> ({currentUser.email}). 
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
                      {mockWorkflow.title}
                    </CardTitle>
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <HardDrive className="h-4 w-4" />
                      {mockWorkflow.drivePath}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0" asChild>
                    <a href={mockWorkflow.driveUrl} target="_blank" rel="noopener noreferrer">
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
                    <div className="mx-auto max-w-[8.5in] bg-card shadow-lg rounded-sm">
                      <div 
                        className="legal-content p-12 sm:p-16"
                        dangerouslySetInnerHTML={{ __html: documentContent }}
                      />
                      <style jsx global>{`
                        .legal-content {
                          font-family: 'Times New Roman', Times, serif;
                          font-size: 12px;
                          line-height: 1.8;
                          color: hsl(var(--foreground));
                        }
                        .legal-content .document-header {
                          text-align: center;
                          margin-bottom: 32px;
                        }
                        .legal-content .document-header h1 {
                          font-size: 18px;
                          font-weight: bold;
                          letter-spacing: 0.1em;
                          margin-bottom: 8px;
                        }
                        .legal-content .document-meta {
                          font-size: 11px;
                          color: hsl(var(--muted-foreground));
                        }
                        .legal-content .preamble {
                          margin-bottom: 24px;
                          text-align: justify;
                        }
                        .legal-content .parties {
                          margin-bottom: 24px;
                          text-align: justify;
                        }
                        .legal-content .recitals {
                          margin-bottom: 24px;
                        }
                        .legal-content .recitals h2 {
                          font-size: 12px;
                          font-weight: bold;
                          margin-bottom: 12px;
                          text-transform: uppercase;
                        }
                        .legal-content .recitals p {
                          text-align: justify;
                          margin-bottom: 12px;
                          text-indent: 24px;
                        }
                        .legal-content h2 {
                          font-size: 13px;
                          font-weight: bold;
                          margin-top: 28px;
                          margin-bottom: 16px;
                          text-transform: uppercase;
                          letter-spacing: 0.05em;
                        }
                        .legal-content p {
                          text-align: justify;
                          margin-bottom: 16px;
                          text-indent: 24px;
                        }
                        .legal-content .execution {
                          margin-top: 40px;
                          padding-top: 20px;
                          border-top: 1px solid hsl(var(--border));
                        }
                        .legal-content .execution p {
                          text-indent: 0;
                        }
                      `}</style>
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
                        {currentUser.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {currentSigner?.role}
                      </p>
                    </div>
                    <Badge className="bg-warning/20 text-warning">
                      Step {currentSigner?.order} of {totalSigners}
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
                        <strong className="text-foreground">{currentUser.name}</strong> and that my 
                        electronic signature has the same legal effect as a handwritten signature.
                      </label>
                    </div>
                    <Button
                      onClick={handleSign}
                      className="w-full"
                      size="lg"
                      disabled={!agreed}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Complete Signature
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
                  {mockWorkflow.signers.map((signer, index) => (
                    <div
                      key={signer.id}
                      className={`flex items-center gap-3 rounded-lg border p-3 ${
                        signer.status === "current" && signer.email === currentUser.email
                          ? "border-primary/50 bg-primary/5"
                          : ""
                      }`}
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </div>
                      <Avatar className={`h-8 w-8 ${
                        signer.status === "signed" 
                          ? "ring-2 ring-success ring-offset-1" 
                          : signer.status === "current" 
                          ? "ring-2 ring-warning ring-offset-1" 
                          : ""
                      }`}>
                        <AvatarFallback className={`text-xs ${
                          signer.status === "signed" 
                            ? "bg-success/20" 
                            : signer.status === "current" 
                            ? "bg-warning/20" 
                            : "bg-muted"
                        }`}>
                          {signer.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {signer.name}
                          {signer.email === currentUser.email && (
                            <span className="ml-1 text-xs text-muted-foreground">(You)</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {signer.role}
                        </p>
                      </div>
                      {signer.status === "signed" ? (
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                      ) : signer.status === "current" ? (
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
                  <span className="font-medium text-foreground">{mockWorkflow.createdBy.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium text-foreground truncate">{mockWorkflow.drivePath}</span>
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
            signerName={currentUser.name}
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
