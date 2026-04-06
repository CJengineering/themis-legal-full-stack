"use client"

import { useState } from "react"
import {
  CheckCircle2,
  FolderOpen,
  HardDrive,
  Link2,
  RefreshCw,
  Settings,
  Unlink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AppSidebar } from "@/components/app-sidebar"

const recentlySaved = [
  {
    name: "Employment Contract - Sarah Johnson.pdf",
    savedAt: "April 5, 2026",
    folder: "Signed Contracts",
  },
  {
    name: "NDA - Project Alpha.pdf",
    savedAt: "April 3, 2026",
    folder: "NDAs",
  },
  {
    name: "Software Development Agreement.pdf",
    savedAt: "April 1, 2026",
    folder: "Signed Contracts",
  },
]

export default function GoogleDrivePage() {
  const [isConnected, setIsConnected] = useState(true)
  const [autoSync, setAutoSync] = useState(true)

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 pl-64">
        <div className="mx-auto max-w-3xl px-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <HardDrive className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Google Drive
              </h1>
              <p className="text-sm text-muted-foreground">
                Sync and store your signed documents
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            {/* Connection Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Connection Status</CardTitle>
                    <CardDescription>
                      Manage your Google Drive connection
                    </CardDescription>
                  </div>
                  <Badge
                    variant={isConnected ? "default" : "secondary"}
                    className={isConnected ? "bg-accent text-accent-foreground" : ""}
                  >
                    {isConnected ? (
                      <>
                        <CheckCircle2 className="mr-1.5 h-3 w-3" />
                        Connected
                      </>
                    ) : (
                      "Not Connected"
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {isConnected ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card">
                          <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            john@lawfirm.com
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Google Account
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsConnected(false)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Unlink className="mr-2 h-4 w-4" />
                        Disconnect
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground mb-4">
                      Connect your Google Drive to automatically save signed documents.
                    </p>
                    <Button onClick={() => setIsConnected(true)}>
                      <Link2 className="mr-2 h-4 w-4" />
                      Connect Google Drive
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Settings */}
            {isConnected && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sync Settings</CardTitle>
                  <CardDescription>
                    Configure how documents are saved to Google Drive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-sync completed documents</Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically save signed documents to Google Drive
                      </p>
                    </div>
                    <Switch
                      checked={autoSync}
                      onCheckedChange={setAutoSync}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Default folder</Label>
                    <Select defaultValue="signed">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="signed">
                          <div className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4" />
                            Themis Legal / Signed Documents
                          </div>
                        </SelectItem>
                        <SelectItem value="contracts">
                          <div className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4" />
                            Themis Legal / Contracts
                          </div>
                        </SelectItem>
                        <SelectItem value="ndas">
                          <div className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4" />
                            Themis Legal / NDAs
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>File naming convention</Label>
                    <Select defaultValue="title-date">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="title-date">
                          Document Title - Date
                        </SelectItem>
                        <SelectItem value="date-title">
                          Date - Document Title
                        </SelectItem>
                        <SelectItem value="title-only">
                          Document Title Only
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recently Saved */}
            {isConnected && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Recently Saved</CardTitle>
                      <CardDescription>
                        Documents saved to Google Drive
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recentlySaved.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 rounded-lg border border-border p-3"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <HardDrive className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {file.folder} &middot; {file.savedAt}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          Open
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
