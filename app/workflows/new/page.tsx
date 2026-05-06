"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Check, HardDrive, FileText, Users, Settings2, GripVertical, Plus, Trash2, Calendar, Search, Folder, ChevronRight, File, Loader2 } from "lucide-react"
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
import { FilePicker } from "@/components/drive/FilePicker"
import Link from "next/link"
import { format } from "date-fns"

interface DriveFile {
  id: string
  name: string
  mimeType: string
  modifiedTime: string
  size?: string
  parents?: string[]
}

interface Signer {
  id?: string
  name: string
  email: string
  order: number
}

interface TeamMember {
  id: string
  name: string
  email: string
  image: string | null
}

const steps = [
  { id: 1, name: "Select Document", icon: HardDrive },
  { id: 2, name: "Add Signers", icon: Users },
  { id: 3, name: "Configure", icon: Settings2 },
  { id: 4, name: "Review", icon: Check },
]

export default function NewWorkflowPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null)
  const [signers, setSigners] = useState<Signer[]>([])
  const [signerSearch, setSignerSearch] = useState("")
  const [retentionDate, setRetentionDate] = useState<Date | undefined>()
  const [notifyOnSign, setNotifyOnSign] = useState(true)
  const [notifyOnComplete, setNotifyOnComplete] = useState(true)
  const [autoDeleteAfterRetention, setAutoDeleteAfterRetention] = useState(false)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loadingTeamMembers, setLoadingTeamMembers] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch team members for Step 2
  useEffect(() => {
    async function fetchTeamMembers() {
      setLoadingTeamMembers(true)
      try {
        const response = await fetch('/api/users')
        if (!response.ok) throw new Error('Failed to fetch team members')
        const data = await response.json()
        setTeamMembers(data.users)
      } catch (err) {
        console.error('Failed to fetch team members:', err)
        setError('Failed to load team members')
      } finally {
        setLoadingTeamMembers(false)
      }
    }
    fetchTeamMembers()
  }, [])

  const filteredTeamMembers = teamMembers.filter(
    (m) =>
      !signers.find((s) => s.email === m.email) &&
      (m.name.toLowerCase().includes(signerSearch.toLowerCase()) ||
        m.email.toLowerCase().includes(signerSearch.toLowerCase()))
  )

  const addSigner = (member: TeamMember) => {
    setSigners([...signers, {
      name: member.name,
      email: member.email,
      order: signers.length
    }])
    setSignerSearch("")
  }

  const removeSigner = (email: string) => {
    const newSigners = signers.filter((s) => s.email !== email)
    // Reassign order numbers after removal
    setSigners(newSigners.map((s, idx) => ({ ...s, order: idx })))
  }

  const moveSigner = (index: number, direction: "up" | "down") => {
    const newSigners = [...signers]
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= signers.length) return
    ;[newSigners[index], newSigners[newIndex]] = [newSigners[newIndex], newSigners[index]]
    // Reassign order numbers after move
    setSigners(newSigners.map((s, idx) => ({ ...s, order: idx })))
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

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('No file selected')
      return
    }

    if (signers.length === 0) {
      setError('No signers added')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: selectedFile.name,
          driveFileId: selectedFile.id,
          signers: signers.map((s) => ({
            name: s.name,
            email: s.email,
            order: s.order,
          })),
          retentionDate: retentionDate?.toISOString(),
          notifyOnSign,
          notifyOnComplete,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create workflow')
      }

      const data = await response.json()
      router.push(`/workflows/${data.workflowId}/place-fields`)
    } catch (err) {
      console.error('Failed to create workflow:', err)
      setError(err instanceof Error ? err.message : 'Failed to create workflow')
      setIsSubmitting(false)
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
              <div>
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HardDrive className="h-5 w-5 text-primary" />
                      Select Document from Google Drive
                    </CardTitle>
                    <CardDescription>
                      Choose the document you want to prepare for signatures. The document will remain in Google Drive.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <FilePicker
                  onSelect={setSelectedFile}
                  selectedFileId={selectedFile?.id}
                />

                {selectedFile && (
                  <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedFile.mimeType === 'application/pdf' ? 'PDF Document' : 'DOCX Document'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
                      disabled={loadingTeamMembers}
                    />
                  </div>

                  {/* Loading State */}
                  {loadingTeamMembers && (
                    <div className="mt-4 flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  )}

                  {/* Search Results */}
                  {!loadingTeamMembers && signerSearch && filteredTeamMembers.length > 0 && (
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
                            key={signer.email}
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
                                onClick={() => removeSigner(signer.email)}
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
                        <p className="text-sm text-muted-foreground">
                          {selectedFile?.mimeType === 'application/pdf' ? 'PDF Document' : 'DOCX Document'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Signing Order */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Signing Order ({signers.length} {signers.length === 1 ? 'signer' : 'signers'})
                    </h3>
                    <div className="mt-2 space-y-2">
                      {signers.map((signer, index) => (
                        <div key={signer.email} className="flex items-center gap-3 rounded-lg border p-3">
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

                  {/* Error Display */}
                  {error && (
                    <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                      {error}
                    </div>
                  )}

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
              <Button onClick={handleSubmit} disabled={!canProceed() || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Workflow...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Create & Place Signatures
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
