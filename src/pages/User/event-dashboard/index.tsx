
import  React from "react"

import { useEffect, useMemo, useState } from "react"
import { Calendar, Check, Heart, MapPin, Plus, Search, Star } from "lucide-react"
import type { Event } from "./types"
import { Input } from "../../../components/UI/input"
import { Select } from "../../../components/UI/select"
import { Button } from "../../../components/UI/button"
import axiosInstance from "../../../api/axiosInstance"


interface EventDashboardProps {
  onEventSelect: (event: Event) => void
  initialEvents?: Event[]
}

export function EventDashboard({ onEventSelect, initialEvents = [] }: EventDashboardProps) {
 const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [wishlist, setWishlist] = useState<Set<number>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [cities, setCities] = useState<string[]>([])

  // Load venues (for cities dropdown)
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await axiosInstance.get("/organizer/venues")
        const venues = res.data || []
        const cityList: any = [...new Set(venues.map((v: any) => v.city))]
        setCities(cityList)
      } catch (err) {
        console.error("Failed to fetch venues", err)
      }
    }
    fetchVenues()
  }, [])

  // Fetch events when city changes
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (selectedCity === "all") {
          setEvents(initialEvents)
          setFilteredEvents(initialEvents)
        } else {
          const res = await axiosInstance.get(`/events/city/${selectedCity}`)
          const fetched = res.data || []
          setEvents(fetched)
          setFilteredEvents(fetched)
        }
      } catch (err) {
        console.error("Failed to fetch events", err)
      }
    }
    fetchEvents()
  }, [selectedCity, initialEvents])

  // Categories from events
  const categories = useMemo(() => [...new Set(events.map((e) => e.categoryName))], [events])

  // Filter logic
  useEffect(() => {
    let filtered = events

    if (searchQuery) {
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
    const next = new Set(wishlist)
    next.has(eventId) ? next.delete(eventId) : next.add(eventId)
    setWishlist(next)
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })

  const heroEvent = useMemo(() => {
    if (filteredEvents.length === 0) return undefined
    return [...filteredEvents].sort((a, b) => {
      const ratingDiff = (b.ratings || 0) - (a.ratings || 0)
      if (ratingDiff !== 0) return ratingDiff
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    })[0]
  }, [filteredEvents])

  const eventsByCategory = useMemo(() => {
    const grouped: Record<string, Event[]> = {}

    const newest = [...filteredEvents]
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .slice(0, 10)
    if (newest.length) grouped["New & Upcoming"] = newest

    const popular = [...filteredEvents].sort((a, b) => (b.ratings || 0) - (a.ratings || 0)).slice(0, 10)
    if (popular.length) grouped["Popular Now"] = popular

    categories.forEach((cat) => {
      const catEvents = filteredEvents.filter((e) => e.categoryName === cat).slice(0, 12)
      if (catEvents.length) grouped[cat] = catEvents
    })

    return grouped
  }, [filteredEvents, categories])

  // ✅ Check if filters are active
  const filtersActive = selectedCity !== "all" || selectedCategory !== "all" || searchQuery.trim() !== ""

  return (
    <div className="min-h-screen bg-background">
      {/* Top banner area with subtle accent and tagline */}
      <div className="relative border-border bg-card">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col gap-6">
            {/* <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
                Discover unforgettable entertainment
              </h1>
              <p className="text-muted-foreground">Concerts, comedy, theater, sports—find your next great night out.</p>
            </div> */}

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between z-20">
              <div className="relative w-full md:max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search events, venues, or keywords"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 rounded-full bg-background border-border"
                />
              </div>

              <div className="flex gap-3">
             <Select
              value={selectedCity}
              onChange={(val) => setSelectedCity(val)}
              options={[
                { label: "All Cities", value: "all" },
                ...cities.map((c) => ({ label: c, value: c.toLowerCase() })),
              ]}
              placeholder="Select City"
              className="w-48"
            />

            <Select
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val)}
              options={[
                { label: "All Categories", value: "all" },
                ...categories.map((cat) => ({ label: cat, value: cat })),
              ]}
              placeholder="Select Category"
              className="w-48"
            />

            {(selectedCity !== "all" ||
              selectedCategory !== "all" ||
              searchQuery) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCity("all");
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
              >
                Clear Filters
              </Button>
            )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero section */}
      {!filtersActive && heroEvent && (
        <section className="relative h-[56vh] md:h-[64vh] mx-2">
          <div className="absolute inset-0">
            {heroEvent.imageUrls?.length ? (
              <img
              
                src={`https://spot.app.codevicesolution.in${heroEvent.imageUrls[0]}` || "/placeholder.svg"}
                alt={heroEvent.title}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <div className="w-full h-full bg-muted" />
            )}
            {/* Gradient and glass overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
          </div>

          <div className="relative h-full">
            <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center">
              <div className="backdrop-blur-md bg-background/50 border border-border rounded-xl p-6 md:p-8 max-w-xl">
                <div className="flex items-center gap-2 mb-3">
                  {heroEvent.hasActiveAd && (
                    <span className="text-xs px-2 py-1 rounded-md bg-primary text-primary-foreground">Featured</span>
                  )}
                  <span className="text-xs px-2 py-1 rounded-md bg-card text-muted-foreground border border-border">
                    {heroEvent.categoryName}
                  </span>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">{heroEvent.title}</h2>
                <p className="text-muted-foreground mt-3 line-clamp-3">{heroEvent.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDate(heroEvent.startDate)} · {formatTime(heroEvent.startDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{heroEvent.venueName.split(",")[0]}</span>
                  </div>
                  {heroEvent.ratings > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span>{heroEvent.ratings}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  <Button className="h-12 px-8 text-base" onClick={() => onEventSelect(heroEvent)}>
                    Get Tickets · ${heroEvent.ticketPrice}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 px-4 bg-transparent"
                    onClick={(e) => toggleWishlist(heroEvent.id, e)}
                  >
                    {wishlist.has(heroEvent.id) ? (
                      <Check className="h-5 w-5 mr-2" />
                    ) : (
                      <Plus className="h-5 w-5 mr-2" />
                    )}
                    My List
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Events by Category */}
      <section className=" px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {Object.entries(eventsByCategory).map(([sectionTitle, list]) => (
          <div key={sectionTitle} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-foreground">{sectionTitle}</h3>
            </div>

            <div
              className="flex gap-4 overflow-x-auto pb-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {list.map((event) => (
                <article
                  key={event.id}
                  className="group cursor-pointer flex-shrink-0 w-80"
                  onClick={() => onEventSelect(event)}
                >
                  <div className="rounded-xl border border-border bg-card hover:shadow-lg hover:shadow-primary/10 transition">
                    <div className="relative aspect-video overflow-hidden rounded-t-xl">
                      {event.imageUrls?.length ? (
                        <img
                          src={`https://spot.app.codevicesolution.in${event.imageUrls[0]}` || "/placeholder.svg"}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted" />
                      )}

                      {event.hasActiveAd && (
                        <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md">
                          Featured
                        </div>
                      )}

                      <button
                        onClick={(e) => toggleWishlist(event.id, e)}
                        aria-label="Toggle wishlist"
                        className="absolute top-3 left-3 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        {wishlist.has(event.id) ? (
                          <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                        ) : (
                          <Plus className="h-4 w-4 text-foreground" />
                        )}
                      </button>
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h4 className="font-semibold text-foreground text-pretty line-clamp-2">{event.title}</h4>
                        {event.ratings > 0 && (
                          <div className="flex items-center gap-1 shrink-0">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-medium">{event.ratings}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(event.startDate)} · {formatTime(event.startDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span className="line-clamp-1">{event.venueName}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-foreground">${event.ticketPrice}</div>
                        <Button size="sm">Get Tickets</Button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}

        {filteredEvents.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-foreground mb-2">No events found</h4>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </section>
    </div>
  )
}
