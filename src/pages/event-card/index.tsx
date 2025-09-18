"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Calendar, MapPin, Users, Clock, Badge, Pencil, Trash2, ArrowLeft, PlusCircle, IndianRupee, CreditCard, Eye, X } from "lucide-react"
import axiosInstance from "../../api/axiosInstance"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { update_action } from "../../redux/action"
import { Button } from "../../components/UI/button"
import Toast from "../../components/UI/toast"
import DeletePopup from "../../components/UI/DeletePopup"

interface Seat {
  row: string
  number: number
  categoryId: string
  categoryName: string
  price: number
  status: "AVAILABLE" | "BOOKED"
}

interface Event {
  id: number
  title: string
  description: string
  categoryName: string
  venueName: string
  venueId: number
  startDate: string
  endDate: string
  ratings: number
  // status: "active" | "upcoming" | "completed" | "cancelled"
  capacity: number
  ticketPrice: number
  seatingType: "SEAT_LAYOUT" | "GENERAL_ADMISSION"
  totalSeats: number
  rows: number
  columns: number
  seats: Seat[]
  mode: "WITH_TICKETING" | "WITHOUT_TICKETING"
  organizerFeeAmount: number
  organizerFeeStatus: "PAID" | "DUE"
  status: "PENDING" | "APPROVED" | "REJECTED"
  imageUrls: string[]
  hasActiveAd: boolean
}

interface EventCardProps {
  event: Event
  onEdit: (event: Event) => void
  onDelete: (event: Event) => void
  onPayment: (event: Event) => void
}

interface ToastProps {
  isOpen: boolean
  message: string
  type?: "success" | "error" | "info"
}

interface EventPreviewProps {
  isOpen: boolean
  onClose: () => void
  event: Event | null
  onPayment: (event: Event) => void
}


const EventCard: React.FC<EventCardProps> = ({ event, onEdit, onDelete, onPayment }) => {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })

  const getApprovalStatusConfig = (status: Event["status"]) => {
    switch (status) {
      case "APPROVED":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          dot: "bg-emerald-500",
        }
      case "PENDING":
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          dot: "bg-amber-500",
        }
      case "REJECTED":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          dot: "bg-red-500",
        }
      default:
        return {
          bg: "bg-slate-50",
          text: "text-slate-700",
          dot: "bg-slate-500",
        }
    }
  }

  const availableSeats = event.seats?.filter((seat) => seat.status === "AVAILABLE").length || 0
  // const statusConfig = getStatusConfig(event.status)
  const approvalConfig = getApprovalStatusConfig(event.status)

  // Only show payment button if approved and payment due
  // const showPaymentButton = event.status === "APPROVED" && event.organizerFeeStatus === "DUE"
const  showPaymentButton= true;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-200 group">
      {/* Image Section */}
      <div className="relative h-48 bg-slate-100">
        {event.imageUrls.length > 0 ? (
          <img
            src={event.imageUrls[0]}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <Calendar className="w-12 h-12 text-slate-400" />
          </div>
        )}

        {/* Overlay for badges */}
        <div className="absolute inset-0 p-4 flex justify-between items-start">
          <div className="flex flex-col gap-2">
            {/* Approval Status Badge */}
            <div
              className={`${approvalConfig.bg} ${approvalConfig.text} px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm border border-white/20`}
            >
              <div className={`w-2 h-2 rounded-full ${approvalConfig.dot}`} />
              {event.status}
            </div>
          </div>

          {/* Promoted Badge */}
          {event.hasActiveAd && (
            <div className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm">
              <Badge className="w-3 h-3" />
              PROMOTED
            </div>
          )}
        </div>

        {/* Bottom overlay with price and seats */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          {event.seatingType === "SEAT_LAYOUT" && (
            <div className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm border border-white/20">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-slate-700">{availableSeats} available</span>
            </div>
          )}
          <div className="bg-slate-900 text-white px-4 py-2 rounded-lg flex text-sm font-bold shadow-sm">
            ₹{event.ticketPrice || "0"}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Category */}
        <div className="mb-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
            {event.categoryName}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {event.title}
        </h3>

        {/* Description */}
        <p className="text-slate-600 text-sm mb-4 line-clamp-2">{event.description}</p>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>{formatDate(event.startDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>
              {formatTime(event.startDate)} - {formatTime(event.endDate)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="truncate">{event.venueName}</span>
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
          <div
            className={`flex items-center gap-1 ${
              event.organizerFeeStatus === "PAID" ? "text-emerald-600" : "text-amber-600"
            }`}
          >
            <IndianRupee className="w-3 h-3" />
            <span className="font-medium">Fee {event.organizerFeeStatus.toLowerCase()}</span>
          </div>
          {event.seatingType === "SEAT_LAYOUT" && (
            <span className="text-slate-500">
              {event.rows}×{event.columns} seats
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 space-y-2">
        {/* Payment Button - Show only if approved and payment due */}
 

        {/* Edit/Delete Buttons - Always show regardless of approval status */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(event)}
            className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2.5 rounded-lg transition-colors border border-indigo-100"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => onDelete(event)}
            className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-lg transition-colors border border-red-100"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>

        {/* Status Message for Pending Events (optional informational message) */}
        {/* {event.status === "PENDING" && (
          <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-700 font-medium">Event pending approval</p>
            <p className="text-xs text-amber-600 mt-1">You can still edit or delete this event</p>
          </div>
        )} */}

               {showPaymentButton && (
          <Button
            onClick={() => onPayment(event)}
     className="w-full"
          >
            <CreditCard className="w-4 h-4" />
            Pay Organizer Fee (₹{event.organizerFeeAmount})
          </Button>
        )}
      </div>
    </div>
  )
}

const EventCards: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [showPreview, setShowPreview] = useState<boolean>(false)
  const [previewEvent, setPreviewEvent] = useState<Event | null>(null)
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [showDelete, setShowDelete] = useState<boolean>(false)
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)

  const [toast, setToast] = useState<ToastProps>({
    isOpen: false,
    type: "success",
    message: "",
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const res = await axiosInstance.get("/organizer/events")
      const data: Event[] = res.data.map((item: any) => ({
        ...item,
        imageUrls: item.imageUrls || [],
        status: item.status || "PENDING", // Default value if not provided
      }))
      setEvents(data)
    } catch (err) {
      console.error("Failed to fetch events", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!eventToDelete) return
    try {
      const response = await axiosInstance.delete(`/organizer/events/${eventToDelete.id}`)
      if (response.status === 204) {
        setShowDelete(false)
        setEventToDelete(null)
        setToast({
          isOpen: true,
          type: "success",
          message: "Event deleted successfully!",
        })
        fetchEvents()
      }
    } catch (error: any) {
      setToast({
        isOpen: true,
        type: "error",
        message: error?.response?.data?.message || "Something went wrong!",
      })
    }
  }

  const handleEdit = (eventData: Event) => {
    dispatch(update_action("edit"))
    navigate(`/event/edit/${eventData.id}`)
  }

  const handleCreateEvent = () => {
    dispatch(update_action("create"))
    navigate("/event/create")
  }

  const handlePayment = async (eventData: Event) => {
  navigate(`/payment/evnet/${eventData.id}`)
  }

  return (
    <div className="bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 top-0 z-10">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/my-events")}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <div className="h-6 w-px bg-slate-300" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">My Events</h1>
                <p className="text-sm text-slate-600 mt-1">Manage and track your events</p>
              </div>
            </div>
            <Button
              onClick={handleCreateEvent}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <PlusCircle className="w-5 h-5" />
              Create Event
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8">
        {events.length > 0 ? (
          <>
            {/* Stats */}
            <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="text-2xl font-bold text-slate-900">{events.length}</div>
                <div className="text-sm text-slate-600">Total Events</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="text-2xl font-bold text-emerald-600">
                  {events.filter((e) => e.status === "APPROVED").length}
                </div>
                <div className="text-sm text-slate-600">Active</div>
              </div>
          
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="text-2xl font-bold text-amber-600">
                  {events.filter((e) => e.status === "PENDING").length}
                </div>
                <div className="text-sm text-slate-600">Pending</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="text-2xl font-bold text-red-600">
                  {events.filter((e) => e.organizerFeeStatus === "DUE").length}
                </div>
                <div className="text-sm text-slate-600">Payment Due</div>
              </div>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onEdit={handleEdit}
                  onDelete={(ev) => {
                    setEventToDelete(ev)
                    setShowDelete(true)
                  }}
                  onPayment={handlePayment}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl border border-slate-200 p-12 max-w-md mx-auto">
              <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-6" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No events yet</h3>
              <p className="text-slate-600 text-sm mb-6">Start by creating your first event to engage your audience.</p>
              <button
                onClick={handleCreateEvent}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-sm transition-all duration-200 mx-auto"
              >
                <PlusCircle className="w-5 h-5" />
                Create Your First Event
              </button>
            </div>
          </div>
        )}
      </div>


      {/* Loading Preview */}
      {loadingPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-slate-600 text-sm">Loading event details...</p>
          </div>
        </div>
      )}

      {/* Toast */}
      <Toast
        isOpen={toast.isOpen}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />

      {/* Delete Confirmation */}
      {showDelete && eventToDelete && (
        <DeletePopup
          open={showDelete}
          title="Delete Event"
          description={`Are you sure you want to delete "${eventToDelete.title}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => {
            setShowDelete(false)
            setEventToDelete(null)
          }}
        />
      )}
    </div>
  )
}

export default EventCards