"use client"

import { Plus, Search, Filter, ArrowUpDown, GitBranch, HardDrive, Clock, CheckCircle2, AlertCircle, User, MoreHorizontal, Eye, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { AppSidebar } from "@/components/app-sidebar"
import { useSession } from "@/lib/auth-client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"

type WorkflowStatus = "in_progress" | "awaiting_signature" | "completed" | "your_turn"

interface Signer {
  name: string
  email: string
  signed: boolean
  current: boolean
}

interface Workflow {
  id: string
  title: string
  driveFileId: string
  drivePath: string
  status: WorkflowStatus
  currentStep: number
  totalSteps: number
  signers: Signer[]
  createdBy: string
  createdAt: string
  updatedAt: string
  retentionDate?: string
}

// DB response types
interface DBSigner {
  id: string
  name: string
  email: string
  order: number
  status: "PENDING" | "NOTIFIED" | "SIGNING" | "SIGNED"
}

interface DBWorkflow {
  id: string
  name: string
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED"
  createdAt: string
  updatedAt: string
  documentNumber: string | null
  driveFileId: string
  creator: {
    name: string
  }
  signers: DBSigner[]
}

function transformWorkflow(dbWorkflow: DBWorkflow, userEmail: string): Workflow {
  const signedCount = dbWorkflow.signers.filter(s => s.status === "SIGNED").length
  const totalSigners = dbWorkflow.signers.length

  // Find current signer (lowest order unsigned signer)
  const unsignedSigners = dbWorkflow.signers.filter(s => s.status !== "SIGNED")
  const currentSigner = unsignedSigners.length > 0
    ? unsignedSigners.reduce((min, s) => s.order < min.order ? s : min)
    : null

  // Determine if it's user's turn
  const userSigner = dbWorkflow.signers.find(s => s.email === userEmail)
  const isUserTurn = userSigner && userSigner.status !== "SIGNED" &&
    dbWorkflow.signers
      .filter(s => s.order < userSigner.order)
      .every(s => s.status === "SIGNED")

  // Determine status
  let status: WorkflowStatus
  if (dbWorkflow.status === "COMPLETED") {
    status = "completed"
  } else if (isUserTurn) {
    status = "your_turn"
  } else if (dbWorkflow.status === "ACTIVE") {
    status = currentSigner ? "in_progress" : "awaiting_signature"
  } else {
    status = "in_progress"
  }

  return {
    id: dbWorkflow.id,
    title: dbWorkflow.name,
    driveFileId: dbWorkflow.driveFileId,
    drivePath: dbWorkflow.name,
    status,
    currentStep: signedCount,
    totalSteps: totalSigners,
    signers: dbWorkflow.signers.map(s => ({
      name: s.name,
      email: s.email,
      signed: s.status === "SIGNED",
      current: currentSigner?.id === s.id,
    })),
    createdBy: dbWorkflow.creator.name,
    createdAt: new Date(dbWorkflow.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    updatedAt: formatDistanceToNow(new Date(dbWorkflow.updatedAt), { addSuffix: true }),
  }
}

function getStatusConfig(status: WorkflowStatus) {
  switch (status) {
    case "your_turn":
      return {
        label: "Your Turn",
        icon: AlertCircle,
        className: "bg-warning text-warning-foreground",
      }
    case "awaiting_signature":
      return {
        label: "Awaiting Signature",
        icon: Clock,
        className: "bg-accent/10 text-accent",
      }
    case "in_progress":
      return {
        label: "In Progress",
        icon: GitBranch,
        className: "bg-primary/10 text-primary",
      }
    case "completed":
      return {
        label: "Completed",
        icon: CheckCircle2,
        className: "bg-success/10 text-success",
      }
  }
}

function WorkflowCard({ workflow }: { workflow: Workflow }) {
  const statusConfig = getStatusConfig(workflow.status)
  const StatusIcon = statusConfig.icon
  const progressPercent = (workflow.currentStep / workflow.totalSteps) * 100

  return (
    <Card className="transition-all hover:border-primary/30 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Badge className={statusConfig.className}>
                <StatusIcon className="mr-1 h-3 w-3" />
                {statusConfig.label}
              </Badge>
            </div>
            <Link href={`/workflows/${workflow.id}`}>
              <h3 className="mt-2 truncate text-base font-medium text-foreground hover:text-primary">
                {workflow.title}
              </h3>
            </Link>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <HardDrive className="h-3 w-3" />
              <span className="truncate">{workflow.drivePath}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right text-xs text-muted-foreground">
              <p>Updated {workflow.updatedAt}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/workflows/${workflow.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Workflow
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HardDrive className="mr-2 h-4 w-4" />
                  Open in Drive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Cancel Workflow
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Signing Progress</span>
            <span className="font-medium text-foreground">
              {workflow.currentStep} of {workflow.totalSteps} signed
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Signers */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex -space-x-2">
            {workflow.signers.map((signer, i) => (
              <Avatar
                key={i}
                className={`h-7 w-7 border-2 border-background ${
                  signer.signed
                    ? "ring-2 ring-success ring-offset-1"
                    : signer.current
                    ? "ring-2 ring-warning ring-offset-1"
                    : ""
                }`}
                title={`${signer.name} - ${signer.signed ? "Signed" : signer.current ? "Current signer" : "Pending"}`}
              >
                <AvatarFallback className={`text-xs ${signer.signed ? "bg-success/20" : signer.current ? "bg-warning/20" : "bg-muted"}`}>
                  {signer.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>Created by {workflow.createdBy}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function WorkflowsPage() {
  const { data: session, isPending } = useSession()
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchWorkflows() {
      if (!session?.user?.email) return

      try {
        const response = await fetch('/api/workflows')
        if (!response.ok) throw new Error('Failed to fetch workflows')

        const dbWorkflows: DBWorkflow[] = await response.json()
        const transformed = dbWorkflows.map(w => transformWorkflow(w, session.user.email))
        setWorkflows(transformed)
      } catch (error) {
        console.error('Error fetching workflows:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.email) {
      fetchWorkflows()
    }
  }, [session?.user?.email])

  // Filter workflows by search query
  const filteredWorkflows = workflows.filter(w =>
    w.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Tab filters
  const yourTurnWorkflows = filteredWorkflows.filter(w => w.status === "your_turn")
  const awaitingOthersWorkflows = filteredWorkflows.filter(w =>
    w.status === "awaiting_signature" || w.status === "in_progress"
  )
  const completedWorkflows = filteredWorkflows.filter(w => w.status === "completed")

  if (isPending || isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <AppSidebar />
        <main className="flex-1 pl-64">
          <div className="mx-auto max-w-6xl px-8 py-8">
            <p className="text-muted-foreground">Loading workflows...</p>
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
          <div className="mx-auto max-w-6xl px-8 py-8">
            <p className="text-muted-foreground">Please sign in to view workflows.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 pl-64">
        <div className="mx-auto max-w-6xl px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Signing Workflows
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage all document signing workflows
              </p>
            </div>
            <Button asChild>
              <Link href="/workflows/new">
                <Plus className="mr-2 h-4 w-4" />
                Start New Workflow
              </Link>
            </Button>
          </div>

          {/* Filters */}
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                {filteredWorkflows.length} workflows
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search workflows..."
                  className="w-64 pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>All Workflows</DropdownMenuItem>
                  <DropdownMenuItem>Your Turn to Sign</DropdownMenuItem>
                  <DropdownMenuItem>Awaiting Others</DropdownMenuItem>
                  <DropdownMenuItem>Created by Me</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem>Most Recent</DropdownMenuItem>
                  <DropdownMenuItem>Oldest First</DropdownMenuItem>
                  <DropdownMenuItem>Name A-Z</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <Tabs defaultValue="all" className="mt-6">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="your_turn" className="gap-1.5">
                Your Turn
                {yourTurnWorkflows.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 min-w-5 justify-center bg-warning/20 text-warning">
                    {yourTurnWorkflows.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="awaiting">Awaiting Others</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="grid gap-4">
                {filteredWorkflows.map((workflow) => (
                  <WorkflowCard key={workflow.id} workflow={workflow} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="your_turn" className="mt-6">
              <div className="grid gap-4">
                {yourTurnWorkflows.map((workflow) => (
                  <WorkflowCard key={workflow.id} workflow={workflow} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="awaiting" className="mt-6">
              <div className="grid gap-4">
                {awaitingOthersWorkflows.map((workflow) => (
                  <WorkflowCard key={workflow.id} workflow={workflow} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              <div className="grid gap-4">
                {completedWorkflows.map((workflow) => (
                  <WorkflowCard key={workflow.id} workflow={workflow} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
