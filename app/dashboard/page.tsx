import { redirect } from "next/navigation"

export default function DashboardPage() {
  // Dashboard is now at root /
  redirect("/")
}   