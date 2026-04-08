import { GitBranch, Clock, CheckCircle2, PenTool } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const stats = [
  {
    label: "Active Workflows",
    value: "5",
    icon: GitBranch,
    description: "In progress",
    color: "bg-primary/10 text-primary",
  },
  {
    label: "Awaiting Signatures",
    value: "8",
    icon: Clock,
    description: "From others",
    color: "bg-accent/10 text-accent",
  },
  {
    label: "Completed",
    value: "12",
    icon: CheckCircle2,
    description: "This month",
    color: "bg-success/10 text-success",
  },
  {
    label: "Your Turn to Sign",
    value: "2",
    icon: PenTool,
    description: "Action required",
    color: "bg-warning/10 text-warning",
  },
]

export function StatsCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-l-4 border-l-primary/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
