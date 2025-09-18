"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { MapPin, Eye, Heart, Ticket, Phone, HelpCircle, Settings, Plus, Calendar, Menu, X } from "lucide-react"
import { useSelector } from "react-redux"
import type { InitialReduxStateProps } from "../../redux/redux.props"

const Sidebar: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const role = useSelector((state: InitialReduxStateProps) => state.tokenInfo.roles[0])



  useEffect(()=>{
    console.log(role)
  },[])
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)
  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  const handleNavigation = (path: string) => {
    navigate(path)
    closeMobileMenu()
  }

  // Helper: returns style classes depending on active route
  const navItemClasses = (path: string) =>
    `flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
      location.pathname === path
        ? "bg-[#fff200] text-[#113293] font-semibold" // Active
        : "text-white hover:bg-blue-700"
    }`

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#fff200] text-[#113293] rounded-lg"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-30"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          w-64 bg-[#113293] text-white flex flex-col fixed left-0 top-0 h-screen 
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 z-40
        `}
      >
        {/* Logo */}
        <div className="p-6 mt-10">
          <div className="flex items-center gap-2 mt-7">
            <div className="w-8 h-8 bg-[#fff200] rounded-full flex items-center justify-center">
              <MapPin className="w-4 h-4 text-[#113293]" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Spot My</h1>
              <h2 className="text-xl font-bold">Event</h2>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="px-6 mb-4">
          <p className="text-sm text-gray-300 mb-3">Menu</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-6">
          <div className="space-y-2">
            <div className={navItemClasses("/dashboard")} onClick={() => handleNavigation("/dashboard")}>
              <Eye className="w-5 h-5" />
              <span>Dashboard</span>
            </div>

            <div className={navItemClasses("/watchlist")} onClick={() => handleNavigation("/watchlist")}>
              <Heart className="w-5 h-5" />
              <span>Watchlist</span>
            </div>

            <div className={navItemClasses("/tickets")} onClick={() => handleNavigation("/tickets")}>
              <Ticket className="w-5 h-5" />
              <span>Tickets</span>
            </div>

            <div className={navItemClasses("/venue")} onClick={() => handleNavigation("/venue")}>
              <Plus className="w-5 h-5" />
              <span>Create Events</span>
            </div>

            <div className={navItemClasses("/my-events")} onClick={() => handleNavigation("/my-events")}>
              <Calendar className="w-5 h-5" />
              <span>My Events</span>
            </div>

            <div className={navItemClasses("/contact")} onClick={() => handleNavigation("/contact")}>
              <Phone className="w-5 h-5" />
              <span>Contact Us</span>
            </div>

            <div className={navItemClasses("/support")} onClick={() => handleNavigation("/support")}>
              <HelpCircle className="w-5 h-5" />
              <span>Support</span>
            </div>
          </div>
        </nav>

        {/* Bottom CTA */}
        <div className="p-6 border-t border-blue-600">
          <div className={navItemClasses("/settings")} onClick={() => handleNavigation("/settings")}>
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </div>
        </div>
      </div>

      {/* Spacer for desktop */}
      <div className="hidden md:block flex-shrink-0" />
    </>
  )
}

export default Sidebar
