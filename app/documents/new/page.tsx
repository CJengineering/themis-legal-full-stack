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
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

// Sample initial blocks for demonstration
const initialBlocks: Block[] = [
  {
    id: "1",
    type: "heading1",
    content: "",
  },
  {
    id: "2",
    type: "paragraph",
    content: "",
  },
]

export default function NewDocumentPage() {
  const [documentTitle, setDocumentTitle] = useState("")
  const [documentType, setDocumentType] = useState<DocumentType>("contract")
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks)
  const [signers, setSigners] = useState<Signer[]>([])
  const [creatorIsSigner, setCreatorIsSigner] = useState(false)
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false)

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <TypeIcon className="h-4 w-4 text-muted-foreground" />
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

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Editor Column */}
          <div className="space-y-6">
            {/* Document Settings */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Document Title</Label>
                <Input
                  id="title"
                  placeholder="Enter document title..."
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  className="text-base"
                />
              </div>
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select
                  value={documentType}
                  onValueChange={(value) => setDocumentType(value as DocumentType)}
                >
                  <SelectTrigger>
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

            {/* Block Editor */}
            <BlockEditor
              blocks={blocks}
              onBlocksChange={setBlocks}
              onAddSignatureBlock={handleAddSignatureBlock}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <SignerManagement
              signers={signers}
              onSignersChange={setSigners}
              creatorIsSigner={creatorIsSigner}
              onCreatorIsSignerChange={setCreatorIsSigner}
              creatorEmail="john@lawfirm.com"
              creatorName="John Doe"
            />

            {/* Document Info */}
            <div className="rounded-lg border border-border bg-card p-4">
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
            <div className="rounded-lg border border-border bg-muted/30 p-4">
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
      </main>

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
