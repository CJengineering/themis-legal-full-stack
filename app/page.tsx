"use client"

import { Plus, Search, Filter, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppSidebar } from "@/components/app-sidebar"
import { StatsCards } from "@/components/stats-cards"
import { DocumentCard, type DocumentStatus } from "@/components/document-card"
import Link from "next/link"

const documents: Array<{
  id: string
  title: string
  type: "contract" | "nda" | "authorization"
  status: DocumentStatus
  signers: { total: number; signed: number }
  updatedAt: string
  createdBy: string
}> = [
  {
    id: "1",
    title: "Software Development Agreement - TechCorp Inc.",
    type: "contract",
    status: "pending",
    signers: { total: 3, signed: 1 },
    updatedAt: "2 hours ago",
    createdBy: "You",
  },
  {
    id: "2",
    title: "Non-Disclosure Agreement - Project Alpha",
    type: "nda",
    status: "pending",
    signers: { total: 2, signed: 0 },
    updatedAt: "5 hours ago",
    createdBy: "You",
  },
  {
    id: "3",
    title: "Employment Contract - Sarah Johnson",
    type: "contract",
    status: "completed",
    signers: { total: 2, signed: 2 },
    updatedAt: "Yesterday",
    createdBy: "You",
  },
  {
    id: "4",
    title: "Authorization Letter - Bank Account Access",
    type: "authorization",
    status: "draft",
    signers: { total: 0, signed: 0 },
    updatedAt: "2 days ago",
    createdBy: "You",
  },
  {
    id: "5",
    title: "Partnership Agreement - Global Ventures",
    type: "contract",
    status: "waiting",
    signers: { total: 4, signed: 2 },
    updatedAt: "3 days ago",
    createdBy: "You",
  },
  {
    id: "6",
    title: "Mutual NDA - Consulting Services",
    type: "nda",
    status: "completed",
    signers: { total: 2, signed: 2 },
    updatedAt: "1 week ago",
    createdBy: "You",
  },
]

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
                Manage your documents and signature workflows
              </p>
            </div>
            <Button asChild>
              <Link href="/documents/new">
                <Plus className="mr-2 h-4 w-4" />
                New Document
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-8">
            <StatsCards />
          </div>

          {/* Documents Section */}
          <div className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-foreground">
                Recent Documents
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
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
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem>All Types</DropdownMenuItem>
                    <DropdownMenuItem>Contracts</DropdownMenuItem>
                    <DropdownMenuItem>NDAs</DropdownMenuItem>
                    <DropdownMenuItem>Authorizations</DropdownMenuItem>
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
                    <DropdownMenuItem>Name Z-A</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <Tabs defaultValue="all" className="mt-6">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="drafts">Drafts</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <div className="grid gap-4">
                  {documents.map((doc) => (
                    <DocumentCard key={doc.id} {...doc} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="drafts" className="mt-6">
                <div className="grid gap-4">
                  {documents
                    .filter((doc) => doc.status === "draft")
                    .map((doc) => (
                      <DocumentCard key={doc.id} {...doc} />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="pending" className="mt-6">
                <div className="grid gap-4">
                  {documents
                    .filter((doc) => doc.status === "pending" || doc.status === "waiting")
                    .map((doc) => (
                      <DocumentCard key={doc.id} {...doc} />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="completed" className="mt-6">
                <div className="grid gap-4">
                  {documents
                    .filter((doc) => doc.status === "completed")
                    .map((doc) => (
                      <DocumentCard key={doc.id} {...doc} />
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
