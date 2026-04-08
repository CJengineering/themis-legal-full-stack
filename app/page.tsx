"use client"

import { Plus, Search, Filter, ArrowUpDown, GitBranch, HardDrive, Clock, CheckCircle2, AlertCircle, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { AppSidebar } from "@/components/app-sidebar"
import { StatsCards } from "@/components/stats-cards"
import Link from "next/link"

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
}

const workflows: Workflow[] = [
  {
    id: "wf-001",
    title: "Mutual Non-Disclosure Agreement - Tech Ventures Inc.",
    driveFileId: "1abc123",
    drivePath: "Legal/NDAs/Tech Ventures",
    status: "your_turn",
    currentStep: 2,
    totalSteps: 3,
    signers: [
      { name: "James Mitchell", email: "james@lawfirm.com", signed: true, current: false },
      { name: "John Doe", email: "john@lawfirm.com", signed: false, current: true },
      { name: "Sarah Chen", email: "sarah@techventures.com", signed: false, current: false },
    ],
    createdBy: "James Mitchell",
    createdAt: "April 5, 2026",
    updatedAt: "2 hours ago",
  },
  {
    id: "wf-002",
    title: "Professional Services Agreement - Consulting Engagement",
    driveFileId: "2def456",
    drivePath: "Legal/Contracts/Consulting",
    status: "awaiting_signature",
    currentStep: 1,
    totalSteps: 2,
    signers: [
      { name: "Emily Roberts", email: "emily@client.com", signed: false, current: true },
      { name: "John Doe", email: "john@lawfirm.com", signed: false, current: false },
    ],
    createdBy: "John Doe",
    createdAt: "April 4, 2026",
    updatedAt: "5 hours ago",
  },
  {
    id: "wf-003",
    title: "Employment Agreement - Senior Associate Position",
    driveFileId: "3ghi789",
    drivePath: "HR/Employment/2026",
    status: "completed",
    currentStep: 2,
    totalSteps: 2,
    signers: [
      { name: "HR Director", email: "hr@lawfirm.com", signed: true, current: false },
      { name: "Sarah Johnson", email: "sarah.j@email.com", signed: true, current: false },
    ],
    createdBy: "HR Director",
    createdAt: "April 1, 2026",
    updatedAt: "Yesterday",
  },
  {
    id: "wf-004",
    title: "Partnership Agreement - Global Ventures LLP",
    driveFileId: "4jkl012",
    drivePath: "Legal/Partnerships",
    status: "in_progress",
    currentStep: 2,
    totalSteps: 4,
    signers: [
      { name: "Partner A", email: "a@global.com", signed: true, current: false },
      { name: "Partner B", email: "b@global.com", signed: true, current: false },
      { name: "Partner C", email: "c@global.com", signed: false, current: true },
      { name: "Partner D", email: "d@global.com", signed: false, current: false },
    ],
    createdBy: "John Doe",
    createdAt: "March 28, 2026",
    updatedAt: "3 days ago",
  },
  {
    id: "wf-005",
    title: "Confidentiality Agreement - M&A Transaction",
    driveFileId: "5mno345",
    drivePath: "Legal/M&A/Confidential",
    status: "completed",
    currentStep: 2,
    totalSteps: 2,
    signers: [
      { name: "Legal Counsel", email: "legal@acquirer.com", signed: true, current: false },
      { name: "CFO", email: "cfo@target.com", signed: true, current: false },
    ],
    createdBy: "James Mitchell",
    createdAt: "March 20, 2026",
    updatedAt: "1 week ago",
  },
]

function getStatusConfig(status: WorkflowStatus) {
  switch (status) {
    case "your_turn":
      return {
        label: "Your Turn",
        variant: "default" as const,
        icon: AlertCircle,
        className: "bg-warning text-warning-foreground",
      }
    case "awaiting_signature":
      return {
        label: "Awaiting Signature",
        variant: "secondary" as const,
        icon: Clock,
        className: "bg-accent/10 text-accent",
      }
    case "in_progress":
      return {
        label: "In Progress",
        variant: "secondary" as const,
        icon: GitBranch,
        className: "bg-primary/10 text-primary",
      }
    case "completed":
      return {
        label: "Completed",
        variant: "secondary" as const,
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
    <Link href={`/workflows/${workflow.id}`}>
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
              <h3 className="mt-2 truncate text-base font-medium text-foreground">
                {workflow.title}
              </h3>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <HardDrive className="h-3 w-3" />
                <span className="truncate">{workflow.drivePath}</span>
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p>Updated {workflow.updatedAt}</p>
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
    </Link>
  )
}

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      
      <main className="flex-1 pl-64">
        <div className="mx-auto max-w-6xl px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Dashboard
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Track your signing workflows and pending actions
              </p>
            </div>
            <Button asChild>
              <Link href="/workflows/new">
                <Plus className="mr-2 h-4 w-4" />
                Start New Workflow
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-8">
            <StatsCards />
          </div>

          {/* Workflows Section */}
          <div className="mt-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-medium text-foreground">
                  Signing Workflows
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search workflows..."
                    className="w-64 pl-9"
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
                  <Badge variant="secondary" className="ml-1 h-5 min-w-5 justify-center bg-warning/20 text-warning">
                    2
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="awaiting">Awaiting Others</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <div className="grid gap-4">
                  {workflows.map((workflow) => (
                    <WorkflowCard key={workflow.id} workflow={workflow} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="your_turn" className="mt-6">
                <div className="grid gap-4">
                  {workflows
                    .filter((w) => w.status === "your_turn")
                    .map((workflow) => (
                      <WorkflowCard key={workflow.id} workflow={workflow} />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="awaiting" className="mt-6">
                <div className="grid gap-4">
                  {workflows
                    .filter((w) => w.status === "awaiting_signature" || w.status === "in_progress")
                    .map((workflow) => (
                      <WorkflowCard key={workflow.id} workflow={workflow} />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="completed" className="mt-6">
                <div className="grid gap-4">
                  {workflows
                    .filter((w) => w.status === "completed")
                    .map((workflow) => (
                      <WorkflowCard key={workflow.id} workflow={workflow} />
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
