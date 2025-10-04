"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { Search, Locate, Check, X, MapPin, ArrowLeft } from "lucide-react"
import axios from "axios"
import { useNavigate, useParams } from "react-router-dom"
import axiosInstance from "../../api/axiosInstance"
import { Button } from "../../components/UI/button"
import { Input } from "../../components/UI/input"
import { MapControls } from "../../helpers"
import Label from "../../components/UI/label"
import Toast from "../../components/UI/toast"


interface VenueFormData {
  name: string
  address: string
  city: string
  state: string
  postalCode: string
  latitude: number | null
  longitude: number | null
  shared: boolean
}

interface ToastProps {
  isOpen: boolean
  message: string
  type?: "success" | "error" | "info"
}

interface LocationSuggestion {
  display_name: string
  lat: string
  lon: string
  place_id: string
  type: string
  importance: number
}

const VenueCreatorPage = () => {
  const navigate = useNavigate()
    const { action, venueId } = useParams()
  
  const searchInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState<VenueFormData>({
    name: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    latitude: 12.2958, // Mysore default
    longitude: 76.6394,
    shared: true,
  })

  const [searchQuery, setSearchQuery] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  const [toast, setToast] = useState<ToastProps>({
    isOpen: false,
    type: "success",
    message: "",
  })

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
   
  }, [])


   useEffect(() => {
    if (action === "edit" && venueId) {
      const fetchVenue = async () => {
        try {
          const res = await axiosInstance.get(`/organizer/venues/getbyid/${venueId}`)
          if (res.status === 200) {
            setFormData(res.data)
                  console.log(res.data)

          }
        } catch (error: any) {
          console.error("Error fetching venue:", error)
          // setToast({
          //   isOpen: true,
          //   type: "error",
          //   message: error?.response?.data?.message || "Failed to load venue",
          // })
        }
      }
      fetchVenue()

    }
  }, [action, venueId])

  // ✅ Create / Update venue
  const handleSubmitVenue = async () => {
    if (!formData.name || !formData.address || !formData.city) {
      setToast({
        isOpen: true,
        type: "error",
        message: "Please fill in Venue Name, Address, and City",
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (action === "edit" && venueId) {
        const res = await axiosInstance.put(`/organizer/venues/${venueId}`, formData)
        if (res.status === 200) {
          setToast({
            isOpen: true,
            type: "success",
            message: "Venue updated successfully!",
          })
          setTimeout(()=>{
          navigate(-1)

          },1000)
        }
      } else {
        const res = await axiosInstance.post("/organizer/venues/mine", formData)
        if (res.status === 200) {
          setToast({
            isOpen: true,
            type: "success",
            message: "Venue created successfully!",
          })
          navigate("/venues")
          
        }
      }
    } catch (error: any) {
      console.error("Error saving venue:", error)
      setToast({
        isOpen: true,
        type: "error",
        message: error?.response?.data?.message || "Failed to save venue",
      })
    }
    setIsSubmitting(false)
  }

  // ✅ Handle reverse geocoding after selecting a point
  const fetchAddressFromCoords = async (lat: number, lng: number) => {
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      )
      const data = res.data

      setFormData((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        address: data.display_name || "",
        state: data.address?.state || "",
        postalCode: data.address?.postcode || "",
        city: data.address?.city || data.address?.town || data.address?.village || "",
      }))

      setToast({
        isOpen: true,
        type: "success",
        message: "Location selected successfully!",
      })
    } catch (error) {
      console.error("Reverse geocoding error:", error)
      setToast({
        isOpen: true,
        type: "error",
        message: "Unable to fetch address, please try again.",
      })
    }
  }

  // ✅ Map Click Handler
  const LocationMarker = () => {
    useMapEvents({
      click(e: any) {
        fetchAddressFromCoords(e.latlng.lat, e.latlng.lng)
      },
    })
    return formData.latitude && formData.longitude ? (
      <Marker position={[formData.latitude, formData.longitude]} />
    ) : null
  }

  // ✅ Fetch location suggestions
  const fetchSuggestions = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsSearching(true)
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query,
        )}&limit=15&addressdetails=1&extratags=1&namedetails=1`,
      )

      setSuggestions(res.data || [])
      setShowSuggestions(res.data && res.data.length > 0)
      setSelectedSuggestionIndex(-1)
    } catch (error) {
      console.error("Suggestions fetch error:", error)
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setIsSearching(false)
    }
  }

  // ✅ Handle search input change with debouncing
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)

    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    const timeout = setTimeout(() => {
      fetchSuggestions(value)
    }, 200)

    setSearchTimeout(timeout)
  }

  // ✅ Handle suggestion selection
  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
    const lat = Number(suggestion.lat)
    const lng = Number(suggestion.lon)

    setSearchQuery(suggestion.display_name)
    setShowSuggestions(false)
    setSuggestions([])
    setSelectedSuggestionIndex(-1)

    fetchAddressFromCoords(lat, lng)
  }

  // ✅ Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedSuggestionIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedSuggestionIndex])
        } else if (suggestions.length > 0) {
          handleSuggestionSelect(suggestions[0])
        }
        break
      case "Escape":
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        break
    }
  }

  // ✅ Search for a location (fallback for direct search)
  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    if (suggestions.length > 0) {
      handleSuggestionSelect(suggestions[0])
      return
    }

    setIsSearching(true)
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery,
        )}&limit=1&addressdetails=1`,
      )
      const data = res.data

      if (data && data.length > 0) {
        const lat = Number(data[0].lat)
        const lng = Number(data[0].lon)
        fetchAddressFromCoords(lat, lng)
      } else {
        setToast({
          isOpen: true,
          type: "error",
          message: "Location not found. Try another search.",
        })
      }
    } catch (error) {
      console.error("Search error:", error)
      setToast({
        isOpen: true,
        type: "error",
        message: "Search failed, please try again.",
      })
    } finally {
      setIsSearching(false)
    }
  }

  // ✅ Get user's current location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setToast({
        isOpen: true,
        type: "error",
        message: "Geolocation is not supported by your browser",
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchAddressFromCoords(pos.coords.latitude, pos.coords.longitude)
      },
      () => {
        setToast({
          isOpen: true,
          type: "error",
          message: "Unable to fetch your location. Please allow location access.",
        })
      },
    )
  }

  // ✅ Clear search
  const clearSearch = () => {
    setSearchQuery("")
    setSuggestions([])
    setShowSuggestions(false)
    setSelectedSuggestionIndex(-1)
  }

  // ✅ Navigate to venue page
  const handleGoToVenuePage = () => {
    navigate("/venues")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-x-hidden p-4">
      <div className="w-full max-w-none px-4 md:px-6 lg:px-8">
        {/* Header with Go to Venue Page Button */}
        <div className="flex items-center justify-between mb-6">
<h1 className="text-2xl md:text-3xl font-bold text-slate-800">
  {action === "edit" ? "Edit Venue" : "Create New Venue"}
</h1>
          
          {/* Go to Venue Page Button with Tooltip */}
          <div className="relative group">
            <Button
              onClick={handleGoToVenuePage}
              variant="outline"
              className="px-3 md:px-4 h-10 border-2 border-slate-300 hover:border-[#5d33fb] bg-white hover:bg-slate-50 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Go to Venues</span>
            </Button>
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
              <div className="bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                Go to Venue Page
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="relative mb-4">
          <div className="flex gap-2 w-full">
            <div className="relative flex-1 min-w-0">
              <Input
                ref={searchInputRef}
                placeholder="Search for any city, address, or landmark worldwide..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                className="w-full h-12 text-sm md:text-lg border-2 border-slate-200 focus:border-[#5d33fb] rounded-xl transition-all duration-200 pr-10"
              />

              {searchQuery && (
                <Button
                  onClick={clearSearch}
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-100"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </Button>
              )}

              {/* Suggestions Dropdown - Fixed z-index issue */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 z-[9999] mt-1 bg-white border-2 border-slate-200 rounded-xl shadow-xl max-h-80 overflow-y-auto"
                  style={{ zIndex: 9999 }}
                >
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={suggestion.place_id}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className={`flex items-start gap-3 p-3 cursor-pointer transition-colors duration-150 ${
                        index === selectedSuggestionIndex
                          ? "bg-[#5d33fb]/10 border-l-4 border-[#5d33fb]"
                          : "hover:bg-slate-50"
                      } ${index !== suggestions.length - 1 ? "border-b border-slate-100" : ""}`}
                    >
                      <MapPin className="h-4 w-4 text-[#5d33fb] mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {suggestion.display_name.split(",").slice(0, 2).join(", ")}
                        </p>
                        <p className="text-xs text-slate-500 truncate mt-1">{suggestion.display_name}</p>
                        {suggestion.type && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full">
                            {suggestion.type.replace("_", " ")}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Search Button with Tooltip */}
            <div className="relative group flex-shrink-0">
              <Button
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-[#5d33fb] hover:bg-[#4c2bd9] text-white px-3 md:px-6 h-12"
              >
                {isSearching ? "..." : <Search className="h-4 w-4" />}
              </Button>
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                <div className="bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Search Location
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                </div>
              </div>
            </div>

            {/* Current Location Button with Tooltip */}
            <div className="relative group flex-shrink-0">
              <Button
                onClick={handleGetCurrentLocation}
                variant="outline"
                className="px-3 md:px-6 h-12 border-2 border-slate-300 hover:border-[#5d33fb] bg-transparent"
              >
                <Locate className="h-4 w-4" />
              </Button>
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                <div className="bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Use Current Location
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading indicator */}
          {isSearching && (
            <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-white border border-slate-200 rounded-lg shadow-sm z-40">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#5d33fb] border-t-transparent"></div>
                Searching locations worldwide...
              </div>
            </div>
          )}
        </div>

        {/* Map Section - Fixed to prevent horizontal scroll */}
        <div className="h-64 md:h-96 rounded-xl overflow-hidden border-2 border-slate-200 mb-6 w-full">
          <MapContainer
            center={[formData.latitude || 12.2958, formData.longitude || 76.6394]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom
            dragging
            touchZoom
            doubleClickZoom
            zoomControl
          >
            {/* Map tiles */}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            {/* Location marker and click handler */}
            <LocationMarker />

            {/* Marker on current position */}
            <Marker position={[formData.latitude || 12.2958, formData.longitude || 76.6394]} />

            {/* Add custom map buttons */}
            <MapControls />
          </MapContainer>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 w-full">
          <div className="w-full">
            <Label className="text-sm font-semibold text-slate-700 mb-3 block">Venue Name *</Label>
            <Input
              placeholder="Enter venue name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full h-12 text-base md:text-lg border-2 border-slate-200 focus:border-[#5d33fb] rounded-xl transition-all duration-200"
            />
          </div>

          <div className="w-full">
            <Label className="text-sm font-semibold text-slate-700 mb-3 block">City *</Label>
            <Input
              placeholder="Enter city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full h-12 text-base md:text-lg border-2 border-slate-200 focus:border-[#5d33fb] rounded-xl transition-all duration-200"
            />
          </div>

          <div className="md:col-span-2 w-full">
            <Label className="text-sm font-semibold text-slate-700 mb-3 block">Address *</Label>
            <Input
              placeholder="Enter full address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full h-12 text-base md:text-lg border-2 border-slate-200 focus:border-[#5d33fb] rounded-xl transition-all duration-200"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 w-full">
        <Button
    onClick={handleSubmitVenue}
    disabled={isSubmitting}
    className="flex-1 h-12 text-base md:text-lg bg-[#5d33fb] hover:bg-[#4c2bd9] text-white disabled:opacity-50"
  >
    {isSubmitting ? (
      action === "edit" ? "Updating..." : "Creating..."
    ) : (
      <>
        <Check className="h-4 w-4 mr-2" />
        {action === "edit" ? "Update Venue" : "Create Venue"}
      </>
    )}
  </Button>
        </div>
      </div>

      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => {
          setToast({
            ...toast,
            isOpen: false,
            message: "",
            type: "success",
          })
        }}
      />
    </div>
  )
}

export default VenueCreatorPage