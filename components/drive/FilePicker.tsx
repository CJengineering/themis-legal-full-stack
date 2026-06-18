"use client"

import { useState, useEffect } from 'react'
import { FileText, Folder, Search, ChevronRight, Home, Loader2, RefreshCw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { cn } from '@/lib/utils'
import { signIn } from '@/lib/auth-client'

interface DriveFile {
  id: string
  name: string
  mimeType: string
  modifiedTime: string | null
  size?: string
  parents?: string[]
  isSharedDrive?: boolean
}

interface FilePickerProps {
  onSelect: (file: DriveFile) => void
  selectedFileId?: string
}

export function FilePicker({ onSelect, selectedFileId }: FilePickerProps) {
  const [items, setItems] = useState<DriveFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needsReconnect, setNeedsReconnect] = useState(false)
  const [currentFolderId, setCurrentFolderId] = useState<string>('root')
  const [currentDriveId, setCurrentDriveId] = useState<string | null>(null)
  const [folderPath, setFolderPath] = useState<{ id: string; name: string }[]>([
    { id: 'root', name: 'My Drive' },
  ])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // Fetch folder contents
  const fetchFolder = async (folderId: string, driveId: string | null = null) => {
    setLoading(true)
    setError(null)
    setNeedsReconnect(false)
    setIsSearching(false)

    try {
      let url = '/api/drive/files'
      const params = new URLSearchParams()
      if (folderId !== 'root') params.append('folderId', folderId)
      if (driveId) params.append('driveId', driveId)
      if (params.toString()) url += `?${params.toString()}`

      const response = await fetch(url)

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setNeedsReconnect(true)
          setItems([])
          return
        }
        throw new Error('Failed to load Drive files')
      }

      const data = await response.json()
      setItems(data.items || [])
      setCurrentFolderId(folderId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  // Search files
  const searchFiles = async (query: string) => {
    if (!query.trim()) {
      fetchFolder(currentFolderId)
      return
    }

    setLoading(true)
    setError(null)
    setNeedsReconnect(false)
    setIsSearching(true)

    try {
      const response = await fetch(`/api/drive/search?q=${encodeURIComponent(query)}`)

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setNeedsReconnect(true)
          setItems([])
          return
        }
        throw new Error('Search failed')
      }

      const data = await response.json()
      setItems(data.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  // Navigate into Shared Drive
  const handleSharedDriveClick = (folder: DriveFile) => {
    setFolderPath([{ id: 'root', name: 'My Drive' }, { id: folder.id, name: folder.name }])
    setCurrentDriveId(folder.id)
    fetchFolder(folder.id, folder.id)
    setSearchQuery('')
  }

  // Navigate into folder
  const handleFolderClick = (folder: DriveFile) => {
    if (folder.isSharedDrive) {
      handleSharedDriveClick(folder)
    } else {
      setFolderPath([...folderPath, { id: folder.id, name: folder.name }])
      fetchFolder(folder.id, currentDriveId)
      setSearchQuery('')
    }
  }

  // Navigate to breadcrumb folder
  const handleBreadcrumbClick = (index: number) => {
    const newPath = folderPath.slice(0, index + 1)
    setFolderPath(newPath)

    // If going back to root, clear driveId
    if (index === 0) {
      setCurrentDriveId(null)
      fetchFolder('root', null)
    } else if (index === 1 && currentDriveId) {
      // Going back to Shared Drive root
      fetchFolder(currentDriveId, currentDriveId)
    } else {
      fetchFolder(newPath[newPath.length - 1].id, currentDriveId)
    }
    setSearchQuery('')
  }

  // Handle file selection
  const handleFileClick = (file: DriveFile) => {
    onSelect(file)
  }

  // Initial load
  useEffect(() => {
    fetchFolder('root')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchFiles(searchQuery)
      } else if (isSearching) {
        fetchFolder(currentFolderId, currentDriveId)
      }
    }, 300)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  return (
    <Card>
      <CardContent className="p-6">
        {/* Search bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search PDF and DOCX files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Breadcrumb navigation */}
        {!isSearching && (
          <div className="mb-4">
            <Breadcrumb>
              <BreadcrumbList>
                {folderPath.map((folder, index) => (
                  <div key={folder.id} className="contents">
                    <BreadcrumbItem>
                      <BreadcrumbLink
                        onClick={() => handleBreadcrumbClick(index)}
                        className="cursor-pointer flex items-center gap-1.5"
                      >
                        {index === 0 && <Home className="h-3.5 w-3.5" />}
                        {folder.name}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {index < folderPath.length - 1 && (
                      <BreadcrumbSeparator>
                        <ChevronRight className="h-4 w-4" />
                      </BreadcrumbSeparator>
                    )}
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Token expired — reconnect */}
        {needsReconnect && !loading && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
            <p className="font-medium text-amber-800">Google Drive session expired</p>
            <p className="mt-1 text-amber-700">
              Your Drive connection has expired. Reconnect to continue browsing files.
            </p>
            <Button
              className="mt-3"
              size="sm"
              onClick={() => signIn.social({ provider: 'google', callbackURL: window.location.pathname })}
            >
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Reconnect Google Drive
            </Button>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              {isSearching ? 'No files found' : 'This folder is empty'}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {isSearching ? 'Try a different search term' : 'Navigate to another folder or upload files to Drive'}
            </p>
          </div>
        )}

        {/* File list */}
        {!loading && !error && items.length > 0 && (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {items.map((item) => {
              const isFolder = item.mimeType === 'application/vnd.google-apps.folder'
              const isSelected = item.id === selectedFileId
              const isPDF = item.mimeType === 'application/pdf'
              const isDocx = item.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

              return (
                <button
                  key={item.id}
                  onClick={() => isFolder ? handleFolderClick(item) : handleFileClick(item)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-transparent hover:border-border hover:bg-muted/50",
                    isFolder && "cursor-pointer"
                  )}
                >
                  {/* Icon */}
                  <div className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    isFolder ? "bg-blue-100 text-blue-600" : "bg-primary/10 text-primary"
                  )}>
                    {isFolder ? (
                      <Folder className="h-5 w-5" />
                    ) : (
                      <FileText className="h-5 w-5" />
                    )}
                  </div>

                  {/* File info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {item.name}
                      </span>
                      {!isFolder && (
                        <Badge variant="outline" className="shrink-0 text-xs">
                          {isPDF ? 'PDF' : isDocx ? 'DOCX' : 'File'}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {isFolder ? 'Folder' : formatFileSize(item.size)} • {formatDate(item.modifiedTime)}
                    </div>
                  </div>

                  {/* Folder arrow */}
                  {isFolder && (
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Helper: format file size
function formatFileSize(bytes: string | undefined): string {
  if (!bytes) return 'Unknown size'
  const size = parseInt(bytes)
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

// Helper: format date
function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
