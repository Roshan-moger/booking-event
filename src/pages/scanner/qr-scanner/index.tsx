/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react"
import jsQR from "jsqr"
import { AlertCircle } from "lucide-react"

interface QRScannerProps {
  onScan: (data: string) => void
}

export default function QRScanner({ onScan }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [error, setError] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(true)

  useEffect(() => {
    let animationFrameId: number | null = null
    let stream: MediaStream | null = null

    const stopCamera = () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream

          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play()
            scanFrame()
          }
        }
      } catch (err) {
        console.error("Camera Error:", err)
        setError("Unable to access camera. Please allow camera permission.")
        setIsScanning(false)
      }
    }

    const scanFrame = () => {
      if (!isScanning || !videoRef.current || !canvasRef.current) return

      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      const qr = jsQR(imageData.data, canvas.width, canvas.height)

      if (qr && qr.data) {
        setIsScanning(false)
        stopCamera()
        if (animationFrameId) cancelAnimationFrame(animationFrameId)
        onScan(qr.data)
        return
      }

      animationFrameId = requestAnimationFrame(scanFrame)
    }

    if (isScanning) startCamera()

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
      stopCamera()
    }
  }, [isScanning, onScan])

  return (
    <div className="w-full max-w-md">
      <div className="bg-card rounded-2xl shadow-2xl overflow-hidden border border-border">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-center text-card-foreground">
          <h1 className="text-3xl font-bold mb-2">Event Check-In</h1>
          <p className="text-blue-100">Scan your QR code to check in</p>
        </div>

        {/* Scanner */}
        <div className="p-6">
          <div className="relative bg-black rounded-xl overflow-hidden mb-6 aspect-square">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />

            <canvas ref={canvasRef} className="hidden" />

            {/* Scan Frame Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border-4 border-blue-500 rounded-lg opacity-50 animate-pulse" />
            </div>

            {/* Corner Markers */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-blue-400" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-blue-400" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-blue-400" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-blue-400" />
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive rounded-lg p-4 mb-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <p className="text-center text-muted-foreground text-sm">
            {error ? "Camera permission required" : "Position the QR code within the frame"}
          </p>
        </div>
      </div>
    </div>
  )
}
