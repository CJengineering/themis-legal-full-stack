import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { StatsCards } from "@/components/stats-cards"
import { WorkflowCard } from "@/components/workflow-card"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

// Helper to get base URL for API calls
function getBaseUrl() {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

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
  documentNumber: string | null
  createdAt: string
  updatedAt: string
  signers: Signer[]
}

interface Stats {
  activeWorkflows: number
  awaitingSignatures: number
  completedThisMonth: number
  yourTurn: number
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  const baseUrl = getBaseUrl()

  // Fetch stats and workflows in parallel
  const [statsRes, workflowsRes] = await Promise.all([
    fetch(`${baseUrl}/api/workflows/stats`, {
      headers: {
        cookie: (await headers()).get('cookie') || '',
      },
      cache: 'no-store',
    }),
    fetch(`${baseUrl}/api/workflows`, {
      headers: {
        cookie: (await headers()).get('cookie') || '',
      },
      cache: 'no-store',
    }),
  ])

  const stats: Stats = await statsRes.json()
  const workflows: Workflow[] = await workflowsRes.json()

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 pl-64">
        <div className="mx-auto max-w-6xl px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Dashboard
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Welcome back, {session.user.name}
              </p>
            </div>
            <Button asChild>
              <Link href="/workflows/new">
                <Plus className="mr-2 h-4 w-4" />
                Start New Workflow
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <StatsCards
            activeWorkflows={stats.activeWorkflows}
            awaitingSignatures={stats.awaitingSignatures}
            completedThisMonth={stats.completedThisMonth}
            yourTurn={stats.yourTurn}
          />

          {/* Recent Workflows */}
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Recent Workflows
              </h2>
              <Link
                href="/workflows"
                className="text-sm text-primary hover:underline"
              >
                View all
              </Link>
            </div>

            {workflows.length > 0 ? (
              <div className="grid gap-4">
                {workflows.map((workflow) => (
                  <WorkflowCard
                    key={workflow.id}
                    workflow={workflow}
                    userEmail={session.user.email}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No workflows yet. Start your first workflow to get started.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/workflows/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Workflow
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
