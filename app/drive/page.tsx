"use client"

import { useState, useEffect } from "react"
import {
  ChevronRight,
  File,
  FileText,
  Folder,
  FolderOpen,
  HardDrive,
  Home,
  Loader2,
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

interface BreadcrumbItem {
  id: string | null
  name: string
}

// Format file size from bytes string to human-readable
function formatFileSize(bytes: string | undefined): string | undefined {
  if (!bytes) return undefined
  const size = parseInt(bytes, 10)
  if (isNaN(size)) return undefined

  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

// Format ISO date to readable format
function formatDate(isoDate: string): string {
  const date = new Date(isoDate)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

function DriveItemRow({
  item,
  onFolderClick
}: {
  item: DriveItem
  onFolderClick?: (folderId: string, folderName: string) => void
}) {
  const isDocument = item.type === "file" && (
    item.mimeType?.includes("pdf") ||
    item.mimeType?.includes("word") ||
    item.mimeType?.includes("document")
  )

  const handleClick = () => {
    if (item.type === "folder" && onFolderClick) {
      onFolderClick(item.id, item.name)
    }
  }

  return (
    <div
      className="flex items-center gap-4 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={handleClick}
    >
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
        <Button
          size="sm"
          asChild
          onClick={(e) => e.stopPropagation()}
        >
          <Link href={`/workflows/new?fileId=${item.id}&fileName=${encodeURIComponent(item.name)}`}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Start Workflow
          </Link>
        </Button>
      ) : null}
    </div>
  )
}

export default function GoogleDrivePage() {
  const [items, setItems] = useState<DriveItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [breadcrumbPath, setBreadcrumbPath] = useState<BreadcrumbItem[]>([
    { id: null, name: "My Drive" }
  ])
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch folder contents
  const fetchFolder = async (folderId?: string | null) => {
    setLoading(true)
    setError(null)
    setIsSearchMode(false)

    try {
      const url = folderId
        ? `/api/drive/files?folderId=${folderId}`
        : '/api/drive/files'

      const response = await fetch(url)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch files')
      }

      const data = await response.json()

      // Transform API response to DriveItem format
      const transformedItems: DriveItem[] = (data.items || []).map((item: {
        id: string
        name: string
        mimeType: string
        modifiedTime: string
        size?: string
      }) => ({
        id: item.id,
        name: item.name,
        type: item.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
        mimeType: item.mimeType,
        modifiedAt: formatDate(item.modifiedTime),
        size: formatFileSize(item.size)
      }))

      setItems(transformedItems)
      setCurrentFolderId(folderId || null)
    } catch (err) {
      console.error('Fetch folder error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load files')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  // Handle search with debouncing
  useEffect(() => {
    if (!searchQuery.trim()) {
      // Exit search mode and reload current folder
      if (isSearchMode) {
        fetchFolder(currentFolderId)
      }
      return
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true)
      setError(null)
      setIsSearchMode(true)

      try {
        const response = await fetch(
          `/api/drive/search?q=${encodeURIComponent(searchQuery)}`
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Search failed')
        }

        const data = await response.json()

        // Transform search results
        const transformedItems: DriveItem[] = (data.items || []).map((item: {
          id: string
          name: string
          mimeType: string
          modifiedTime: string
          size?: string
        }) => ({
          id: item.id,
          name: item.name,
          type: 'file',
          mimeType: item.mimeType,
          modifiedAt: formatDate(item.modifiedTime),
          size: formatFileSize(item.size)
        }))

        setItems(transformedItems)
      } catch (err) {
        console.error('Search error:', err)
        setError(err instanceof Error ? err.message : 'Search failed')
        setItems([])
      } finally {
        setLoading(false)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchQuery]) // eslint-disable-line react-hooks/exhaustive-deps

  // Navigate into a folder
  const handleFolderClick = (folderId: string, folderName: string) => {
    setBreadcrumbPath([...breadcrumbPath, { id: folderId, name: folderName }])
    fetchFolder(folderId)
  }

  // Navigate via breadcrumb
  const handleBreadcrumbClick = (index: number) => {
    const newPath = breadcrumbPath.slice(0, index + 1)
    const targetFolder = newPath[newPath.length - 1]
    setBreadcrumbPath(newPath)
    fetchFolder(targetFolder.id)
  }

  // Load root folder on mount
  useEffect(() => {
    fetchFolder()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
          {!isSearchMode && (
            <div className="mt-6 flex items-center gap-1 text-sm">
              {breadcrumbPath.map((crumb, index) => (
                <div key={crumb.id ?? 'root'} className="flex items-center gap-1">
                  {index > 0 && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => handleBreadcrumbClick(index)}
                  >
                    {index === 0 ? (
                      <Home className="mr-1.5 h-4 w-4" />
                    ) : (
                      <FolderOpen className="mr-1.5 h-4 w-4" />
                    )}
                    {crumb.name}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Search mode indicator */}
          {isSearchMode && (
            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <Search className="h-4 w-4" />
              <span>Search results for &ldquo;{searchQuery}&rdquo;</span>
            </div>
          )}

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
            {/* Loading state */}
            {loading && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    {isSearchMode ? 'Searching...' : 'Loading files...'}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Error state */}
            {!loading && error && (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="font-medium text-destructive">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => fetchFolder(currentFolderId)}
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Empty state */}
            {!loading && !error && items.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    {isSearchMode ? (
                      <Search className="h-6 w-6 text-muted-foreground" />
                    ) : (
                      <Folder className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <p className="mt-4 font-medium text-foreground">
                    {isSearchMode ? 'No files found' : 'This folder is empty'}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {isSearchMode
                      ? 'Try adjusting your search query'
                      : 'No PDF or Word documents in this folder'}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Items list */}
            {!loading && !error && items.length > 0 && (
              <>
                {items.map((item) => (
                  <DriveItemRow
                    key={item.id}
                    item={item}
                    onFolderClick={handleFolderClick}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
