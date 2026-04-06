"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Save,
  Eye,
  Send,
  FileText,
  Shield,
  FileSignature,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BlockEditor } from "@/components/block-editor"
import { SignerManagement, type Signer } from "@/components/signer-management"
import { SignatureFieldDialog } from "@/components/signature-field-dialog"

type DocumentType = "contract" | "nda" | "authorization"

interface Block {
  id: string
  type: "paragraph" | "heading1" | "heading2" | "heading3" | "bullet-list" | "numbered-list" | "separator" | "signature"
  content: string
  signatureData?: {
    signerName: string
    signerEmail: string
    role: string
    includeDate: boolean
    includeInitials: boolean
  }
}

const documentTypeConfig: Record<
  DocumentType,
  { label: string; icon: React.ComponentType<{ className?: string }>; description: string }
> = {
  contract: {
    label: "Contract",
    icon: FileText,
    description: "Business agreements, service contracts, employment terms",
  },
  nda: {
    label: "NDA",
    icon: Shield,
    description: "Non-disclosure agreements, confidentiality contracts",
  },
  authorization: {
    label: "Authorization",
    icon: FileSignature,
    description: "Authorization letters, consent forms, permission documents",
  },
}

// Real NDA document blocks
const ndaBlocks: Block[] = [
  { id: "1", type: "heading1", content: "NON-DISCLOSURE AGREEMENT" },
  { id: "2", type: "paragraph", content: "This Non-Disclosure Agreement (the \"Agreement\") is entered into as of the date of last signature below (the \"Effective Date\"), by and between the undersigned parties." },
  { id: "3", type: "heading2", content: "ARTICLE I. DEFINITIONS" },
  { id: "4", type: "paragraph", content: "\"Confidential Information\" shall mean any and all non-public information, including, without limitation, technical, developmental, marketing, sales, operating, performance, cost, know-how, business plans, business methods, and process information, disclosed to the Receiving Party. For the purposes of this Agreement, Confidential Information shall not include information that: (a) was publicly known at the time of disclosure or becomes publicly known through no fault of the Receiving Party; (b) was known to the Receiving Party at the time of disclosure; (c) is disclosed with the prior written approval of the Disclosing Party; (d) was independently developed by the Receiving Party without any use of the Confidential Information; or (e) becomes known to the Receiving Party from a source other than the Disclosing Party without breach of this Agreement." },
  { id: "5", type: "heading2", content: "ARTICLE II. OBLIGATIONS OF RECEIVING PARTY" },
  { id: "6", type: "paragraph", content: "The Receiving Party agrees that it shall: (a) protect the confidentiality of the Confidential Information of the Disclosing Party with the same degree of care as it protects its own confidential information, but in no event less than reasonable care; (b) not use Confidential Information for any purpose other than to evaluate and engage in discussions concerning a potential business relationship between the parties; (c) not disclose Confidential Information to any third party without the prior written consent of the Disclosing Party; (d) limit access to Confidential Information to those of its employees, agents, and representatives who need to know such information and who have signed confidentiality agreements or are otherwise bound by confidentiality obligations at least as restrictive as those contained herein." },
  { id: "7", type: "heading2", content: "ARTICLE III. TERM AND TERMINATION" },
  { id: "8", type: "paragraph", content: "This Agreement shall remain in effect for a period of two (2) years from the Effective Date, unless earlier terminated by either party upon thirty (30) days prior written notice to the other party. The confidentiality obligations set forth herein shall survive the termination or expiration of this Agreement for a period of five (5) years following such termination or expiration." },
  { id: "9", type: "heading2", content: "ARTICLE IV. REMEDIES" },
  { id: "10", type: "paragraph", content: "The Receiving Party acknowledges that any breach of its obligations hereunder may cause irreparable harm to the Disclosing Party, for which monetary damages may be inadequate, and agrees that the Disclosing Party shall be entitled to seek equitable relief, including injunction and specific performance, in addition to any other remedies available at law or in equity, without the necessity of proving actual damages or posting any bond or other security." },
  { id: "11", type: "heading2", content: "ARTICLE V. GENERAL PROVISIONS" },
  { id: "12", type: "paragraph", content: "This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without giving effect to its conflict of laws provisions. This Agreement constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior and contemporaneous agreements and understandings, whether written or oral, relating to such subject matter. This Agreement may not be amended or modified except by a written instrument signed by both parties. If any provision of this Agreement is held to be invalid or unenforceable, such provision shall be struck and the remaining provisions shall be enforced to the fullest extent under law." },
  { id: "13", type: "separator", content: "" },
  { id: "14", type: "paragraph", content: "IN WITNESS WHEREOF, the parties have executed this Non-Disclosure Agreement as of the Effective Date." },
]

// Real Contract document blocks
const contractBlocks: Block[] = [
  { id: "1", type: "heading1", content: "PROFESSIONAL SERVICES AGREEMENT" },
  { id: "2", type: "paragraph", content: "This Professional Services Agreement (the \"Agreement\") is made and entered into as of the date of last signature below (the \"Effective Date\"), by and between the parties identified in the signature blocks below." },
  { id: "3", type: "heading2", content: "ARTICLE I. ENGAGEMENT AND SCOPE OF SERVICES" },
  { id: "4", type: "paragraph", content: "1.1 Engagement. The Client hereby engages the Service Provider to perform the professional services described in Exhibit A attached hereto and incorporated herein by reference (the \"Services\"). The Service Provider accepts such engagement and agrees to perform the Services in accordance with the terms and conditions of this Agreement." },
  { id: "5", type: "paragraph", content: "1.2 Standard of Performance. The Service Provider shall perform the Services in a professional and workmanlike manner, consistent with industry standards and practices, and in compliance with all applicable laws, rules, and regulations. The Service Provider represents and warrants that it has the necessary skills, experience, and qualifications to perform the Services." },
  { id: "6", type: "heading2", content: "ARTICLE II. COMPENSATION AND PAYMENT" },
  { id: "7", type: "paragraph", content: "2.1 Fees. In consideration for the Services, the Client agrees to pay the Service Provider the fees set forth in Exhibit B attached hereto (the \"Fees\"). Unless otherwise specified in Exhibit B, all Fees are exclusive of applicable taxes, which shall be the responsibility of the Client." },
  { id: "8", type: "paragraph", content: "2.2 Payment Terms. The Service Provider shall submit invoices to the Client on a monthly basis, or as otherwise specified in Exhibit B. The Client shall pay all undisputed invoices within thirty (30) days of receipt. Any amounts not paid when due shall bear interest at the rate of one and one-half percent (1.5%) per month, or the maximum rate permitted by law, whichever is less." },
  { id: "9", type: "paragraph", content: "2.3 Expenses. The Client shall reimburse the Service Provider for all reasonable out-of-pocket expenses incurred in connection with the performance of the Services, provided such expenses have been pre-approved in writing by the Client and are documented with appropriate receipts or other evidence." },
  { id: "10", type: "heading2", content: "ARTICLE III. TERM AND TERMINATION" },
  { id: "11", type: "paragraph", content: "3.1 Term. This Agreement shall commence on the Effective Date and shall continue in effect until the Services have been completed or this Agreement is terminated in accordance with the provisions hereof." },
  { id: "12", type: "paragraph", content: "3.2 Termination for Convenience. Either party may terminate this Agreement for any reason upon thirty (30) days prior written notice to the other party. Upon such termination, the Client shall pay the Service Provider for all Services performed through the effective date of termination." },
  { id: "13", type: "paragraph", content: "3.3 Termination for Cause. Either party may terminate this Agreement immediately upon written notice if the other party: (a) materially breaches this Agreement and fails to cure such breach within fifteen (15) days after receipt of written notice thereof; or (b) becomes insolvent, files for bankruptcy, or makes an assignment for the benefit of creditors." },
  { id: "14", type: "heading2", content: "ARTICLE IV. INTELLECTUAL PROPERTY" },
  { id: "15", type: "paragraph", content: "4.1 Work Product. All deliverables, work product, and materials created by the Service Provider in the performance of the Services (collectively, \"Work Product\") shall be the sole and exclusive property of the Client upon full payment of all Fees. The Service Provider hereby assigns to the Client all right, title, and interest in and to the Work Product, including all intellectual property rights therein." },
  { id: "16", type: "paragraph", content: "4.2 Pre-Existing Materials. Notwithstanding the foregoing, the Service Provider shall retain all right, title, and interest in and to any tools, methodologies, know-how, or other materials that were developed by the Service Provider prior to or independently of this Agreement (\"Pre-Existing Materials\"). To the extent any Pre-Existing Materials are incorporated into the Work Product, the Service Provider hereby grants to the Client a non-exclusive, perpetual, irrevocable, royalty-free license to use such Pre-Existing Materials solely as part of the Work Product." },
  { id: "17", type: "heading2", content: "ARTICLE V. CONFIDENTIALITY" },
  { id: "18", type: "paragraph", content: "Each party agrees to maintain the confidentiality of any proprietary or confidential information disclosed by the other party during the term of this Agreement and for a period of three (3) years thereafter. Confidential information shall not include information that is publicly available, rightfully received from a third party, or independently developed without use of the other party's confidential information." },
  { id: "19", type: "heading2", content: "ARTICLE VI. LIMITATION OF LIABILITY" },
  { id: "20", type: "paragraph", content: "IN NO EVENT SHALL EITHER PARTY BE LIABLE TO THE OTHER FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, OR EXEMPLARY DAMAGES ARISING OUT OF OR IN CONNECTION WITH THIS AGREEMENT, REGARDLESS OF WHETHER SUCH DAMAGES ARE BASED ON CONTRACT, TORT, STRICT LIABILITY, OR ANY OTHER THEORY, EVEN IF SUCH PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. THE SERVICE PROVIDER'S TOTAL LIABILITY UNDER THIS AGREEMENT SHALL NOT EXCEED THE TOTAL FEES PAID BY THE CLIENT UNDER THIS AGREEMENT." },
  { id: "21", type: "heading2", content: "ARTICLE VII. GENERAL PROVISIONS" },
  { id: "22", type: "paragraph", content: "7.1 Governing Law. This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of laws principles." },
  { id: "23", type: "paragraph", content: "7.2 Entire Agreement. This Agreement, including all exhibits attached hereto, constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior negotiations, representations, and agreements relating to such subject matter." },
  { id: "24", type: "paragraph", content: "7.3 Amendment. This Agreement may not be amended or modified except by a written instrument signed by authorized representatives of both parties." },
  { id: "25", type: "separator", content: "" },
  { id: "26", type: "paragraph", content: "IN WITNESS WHEREOF, the parties have executed this Professional Services Agreement as of the Effective Date first written above." },
]

// Authorization document blocks
const authorizationBlocks: Block[] = [
  { id: "1", type: "heading1", content: "AUTHORIZATION AND CONSENT FORM" },
  { id: "2", type: "paragraph", content: "This Authorization and Consent Form (the \"Authorization\") is executed as of the date of signature below by the undersigned individual (the \"Authorizing Party\")." },
  { id: "3", type: "heading2", content: "SECTION 1. GRANT OF AUTHORIZATION" },
  { id: "4", type: "paragraph", content: "The Authorizing Party hereby grants authorization and consent to the party or parties identified below (the \"Authorized Party\") to act on behalf of the Authorizing Party with respect to the matters specifically described herein. This Authorization is limited to the specific purposes stated below and does not convey any general power of attorney or authority beyond the scope expressly granted." },
  { id: "5", type: "heading2", content: "SECTION 2. SCOPE OF AUTHORITY" },
  { id: "6", type: "paragraph", content: "The Authorized Party is hereby authorized to: (a) access, review, and obtain copies of records and documents pertaining to the Authorizing Party; (b) communicate with third parties on behalf of the Authorizing Party regarding the matters described herein; (c) execute documents and agreements within the scope of this Authorization; and (d) take such other actions as may be reasonably necessary to effectuate the purposes of this Authorization." },
  { id: "7", type: "heading2", content: "SECTION 3. LIMITATIONS" },
  { id: "8", type: "paragraph", content: "This Authorization does not grant the Authorized Party the authority to: (a) incur any financial obligations on behalf of the Authorizing Party without prior written consent; (b) make decisions regarding the Authorizing Party's healthcare or medical treatment; (c) access accounts or records not specifically identified in this Authorization; or (d) delegate the authority granted herein to any other person or entity without express written permission." },
  { id: "9", type: "heading2", content: "SECTION 4. TERM AND REVOCATION" },
  { id: "10", type: "paragraph", content: "This Authorization shall remain in effect until the earlier of: (a) the completion of the specific purpose for which it was granted; (b) one (1) year from the date of execution; or (c) written revocation by the Authorizing Party. The Authorizing Party reserves the right to revoke this Authorization at any time by providing written notice to the Authorized Party and any relevant third parties." },
  { id: "11", type: "heading2", content: "SECTION 5. ACKNOWLEDGMENTS" },
  { id: "12", type: "paragraph", content: "The Authorizing Party acknowledges and agrees that: (a) this Authorization has been given voluntarily and without coercion; (b) the Authorizing Party has read and understands the terms and scope of this Authorization; (c) the Authorizing Party has had the opportunity to seek independent legal advice regarding this Authorization; and (d) the Authorizing Party assumes full responsibility for the actions taken by the Authorized Party within the scope of this Authorization." },
  { id: "13", type: "separator", content: "" },
  { id: "14", type: "paragraph", content: "IN WITNESS WHEREOF, the Authorizing Party has executed this Authorization and Consent Form as of the date set forth below." },
]

export default function NewDocumentPage() {
  const [documentTitle, setDocumentTitle] = useState("")
  const [documentType, setDocumentType] = useState<DocumentType>("nda")
  const [blocks, setBlocks] = useState<Block[]>(ndaBlocks)
  const [signers, setSigners] = useState<Signer[]>([])
  const [creatorIsSigner, setCreatorIsSigner] = useState(true)
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false)

  const handleDocumentTypeChange = (type: DocumentType) => {
    setDocumentType(type)
    switch (type) {
      case "nda":
        setBlocks(ndaBlocks)
        break
      case "contract":
        setBlocks(contractBlocks)
        break
      case "authorization":
        setBlocks(authorizationBlocks)
        break
    }
  }

  const handleAddSignatureBlock = () => {
    setSignatureDialogOpen(true)
  }

  const handleSignatureFieldAdd = (data: {
    signerName: string
    signerEmail: string
    role: string
    includeDate: boolean
    includeInitials: boolean
  }) => {
    const newBlock: Block = {
      id: Math.random().toString(36).substr(2, 9),
      type: "signature",
      content: "",
      signatureData: data,
    }
    setBlocks([...blocks, newBlock])
  }

  const TypeIcon = documentTypeConfig[documentType].icon

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="shrink-0 border-b border-border bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <TypeIcon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">
                New {documentTypeConfig[documentType].label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button size="sm" disabled={signers.length === 0 && !creatorIsSigner}>
              <Send className="mr-2 h-4 w-4" />
              Send for Signature
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Editor Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Document Settings Bar */}
          <div className="shrink-0 border-b border-border bg-card px-6 py-4">
            <div className="flex items-end gap-6">
              <div className="flex-1 max-w-md">
                <Label htmlFor="title" className="text-xs text-muted-foreground uppercase tracking-wide">Document Title</Label>
                <Input
                  id="title"
                  placeholder="Enter document title..."
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  className="mt-1.5 text-base font-medium"
                />
              </div>
              <div className="w-48">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Document Type</Label>
                <Select
                  value={documentType}
                  onValueChange={(value) => handleDocumentTypeChange(value as DocumentType)}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(documentTypeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <config.icon className="h-4 w-4" />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Block Editor - Takes remaining space */}
          <div className="flex-1 overflow-hidden p-6">
            <BlockEditor
              blocks={blocks}
              onBlocksChange={setBlocks}
              onAddSignatureBlock={handleAddSignatureBlock}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 shrink-0 border-l border-border bg-card overflow-y-auto">
          <div className="p-6 space-y-6">
            <SignerManagement
              signers={signers}
              onSignersChange={setSigners}
              creatorIsSigner={creatorIsSigner}
              onCreatorIsSignerChange={setCreatorIsSigner}
              creatorEmail="john@lawfirm.com"
              creatorName="John Doe"
            />

            {/* Document Info */}
            <div className="rounded-lg border border-border bg-background p-4">
              <h3 className="text-sm font-medium text-foreground">
                Document Info
              </h3>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Type</dt>
                  <dd className="font-medium text-foreground">
                    {documentTypeConfig[documentType].label}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Blocks</dt>
                  <dd className="font-medium text-foreground">{blocks.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Signers</dt>
                  <dd className="font-medium text-foreground">
                    {signers.length + (creatorIsSigner ? 1 : 0)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Signature Fields</dt>
                  <dd className="font-medium text-foreground">
                    {blocks.filter((b) => b.type === "signature").length}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Tips */}
            <div className="rounded-lg border border-border bg-primary/5 p-4">
              <h3 className="text-sm font-medium text-foreground">Tips</h3>
              <ul className="mt-2 space-y-2 text-xs text-muted-foreground">
                <li>Add signature fields where signers need to sign.</li>
                <li>Signers are notified in the order you define.</li>
                <li>You can be a signer on your own documents.</li>
                <li>Preview your document before sending.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Signature Field Dialog */}
      <SignatureFieldDialog
        open={signatureDialogOpen}
        onOpenChange={setSignatureDialogOpen}
        onAdd={handleSignatureFieldAdd}
        signers={[
          ...(creatorIsSigner
            ? [{ name: "John Doe", email: "john@lawfirm.com" }]
            : []),
          ...signers.map((s) => ({ name: s.name, email: s.email })),
        ]}
      />
    </div>
  )
}
