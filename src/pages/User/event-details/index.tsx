"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, Calendar, MapPin, Share2, Star, Tag, Users } from "lucide-react"
import type { Event } from "../event-dashboard/types"
import { Button } from "../../../components/UI/button"
import { Badge } from "../../../components/UI/badge"
import { Separator } from "../../../components/UI/separator"


interface EventDetailsProps {
  event: Event
  onBack: () => void
}

export function EventDetails({ event, onBack }: EventDetailsProps) {
  const [activeImage, setActiveImage] = useState(0)

  const images = event.imageUrls?.length ? event.imageUrls : ["/event-hero.jpg"]
  const availableSeats = event.seats?.filter((s) => s.status === "AVAILABLE").length ?? 0

  const totalHours = useMemo(() => {
    const diff = new Date(event.endDate).getTime() - new Date(event.startDate).getTime()
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60)))
  }, [event.endDate, event.startDate])

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })

  const handleBookNow = () => {
    alert("Redirecting to booking...")
    console.log("Booking event:", event.id)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/60 border-b border-border">
        <div className=" px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <div className="space-y-3">
              <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                <img
                
                  src={`https://spot.app.codevicesolution.in${images[activeImage]}` || "/placeholder.svg"}
                  alt={`${event.title} image ${activeImage + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {images.map((src, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`relative aspect-video overflow-hidden rounded-md border ${
                        activeImage === idx ? "border-primary" : "border-border"
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

            {/* Header + meta */}
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{event.categoryName}</Badge>
                    {/* <Badge variant={event.status === "ACTIVE" ? "default" : "secondary"}>{event.status}</Badge> */}
                    {event.ratings > 0 && (
                      <span className="inline-flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-medium">{event.ratings}</span>
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold text-foreground text-balance">{event.title}</h1>
                </div>
              </div>

              {/* Key facts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{formatDate(event.startDate)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(event.startDate)} – {formatTime(event.endDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{event.venueName}</p>
                    {/* {event.venueId && <p className="text-sm text-muted-foreground">Venue ID: {event.venueId}</p>} */}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{availableSeats} Available</p>
                    <p className="text-sm text-muted-foreground">of {event.totalSeats} total seats</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">${event.ticketPrice}</p>
                    <p className="text-sm text-muted-foreground">Starting price</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Highlights */}
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Why you’ll love it</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <li className="rounded-lg border border-border bg-card px-4 py-3">
                  Premium acoustics and immersive atmosphere
                </li>
                <li className="rounded-lg border border-border bg-card px-4 py-3">Great views from every section</li>
                <li className="rounded-lg border border-border bg-card px-4 py-3">Fast, secure mobile entry</li>
                <li className="rounded-lg border border-border bg-card px-4 py-3">Food and drinks available on-site</li>
              </ul>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">About this event</h2>
              <p className="text-muted-foreground leading-relaxed">{event.description}</p>
            </div>

            <Separator />

       {/* Seating info */}
{event.rows && event.columns && event.seatingType ? (
  <div>
    <h2 className="text-xl font-semibold text-foreground mb-4">Seating information</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 rounded-xl border border-border bg-card">
        <h3 className="font-medium text-foreground mb-2">Layout</h3>
        <p className="text-sm text-muted-foreground">
          {event.rows} rows × {event.columns} columns
        </p>
        <p className="text-sm text-muted-foreground">{event.seatingType?.replace("_", " ")}</p>
      </div>
      <div className="p-4 rounded-xl border border-border bg-card">
        <h3 className="font-medium text-foreground mb-2">Capacity</h3>
        <p className="text-sm text-muted-foreground">
          {event.capacity ? `${event.capacity} maximum capacity` : "Not specified"}
        </p>
        <p className="text-sm text-muted-foreground">
          {event.totalSeats ? `${event.totalSeats} total seats` : "Not specified"}
        </p>
      </div>
      <div className="p-4 rounded-xl border border-border bg-card">
        <h3 className="font-medium text-foreground mb-2">Availability</h3>
        <p className="text-sm text-muted-foreground">{availableSeats} seats available</p>
        <p className="text-sm text-muted-foreground">
          {event.seats?.filter((s) => s.status === "BOOKED").length || 0} booked
        </p>
      </div>
    </div>
  </div>
) : (
  <div>
    <h2 className="text-xl font-semibold text-foreground mb-4">Seating information</h2>
    <p className="text-sm text-muted-foreground">Seating layout not available for this event.</p>
  </div>
)}

          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Pricing */}
              <div className="p-6 rounded-xl border border-border bg-card">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-foreground mb-1">${event.ticketPrice}</div>
                  <p className="text-sm text-muted-foreground">per ticket</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Organizer fee</span>
                    <span className="text-foreground">${event.organizerFeeAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fee status</span>
                    <Badge variant={event.organizerFeeStatus === "PAID" ? "default" : "secondary"}>
                      {event.organizerFeeStatus}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${event.ticketPrice + event.organizerFeeAmount}</span>
                  </div>
                </div>

                <Button
                  className="w-full h-12 text-base font-medium"
                  disabled={availableSeats === 0}
                  onClick={handleBookNow}
                >
                  {availableSeats === 0 ? "Sold Out" : "Book Now"}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-3">
                  Secure checkout · Free cancellation up to 24h before
                </p>
              </div>

              {/* Quick facts */}
              <div className="p-6 rounded-xl border border-border bg-card">
                <h3 className="font-semibold text-foreground mb-4">Event details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mode</span>
                    <span className="text-foreground">{event.mode.replace("_", " ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="text-foreground">{totalHours} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Ad</span>
                    <Badge variant={event.hasActiveAd ? "default" : "secondary"}>
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
