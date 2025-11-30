import React from "react";
import { useEffect, useState } from "react";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "../../components/UI/button";
import Label from "../../components/UI/label";
import { Input } from "../../components/UI/input";
import Textarea from "../../components/UI/textarea";
import SeatLayoutEditor from "../../components/seat-layout-editor";
import Toast from "../../components/UI/toast";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate, useParams } from "react-router-dom";



interface SeatLayout {
  row: string;
  number: number;
  categoryName: string;
  color: string;
  price: number;
}

interface EventFormData {
  eventName: string;
  description: string;
  venueId: number;
  selectedDate: Date | null;
  selectedTime: Date | null;
  selectedTags: any;
  ticketType: "WITH_TICKETING" | "PROMOTION_ONLY";
  seatingType: "GENERAL_ADMISSION" | "SEAT_LAYOUT";
  capacity: string;
  ticketPrice: string;
  rows: string;
  columns: string;
  categories: any[];
  layout: SeatLayout[];
  posterImage?: File;
}

interface ToastProps {
  isOpen: boolean;
  message: string;
  type?: "success" | "error" | "info";
}

interface TagCategory {
  id?: number;
  name: string;
  color: string;
}

const CreateEvent = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { action, venueId } = useParams();
  const [formData, setFormData] = useState<EventFormData>({
    eventName: "",
    description: "",
    venueId: Number.parseInt(venueId as string),
    selectedDate: new Date(),
    selectedTime: new Date(),
    selectedTags: 0,
    ticketType: "WITH_TICKETING",
    seatingType: "GENERAL_ADMISSION",
    capacity: "",
    ticketPrice: "",
    rows: "5",
    columns: "10",
    categories: [],
    layout: [],
  });
  const [image, setImage] = useState("");
  const [toast, setToast] = useState<ToastProps>({
    isOpen: false,
    type: "success",
    message: "",
  });

  const [tagCategory, setTagCategory] = useState<TagCategory[]>([]);
  const [showImagePopup, setShowImagePopup] = useState<boolean>(false);
  const [eventId, setEventId] = useState("");

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    setToast({
      isOpen: true,
      message,
      type,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData((prev) => ({ ...prev, posterImage: file }));
      setImage(URL.createObjectURL(file));
      showToast("Poster uploaded successfully!", "success");
    }
  };

  // useEffect(() => {
  //   getCategory();
  // }, []);

  const getCategory = async () => {
    try {
      const response = await axiosInstance.get("/organizer/events/categories");
      const apiCategories = response.data.map((item: any) => ({
        ...item,
        color: "bg-[#e0e0e0] text-[#333333]",
      }));
      setTagCategory(apiCategories);
    } catch (error: any) {
      console.error(
        "Error fetching categories:",
        error.response?.data || error.message
      );
    }
  };

  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTagToggle = (tagID: any) => {
    setFormData((prev) => ({
      ...prev,
      selectedTags: tagID,
    }));
  };

  const handleSeatLayoutChange = (layout: any) => {
    setFormData((prev) => ({
      ...prev,
      layout: layout.seats || layout.layout || [],
      categories: (layout.categories || prev.categories).map((cat: any) => ({
        name: cat.name,
        price: Number(cat.price) || 0,
        color: cat.color,
      })),
      rows: layout.rows ? layout.rows.toString() : prev.rows,
      columns: layout.columns ? layout.columns.toString() : prev.columns,
    }));
  };

  useEffect(() => {
    getCategory();
    if (action === "edit" && venueId) {
      const fetchEvent = async () => {
        try {
          const res = await axiosInstance.get(`/organizer/events/${venueId}`);
          const data = res.data;
          
        setFormData((prev) => {
  const extractedCategories = data.seats
    ? [
        ...new Map(
          data.seats.map((s : any) => [
            s.categoryId,
            {
              name: s.categoryName,
              price: s.price,
              color: s.color, 
            },
          ])
        ).values(),
      ]
    : [];

  return {
    ...prev,
    eventName: data.title,
    description: data.description,
    venueId: data.venueId,
    selectedDate: new Date(data.startDate),
    selectedTime: new Date(data.startDate),
    ticketType: data.mode,
    seatingType: data.seatingType,
    capacity: data.capacity?.toString() || "",
    ticketPrice: data.ticketPrice?.toString() || "",
    rows: data.rows?.toString() || "0",
    columns: data.columns?.toString() || "0",
    categories: extractedCategories, // <-- updated
    layout: data.seats || [],
    posterImage: data.imageUrls[0]
      ? data.imageUrls[0].split("/").pop()
      : "",
  };
});

          const TagName = data.categoryName;
          const matchedTag = tagCategory.find((tag) => tag.name === TagName);
          console.log(tagCategory);
          if (matchedTag) {
            setFormData((prev) => ({
              ...prev,
              selectedTags: matchedTag.id,
            }));
          }
        } catch (err) {
          console.error("Error fetching event:", err);
        }
      };
      fetchEvent();
    }
  }, [action, venueId]);

  const handleSubmitEvent = async () => {
    setIsSubmitting(true);

    try {
      if (
        !formData.eventName ||
        !formData.selectedDate ||
        !formData.selectedTime
      ) {
        showToast("Please fill all required fields", "error");
        setIsSubmitting(false);
        return;
      }

      const startDate = new Date(formData.selectedDate);
      startDate.setHours(formData.selectedTime?.getHours() || 0);
      startDate.setMinutes(formData.selectedTime?.getMinutes() || 0);

      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 3);

      const categoryId = formData.selectedTags;

      const requestPayload: any = {
        title: formData.eventName,
        description: formData.description || "No description provided",
        venueId: formData.venueId,
        categoryId: categoryId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        priceType: "FIXED",
        mode: formData.ticketType,
        seatingType: formData.seatingType,
        organizerFeeAmount: 0,
      };

      if (formData.ticketType === "WITH_TICKETING") {
        if (formData.seatingType === "GENERAL_ADMISSION") {
          requestPayload.capacity = Number(formData.capacity) || 0;
          requestPayload.ticketPrice = Number(formData.ticketPrice) || 0;
        } else if (formData.seatingType === "SEAT_LAYOUT") {
          requestPayload.rows = Number(formData.rows) || 0;
          requestPayload.columns = Number(formData.columns) || 0;
          requestPayload.categories =
            formData.categories?.map((c) => ({
              name: c.name,
              price: Number(c.price) || 0,
              color: c.color,
            })) || [];
          requestPayload.seats =
            formData.layout?.map((s) => ({
              row: s.row,
              number: Number(s.number),
              categoryName: s.categoryName,
            })) || [];
        }
      }

      let response;
      if (action === "edit" && venueId) {
        response = await axiosInstance.put(
          `/organizer/events/${venueId}`,
          requestPayload
        );
      } else if (action === "add") {
        response = await axiosInstance.post(
          `/organizer/events`,
          requestPayload
        );
      }

      if (response?.status === 200 || response?.status === 201) {
        setEventId(response.data.id);
        showToast(
          action === "edit"
            ? "Event updated successfully!"
            : "Event created successfully!",
          "success"
        );
        setShowImagePopup(true);
      }
    } catch (error: any) {
      console.error("Error saving event:", error);
      showToast(
        error.response?.data?.message ||
          error.message ||
          "Failed to save event",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToVenuePage = () => {
    navigate(-1);
  };

  const handleSavePoster = async () => {
    try {
      if (!formData.posterImage) {
        showToast("Please select at least one image to upload.", "error");
        return;
      }

      const form = new FormData();
      if (formData.posterImage instanceof File) {
        form.append("files", formData.posterImage);
      }

      let response;

      if (action === "edit" && eventId) {
        response = await axiosInstance.post(`/events/${eventId}/images`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else if (action === "add") {
        response = await axiosInstance.post(`/events/${eventId}/images`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (response?.status === 200 || response?.status === 201) {
        showToast(
          action === "edit"
            ? "Event images updated successfully!"
            : "Event images uploaded successfully!",
          "success"
        );
        navigate("/my-events");
        setShowImagePopup(false);
      }
    } catch (error: any) {
      console.error("Error uploading images:", error);
      showToast(
        error.response?.data?.message ||
          error.message ||
          "Failed to upload images",
        "error"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-4">
      <div className="">
        <div className="flex justify-between items-start sm:items-center gap-3 mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            {action === "edit" ? "UPDATE EVENT" : "CREATE EVENT"}
          </h1>
          <Button
            onClick={handleGoToVenuePage}
            variant="secondary"
            className="px-3 h-10 border-2 border-slate-300 hover:border-[#5d33fb] bg-white hover:bg-slate-50 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="sm:hidden">Venues</span>
            <span className="hidden sm:inline">Go to Venues</span>
          </Button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 space-y-6 sm:space-y-8">
          {/* Event Name */}
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-3 block">
              Event Name *
            </Label>
            <Input
              placeholder="Name of the Event"
              value={formData.eventName}
              onChange={(e: any) =>
                handleInputChange("eventName", e.target.value)
              }
              className="w-full h-10 sm:h-12 text-base sm:text-lg border-2 border-slate-200 focus:border-[#5d33fb] rounded-xl transition-all duration-200"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 w-full">
            <div className="w-full">
              <Label className="text-sm font-semibold text-slate-700 mb-4 block">
                Scheduled Date *
              </Label>
              <div className="relative w-full group">
                <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 z-10">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-[#5d33fb] group-hover:text-[#7c3aed] transition-colors duration-200" />
                </div>
                <DatePicker
                  selected={formData.selectedDate}
                  onChange={(date) => handleInputChange("selectedDate", date)}
                  dateFormat="EEEE, MMMM dd, yyyy"
                  className="w-full h-12 sm:h-14 pl-12 sm:pl-14 pr-3 sm:pr-4 text-base sm:text-lg font-medium border-2 border-slate-200 rounded-xl focus:border-[#5d33fb] focus:ring-4 focus:ring-[#5d33fb]/20 transition-all duration-200 bg-gradient-to-r from-white to-slate-50 hover:from-slate-50 hover:to-white cursor-pointer"
                  placeholderText="Select your event date"
                  wrapperClassName="w-full"
                />
              </div>
            </div>

            <div className="w-full">
              <Label className="text-sm font-semibold text-slate-700 mb-4 block">
                Event Time *
              </Label>
              <div className="relative w-full group">
                <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 z-10">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-[#5d33fb] group-hover:text-[#7c3aed] transition-colors duration-200" />
                </div>
                <DatePicker
                  selected={formData.selectedTime}
                  onChange={(time) => handleInputChange("selectedTime", time)}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Select Time"
                  dateFormat="hh:mm aa"
                  className="w-full h-12 sm:h-14 pl-12 sm:pl-14 pr-3 sm:pr-4 text-base sm:text-lg font-medium border-2 border-slate-200 rounded-xl focus:border-[#5d33fb] focus:ring-4 focus:ring-[#5d33fb]/20 transition-all duration-200 bg-gradient-to-r from-white to-slate-50 hover:from-slate-50 hover:to-white cursor-pointer"
                  placeholderText="Choose event time"
                  wrapperClassName="w-full"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-3 block">
              Tags
            </Label>
            <div className="text-sm text-slate-500 mb-4">
              Choose the relevant Tags
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {tagCategory.map((tag, index) => (
                <button
                  key={index}
                  onClick={() => handleTagToggle(tag.id)}
                  className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    formData.selectedTags === tag.id
                      ? "bg-[#5d33fb] text-white"
                      : tag.color
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-3 block">
              Description
            </Label>
            <Textarea
              placeholder="Description of the Event.....Note that this will be seen in the user event card"
              value={formData.description}
              onChange={(e: any) =>
                handleInputChange("description", e.target.value)
              }
              className="w-full h-20 sm:h-24 text-base sm:text-lg border-2 border-slate-200 focus:border-[#5d33fb] rounded-xl transition-all duration-200 resize-none"
            />
          </div>

          {/* Ticketing */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-3 block">
                Ticketing *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div
                  className={`flex items-center space-x-2 border rounded-lg p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    formData.ticketType === "WITH_TICKETING"
                      ? "border-[#5d33fb] bg-[#5d33fb]/5"
                      : "border-[#cccccc]"
                  }`}
                  onClick={() =>
                    handleInputChange("ticketType", "WITH_TICKETING")
                  }
                >
                  <input
                    type="radio"
                    id="with-ticketing"
                    name="ticketType"
                    value="WITH_TICKETING"
                    checked={formData.ticketType === "WITH_TICKETING"}
                    onChange={() =>
                      handleInputChange("ticketType", "WITH_TICKETING")
                    }
                    className="h-4 w-4 accent-[#5d33fb] cursor-pointer"
                  />
                  <label
                    htmlFor="with-ticketing"
                    className="text-sm cursor-pointer font-medium"
                  >
                    With Ticketing
                  </label>
                </div>

                <div
                  className={`flex items-center space-x-2 border rounded-lg p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    formData.ticketType === "PROMOTION_ONLY"
                      ? "border-[#5d33fb] bg-[#5d33fb]/5"
                      : "border-[#cccccc]"
                  }`}
                  onClick={() =>
                    handleInputChange("ticketType", "PROMOTION_ONLY")
                  }
                >
                  <input
                    type="radio"
                    id="promotion-only"
                    name="ticketType"
                    value="PROMOTION_ONLY"
                    checked={formData.ticketType === "PROMOTION_ONLY"}
                    onChange={() =>
                      handleInputChange("ticketType", "PROMOTION_ONLY")
                    }
                    className="h-4 w-4 accent-[#5d33fb] cursor-pointer"
                  />
                  <label
                    htmlFor="promotion-only"
                    className="text-sm cursor-pointer font-medium"
                  >
                    Promotion Only
                  </label>
                </div>
              </div>
            </div>

            {/* Seating Type - Only show if WITH_TICKETING */}
            {formData.ticketType === "WITH_TICKETING" && (
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-3 block">
                  Seating Arrangements *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div
                    className={`flex items-center space-x-2 border rounded-lg p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      formData.seatingType === "GENERAL_ADMISSION"
                        ? "border-[#5d33fb] bg-[#5d33fb]/5"
                        : "border-[#cccccc]"
                    }`}
                    onClick={() =>
                      handleInputChange("seatingType", "GENERAL_ADMISSION")
                    }
                  >
                    <input
                      type="radio"
                      id="general-admission"
                      name="seatingType"
                      value="GENERAL_ADMISSION"
                      checked={formData.seatingType === "GENERAL_ADMISSION"}
                      onChange={() =>
                        handleInputChange("seatingType", "GENERAL_ADMISSION")
                      }
                      className="h-4 w-4 accent-[#5d33fb] cursor-pointer"
                    />
                    <label
                      htmlFor="general-admission"
                      className="text-sm cursor-pointer font-medium"
                    >
                      General Admission
                    </label>
                  </div>

                  <div
                    className={`flex items-center space-x-2 border rounded-lg p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      formData.seatingType === "SEAT_LAYOUT"
                        ? "border-[#5d33fb] bg-[#5d33fb]/5"
                        : "border-[#cccccc]"
                    }`}
                    onClick={() =>
                      handleInputChange("seatingType", "SEAT_LAYOUT")
                    }
                  >
                    <input
                      type="radio"
                      id="seat-layout"
                      name="seatingType"
                      value="SEAT_LAYOUT"
                      checked={formData.seatingType === "SEAT_LAYOUT"}
                      onChange={() =>
                        handleInputChange("seatingType", "SEAT_LAYOUT")
                      }
                      className="h-4 w-4 accent-[#5d33fb] cursor-pointer"
                    />
                    <label
                      htmlFor="seat-layout"
                      className="text-sm cursor-pointer font-medium"
                    >
                      Seat Layout
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Price and Capacity - Only show for WITH_TICKETING and GENERAL_ADMISSION */}
          {formData.ticketType === "WITH_TICKETING" &&
            formData.seatingType === "GENERAL_ADMISSION" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-3 block">
                    Event Price *
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-500 text-base sm:text-lg font-medium">
                      ₹
                    </span>
                    <Input
                      placeholder="Enter ticket price (e.g., 299)"
                      value={formData.ticketPrice}
                      onChange={(e: any) =>
                        handleInputChange("ticketPrice", e.target.value)
                      }
                      className="w-full h-10 sm:h-12 pl-8 sm:pl-10 pr-3 sm:pr-4 text-base sm:text-lg border-2 border-slate-200 focus:border-[#5d33fb] rounded-xl transition-all duration-200"
                      type="number"
                    />
                  </div>
                  <div className="text-xs sm:text-sm text-slate-500 mt-2">
                    Set the price per ticket for your event
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-3 block">
                    Capacity *
                  </Label>
                  <Input
                    placeholder="Enter event capacity (e.g., 100)"
                    value={formData.capacity}
                    onChange={(e: any) =>
                      handleInputChange("capacity", e.target.value)
                    }
                    className="w-full h-10 sm:h-12 text-base sm:text-lg border-2 border-slate-200 focus:border-[#5d33fb] rounded-xl transition-all duration-200"
                    type="number"
                  />
                  <div className="text-xs sm:text-sm text-slate-500 mt-2">
                    Maximum number of attendees
                  </div>
                </div>
              </div>
            )}

          {/* Seat Layout Editor - Only show for WITH_TICKETING and SEAT_LAYOUT */}
          {formData.ticketType === "WITH_TICKETING" &&
            formData.seatingType === "SEAT_LAYOUT" && (
              <div>
                <Label className="text-sm font-semibold text-slate-700 mb-3 block">
                  Seat Layout Design
                </Label>
                <div className="text-xs sm:text-sm text-slate-500 mb-4">
                  Design your venue's seating arrangement. Click seats to assign
                  categories (VIP, Regular, Balcony) and create walk spaces.
                </div>
                <SeatLayoutEditor
                  onLayoutChange={handleSeatLayoutChange}
                  initialLayout={
                    formData.layout
                      ? {
                          rows: Number.parseInt(formData.rows) || 5,
                          columns: Number.parseInt(formData.columns) || 10,
                          seats: formData.layout,
                        }
                      : undefined
                  }
                  onCategoriesChange={(updatedCategories) =>
                    setFormData((prev) => ({
                      ...prev,
                      categories: updatedCategories,
                    }))
                  }
                />
              </div>
            )}

          {/* Action Buttons */}
          <div className="pt-4 sm:pt-6 flex sm:flex-row gap-3 sm:gap-4">
            <Button
              onClick={handleSubmitEvent}
              disabled={isSubmitting}
              className="flex-1 bg-[#1a2c50] hover:bg-[#152340] text-white py-3 text-base sm:text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              {isSubmitting
                ? action === "edit"
                  ? "UPDATING..."
                  : "CREATING..."
                : action === "edit"
                ? "UPDATE EVENT"
                : "CREATE EVENT"}
            </Button>
          </div>
        </div>
      </div>

      {showImagePopup && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg transform transition-all duration-300 animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">
                Upload Event Poster
              </h2>
              <button
                onClick={() => {
                  setShowImagePopup(false);
                  navigate("/my-events");
                }}
                className="text-slate-500 hover:text-slate-800 transition-colors duration-150"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 overflow-y-auto max-h-[80vh]">
              <Label className="text-sm font-semibold text-slate-700 mb-3 block">
                Choose Poster
              </Label>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <Input
                  placeholder="Select your Poster"
                  value={formData.posterImage ? formData.posterImage.name : ""}
                  readOnly
                  className="flex-1 h-10 sm:h-12 text-base sm:text-lg border-2 border-slate-200 focus:border-[#5d33fb] rounded-xl transition-all duration-200"
                />

                <div className="relative w-full sm:w-auto">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button className="bg-[#5d33fb] hover:bg-[#4c2bd9] text-white px-4 py-2 h-10 sm:h-12 w-full sm:w-auto">
                    Choose File
                  </Button>
                </div>
              </div>

              {/* Info Section */}
              <div className="text-xs sm:text-sm text-slate-500 mt-4 space-y-1">
                <div>
                  1. <b>Correct Dimensions:</b> Use 1140×300 or 180×250 sizes.
                </div>
                <div>
                  2. <b>File Format:</b> Use PNG or JPEG.
                </div>
                <div>
                  3. <b>File Size:</b> Optimize for fast upload.
                </div>
                <div>
                  4. <b>Resolution:</b> Minimum 300 DPI for clarity.
                </div>
              </div>

              {/* Preview */}
              {formData.posterImage && (
                <div className="mt-4">
                  <p className="text-sm text-slate-600 mb-2 font-medium">
                    Preview:
                  </p>
                  <img
                    src={image || "/placeholder.svg"}
                    alt="Poster Preview"
                    className="w-full h-48 object-cover rounded-xl border border-slate-200 shadow-sm"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end items-center gap-3 px-6 py-4 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowImagePopup(false);
                  navigate("/my-events");
                }}
                className="text-slate-700 border-slate-300 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSavePoster}
                className="bg-[#5d33fb] hover:bg-[#4c2bd9] text-white rounded-xl"
              >
                Save Poster
              </Button>
            </div>
          </div>
        </div>
      )}

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
          });
        }}
      />
    </div>
  );
};

export default CreateEvent;
