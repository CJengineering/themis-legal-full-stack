"use client"

import { useState } from "react"
import {
  Bell,
  CheckCircle2,
  HardDrive,
  Lock,
  Palette,
  Settings,
  Shield,
  Unlink,
  User,
  Link2,
  FolderOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppSidebar } from "@/components/app-sidebar"

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [signatureReminders, setSignatureReminders] = useState(true)
  const [completionNotifications, setCompletionNotifications] = useState(true)
  const [workflowUpdates, setWorkflowUpdates] = useState(true)
  const [isDriveConnected, setIsDriveConnected] = useState(true)
  const [autoSync, setAutoSync] = useState(true)

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 pl-64">
        <div className="mx-auto max-w-3xl px-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Settings className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Settings
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your account, integrations, and preferences
              </p>
            </div>
          </div>

          <Tabs defaultValue="profile" className="mt-8">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="drive" className="gap-2">
                <HardDrive className="h-4 w-4" />
                <span className="hidden sm:inline">Drive</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Lock className="h-4 w-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="gap-2">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Preferences</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue="John" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue="Doe" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue="john@lawfirm.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company / Organization</Label>
                    <Input id="company" defaultValue="Mitchell & Associates LLP" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input id="title" defaultValue="Senior Partner" />
                  </div>
                  <Button>Save Changes</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Default Signature</CardTitle>
                  <CardDescription>
                    Set your default signature for documents
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border border-border bg-muted/30 p-6">
                    <div className="border-b border-foreground/20 pb-2">
                      <span className="font-serif text-2xl italic text-foreground">
                        John Doe
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Your current default signature
                    </p>
                  </div>
                  <Button variant="outline">Update Signature</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Google Drive Tab */}
            <TabsContent value="drive" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Google Drive Integration</CardTitle>
                      <CardDescription>
                        Themis Legal works directly with your Google Drive files
                      </CardDescription>
                    </div>
                    <Badge
                      variant={isDriveConnected ? "default" : "secondary"}
                      className={isDriveConnected ? "bg-success/10 text-success" : ""}
                    >
                      {isDriveConnected ? (
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
                  {isDriveConnected ? (
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
                          onClick={() => setIsDriveConnected(false)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Unlink className="mr-2 h-4 w-4" />
                          Disconnect
                        </Button>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/30 p-4">
                        <p className="text-sm font-medium text-foreground">How it works</p>
                        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                          <li>• Source documents are selected directly from your Drive</li>
                          <li>• Signed documents are automatically saved back to Drive</li>
                          <li>• Original files remain untouched - signed copies are created</li>
                          <li>• Access permissions follow your Drive sharing settings</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground mb-4">
                        Connect Google Drive to select documents and save signed copies.
                      </p>
                      <Button onClick={() => setIsDriveConnected(true)}>
                        <Link2 className="mr-2 h-4 w-4" />
                        Connect Google Drive
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {isDriveConnected && (
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
                        <Label>Auto-sync completed workflows</Label>
                        <p className="text-xs text-muted-foreground">
                          Automatically save signed documents when workflows complete
                        </p>
                      </div>
                      <Switch
                        checked={autoSync}
                        onCheckedChange={setAutoSync}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Default save location</Label>
                      <Select defaultValue="same">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="same">
                            <div className="flex items-center gap-2">
                              <FolderOpen className="h-4 w-4" />
                              Same folder as original
                            </div>
                          </SelectItem>
                          <SelectItem value="signed">
                            <div className="flex items-center gap-2">
                              <FolderOpen className="h-4 w-4" />
                              Signed Documents folder
                            </div>
                          </SelectItem>
                          <SelectItem value="ask">
                            <div className="flex items-center gap-2">
                              <FolderOpen className="h-4 w-4" />
                              Ask each time
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>File naming convention</Label>
                      <Select defaultValue="title-signed">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="title-signed">
                            Document Title - Signed
                          </SelectItem>
                          <SelectItem value="title-date">
                            Document Title - Date Signed
                          </SelectItem>
                          <SelectItem value="original">
                            Keep original name
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Email Notifications</CardTitle>
                  <CardDescription>
                    Choose what emails you receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Signature requests</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive emails when it&apos;s your turn to sign
                      </p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Signature reminders</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive reminders for pending signatures
                      </p>
                    </div>
                    <Switch
                      checked={signatureReminders}
                      onCheckedChange={setSignatureReminders}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Workflow completion</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive emails when a workflow is fully completed
                      </p>
                    </div>
                    <Switch
                      checked={completionNotifications}
                      onCheckedChange={setCompletionNotifications}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Workflow updates</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive updates when signers complete their steps
                      </p>
                    </div>
                    <Switch
                      checked={workflowUpdates}
                      onCheckedChange={setWorkflowUpdates}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Password</CardTitle>
                  <CardDescription>
                    Update your password
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  <Button>Update Password</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Two-Factor Authentication</CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Two-Factor Authentication
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Not enabled
                        </p>
                      </div>
                    </div>
                    <Button variant="outline">Enable</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Regional Settings</CardTitle>
                  <CardDescription>
                    Customize your regional preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English (US)</SelectItem>
                        <SelectItem value="en-gb">English (UK)</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select defaultValue="est">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                        <SelectItem value="mst">Mountain Time (MT)</SelectItem>
                        <SelectItem value="cst">Central Time (CT)</SelectItem>
                        <SelectItem value="est">Eastern Time (ET)</SelectItem>
                        <SelectItem value="utc">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date Format</Label>
                    <Select defaultValue="mdy">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                        <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                        <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button>Save Preferences</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
