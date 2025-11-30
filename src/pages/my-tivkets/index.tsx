import { useState, useMemo, useEffect } from "react"
import { Eye } from "lucide-react"
import axiosInstance from "../../api/axiosInstance"
import TicketPopupModal from "./ticket-popup-modal.tsx"

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

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>()
  const [activeTab, setActiveTab] = useState<"used" | "notused">("notused")
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  useEffect(() => {
    getTicket()
  }, [])

  const getTicket = async () => {
    await axiosInstance
      .get("/users/my")
      .then((response) => {
        if (response.status === 200) {
          setTickets(response.data)
        }
      })
      .catch((error) => {
        console.log(error)
      })
  }

  const filteredTickets = useMemo(() => {
    return tickets?.filter((t) => {
      if (activeTab === "used") {
        return t.checkedInAt !== null
      } else {
        return t.checkedInAt === null
      }
    })
  }, [tickets, activeTab])



  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: selectedTicket?.event.title,
        text: `Check out my ticket for ${selectedTicket?.event.title}`,
        url: window.location.href,
      })
    } else {
      alert("Share not supported on this browser")
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b border-blue-100 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4 flex flex-row items-start sm:items-center justify-between gap-4 max-w-7xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Tickets</h1>
            <p className="text-sm text-slate-600 mt-1">
              {filteredTickets?.length} {activeTab === "used" ? "used" : "unused"} tickets
            </p>
          </div>
          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-sm border border-blue-200">
            <span className="text-lg">🎫</span>
            <span>{filteredTickets?.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white  sticky mt-3 top-16 z-10">
        <div className="px-6 max-w-7xl mx-auto flex gap-4">
          <button
            onClick={() => setActiveTab("notused")}
            className={`py-2 px-4 border-b-3 font-semibold  rounded transition-all cursor-pointer  ${
              activeTab === "notused"
                ? "border-blue-600 text-blue-600 bg-blue-50"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Not Used
          </button>
          <button
            onClick={() => setActiveTab("used")}
            className={`py-2 px-4 border-b-3  rounded font-semibold transition-all cursor-pointer ${
              activeTab === "used"
                ? "border-blue-600 text-blue-600  bg-blue-50"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Used
          </button>
        </div>
      </div>

      {/* Tickets List */}
      <div className="px-6 py-8 max-w-7xl mx-auto">
        {filteredTickets?.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500 text-lg">No {activeTab === "used" ? "used" : "unused"} tickets found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets?.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row items-stretch">
                  {/* Left Content */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{ticket.event.title}</h3>
                        <p className="text-sm text-slate-600 mt-1">📍 {ticket.event.venueName}</p>
                      </div>
                      <div className="ml-4">
                        {ticket.checkedInAt ? (
                          <div className="inline-block bg-green-50 text-green-700 text-xs font-bold px-3 py-2 rounded-lg border border-green-200">
                            ✓ Used
                          </div>
                        ) : (
                          <div className="inline-block bg-yellow-50 text-yellow-700 text-xs font-bold px-3 py-2 rounded-lg border border-yellow-200">
                            ⏳ Not Used
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Seats */}
                    <div className="mb-4">
                      <p className="text-xs text-slate-600 font-semibold mb-2">SEATS</p>
                      <div className="flex gap-2 flex-wrap">
                        {ticket.items.map((item) => (
                          <span
                            key={item.id}
                            className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200"
                          >
                            {item.seatNumber} <span className="text-slate-500">({item.categoryName})</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Price & Check-in Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">Amount</p>
                        <p className="font-bold text-slate-900">₹{(ticket.amount ?? 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Total</p>
                        <p className="font-bold text-blue-600">₹{(ticket.totalAmount ?? 0).toFixed(2)}</p>
                      </div>
                      {ticket.checkedInAt && (
                        <div className="col-span-2">
                          <p className="text-slate-600 text-xs">
                            Checked in: {new Date(ticket.checkedInAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right QR Code Section */}
                  <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border-l border-slate-200 md:w-48">
                    {ticket.ticketQrBase64 ? (
                      <div className="text-center flex flex-col  justify-center items-center">
                        <div className="w-32 h-32 mb-3 rounded-lg overflow-hidden border-2 border-slate-300 transition-all">
                          <img
                            src={`data:image/png;base64,${ticket.ticketQrBase64}`}
                            alt="QR Code"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 w-full"
                        >
                          <Eye className="w-4 h-4" />
                          Show QR Code
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-slate-600 font-semibold text-sm">No QR Code</p>
                        <p className="text-slate-500 text-xs mt-1">This ticket is not yet used</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TicketPopupModal
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onShare={handleShare}
      />
    </div>
  )
}
