"use client"

import { Clock, CheckCircle2, PenTool, HardDrive, AlertCircle, User, ArrowRight, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppSidebar } from "@/components/app-sidebar"
import { useSession } from "@/lib/auth-client"
import Link from "next/link"
import { useEffect, useState } from "react"

interface SignatureRequest {
  id: string
  workflowId: string
  workflowStatus: string
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

interface InboxResponse {
  pending: SignatureRequest[]
  signed: SignatureRequest[]
}

function SignatureRequestCard({ request }: { request: SignatureRequest }) {
  return (
    <Card className={request.isYourTurn ? "border-warning/50 bg-warning/5" : ""}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {request.workflowStatus === "CANCELLED" ? (
                <Badge variant="destructive" className="bg-destructive/10 text-destructive">
                  <XCircle className="mr-1 h-3 w-3" />
                  Cancelled
                </Badge>
              ) : request.status === "pending" ? (
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
            {request.workflowStatus === "CANCELLED" ? (
              <Button variant="outline" asChild disabled>
                <Link href={`/workflows/${request.workflowId}`}>
                  View Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : request.status === "pending" && request.isYourTurn ? (
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
  const { data: session, isPending } = useSession()
  const [pendingRequests, setPendingRequests] = useState<SignatureRequest[]>([])
  const [signedRequests, setSignedRequests] = useState<SignatureRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSignatureRequests() {
      if (!session?.user?.email) return

      try {
        const response = await fetch('/api/signers/inbox')
        if (!response.ok) throw new Error('Failed to fetch signature requests')

        const data: InboxResponse = await response.json()
        setPendingRequests(data.pending)
        setSignedRequests(data.signed)
      } catch (error) {
        console.error('Error fetching signature requests:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.email) {
      fetchSignatureRequests()
    }
  }, [session?.user?.email])

  const yourTurnCount = pendingRequests.filter((r) => r.isYourTurn).length

  if (isPending || isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <AppSidebar />
        <main className="flex-1 pl-64">
          <div className="mx-auto max-w-4xl px-8 py-8">
            <p className="text-muted-foreground">Loading signature requests...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="flex min-h-screen bg-background">
        <AppSidebar />
        <main className="flex-1 pl-64">
          <div className="mx-auto max-w-4xl px-8 py-8">
            <p className="text-muted-foreground">Please sign in to view signature requests.</p>
          </div>
        </main>
      </div>
    )
  }

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
