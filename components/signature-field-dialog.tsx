"use client"

import { useState } from "react"
import { PenTool } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface SignatureFieldData {
  signerName: string
  signerEmail: string
  role: string
  includeDate: boolean
  includeInitials: boolean
}

interface SignatureFieldDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (data: SignatureFieldData) => void
  signers: Array<{ name: string; email: string }>
}

export function SignatureFieldDialog({
  open,
  onOpenChange,
  onAdd,
  signers,
}: SignatureFieldDialogProps) {
  const [formData, setFormData] = useState<SignatureFieldData>({
    signerName: "",
    signerEmail: "",
    role: "",
    includeDate: true,
    includeInitials: false,
  })

  const handleSubmit = () => {
    onAdd(formData)
    setFormData({
      signerName: "",
      signerEmail: "",
      role: "",
      includeDate: true,
      includeInitials: false,
    })
    onOpenChange(false)
  }

  const handleSignerSelect = (email: string) => {
    const signer = signers.find((s) => s.email === email)
    if (signer) {
      setFormData({
        ...formData,
        signerName: signer.name,
        signerEmail: signer.email,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
              <PenTool className="h-5 w-5 text-accent" />
            </div>
            <div>
              <DialogTitle>Add Signature Field</DialogTitle>
              <DialogDescription>
                Configure the signature field for this document.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {signers.length > 0 && (
            <div className="space-y-2">
              <Label>Assign to Signer</Label>
              <div className="flex flex-wrap gap-2">
                {signers.map((signer) => (
                  <Button
                    key={signer.email}
                    variant={formData.signerEmail === signer.email ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSignerSelect(signer.email)}
                  >
                    {signer.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="signerName">Signer Name</Label>
            <Input
              id="signerName"
              placeholder="Enter signer name"
              value={formData.signerName}
              onChange={(e) =>
                setFormData({ ...formData, signerName: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signerEmail">Signer Email</Label>
            <Input
              id="signerEmail"
              type="email"
              placeholder="Enter signer email"
              value={formData.signerEmail}
              onChange={(e) =>
                setFormData({ ...formData, signerEmail: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role / Label (Optional)</Label>
            <Input
              id="role"
              placeholder="e.g., CEO, Witness, Party A"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            />
          </div>

          <div className="space-y-3">
            <Label>Options</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeDate"
                checked={formData.includeDate}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, includeDate: checked as boolean })
                }
              />
              <label
                htmlFor="includeDate"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Include date field
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeInitials"
                checked={formData.includeInitials}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, includeInitials: checked as boolean })
                }
              />
              <label
                htmlFor="includeInitials"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Include initials field
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.signerName || !formData.signerEmail}
          >
            Add Signature Field
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
