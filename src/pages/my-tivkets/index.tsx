import { useState } from "react"
import { MapPin, Calendar, Clock, Star, Zap, X, Download, Share2 } from "lucide-react"
import { Button } from "../../components/UI/button"


const MyTickets = () => {
  const [activeTab, setActiveTab] = useState("active")
  const [selectedTicket, setSelectedTicket] = useState<any>(null)

  const tickets = [
    {
      id: 1,
      title: "Spider-Man: No Way Home",
      date: "16 March 2025",
      time: "14:40",
      theater: "Mantri Mall",
      screen: "Screen 3",
      seats: "F12, F13",
      rating: 8.9,
      status: "active",
      genre: "Action • Adventure",
      bookingId: "BK123456789",
    },
    {
      id: 2,
      title: "Tenet",
      date: "16 March 2025",
      time: "14:40",
      theater: "Mantri Mall",
      screen: "Screen 1",
      seats: "G8, G9",
      rating: 7.8,
      status: "active",
      genre: "Sci-Fi • Thriller",
      bookingId: "BK987654321",
    },
    {
      id: 3,
      title: "Dune: Part Two",
      date: "14 March 2025",
      time: "19:30",
      theater: "Forum Mall",
      screen: "IMAX",
      seats: "D15, D16",
      rating: 8.5,
      status: "used",
      genre: "Sci-Fi • Drama",
      bookingId: "BK456789123",
    },
    
  ]

  const activeTickets = tickets.filter((t) => t.status === "active")
  const usedTickets = tickets.filter((t) => t.status === "used")
  const displayTickets = activeTab === "active" ? activeTickets : usedTickets

  const generateQRPattern = () => {
    const patterns = []
    for (let i = 0; i < 21; i++) {
      const row = []
      for (let j = 0; j < 21; j++) {
        // Create a more realistic QR code pattern
        const isCorner = (i < 7 && j < 7) || (i < 7 && j > 13) || (i > 13 && j < 7)
        const isBorder = i === 0 || i === 20 || j === 0 || j === 20
        const isPattern = (i + j) % 3 === 0 || (i * j) % 5 === 0
        row.push(isCorner || isBorder || isPattern)
      }
      patterns.push(row)
    }
    return patterns
  }

  return (
    <div className="bg-gray-50 overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">My Tickets</h1>
          <p className="text-base sm:text-lg text-slate-600">Your movie experiences await</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === "active" ? "default" : "ghost"}
            onClick={() => setActiveTab("active")}
          >
            Active ({activeTickets.length})
          </Button>
          <Button
            variant={activeTab === "used" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("used")}
          >
            History ({usedTickets.length})
          </Button>
        </div>

        {/* Tickets */}
        <div className="space-y-4">
          {displayTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white border border-gray-200 rounded-lg p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  {ticket.title}
                </h3>
                <p className="text-sm text-gray-500">{ticket.genre}</p>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mt-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>{ticket.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-500" />
                    <span>{ticket.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-purple-500" />
                    <span>{ticket.theater}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-500" />
                    <span>{ticket.seats}</span>
                  </div>
                </div>
              </div>

              <div className="ml-6 flex flex-col items-end gap-2">
                <span className="flex items-center text-yellow-600 font-medium text-sm">
                  <Star className="w-4 h-4 mr-1" />
                  {ticket.rating}
                </span>

                {ticket.status === "active" ? (
                  <Button
                    variant="default"
                    onClick={() => setSelectedTicket(ticket as any)}
                  >
                    Show QR
                  </Button>
                ) : (
                  <span className="px-4 py-2 text-sm bg-gray-100 text-gray-500 rounded-md">
                    Used
                  </span>
                )}
              </div>
            </div>
          ))}

          {displayTickets.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No {activeTab} tickets found
            </div>
          )}
        </div>
      </div>

      {/* Enhanced QR Popup */}
 {selectedTicket && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[85vh] mt-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative flex-shrink-0">
        <button
          onClick={() => setSelectedTicket(null)}
          className="absolute top-4 right-4 text-white/80 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold mb-1">🎬 Your Ticket</h2>
        <p className="text-blue-100 text-sm">Ready to enjoy the show!</p>
      </div>

      {/* Scrollable Content */}
      <div className="p-6 overflow-y-auto flex-1">
{/* Movie Info */}
<div className="text-center mb-6">
  {/* Title */}
  <h3 className="text-xl font-bold text-gray-900 mb-4 truncate">
    {selectedTicket.title as any}
  </h3>

  {/* Details */}
  <div className="grid grid-cols-2 gap-6 text-sm text-gray-700">
    {/* Date & Time */}
    <div>
      <p className="font-semibold text-gray-800 mb-1">Date & Time</p>
      <p>
        {selectedTicket.date as any}{" "}
        <span className="ml-1">{selectedTicket.time}</span>
      </p>
    </div>

    {/* Location */}
    <div>
      <p className="font-semibold text-gray-800 mb-1">Location</p>
      <p>
        {selectedTicket.theater}{" "}
        <span className="ml-1">{selectedTicket.screen}</span>
      </p>
    </div>
  </div>

  {/* Seats */}
  <div className="mt-6">
    <p className="font-semibold text-gray-800">Seats</p>
    <p className="text-lg font-bold text-blue-600">
      {selectedTicket.seats}
    </p>
  </div>
</div>

        {/* Beautiful QR Code */}
        <div className="flex justify-center items-center my-6">
          <div className="relative">
            {/* QR Code Container */}
            <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-100">
              <div className="w-48 h-48 bg-white rounded-lg overflow-hidden">
                <div className="grid grid-cols-21 gap-0 w-full h-full">
                  {generateQRPattern().map((row, i) =>
                    row.map((cell, j) => (
                      <div
                        key={`${i}-${j}`}
                        className={`${
                          cell ? "bg-gray-900" : "bg-white"
                        } aspect-square`}
                        style={{
                          width: "calc(100% / 21)",
                          height: "calc(100% / 21)",
                        }}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* QR Code Center Logo */}
              {/* <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-white rounded-lg shadow-md flex items-center justify-center border-2 border-gray-200">
                  <span className="text-lg">🎬</span>
                </div>
              </div> */}
            </div>
          </div>
        </div>

        {/* Booking ID */}
        <div className="text-center mb-6">
          <p className="text-xs text-gray-500 mb-1">Booking ID</p>
          <p className="font-mono text-sm font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-full inline-block">
            {selectedTicket.bookingId}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button variant="outline" size="sm" className="w-full">
            <Download className="w-4 h-4 mr-2" /> Download
          </Button>

          <Button variant="outline" size="sm" className="w-full">
            <Share2 className="w-4 h-4 mr-2" /> Share
          </Button>
        </div>

        {/* Instructions */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700 text-center">
            📱 Show this QR code at the theater entrance for quick entry
          </p>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  )
}

export default MyTickets