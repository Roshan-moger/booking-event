"use client"

import { useState, useEffect } from "react"
import type { Event } from "./event-dashboard/types"
import { EventDetails } from "./event-details"
import { EventDashboard } from "./event-dashboard"
import axiosInstance from "../../api/axiosInstance"

export default function EventsPage() {
  const [selected, setSelected] = useState<Event | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axiosInstance.get("/events")
      // assuming backend already returns array of events shaped like Event
      setEvents(res.data)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load events")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  return (
    <main className="min-h-screen">
      {/* {loading && <p className="text-center p-4">Loading events...</p>} */}
      {error && <p className="text-red-500 text-center p-4">{error}</p>}

      {!loading && !selected && (
        <EventDashboard initialEvents={events} onEventSelect={(e) => setSelected(e)} />
      )}

      {!loading && selected && (
        <EventDetails event={selected} onBack={() => setSelected(null)} />
      )}
    </main>
  )
}
