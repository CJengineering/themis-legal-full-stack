"use client"

import { use } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  HardDrive,
  Mail,
  MoreHorizontal,
  Copy,
  Trash2,
  ExternalLink,
  Scale,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AppSidebar } from "@/components/app-sidebar"
import { cn } from "@/lib/utils"

// Mock completed document data
const mockDocument = {
  id: "3",
  title: "Employment Contract - Sarah Johnson",
  type: "Contract",
  status: "completed",
  documentNumber: "EC-2026-04-0147",
  createdAt: "April 1, 2026",
  completedAt: "April 5, 2026 at 4:15 PM",
  effectiveDate: "April 15, 2026",
  createdBy: {
    name: "John Doe",
    email: "john@lawfirm.com",
    title: "Managing Partner",
  },
  company: {
    name: "Morrison & Associates LLP",
    address: "1250 Avenue of the Americas, 35th Floor",
    city: "New York, NY 10020",
    phone: "(212) 555-0100",
    email: "contracts@morrisonlaw.com",
  },
  signers: [
    {
      id: "1",
      name: "John Doe",
      email: "john@lawfirm.com",
      role: "Employer Representative",
      title: "Managing Partner",
      status: "signed",
      signedAt: "April 3, 2026 at 10:30 AM",
      ipAddress: "192.168.1.100",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah@email.com",
      role: "Employee",
      title: "Senior Associate",
      status: "signed",
      signedAt: "April 5, 2026 at 4:15 PM",
      ipAddress: "192.168.2.50",
    },
  ],
  auditTrail: [
    {
      action: "Document created",
      user: "John Doe",
      timestamp: "April 1, 2026 at 9:00 AM",
    },
    {
      action: "Signature request sent to John Doe",
      user: "System",
      timestamp: "April 1, 2026 at 9:05 AM",
    },
    {
      action: "Document viewed",
      user: "John Doe",
      timestamp: "April 3, 2026 at 10:25 AM",
    },
    {
      action: "Document signed",
      user: "John Doe",
      timestamp: "April 3, 2026 at 10:30 AM",
    },
    {
      action: "Signature request sent to Sarah Johnson",
      user: "System",
      timestamp: "April 3, 2026 at 10:31 AM",
    },
    {
      action: "Document viewed",
      user: "Sarah Johnson",
      timestamp: "April 5, 2026 at 4:10 PM",
    },
    {
      action: "Document signed",
      user: "Sarah Johnson",
      timestamp: "April 5, 2026 at 4:15 PM",
    },
    {
      action: "Signing workflow completed",
      user: "System",
      timestamp: "April 5, 2026 at 4:15 PM",
    },
  ],
}

export default function DocumentViewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const isCompleted = mockDocument.status === "completed"
  const signedCount = mockDocument.signers.filter((s) => s.status === "signed").length
  const totalSigners = mockDocument.signers.length
  const progressPercentage = (signedCount / totalSigners) * 100

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 pl-64">
        <div className="mx-auto max-w-6xl px-8 py-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Link>
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={isCompleted ? "default" : "secondary"}
                    className={cn(
                      "gap-1.5",
                      isCompleted && "bg-green-600 text-white hover:bg-green-600"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    {isCompleted ? "Completed" : "In Progress"}
                  </Badge>
                  <Badge variant="outline">{mockDocument.type}</Badge>
                </div>
                <h1 className="mt-2 text-xl font-semibold tracking-tight text-foreground text-balance">
                  {mockDocument.title}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Created by {mockDocument.createdBy.name} on {mockDocument.createdAt}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Button variant="outline" size="sm">
                <HardDrive className="mr-2 h-4 w-4" />
                Save to Drive
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Share Link
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Main Content - Legal Document */}
            <div className="space-y-6">
              {/* PDF-like Document Preview */}
              <div className="rounded-lg border border-border bg-card shadow-lg overflow-hidden">
                {/* Document Paper */}
                <div className="bg-white" style={{ minHeight: "1100px" }}>
                  {/* Top Border Accent */}
                  <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary" />
                  
                  {/* Document Content */}
                  <div className="px-12 py-10">
                    {/* Letterhead */}
                    <div className="border-b-2 border-foreground/20 pb-6 mb-8">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                              <Scale className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h2 className="text-xl font-bold tracking-tight text-foreground">
                                {mockDocument.company.name}
                              </h2>
                              <p className="text-xs text-muted-foreground tracking-widest uppercase">
                                Attorneys at Law
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground leading-relaxed">
                          <p>{mockDocument.company.address}</p>
                          <p>{mockDocument.company.city}</p>
                          <p className="mt-1">Tel: {mockDocument.company.phone}</p>
                          <p>{mockDocument.company.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Document Reference */}
                    <div className="flex justify-between items-start mb-8">
                      <div className="text-xs text-muted-foreground">
                        <p><span className="font-medium">Document No:</span> {mockDocument.documentNumber}</p>
                        <p><span className="font-medium">Effective Date:</span> {mockDocument.effectiveDate}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-green-600">
                        <Shield className="h-4 w-4" />
                        <span className="font-medium">LEGALLY BINDING</span>
                      </div>
                    </div>

                    {/* Document Title */}
                    <div className="text-center mb-10">
                      <h1 className="text-2xl font-bold tracking-wide text-foreground uppercase border-b-2 border-t-2 border-foreground/30 py-4 inline-block px-12">
                        Employment Agreement
                      </h1>
                    </div>

                    {/* Preamble */}
                    <div className="mb-8 text-sm leading-relaxed text-foreground text-justify">
                      <p className="mb-4">
                        <strong>THIS EMPLOYMENT AGREEMENT</strong> (the &quot;Agreement&quot;) is entered into as of the 
                        <strong> 1st day of April, 2026</strong> (the &quot;Effective Date&quot;), by and between:
                      </p>
                      
                      <div className="ml-8 mb-4 pl-4 border-l-2 border-primary/30">
                        <p className="mb-2">
                          <strong>EMPLOYER:</strong> Morrison &amp; Associates LLP, a limited liability partnership 
                          organized and existing under the laws of the State of New York, with its principal place 
                          of business at 1250 Avenue of the Americas, 35th Floor, New York, NY 10020 
                          (hereinafter referred to as the &quot;Firm&quot; or &quot;Employer&quot;);
                        </p>
                        <p className="text-center my-2 text-muted-foreground">AND</p>
                        <p>
                          <strong>EMPLOYEE:</strong> Sarah Johnson, an individual residing at 
                          425 Park Avenue South, Apt. 12B, New York, NY 10016 
                          (hereinafter referred to as &quot;Employee&quot;).
                        </p>
                      </div>
                      
                      <p>
                        The Employer and Employee are collectively referred to herein as the &quot;Parties&quot; and 
                        individually as a &quot;Party.&quot;
                      </p>
                    </div>

                    {/* Recitals */}
                    <div className="mb-8">
                      <h2 className="text-sm font-bold uppercase tracking-wide text-foreground mb-4 border-b border-foreground/20 pb-2">
                        Recitals
                      </h2>
                      <div className="text-sm leading-relaxed text-foreground text-justify space-y-3">
                        <p>
                          <strong>WHEREAS,</strong> the Employer is engaged in the practice of law and desires 
                          to employ the Employee in the capacity set forth herein; and
                        </p>
                        <p>
                          <strong>WHEREAS,</strong> the Employee possesses the qualifications, experience, and 
                          abilities to perform the duties required by the Employer; and
                        </p>
                        <p>
                          <strong>WHEREAS,</strong> the Parties desire to establish the terms and conditions of 
                          such employment;
                        </p>
                        <p>
                          <strong>NOW, THEREFORE,</strong> in consideration of the mutual covenants and agreements 
                          hereinafter set forth and for other good and valuable consideration, the receipt and 
                          sufficiency of which are hereby acknowledged, the Parties agree as follows:
                        </p>
                      </div>
                    </div>

                    {/* Article I */}
                    <div className="mb-6">
                      <h2 className="text-sm font-bold uppercase tracking-wide text-foreground mb-3">
                        Article I - Employment and Duties
                      </h2>
                      <div className="text-sm leading-relaxed text-foreground text-justify space-y-3 ml-4">
                        <p>
                          <strong>1.1 Position.</strong> The Employer hereby employs the Employee as a 
                          <strong> Senior Associate</strong> in the Corporate Transactions Practice Group. 
                          The Employee accepts such employment upon the terms and conditions set forth in 
                          this Agreement.
                        </p>
                        <p>
                          <strong>1.2 Duties.</strong> The Employee shall perform such duties and responsibilities 
                          as are customarily associated with the position of Senior Associate, including but not 
                          limited to: (a) drafting and reviewing legal documents; (b) conducting legal research 
                          and analysis; (c) advising clients on legal matters; (d) representing clients in 
                          negotiations and transactions; and (e) such other duties as may be reasonably assigned 
                          by the Employer.
                        </p>
                        <p>
                          <strong>1.3 Best Efforts.</strong> The Employee agrees to devote their full business time, 
                          attention, and best efforts to the performance of their duties hereunder and to the 
                          furtherance of the Employer&apos;s interests.
                        </p>
                      </div>
                    </div>

                    {/* Article II */}
                    <div className="mb-6">
                      <h2 className="text-sm font-bold uppercase tracking-wide text-foreground mb-3">
                        Article II - Compensation and Benefits
                      </h2>
                      <div className="text-sm leading-relaxed text-foreground text-justify space-y-3 ml-4">
                        <p>
                          <strong>2.1 Base Salary.</strong> As compensation for the services rendered hereunder, 
                          the Employer shall pay the Employee an annual base salary of <strong>One Hundred Fifty 
                          Thousand Dollars ($150,000.00)</strong>, payable in accordance with the Employer&apos;s 
                          standard payroll practices, less applicable withholdings and deductions.
                        </p>
                        <p>
                          <strong>2.2 Bonus.</strong> The Employee shall be eligible to receive an annual 
                          discretionary bonus based upon individual performance and the Firm&apos;s financial 
                          performance, as determined by the Employer in its sole discretion.
                        </p>
                        <p>
                          <strong>2.3 Benefits.</strong> The Employee shall be entitled to participate in all 
                          employee benefit plans, programs, and arrangements made available by the Employer to 
                          similarly situated employees, subject to the terms and conditions of such plans.
                        </p>
                        <p>
                          <strong>2.4 Vacation.</strong> The Employee shall be entitled to twenty (20) days of 
                          paid vacation per calendar year, to be taken at times mutually agreeable to the 
                          Employee and the Employer.
                        </p>
                      </div>
                    </div>

                    {/* Article III */}
                    <div className="mb-6">
                      <h2 className="text-sm font-bold uppercase tracking-wide text-foreground mb-3">
                        Article III - Term and Termination
                      </h2>
                      <div className="text-sm leading-relaxed text-foreground text-justify space-y-3 ml-4">
                        <p>
                          <strong>3.1 Term.</strong> This Agreement shall commence on April 15, 2026 and shall 
                          continue until terminated by either Party in accordance with the provisions hereof.
                        </p>
                        <p>
                          <strong>3.2 Termination Without Cause.</strong> Either Party may terminate this 
                          Agreement at any time, with or without cause, upon thirty (30) days&apos; prior written 
                          notice to the other Party.
                        </p>
                        <p>
                          <strong>3.3 Termination for Cause.</strong> The Employer may terminate this Agreement 
                          immediately for Cause, which shall include: (a) material breach of this Agreement; 
                          (b) gross negligence or willful misconduct; (c) conviction of a felony; or 
                          (d) violation of professional ethics rules.
                        </p>
                      </div>
                    </div>

                    {/* Article IV */}
                    <div className="mb-8">
                      <h2 className="text-sm font-bold uppercase tracking-wide text-foreground mb-3">
                        Article IV - Confidentiality
                      </h2>
                      <div className="text-sm leading-relaxed text-foreground text-justify space-y-3 ml-4">
                        <p>
                          <strong>4.1 Confidential Information.</strong> The Employee acknowledges that in the 
                          course of employment, the Employee will have access to and become acquainted with 
                          Confidential Information. The Employee agrees to hold all Confidential Information 
                          in strict confidence and not to disclose, publish, or otherwise reveal any Confidential 
                          Information to any third party during or after employment, except as required in the 
                          performance of duties hereunder.
                        </p>
                        <p>
                          <strong>4.2 Return of Materials.</strong> Upon termination of employment for any 
                          reason, the Employee shall immediately return to the Employer all documents, files, 
                          records, and other materials containing Confidential Information.
                        </p>
                      </div>
                    </div>

                    {/* Signature Block */}
                    <div className="border-t-2 border-foreground/20 pt-8 mt-12">
                      <p className="text-sm text-foreground mb-8 text-center font-medium">
                        IN WITNESS WHEREOF, the Parties have executed this Employment Agreement as of the 
                        date first written above.
                      </p>
                      
                      <div className="grid grid-cols-2 gap-12">
                        {mockDocument.signers.map((signer) => (
                          <div key={signer.id} className="space-y-4">
                            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                              {signer.role === "Employer Representative" ? "EMPLOYER:" : "EMPLOYEE:"}
                            </p>
                            
                            {/* Signature */}
                            <div className="border-b-2 border-foreground/60 pb-1 min-h-[60px] flex items-end">
                              <span className="font-serif text-2xl italic text-primary">
                                {signer.name}
                              </span>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Name:</span>
                                <span className="text-xs font-medium text-foreground">{signer.name}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Title:</span>
                                <span className="text-xs font-medium text-foreground">{signer.title}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Date:</span>
                                <span className="text-xs font-medium text-foreground">
                                  {signer.signedAt?.split(" at")[0]}
                                </span>
                              </div>
                            </div>

                            {/* Verification Badge */}
                            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 rounded px-2 py-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Digitally signed &amp; verified</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 pt-6 border-t border-foreground/10">
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <div>
                          <p>Document ID: {mockDocument.documentNumber}</p>
                          <p>Generated via SignFlow E-Signature Platform</p>
                        </div>
                        <div className="text-right">
                          <p>Page 1 of 1</p>
                          <p>Confidential</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Audit Trail */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Audit Trail</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-0">
                    {mockDocument.auditTrail.map((event, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 border-l-2 border-border pb-4 pl-4 last:pb-0"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {event.action}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {event.user} &middot; {event.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Status Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {signedCount} of {totalSigners} signed
                      </span>
                      <span className="font-medium text-foreground">
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>

                  {isCompleted && (
                    <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          Completed
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-green-600">
                        {mockDocument.completedAt}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Signers Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Signers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {mockDocument.signers.map((signer, index) => (
                    <div
                      key={signer.id}
                      className="flex items-center gap-3 rounded-lg border border-border p-3"
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium",
                          signer.status === "signed"
                            ? "bg-green-100 text-green-600"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {signer.status === "signed" ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {signer.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {signer.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Actions Card */}
              <Card>
                <CardContent className="pt-4 space-y-2">
                  <Button className="w-full justify-start" variant="outline">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Copy via Email
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <HardDrive className="mr-2 h-4 w-4" />
                    Export to Google Drive
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
