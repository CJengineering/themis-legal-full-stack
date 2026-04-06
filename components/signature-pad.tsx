"use client"

import { useRef, useEffect, useState } from "react"
import { Eraser, RotateCcw, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const signatureFonts = [
  { name: "Classic", className: "font-serif italic" },
  { name: "Modern", className: "font-sans" },
  { name: "Script", className: "font-serif italic tracking-wide" },
  { name: "Bold", className: "font-sans font-bold" },
]

interface SignaturePadProps {
  onSignatureChange: (signature: string | null) => void
  signerName: string
}

export function SignaturePad({ onSignatureChange, signerName }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [typedName, setTypedName] = useState(signerName)
  const [selectedFont, setSelectedFont] = useState(0)
  const [signatureMethod, setSignatureMethod] = useState<"draw" | "type">("draw")

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Set drawing styles
    ctx.strokeStyle = "#1a1a1a"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    setIsDrawing(true)
    setHasDrawn(true)

    const rect = canvas.getBoundingClientRect()
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    if (hasDrawn) {
      const canvas = canvasRef.current
      if (canvas) {
        onSignatureChange(canvas.toDataURL())
      }
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
    onSignatureChange(null)
  }

  const handleTypedSignature = () => {
    if (typedName.trim()) {
      onSignatureChange(`typed:${selectedFont}:${typedName}`)
    } else {
      onSignatureChange(null)
    }
  }

  useEffect(() => {
    if (signatureMethod === "type") {
      handleTypedSignature()
    }
  }, [typedName, selectedFont, signatureMethod])

  return (
    <div className="space-y-4">
      <Tabs
        value={signatureMethod}
        onValueChange={(v) => setSignatureMethod(v as "draw" | "type")}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="draw" className="gap-2">
            <Eraser className="h-4 w-4" />
            Draw
          </TabsTrigger>
          <TabsTrigger value="type" className="gap-2">
            <Type className="h-4 w-4" />
            Type
          </TabsTrigger>
        </TabsList>

        <TabsContent value="draw" className="mt-4 space-y-4">
          <div className="relative">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="h-40 w-full cursor-crosshair rounded-lg border border-border bg-card touch-none"
              style={{ touchAction: "none" }}
            />
            {!hasDrawn && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Draw your signature here
                </p>
              </div>
            )}
            <div className="absolute bottom-4 left-4 right-4 border-b border-muted-foreground/30" />
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={clearCanvas}
              disabled={!hasDrawn}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="type" className="mt-4 space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Type your full name"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              className="text-center text-lg"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Select a style:</p>
            <div className="grid grid-cols-2 gap-2">
              {signatureFonts.map((font, index) => (
                <button
                  key={font.name}
                  onClick={() => setSelectedFont(index)}
                  className={cn(
                    "rounded-lg border border-border p-4 text-center transition-colors",
                    selectedFont === index
                      ? "border-accent bg-accent/5"
                      : "hover:border-muted-foreground/30"
                  )}
                >
                  <span
                    className={cn(
                      "text-xl text-foreground",
                      font.className
                    )}
                  >
                    {typedName || signerName}
                  </span>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {font.name}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="border-b border-muted-foreground/30 pb-2">
              <span
                className={cn(
                  "text-2xl text-foreground",
                  signatureFonts[selectedFont].className
                )}
              >
                {typedName || signerName}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Preview of your signature
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
