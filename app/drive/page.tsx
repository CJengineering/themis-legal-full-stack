"use client"

import { useState } from "react"
import {
  ChevronRight,
  File,
  FileText,
  Folder,
  FolderOpen,
  HardDrive,
  Home,
  Plus,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AppSidebar } from "@/components/app-sidebar"
import Link from "next/link"

interface DriveItem {
  id: string
  name: string
  type: "folder" | "file"
  mimeType?: string
  modifiedAt: string
  size?: string
}

const driveContents: DriveItem[] = [
  { id: "1", name: "Legal", type: "folder", modifiedAt: "April 5, 2026" },
  { id: "2", name: "HR", type: "folder", modifiedAt: "April 3, 2026" },
  { id: "3", name: "Finance", type: "folder", modifiedAt: "April 1, 2026" },
  { id: "4", name: "Signed Documents", type: "folder", modifiedAt: "April 7, 2026" },
  { id: "5", name: "Company Policy Updates 2026.pdf", type: "file", mimeType: "application/pdf", modifiedAt: "March 28, 2026", size: "2.4 MB" },
  { id: "6", name: "Board Meeting Minutes.docx", type: "file", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", modifiedAt: "March 25, 2026", size: "156 KB" },
]

const breadcrumb = [
  { name: "My Drive", path: "/drive" },
]

function DriveItemRow({ item }: { item: DriveItem }) {
  const isDocument = item.type === "file" && (
    item.mimeType?.includes("pdf") || 
    item.mimeType?.includes("word") ||
    item.mimeType?.includes("document")
  )

  return (
    <div className="flex items-center gap-4 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors cursor-pointer">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
        {item.type === "folder" ? (
          <Folder className="h-5 w-5 text-primary" />
        ) : isDocument ? (
          <FileText className="h-5 w-5 text-muted-foreground" />
        ) : (
          <File className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {item.name}
        </p>
        <p className="text-xs text-muted-foreground">
          Modified {item.modifiedAt}
          {item.size && ` · ${item.size}`}
        </p>
      </div>
      {item.type === "folder" ? (
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      ) : isDocument ? (
        <Button size="sm" asChild>
          <Link href={`/workflows/new?file=${item.id}`}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Start Workflow
          </Link>
        </Button>
      ) : null}
    </div>
  )
}

export default function GoogleDrivePage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredItems = driveContents.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 pl-64">
        <div className="mx-auto max-w-4xl px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <HardDrive className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  Google Drive
                </h1>
                <p className="text-sm text-muted-foreground">
                  Browse and select documents for signature workflows
                </p>
              </div>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="mt-6 flex items-center gap-1 text-sm">
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Home className="mr-1.5 h-4 w-4" />
              My Drive
            </Button>
            {breadcrumb.slice(1).map((item, index) => (
              <div key={item.path} className="flex items-center gap-1">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <FolderOpen className="mr-1.5 h-4 w-4" />
                  {item.name}
                </Button>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search files and folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Info Card */}
          <Card className="mt-6 border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <p className="text-sm text-foreground">
                <strong>Tip:</strong> Select a PDF or Word document to start a new signature workflow. 
                Signed documents will be saved back to your Drive.
              </p>
            </CardContent>
          </Card>

          {/* File List */}
          <div className="mt-6 space-y-2">
            {filteredItems.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="mt-4 font-medium text-foreground">No files found</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try adjusting your search query
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredItems.map((item) => (
                <DriveItemRow key={item.id} item={item} />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
