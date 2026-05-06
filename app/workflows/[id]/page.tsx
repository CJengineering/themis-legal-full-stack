import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeAuditLog } from "@/lib/audit"
import { headers } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { ArrowLeft, HardDrive, Clock, CheckCircle2, AlertCircle, User, ExternalLink, PenTool, Calendar, FileText, RotateCcw, Send, Download, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/components/app-sidebar"
import { WorkflowActions } from "@/components/workflow-actions"
import Link from "next/link"
import { format } from "date-fns"

interface RouteParams {
  params: Promise<{ id: string }>
}

function getStatusBadge(status: string) {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge className="bg-warning/20 text-warning">
          <Clock className="mr-1 h-3 w-3" />
          In Progress
        </Badge>
      )
    case "COMPLETED":
      return (
        <Badge className="bg-success/20 text-success">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Completed
        </Badge>
      )
    case "CANCELLED":
      return (
        <Badge variant="secondary" className="text-muted-foreground">
          <AlertCircle className="mr-1 h-3 w-3" />
          Cancelled
        </Badge>
      )
    case "DRAFT":
      return (
        <Badge variant="outline">
          <FileText className="mr-1 h-3 w-3" />
          Draft
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function getAuditIcon(eventType: string) {
  switch (eventType) {
    case "SIGNING_COMPLETED":
    case "FIELD_SIGNED":
      return <PenTool className="h-4 w-4 text-success" />
    case "SIGNER_NOTIFIED":
    case "REMINDER_SENT":
      return <Send className="h-4 w-4 text-primary" />
    case "SIGNING_STARTED":
    case "AUTH_SUCCESS":
      return <User className="h-4 w-4 text-muted-foreground" />
    case "WORKFLOW_CANCELLED":
      return <AlertCircle className="h-4 w-4 text-destructive" />
    case "WORKFLOW_DELETED":
      return <Trash2 className="h-4 w-4 text-destructive" />
    case "WORKFLOW_COMPLETED":
      return <CheckCircle2 className="h-4 w-4 text-success" />
    default:
      return <RotateCcw className="h-4 w-4 text-muted-foreground" />
  }
}

function formatEventType(eventType: string): string {
  const mapping: Record<string, string> = {
    WORKFLOW_CREATED: "Workflow created",
    SIGNER_NOTIFIED: "Notification sent",
    SIGNING_STARTED: "Document viewed",
    FIELD_SIGNED: "Field signed",
    SIGNING_COMPLETED: "Document signed",
    WORKFLOW_COMPLETED: "Workflow completed",
    WORKFLOW_CANCELLED: "Workflow cancelled",
    WORKFLOW_DELETED: "Workflow deleted",
    REMINDER_SENT: "Reminder sent",
    AUTH_SUCCESS: "Authentication successful",
    AUTH_FAILURE: "Authentication failed",
  }
  return mapping[eventType] || eventType
}

export default async function WorkflowDetailPage({ params }: RouteParams) {
  // 1. Check authentication
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    redirect("/login")
  }

  // 2. Get workflow ID from params
  const { id: workflowId } = await params

  // 3. Fetch workflow data directly from database
  const workflowData = await prisma.workflow.findUnique({
    where: { id: workflowId },
    include: {
      creator: {
        select: { id: true, name: true, email: true },
      },
      signers: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          name: true,
          email: true,
          order: true,
          status: true,
          signedAt: true,
          consentGiven: true,
          lastReminderSentAt: true,
        },
      },
      fields: {
        select: {
          id: true,
          signerId: true,
          type: true,
          value: true,
          completedAt: true,
        },
      },
      auditLogs: {
        orderBy: { timestamp: 'desc' },
        select: {
          id: true,
          eventType: true,
          timestamp: true,
          metadata: true,
          actor: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
  })

  if (!workflowData) {
    notFound()
  }

  // 4. Determine user's role: creator, signer, or both
  const isCreator = workflowData.creatorId === session.user.id
  const signerRecord = workflowData.signers.find(
    (s) => s.email.toLowerCase() === session.user.email.toLowerCase()
  )
  const isSigner = !!signerRecord

  // Authorization: must be creator OR signer
  if (!isCreator && !isSigner) {
    redirect("/login")
  }

  const myRole = isCreator && isSigner ? 'both' : isCreator ? 'creator' : 'signer'

  // 5. If user is a signer, perform sequential order check
  let isYourTurn = false
  if (isSigner && signerRecord) {
    const previousSigners = workflowData.signers.filter(
      (s) => s.order < signerRecord.order
    )
    const unsignedPrevious = previousSigners.find((s) => s.status !== 'SIGNED')

    // It's your turn if all previous signers have signed AND you haven't signed yet
    isYourTurn = !unsignedPrevious && signerRecord.status !== 'SIGNED'

    // 6. Write SIGNING_STARTED audit log (only if accessing for signing)
    if (isYourTurn) {
      const hasStartedBefore = await prisma.auditLog.findFirst({
        where: {
          workflowId,
          eventType: 'SIGNING_STARTED',
          actorId: session.user.id,
        },
      })

      if (!hasStartedBefore) {
        const headersList = await headers()
        const ipAddress =
          headersList.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
        const userAgent = headersList.get('user-agent') ?? 'unknown'

        await writeAuditLog({
          workflowId,
          eventType: 'SIGNING_STARTED',
          actorId: session.user.id,
          ipAddress,
          userAgent,
          metadata: {
            signerId: signerRecord.id,
            signerOrder: signerRecord.order,
          },
        })
      }
    }
  }

  // 7. Calculate current signer (lowest order unsigned)
  const currentSigner = workflowData.signers.find((s) => s.status !== 'SIGNED') ?? null

  // 8. Structure data for component (convert dates to strings for JSON serialization)
  const workflow = {
    id: workflowData.id,
    name: workflowData.name,
    status: workflowData.status,
    driveFileId: workflowData.driveFileId,
    driveFolderId: workflowData.driveFolderId,
    documentHash: workflowData.documentHash,
    documentNumber: workflowData.documentNumber,
    documentType: workflowData.documentType,
    retentionDate: workflowData.retentionDate?.toISOString() ?? null,
    signedFileId: workflowData.signedFileId,
    createdAt: workflowData.createdAt.toISOString(),
    updatedAt: workflowData.updatedAt.toISOString(),
    completedAt: workflowData.completedAt?.toISOString() ?? null,
    cancelledAt: workflowData.cancelledAt?.toISOString() ?? null,
    creator: workflowData.creator,
    signers: workflowData.signers.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      order: s.order,
      status: s.status,
      signedAt: s.signedAt?.toISOString() ?? null,
    })),
    fields: workflowData.fields,
  }

  const auditLog = workflowData.auditLogs.map((log) => ({
    id: log.id,
    eventType: log.eventType,
    timestamp: log.timestamp.toISOString(),
    metadata: log.metadata as Record<string, unknown> | undefined,
    actor: log.actor,
  }))

  // 4. Calculate progress
  const signedCount = workflow.signers.filter((s: { status: string }) => s.status === "SIGNED").length
  const totalSigners = workflow.signers.length
  const progressPercent = totalSigners > 0 ? (signedCount / totalSigners) * 100 : 0

  // 5. Build Drive URL (use signed document if available)
  const isCompleted = workflow.status === 'COMPLETED'
  const hasSignedFile = workflow.signedFileId != null && workflow.signedFileId !== ''
  const shouldShowSignedDoc = isCompleted && hasSignedFile

  const driveFileId = shouldShowSignedDoc ? workflow.signedFileId : workflow.driveFileId
  const driveUrl = `https://drive.google.com/file/d/${driveFileId}/view`
  const driveButtonText = shouldShowSignedDoc ? 'View Signed Document' : 'View in Drive'

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 pl-64">
        <div className="mx-auto max-w-5xl px-8 py-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/workflows">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(workflow.status)}
                  {workflow.documentNumber && (
                    <Badge variant="outline">{workflow.documentNumber}</Badge>
                  )}
                </div>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {workflow.name}
                </h1>
                <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Created by {workflow.creator.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(workflow.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isYourTurn && (
                <Button asChild>
                  <Link href={`/sign/${workflow.id}`}>
                    <PenTool className="mr-2 h-4 w-4" />
                    Sign Now
                  </Link>
                </Button>
              )}
              <Button variant="outline" asChild>
                <a href={driveUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {driveButtonText}
                </a>
              </Button>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Document Preview Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4 text-primary" />
                    Document
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border bg-muted/30 p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{workflow.name}</p>
                        {workflow.documentType && (
                          <p className="text-sm text-muted-foreground">{workflow.documentType}</p>
                        )}
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                          <HardDrive className="h-3 w-3" />
                          <span>Google Drive</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={driveUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-4 w-4" />
                          View
                        </a>
                      </Button>
                    </div>
                  </div>

                  {isYourTurn && (
                    <div className="mt-4 rounded-lg border border-warning/30 bg-warning/5 p-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-warning" />
                        <p className="font-medium text-foreground">Action Required</p>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        It&apos;s your turn to sign this document. Please review and sign to continue the workflow.
                      </p>
                      <Button className="mt-3" asChild>
                        <Link href={`/sign/${workflow.id}`}>
                          <PenTool className="mr-2 h-4 w-4" />
                          Review & Sign
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Signing Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Signing Progress</CardTitle>
                  <CardDescription>
                    Signers are notified in order. Each signer can only sign when it&apos;s their turn.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Overall Progress</span>
                      <span className="font-medium text-foreground">
                        {signedCount} of {totalSigners} signed
                      </span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    {workflow.signers.map((signer: {
                      id: string
                      name: string
                      email: string
                      order: number
                      status: string
                      signedAt: string | null
                    }, index: number) => {
                      const isCurrent = currentSigner?.id === signer.id
                      const signed = signer.status === "SIGNED"

                      return (
                        <div
                          key={signer.id}
                          className={`flex items-center gap-4 rounded-lg border p-4 ${
                            isCurrent ? "border-warning/50 bg-warning/5" : ""
                          }`}
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                            {index + 1}
                          </div>
                          <Avatar className={`h-10 w-10 ${signed ? "ring-2 ring-success ring-offset-2" : isCurrent ? "ring-2 ring-warning ring-offset-2" : ""}`}>
                            <AvatarFallback className={signed ? "bg-success/20" : isCurrent ? "bg-warning/20" : "bg-muted"}>
                              {signer.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{signer.name}</p>
                            <p className="text-sm text-muted-foreground">{signer.email}</p>
                          </div>
                          <div className="text-right">
                            {signed ? (
                              <div>
                                <Badge className="bg-success/10 text-success">
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                  Signed
                                </Badge>
                                {signer.signedAt && (
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {format(new Date(signer.signedAt), "MMM d, yyyy 'at' h:mm a")}
                                  </p>
                                )}
                              </div>
                            ) : isCurrent ? (
                              <Badge className="bg-warning/20 text-warning">
                                <AlertCircle className="mr-1 h-3 w-3" />
                                Awaiting
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-muted-foreground">
                                <Clock className="mr-1 h-3 w-3" />
                                Pending
                              </Badge>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Audit Log */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Activity Log</CardTitle>
                  <CardDescription>
                    Complete history of all actions in this workflow.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {auditLog.map((entry: {
                      id: string
                      eventType: string
                      timestamp: string
                      actor: { name: string; email: string }
                      metadata?: Record<string, unknown>
                    }, index: number) => (
                      <div key={entry.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                            {getAuditIcon(entry.eventType)}
                          </div>
                          {index < auditLog.length - 1 && (
                            <div className="mt-2 h-full w-px bg-border" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium text-foreground">{formatEventType(entry.eventType)}</p>
                          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{entry.actor.name}</span>
                            <span>•</span>
                            <span>{format(new Date(entry.timestamp), "MMM d, yyyy 'at' h:mm a")}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Workflow Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Workflow Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Status</dt>
                      <dd className="mt-1">{getStatusBadge(workflow.status)}</dd>
                    </div>
                    <Separator />
                    <div>
                      <dt className="text-muted-foreground">Created</dt>
                      <dd className="mt-1 font-medium text-foreground">
                        {format(new Date(workflow.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                      </dd>
                    </div>
                    <Separator />
                    <div>
                      <dt className="text-muted-foreground">Last Updated</dt>
                      <dd className="mt-1 font-medium text-foreground">
                        {format(new Date(workflow.updatedAt), "MMMM d, yyyy 'at' h:mm a")}
                      </dd>
                    </div>
                    {workflow.completedAt && (
                      <>
                        <Separator />
                        <div>
                          <dt className="text-muted-foreground">Completed</dt>
                          <dd className="mt-1 font-medium text-foreground">
                            {format(new Date(workflow.completedAt), "MMMM d, yyyy 'at' h:mm a")}
                          </dd>
                        </div>
                      </>
                    )}
                    {workflow.retentionDate && (
                      <>
                        <Separator />
                        <div>
                          <dt className="text-muted-foreground">Retention Date</dt>
                          <dd className="mt-1 font-medium text-foreground">
                            {format(new Date(workflow.retentionDate), "MMMM d, yyyy")}
                          </dd>
                        </div>
                      </>
                    )}
                  </dl>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <WorkflowActions
                    workflowId={workflow.id}
                    driveUrl={driveUrl}
                    myRole={myRole}
                    workflowStatus={workflow.status}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
