import React, { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  Eye,
  Heart,
  Ticket,
  Phone,
  HelpCircle,
  Settings,
  Plus,
  Calendar,
  Menu,
  X,
  DollarSign,
  Users,
  Briefcase,
  Building2,
  Scan,
} from "lucide-react"
import { useSelector, useDispatch } from "react-redux"
import type { InitialReduxStateProps } from "../../redux/redux.props"
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
  const role = useSelector(
    (state: InitialReduxStateProps) => state.tokenInfo.roles
  )
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(update_path(location.pathname))
  }, [location.pathname])

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)
  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  const handleNavigation = (path: string) => {
    navigate(path)
    dispatch(update_path(path))
    closeMobileMenu()
  }

  const navItemClasses = (path: string) =>
    `flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg cursor-pointer transition-colors text-sm sm:text-base ${
      location.pathname.startsWith(path)
        ? "bg-[#fff200] text-[#113293] font-semibold"
        : "text-white hover:bg-blue-700"
    }`

  // 🎯 Organizer menu
  const organizerMenu: MenuItem[] = [
    { label: "Dashboard", path: "/dashboard", icon: <Eye className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { label: "Watchlist", path: "/watchlist", icon: <Heart className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { label: "Tickets", path: "/tickets", icon: <Ticket className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { label: "Create Events", path: "/venues", icon: <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { label: "My Events", path: "/my-events", icon: <Calendar className="w-4 h-4 sm:w-5 sm:h-5" /> },
        { label: "QR Scanner", path: "/scanner", icon: <Scan className="w-4 h-4 sm:w-5 sm:h-5" /> },

  ]

  // 🎯 Customer menu
  const customerMenu: MenuItem[] = [
    { label: "Dashboard", path: "/dashboard", icon: <Eye className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { label: "Watchlist", path: "/watchlist", icon: <Heart className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { label: "Tickets", path: "/tickets", icon: <Ticket className="w-4 h-4 sm:w-5 sm:h-5" /> },
  ]

  // 🎯 Admin menu
  const adminMenu: MenuItem[] = [
    { label: "Venues", path: "/manage/venues", icon: <Building2 className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { label: "Events", path: "/manage/events", icon: <Calendar className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { label: "Transaction", path: "/manage/transactions", icon: <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { label: "Payouts", path: "/manage/payouts", icon: <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { label: "Categories", path: "/manage/categories", icon: <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { label: "Organisers", path: "/manage/organisers", icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" /> },
  ]

  const commonMenu: MenuItem[] = [
    { label: "Contact Us", path: "/contact", icon: <Phone className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { label: "Support", path: "/support", icon: <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" /> },
  ]

  const bottomMenu: MenuItem[] = [
    { label: "Settings", path: "/settings", icon: <Settings className="w-4 h-4 sm:w-5 sm:h-5" /> },
  ]

  // 🎯 Role-based menu
  const roleMenu =
    role.includes("ADMIN")
      ? adminMenu
      : role.includes("ORGANIZER")
      ? organizerMenu
      : customerMenu

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleMobileMenu}
        className="md:hidden fixed top-3 left-3 z-[9999] p-2 bg-[#fff200] text-[#113293] rounded-lg shadow-md"
      >
        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-[7999]"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div
        className={`w-56 sm:w-64 bg-[#113293] text-white flex flex-col fixed left-0 top-0 h-screen pt-20
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 z-[8999]`}
      >
        {/* Logo */}
        {/* <div className="px-6 py-6 mt-8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#fff200] rounded-full flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#113293]" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-bold leading-tight">Spot My</h1>
              <h2 className="text-base sm:text-xl font-bold leading-tight">Event</h2>
            </div>
          </div>
        </div> */}

        {/* Menu Label */}
        <div className="px-4 sm:px-6 mb-2 sm:mb-4">
          <p className="text-xs sm:text-sm text-gray-300 mb-2 sm:mb-3">Menu</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 sm:px-6 space-y-1 sm:space-y-2">
          {[...roleMenu, ...commonMenu].map((item) => (
            <div
              key={item.path}
              className={navItemClasses(item.path)}
              onClick={() => handleNavigation(item.path)}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 sm:p-6 border-t border-blue-600 mt-auto">
          {bottomMenu.map((item) => (
            <div
              key={item.path}
              className={navItemClasses(item.path)}
              onClick={() => handleNavigation(item.path)}
            >
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
