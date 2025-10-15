import { useState, useEffect } from "react"
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, MapPin, Calendar, Clock, Users, Ticket, Star, CreditCard, Shield, User, Mail, Phone } from "lucide-react"
import { Button } from "../../components/UI/button"
import axiosInstance from "../../api/axiosInstance"
import { useNavigate, useParams } from "react-router-dom"

// Mock data for demonstration

export interface Seat {
  row: string
  number: number
  categoryId: string
  categoryName: string
  price: number
  status: "AVAILABLE" | "UNAVAILABLE"
}

export interface Event {
  id: number
  title: string
  description: string
  categoryName: string
  venueName: string
  venueId: number
  startDate: string
  endDate: string
  ratings: number
  status: string
  capacity: number
  ticketPrice: number
  seatingType: "SEAT_LAYOUT" | "GENERAL"
  totalSeats: number
  rows: number
  columns: number
  seats: Seat[]
  mode: "WITH_TICKETING" | "WITHOUT_TICKETING"
  organizerFeeAmount: number
  organizerFeeStatus: "DUE" | "PAID" 
  imageUrls: string[]
  hasActiveAd: boolean
}

type PaymentStatus = "form" | "processing" | "success" | "failed"

export default function PaymentPage() {
 const { eventId } = useParams()
 const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("form")
  const [bookingDetails, setBookingDetails] = useState<any>(null)
  const [error, setError] = useState<string>("")
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    phone: "",
  })

  // Fetch event details
  useEffect(() => {
    if (!eventId) return
    const fetchEvent = async () => {
      try {
        const res = await axiosInstance.get(`/organizer/events/${eventId}`)
        setEvent(res.data)
        console.log(res.data)
      } catch (err: any) {
        console.error("Error fetching event:", err)
        setError("Failed to load event details")
      }
    }
    fetchEvent()
  }, [eventId])

  const handlePaymentSuccess = () => {
    setPaymentStatus("processing")

    setTimeout(() => {
      setBookingDetails({
        bookingId: "BK" + Date.now(),
        paymentId: "PAY" + Date.now(),
        amount: event?.ticketPrice || 0,
        tickets: [
          {
            ticketId: "TKT" + Date.now(),
            category: event?.categoryName,
            price: event?.ticketPrice,
          },
        ],
      })
      setPaymentStatus("success")
    }, 2000)
  }

  // const handlePaymentError = (errorMsg: string) => {
  //   setError(errorMsg)
  //   setPaymentStatus("failed")
  // }

  // Seat Layout
  const renderSeatLayout = () => {
    if (!event?.seats || !event.rows || !event.columns) return null

    const seatGrid: { [key: string]: any } = {}
    event.seats.forEach((seat: any) => {
      const key = `${seat.row}-${seat.number}`
      seatGrid[key] = seat
    })

    const getSeatColor = (seat: any) => {
      if (!seat) return "bg-gray-200"
      switch (seat.categoryName?.toLowerCase()) {
        case "vip":
          return "bg-yellow-200"
        case "regular":
          return "bg-blue-200"
        case "balcony":
          return "bg-green-200"
        default:
          return "bg-gray-200"
      }
    }

    return (
      <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl border-2 border-slate-200 overflow-x-auto">
        <div className="text-center mb-4 sm:mb-6">
          <div className="inline-block bg-gradient-to-r from-slate-800 to-slate-600 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm md:text-base">
            🎭 STAGE 🎭
          </div>
        </div>

        <div
          className="grid gap-1 sm:gap-2 mx-auto justify-center"
          style={{
            gridTemplateColumns: `repeat(${event.columns}, minmax(24px, 1fr))`,
            maxWidth: `${Math.min(event.columns * 45, 800)}px`,
          }}
        >
          {Array.from({ length: event.rows }, (_, rowIndex) => {
            const rowLetter = String.fromCharCode(65 + rowIndex)
            return Array.from({ length: event.columns }, (_, colIndex) => {
              const colNumber = colIndex + 1
              const seatKey = `${rowLetter}-${colNumber}`
              const seat = seatGrid[seatKey]

              return (
                <div
                  key={seatKey}
                  className={`w-full aspect-square border-2 rounded-md text-[9px] sm:text-xs md:text-sm font-bold flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg active:scale-95 ${getSeatColor(
                    seat
                  )} ${
                    seat?.status === "UNAVAILABLE"
                      ? "opacity-40 cursor-not-allowed"
                      : "cursor-pointer hover:border-[#5d33fb]"
                  }`}
                  style={{ minHeight: "24px", minWidth: "24px" }}
                >
                  {seat ? `${rowLetter}${colNumber}` : ""}
                </div>
              )
            })
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 sm:mt-6 flex flex-wrap justify-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-2 bg-slate-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-yellow-200 border border-gray-400"></div>
            <span className="text-xs sm:text-sm font-medium whitespace-nowrap">VIP</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 bg-slate-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-blue-200 border border-gray-400"></div>
            <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Regular</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 bg-slate-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-green-200 border border-gray-400"></div>
            <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Balcony</span>
          </div>
        </div>
      </div>
    )
  }
  // Group selected seats by category
const groupedSeats =
  event?.seats?.reduce((acc: { [key: string]: any[] }, seat: any) => {
    const category = seat.categoryName || "Regular"
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(seat)
    return acc
  }, {}) ?? {}

  const totalAmount =event?.organizerFeeAmount


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 border-b border-purple-200  top-0 z-10">
        <div className="px-6 py-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <div className="h-6 w-px bg-slate-300" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{event?.title}</h1>
                <p className="text-sm text-slate-600 mt-1">Complete your booking</p>
              </div>
            </div>
         
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {paymentStatus === "form" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Event Details & Seat Layout - Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Event Information Card */}
              <div className="overflow-hidden shadow-lg border-0 bg-white/80 backdrop-blur-sm rounded-lg">
                <div className="relative">
                  {event?.imageUrls?.[0] && (
                    <div className="h-48 bg-gradient-to-r from-purple-600 to-blue-600 relative">
                      <img 
                        src={event.imageUrls[0]} 
                        alt={event.title}
                        className="w-full h-full object-cover opacity-90"
                      />
                      <div className="absolute inset-0 bg-black/30"></div>
                      <div className="absolute bottom-4 left-6 text-white">
                        <h2 className="text-2xl font-bold mb-2">{event?.title}</h2>
                        {event?.ratings && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{event.ratings}/5</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="font-medium text-gray-900">{event?.venueName}</p>
                          <p className="text-sm text-gray-600">Venue</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {event?.startDate ? new Date(event.startDate).toLocaleDateString() : 'Date TBA'}
                          </p>
                          <p className="text-sm text-gray-600">Event Date</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {event?.startDate ? new Date(event.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Time TBA'}
                          </p>
                          <p className="text-sm text-gray-600">Start Time</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="font-medium text-gray-900">{event?.capacity || 'TBA'}</p>
                          <p className="text-sm text-gray-600">Total Capacity</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Ticket className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="font-medium text-gray-900">{event?.categoryName || 'General'}</p>
                          <p className="text-sm text-gray-600">Category</p>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-3 rounded-lg">
                        <p className="text-sm text-gray-700 font-medium">Status</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-700 font-semibold">{event?.status || 'Active'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {event?.description && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">About This Event</h4>
                      <p className="text-gray-700 text-sm leading-relaxed">{event.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Seat Layout Card */}
              {event?.seatingType === "SEAT_LAYOUT" && (
                <div className="shadow-lg border-0 bg-white/80 backdrop-blur-sm rounded-lg">
                  <div className="p-6 border-b">
                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                      <Ticket className="w-5 h-5 text-purple-600" />
                      Your Seat Selection
                    </h3>
                  </div>
                  <div className="p-6">
                    {renderSeatLayout()}
                  </div>
                </div>
              )}
            </div>

            {/* Booking Summary & Payment - Right Column */}
            <div className="space-y-6">
              {/* Selected Seats Summary */}
              <div className="shadow-lg border-0 bg-white/80 backdrop-blur-sm rounded-lg">
                {/* <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Booking Summary</h3>
                </div> */}
                <div className="p-6 space-y-4">
                  {Object.entries(groupedSeats).map(([category, seats]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">{category} {(Array.isArray(seats) ? `(${seats.length} seats)` : "")}</span>
                        {/* <span className="text-purple-600 font-bold">
                          ₹{(Array.isArray(seats) && seats[0]?.price ? seats[0].price : 0) * (Array.isArray(seats) ? seats.length : 0)}
                        </span> */}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(seats as any[]).map((seat: any, index: number) => (
                          <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            {seat.row}{seat.number}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total Amount</span>
                      <span className="text-xl font-bold text-purple-600">₹{totalAmount}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      * Including all taxes and fees
                    </p>
                  </div>

                  {/* Security Note */}
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Secure Payment</span>
                    </div>
                    <p className="text-xs text-blue-700">
                      Your payment information is protected with bank-level security
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <div className="shadow-lg border-0 bg-white/80 backdrop-blur-sm rounded-lg">
                <div className="p-6 border-b">
                  <h3 className="flex items-center gap-2 text-lg font-semibold">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                    Payment Details
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {/* Customer Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={userDetails.name}
                        onChange={(e) => setUserDetails({...userDetails, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={userDetails.email}
                        onChange={(e) => setUserDetails({...userDetails, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter your email"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={userDetails.phone}
                        onChange={(e) => setUserDetails({...userDetails, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  {/* Payment Button */}
                  <Button
                    onClick={handlePaymentSuccess}
                    className="w-full "
                  >
                    <Shield className="w-5 h-5" />
                    Pay ₹{event?.organizerFeeAmount} Securely
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    By proceeding, you agree to our Terms & Conditions
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Processing State */}
        {paymentStatus === "processing" && (
          <div className="max-w-md mx-auto shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-lg">
            <div className="p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Payment</h3>
                <p className="text-gray-600">Please wait while we verify your payment...</p>
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-purple-600">
                  <Shield className="w-4 h-4" />
                  <span>Secure transaction in progress</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {paymentStatus === "success" && bookingDetails && (
          <div className="max-w-3xl mx-auto shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-lg">
            <div className="text-center bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg p-8">
              <div className="mx-auto w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold">Booking Confirmed!</h2>
              <p className="text-green-100 mt-2">Your tickets have been booked successfully</p>
            </div>
            <div className="p-8 space-y-8">
              {/* Booking Details */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-4 text-lg">Booking Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600 text-sm">Booking ID:</span>
                      <div className="font-bold text-lg text-purple-600">{bookingDetails.bookingId}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Event:</span>
                      <div className="font-medium text-gray-900">{event?.title}</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600 text-sm">Payment ID:</span>
                      <div className="font-medium text-gray-700">{bookingDetails.paymentId}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Amount Paid:</span>
                      <div className="font-bold text-lg text-green-600">₹{bookingDetails.amount}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticket Details */}
              <div>
                <h4 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-purple-600" />
                  Your Tickets
                </h4>
                <div className="grid gap-3">
                  {bookingDetails.tickets?.map((ticket: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-purple-50 border border-purple-200 rounded-lg shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-600 text-white rounded-lg flex items-center justify-center font-bold">
                          {ticket.seatNumber}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Seat {ticket.seatNumber}</div>
                          <div className="text-sm text-purple-600 font-medium">{ticket.category}</div>
                          <div className="text-xs text-gray-500">Ticket #{ticket.ticketId}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-gray-900">₹{ticket.price}</div>
                        <div className="text-xs text-green-600">✓ Confirmed</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => alert('Tickets will be sent to your email!')} 
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white h-12 text-lg font-medium shadow-lg rounded-lg"
                >
                  Download Tickets
                </button>
                <button 
                  onClick={() => alert('Returning to events')} 
                  className="flex-1 border-2 border-purple-300 text-purple-600 hover:bg-purple-50 h-12 text-lg font-medium rounded-lg"
                >
                  Back to Events
                </button>
              </div>

              {/* Additional Info */}
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <div className="text-center text-sm text-blue-800 space-y-2 font-medium">
                  <p>📧 Tickets have been sent to your email</p>
                  <p>📱 Show your mobile ticket at the venue</p>
                  <p>⏰ Arrive 30 minutes before the event</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {paymentStatus === "failed" && (
          <div className="max-w-md mx-auto shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-lg">
            <div className="p-6 text-center">
              <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
              <p className="text-gray-600 mb-6">There was an issue processing your payment</p>
            </div>
            <div className="p-6 space-y-6">
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setPaymentStatus("form")}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white h-12 rounded-lg"
                >
                  Try Again
                </button>
                <button 
                  onClick={() => alert('Back to seat selection')} 
                  className="w-full border-2 border-gray-300 hover:border-purple-300 h-12 rounded-lg"
                >
                  Back to Seat Selection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}