"use client"

import { useState } from "react"
import { GripVertical, Mail, Plus, Trash2, User, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

export interface Signer {
  id: string
  name: string
  email: string
  role?: string
  order: number
}

interface SignerManagementProps {
  signers: Signer[]
  onSignersChange: (signers: Signer[]) => void
  creatorIsSigner: boolean
  onCreatorIsSignerChange: (isSigner: boolean) => void
  creatorEmail: string
  creatorName: string
}

export function SignerManagement({
  signers,
  onSignersChange,
  creatorIsSigner,
  onCreatorIsSignerChange,
  creatorEmail,
  creatorName,
}: SignerManagementProps) {
  const [newSigner, setNewSigner] = useState({
    name: "",
    email: "",
    role: "",
  })

  const addSigner = () => {
    if (!newSigner.name || !newSigner.email) return

    const signer: Signer = {
      id: Math.random().toString(36).substr(2, 9),
      name: newSigner.name,
      email: newSigner.email,
      role: newSigner.role || undefined,
      order: signers.length + 1,
    }

    onSignersChange([...signers, signer])
    setNewSigner({ name: "", email: "", role: "" })
  }

  const removeSigner = (id: string) => {
    const updated = signers
      .filter((s) => s.id !== id)
      .map((s, i) => ({ ...s, order: i + 1 }))
    onSignersChange(updated)
  }

  const moveSignerUp = (id: string) => {
    const index = signers.findIndex((s) => s.id === id)
    if (index <= 0) return

    const updated = [...signers]
    const temp = updated[index - 1]
    updated[index - 1] = { ...updated[index], order: index }
    updated[index] = { ...temp, order: index + 1 }
    onSignersChange(updated)
  }

  const moveSignerDown = (id: string) => {
    const index = signers.findIndex((s) => s.id === id)
    if (index >= signers.length - 1) return

    const updated = [...signers]
    const temp = updated[index + 1]
    updated[index + 1] = { ...updated[index], order: index + 2 }
    updated[index] = { ...temp, order: index + 1 }
    onSignersChange(updated)
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium">Signers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Creator as Signer Toggle */}
        <div className="flex items-center space-x-2 rounded-lg border border-border bg-muted/30 p-3">
          <Checkbox
            id="creatorIsSigner"
            checked={creatorIsSigner}
            onCheckedChange={(checked) => onCreatorIsSignerChange(checked as boolean)}
          />
          <div className="flex-1">
            <label
              htmlFor="creatorIsSigner"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I am also a signer
            </label>
            <p className="mt-1 text-xs text-muted-foreground">
              {creatorName} ({creatorEmail})
            </p>
          </div>
        </div>

        {/* Signers List */}
        <div className="space-y-2">
          {creatorIsSigner && (
            <div className="flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/5 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-sm font-medium text-accent">
                1
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {creatorName}
                </p>
                <p className="text-xs text-muted-foreground">{creatorEmail}</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                You (Creator)
              </Badge>
            </div>
          )}

          {signers.map((signer, index) => (
            <div
              key={signer.id}
              className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-muted-foreground/30"
            >
              <div className="flex flex-col gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 text-muted-foreground"
                  onClick={() => moveSignerUp(signer.id)}
                  disabled={index === 0}
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 text-muted-foreground"
                  onClick={() => moveSignerDown(signer.id)}
                  disabled={index === signers.length - 1}
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                {creatorIsSigner ? index + 2 : index + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {signer.name}
                </p>
                <p className="text-xs text-muted-foreground">{signer.email}</p>
              </div>
              {signer.role && (
                <Badge variant="outline" className="text-xs">
                  {signer.role}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                onClick={() => removeSigner(signer.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add Signer Form */}
        <div className="space-y-3 rounded-lg border border-dashed border-border p-4">
          <p className="text-sm font-medium text-foreground">Add Signer</p>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="newSignerName" className="text-xs">
                  Full Name
                </Label>
                <Input
                  id="newSignerName"
                  placeholder="John Smith"
                  value={newSigner.name}
                  onChange={(e) =>
                    setNewSigner({ ...newSigner, name: e.target.value })
                  }
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newSignerEmail" className="text-xs">
                  Email Address
                </Label>
                <Input
                  id="newSignerEmail"
                  type="email"
                  placeholder="john@example.com"
                  value={newSigner.email}
                  onChange={(e) =>
                    setNewSigner({ ...newSigner, email: e.target.value })
                  }
                  className="h-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newSignerRole" className="text-xs">
                Role / Company (Optional)
              </Label>
              <Input
                id="newSignerRole"
                placeholder="CEO, TechCorp Inc."
                value={newSigner.role}
                onChange={(e) =>
                  setNewSigner({ ...newSigner, role: e.target.value })
                }
                className="h-9"
              />
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={addSigner}
            disabled={!newSigner.name || !newSigner.email}
          >
            <Plus className="h-4 w-4" />
            Add Signer
          </Button>
        </div>

        {/* Signing Order Info */}
        {signers.length > 0 && (
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">
              Signers will be notified in order. Once a signer completes their signature, the next signer will automatically receive the document.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
