"use client"

import {
  CheckCircle2,
  Clock,
  FileText,
  PenTool,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppSidebar } from "@/components/app-sidebar"
import Link from "next/link"
import { cn } from "@/lib/utils"

const pendingSignatures = [
  {
    id: "1",
    title: "Partnership Agreement - Global Ventures",
    requestedBy: "Michael Chen",
    requestedAt: "April 4, 2026",
    dueDate: "April 10, 2026",
    position: "3 of 4",
    status: "waiting",
  },
  {
    id: "2",
    title: "Vendor Agreement - SupplyCo",
    requestedBy: "Jane Smith",
    requestedAt: "April 5, 2026",
    dueDate: "April 12, 2026",
    position: "1 of 2",
    status: "ready",
  },
  {
    id: "3",
    title: "Consulting Agreement - Advisory Board",
    requestedBy: "Robert Wilson",
    requestedAt: "April 6, 2026",
    dueDate: "April 15, 2026",
    position: "2 of 3",
    status: "waiting",
  },
]

const completedSignatures = [
  {
    id: "4",
    title: "Employment Contract - Sarah Johnson",
    requestedBy: "John Doe",
    signedAt: "April 3, 2026",
  },
  {
    id: "5",
    title: "NDA - Project Alpha",
    requestedBy: "John Doe",
    signedAt: "March 28, 2026",
  },
  {
    id: "6",
    title: "Service Agreement - Marketing Agency",
    requestedBy: "Emily Davis",
    signedAt: "March 20, 2026",
  },
]

export default function SignaturesPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      
      <main className="flex-1 pl-64">
        <div className="mx-auto max-w-4xl px-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <PenTool className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Signatures
              </h1>
              <p className="text-sm text-muted-foreground">
                Documents requiring your signature
              </p>
            </div>
          </div>

          <Tabs defaultValue="pending" className="mt-8">
            <TabsList>
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="h-4 w-4" />
                Pending ({pendingSignatures.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Completed ({completedSignatures.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6 space-y-4">
              {pendingSignatures.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-foreground">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Requested by {item.requestedBy} on {item.requestedAt}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <Badge
                              variant={item.status === "ready" ? "default" : "secondary"}
                              className={cn(
                                "gap-1.5",
                                item.status === "ready" && "bg-accent text-accent-foreground"
                              )}
                            >
                              {item.status === "ready" ? (
                                <>
                                  <PenTool className="h-3 w-3" />
                                  Ready to Sign
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3" />
                                  Waiting ({item.position})
                                </>
                              )}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Due: {item.dueDate}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={item.status === "ready" ? "default" : "outline"}
                        disabled={item.status !== "ready"}
                        asChild={item.status === "ready"}
                      >
                        {item.status === "ready" ? (
                          <Link href={`/sign/${item.id}`}>
                            <PenTool className="mr-2 h-4 w-4" />
                            Sign Now
                          </Link>
                        ) : (
                          <>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {pendingSignatures.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 text-sm font-medium text-foreground">
                      No pending signatures
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      You&apos;re all caught up!
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="completed" className="mt-6 space-y-4">
              {completedSignatures.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                          <CheckCircle2 className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-foreground">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Requested by {item.requestedBy}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Signed on {item.signedAt}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/documents/${item.id}`}>View Document</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
