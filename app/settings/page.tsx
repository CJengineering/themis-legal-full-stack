"use client"

import { useState, useEffect } from "react"
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
  Loader2,
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
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "@/lib/auth-client"

type UserProfile = {
  id: string
  name: string
  email: string
  image: string | null
  company: string | null
  title: string | null
  locale: string
  timezone: string
}

type DriveSettings = {
  id?: string
  saveLocation: string
  targetFolderId: string | null
  namingPattern: string
  autoSave: boolean
}

type NotificationPreferences = {
  signatureRequests: boolean
  reminders: boolean
  completions: boolean
  workflowUpdates: boolean
}

export default function SettingsPage() {
  const { toast } = useToast()
  const { data: session, isPending: sessionPending } = useSession()

  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [name, setName] = useState("")
  const [company, setCompany] = useState("")
  const [title, setTitle] = useState("")
  const [locale, setLocale] = useState("en")
  const [timezone, setTimezone] = useState("UTC")

  // Drive settings state
  const [driveSettings, setDriveSettings] = useState<DriveSettings | null>(null)
  const [driveLoading, setDriveLoading] = useState(true)
  const [autoSync, setAutoSync] = useState(true)
  const [saveLocation, setSaveLocation] = useState("SAME_FOLDER")
  const [namingPattern, setNamingPattern] = useState("{name}_Signed_{date}")

  // Notification preferences state
  const [notifications, setNotifications] = useState<NotificationPreferences | null>(null)
  const [notificationsLoading, setNotificationsLoading] = useState(true)
  const [signatureRequests, setSignatureRequests] = useState(true)
  const [reminders, setReminders] = useState(true)
  const [completions, setCompletions] = useState(true)
  const [workflowUpdates, setWorkflowUpdates] = useState(true)

  // Loading states for save buttons
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingDrive, setIsSavingDrive] = useState(false)
  const [isSavingNotifications, setIsSavingNotifications] = useState(false)
  const [isSavingPreferences, setIsSavingPreferences] = useState(false)

  // Fetch profile data
  useEffect(() => {
    if (sessionPending) return

    async function fetchProfile() {
      try {
        const res = await fetch('/api/user/profile')
        if (!res.ok) throw new Error('Failed to fetch profile')
        const data = await res.json()
        setProfile(data)
        setName(data.name || "")
        setCompany(data.company || "")
        setTitle(data.title || "")
        setLocale(data.locale || "en")
        setTimezone(data.timezone || "UTC")
      } catch (error) {
        console.error('Error fetching profile:', error)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      } finally {
        setProfileLoading(false)
      }
    }

    fetchProfile()
  }, [sessionPending, toast])

  // Fetch Drive settings
  useEffect(() => {
    if (sessionPending) return

    async function fetchDriveSettings() {
      try {
        const res = await fetch('/api/user/drive-settings')
        if (!res.ok) throw new Error('Failed to fetch Drive settings')
        const data = await res.json()
        setDriveSettings(data)
        setAutoSync(data.autoSave ?? true)
        setSaveLocation(data.saveLocation || "SAME_FOLDER")
        setNamingPattern(data.namingPattern || "{name}_Signed_{date}")
      } catch (error) {
        console.error('Error fetching Drive settings:', error)
        toast({
          title: "Error",
          description: "Failed to load Drive settings",
          variant: "destructive",
        })
      } finally {
        setDriveLoading(false)
      }
    }

    fetchDriveSettings()
  }, [sessionPending, toast])

  // Fetch notification preferences
  useEffect(() => {
    if (sessionPending) return

    async function fetchNotifications() {
      try {
        const res = await fetch('/api/user/notifications')
        if (!res.ok) throw new Error('Failed to fetch notifications')
        const data = await res.json()
        setNotifications(data)
        setSignatureRequests(data.signatureRequests ?? true)
        setReminders(data.reminders ?? true)
        setCompletions(data.completions ?? true)
        setWorkflowUpdates(data.workflowUpdates ?? true)
      } catch (error) {
        console.error('Error fetching notifications:', error)
        toast({
          title: "Error",
          description: "Failed to load notification preferences",
          variant: "destructive",
        })
      } finally {
        setNotificationsLoading(false)
      }
    }

    fetchNotifications()
  }, [sessionPending, toast])

  // Save profile handler
  const handleSaveProfile = async () => {
    setIsSavingProfile(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, company, title }),
      })

      if (!res.ok) throw new Error('Failed to save profile')

      const updated = await res.json()
      setProfile(updated)

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      })
    } finally {
      setIsSavingProfile(false)
    }
  }

  // Save Drive settings handler
  const handleSaveDriveSettings = async () => {
    setIsSavingDrive(true)
    try {
      const res = await fetch('/api/user/drive-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autoSave: autoSync,
          saveLocation,
          namingPattern,
        }),
      })

      if (!res.ok) throw new Error('Failed to save Drive settings')

      const updated = await res.json()
      setDriveSettings(updated)

      toast({
        title: "Success",
        description: "Drive settings updated successfully",
      })
    } catch (error) {
      console.error('Error saving Drive settings:', error)
      toast({
        title: "Error",
        description: "Failed to save Drive settings",
        variant: "destructive",
      })
    } finally {
      setIsSavingDrive(false)
    }
  }

  // Save notification preferences handler
  const handleSaveNotifications = async () => {
    setIsSavingNotifications(true)
    try {
      const res = await fetch('/api/user/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signatureRequests,
          reminders,
          completions,
          workflowUpdates,
        }),
      })

      if (!res.ok) throw new Error('Failed to save notification preferences')

      const updated = await res.json()
      setNotifications(updated)

      toast({
        title: "Success",
        description: "Notification preferences updated successfully",
      })
    } catch (error) {
      console.error('Error saving notifications:', error)
      toast({
        title: "Error",
        description: "Failed to save notification preferences",
        variant: "destructive",
      })
    } finally {
      setIsSavingNotifications(false)
    }
  }

  // Save preferences (locale and timezone)
  const handleSavePreferences = async () => {
    setIsSavingPreferences(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale, timezone }),
      })

      if (!res.ok) throw new Error('Failed to save preferences')

      const updated = await res.json()
      setProfile(updated)

      toast({
        title: "Success",
        description: "Preferences updated successfully",
      })
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive",
      })
    } finally {
      setIsSavingPreferences(false)
    }
  }

  const isDriveConnected = !!session?.user?.email

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
                  {profileLoading ? (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="flex gap-2">
                          <Input
                            id="email"
                            type="email"
                            value={profile?.email || ""}
                            disabled
                            className="flex-1"
                          />
                          <Lock className="h-4 w-4 self-center text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Email is managed by your Google account and cannot be changed here
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company / Organization</Label>
                        <Input
                          id="company"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="title">Job Title</Label>
                        <Input
                          id="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                        {isSavingProfile ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </>
                  )}
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
                              {session?.user?.email || ""}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Google Account
                            </p>
                          </div>
                        </div>
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
                      <Button>
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
                    {driveLoading ? (
                      <p className="text-sm text-muted-foreground">Loading...</p>
                    ) : (
                      <>
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
                          <Select value={saveLocation} onValueChange={setSaveLocation}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SAME_FOLDER">
                                <div className="flex items-center gap-2">
                                  <FolderOpen className="h-4 w-4" />
                                  Same folder as original
                                </div>
                              </SelectItem>
                              <SelectItem value="SPECIFIC_FOLDER">
                                <div className="flex items-center gap-2">
                                  <FolderOpen className="h-4 w-4" />
                                  Signed Documents folder
                                </div>
                              </SelectItem>
                              <SelectItem value="ASK">
                                <div className="flex items-center gap-2">
                                  <FolderOpen className="h-4 w-4" />
                                  Ask each time
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>File naming pattern</Label>
                          <Input
                            value={namingPattern}
                            onChange={(e) => setNamingPattern(e.target.value)}
                            placeholder="{name}_Signed_{date}"
                          />
                          <p className="text-xs text-muted-foreground">
                            Use {"{name}"} for document name and {"{date}"} for current date
                          </p>
                        </div>

                        <Button onClick={handleSaveDriveSettings} disabled={isSavingDrive}>
                          {isSavingDrive ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Settings"
                          )}
                        </Button>
                      </>
                    )}
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
                  {notificationsLoading ? (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Signature requests</Label>
                          <p className="text-xs text-muted-foreground">
                            Receive emails when it&apos;s your turn to sign
                          </p>
                        </div>
                        <Switch
                          checked={signatureRequests}
                          onCheckedChange={setSignatureRequests}
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
                          checked={reminders}
                          onCheckedChange={setReminders}
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
                          checked={completions}
                          onCheckedChange={setCompletions}
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
                      <Button onClick={handleSaveNotifications} disabled={isSavingNotifications}>
                        {isSavingNotifications ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Preferences"
                        )}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Authentication</CardTitle>
                  <CardDescription>
                    Your account is secured via Google OAuth
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {session?.user?.email || ""}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Google OAuth Authentication
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground">
                    Password management is handled by your Google account.
                    Two-factor authentication should be enabled in your Google account settings.
                  </p>
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
                  {profileLoading ? (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>Language</Label>
                        <Select value={locale} onValueChange={setLocale}>
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
                        <Select value={timezone} onValueChange={setTimezone}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                            <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                            <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                            <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                            <SelectItem value="UTC">UTC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleSavePreferences} disabled={isSavingPreferences}>
                        {isSavingPreferences ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Preferences"
                        )}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
