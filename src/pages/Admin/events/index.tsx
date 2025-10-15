import { useState, useEffect } from "react"
import {
  Check,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  IndianRupee,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"
import axiosInstance from "../../../api/axiosInstance"
import Toast from "../../../components/UI/toast"
import Textarea from "../../../components/UI/textarea"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import type { InitialReduxStateProps } from "../../../redux/redux.props"

// Types
interface Event {
  id: number
  title: string
  categoryName: string
  venueName: string
  startDate: string
  ticketPrice: number | null
  organizerFeeStatus: "PAID" | "DUE" | "WAIVED"
  status: "PENDING" | "APPROVED" | "REJECTED"
}

interface EventDetail {
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
  seatingType: "SEAT_LAYOUT" | "GENERAL" | string
  totalSeats: number
  rows: number
  columns: number
  seats: Array<{
    row: string
    number: number
    categoryId: string
    categoryName: string
    price: number
    status: "AVAILABLE" | "BOOKED" | string
  }>
  mode: "WITH_TICKETING" | "WITHOUT_TICKETING" | string
  organizerFeeAmount: number
  organizerFeeStatus: "PAID" | "DUE" | "WAIVED" | string
  imageUrls: string[]
  hasActiveAd: boolean
  remarks: string
}

const EventManagementTable = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING")
  const [itemsPerPage] = useState(5)
  const navigate = useNavigate()

  const [toast, setToast] = useState({
    isOpen: false,
    type: "success" as "success" | "error",
    message: "",
  })

  const role = useSelector((state: InitialReduxStateProps) => state.tokenInfo.roles[0])

  // View modal state
  const [viewModal, setViewModal] = useState<{
    isOpen: boolean
    eventId: number | null
    loading: boolean
    data: EventDetail | null
    error: string | null
  }>({
    isOpen: false,
    eventId: null,
    loading: false,
    data: null,
    error: null,
  })

  // Reject modal state
  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    eventId: 0,
    remarks: "",
  })

  useEffect(() => {
    if (role.toLocaleLowerCase() !== "admin") {
      navigate("/notfound") // redirect if not admin
    }
  }, [role, navigate])

  useEffect(() => {
    if (role.toLocaleLowerCase() === "admin") {
      loadEvents()
    }
  }, [role])

  const loadEvents = async () => {
    setLoading(true)
    try {
      const res = await axiosInstance.get<Event[]>("/organizer/events")
      setEvents(res.data)
    } catch (err) {
      console.error("Failed to fetch events", err)
      // setToast({
      //   isOpen: true,
      //   type: "error",
      //   message: "Failed to load events",
      // })
    } finally {
      setLoading(false)
    }
  }

  // Filter events
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      searchTerm === "" ||
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venueName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.status.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "ALL" || event.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page: number) => setCurrentPage(page)

  const handleApprove = async (eventId: number) => {
    try {
      setLoading(true)
      await axiosInstance.put(`/admin/events/${eventId}/approve`).then((res) => {
        if ([200, 201, 202, 203].includes(res.status)) {
          setEvents((prev) => prev.map((event) => (event.id === eventId ? { ...event, status: "APPROVED" } : event)))
          setToast({
            isOpen: true,
            type: "success",
            message: "Event approved successfully!",
          })
          loadEvents()
        }
      })
    } catch (err) {
      console.log(err)
      setToast({
        isOpen: true,
        type: "error",
        message: "Something went wrong!",
      })
    } finally {
      setLoading(false)
    }
  }

  // Confirm Reject with API call
  const confirmReject = async () => {
    try {
      setLoading(true)
      await axiosInstance.put(`/admin/events/${rejectModal.eventId}/reject?remarks=${rejectModal.remarks}`)
      setEvents((prev) =>
        prev.map((event) => (event.id === rejectModal.eventId ? { ...event, status: "REJECTED" } : event)),
      )
      setToast({
        isOpen: true,
        type: "success",
        message: "Event rejected successfully!",
      })
      setRejectModal({ isOpen: false, eventId: 0, remarks: "" })
      loadEvents()
    } catch (err) {
      console.log(err)
      setToast({
        isOpen: true,
        type: "error",
        message: "Something went wrong!",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handlers to open/close modal and fetch event details
  const openViewModal = async (id: number) => {
    setViewModal({ isOpen: true, eventId: id, loading: true, data: null, error: null })
    try {
      console.log("[v0] Fetching event details for:", id)
      const res = await axiosInstance.get<EventDetail>(`/organizer/events/${id}`)
      setViewModal((prev) => ({ ...prev, loading: false, data: res.data }))
    } catch (err) {
      console.log("[v0] Failed to load event details:", err)
      setViewModal((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to load event details. Please try again.",
      }))
    }
  }

  const closeViewModal = () => {
    setViewModal({ isOpen: false, eventId: null, loading: false, data: null, error: null })
  }

  const openRejectModal = (id: number) => {
    setRejectModal({ isOpen: true, eventId: id, remarks: "" })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; border: string; icon: any }> = {
      PENDING: {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        icon: Clock,
      },
      APPROVED: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        icon: CheckCircle,
      },
      REJECTED: {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        icon: XCircle,
      },
    }
    const config = statusConfig[status.toUpperCase()] || statusConfig.PENDING
    const IconComponent = config.icon
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border gap-1.5 ${config.bg} ${config.text} ${config.border}`}
      >
        <IconComponent className="w-3 h-3" />
        {status.toUpperCase()}
      </span>
    )
  }

  const getPaymentStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; border: string }> = {
      PAID: {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
      },
      DUE: {
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        border: "border-yellow-200",
      },
      WAIVED: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
      },
    }
    const statusConfig = config[status] || config.DUE
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
      >
        {status}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCurrency = (amount: number | null) => {
    if (amount == null) return "N/A"
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  return (
    <div className="bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6 py-6">
          <div className="flex items-center gap-4">
            {/* <button
              onClick={() => navigate("/manage/venues")}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button> */}
            {/* <div className="h-6 w-px bg-slate-300" /> */}
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Event Management</h1>
              <p className="text-sm text-slate-600 mt-1">Review and manage event approvals</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {/* Search Header */}
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search venues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm w-64"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as "ALL" | "PENDING" | "APPROVED" | "REJECTED")}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          {/* Table */}
          <div className="relative">
            <div className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-4 w-[10%] text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Event ID
                    </th>
                    <th className="px-6 py-4 w-[15%] text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Title / Category
                    </th>
                    <th className="px-6 py-4 w-[15%] text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Payment Status
                    </th>
                    <th className="px-6 py-4 w-[10%] text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Ticket Price
                    </th>
                    <th className="px-6 py-4 w-[20%] text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Event Date / Venue
                    </th>
                    <th className="px-6 py-4 w-[10%] text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 w-[20%] text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
              </table>
            </div>

            {/* Scrollable Body */}
            <div className="h-80 overflow-y-auto">
              <table className="w-full">
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                          <span className="ml-3">Loading events...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedEvents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                        <p className="text-lg font-medium mb-2">No events found</p>
                        <p className="text-sm">Try adjusting your search</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedEvents.map((event) => (
                      <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-2 text-sm font-medium text-slate-900 w-[10%]">#{event.id}</td>
                        <td className="px-6 py-2 w-[15%]">
                          <div>
                            <div className="text-sm font-medium text-slate-900">{event.title}</div>
                            <div className="text-xs text-slate-500 mt-1">{event.categoryName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-2 w-[15%]">{getPaymentStatusBadge(event.organizerFeeStatus)}</td>
                        <td className="px-6 py-2 text-sm text-slate-900 w-[10%]">
                          <div className="flex items-center gap-1">
                            <IndianRupee className="w-4 h-4 text-green-500" />
                            {formatCurrency(event.ticketPrice)}
                          </div>
                        </td>
                        <td className="px-6 py-2 text-sm text-slate-600 w-[20%]">
                          <div>
                            <div>{formatDate(event.startDate)}</div>
                            <div className="text-xs text-slate-500 mt-1">{event.venueName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-2 w-[10%]">{getStatusBadge(event.status)}</td>
                        <td className="px-6 py-2 w-[20%]">
                          <div className="flex items-center justify-center gap-2">
                            {event.status === "PENDING" ? (
                              <>
                                <button
                                  onClick={() => handleApprove(event.id)}
                                  disabled={loading}
                                  className="flex items-center gap-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Check className="w-4 h-4" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => openRejectModal(event.id)}
                                  disabled={loading}
                                  className="flex items-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <X className="w-4 h-4" />
                                  Reject
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => openViewModal(event.id)}
                                className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium rounded-lg transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}

          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredEvents.length)} of{" "}
                {filteredEvents.length} results
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) pageNum = i + 1
                    else if (currentPage <= 3) pageNum = i + 1
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
                    else pageNum = currentPage - 2 + i

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 text-sm font-medium rounded-lg ${
                          currentPage === pageNum
                            ? "bg-indigo-600 text-white"
                            : "text-slate-600 bg-white border border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Event Modal */}
      {viewModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/30"  />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Event Details</h3>
              <button onClick={closeViewModal} aria-label="Close" className="text-slate-500 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {viewModal.loading ? (
                <div className="flex items-center justify-center py-12 text-slate-600">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mr-3" />
                  Loading event...
                </div>
              ) : viewModal.error ? (
                <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm">
                  {viewModal.error}
                </div>
              ) : viewModal.data ? (
                <div className="space-y-6">
                  {/* Image (if available) */}
                  {viewModal.data.imageUrls?.length > 0 && (
                    <img
                      src={ `https://spot.app.codevicesolution.in${viewModal.data.imageUrls[0]}` || "/placeholder.svg"}
                      alt={viewModal.data.title}
                      className="w-full h-48 object-cover rounded-lg border border-slate-200"
                    />
                  )}

                  <div className="space-y-1">
                    <h4 className="text-xl font-bold text-slate-900">{viewModal.data.title}</h4>
                    <p className="text-sm text-slate-600">{viewModal.data.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-slate-500">Category: </span>
                        <span className="font-medium text-slate-800">{viewModal.data.categoryName}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-500">Venue: </span>
                        <span className="font-medium text-slate-800">{viewModal.data.venueName}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-500">Dates: </span>
                        <span className="font-medium text-slate-800">
                          {formatDate(viewModal.data.startDate)} – {formatDate(viewModal.data.endDate)}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-500">Status: </span>
                        <span className="font-medium">{viewModal.data.status}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-slate-500">Ticket Price: </span>
                        <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                          <IndianRupee className="w-4 h-4 text-green-500" />
                          {formatCurrency(viewModal.data.ticketPrice ?? null)}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-500">Capacity: </span>
                        <span className="font-medium text-slate-800">{viewModal.data.capacity}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-500">Seating: </span>
                        <span className="font-medium text-slate-800">
                          {viewModal.data.seatingType} ({viewModal.data.totalSeats} seats)
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-500">Mode: </span>
                        <span className="font-medium text-slate-800">{viewModal.data.mode}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-500">Organizer Fee: </span>
                        <span className="font-medium text-slate-800">
                          {viewModal.data.organizerFeeStatus} —{" "}
                          {formatCurrency(viewModal.data.organizerFeeAmount ?? null)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-slate-600">
                    <span className="text-slate-500">Ratings: </span>
                    <span className="font-medium text-slate-800">{viewModal.data.ratings}</span>
                  </div>

                  {Array.isArray(viewModal.data.seats) && viewModal.data.seats.length > 0 && (
                    <div className="text-xs text-slate-500">
                      Showing {viewModal.data.seats.length} seat entries (not listed individually)
                    </div>
                  )}

                  {viewModal.data.remarks && (
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                      <span className="font-medium">Remarks: </span>
                      {viewModal.data.remarks}
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={closeViewModal}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl transform transition-all duration-300 ease-out scale-100">
            {/* Header with icon */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Reject Event</h2>
                <p className="text-sm text-gray-500">Please provide a reason for rejection</p>
              </div>
            </div>

            {/* Textarea */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Remarks *</label>
              <Textarea
                value={rejectModal.remarks}
                onChange={(e) => setRejectModal({ ...rejectModal, remarks: e.target.value })}
                placeholder="Please explain why this event is being rejected (e.g., inappropriate content, policy violations, scheduling conflicts)..."
                className="w-full border-2 border-gray-200 rounded-xl p-4 text-sm transition-colors resize-none"
                rows={4}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-400">{rejectModal.remarks.length}/500 characters</span>
                {!rejectModal.remarks.trim() && <span className="text-xs text-red-500">Remarks are required</span>}
              </div>
            </div>

            {/* Warning message */}
            <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <div>
                  <p className="text-xs font-medium text-amber-800">Important Notice</p>
                  <p className="text-xs text-amber-700">
                    The event organizer will be notified of the rejection and your remarks.
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setRejectModal({ isOpen: false, eventId: 0, remarks: "" })}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectModal.remarks.trim()}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 shadow-lg disabled:shadow-none flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject Event
              </button>
            </div>
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
    </div>
  )
}

export default EventManagementTable
