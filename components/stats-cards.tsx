import { FileText, Clock, CheckCircle2, PenTool } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const stats = [
  {
    label: "Total Documents",
    value: "24",
    icon: FileText,
    description: "All documents",
  },
  {
    label: "Pending Signatures",
    value: "8",
    icon: Clock,
    description: "Awaiting action",
  },
  {
    label: "Completed",
    value: "12",
    icon: CheckCircle2,
    description: "This month",
  },
  {
    label: "Your Signatures",
    value: "3",
    icon: PenTool,
    description: "Pending",
  },
]

export function StatsCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
