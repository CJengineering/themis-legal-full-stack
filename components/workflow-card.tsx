import Link from "next/link"
import { HardDrive, MoreHorizontal, Eye, Trash2, Clock, GitBranch, CheckCircle2, AlertCircle, User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type WorkflowStatus = "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED"
type SignerStatus = "PENDING" | "NOTIFIED" | "SIGNING" | "SIGNED"

interface Signer {
  id: string
  name: string
  email: string
  order: number
  status: SignerStatus
}

interface Workflow {
  id: string
  name: string
  driveFileId: string
  status: WorkflowStatus
  signers: Signer[]
  createdAt: string | Date
  updatedAt: string | Date
}

function getStatusConfig(status: WorkflowStatus, signers: Signer[], userEmail?: string) {
  // Check if it's user's turn to sign
  const currentSigner = signers.find((s) => s.status !== "SIGNED")
  const isYourTurn = currentSigner?.email === userEmail

  if (isYourTurn) {
    return {
      label: "Your Turn",
      icon: AlertCircle,
      className: "bg-warning text-warning-foreground",
    }
  }

  switch (status) {
    case "ACTIVE":
      return {
        label: "In Progress",
        icon: GitBranch,
        className: "bg-primary/10 text-primary",
      }
    case "COMPLETED":
      return {
        label: "Completed",
        icon: CheckCircle2,
        className: "bg-success/10 text-success",
      }
    case "DRAFT":
      return {
        label: "Draft",
        icon: Clock,
        className: "bg-muted/10 text-muted-foreground",
      }
    case "CANCELLED":
      return {
        label: "Cancelled",
        icon: AlertCircle,
        className: "bg-destructive/10 text-destructive",
      }
  }
}

function formatDate(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins} minutes ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function WorkflowCard({ workflow, userEmail }: { workflow: Workflow; userEmail?: string }) {
  const statusConfig = getStatusConfig(workflow.status, workflow.signers, userEmail)
  const StatusIcon = statusConfig.icon
  const signedCount = workflow.signers.filter((s) => s.status === "SIGNED").length
  const totalSigners = workflow.signers.length
  const progressPercent = totalSigners > 0 ? (signedCount / totalSigners) * 100 : 0

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
                {workflow.name}
              </h3>
            </Link>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <HardDrive className="h-3 w-3" />
              <span className="truncate">Google Drive</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right text-xs text-muted-foreground">
              <p>{formatDate(workflow.updatedAt)}</p>
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
              {signedCount} of {totalSigners} signed
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Signers */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex -space-x-2">
            {workflow.signers.map((signer) => (
              <Avatar
                key={signer.id}
                className={`h-7 w-7 border-2 border-background ${
                  signer.status === "SIGNED"
                    ? "ring-2 ring-success ring-offset-1"
                    : signer.status === "SIGNING"
                    ? "ring-2 ring-warning ring-offset-1"
                    : ""
                }`}
                title={`${signer.name} - ${signer.status === "SIGNED" ? "Signed" : signer.status === "SIGNING" ? "Signing" : "Pending"}`}
              >
                <AvatarFallback className={`text-xs ${signer.status === "SIGNED" ? "bg-success/20" : signer.status === "SIGNING" ? "bg-warning/20" : "bg-muted"}`}>
                  {signer.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>{workflow.signers.length} signer{workflow.signers.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
