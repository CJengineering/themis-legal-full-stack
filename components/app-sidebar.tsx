"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  PenTool,
  Settings,
  HardDrive,
  GitBranch,
  Users,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { signOut, useSession } from "@/lib/auth-client"
import { useEffect, useState } from "react"

type NavigationItem = {
  name: string
  href: string
  icon: typeof LayoutDashboard
}

const navigation: NavigationItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Workflows", href: "/workflows", icon: GitBranch },
  { name: "My Signatures", href: "/signatures", icon: PenTool },
  { name: "Google Drive", href: "/drive", icon: HardDrive },
]

const bottomNavigation = [
  { name: "Team", href: "/team", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { data: session, isPending } = useSession()
  const [driveConnected, setDriveConnected] = useState<boolean | null>(null)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    async function checkDriveConnection() {
      if (!session?.user) return

      try {
        const res = await fetch('/api/drive/connect')
        if (res.ok) {
          const data = await res.json()
          setDriveConnected(data.connected)
        }
      } catch (error) {
        console.error('Failed to check Drive connection:', error)
        setDriveConnected(false)
      }
    }

    checkDriveConnection()
  }, [session?.user])

  // Poll for pending signatures count every 5 minutes
  useEffect(() => {
    async function fetchPendingCount() {
      if (!session?.user) return

      try {
        const res = await fetch('/api/signers/inbox/count')
        if (res.ok) {
          const data = await res.json()
          setPendingCount(data.count)
        }
      } catch (error) {
        console.error('Failed to fetch pending count:', error)
        // Don't show error to user — badge just won't appear
      }
    }

    // Fetch immediately on mount
    fetchPendingCount()

    // Poll every 5 minutes
    const interval = setInterval(fetchPendingCount, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [session?.user])

  // Generate user initials from name
  const getUserInitials = (name?: string | null): string => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-sidebar-border px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <PenTool className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">
              Themis Legal
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
                {item.name === "My Signatures" && pendingCount > 0 && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t border-sidebar-border px-3 py-4">
          {bottomNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}

          {/* User Profile */}
          <div className="mt-4 rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-3">
            {isPending ? (
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ) : session?.user ? (
              <>
                <div className="flex items-center gap-3">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="h-9 w-9 rounded-full"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                      {getUserInitials(session.user.name)}
                    </div>
                  )}
                  <div className="flex-1 truncate">
                    <p className="truncate text-sm font-medium text-sidebar-foreground">
                      {session.user.name || "User"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  {driveConnected === null ? (
                    <div className="h-6 w-36 animate-pulse rounded bg-muted" />
                  ) : driveConnected ? (
                    <Badge variant="outline" className="border-green-500/50 bg-green-500/10 text-xs text-green-700 dark:text-green-400">
                      <HardDrive className="mr-1 h-3 w-3" />
                      Google Drive Connected
                    </Badge>
                  ) : (
                    <Link href="/settings" className="text-xs text-primary hover:underline">
                      Connect Drive →
                    </Link>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 w-full justify-start text-muted-foreground"
                  onClick={async () => {
                    await signOut()
                    window.location.href = "/login"
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">Not signed in</p>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
