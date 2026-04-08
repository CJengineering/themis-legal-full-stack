"use client"

import { ArrowLeft, HardDrive, Clock, CheckCircle2, AlertCircle, User, ExternalLink, PenTool, Calendar, FileText, RotateCcw, Send, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/components/app-sidebar"
import Link from "next/link"

interface Signer {
  name: string
  email: string
  role: string
  signed: boolean
  signedAt?: string
  current: boolean
}

interface AuditEntry {
  action: string
  user: string
  timestamp: string
  details?: string
}

const workflow = {
  id: "wf-001",
  title: "Mutual Non-Disclosure Agreement - Tech Ventures Inc.",
  driveFileId: "1abc123",
  drivePath: "Legal/NDAs/Tech Ventures",
  driveUrl: "https://drive.google.com/file/d/1abc123",
  status: "in_progress" as const,
  currentStep: 2,
  totalSteps: 3,
  createdBy: "James Mitchell",
  createdAt: "April 5, 2026 at 9:30 AM",
  updatedAt: "April 8, 2026 at 2:15 PM",
  retentionDate: "April 5, 2029",
  signers: [
    { name: "James Mitchell", email: "james@lawfirm.com", role: "Initiator", signed: true, signedAt: "April 5, 2026 at 10:15 AM", current: false },
    { name: "John Doe", email: "john@lawfirm.com", role: "Partner", signed: false, current: true },
    { name: "Sarah Chen", email: "sarah@techventures.com", role: "External Party", signed: false, current: false },
  ] as Signer[],
  auditLog: [
    { action: "Workflow created", user: "James Mitchell", timestamp: "April 5, 2026 at 9:30 AM", details: "Document selected from Google Drive" },
    { action: "Signature page appended", user: "System", timestamp: "April 5, 2026 at 9:31 AM" },
    { action: "Notification sent", user: "System", timestamp: "April 5, 2026 at 9:31 AM", details: "Email sent to James Mitchell" },
    { action: "Document signed", user: "James Mitchell", timestamp: "April 5, 2026 at 10:15 AM" },
    { action: "Notification sent", user: "System", timestamp: "April 5, 2026 at 10:15 AM", details: "Email sent to John Doe" },
    { action: "Document viewed", user: "John Doe", timestamp: "April 8, 2026 at 2:15 PM" },
  ] as AuditEntry[],
}

const isUserTurn = workflow.signers.find(s => s.current)?.email === "john@lawfirm.com"

export default function WorkflowDetailPage() {
  const progressPercent = (workflow.currentStep / workflow.totalSteps) * 100

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
                  <Badge className="bg-warning/20 text-warning">
                    <Clock className="mr-1 h-3 w-3" />
                    In Progress
                  </Badge>
                  <Badge variant="outline">
                    Step {workflow.currentStep} of {workflow.totalSteps}
                  </Badge>
                </div>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {workflow.title}
                </h1>
                <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Created by {workflow.createdBy}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {workflow.createdAt}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isUserTurn && (
                <Button asChild>
                  <Link href={`/sign/${workflow.id}`}>
                    <PenTool className="mr-2 h-4 w-4" />
                    Sign Now
                  </Link>
                </Button>
              )}
              <Button variant="outline" asChild>
                <a href={workflow.driveUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open in Drive
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
                        <p className="font-medium text-foreground">{workflow.title}.pdf</p>
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                          <HardDrive className="h-3 w-3" />
                          <span>{workflow.drivePath}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={workflow.driveUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </a>
                      </Button>
                    </div>
                  </div>

                  {isUserTurn && (
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
                        {workflow.signers.filter(s => s.signed).length} of {workflow.signers.length} signed
                      </span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    {workflow.signers.map((signer, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-4 rounded-lg border p-4 ${
                          signer.current ? "border-warning/50 bg-warning/5" : ""
                        }`}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                          {index + 1}
                        </div>
                        <Avatar className={`h-10 w-10 ${signer.signed ? "ring-2 ring-success ring-offset-2" : signer.current ? "ring-2 ring-warning ring-offset-2" : ""}`}>
                          <AvatarFallback className={signer.signed ? "bg-success/20" : signer.current ? "bg-warning/20" : "bg-muted"}>
                            {signer.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">{signer.name}</p>
                            <Badge variant="outline" className="text-xs">{signer.role}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{signer.email}</p>
                        </div>
                        <div className="text-right">
                          {signer.signed ? (
                            <div>
                              <Badge className="bg-success/10 text-success">
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Signed
                              </Badge>
                              <p className="mt-1 text-xs text-muted-foreground">{signer.signedAt}</p>
                            </div>
                          ) : signer.current ? (
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
                    ))}
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
                    {workflow.auditLog.map((entry, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                            {entry.action.includes("signed") ? (
                              <PenTool className="h-4 w-4 text-success" />
                            ) : entry.action.includes("Notification") ? (
                              <Send className="h-4 w-4 text-primary" />
                            ) : entry.action.includes("viewed") ? (
                              <User className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <RotateCcw className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          {index < workflow.auditLog.length - 1 && (
                            <div className="mt-2 h-full w-px bg-border" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium text-foreground">{entry.action}</p>
                          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{entry.user}</span>
                            <span>•</span>
                            <span>{entry.timestamp}</span>
                          </div>
                          {entry.details && (
                            <p className="mt-1 text-sm text-muted-foreground">{entry.details}</p>
                          )}
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
                      <dd className="mt-1">
                        <Badge className="bg-warning/20 text-warning">In Progress</Badge>
                      </dd>
                    </div>
                    <Separator />
                    <div>
                      <dt className="text-muted-foreground">Drive Location</dt>
                      <dd className="mt-1 flex items-center gap-2 font-medium text-foreground">
                        <HardDrive className="h-4 w-4 text-primary" />
                        {workflow.drivePath}
                      </dd>
                    </div>
                    <Separator />
                    <div>
                      <dt className="text-muted-foreground">Created</dt>
                      <dd className="mt-1 font-medium text-foreground">{workflow.createdAt}</dd>
                    </div>
                    <Separator />
                    <div>
                      <dt className="text-muted-foreground">Last Updated</dt>
                      <dd className="mt-1 font-medium text-foreground">{workflow.updatedAt}</dd>
                    </div>
                    <Separator />
                    <div>
                      <dt className="text-muted-foreground">Retention Date</dt>
                      <dd className="mt-1 font-medium text-foreground">{workflow.retentionDate}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href={workflow.driveUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View in Google Drive
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Send className="mr-2 h-4 w-4" />
                    Send Reminder
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Cancel Workflow
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
