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

// Mock document data with realistic NDA content
const mockDocument = {
  id: "1",
  title: "Mutual Non-Disclosure Agreement",
  type: "NDA",
  createdBy: {
    name: "James Mitchell, Esq.",
    email: "j.mitchell@mitchelllaw.com",
    firm: "Mitchell & Associates LLP"
  },
  signers: [
    {
      id: "1",
      name: "James Mitchell, Esq.",
      email: "j.mitchell@mitchelllaw.com",
      role: "Partner, Mitchell & Associates LLP",
      status: "signed",
      signedAt: "April 4, 2026 at 2:30 PM",
    },
    {
      id: "2",
      name: "Sarah Chen",
      email: "sarah.chen@techventures.com",
      role: "Chief Executive Officer, Tech Ventures Inc.",
      status: "current",
      signedAt: null,
    },
    {
      id: "3",
      name: "Michael Rodriguez",
      email: "m.rodriguez@techventures.com",
      role: "General Counsel, Tech Ventures Inc.",
      status: "waiting",
      signedAt: null,
    },
  ],
  signatureFields: [
    {
      id: "sig1",
      signerEmail: "sarah.chen@techventures.com",
      signerName: "Sarah Chen",
      role: "Chief Executive Officer",
      includeDate: true,
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
  
  <p><strong>1.1</strong> "Confidential Information" shall mean any and all non-public information, in any form or medium, whether written, oral, electronic, visual, or otherwise, that is disclosed by one Party (the "Disclosing Party") to the other Party (the "Receiving Party") in connection with the Purpose, including but not limited to: (a) trade secrets, inventions, ideas, processes, formulas, source code, object code, algorithms, data, programs, software, and other works of authorship; (b) technical information, research and development, know-how, designs, drawings, specifications, techniques, and models; (c) business information, including business plans, financial information, marketing plans, customer lists, pricing information, and supplier information; (d) information regarding employees, consultants, and contractors; and (e) any other information that is designated as confidential or that, under the circumstances of disclosure, should reasonably be considered confidential.</p>

  <p><strong>1.2</strong> Confidential Information shall not include information that: (a) was in the public domain at the time of disclosure, or subsequently enters the public domain through no fault of the Receiving Party; (b) was rightfully known to the Receiving Party prior to disclosure, as demonstrated by written records; (c) is disclosed to the Receiving Party by a third party who has the legal right to make such disclosure without restriction; (d) is independently developed by the Receiving Party without reference to or use of the Disclosing Party's Confidential Information; or (e) is required to be disclosed by law, regulation, or court order, provided that the Receiving Party provides prompt written notice to the Disclosing Party.</p>

  <h2>ARTICLE II — OBLIGATIONS OF CONFIDENTIALITY</h2>

  <p><strong>2.1</strong> The Receiving Party agrees to: (a) hold all Confidential Information in strict confidence; (b) not disclose Confidential Information to any third party without the prior written consent of the Disclosing Party; (c) use Confidential Information solely for the Purpose and for no other purpose whatsoever; (d) protect Confidential Information using the same degree of care it uses to protect its own confidential information, but in no event less than reasonable care; and (e) limit access to Confidential Information to those of its employees, agents, and representatives who have a need to know such information for the Purpose and who are bound by confidentiality obligations at least as protective as those set forth herein.</p>

  <p><strong>2.2</strong> The Receiving Party shall be responsible for any breach of this Agreement by its employees, agents, representatives, or any third party to whom it has disclosed Confidential Information in accordance with this Agreement.</p>

  <p><strong>2.3</strong> Upon termination of this Agreement or upon the request of the Disclosing Party, the Receiving Party shall promptly return or destroy all Confidential Information and all copies thereof, and shall certify in writing that it has done so.</p>

  <h2>ARTICLE III — INTELLECTUAL PROPERTY</h2>

  <p><strong>3.1</strong> Nothing in this Agreement shall be construed as granting any rights, by license or otherwise, to any Confidential Information disclosed hereunder, except as expressly set forth herein.</p>

  <p><strong>3.2</strong> All Confidential Information shall remain the sole property of the Disclosing Party. No license, express or implied, is granted to the Receiving Party under any patent, copyright, trademark, trade secret, or other intellectual property right of the Disclosing Party.</p>

  <h2>ARTICLE IV — TERM AND TERMINATION</h2>

  <p><strong>4.1</strong> This Agreement shall remain in effect for a period of two (2) years from the Effective Date, unless earlier terminated by either Party upon thirty (30) days prior written notice to the other Party.</p>

  <p><strong>4.2</strong> The confidentiality obligations set forth in Article II shall survive the termination or expiration of this Agreement for a period of five (5) years following such termination or expiration.</p>

  <h2>ARTICLE V — REMEDIES</h2>

  <p><strong>5.1</strong> The Receiving Party acknowledges that any breach of its obligations under this Agreement may cause irreparable harm to the Disclosing Party for which monetary damages may be inadequate. Accordingly, the Disclosing Party shall be entitled to seek equitable relief, including injunction and specific performance, in addition to any other remedies available at law or in equity, without the necessity of proving actual damages or posting any bond or security.</p>

  <h2>ARTICLE VI — GENERAL PROVISIONS</h2>

  <p><strong>6.1</strong> <u>Governing Law.</u> This Agreement shall be governed by and construed in accordance with the laws of the State of New York, without regard to its conflict of laws principles.</p>

  <p><strong>6.2</strong> <u>Entire Agreement.</u> This Agreement constitutes the entire agreement between the Parties with respect to the subject matter hereof and supersedes all prior and contemporaneous agreements and understandings, whether written or oral, relating to such subject matter.</p>

  <p><strong>6.3</strong> <u>Amendment.</u> This Agreement may not be amended or modified except by a written instrument signed by both Parties.</p>

  <p><strong>6.4</strong> <u>Severability.</u> If any provision of this Agreement is held to be invalid or unenforceable, such provision shall be struck and the remaining provisions shall be enforced to the fullest extent permitted by law.</p>

  <p><strong>6.5</strong> <u>Waiver.</u> The failure of either Party to enforce any right or provision of this Agreement shall not constitute a waiver of such right or provision.</p>

  <p><strong>6.6</strong> <u>Assignment.</u> Neither Party may assign this Agreement without the prior written consent of the other Party, except that either Party may assign this Agreement in connection with a merger, acquisition, or sale of all or substantially all of its assets.</p>

  <p><strong>6.7</strong> <u>Counterparts.</u> This Agreement may be executed in counterparts, each of which shall be deemed an original and all of which together shall constitute one and the same instrument. Electronic signatures shall be deemed valid and binding.</p>

  <div class="execution">
    <p><strong>IN WITNESS WHEREOF,</strong> the Parties have executed this Mutual Non-Disclosure Agreement as of the Effective Date first written above.</p>
  </div>
</div>
`

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
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-8 w-8 text-success" />
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
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
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

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
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
                        {mockDocument.type}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl text-balance">
                      {mockDocument.title}
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Prepared by {mockDocument.createdBy.name} - {mockDocument.createdBy.firm}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0">
                    <Download className="mr-2 h-4 w-4" />
                    Download
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
                {mockDocument.signatureFields
                  .filter((field) => field.signerEmail === currentSigner?.email)
                  .map((field) => (
                    <div
                      key={field.id}
                      className="rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 p-8"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <p className="text-base font-semibold text-foreground">
                            {field.signerName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {field.role}
                          </p>
                        </div>
                        <Button onClick={() => setShowSignatureDialog(true)} size="lg">
                          <PenTool className="mr-2 h-4 w-4" />
                          Sign Document
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                            Signature
                          </p>
                          <div className="h-20 border-b-2 border-foreground/30" />
                          <p className="mt-2 text-sm font-medium">{field.signerName}</p>
                          <p className="text-xs text-muted-foreground">{field.role}</p>
                        </div>
                        {field.includeDate && (
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                              Date
                            </p>
                            <div className="h-20 border-b-2 border-foreground/30 flex items-end justify-center pb-2">
                              <span className="text-sm text-muted-foreground">
                                {new Date().toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
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
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium",
                          signer.status === "signed"
                            ? "bg-success/10 text-success"
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

            {/* Document Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Document Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Document ID</dt>
                    <dd className="font-mono text-xs text-foreground">NDA-2026-0847</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Created</dt>
                    <dd className="text-foreground">April 3, 2026</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Expires</dt>
                    <dd className="text-foreground">April 10, 2026</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Secure & Legally Binding
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      This document is protected with 256-bit encryption. Your electronic signature is legally binding under the ESIGN Act and UETA.
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
              I agree that my electronic signature is a legal representation of my
              signature on this document and I consent to conducting this
              transaction electronically pursuant to the Electronic Signatures in
              Global and National Commerce Act (ESIGN Act).
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
