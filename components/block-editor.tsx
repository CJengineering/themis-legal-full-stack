"use client"

import { useState } from "react"
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  PenTool,
  Plus,
  GripVertical,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

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

interface BlockEditorProps {
  blocks: Block[]
  onBlocksChange: (blocks: Block[]) => void
  onAddSignatureBlock: () => void
}

export function BlockEditor({ blocks, onBlocksChange, onAddSignatureBlock }: BlockEditorProps) {
  const [activeBlock, setActiveBlock] = useState<string | null>(null)

  const updateBlock = (id: string, content: string) => {
    onBlocksChange(
      blocks.map((block) =>
        block.id === id ? { ...block, content } : block
      )
    )
  }

  const deleteBlock = (id: string) => {
    onBlocksChange(blocks.filter((block) => block.id !== id))
  }

  const addBlock = (type: Block["type"], afterId?: string) => {
    const newBlock: Block = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: "",
    }

    if (afterId) {
      const index = blocks.findIndex((b) => b.id === afterId)
      const newBlocks = [...blocks]
      newBlocks.splice(index + 1, 0, newBlock)
      onBlocksChange(newBlocks)
    } else {
      onBlocksChange([...blocks, newBlock])
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex items-center gap-1 rounded-t-lg border border-border bg-card p-2 shadow-sm">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Underline className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Heading3 className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <List className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <AlignRight className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Minus className="h-4 w-4" />
        </Button>

        <div className="flex-1" />

        <Button
          variant="default"
          size="sm"
          onClick={onAddSignatureBlock}
          className="gap-2"
        >
          <PenTool className="h-4 w-4" />
          Add Signature Field
        </Button>
      </div>

      {/* Editor Canvas - Document Style */}
      <div className="flex-1 overflow-auto rounded-b-lg border border-t-0 border-border bg-muted/30 p-8">
        <div className="mx-auto max-w-[8.5in] min-h-[11in] bg-card shadow-lg rounded-sm">
          {/* Document Paper */}
          <div className="p-12 sm:p-16">
            {blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <p className="text-sm text-muted-foreground">
                  Start typing your legal document
                </p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="mt-4 gap-2">
                      <Plus className="h-4 w-4" />
                      Add Block
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => addBlock("heading1")}>
                      Document Title
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addBlock("paragraph")}>
                      Paragraph
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addBlock("heading2")}>
                      Section Heading
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => addBlock("bullet-list")}>
                      Bullet List
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addBlock("numbered-list")}>
                      Numbered List
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addBlock("separator")}>
                      Separator
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onAddSignatureBlock}>
                      <PenTool className="mr-2 h-4 w-4" />
                      Signature Field
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="space-y-1">
                {blocks.map((block) => (
                  <div
                    key={block.id}
                    className={cn(
                      "group relative flex items-start gap-2 rounded px-2 py-1 transition-colors hover:bg-muted/30",
                      activeBlock === block.id && "bg-muted/30"
                    )}
                  >
                    <div className="absolute -left-10 flex items-center gap-1 pt-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 cursor-grab p-0 text-muted-foreground"
                      >
                        <GripVertical className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => addBlock("paragraph", block.id)}>
                            Paragraph
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => addBlock("heading1", block.id)}>
                            Heading 1
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => addBlock("heading2", block.id)}>
                            Heading 2
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => addBlock("heading3", block.id)}>
                            Heading 3
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => addBlock("bullet-list", block.id)}>
                            Bullet List
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => addBlock("numbered-list", block.id)}>
                            Numbered List
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => addBlock("separator", block.id)}>
                            Separator
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={onAddSignatureBlock}>
                            <PenTool className="mr-2 h-4 w-4" />
                            Signature Field
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex-1">
                      {block.type === "signature" ? (
                        <SignatureBlockPlaceholder
                          data={block.signatureData}
                          onDelete={() => deleteBlock(block.id)}
                        />
                      ) : block.type === "separator" ? (
                        <div className="my-6 border-t border-foreground/20" />
                      ) : (
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onFocus={() => setActiveBlock(block.id)}
                          onBlur={(e) => {
                            setActiveBlock(null)
                            updateBlock(block.id, e.currentTarget.textContent || "")
                          }}
                          className={cn(
                            "min-h-[1.5em] outline-none font-serif",
                            block.type === "heading1" && "text-2xl font-bold text-center mb-6 uppercase tracking-wide",
                            block.type === "heading2" && "text-lg font-bold mt-8 mb-4 uppercase",
                            block.type === "heading3" && "text-base font-semibold mt-6 mb-3",
                            block.type === "paragraph" && "text-sm leading-7 text-justify indent-8",
                            block.type === "bullet-list" && "text-sm leading-7 pl-8 list-disc",
                            block.type === "numbered-list" && "text-sm leading-7 pl-8 list-decimal",
                            !block.content && "text-muted-foreground italic"
                          )}
                        >
                          {block.content || getPlaceholder(block.type)}
                        </div>
                      )}
                    </div>

                    {block.type !== "signature" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteBlock(block.id)}
                        className="absolute -right-8 h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function getPlaceholder(type: Block["type"]): string {
  switch (type) {
    case "heading1":
      return "DOCUMENT TITLE"
    case "heading2":
      return "ARTICLE I. SECTION HEADING"
    case "heading3":
      return "Section 1.1 Subsection"
    case "bullet-list":
      return "List item"
    case "numbered-list":
      return "Enumerated item"
    default:
      return "Enter legal text here..."
  }
}

function SignatureBlockPlaceholder({
  data,
  onDelete,
}: {
  data?: Block["signatureData"]
  onDelete: () => void
}) {
  return (
    <div className="group/sig relative my-8 rounded border border-dashed border-primary/40 bg-primary/5 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <PenTool className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {data?.signerName || "Signature Field"}
            </p>
            <p className="text-xs text-muted-foreground">
              {data?.signerEmail || "Assign to signer"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover/sig:opacity-100 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-8">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Signature</p>
          <div className="h-16 border-b-2 border-foreground/30" />
          <p className="mt-2 text-xs text-muted-foreground">{data?.signerName || "Name"}</p>
          {data?.role && <p className="text-xs text-muted-foreground">{data.role}</p>}
        </div>
        {data?.includeDate && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Date</p>
            <div className="h-16 border-b-2 border-foreground/30 flex items-end justify-center pb-1">
              <span className="text-sm text-muted-foreground">____ / ____ / ________</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
