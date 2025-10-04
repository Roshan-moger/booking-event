"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Plus,
  Calendar,
  ArrowRight,
  Building2,
  Share2,
  Edit,
  Trash2,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { Button } from "../../components/UI/button";
import axiosInstance from "../../api/axiosInstance";
import Toast from "../../components/UI/toast";
import DeletePopup from "../../components/UI/DeletePopup";
import { useDispatch } from "react-redux";
import type { InitialReduxStateProps } from "../../redux/redux.props";
import { useSelector } from "react-redux";

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

// Reapproval Popup Component
interface ReapprovalPopupProps {
  open: boolean;
  venue: Venue | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ReapprovalPopup: React.FC<ReapprovalPopupProps> = ({
  open,
  venue,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!open || !venue) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Send for Re-approval
            </h3>
            <p className="text-sm text-slate-600">
              This will submit your venue for review again
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-slate-700">
            Are you sure you want to send <strong>"{venue.name}"</strong> for
            re-approval?
          </p>
          <p className="text-xs text-slate-500 mt-2">
            The venue will be reviewed by our team and you'll be notified once
            approved.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Sending...
              </>
            ) : (
              "Send for Re-approval"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const VenueSelectionPage: React.FC = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [venueToDelete, setVenueToDelete] = useState<Venue | null>(null);
  const navigate = useNavigate();
  const role = useSelector(
    (state: InitialReduxStateProps) => state.tokenInfo.roles[0]
  );
  const [venueToReapprove, setVenueToReapprove] = useState<Venue | null>(null);
  const [showReapproveConfirm, setShowReapproveConfirm] = useState(false);
  const [isReapproving, setIsReapproving] = useState(false);
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
      // setToast({
      //   isOpen: true,
      //   type: "error",
      //   message: "Failed to fetch venues. Please try again.",
      // });
    } finally {
      setLoading(false);
    }
  };

  const handleVenueSelect = (venueId: number) => {
    navigate(`event/add/${venueId}`);
  };

  const handleCreateVenue = () => {
    navigate("/venues/add");
  };

  const handleEditVenue = (venueId: number) => {
    navigate(`/venues/edit/${venueId}`);
  };

  const handleDelete = async () => {
    if (!venueToDelete) return;
    try {
      const response = await axiosInstance.delete(
        `/organizer/venues/${venueToDelete.id}`
      );
      if (response.status === 204) {
        setShowDelete(false);
        setVenueToDelete(null);
        setToast({
          isOpen: true,
          type: "success",
          message: "Venue deleted successfully!",
        });
        fetchVenues();
      }
    } catch (error: any) {
      setToast({
        isOpen: true,
        type: "error",
        message:
          error?.response?.data?.message ||
          "Failed to delete venue. Please try again.",
      });
    }
  };

  const sendForReapproval = async () => {
    if (!venueToReapprove) return;

    setIsReapproving(true);
    try {
      // Replace this with your actual API endpoint
      const response = await axiosInstance.put(
        `/organizer/venues/${venueToReapprove.id}/resubmit`
      );

      if (response.status === 200) {
        setShowReapproveConfirm(false);
        setVenueToReapprove(null);
        setToast({
          isOpen: true,
          type: "success",
          message: "Venue sent for re-approval successfully!",
        });
        fetchVenues(); // Refresh the venues list
      }
    } catch (error: any) {
      setToast({
        isOpen: true,
        type: "error",
        message:
          error?.response?.data?.message ||
          "Failed to send venue for re-approval. Please try again.",
      });
    } finally {
      setIsReapproving(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "active":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          dot: "bg-emerald-500",
          border: "border-emerald-200",
        };
      case "rejected":
      case "inactive":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          dot: "bg-red-500",
          border: "border-red-200",
        };
      case "pending":
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          dot: "bg-amber-500",
          border: "border-amber-200",
        };
      default:
        return {
          bg: "bg-slate-50",
          text: "text-slate-700",
          dot: "bg-slate-500",
          border: "border-slate-200",
        };
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
              <div>
                <h1 className="text-2xl font-bold text-slate-900">My Venues</h1>
                <p className="text-sm text-slate-600">
                  Choose a venue to create your event
                </p>
              </div>
            </div>
            <Button
              onClick={handleCreateVenue}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 font-medium shadow-sm transition-all duration-200 hover:shadow-md"
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
            {/* ...keep your stats code... */}

            {/* Venues Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {venues.map((venue) => {
                const statusConfig = getStatusConfig(venue.status);
                const status = venue.status?.toLowerCase();

                return (
                  <div
                    key={venue.id}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-200 group flex flex-col h-full"
                  >
                    {/* Header Section */}
                    <div className="relative h-32 bg-slate-100 flex items-center justify-center">
                      <Building2 className="w-12 h-12 text-slate-400" />

                      {/* Overlay for badges and action buttons */}
                      <div className="absolute inset-0 p-4 flex justify-between items-start">
                        <div className="flex flex-col gap-2">
                          {venue.shared && (
                            <div className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm">
                              <Share2 className="w-3 h-3" />
                              SHARED
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 items-end">
                          {status === "pending" && (
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditVenue(venue.id);
                                }}
                                className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white shadow-sm border border-white/20 transition-all duration-200 group/btn"
                                title="Edit Venue"
                              >
                                <Edit className="w-4 h-4 text-indigo-600 group-hover/btn:text-indigo-700" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setVenueToDelete(venue);
                                  setShowDelete(true);
                                }}
                                className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white shadow-sm border border-white/20 transition-all duration-200 group/btn"
                                title="Delete Venue"
                              >
                                <Trash2 className="w-4 h-4 text-red-600 group-hover/btn:text-red-700" />
                              </button>
                            </div>
                          )}

                          {status === "rejected" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setVenueToReapprove(venue);
                                setShowReapproveConfirm(true);
                              }}
                              className="px-3 py-2 bg-yellow-100/90 backdrop-blur-sm text-yellow-700 rounded-lg hover:bg-yellow-200 transition-all duration-200 flex items-center gap-1.5 text-xs font-medium shadow-sm border border-yellow-200/50"
                              title="Send for Re-approval"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              Re-approve
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="mb-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border} gap-1.5`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${statusConfig.dot}`}
                          />
                          {venue.status?.toUpperCase() || "UNKNOWN"}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                        {venue.name}
                      </h3>

                      <div className="space-y-2 mb-2">
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                          <div className="text-slate-600">
                            <div className="font-medium text-slate-900">
                              {venue.city}, {venue.state}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              {venue.address}
                            </div>
                            <div className="text-xs text-slate-500">
                              PIN: {venue.postalCode}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status Messages */}
                      {status === "pending" && (
                        <div className="mt-auto text-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <p className="text-sm text-amber-700 font-medium">
                            This venue is waiting for approval.
                          </p>
                          <p className="text-xs text-amber-600 mt-1">
                            Please wait until it is approved.
                          </p>
                        </div>
                      )}

                      {status === "rejected" && (
                        <div className="mt-auto text-center p-3 bg-red-50 rounded-lg border border-red-200">
                          <p className="text-sm text-red-700 font-medium">
                            Venue was rejected
                          </p>
                          <p className="text-xs text-red-600 mt-1">
                            Click the re-approve button above to submit for
                            review again.
                          </p>
                        </div>
                      )}

                      {/* Push button to bottom */}
                      {status === "approved" && (
                        <div className="mt-auto">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVenueSelect(venue.id);
                            }}
                            className={`w-full transition-all duration-200 `}
                          >
                            <Calendar className="w-4 h-4" />
                            Create Event
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Delete & Reapproval Popups + Toast remain same */}
      <DeletePopup
        open={showDelete}
        title="Delete Venue"
        description={
          venueToDelete
            ? `Are you sure you want to delete "${venueToDelete.name}"? This action cannot be undone.`
            : ""
        }
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDelete(false);
          setVenueToDelete(null);
        }}
      />

      <ReapprovalPopup
        open={showReapproveConfirm}
        venue={venueToReapprove}
        onConfirm={sendForReapproval}
        onCancel={() => {
          setShowReapproveConfirm(false);
          setVenueToReapprove(null);
        }}
        isLoading={isReapproving}
      />

      <Toast
        isOpen={toast.isOpen}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />
    </div>
  );
};

export default VenueSelectionPage;
