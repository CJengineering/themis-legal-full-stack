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
    <div className="space-y-1">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex items-center gap-1 rounded-lg border border-border bg-card p-2 shadow-sm">
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
          variant="outline"
          size="sm"
          onClick={onAddSignatureBlock}
          className="gap-2"
        >
          <PenTool className="h-4 w-4" />
          Add Signature Field
        </Button>
      </div>

      {/* Editor Canvas */}
      <div className="min-h-[600px] rounded-lg border border-border bg-card p-8 shadow-sm">
        {blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-muted-foreground">
              Start typing or add a block
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Add Block
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => addBlock("paragraph")}>
                  Paragraph
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => addBlock("heading1")}>
                  Heading 1
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => addBlock("heading2")}>
                  Heading 2
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => addBlock("heading3")}>
                  Heading 3
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
          <div className="space-y-2">
            {blocks.map((block) => (
              <div
                key={block.id}
                className={cn(
                  "group relative flex items-start gap-2 rounded-lg p-2 transition-colors hover:bg-muted/50",
                  activeBlock === block.id && "bg-muted/50"
                )}
              >
                <div className="flex items-center gap-1 pt-1 opacity-0 transition-opacity group-hover:opacity-100">
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
                    <div className="my-4 border-t border-border" />
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
                        "min-h-[1.5em] outline-none",
                        block.type === "heading1" && "text-2xl font-bold",
                        block.type === "heading2" && "text-xl font-semibold",
                        block.type === "heading3" && "text-lg font-medium",
                        block.type === "paragraph" && "text-sm leading-relaxed",
                        block.type === "bullet-list" && "text-sm leading-relaxed pl-4 list-disc",
                        block.type === "numbered-list" && "text-sm leading-relaxed pl-4 list-decimal",
                        !block.content && "text-muted-foreground"
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
                    className="h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-destructive"
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
  )
}

function getPlaceholder(type: Block["type"]): string {
  switch (type) {
    case "heading1":
      return "Heading 1"
    case "heading2":
      return "Heading 2"
    case "heading3":
      return "Heading 3"
    case "bullet-list":
      return "List item"
    case "numbered-list":
      return "List item"
    default:
      return "Type something..."
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
    <div className="group/sig relative rounded-lg border-2 border-dashed border-accent/50 bg-accent/5 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
            <PenTool className="h-5 w-5 text-accent" />
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
      <div className="mt-4 flex items-end justify-between border-b border-accent/30 pb-2">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Signature</p>
          <div className="mt-1 h-12 w-full" />
        </div>
        {data?.includeDate && (
          <div className="ml-4 text-right">
            <p className="text-xs text-muted-foreground">Date</p>
            <p className="mt-1 text-sm text-muted-foreground">__/__/____</p>
          </div>
        )}
      </div>
      {data?.role && (
        <p className="mt-2 text-xs text-muted-foreground">{data.role}</p>
      )}
    </div>
  )
}
