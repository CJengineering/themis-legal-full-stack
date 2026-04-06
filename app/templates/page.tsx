"use client"

import { FileText, Plus, Shield, FileSignature, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AppSidebar } from "@/components/app-sidebar"
import Link from "next/link"

const templates = [
  {
    id: "1",
    name: "Standard Contract",
    description: "General business contract template with standard terms and conditions",
    type: "contract",
    icon: FileText,
    usageCount: 12,
  },
  {
    id: "2",
    name: "Non-Disclosure Agreement",
    description: "Mutual NDA template for protecting confidential information",
    type: "nda",
    icon: Shield,
    usageCount: 8,
  },
  {
    id: "3",
    name: "Employment Contract",
    description: "Standard employment agreement with benefits and terms",
    type: "contract",
    icon: FileText,
    usageCount: 5,
  },
  {
    id: "4",
    name: "Authorization Letter",
    description: "General authorization letter template for various purposes",
    type: "authorization",
    icon: FileSignature,
    usageCount: 3,
  },
  {
    id: "5",
    name: "Service Agreement",
    description: "Professional services contract template",
    type: "contract",
    icon: FileText,
    usageCount: 7,
  },
  {
    id: "6",
    name: "Confidentiality Agreement",
    description: "One-way confidentiality agreement for employees or contractors",
    type: "nda",
    icon: Shield,
    usageCount: 4,
  },
]

export default function TemplatesPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      
      <main className="flex-1 pl-64">
        <div className="mx-auto max-w-6xl px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Templates
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Save time with reusable document templates
              </p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </div>

          {/* Templates Grid */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className="group relative overflow-hidden transition-all hover:border-muted-foreground/30 hover:shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <template.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit template</DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="mt-3 text-base">{template.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Used {template.usageCount} times
                    </span>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/documents/new">Use Template</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State for creating new template */}
          <Card className="mt-6 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-sm font-medium text-foreground">
                Create a new template
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Start from scratch or convert an existing document
              </p>
              <Button className="mt-4" variant="outline">
                Create Template
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
