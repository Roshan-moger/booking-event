"use client"

import type React from "react"
import { useState, useMemo, useEffect, useRef } from "react"
import { Calendar, Heart, MapPin, Search, Star, ChevronLeft, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import axiosInstance from "../../../api/axiosInstance"
import { Button } from "../../../components/UI/button"
import { motion, AnimatePresence } from "framer-motion"

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
}

interface EventDashboardProps {
  initialEvents?: Event[]
}

export function EventDashboard({ initialEvents = [] }: EventDashboardProps) {
  const navigate = useNavigate()
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(initialEvents)
  const [wishlist, setWishlist] = useState<Set<number>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [cities, setCities] = useState<string[]>([])
  const [heroIndex, setHeroIndex] = useState(0)
  const scrollContainerRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await axiosInstance.get("/organizer/venues")
        const venues = res.data || []
        const uniqueCities: any = [...new Set(venues.map((v: any) => v.city).filter(Boolean))]
        setCities([uniqueCities])
      } catch (err) {
        console.error("Failed to fetch cities:", err)
      }
    }
    fetchCities()
  }, [])

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (selectedCity === "all") {
          const res = await axiosInstance.get("/events/allpaid")
          const allEvents = res.data || []
          setEvents(allEvents)
          setFilteredEvents(allEvents)
        } else {
          const res = await axiosInstance.get(`/events/paid/city/${selectedCity}`)
          const cityEvents = res.data || []
          setEvents(cityEvents)
          setFilteredEvents(cityEvents)
        }
      } catch (err) {
        console.error("Failed to fetch events:", err)
      }
    }
    fetchEvents()
  }, [selectedCity])

  const categories = useMemo(() => ["all", ...new Set(events.map((e) => e.categoryName).filter(Boolean))], [events])

  useEffect(() => {
    let filtered = [...events]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.venueName.toLowerCase().includes(q),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((e) => e.categoryName === selectedCategory)
    }

    setFilteredEvents(filtered)
  }, [searchQuery, selectedCategory, events])

  const toggleWishlist = (eventId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setWishlist((prev) => {
      const next = new Set(prev)
      next.has(eventId) ? next.delete(eventId) : next.add(eventId)
      return next
    })
  }

  const formatDate = (date: string) => new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })

  const eventsByCategory = useMemo(() => {
    const grouped: Record<string, Event[]> = {}

    const newest = [...filteredEvents]
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .slice(0, 12)
    if (newest.length) grouped["New & Upcoming"] = newest

    const popular = [...filteredEvents].sort((a, b) => (b.ratings || 0) - (a.ratings || 0)).slice(0, 12)
    if (popular.length) grouped["Popular Now"] = popular

    categories
      .filter((cat) => cat !== "all")
      .forEach((cat) => {
        const catEvents = filteredEvents.filter((e) => e.categoryName === cat).slice(0, 12)
        if (catEvents.length) grouped[cat] = catEvents
      })

    return grouped
  }, [filteredEvents, categories])

  const heroEvents = useMemo(() => {
    return [...filteredEvents]
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .slice(0, 5)
  }, [filteredEvents])

  const scroll = (sectionTitle: string, direction: "left" | "right") => {
    const container = scrollContainerRefs.current[sectionTitle]
    if (!container) return

    const scrollAmount = 400
    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" })
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  useEffect(() => {
    if (heroEvents.length === 0) return
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroEvents.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [heroEvents.length])

  const currentHeroEvent = heroEvents[heroIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-50/10 max-w-screen md:max-w-[calc(100vw-276px)]">
      {/* Header */}
      <div className="z-50 bg-white/80 border-b border-blue-100/20 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent">
              Discover Events
            </h1>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border-2 border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                />
              </div>

              {/* City Filter */}
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white border-2 border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
              >
                <option value="all">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white border-2 border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      {currentHeroEvent && (
        <section className="relative w-full h-68 p-1 sm:h-80 lg:h-[500px] overflow-hidden">
          <div className="relative w-full h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentHeroEvent.id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                {currentHeroEvent.imageUrls?.[0] ? (
                  <img
                    src={`https://spot.app.codevicesolution.in${currentHeroEvent.imageUrls[0]}`}
                    className="w-full h-full object-cover  rounded-2xl"
                    alt={currentHeroEvent.title}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-200 via-orange-100 to-amber-50" />
                )}
                {/* <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" /> */}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Hero Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 lg:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentHeroEvent.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="max-w-2xl space-y-3 sm:space-y-4"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-orange-500/20 text-blue-700 text-xs sm:text-sm font-bold border border-blue-300/50 backdrop-blur-sm">
                    {currentHeroEvent.categoryName}
                  </span>
                  {currentHeroEvent.ratings > 0 && (
                    <div className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-amber-200">
                      <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                      <span className="text-sm font-bold text-amber-700">{currentHeroEvent.ratings}</span>
                    </div>
                  )}
                </div>

                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-lg">
                  {currentHeroEvent.title}
                </h2>

                <p className="text-sm sm:text-base text-white/90 drop-shadow line-clamp-2">
                  {currentHeroEvent.description}
                </p>

                <div className="flex flex-col gap-2 pt-2 sm:pt-4">
                  <div className="flex items-center gap-2 text-sm sm:text-base text-white drop-shadow">
                    <Calendar className="h-5 w-5 flex-shrink-0" />
                    <span>
                      {formatDate(currentHeroEvent.startDate)} at {formatTime(currentHeroEvent.startDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm sm:text-base text-white drop-shadow">
                    <MapPin className="h-5 w-5 flex-shrink-0" />
                    <span>{currentHeroEvent.venueName}</span>
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={() => navigate(`/dashboard/event-details/${currentHeroEvent.id}`)}
                     className="w-1/2 py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg group/btn"
                        
                >
                  View Details
                </Button>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Indicators */}
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {heroEvents.map((_: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setHeroIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === heroIndex ? "bg-slate-800 w-8 shadow-lg" : "bg-slate-400 w-2"
                }`}
              />
            ))}
          </div>
        </section>
      )}

      <section className="px-3 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-10">
        {Object.entries(eventsByCategory).map(([sectionTitle, list]) => (
          <div key={sectionTitle} className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent">
                {sectionTitle}
              </h2>
              <span className="text-sm font-semibold px-3 py-1.5 rounded-full bg-blue-100 text-blue-700">
                {list.length}
              </span>
            </div>

            <div className="relative group">
              <div
                ref={(el) => {
                  if (el) scrollContainerRefs.current[sectionTitle] = el
                }}
                className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
                style={{ scrollBehavior: "smooth", scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {list.map((event) => (
                  <div
                    key={event.id}
                    className="group/card flex-shrink-0 w-48 sm:w-72 cursor-pointer"
                    onClick={() => navigate(`/dashboard/event-details/${event.id}`)}
                  >
                    <div className="h-full rounded-2xl border-2 border-blue-100 bg-white overflow-hidden hover:shadow-2xl hover:border-blue-300 transition-all duration-300 flex flex-col transform hover:-translate-y-1">
                      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-blue-100 to-orange-50">
                        {event.imageUrls?.[0] ? (
                          <img
                            src={`https://spot.app.codevicesolution.in${event.imageUrls[0]}`}
                            alt={event.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-200 to-orange-100" />
                        )}

                        <button
                          onClick={(e) => toggleWishlist(event.id, e)}
                          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all shadow-md hover:shadow-lg transform hover:scale-110"
                        >
                          <Heart
                            className={`h-5 w-5 transition-colors ${
                              wishlist.has(event.id)
                                ? "fill-red-500 text-red-500"
                                : "text-slate-400 hover:text-red-500"
                            }`}
                          />
                        </button>

                        {event.ratings > 0 && (
                          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-md">
                            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                            <span className="text-sm font-bold text-amber-700">{event.ratings}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 p-4 flex flex-col gap-2.5">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-100 to-orange-100 text-blue-700 w-fit">
                          {event.categoryName}
                        </span>

                        <h3 className="font-bold text-slate-900 line-clamp-2 text-sm sm:text-base">{event.title}</h3>

                        <div className="space-y-2 text-xs sm:text-sm text-slate-600">
                          <div className="flex items-center gap-2 line-clamp-1">
                            <Calendar className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            <span className="line-clamp-1">
                              {formatDate(event.startDate)} at {formatTime(event.startDate)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 line-clamp-1">
                            <MapPin className="h-4 w-4 text-orange-500 flex-shrink-0" />
                            <span className="line-clamp-1">{event.venueName}</span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/dashboard/event-details/${event.id}`)
                          }}
                             className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg group/btn"
                        
                        >
                          View Event
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => scroll(sectionTitle, "left")}
                className="absolute left-2 sm:left-0 top-1/2 -translate-y-1/2 -translate-x-5 p-2.5 rounded-full bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => scroll(sectionTitle, "right")}
                className="absolute right-2 sm:right-0 top-1/2 -translate-y-1/2 translate-x-5 p-2.5 rounded-full bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}

        {Object.keys(eventsByCategory).length === 0 && (
          <div className="text-center py-16 bg-gradient-to-br from-white to-blue-50 rounded-2xl border-2 border-blue-100">
            <p className="text-slate-600 text-lg font-medium">No events found. Try adjusting your filters.</p>
          </div>
        )}
      </section>
    </div>
  )
}
