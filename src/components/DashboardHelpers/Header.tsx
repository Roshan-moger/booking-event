import {
  MapPin,
  Plus,
  User,
  LogOut,
  Settings as SettingsIcon,
  UserCircle,
} from "lucide-react";
import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { update_path } from "../../redux/action";
import { useSelector } from "react-redux";
import type { InitialReduxStateProps } from "../../redux/redux.props";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const role = useSelector((state: InitialReduxStateProps) => state.tokenInfo.roles[0])
const userName= useSelector((state: InitialReduxStateProps) => state.tokenInfo.name)
const userEmail = useSelector((state: InitialReduxStateProps) => state.tokenInfo.email)
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigationItems = [
    { label: "All", value: "All", path: "/dashboard" },
    { label: "Plays", value: "Plays", path: "/plays" },
    { label: "Events", value: "Events", path: "/my-events" },
  ];

  const handleLogout = () => {
    console.log("Logout clicked");
        // Clear any remaining auth state
    dispatch({ type: "CLEAR_AUTH" }); // Adjust action type according to your Redux setup
  // ✅ Clear all relevant localStorage keys
  localStorage.removeItem("accessToken");
  localStorage.removeItem("authToken");
  localStorage.removeItem("userData");
  localStorage.removeItem("token");
    navigate("/");
    setIsUserDropdownOpen(false);
  };

  const handleProfile = () => {
    navigate("/profile");
    setIsUserDropdownOpen(false);
  };

  const handleSettings = () => {
    navigate("/settings");
    setIsUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#113293] text-white">
      <div
        className="flex items-center justify-between w-full sm:mr-20 px-4 py-3 md:px-8 md:py-4
      pr-[80px] md:pr-8 "
      >
        {/* Left Side - Logo placeholder (optional) */}
        {/* <div className="text-lg font-bold">LOGO</div> */}

        {/* Right Side */}
        <div className="flex items-center gap-3 md:gap-6 flex-1 justify-end">
          {/* Navigation - always visible */}
          <nav className="flex gap-4 md:gap-6">
            {navigationItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);

              return (
                <span
                  key={item.value}
                  className={`cursor-pointer transition-colors pb-1 ${
                    isActive
                      ? "text-[#fff200] font-medium border-b-2 border-[#fff200]"
                      : "hover:text-[#fff200]"
                  }`}
                  onClick={() => {
                    navigate(item.path);
                    dispatch(update_path(item.path));
                  }}
                >
                  {item.label}
                </span>
              );
            })}
          </nav>

          {/* Create Event Button */}
          {role !== "ADMIN" &&  <button
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg shadow-md transition text-sm md:text-base"
            onClick={() => navigate("/venues")}
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Create Event</span>
            {/* <span className="sm:hidden"><Plus/></span> */}
          </button> }
         

          {/* Location (desktop only) */}
          <div className="hidden md:flex items-center gap-2 bg-[#fff200] text-[#113293] px-4 py-2 rounded-lg cursor-pointer hover:bg-yellow-400 transition">
            <MapPin className="w-4 h-4" />
            <span className="font-medium text-sm">Bangalore</span>
          </div>

          {/* Search Bar */}
          {/* <div className="relative max-w-[160px] sm:max-w-xs md:max-w-none md:flex-initial">
            <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-[#113293]" />
            <Input
              placeholder="Search..."
              className="pl-7 md:pl-10 bg-[#fff200] text-[#113293] placeholder:text-[#113293] border-0 w-full md:w-72 rounded-lg focus:ring-2 focus:ring-yellow-300 text-sm md:text-base py-2"
            />
          </div> */}

          {/* User Dropdown */}
          <div className="relative" ref={userDropdownRef}>
            <button
              className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center cursor-pointer hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg"
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            >
              <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </button>

            {isUserDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl py-2 min-w-[180px] z-50 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500">{userEmail}</p>
                </div>

                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-3"
                  onClick={handleProfile}
                >
                  <UserCircle className="w-4 h-4" />
                  Profile
                </button>

                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-3"
                  onClick={handleSettings}
                >
                  <SettingsIcon className="w-4 h-4" />
                  Settings
                </button>

                <div className="border-t border-gray-100 mt-1">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
