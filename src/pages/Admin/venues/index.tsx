import  { useState, useEffect } from "react";
import {
  Check,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import axiosInstance from "../../../api/axiosInstance";
import Toast from "../../../components/UI/toast";
import Textarea from "../../../components/UI/textarea";
import { useSelector } from "react-redux";
import type { InitialReduxStateProps } from "../../../redux/redux.props";
import { useNavigate } from "react-router-dom";

// Types
interface Venue {
  id: number;
  name: string;
  city: string;
  state: string;
  postalCode: string;
  address: string;
  shared: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

const VenueManagementTable = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "ALL" | "PENDING" | "APPROVED" | "REJECTED"
  >("PENDING");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [toast, setToast] = useState({
    isOpen: false,
    type: "success" as "success" | "error",
    message: "",
  });
  const navigate = useNavigate();

  const role = useSelector(
    (state: InitialReduxStateProps) => state.tokenInfo.roles[0]
  );

    const [venueDetailsModal, setVenueDetailsModal] = useState<{
  isOpen: boolean;
  venueId: number | null;
  data: Venue | null;
  loading: boolean;
}>({
  isOpen: false,
  venueId: null,
  data: null,
  loading: false,
});

  useEffect(() => {
    if (role.toLocaleLowerCase() !== "admin") {
      navigate("/notfound"); // redirect if not admin
    }
  }, [role, navigate]);
  // Reject modal state
  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    venueId: 0,
    remarks: "",
  });

  useEffect(() => {
    if (role.toLocaleLowerCase() === "admin") {
      loadVenues();
    }
  }, [role]);

  const loadVenues = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get<Venue[]>("/organizer/venues");
      setVenues(res.data);
    } catch (err) {
      console.error("Failed to fetch venues", err);
      // setToast({
      //   isOpen: true,
      //   type: "error",
      //   message: "Failed to load venues",
      // });
    } finally {
      setLoading(false);
    }
  };

  const filteredVenues = venues.filter((venue) => {
    const matchesSearch =
      searchTerm === "" ||
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.status.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "ALL" || venue.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredVenues.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVenues = filteredVenues.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleApprove = async (venueId: number) => {
    try {
      await axiosInstance
        .put(`/admin/venues/${venueId}/approve`)
        .then((res) => {
          if ([200, 201, 202, 203].includes(res.status)) {
            setVenues((prev) =>
              prev.map((venue) =>
                venue.id === venueId ? { ...venue, status: "APPROVED" } : venue
              )
            );
            setToast({
              isOpen: true,
              type: "success",
              message: "Venue approved successfully!",
            });
            loadVenues();
          }
        });
    } catch (err) {
      console.log(err);
      setToast({
        isOpen: true,
        type: "error",
        message: "Something went wrong!",
      });
    }
  };

  // Open Reject Modal
  const openRejectModal = (venueId: number) => {
    setRejectModal({ isOpen: true, venueId, remarks: "" });
  };

  // Confirm Reject with API call
  const confirmReject = async () => {
    try {
      setLoading(true);
      await axiosInstance.put(
        `/admin/venues/${rejectModal.venueId}/reject?remarks=${rejectModal.remarks}`
      );
      setVenues((prev) =>
        prev.map((venue) =>
          venue.id === rejectModal.venueId
            ? { ...venue, status: "REJECTED" }
            : venue
        )
      );
      setToast({
        isOpen: true,
        type: "success",
        message: "Venue rejected successfully!",
      });
      setRejectModal({ isOpen: false, venueId: 0, remarks: "" });
      loadVenues();
    } catch (err) {
      console.log(err);
      setToast({
        isOpen: true,
        type: "error",
        message: "Something went wrong!",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { bg: string; text: string; border: string; icon: any }
    > = {
      PENDING: {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        icon: Clock,
      },
      APPROVED: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        icon: CheckCircle,
      },
      REJECTED: {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        icon: XCircle,
      },
    };
    const config = statusConfig[status.toUpperCase()] || statusConfig.PENDING;
    const IconComponent = config.icon;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border gap-1.5 ${config.bg} ${config.text} ${config.border}`}
      >
        <IconComponent className="w-3 h-3" />
        {status.toUpperCase()}
      </span>
    );
  };



// Fetch venue details
const fetchVenueDetails = async (venueId: number) => {
  setVenueDetailsModal({ isOpen: true, venueId, data: null, loading: true });
  try {
    const res = await axiosInstance.get(`/organizer/venues/getbyid/${venueId}`);
    setVenueDetailsModal({
      isOpen: true,
      venueId,
      data: res.data,
      loading: false,
    });
  } catch (err) {
    console.error("Failed to fetch venue details", err);
    // setToast({
    //   isOpen: true,
    //   type: "error",
    //   message: "Failed to load venue details",
    // });
    setVenueDetailsModal({ isOpen: false, venueId: null, data: null, loading: false });
  }
};
  return (
    <div className="bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6 py-6">
          <div className="flex items-center gap-4">
            {/* <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="h-6 w-px bg-slate-300" /> */}
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Venue Management
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Review and manage venue approvals
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {/* Search + Filter Header */}
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search venues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm w-64"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(
                  e.target.value as "ALL" | "PENDING" | "APPROVED" | "REJECTED"
                )
              }
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Table */}
          <div className="relative">
            <div className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-4 w-[8%] text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Venue ID
                    </th>
                    <th className="px-6 py-4 w-[10%] text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 w-[25%] text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-4 w-[20%] text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      City / State
                    </th>
                    <th className="px-6 py-4 w-[8%] text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 w-[20%] text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
              </table>
            </div>

            {/* Scrollable Body */}
            <div className="h-80 overflow-y-auto">
              <table className="w-full">
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-slate-500"
                      >
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                          <span className="ml-3">Loading venues...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedVenues.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-slate-500"
                      >
                        <p className="text-lg font-medium mb-2">
                          No venues found
                        </p>
                        <p className="text-sm">
                          Try adjusting your search or filter
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedVenues.map((venue) => (
                      <tr
                        key={venue.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-2 text-sm text-left font-medium text-slate-900 w-[8%]">
                          #{venue.id}
                        </td>
                        <td className="px-6 py-2 w-[10%]">
                          <div className="text-sm text-left font-medium text-slate-900">
                            {venue.name}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {venue.shared ? "Shared" : "Private"}
                          </div>
                        </td>
                        <td className="px-6 py-2 text-sm text-left text-slate-600 w-[25%]">
                          {venue.address}, {venue.postalCode}
                        </td>
                        <td className="px-6 py-2 text-sm text-left text-slate-600 w-[20%]">
                          {venue.city}, {venue.state}
                        </td>
                        <td className="px-6 py-2 w-[8%]">
                          {getStatusBadge(venue.status)}
                        </td>
                        <td className="px-6 py-2 w-[20%]">
                          <div className="flex items-center justify-center gap-2">
                            {venue.status === "PENDING" ? (
                              <>
                                <button
                                  onClick={() => handleApprove(venue.id)}
                                  disabled={loading}
                                  className="flex items-center gap-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Check className="w-4 h-4" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => openRejectModal(venue.id)}
                                  disabled={loading}
                                  className="flex items-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <X className="w-4 h-4" />
                                  Reject
                                </button>
                              </>
                            ) : (
                              <button className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium rounded-lg transition-colors"
                              onClick={()=>fetchVenueDetails(venue.id)}>
                                <Eye className="w-4 h-4" />
                                View
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + itemsPerPage, filteredVenues.length)} of{" "}
                {filteredVenues.length} results
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2)
                      pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 text-sm font-medium rounded-lg ${
                          currentPage === pageNum
                            ? "bg-indigo-600 text-white"
                            : "text-slate-600 bg-white border border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0  backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl transform transition-all duration-300 ease-out scale-100">
            {/* Header with icon */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Reject Venue
                </h2>
                <p className="text-sm text-gray-500">
                  Please provide a reason for rejection
                </p>
              </div>
            </div>

            {/* Textarea */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Remarks *
              </label>
              <Textarea
                value={rejectModal.remarks}
                onChange={(e) =>
                  setRejectModal({ ...rejectModal, remarks: e.target.value })
                }
                placeholder="Please explain why this venue is being rejected..."
                className="w-full border-2 border-gray-200 rounded-xl p-4 text-sm transition-colors resize-none"
                rows={4}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-400">
                  {rejectModal.remarks.length}/500 characters
                </span>
                {!rejectModal.remarks.trim() && (
                  <span className="text-xs text-red-500">
                    Remarks are required
                  </span>
                )}
              </div>
            </div>

            {/* Warning message */}
            <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-amber-600 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <div>
                  <p className="text-xs font-medium text-amber-800">
                    Important Notice
                  </p>
                  <p className="text-xs text-amber-700">
                    The event organizer will be notified of the rejection and
                    your remarks.
                  </p>
                </div>
              </div>
            </div>
            {/* Action buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() =>
                  setRejectModal({ isOpen: false, venueId: 0, remarks: "" })
                }
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectModal.remarks.trim()}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 shadow-lg disabled:shadow-none"
              >
                Reject Venue
              </button>
            </div>
          </div>
        </div>
      )}
{venueDetailsModal.isOpen && (
  <div className="fixed inset-0 bg-black/50  flex items-center justify-center z-50 p-3 animate-in fade-in duration-200">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg transform transition-all duration-300 animate-in zoom-in-95">
      {/* Header */}
      <div className="relative px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Venue Details</h2>
            <p className="text-gray-500 text-xs mt-1">Complete venue information</p>
          </div>
          <button
            onClick={() =>
              setVenueDetailsModal({
                isOpen: false,
                venueId: null,
                data: null,
                loading: false,
              })
            }
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 text-sm">
        {venueDetailsModal.loading ? (
          <div className="flex flex-col justify-center items-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-gray-900 absolute top-0 left-0"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium text-sm">
              Loading venue details...
            </p>
          </div>
        ) : venueDetailsModal.data ? (
          <div className="space-y-4">
            {/* Venue Name Card */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Venue Name
                  </h3>
                  <p className="text-xl font-bold text-gray-900">
                    {venueDetailsModal.data.name}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <svg
                    className="w-6 h-6 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-start space-x-3">
                <div className="bg-gray-50 rounded-lg p-2 flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Location Address
                  </h3>
                  <p className="text-sm text-gray-900 font-medium leading-relaxed">
                    {venueDetailsModal.data.address}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    {venueDetailsModal.data.city},{" "}
                    {venueDetailsModal.data.state} -{" "}
                    {venueDetailsModal.data.postalCode}
                  </p>
                </div>
              </div>
            </div>

            {/* Type + Status Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Type Card */}
              <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-colors">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Venue Type
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-md bg-gray-100">
                    <svg
                      className="w-4 h-4 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {venueDetailsModal.data.shared ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 20H4v-2a3 3 0 015.356-1.857M15 11a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      )}
                    </svg>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700">
                    {venueDetailsModal.data.shared ? "Shared" : "Private"}
                  </span>
                </div>
              </div>

              {/* Status Card */}
              <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-colors">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Current Status
                </h3>
                <div className="flex items-center">
                  {getStatusBadge(venueDetailsModal.data.status)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-gray-100 rounded-full p-4 mb-3">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <p className="text-gray-500 font-medium text-sm">No venue details found</p>
            <p className="text-gray-400 text-xs mt-1">Please try again later</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl flex justify-between items-center">
        <p className="text-xs text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </p>
        <button
          onClick={() =>
            setVenueDetailsModal({
              isOpen: false,
              venueId: null,
              data: null,
              loading: false,
            })
          }
          className="px-6 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transform hover:scale-105 transition-all duration-200 shadow-md"
        >
          Close
        </button>
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
    </div>
  );
};

export default VenueManagementTable;
