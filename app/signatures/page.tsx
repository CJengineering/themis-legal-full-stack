"use client"

import { Clock, CheckCircle2, PenTool, HardDrive, AlertCircle, User, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppSidebar } from "@/components/app-sidebar"
import Link from "next/link"

interface SignatureRequest {
  id: string
  workflowId: string
  documentTitle: string
  drivePath: string
  requestedBy: string
  requestedAt: string
  status: "pending" | "signed"
  signedAt?: string
  yourPosition: number
  totalSigners: number
  isYourTurn: boolean
}

const signatureRequests: SignatureRequest[] = [
  {
    id: "sr-001",
    workflowId: "wf-001",
    documentTitle: "Mutual Non-Disclosure Agreement - Tech Ventures Inc.",
    drivePath: "Legal/NDAs/Tech Ventures",
    requestedBy: "James Mitchell",
    requestedAt: "April 5, 2026",
    status: "pending",
    yourPosition: 2,
    totalSigners: 3,
    isYourTurn: true,
  },
  {
    id: "sr-002",
    workflowId: "wf-004",
    documentTitle: "Partnership Agreement - Global Ventures LLP",
    drivePath: "Legal/Partnerships",
    requestedBy: "James Mitchell",
    requestedAt: "March 28, 2026",
    status: "pending",
    yourPosition: 4,
    totalSigners: 4,
    isYourTurn: false,
  },
  {
    id: "sr-003",
    workflowId: "wf-003",
    documentTitle: "Employment Agreement - Senior Associate Position",
    drivePath: "HR/Employment/2026",
    requestedBy: "HR Director",
    requestedAt: "April 1, 2026",
    status: "signed",
    signedAt: "April 2, 2026 at 3:45 PM",
    yourPosition: 1,
    totalSigners: 2,
    isYourTurn: false,
  },
  {
    id: "sr-004",
    workflowId: "wf-005",
    documentTitle: "Confidentiality Agreement - M&A Transaction",
    drivePath: "Legal/M&A/Confidential",
    requestedBy: "James Mitchell",
    requestedAt: "March 20, 2026",
    status: "signed",
    signedAt: "March 21, 2026 at 11:20 AM",
    yourPosition: 2,
    totalSigners: 2,
    isYourTurn: false,
  },
]

function SignatureRequestCard({ request }: { request: SignatureRequest }) {
  return (
    <Card className={request.isYourTurn ? "border-warning/50 bg-warning/5" : ""}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {request.status === "pending" ? (
                request.isYourTurn ? (
                  <Badge className="bg-warning text-warning-foreground">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Your Turn
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-muted">
                    <Clock className="mr-1 h-3 w-3" />
                    Waiting
                  </Badge>
                )
              ) : (
                <Badge className="bg-success/10 text-success">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Signed
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                Signer {request.yourPosition} of {request.totalSigners}
              </span>
            </div>
            <h3 className="mt-2 font-medium text-foreground">
              {request.documentTitle}
            </h3>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <HardDrive className="h-3 w-3" />
              <span>{request.drivePath}</span>
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>From {request.requestedBy}</span>
              </div>
              <span>Requested {request.requestedAt}</span>
            </div>
            {request.signedAt && (
              <p className="mt-2 text-xs text-success">
                Signed on {request.signedAt}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {request.status === "pending" && request.isYourTurn ? (
              <Button asChild>
                <Link href={`/sign/${request.workflowId}`}>
                  <PenTool className="mr-2 h-4 w-4" />
                  Sign Now
                </Link>
              </Button>
            ) : request.status === "pending" ? (
              <Button variant="outline" asChild>
                <Link href={`/workflows/${request.workflowId}`}>
                  View Workflow
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button variant="outline" asChild>
                <Link href={`/workflows/${request.workflowId}`}>
                  View Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SignaturesPage() {
  const pendingRequests = signatureRequests.filter((r) => r.status === "pending")
  const signedRequests = signatureRequests.filter((r) => r.status === "signed")
  const yourTurnCount = pendingRequests.filter((r) => r.isYourTurn).length

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 pl-64">
        <div className="mx-auto max-w-4xl px-8 py-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              My Signatures
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Documents requiring your signature and your signing history
            </p>
          </div>

          {/* Action Required Banner */}
          {yourTurnCount > 0 && (
            <Card className="mt-6 border-warning/50 bg-warning/5">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/20">
                    <AlertCircle className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {yourTurnCount} document{yourTurnCount > 1 ? "s" : ""} awaiting your signature
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Review and sign to continue the workflow
                    </p>
                  </div>
                </div>
                <Button asChild>
                  <Link href={`/sign/${pendingRequests.find((r) => r.isYourTurn)?.workflowId}`}>
                    Sign Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs defaultValue="pending" className="mt-6">
            <TabsList>
              <TabsTrigger value="pending" className="gap-1.5">
                Pending
                {pendingRequests.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 min-w-5 justify-center">
                    {pendingRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="signed">Signed</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6">
              {pendingRequests.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="mt-4 font-medium text-foreground">No pending signatures</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      You&apos;re all caught up!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <SignatureRequestCard key={request.id} request={request} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="signed" className="mt-6">
              {signedRequests.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <PenTool className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="mt-4 font-medium text-foreground">No signed documents</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Documents you sign will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {signedRequests.map((request) => (
                    <SignatureRequestCard key={request.id} request={request} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
