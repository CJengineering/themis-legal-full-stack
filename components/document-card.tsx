"use client"

import { FileText, MoreHorizontal, Clock, CheckCircle2, AlertCircle, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

export type DocumentStatus = "draft" | "pending" | "completed" | "waiting"

interface DocumentCardProps {
  id: string
  title: string
  type: "contract" | "nda" | "authorization"
  status: DocumentStatus
  signers: {
    total: number
    signed: number
  }
  updatedAt: string
  createdBy: string
}

const statusConfig: Record<
  DocumentStatus,
  { label: string; variant: "secondary" | "default" | "outline"; icon: React.ComponentType<{ className?: string }> }
> = {
  draft: { label: "Draft", variant: "secondary", icon: FileText },
  pending: { label: "Awaiting Signatures", variant: "default", icon: Clock },
  waiting: { label: "Waiting", variant: "outline", icon: AlertCircle },
  completed: { label: "Completed", variant: "secondary", icon: CheckCircle2 },
}

const typeLabels = {
  contract: "Contract",
  nda: "NDA",
  authorization: "Authorization",
}

export function DocumentCard({
  id,
  title,
  type,
  status,
  signers,
  updatedAt,
  createdBy,
}: DocumentCardProps) {
  const statusInfo = statusConfig[status]
  const StatusIcon = statusInfo.icon

  return (
    <Card className="group relative overflow-hidden transition-all hover:border-muted-foreground/30 hover:shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/documents/${id}`}
                className="block truncate text-sm font-medium text-foreground hover:underline"
              >
                {title}
              </Link>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{typeLabels[type]}</span>
                <span className="text-border">|</span>
                <span>Updated {updatedAt}</span>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>View document</DropdownMenuItem>
              <DropdownMenuItem>Edit document</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Download PDF</DropdownMenuItem>
              <DropdownMenuItem>Save to Google Drive</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant={statusInfo.variant} className="gap-1.5">
              <StatusIcon className="h-3 w-3" />
              {statusInfo.label}
            </Badge>
            {status !== "draft" && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>
                  {signers.signed}/{signers.total} signed
                </span>
              </div>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{createdBy}</span>
        </div>
      </CardContent>
    </Card>
  )
}
