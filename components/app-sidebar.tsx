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

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Workflows", href: "/workflows", icon: GitBranch, badge: "5" },
  { name: "My Signatures", href: "/signatures", icon: PenTool, badge: "2" },
  { name: "Google Drive", href: "/drive", icon: HardDrive },
]

const bottomNavigation = [
  { name: "Team", href: "/team", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()

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
                  "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </div>
                {item.badge && (
                  <Badge variant="secondary" className="h-5 min-w-5 justify-center bg-primary/20 text-xs text-primary">
                    {item.badge}
                  </Badge>
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
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                JD
              </div>
              <div className="flex-1 truncate">
                <p className="truncate text-sm font-medium text-sidebar-foreground">
                  John Doe
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  john@lawfirm.com
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <HardDrive className="mr-1 h-3 w-3" />
                Google Connected
              </Badge>
            </div>
            <Button variant="ghost" size="sm" className="mt-2 w-full justify-start text-muted-foreground">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </aside>
  )
}
