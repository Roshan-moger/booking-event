import { X, Download, Share2 } from "lucide-react"
import { useRef } from "react"
import { toPng } from "html-to-image"

export interface TicketItem {
  id: number
  seatNumber: string
  categoryName: string
  price: number
}

export interface Event {
  id: number
  title: string
  mode: string
  startDate: string
  endDate: string
  venueName: string
}

export interface Payment {
  id: number
  method: string
  status: string
  paymentId: string
  amount: number
}

export interface Ticket {
  id: number
  createdAt: string
  expiresAt: string
  status: string
  amount: number
  reservedQuantity?: number | null
  cgst: number
  sgst: number
  totalAmount: number
  ticketCode: string | null
  ticketQrBase64: string | null
  ticketIssuedAt: string | null
  ticketValidUntil: string | null
  checkedInAt: string | null
  checkedInBy: string | null
  event: Event
  payment: Payment
  items: TicketItem[]
}

interface TicketPopupModalProps {
  ticket: Ticket | null
  onClose: () => void
  onShare: () => void
}

export default function TicketPopupModal({
  ticket,
  onClose,
  onShare
}: TicketPopupModalProps) {
  if (!ticket) return null

  const captureRef = useRef<HTMLDivElement>(null)

  // ✅ DOWNLOAD FULL MODAL AS PNG
  const handleDownload = async () => {
    if (!captureRef.current) return

    try {
      const dataUrl = await toPng(captureRef.current, {
        quality: 1,
        pixelRatio: 2, 
        cacheBust: true
      })

      const link = document.createElement("a")
      link.download = `your ticket-${ticket.id}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error("PNG download failed:", err)
    }
  }

  const eventDate = new Date(ticket.event.startDate)
  const dateStr = eventDate.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "2-digit"
  })
  const timeStr = eventDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      {/* 🔥 This div is captured for PNG */}
      <div
        ref={captureRef}
        className="relative w-full max-w-md rounded-lg overflow-visible animate-in fade-in zoom-in duration-300"
        style={{
          background: "#ffffff",
          boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
          border: "1px solid rgb(229,229,229)"
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" style={{ color: "rgb(55,65,81)" }} />
        </button>

        {/* Event Title */}
        <div className="px-6 py-2 mt-3 text-center">
          <h1 className="text-lg font-bold" style={{ color: "rgb(17,24,39)" }}>
            {ticket.event.title}
          </h1>
        </div>

        {/* Ticket Info */}
        <div className="relative">
          <div className="px-6 py-4 grid grid-cols-2 gap-4">
            {/* Date & Time */}
            <div className="text-center">
              <p className="text-xs font-semibold mb-1.5" style={{ color: "rgb(107,114,128)" }}>
                DATE & TIME
              </p>
              <p className="text-sm font-bold" style={{ color: "rgb(17,24,39)" }}>{dateStr}</p>
              <p className="text-sm font-bold" style={{ color: "rgb(17,24,39)" }}>{timeStr}</p>
            </div>

            {/* Venue */}
            <div className="text-center">
              <p className="text-xs font-semibold mb-1.5" style={{ color: "rgb(107,114,128)" }}>
                VENUE
              </p>
              <p className="text-sm font-semibold" style={{ color: "rgb(17,24,39)" }}>
                {ticket.event.venueName}
              </p>
            </div>
          </div>

          {/* Seats */}
          <div className="text-center">
            <p className="text-xs font-semibold mb-1.5" style={{ color: "rgb(107,114,128)" }}>
              SEATS
            </p>
            <div className="flex gap-1.5 flex-wrap justify-center">
              {ticket.items.map((item) => (
                <div
                  key={item.id}
                  className="font-bold text-xs px-2.5 py-1 rounded"
                  style={{
                    background: "rgb(37,99,235)",
                    color: "white"
                  }}
                >
                  {item.seatNumber}
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="px-6 py-2">
            <div style={{ borderTop: "2px dashed rgb(209,213,219)" }}></div>
          </div>

          {/* QR Code */}
          <div className="col-span-2 flex flex-col items-center gap-3">
            <div
              className="p-1 rounded-lg"
              style={{
                background: "rgb(249,250,251)",
                boxShadow: "0 4px 10px rgba(0,0,0,0.12)"
              }}
            >
              {ticket.ticketQrBase64 ? (
                <img
                  src={`data:image/png;base64,${ticket.ticketQrBase64}`}
                  alt="QR Code"
                  className="w-40 h-40"
                />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center">
                  <p className="text-xs" style={{ color: "rgb(156,163,175)" }}>
                    No QR
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="px-6 py-2">
            <div style={{ borderTop: "2px dashed rgb(209,213,219)" }}></div>
          </div>

          {/* Buttons */}
          <div className="px-6 py-4 flex gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2"
              style={{
                background: "rgb(37,99,235)",
                color: "white"
              }}
            >
              <Download className="w-4 h-4" /> Download
            </button>

            <button
              onClick={onShare}
              className="flex-1 font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2"
              style={{
                background: "rgb(229,231,235)",
                color: "rgb(17,24,39)"
              }}
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
