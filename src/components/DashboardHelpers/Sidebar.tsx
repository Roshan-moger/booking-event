"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  MapPin, Eye, Heart, Ticket, Phone, HelpCircle, Settings,
  Plus, Calendar, Menu, X, DollarSign, Users, Briefcase,
  Building2
} from "lucide-react"
import { useSelector } from "react-redux"
import type { InitialReduxStateProps } from "../../redux/redux.props"
import { useDispatch } from "react-redux"
import { update_path } from "../../redux/action"

type MenuItem = {
  label: string
  path: string
  icon: React.ReactNode
}


const Sidebar: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const role = useSelector((state: InitialReduxStateProps) => state.tokenInfo.roles[0])
  const activePath = useSelector((state: InitialReduxStateProps) => state.activePath)
  const dispatch = useDispatch()

  useEffect(() => {
    // Sync Redux activePath with current URL on mount or URL change
    dispatch(update_path(location.pathname))
  }, [location.pathname])

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)
  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  const handleNavigation = (path: string) => {
    navigate(path)
    dispatch(update_path(path)) // Update Redux state
    closeMobileMenu()
  }

  // Active route styling
  const navItemClasses = (path: string) =>
    `flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
      location.pathname.startsWith(path)
        ? "bg-[#fff200] text-[#113293] font-semibold"
        : "text-white hover:bg-blue-700"
    }`

  // Role-based menus remain the same
  const customerMenu: MenuItem[] = [
    { label: "Dashboard", path: "/dashboard", icon: <Eye className="w-5 h-5" /> },
    { label: "Watchlist", path: "/watchlist", icon: <Heart className="w-5 h-5" /> },
    { label: "Tickets", path: "/tickets", icon: <Ticket className="w-5 h-5" /> },
    { label: "Create Events", path: "/venues", icon: <Plus className="w-5 h-5" /> },
    { label: "My Events", path: "/my-events", icon: <Calendar className="w-5 h-5" /> },
  ]

  const adminMenu: MenuItem[] = [
    { label: "Venues", path: "/manage/venues", icon: <Building2 className="w-5 h-5" /> },
    { label: "Events", path: "/manage/events", icon: <Calendar className="w-5 h-5" /> },
    { label: "Transaction", path: "/manage/transactions", icon: <DollarSign className="w-5 h-5" /> },
    { label: "Payouts", path: "/manage/payouts", icon: <Briefcase className="w-5 h-5" /> },
    { label: "Organisers", path: "/manage/organisers", icon: <Users className="w-5 h-5" /> },
  ]

  const commonMenu: MenuItem[] = [
    { label: "Contact Us", path: "/contact", icon: <Phone className="w-5 h-5" /> },
    { label: "Support", path: "/support", icon: <HelpCircle className="w-5 h-5" /> },
  ]

  const bottomMenu: MenuItem[] = [
    { label: "Settings", path: "/settings", icon: <Settings className="w-5 h-5" /> },
  ]

  const roleMenu = role === "ADMIN" ? adminMenu : customerMenu

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="md:hidden fixed top-3 right-4 z-50 p-2 bg-[#fff200] text-bg-slate-50 rounded-lg cursor-pointer"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-20"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div
        className={`w-64 bg-[#113293] text-white flex flex-col fixed left-0 top-0 h-screen 
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 z-30`}
      >
        {/* Logo */}
        <div className="px-6 py-3 mt-6">
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
        <nav className="flex-1 px-6 space-y-2">
          {[...roleMenu, ...commonMenu].map((item) => (
            <div
              key={item.path}
              className={navItemClasses(item.path)}
              onClick={() =>{ 
                dispatch(update_path(item.path))
                handleNavigation(item.path)}}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        {/* Bottom CTA */}
        <div className="p-6 border-t border-blue-600">
          {bottomMenu.map((item) => (
            <div
              key={item.path}
              className={navItemClasses(item.path)}
 onClick={() =>{ 
                dispatch(update_path(item.path))
                handleNavigation(item.path)}}            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default Sidebar
