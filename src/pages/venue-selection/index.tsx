"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { MapPin, Plus, Calendar, ArrowRight, Building2, Share2, Edit, Trash2, RefreshCw } from "lucide-react"
import axiosInstance from "../../api/axiosInstance"
import Toast from "../../components/UI/toast"
import DeletePopup from "../../components/UI/DeletePopup"

interface Venue {
  id: number
  name: string
  city: string
  state: string
  postalCode: string
  address: string
  shared: boolean
  status: string
}

interface ToastProps {
  isOpen: boolean
  message: string
  type?: "success" | "error" | "info"
}

interface ReapprovalPopupProps {
  open: boolean
  venue: Venue | null
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

const ReapprovalPopup: React.FC<ReapprovalPopupProps> = ({
  open,
  venue,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!open || !venue) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Send for Re-approval
            </h3>
            <p className="text-sm text-slate-600">
              This will submit your venue for review again
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-slate-700">
            Are you sure you want to send <strong>"{venue.name}"</strong> for
            re-approval?
          </p>
          <p className="text-xs text-slate-500 mt-2">
            The venue will be reviewed by our team and you'll be notified once
            approved.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Sending...
              </>
            ) : (
              "Send for Re-approval"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const VenueSelectionPage: React.FC = () => {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [showDelete, setShowDelete] = useState(false)
  const [venueToDelete, setVenueToDelete] = useState<Venue | null>(null)
  const navigate = useNavigate()

  const [venueToReapprove, setVenueToReapprove] = useState<Venue | null>(null)
  const [showReapproveConfirm, setShowReapproveConfirm] = useState(false)
  const [isReapproving, setIsReapproving] = useState(false)
  const [toast, setToast] = useState<ToastProps>({
    isOpen: false,
    type: "success",
    message: "",
  })

  useEffect(() => {
    fetchVenues()
  }, [])

  const fetchVenues = async () => {
    try {
      const response = await axiosInstance.get("/organizer/venues/mine")
      setVenues(response.data)
    } catch (error) {
      console.error("Error fetching venues:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVenueSelect = (venueId: number) => {
    navigate(`event/add/${venueId}`)
  }

  const handleCreateVenue = () => {
    navigate("/venues/add")
  }

  const handleEditVenue = (venueId: number) => {
    navigate(`/venues/edit/${venueId}`)
  }

  const handleDelete = async () => {
    if (!venueToDelete) return
    try {
      const response = await axiosInstance.delete(`/organizer/venues/${venueToDelete.id}`)
      if (response.status === 204) {
        setShowDelete(false)
        setVenueToDelete(null)
        setToast({
          isOpen: true,
          type: "success",
          message: "Venue deleted successfully!",
        })
        fetchVenues()
      }
    } catch (error: any) {
      setToast({
        isOpen: true,
        type: "error",
        message: error?.response?.data?.message || "Failed to delete venue. Please try again.",
      })
    }
  }

  const sendForReapproval = async () => {
    if (!venueToReapprove) return

    setIsReapproving(true)
    try {
      const response = await axiosInstance.put(`/organizer/venues/${venueToReapprove.id}/resubmit`)

      if (response.status === 200) {
        setShowReapproveConfirm(false)
        setVenueToReapprove(null)
        setToast({
          isOpen: true,
          type: "success",
          message: "Venue sent for re-approval successfully!",
        })
        fetchVenues() // Refresh the venues list
      }
    } catch (error: any) {
      setToast({
        isOpen: true,
        type: "error",
        message: error?.response?.data?.message || "Failed to send venue for re-approval. Please try again.",
      })
    } finally {
      setIsReapproving(false)
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "active":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          dot: "bg-emerald-500",
          border: "border-emerald-200",
        }
      case "rejected":
      case "inactive":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          dot: "bg-red-500",
          border: "border-red-200",
        }
      case "pending":
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          dot: "bg-amber-500",
          border: "border-amber-200",
        }
      default:
        return {
          bg: "bg-slate-50",
          text: "text-slate-700",
          dot: "bg-slate-500",
          border: "border-slate-200",
        }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-100 to-orange-100 mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600"></div>
          </div>
          <p className="text-slate-600 text-sm font-medium">Loading your venues...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20">
      <div className="bg-white border-b border-blue-100 top-0 z-10 shadow-sm">
        <div className="px-6 py-4 flex flex-row items-start sm:items-center justify-between gap-4">
          {/* Title Section */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Venues</h1>
            <p className="text-sm text-slate-600 mt-1">
                 Create amazing events at your beautiful venues
            </p>
          </div>

          {/* Venue Filter Dropdown */}
         <button
              onClick={handleCreateVenue}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              New Venue
            </button>
        </div>
      </div>
      <div className="px-6 py-12">
        {venues.length === 0 ? (
          /* Beautiful empty state */
          <div className="flex items-center justify-center py-24">
            <div className="text-center max-w-md">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-orange-100 mb-6">
                <Building2 className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">No Venues Yet</h3>
              <p className="text-slate-600 text-base mb-8">Create your first venue and start hosting amazing events</p>
              <button
                onClick={handleCreateVenue}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Create Your First Venue
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map((venue) => {
                const statusConfig = getStatusConfig(venue.status)
                const status = venue.status?.toLowerCase()

                return (
                  <div
                    key={venue.id}
                    className="group bg-white rounded-2xl overflow-hidden border border-blue-100/50 hover:border-blue-200 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full"
                  >
                    <div className="relative h-40 bg-gradient-to-br from-blue-100 via-orange-50 to-amber-50 flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-blue-200 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-orange-200 blur-3xl"></div>
                      </div>
                      <Building2 className="w-16 h-16 text-blue-300 relative z-10" />

                      <div className="absolute inset-0 p-4 flex justify-between items-start">
                        <div className="flex flex-col gap-2">
                          {venue.shared && (
                            <div className="bg-white/90 backdrop-blur-sm border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm text-blue-700">
                              <Share2 className="w-3 h-3" />
                              SHARED
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 items-end">
                          {status === "pending" && (
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEditVenue(venue.id)
                                }}
                                className="p-2.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white shadow-sm border border-slate-200 transition-all duration-200 hover:scale-110"
                                title="Edit Venue"
                              >
                                <Edit className="w-4 h-4 text-blue-600" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setVenueToDelete(venue)
                                  setShowDelete(true)
                                }}
                                className="p-2.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white shadow-sm border border-slate-200 transition-all duration-200 hover:scale-110"
                                title="Delete Venue"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          )}

                          {status === "rejected" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setVenueToReapprove(venue)
                                setShowReapproveConfirm(true)
                              }}
                              className="px-3 py-2 bg-white/90 backdrop-blur-sm text-blue-700 rounded-lg hover:bg-white transition-all duration-200 flex items-center gap-1.5 text-xs font-semibold shadow-sm border border-blue-200 hover:scale-105"
                              title="Send for Re-approval"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              Re-approve
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <div className="mb-4">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border} gap-2`}
                        >
                          <div className={`w-2.5 h-2.5 rounded-full ${statusConfig.dot}`} />
                          {venue.status?.toUpperCase() || "UNKNOWN"}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {venue.name}
                      </h3>

                      <div className="space-y-3 mb-2 flex-grow">
                        <div className="flex items-start gap-3 text-sm">
                          <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-slate-900">
                              {venue.city}, {venue.state}
                            </div>
                            <div className="text-xs text-slate-500 mt-1 font-semibold">{venue.address}</div>
                            <div className="text-xs text-slate-400 font-semibold">{venue.postalCode}</div>
                          </div>
                        </div>
                      </div>

                      {status === "pending" && (
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                          <p className="text-sm font-semibold text-amber-900">Under Review</p>
                          <p className="text-xs text-amber-700 mt-1">
                            We're reviewing your venue. You'll hear from us soon.
                          </p>
                        </div>
                      )}

                      {status === "rejected" && (
                        <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                          <p className="text-sm font-semibold text-red-900">Needs Revision</p>
                          <p className="text-xs text-red-700 mt-1">Please update and resubmit for approval</p>
                        </div>
                      )}

                      {status === "approved" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleVenueSelect(venue.id)
                          }}
                          className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg group/btn"
                        >
                          <Calendar className="w-4 h-4" />
                          Create Event
                          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Delete & Reapproval Popups + Toast remain same */}
      <DeletePopup
        open={showDelete}
        title="Delete Venue"
        description={
          venueToDelete ? `Are you sure you want to delete "${venueToDelete.name}"? This action cannot be undone.` : ""
        }
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDelete(false)
          setVenueToDelete(null)
        }}
      />

      <ReapprovalPopup
        open={showReapproveConfirm}
        venue={venueToReapprove}
        onConfirm={sendForReapproval}
        onCancel={() => {
          setShowReapproveConfirm(false)
          setVenueToReapprove(null)
        }}
        isLoading={isReapproving}
      />

      <Toast
        isOpen={toast.isOpen}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />
    </div>
  )
}

export default VenueSelectionPage
