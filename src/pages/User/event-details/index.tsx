"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Calendar, MapPin, Share2, Star, Tag, Users } from "lucide-react"
import axiosInstance from "../../../api/axiosInstance"
import { Button } from "../../../components/UI/button"
import { Badge } from "../../../components/UI/badge"
import { Separator } from "../../../components/UI/separator"
import { useNavigate, useParams } from "react-router-dom"

interface Seat {
  status: "AVAILABLE" | "BOOKED" | "BLOCKED"
}

interface Event {
  id: number
  title: string
  description: string
  categoryName: string
  startDate: string
  endDate: string
  venueName: string
  ticketPrice: number
  ratings: number
  imageUrls: string[]
  totalSeats: number
  seats?: Seat[]
  rows?: number
  columns?: number
  seatingType?: string
  capacity?: number
  mode: string
  hasActiveAd?: boolean
}

export default function EventDetailsPage() {
  const navigate = useNavigate()
  const { eventId } = useParams()

  const [event, setEvent] = useState<Event | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axiosInstance.get(`/events/${eventId}`)
        setEvent(res.data)
      } catch (err) {
        console.error("Failed to fetch event", err)
      } finally {
        setLoading(false)
      }
    }

    if (eventId) fetchEvent()
  }, [eventId])

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })

  const totalHours = useMemo(() => {
    if (!event) return 0
    const diff = new Date(event.endDate).getTime() - new Date(event.startDate).getTime()
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60)))
  }, [event])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-blue-50/20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading event details...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-blue-50/20">
        <p className="text-muted-foreground mb-4">Event not found.</p>
        <Button
          className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600"
          onClick={() => navigate("/dashboard")}
        >
          Go Back
        </Button>
      </div>
    )
  }

  const images = event.imageUrls?.length ? event.imageUrls : ["/event-hero.jpg"]
  const availableSeats = event.seats?.filter((s) => s.status === "AVAILABLE").length ?? 0

  const handleBookNow = () => {
    navigate(`/dashboard/ticketbook/${event.id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-50/10">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-blue-100/20 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="hover:bg-blue-50">
            <ArrowLeft className="h-4 w-4 mr-2 text-blue-600" />
            <span className="text-blue-600 font-medium">Back</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="border-blue-200 hover:bg-blue-50 hover:text-blue-600 bg-transparent"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <div className="space-y-4">
              <div className="aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-orange-50 shadow-lg">
                <img
                  src={`https://spot.app.codevicesolution.in${images[activeImage]}` || "/placeholder.svg"}
                  alt={`${event.title} image ${activeImage + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {images.map((src, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`relative aspect-video overflow-hidden rounded-lg border-2 transition-all ${
                        activeImage === idx
                          ? "border-blue-500 shadow-md scale-105"
                          : "border-blue-100 hover:border-blue-300"
                      }`}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <img
                        src={`https://spot.app.codevicesolution.in${src}` || "/placeholder.svg"}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Header + Meta */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <Badge className="bg-gradient-to-r from-blue-100 to-orange-100 text-blue-700 border-blue-200 border">
                    {event.categoryName}
                  </Badge>
                  {event.ratings > 0 && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      <span className="font-semibold text-amber-700">{event.ratings}</span>
                    </div>
                  )}
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent">
                  {event.title}
                </h1>
              </div>

              {/* Key Facts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 rounded-2xl bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-md">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{formatDate(event.startDate)}</p>
                    <p className="text-sm text-slate-600">
                      {formatTime(event.startDate)} – {formatTime(event.endDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{event.venueName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-lg">
                    <Users className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{availableSeats} Available</p>
                    <p className="text-sm text-slate-600">of {event.totalSeats} total seats</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg">
                    <Tag className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">₹{event.ticketPrice}</p>
                    <p className="text-sm text-slate-600">Starting price</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-blue-200 to-transparent" />

            {/* Description */}
            <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-2xl border border-blue-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">About this event</h2>
              <p className="text-slate-700 leading-relaxed text-lg">{event.description}</p>
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-blue-200 to-transparent" />

            {/* Seating Info */}
            {event.rows && event.columns && event.seatingType ? (
              <div className="bg-gradient-to-br from-white to-purple-50 p-6 rounded-2xl border border-purple-100">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Seating information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                    <h3 className="font-semibold text-purple-900 mb-2">Layout</h3>
                    <p className="text-sm text-purple-700">
                      {event.rows} rows × {event.columns} columns
                    </p>
                    <p className="text-sm text-purple-700">{event.seatingType.replace("_", " ")}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200">
                    <h3 className="font-semibold text-indigo-900 mb-2">Capacity</h3>
                    <p className="text-sm text-indigo-700">
                      {event.capacity ? `${event.capacity} maximum capacity` : "Not specified"}
                    </p>
                    <p className="text-sm text-indigo-700">
                      {event.totalSeats ? `${event.totalSeats} total seats` : "Not specified"}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200">
                    <h3 className="font-semibold text-cyan-900 mb-2">Availability</h3>
                    <p className="text-sm text-cyan-700">{availableSeats} seats available</p>
                    <p className="text-sm text-cyan-700">
                      {event.seats?.filter((s) => s.status === "BOOKED").length || 0} booked
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-white via-blue-50 to-orange-50 border border-blue-100 shadow-lg">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent mb-1">
                    ₹{event.ticketPrice}
                  </div>
                  <p className="text-sm text-slate-600 font-medium">Ticket Amount</p>
                </div>

                <Button
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white shadow-md"
                  disabled={availableSeats === 0}
                  onClick={handleBookNow}
                >
                  {availableSeats === 0 ? "Sold Out" : "Book Now"}
                </Button>

                <p className="text-xs text-slate-600 text-center mt-4 font-medium">
                  ✓ Secure checkout · ✓ Free cancellation up to 24h
                </p>
              </div>

              {/* Quick Facts */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-white to-slate-50 border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4 text-lg">Event details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600 font-medium">Mode</span>
                    <span className="text-slate-900 font-semibold">{event.mode.replace("_", " ")}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600 font-medium">Duration</span>
                    <span className="text-slate-900 font-semibold">{totalHours} hours</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600 font-medium">Active Ad</span>
                    <Badge
                      className={
                        event.hasActiveAd
                          ? "bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 border-emerald-200 border"
                          : "bg-slate-200 text-slate-700"
                      }
                    >
                      {event.hasActiveAd ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
