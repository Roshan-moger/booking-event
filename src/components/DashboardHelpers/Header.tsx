import {
  MapPin,
  User,
  LogOut,
  UserCircle,
  Key,
  EyeOff,
  Eye,
  X,
  Lock,
  Sparkles,
} from "lucide-react";
import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { update_auth_data, update_path } from "../../redux/action";
import { useSelector } from "react-redux";
import type { InitialReduxStateProps } from "../../redux/redux.props";
import Toast from "../UI/toast";
import axiosInstance from "../../api/axiosInstance";
import { Button } from "../UI/button";
import { Input } from "../UI/input";
import Label from "../UI/label";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  sub: string; // user email
  roles: string[]; // user roles
  iat: number;
  exp: number;
  name: string;
}
const Header: React.FC = () => {
  const navigate = useNavigate();

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const location = useLocation();
  const dispatch = useDispatch();
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const role = useSelector(
    (state: InitialReduxStateProps) => state.tokenInfo.roles
  );
  const userName = useSelector(
    (state: InitialReduxStateProps) => state.tokenInfo.name
  );
  const userEmail = useSelector(
    (state: InitialReduxStateProps) => state.tokenInfo.email
  );

  const [toast, setToast] = useState({
    isOpen: false,
    type: "success" as "success" | "error",
    message: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const accessToken = localStorage.getItem("accessToken");
  const [city, setCity] = useState<string>("Detecting...");

  useEffect(() => {
    if (!navigator.geolocation) {
      setCity("Location not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Use OpenStreetMap reverse geocoding API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();

          const detectedCity =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.state ||
            "Unknown location";

          setCity(detectedCity);
        } catch (error) {
          console.error("Error fetching location:", error);
          setCity("Location unavailable");
        }
      },
      (error) => {
        console.error(error);
        setCity("Permission denied");
      }
    );
  }, []);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      // ✅ Dummy API call
      const res = await axiosInstance.get("/users/becomeOrganizer", {
        headers: {
          Authorization: accessToken,
        },
      });

      const token = res.data?.token;

      if (!token) {
        throw new Error("Token not found in server response");
      }
      // ✅ Normalize token
      const finalToken: string = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;

      // ✅ Set axios auth header

      localStorage.setItem("accessToken", finalToken);

      const decodedUser = jwtDecode<DecodedToken>(
        finalToken.replace("Bearer ", "")
      );
      const payload = {
        token: finalToken,
        roles: decodedUser.roles || [],
        email: decodedUser.sub,
        expiryTime: decodedUser.exp
          ? new Date(decodedUser.exp * 1000).toISOString()
          : "",
        name: decodedUser.name,
      };

      // ✅ Dispatch to Redux
      dispatch(update_auth_data(payload));

      // ✅ Save decoded user in localStorage (optional)
      localStorage.setItem("userData", JSON.stringify(decodedUser));

      // ✅ On success, navigate to venues
      navigate("/venues");
    } catch (error) {
      console.error("Error becoming organizer:", error);
    } finally {
      setLoading(false);
      setShowPopup(false);
    }
  };

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
    // Clear any remaining auth state
            window.location.href = "/";

    //  navigate("/");
    dispatch({ type: "CLEAR_AUTH" }); // Adjust action type according to your Redux setup
    // ✅ Clear all relevant localStorage keys
    localStorage.removeItem("accessToken");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
   
    setIsUserDropdownOpen(false);
  };

  const handleProfile = () => {
    navigate("/profile");
    setIsUserDropdownOpen(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setToast({
        isOpen: true,
        type: "error",
        message: "New password and confirmation do not match!",
      });
      return;
    }

    if (newPassword.length < 6) {
      setToast({
        isOpen: true,
        type: "error",
        message: "Password must be at least 6 characters!",
      });
      return;
    }

    try {
      const response = await axiosInstance.post("/users/change-password", {
        currentPassword,
        newPassword,
      });

      if (response.status === 200) {
        setToast({
          isOpen: true,
          type: "success",
          message: "Password reset successfully!",
        });

        // Close modal and reset fields
        setIsResetPasswordOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setToast({
          isOpen: true,
          type: "error",
          message: response.data?.message || "Failed to reset password.",
        });
      }
    } catch (error: any) {
      console.error("Error resetting password:", error);

      setToast({
        isOpen: true,
        type: "error",
        message:
          error.response?.data?.message ||
          "An unexpected error occurred while resetting password.",
      });
    }
  };

  const handleClose = () => {
    setIsResetPasswordOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <header className="sticky top-0 z-9000 bg-[#113293] text-white">
      <div className="flex items-center justify-between w-full px-4 py-3 md:px-8 md:py-3">
        {/* Left Side - Logo placeholder (optional) */}
   {/* Logo */}
       
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#fff200] rounded-full flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#113293]" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-bold leading-tight">Spot My Event</h1>
            </div>
          </div>
      
        {/* Right Side */}
        <div className="flex items-center gap-3 md:gap-6 flex-1 justify-end">
          {/* Navigation - always visible */}

          {!role.includes("ADMIN") &&   <nav className="flex gap-4 md:gap-6">
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
          </nav>}
        

          {/* Create Event Button */}
          {role.includes("ADMIN") ||
            (!role.includes("ORGANIZER") && (
              <button
                className="flex items-center gap-2 cursor-pointer  bg-red-500 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-lg shadow-md transition-all text-sm md:text-base font-medium"
                onClick={() => setShowPopup(true)}
              >
                <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Join as Organizer</span>
              </button>
            ))}

          {/* Location (desktop only) */}
          <div className="hidden md:flex items-center gap-2 bg-[#fff200] text-[#113293] px-4 py-2 rounded-lg cursor-pointer hover:bg-yellow-400 transition">
            <MapPin className="w-4 h-4" />
            <span className="font-medium text-sm">{city}</span>
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
                  <p className="text-sm font-medium text-gray-900">
                    {userName}
                  </p>
                  <p className="text-xs text-gray-500">{userEmail}</p>
                </div>

                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-3"
                  onClick={handleProfile}
                >
                  <UserCircle className="w-4 h-4" />
                  Profile
                </button>
                {!role.includes("ADMIN") && (
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-3"
                    onClick={() => {
                      navigate("/user/bankdetails");
                      setIsUserDropdownOpen(false);
                    }}
                  >
                    <UserCircle className="w-4 h-4" />
                    Account Details
                  </button>
                )}

                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-3"
                  onClick={() => setIsResetPasswordOpen(true)}
                >
                  <Key className="w-4 h-4" />
                  Reset Password
                </button>

                {/* <button
      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-3"
      onClick={handleSettings}
    >
      <SettingsIcon className="w-4 h-4" />
      Settings
    </button> */}

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

            {/* Reset Password Modal */}
            {isResetPasswordOpen && (
              <div className="fixed inset-0  backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
                  {/* Header */}
                  <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl p-6">
                    <button
                      onClick={handleClose}
                      className="absolute top-4 right-4 text-white cursor-pointer rounded-full p-1 transition-all"
                    >
                      <X size={20} />
                    </button>
                    <div className="flex items-center gap-3">
                      <div className="bg-white bg-opacity-20 rounded-full p-3">
                        <Lock className="text-black" size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          Reset Password
                        </h2>
                        <p className="text-blue-100 text-sm">
                          Update your account security
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-5">
                    {/* Current Password */}
                    <div>
                      <Label className="block text-sm font-semibold text-gray-700 mb-2">
                        Current Password
                      </Label>
                      <div className="relative">
                        <Input
                          type={showCurrent ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full text-black"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrent(!showCurrent)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showCurrent ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <Label className="block text-sm font-semibold text-gray-700 mb-2">
                        New Password
                      </Label>
                      <div className="relative">
                        <Input
                          type={showNew ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full text-black"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNew(!showNew)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <Label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Input
                          type={showConfirm ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full text-black"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirm ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Password Requirements */}
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-xs text-gray-600 font-medium mb-2">
                        Password must contain:
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li className="flex items-center gap-2">
                          <span
                            className={
                              newPassword.length >= 6
                                ? "text-green-600"
                                : "text-gray-400"
                            }
                          >
                            ●
                          </span>
                          At least 6 characters
                        </li>
                        <li className="flex items-center gap-2">
                          <span
                            className={
                              newPassword === confirmPassword && newPassword
                                ? "text-green-600"
                                : "text-gray-400"
                            }
                          >
                            ●
                          </span>
                          Passwords match
                        </li>
                      </ul>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={handleClose}
                        variant="secondary"
                        className="flex-1  border-black border"
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleResetPassword} className="flex-1">
                        Reset Password
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-scaleIn relative overflow-hidden">
            {/* Close button */}
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10 cursor-pointer"
            >
              <X size={24} />
            </button>

            <div className="relative p-8 text-center">
              {/* Icon */}
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg transform hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8 text-white" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-800 my-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Confirm Your Choice
              </h2>

              {/* Description */}
              <p className="text-gray-600 mb-8 leading-relaxed">
                Are you sure you want to become an organizer? This will unlock
                powerful event management features.
              </p>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowPopup(false)}
                  variant="ghost"
                  className="flex-1 px-6 py-3 bg-gray-100 border hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all hover:shadow-md active:scale-95"
                >
                  Cancel
                </Button>
                <Button
                  disabled={loading}
                  onClick={handleConfirm}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all hover:shadow-xl active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  <span className="relative z-10">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      "Yes, Confirm"
                    )}
                  </span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Toast */}
      <Toast
        isOpen={toast.isOpen}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />
    </header>
  );
};

export default Header;
