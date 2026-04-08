"use client"

import { useState } from "react"
import { ArrowLeft, ArrowRight, Check, HardDrive, FileText, Users, Settings2, GripVertical, Plus, Trash2, Calendar, Search, Folder, ChevronRight, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AppSidebar } from "@/components/app-sidebar"
import Link from "next/link"
import { format } from "date-fns"

interface DriveFile {
  id: string
  name: string
  type: "file" | "folder"
  mimeType?: string
  path: string
  modifiedAt: string
}

interface Signer {
  id: string
  name: string
  email: string
  role: string
}

const mockDriveFiles: DriveFile[] = [
  { id: "f1", name: "Legal", type: "folder", path: "/Legal", modifiedAt: "Apr 5, 2026" },
  { id: "f2", name: "HR", type: "folder", path: "/HR", modifiedAt: "Apr 3, 2026" },
  { id: "f3", name: "Contracts", type: "folder", path: "/Contracts", modifiedAt: "Apr 1, 2026" },
  { id: "d1", name: "NDA_Template_2026.docx", type: "file", mimeType: "application/vnd.google-apps.document", path: "/Legal/NDAs", modifiedAt: "Apr 5, 2026" },
  { id: "d2", name: "Employment_Agreement_Draft.docx", type: "file", mimeType: "application/vnd.google-apps.document", path: "/HR", modifiedAt: "Apr 4, 2026" },
  { id: "d3", name: "Services_Agreement_ClientA.pdf", type: "file", mimeType: "application/pdf", path: "/Contracts", modifiedAt: "Apr 2, 2026" },
]

const mockTeamMembers = [
  { id: "u1", name: "John Doe", email: "john@lawfirm.com", role: "Partner" },
  { id: "u2", name: "James Mitchell", email: "james@lawfirm.com", role: "Senior Associate" },
  { id: "u3", name: "Sarah Chen", email: "sarah@lawfirm.com", role: "Associate" },
  { id: "u4", name: "Emily Roberts", email: "emily@lawfirm.com", role: "Paralegal" },
  { id: "u5", name: "Michael Brown", email: "michael@lawfirm.com", role: "Partner" },
]

const steps = [
  { id: 1, name: "Select Document", icon: HardDrive },
  { id: 2, name: "Add Signers", icon: Users },
  { id: 3, name: "Configure", icon: Settings2 },
  { id: 4, name: "Review", icon: Check },
]

export default function NewWorkflowPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null)
  const [signers, setSigners] = useState<Signer[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [signerSearch, setSignerSearch] = useState("")
  const [currentPath, setCurrentPath] = useState("/")
  const [retentionDate, setRetentionDate] = useState<Date | undefined>()
  const [notifyOnSign, setNotifyOnSign] = useState(true)
  const [notifyOnComplete, setNotifyOnComplete] = useState(true)
  const [autoDeleteAfterRetention, setAutoDeleteAfterRetention] = useState(false)

  const filteredFiles = mockDriveFiles.filter(
    (f) => f.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredTeamMembers = mockTeamMembers.filter(
    (m) =>
      !signers.find((s) => s.id === m.id) &&
      (m.name.toLowerCase().includes(signerSearch.toLowerCase()) ||
        m.email.toLowerCase().includes(signerSearch.toLowerCase()))
  )

  const addSigner = (member: typeof mockTeamMembers[0]) => {
    setSigners([...signers, { ...member }])
    setSignerSearch("")
  }

  const removeSigner = (id: string) => {
    setSigners(signers.filter((s) => s.id !== id))
  }

  const moveSigner = (index: number, direction: "up" | "down") => {
    const newSigners = [...signers]
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= signers.length) return
    ;[newSigners[index], newSigners[newIndex]] = [newSigners[newIndex], newSigners[index]]
    setSigners(newSigners)
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedFile !== null
      case 2:
        return signers.length > 0
      case 3:
        return true
      case 4:
        return true
      default:
        return false
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 pl-64">
        <div className="mx-auto max-w-4xl px-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/workflows">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Start New Signing Workflow
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Select a document from Google Drive and configure signers
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                        currentStep > step.id
                          ? "border-primary bg-primary text-primary-foreground"
                          : currentStep === step.id
                          ? "border-primary bg-background text-primary"
                          : "border-muted bg-background text-muted-foreground"
                      }`}
                    >
                      {currentStep > step.id ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <step.icon className="h-5 w-5" />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`mx-4 h-0.5 w-24 transition-colors ${
                        currentStep > step.id ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="mt-10">
            {/* Step 1: Select Document */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5 text-primary" />
                    Select Document from Google Drive
                  </CardTitle>
                  <CardDescription>
                    Choose the document you want to prepare for signatures. The document will remain in Google Drive.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search files..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Breadcrumb */}
                  <div className="mt-4 flex items-center gap-1 text-sm text-muted-foreground">
                    <span className="cursor-pointer hover:text-foreground" onClick={() => setCurrentPath("/")}>
                      My Drive
                    </span>
                    {currentPath !== "/" && (
                      <>
                        <ChevronRight className="h-4 w-4" />
                        <span>{currentPath.slice(1)}</span>
                      </>
                    )}
                  </div>

                  {/* File List */}
                  <div className="mt-4 divide-y divide-border rounded-lg border">
                    {filteredFiles.map((file) => (
                      <div
                        key={file.id}
                        className={`flex cursor-pointer items-center justify-between px-4 py-3 transition-colors hover:bg-muted/50 ${
                          selectedFile?.id === file.id ? "bg-primary/5 ring-1 ring-inset ring-primary" : ""
                        }`}
                        onClick={() => file.type === "file" && setSelectedFile(file)}
                      >
                        <div className="flex items-center gap-3">
                          {file.type === "folder" ? (
                            <Folder className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <File className="h-5 w-5 text-primary" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-foreground">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{file.path}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">{file.modifiedAt}</span>
                          {selectedFile?.id === file.id && (
                            <Badge className="bg-primary/10 text-primary">Selected</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedFile && (
                    <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">{selectedFile.name}</p>
                          <p className="text-sm text-muted-foreground">{selectedFile.path}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 2: Add Signers */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Add Signers
                  </CardTitle>
                  <CardDescription>
                    Select authorized users who need to sign this document. Drag to reorder the signing sequence.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Search Team Members */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search team members..."
                      className="pl-9"
                      value={signerSearch}
                      onChange={(e) => setSignerSearch(e.target.value)}
                    />
                  </div>

                  {/* Search Results */}
                  {signerSearch && filteredTeamMembers.length > 0 && (
                    <div className="mt-2 divide-y divide-border rounded-lg border">
                      {filteredTeamMembers.slice(0, 5).map((member) => (
                        <div
                          key={member.id}
                          className="flex cursor-pointer items-center justify-between px-4 py-3 transition-colors hover:bg-muted/50"
                          onClick={() => addSigner(member)}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {member.name.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-foreground">{member.name}</p>
                              <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                          <Badge variant="outline">{member.role}</Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Selected Signers */}
                  <div className="mt-6">
                    <Label className="text-sm font-medium">Signing Order</Label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Signers will be notified in this order. Each signer can only sign when it&apos;s their turn.
                    </p>

                    {signers.length === 0 ? (
                      <div className="mt-4 rounded-lg border-2 border-dashed border-muted p-8 text-center">
                        <Users className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          No signers added yet. Search and add team members above.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-4 space-y-2">
                        {signers.map((signer, index) => (
                          <div
                            key={signer.id}
                            className="flex items-center gap-3 rounded-lg border bg-card p-3"
                          >
                            <div className="cursor-grab text-muted-foreground">
                              <GripVertical className="h-4 w-4" />
                            </div>
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                              {index + 1}
                            </div>
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {signer.name.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{signer.name}</p>
                              <p className="text-xs text-muted-foreground">{signer.email}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {signer.role}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => moveSigner(index, "up")}
                                disabled={index === 0}
                              >
                                <ArrowLeft className="h-3 w-3 rotate-90" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => moveSigner(index, "down")}
                                disabled={index === signers.length - 1}
                              >
                                <ArrowRight className="h-3 w-3 rotate-90" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => removeSigner(signer.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Configure */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings2 className="h-5 w-5 text-primary" />
                    Workflow Settings
                  </CardTitle>
                  <CardDescription>
                    Configure notifications and retention settings for this workflow.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Notifications */}
                  <div>
                    <h3 className="text-sm font-medium text-foreground">Notifications</h3>
                    <div className="mt-3 space-y-3">
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">Notify on each signature</p>
                          <p className="text-xs text-muted-foreground">
                            Send email when a signer completes their signature
                          </p>
                        </div>
                        <Switch checked={notifyOnSign} onCheckedChange={setNotifyOnSign} />
                      </div>
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">Notify on completion</p>
                          <p className="text-xs text-muted-foreground">
                            Send email to all parties when workflow is complete
                          </p>
                        </div>
                        <Switch checked={notifyOnComplete} onCheckedChange={setNotifyOnComplete} />
                      </div>
                    </div>
                  </div>

                  {/* Retention */}
                  <div>
                    <h3 className="text-sm font-medium text-foreground">Retention Settings</h3>
                    <div className="mt-3 space-y-3">
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">Retention Date</p>
                            <p className="text-xs text-muted-foreground">
                              Optional date to flag this workflow for review or deletion
                            </p>
                          </div>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-48 justify-start text-left font-normal">
                                <Calendar className="mr-2 h-4 w-4" />
                                {retentionDate ? format(retentionDate, "PPP") : "Select date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                              <CalendarComponent
                                mode="single"
                                selected={retentionDate}
                                onSelect={setRetentionDate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      {retentionDate && (
                        <div className="flex items-center justify-between rounded-lg border p-4">
                          <div>
                            <p className="text-sm font-medium text-foreground">Auto-delete workflow metadata</p>
                            <p className="text-xs text-muted-foreground">
                              Automatically delete workflow data after retention date (document stays in Drive)
                            </p>
                          </div>
                          <Switch
                            checked={autoDeleteAfterRetention}
                            onCheckedChange={setAutoDeleteAfterRetention}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    Review & Start Workflow
                  </CardTitle>
                  <CardDescription>
                    Review your workflow configuration before starting.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Document */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Document</h3>
                    <div className="mt-2 flex items-center gap-3 rounded-lg border p-4">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">{selectedFile?.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedFile?.path}</p>
                      </div>
                    </div>
                  </div>

                  {/* Signing Order */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Signing Order ({signers.length} signers)
                    </h3>
                    <div className="mt-2 space-y-2">
                      {signers.map((signer, index) => (
                        <div key={signer.id} className="flex items-center gap-3 rounded-lg border p-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                            {index + 1}
                          </div>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {signer.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-foreground">{signer.name}</p>
                            <p className="text-xs text-muted-foreground">{signer.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Settings Summary */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Settings</h3>
                    <div className="mt-2 rounded-lg border p-4">
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Notify on signature</dt>
                          <dd className="font-medium text-foreground">{notifyOnSign ? "Yes" : "No"}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Notify on completion</dt>
                          <dd className="font-medium text-foreground">{notifyOnComplete ? "Yes" : "No"}</dd>
                        </div>
                        {retentionDate && (
                          <>
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">Retention date</dt>
                              <dd className="font-medium text-foreground">{format(retentionDate, "PPP")}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">Auto-delete metadata</dt>
                              <dd className="font-medium text-foreground">
                                {autoDeleteAfterRetention ? "Yes" : "No"}
                              </dd>
                            </div>
                          </>
                        )}
                      </dl>
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">
                      When you start this workflow, a signature page will be appended to the document and the first
                      signer will be notified. The document will remain in Google Drive and will be updated with
                      signatures as the workflow progresses.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {currentStep < 4 ? (
              <Button onClick={() => setCurrentStep(currentStep + 1)} disabled={!canProceed()}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button disabled={!canProceed()}>
                <Check className="mr-2 h-4 w-4" />
                Start Workflow
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
