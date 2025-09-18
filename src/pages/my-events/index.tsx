"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Users,
  Plus,
  Building2,
  Share2,
  Star,
  Calendar,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Button } from "../../components/UI/button";
import axiosInstance from "../../api/axiosInstance";
import { useDispatch } from "react-redux";
import { update_action } from "../../redux/action";
import Toast from "../../components/UI/toast";

interface Venue {
  id: number;
  name: string;
  city: string;
  state: string;
  postalCode: string;
  address: string;
  shared: boolean;
  status: string;
}

interface ToastProps {
  isOpen: boolean;
  message: string;
  type?: "success" | "error" | "info";
}

const MyEvents: React.FC = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [toast, setToast] = useState<ToastProps>({
    isOpen: false,
    type: "success",
    message: "",
  });

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const response = await axiosInstance.get("/organizer/venues/mine");
      setVenues(response.data);
    } catch (error) {
      console.error("Error fetching venues:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVenueSelect = (venueId: number) => {
    navigate(`/event/show/${venueId}`);
  };

  const handleCreateVenue = () => {
    navigate("/venue/create");
    dispatch(update_action("add"))
  };

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-200" };
      case "inactive":
        return { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", border: "border-red-200" };
      case "pending":
        return { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", border: "border-amber-200" };
      default:
        return { bg: "bg-slate-50", text: "text-slate-700", dot: "bg-slate-500", border: "border-slate-200" };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 text-sm">Loading your venues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 top-0 z-10">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <div className="h-6 w-px bg-slate-300" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Event Venues</h1>
                <p className="text-sm text-slate-600 mt-1">
                  Choose a venue to view or manage events
                </p>
              </div>
            </div>
            <Button
              onClick={handleCreateVenue}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <Plus className="w-5 h-5" />
              Create Venue
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8">
        {venues.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl border border-slate-200 p-12 max-w-md mx-auto">
              <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-6" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No venues yet
              </h3>
              <p className="text-slate-600 text-sm mb-6">
                Create your first venue to start organizing amazing events.
              </p>
              <Button
                onClick={handleCreateVenue}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-sm transition-all duration-200 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Create Your First Venue
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="text-2xl font-bold text-slate-900">{venues.length}</div>
                <div className="text-sm text-slate-600">Total Venues</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="text-2xl font-bold text-emerald-600">
                  {venues.filter(v => v.status?.toLowerCase() === 'active').length}
                </div>
                <div className="text-sm text-slate-600">Active</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="text-2xl font-bold text-blue-600">
                  {venues.filter(v => v.shared).length}
                </div>
                <div className="text-sm text-slate-600">Shared</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="text-2xl font-bold text-amber-600">
                  {venues.filter(v => v.status?.toLowerCase() === 'pending').length}
                </div>
                <div className="text-sm text-slate-600">Pending</div>
              </div>
            </div>

            {/* Venues Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {venues.map((venue) => {
                const statusConfig = getStatusConfig(venue.status);
                return (
                  <div
                    key={venue.id}
                    onClick={() => handleVenueSelect(venue.id)}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-200 group cursor-pointer"
                  >
                    {/* Header Section */}
                    <div className="relative h-32 bg-slate-100 flex items-center justify-center">
                      <Building2 className="w-12 h-12 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                      
                      {/* Shared Indicator */}
                      {venue.shared && (
                        <div className="absolute top-3 left-3">
                          <div className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm">
                            <Share2 className="w-3 h-3" />
                            SHARED
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {/* Status Badge */}
                      <div className="mb-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border} gap-1.5`}>
                          <div className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
                          {venue.status?.toUpperCase() || "UNKNOWN"}
                        </span>
                      </div>

                      {/* Venue Name */}
                      <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                        {venue.name}
                      </h3>

                      {/* Location Details */}
                      <div className="space-y-2 mb-6">
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                          <div className="text-slate-600">
                            <div className="font-medium text-slate-900">
                              {venue.city}, {venue.state}
                            </div>
                            <div className="text-xs text-slate-500 mt-1 line-clamp-1">
                              {venue.address}
                            </div>
                            <div className="text-xs text-slate-500">
                              PIN: {venue.postalCode}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVenueSelect(venue.id);
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 group/btn"
                      >
                        <Calendar className="w-4 h-4" />
                        View Events
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Toast */}
      <Toast
        isOpen={toast.isOpen}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />
    </div>
  );
};

export default MyEvents;