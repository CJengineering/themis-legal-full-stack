"use client"

import { use } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  HardDrive,
  Mail,
  MoreHorizontal,
  PenTool,
  Send,
  Shield,
  ExternalLink,
  Copy,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AppSidebar } from "@/components/app-sidebar"
import { cn } from "@/lib/utils"

// Mock completed document data
const mockDocument = {
  id: "3",
  title: "Employment Contract - Sarah Johnson",
  type: "Contract",
  status: "completed",
  createdAt: "April 1, 2026",
  completedAt: "April 5, 2026 at 4:15 PM",
  createdBy: {
    name: "John Doe",
    email: "john@lawfirm.com",
  },
  signers: [
    {
      id: "1",
      name: "John Doe",
      email: "john@lawfirm.com",
      role: "Employer Representative",
      status: "signed",
      signedAt: "April 3, 2026 at 10:30 AM",
      ipAddress: "192.168.1.100",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah@email.com",
      role: "Employee",
      status: "signed",
      signedAt: "April 5, 2026 at 4:15 PM",
      ipAddress: "192.168.2.50",
    },
  ],
  auditTrail: [
    {
      action: "Document created",
      user: "John Doe",
      timestamp: "April 1, 2026 at 9:00 AM",
    },
    {
      action: "Signature request sent to John Doe",
      user: "System",
      timestamp: "April 1, 2026 at 9:05 AM",
    },
    {
      action: "Document viewed",
      user: "John Doe",
      timestamp: "April 3, 2026 at 10:25 AM",
    },
    {
      action: "Document signed",
      user: "John Doe",
      timestamp: "April 3, 2026 at 10:30 AM",
    },
    {
      action: "Signature request sent to Sarah Johnson",
      user: "System",
      timestamp: "April 3, 2026 at 10:31 AM",
    },
    {
      action: "Document viewed",
      user: "Sarah Johnson",
      timestamp: "April 5, 2026 at 4:10 PM",
    },
    {
      action: "Document signed",
      user: "Sarah Johnson",
      timestamp: "April 5, 2026 at 4:15 PM",
    },
    {
      action: "Signing workflow completed",
      user: "System",
      timestamp: "April 5, 2026 at 4:15 PM",
    },
  ],
  content: `
    <h1>Employment Contract</h1>
    <p>This Employment Contract ("Agreement") is entered into as of April 1, 2026, by and between:</p>
    <p><strong>Employer:</strong> Law Firm LLP</p>
    <p><strong>Employee:</strong> Sarah Johnson</p>
    <h2>1. Position and Duties</h2>
    <p>The Employee shall be employed in the position of Senior Associate, performing duties as assigned by the Employer.</p>
    <h2>2. Compensation</h2>
    <p>The Employee shall receive an annual salary of $150,000, payable in accordance with the Employer's standard payroll practices.</p>
    <h2>3. Benefits</h2>
    <p>The Employee shall be entitled to participate in all benefit plans offered by the Employer to similarly situated employees.</p>
    <h2>4. Term</h2>
    <p>This Agreement shall commence on April 15, 2026, and continue until terminated by either party with 30 days written notice.</p>
  `,
}

export default function DocumentViewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const isCompleted = mockDocument.status === "completed"
  const signedCount = mockDocument.signers.filter((s) => s.status === "signed").length
  const totalSigners = mockDocument.signers.length
  const progressPercentage = (signedCount / totalSigners) * 100

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 pl-64">
        <div className="mx-auto max-w-5xl px-8 py-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Link>
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={isCompleted ? "default" : "secondary"}
                    className={cn(
                      "gap-1.5",
                      isCompleted && "bg-accent text-accent-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    {isCompleted ? "Completed" : "In Progress"}
                  </Badge>
                  <Badge variant="outline">{mockDocument.type}</Badge>
                </div>
                <h1 className="mt-2 text-xl font-semibold tracking-tight text-foreground text-balance">
                  {mockDocument.title}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Created by {mockDocument.createdBy.name} on {mockDocument.createdAt}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Button variant="outline" size="sm">
                <HardDrive className="mr-2 h-4 w-4" />
                Save to Drive
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Share Link
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Main Content */}
            <div className="space-y-6">
              {/* Document Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Document</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: mockDocument.content }}
                  />

                  {/* Signatures Section */}
                  <Separator className="my-6" />
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-foreground">
                      Signatures
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {mockDocument.signers.map((signer) => (
                        <div
                          key={signer.id}
                          className="rounded-lg border border-border bg-muted/30 p-4"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-accent" />
                            <span className="text-sm font-medium text-foreground">
                              {signer.name}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {signer.role}
                          </p>
                          <div className="mt-3 border-b border-foreground/20 pb-2">
                            <span className="font-serif text-xl italic text-foreground">
                              {signer.name}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">
                            Signed on {signer.signedAt}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Audit Trail */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Audit Trail</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-0">
                    {mockDocument.auditTrail.map((event, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 border-l-2 border-border pb-4 pl-4 last:pb-0"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {event.action}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {event.user} &middot; {event.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Status Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {signedCount} of {totalSigners} signed
                      </span>
                      <span className="font-medium text-foreground">
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>

                  {isCompleted && (
                    <div className="rounded-lg bg-accent/10 p-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-accent" />
                        <span className="text-sm font-medium text-foreground">
                          Completed
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {mockDocument.completedAt}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Signers Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Signers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {mockDocument.signers.map((signer, index) => (
                    <div
                      key={signer.id}
                      className="flex items-center gap-3 rounded-lg border border-border p-3"
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium",
                          signer.status === "signed"
                            ? "bg-accent/10 text-accent"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {signer.status === "signed" ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {signer.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {signer.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Actions Card */}
              <Card>
                <CardContent className="pt-4 space-y-2">
                  <Button className="w-full justify-start" variant="outline">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Copy via Email
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <HardDrive className="mr-2 h-4 w-4" />
                    Export to Google Drive
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
