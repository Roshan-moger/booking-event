import  React from "react";
import { useEffect, useState } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Pencil,
  Trash2,
  PlusCircle,
  IndianRupee,
  CreditCard,
  RefreshCw,
  CheckCircle,
  ImageIcon,
  Upload,
  Sparkles,
} from "lucide-react";
import Slider from "react-slick";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import Toast from "../../components/UI/toast";
import DeletePopup from "../../components/UI/DeletePopup";

interface Seat {
  row: string;
  number: number;
  categoryId: string;
  categoryName: string;
  price: number;
  status: "AVAILABLE" | "BOOKED";
}

interface Event {
  id: number;
  title: string;
  description: string;
  categoryName: string;
  venueName: string;
  venueId: number;
  startDate: string;
  endDate: string;
  ratings: number;
  capacity: number;
  ticketPrice: number;
  seatingType: "SEAT_LAYOUT" | "GENERAL_ADMISSION";
  totalSeats: number;
  rows: number;
  columns: number;
  seats: Seat[];
  mode: "WITH_TICKETING" | "WITHOUT_TICKETING";
  organizerFeeAmount: number;
  organizerFeeStatus: "PAID" | "DUE" | "FAILED" | "REFUNDED" | "PENDING";
  status: "PENDING" | "APPROVED" | "REJECTED";
  imageUrls: string[];
  hasActiveAd: boolean;
  remarks: string;
}

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
  onPayment: (event: Event) => void;
  onReapprove: (event: Event) => void;
  onImageChange: (event: Event) => void;
}

interface ToastProps {
  isOpen: boolean;
  message: string;
  type?: "success" | "error" | "info";
}

interface ImageUploadPopupProps {
  open: boolean;
  event: Event | null;
  onConfirm: (file: File) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ImageUploadPopup: React.FC<ImageUploadPopupProps> = ({
  open,
  event,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    if (selectedFile) {
      onConfirm(selectedFile);
      setSelectedFile(null);
      setPreview("");
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview("");
    onCancel();
  };

  if (!open || !event) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-blue-100/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Update Event Poster
            </h3>
            <p className="text-sm text-slate-600">
              Upload a new image for "{event.title}"
            </p>
          </div>
        </div>

        <div className="mb-6">
          {/* File Input */}
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isLoading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="border-2 border-dashed border-blue-200 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
              <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">
                {selectedFile ? selectedFile.name : "Click to upload image"}
              </p>
              <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</p>
            </div>
          </div>

          {/* Preview */}
          {preview && (
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-700 mb-2">
                Preview:
              </p>
              <img
                src={preview || "/placeholder.svg"}
                alt="Preview"
                className="w-full h-40 object-cover rounded-lg border border-blue-200"
              />
            </div>
          )}

          {/* Info */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700">
              <strong>Recommended:</strong> 1140×300px or 180×250px, PNG/JPEG
              format
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedFile || isLoading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Reapproval Popup Component
interface ReapprovalPopupProps {
  open: boolean;
  event: Event | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const ReapprovalPopup: React.FC<ReapprovalPopupProps> = ({
  open,
  event,
  onConfirm,
  onCancel,
}) => {
  if (!open || !event) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-amber-100/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Send for Re-approval
            </h3>
            <p className="text-sm text-slate-600">
              This will submit your event for review again
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-slate-700">
            Are you sure you want to send <strong>"{event.title}"</strong> for
            re-approval?
          </p>
          <p className="text-xs text-slate-500 mt-2">
            The event will be reviewed by our team and you'll be notified once
            approved.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
          >
            Send for Re-approval
          </button>
        </div>
      </div>
    </div>
  );
};

const EventImageCarousel = ({ images }: any) => {
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-52 bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
        No image available
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <img
        src={`https://spot.app.codevicesolution.in${images[0]}`}
        alt="Event"
        className="w-full h-52 object-cover rounded-t-xl"
      />
    );
  }

  const settings = {
    dots: true,
    infinite: true,
    speed: 400,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
  };

  return (
    <div className="relative w-full h-52 overflow-hidden rounded-t-xl">
      <Slider {...settings}>
        {images.map((img: any, index: any) => (
          <div key={index}>
            <img
              src={`https://spot.app.codevicesolution.in${img}`}
              alt={`Event Image ${index + 1}`}
              className="w-full h-52 object-cover"
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};
const EventCard: React.FC<EventCardProps> = ({
  event,
  onEdit,
  onDelete,
  onPayment,
  onReapprove,
  onImageChange,
}) => {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const getApprovalStatusConfig = (status: Event["status"]) => {
    switch (status) {
      case "APPROVED":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          dot: "bg-emerald-500",
        };
      case "PENDING":
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          dot: "bg-amber-500",
        };
      case "REJECTED":
        return { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" };
      default:
        return {
          bg: "bg-slate-50",
          text: "text-slate-700",
          dot: "bg-slate-500",
        };
    }
  };

  const availableSeats =
    event.seats?.filter((seat) => seat.status === "AVAILABLE").length || 0;
  const approvalConfig = getApprovalStatusConfig(event.status);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-blue-200 transition-all duration-300 group flex flex-col">
      {/* Image Section */}
      <div className="relative h-52 bg-gradient-to-br from-blue-50 to-orange-50">
        {event.imageUrls.length > 0 ? (
          <EventImageCarousel images={event.imageUrls} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-orange-100 flex items-center justify-center">
            <Calendar className="w-12 h-12 text-blue-300" />
          </div>
        )}

        {/* Overlay for badges and action buttons */}
        <div className="absolute inset-0 p-4 flex justify-between items-start bg-gradient-to-b from-black/30 via-transparent to-transparent">
          <div className="flex flex-col gap-2">
            <div
              className={`${approvalConfig.bg} ${approvalConfig.text} px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm border border-white/30 backdrop-blur-sm`}
            >
              <div className={`w-2 h-2 rounded-full ${approvalConfig.dot}`} />
              {event.status}
            </div>
          </div>

          <div className="flex flex-col gap-2 items-end">
            {event.hasActiveAd && (
              <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-white border border-amber-300 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md backdrop-blur-sm">
                <Sparkles className="w-3 h-3" />
                PROMOTED
              </div>
            )}

            {event.status === "PENDING" && (
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(event);
                  }}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white shadow-sm border border-white/30 transition-all duration-200 group/btn hover:shadow-lg"
                  title="Edit Event"
                >
                  <Pencil className="w-4 h-4 text-blue-600 group-hover/btn:text-blue-700" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(event);
                  }}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white shadow-sm border border-white/30 transition-all duration-200 group/btn hover:shadow-lg"
                  title="Delete Event"
                >
                  <Trash2 className="w-4 h-4 text-red-600 group-hover/btn:text-red-700" />
                </button>
              </div>
            )}
            {event.status === "APPROVED" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onImageChange(event);
                }}
                className="px-3 py-2 bg-blue-100/95 backdrop-blur-sm text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 flex items-center gap-1.5 text-xs font-semibold shadow-sm border border-blue-300/50 hover:shadow-md"
                title="Change Event Image"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Add Image
              </button>
            )}
            {event.status === "REJECTED" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReapprove(event);
                }}
                className="px-3 py-2 bg-amber-100/95 backdrop-blur-sm text-amber-700 rounded-lg hover:bg-amber-200 transition-all duration-200 flex items-center gap-1.5 text-xs font-semibold shadow-sm border border-amber-300/50 hover:shadow-md"
                title="Send for Re-approval"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Re-approve
              </button>
            )}
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          {event.seatingType === "SEAT_LAYOUT" && (
            <div className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm border border-white/30">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-slate-700">{availableSeats} available</span>
            </div>
          )}
          {event.seatingType === "GENERAL_ADMISSION" && (
            <div className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm border border-white/30">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-slate-700">{event.capacity} available</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            {event.categoryName || "Yoga"}
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {event.title}
          <p className="text-sm text-slate-500 truncate font-medium">
            {event.venueName}
          </p>
        </h3>

                    <p className="text-slate-600 text-sm mb-4 line-clamp-2 font-medium">
          {event.description}
        </p>

        <div className="space-y-1 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-600 group/item">
            <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="flex items-center gap-2 text-sm text-slate-700 font-medium">
              {formatDate(event.startDate)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 group/item">
                        <Clock className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="flex items-center gap-2 text-sm text-slate-700 font-medium">
              {formatTime(event.startDate)} - {formatTime(event.endDate)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 group/item">
            <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="truncate flex items-center gap-2 text-sm text-slate-700 font-medium">
              {event.venueName}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-3 border-t border-blue-100 mb-4">
          <div
            className={`flex items-center gap-1 font-semibold ${
              event.organizerFeeStatus === "PAID"
                ? "text-emerald-600"
                : "text-amber-600"
            }`}
          >
            <IndianRupee className="w-3 h-3" />
            <span>Fee {event.organizerFeeStatus.toLowerCase()}</span>
          </div>
          {event.seatingType === "SEAT_LAYOUT" && (
            <span className="text-slate-500 font-medium">
              {event.rows}×{event.columns} seats
            </span>
          )}
        </div>

        {/* Pending/Rejected Messages */}
        <div className="flex-1 flex flex-col justify-end">
          {event.status === "PENDING" && (
            <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200 mb-2">
              <p className="text-sm text-amber-800 font-semibold">
                Event pending approval
              </p>
              <p className="text-xs text-amber-600 mt-1">
                You can edit or delete this event using the buttons above
              </p>
            </div>
          )}

          {event.status === "REJECTED" && (
            <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200 mb-2">
              <p className="text-sm text-red-800 font-semibold">
                Event was rejected
              </p>
              <p className="text-xs text-red-600 mt-1">
                <span className="font-semibold">Reason:</span> {event.remarks}
              </p>
            </div>
          )}

          {/* Payment Button */}
          {event.organizerFeeStatus === "PAID" && (
            <button
              disabled
              className="w-full mt-2 flex items-center justify-center gap-2 bg-emerald-100 text-emerald-700 border border-emerald-300 font-semibold py-2.5 rounded-lg cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4" />
              Organizer Fee Paid
            </button>
          )}

          {(event.organizerFeeStatus === "DUE" ||
            event.organizerFeeStatus === "PENDING") &&
            event.status === "APPROVED" && (
              <button
                onClick={() => onPayment(event)}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg group/btn"
              >
                <CreditCard className="w-4 h-4" />
                Pay Organizer Fee (₹{event.organizerFeeAmount})
              </button>
            )}
        </div>
      </div>
    </div>
  );
};

const EventCards: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const [showDelete, setShowDelete] = useState<boolean>(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [showReapprove, setShowReapprove] = useState(false);
  const [eventToReapprove, setEventToReapprove] = useState<Event | null>(null);
  const [venues, setVenues] = useState<{ id: number; name: string }[]>([
    { id: 0, name: "Select" },
  ]);
  const [selectedVenueId, setSelectedVenueId] = useState<string>("");
  const [toast, setToast] = useState<ToastProps>({
    isOpen: false,
    type: "success",
    message: "",
  });
  const [showImagePopup, setShowImagePopup] = useState<boolean>(false);
  const [eventToUpdateImage, setEventToUpdateImage] = useState<Event | null>(
    null
  );
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

  useEffect(() => {
    fetchEvents();
    fetchVenues();
  }, []);

  useEffect(() => {
    if (selectedVenueId) {
      fetchEventsByID(selectedVenueId);
    }
  }, [selectedVenueId]);

  const fetchEvents = async () => {
    try {
      const res = await axiosInstance.get(`/organizer/events/my-events`);
      const data: Event[] = res.data.map((item: any) => ({
        ...item,
        imageUrls: item.imageUrls || [],
        status: item.status || "PENDING",
      }));
      setEvents(data);
    } catch (err) {
      console.error("Failed to fetch events", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVenues = async () => {
    try {
      const res = await axiosInstance.get(`/organizer/venues/mine`);
      setVenues([...venues, ...res.data]);
    } catch (err) {
      console.error("Failed to fetch venues", err);
    }
  };

  const fetchEventsByID = async (venueId: string) => {
    setLoading(true);
    if (venueId == "0") {
      fetchEvents();
      return;
    }
    try {
      const res = await axiosInstance.get(`/organizer/events/venue/${venueId}`);
      const data: Event[] = res.data.map((item: any) => ({
        ...item,
        imageUrls: item.imageUrls || [],
        status: item.status || "PENDING",
      }));
      setEvents(data);
    } catch (err) {
      console.error("Failed to fetch events", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;
    try {
      const response = await axiosInstance.delete(
        `/organizer/events/${eventToDelete.id}`
      );
      if (response.status === 204) {
        setShowDelete(false);
        setEventToDelete(null);
        setToast({
          isOpen: true,
          type: "success",
          message: "Event deleted successfully!",
        });
        fetchEvents();
      }
    } catch (error: any) {
      console.error(error);
      setToast({
        isOpen: true,
        type: "error",
        message:
          error?.response?.data?.message ||
          "Failed to delete event. Please try again.",
      });
    }
  };

  const handleReapprove = async () => {
    if (!eventToReapprove) return;

    try {
      const response = await axiosInstance.put(
        `/organizer/events/${eventToReapprove.id}/resubmit`
      );

      if (response.status === 200) {
        setShowReapprove(false);
        setEventToReapprove(null);
        setToast({
          isOpen: true,
          type: "success",
          message: "Event sent for re-approval successfully!",
        });
        fetchEvents();
      }
    } catch (error: any) {
      setToast({
        isOpen: true,
        type: "error",
        message:
          error?.response?.data?.message ||
          "Failed to send event for re-approval. Please try again.",
      });
    }
  };

  const handleEdit = (eventData: Event) => {
    navigate(`event/edit/${eventData.id}`);
  };

  const handleCreateEvent = () => {
    navigate(`/venues`);
  };

  const handlePayment = async (eventData: Event) => {
    navigate(`payment/event/${eventData.id}`);
  };

  const handleImageChange = (event: Event) => {
    setEventToUpdateImage(event);
    setShowImagePopup(true);
  };

  const handleSaveImage = async (file: File) => {
    if (!eventToUpdateImage) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("files", file);

      const response = await axiosInstance.post(
        `/events/${eventToUpdateImage.id}/images`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response?.status === 200 || response?.status === 201) {
        setToast({
          isOpen: true,
          type: "success",
          message: "Event image updated successfully!",
        });
        setShowImagePopup(false);
        setEventToUpdateImage(null);
        fetchEvents();
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      setToast({
        isOpen: true,
        type: "error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to upload image. Please try again.",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-orange-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-blue-100 top-0 z-10 shadow-sm">
        <div className="px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Title Section */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Events</h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage and track your events
            </p>
          </div>

          {/* Venue Filter Dropdown */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label
              htmlFor="venue"
              className="text-sm font-semibold text-slate-700 whitespace-nowrap"
            >
              Venue:
            </label>
            <select
              id="venue"
              value={selectedVenueId}
              onChange={(e) => setSelectedVenueId(e.target.value)}
              className="flex-1 sm:flex-none px-4 py-2 border-2 border-blue-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300"
            >
              {venues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 sm:px-8 py-8">
        {events.length > 0 ? (
          <>
            {/* Stats */}
            <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200 hover:shadow-lg transition-shadow">
                <div className="text-3xl font-bold text-blue-700">
                  {events.length}
                </div>
                <div className="text-sm text-blue-600 font-medium mt-1">
                  Total Events
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 rounded-xl border border-emerald-200 hover:shadow-lg transition-shadow">
                <div className="text-3xl font-bold text-emerald-700">
                  {events.filter((e) => e.status === "APPROVED").length}
                </div>
                <div className="text-sm text-emerald-600 font-medium mt-1">
                  Approved
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-xl border border-amber-200 hover:shadow-lg transition-shadow">
                <div className="text-3xl font-bold text-amber-700">
                  {events.filter((e) => e.status === "PENDING").length}
                </div>
                <div className="text-sm text-amber-600 font-medium mt-1">
                  Pending
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-5 rounded-xl border border-red-200 hover:shadow-lg transition-shadow">
                <div className="text-3xl font-bold text-red-700">
                  {
                    events.filter(
                      (e) =>
                        (e.organizerFeeStatus === "DUE" ||
                          e.organizerFeeStatus === "PENDING") &&
                        e.status === "APPROVED"
                    ).length
                  }
                </div>
                <div className="text-sm text-red-600 font-medium mt-1">
                  Payment Due
                </div>
              </div>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onEdit={handleEdit}
                  onDelete={(ev) => {
                    setEventToDelete(ev);
                    setShowDelete(true);
                  }}
                  onPayment={handlePayment}
                  onReapprove={(ev) => {
                    setEventToReapprove(ev);
                    setShowReapprove(true);
                  }}
                  onImageChange={handleImageChange}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="bg-gradient-to-br from-white via-blue-50 to-orange-50 rounded-3xl border-2 border-blue-100 p-16 max-w-md mx-auto shadow-lg">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                No events yet
              </h3>
              <p className="text-slate-600 text-base mb-8 leading-relaxed">
                Start by creating your first event to engage your audience and
                grow your business.
              </p>
              <button
                onClick={() => handleCreateEvent()}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg group/btn"
              >
                <PlusCircle className="w-5 h-5" />
                Create Your First Event
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      <Toast
        isOpen={toast.isOpen}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />

      {/* Delete Confirmation */}
      {showDelete && eventToDelete && (
        <DeletePopup
          open={showDelete}
          title="Delete Event"
          description={`Are you sure you want to delete "${eventToDelete.title}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => {
            setShowDelete(false);
            setEventToDelete(null);
          }}
        />
      )}

      {/* Re-approval Confirmation */}
      <ReapprovalPopup
        open={showReapprove}
        event={eventToReapprove}
        onConfirm={handleReapprove}
        onCancel={() => {
          setShowReapprove(false);
          setEventToReapprove(null);
        }}
      />

      <ImageUploadPopup
        open={showImagePopup}
        event={eventToUpdateImage}
        onConfirm={handleSaveImage}
        onCancel={() => {
          setShowImagePopup(false);
          setEventToUpdateImage(null);
        }}
        isLoading={isUploadingImage}
      />
    </div>
  );
};

export default EventCards;
