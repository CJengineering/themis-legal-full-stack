"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Send, RotateCcw, ExternalLink, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

interface WorkflowActionsProps {
  workflowId: string
  driveUrl: string
  myRole: "creator" | "signer" | "both"
  workflowStatus: string
}

export function WorkflowActions({
  workflowId,
  driveUrl,
  myRole,
  workflowStatus,
}: WorkflowActionsProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isReminding, setIsReminding] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const showCreatorActions = myRole === "creator" || myRole === "both"

  const handleSendReminder = async () => {
    setIsReminding(true)
    try {
      const res = await fetch(`/api/workflows/${workflowId}/remind`, {
        method: "POST",
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 429) {
          // Rate limit error
          toast({
            title: "Please wait",
            description: data.error,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to send reminder",
            variant: "destructive",
          })
        }
        return
      }

      toast({
        title: "Reminder sent",
        description: data.message,
      })

      // Refresh the page to show updated lastReminderSentAt
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reminder",
        variant: "destructive",
      })
    } finally {
      setIsReminding(false)
    }
  }

  const handleCancelWorkflow = async () => {
    setIsCancelling(true)
    try {
      const res = await fetch(`/api/workflows/${workflowId}/cancel`, {
        method: "PATCH",
      })

      const data = await res.json()

      if (!res.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to cancel workflow",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Workflow cancelled",
        description: data.message,
      })

      // Refresh the page to show updated status
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel workflow",
        variant: "destructive",
      })
    } finally {
      setIsCancelling(false)
    }
  }

  const handleDeleteWorkflow = async () => {
    const confirmed = window.confirm(
      "Are you sure? This will permanently delete the workflow and cannot be undone."
    )

    if (!confirmed) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/workflows/${workflowId}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (!res.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to delete workflow",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Workflow deleted",
        description: "The workflow has been permanently deleted.",
      })

      // Redirect to workflows page
      router.push("/workflows")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete workflow",
        variant: "destructive",
      })
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button variant="outline" className="w-full justify-start" asChild>
        <a href={driveUrl} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="mr-2 h-4 w-4" />
          View in Google Drive
        </a>
      </Button>

      {showCreatorActions && workflowStatus === "ACTIVE" && (
        <>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleSendReminder}
            disabled={isReminding}
          >
            {isReminding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Reminder
              </>
            )}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-destructive hover:text-destructive"
                disabled={isCancelling}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Cancel Workflow
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel this workflow?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All pending signers will be notified
                  that the workflow has been cancelled.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Workflow</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancelWorkflow}
                  disabled={isCancelling}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    "Cancel Workflow"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}

      {showCreatorActions && (
        <>
          <div className="pt-2 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-2 px-1">
              Danger Zone
            </p>
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleDeleteWorkflow}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Workflow
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
