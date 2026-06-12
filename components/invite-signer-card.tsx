"use client"

import { useState } from "react"
import { UserPlus, Loader2, Copy, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type InviteSignerCardProps = {
  userRole?: string
}

export function InviteSignerCard({ userRole }: InviteSignerCardProps) {
  const { toast } = useToast()
  const [isInviting, setIsInviting] = useState(false)
  const [showCredentials, setShowCredentials] = useState(false)
  const [credentials, setCredentials] = useState<{
    email: string
    password: string
    name: string
  } | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const [signerName, setSignerName] = useState("")
  const [signerEmail, setSignerEmail] = useState("")

  const handleInviteSigner = async () => {
    if (!signerName.trim() || !signerEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter both name and email",
        variant: "destructive",
      })
      return
    }

    setIsInviting(true)
    try {
      const res = await fetch('/api/signers/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signerName.trim(),
          email: signerEmail.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to invite signer')
      }

      setCredentials(data.credentials)
      setShowCredentials(true)
      setSignerName("")
      setSignerEmail("")

      toast({
        title: "Success",
        description: "Signer account created successfully",
      })
    } catch (error) {
      console.error('Error inviting signer:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create signer account",
        variant: "destructive",
      })
    } finally {
      setIsInviting(false)
    }
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
      toast({
        title: "Copied",
        description: `${field} copied to clipboard`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  if (userRole !== 'ADMIN') {
    return null
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invite Signer</CardTitle>
          <CardDescription>
            Create accounts for signers who don&apos;t have Google accounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signer-name">Signer Name</Label>
            <Input
              id="signer-name"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signer-email">Signer Email</Label>
            <Input
              id="signer-email"
              type="email"
              value={signerEmail}
              onChange={(e) => setSignerEmail(e.target.value)}
              placeholder="john@example.com"
            />
          </div>
          <Button onClick={handleInviteSigner} disabled={isInviting}>
            {isInviting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Signer Account
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            A secure password will be generated. Share the credentials with the signer via secure means.
          </p>
        </CardContent>
      </Card>

      <Dialog open={showCredentials} onOpenChange={setShowCredentials}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Signer Account Created</DialogTitle>
            <DialogDescription>
              Share these credentials with the signer. They can change their password after first login.
            </DialogDescription>
          </DialogHeader>
          {credentials && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <div className="flex items-center gap-2">
                  <Input value={credentials.name} readOnly className="flex-1" />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(credentials.name, "Name")}
                  >
                    {copiedField === "Name" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="flex items-center gap-2">
                  <Input value={credentials.email} readOnly className="flex-1" />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(credentials.email, "Email")}
                  >
                    {copiedField === "Email" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Password (temporary)</Label>
                <div className="flex items-center gap-2">
                  <Input value={credentials.password} readOnly className="flex-1 font-mono text-sm" />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(credentials.password, "Password")}
                  >
                    {copiedField === "Password" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                <p>Login URL: <span className="font-mono">{window.location.origin}/login-signer</span></p>
                <p className="mt-1">Store these credentials securely and share them with the signer via a secure channel.</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowCredentials(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
