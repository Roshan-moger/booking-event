"use client";

import { useState } from "react";
import {
  Heart,
  Calendar,
  MapPin,
  Clock,
  Users,
  IndianRupee,
  Trash2,

  TrendingUp,
  Ticket,
  Share2,
} from "lucide-react";
import { Button } from "../../components/UI/button";

interface WatchlistEvent {
  id: number;
  title: string;
  description: string;
  categoryName: string;
  venueName: string;
  startDate: string;
  endDate: string;
  ticketPrice: number;
  availableSeats: number;
  totalSeats: number;
  imageUrl: string;
  addedOn: string;
  trending: boolean;
}

const WatchlistPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const [watchlistEvents, setWatchlistEvents] = useState<WatchlistEvent[]>([
    {
      id: 1,
      title: "Rock Music Festival 2024",
      description:
        "Experience the biggest rock bands live in concert with amazing performances all night long.",
      categoryName: "Music",
      venueName: "Madison Square Garden",
      startDate: "2024-12-15T18:00:00",
      endDate: "2024-12-15T23:00:00",
      ticketPrice: 2500,
      availableSeats: 450,
      totalSeats: 1000,
      imageUrl:
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
      addedOn: "2024-11-01T10:30:00",
      trending: true,
    },
    {
      id: 2,
      title: "Stand-Up Comedy Night",
      description:
        "Laugh out loud with the best comedians in town for an unforgettable evening of humor.",
      categoryName: "Comedy",
      venueName: "Comedy Club Downtown",
      startDate: "2024-11-20T20:00:00",
      endDate: "2024-11-20T22:30:00",
      ticketPrice: 800,
      availableSeats: 85,
      totalSeats: 150,
      imageUrl:
        "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800",
      addedOn: "2024-10-28T15:45:00",
      trending: false,
    },
    {
      id: 3,
      title: "Tech Conference 2024",
      description:
        "Join industry leaders and innovators for cutting-edge tech talks and networking.",
      categoryName: "Conference",
      venueName: "Convention Center",
      startDate: "2024-12-01T09:00:00",
      endDate: "2024-12-01T18:00:00",
      ticketPrice: 3500,
      availableSeats: 200,
      totalSeats: 500,
      imageUrl:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
      addedOn: "2024-10-25T09:15:00",
      trending: true,
    },
  ]);

  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error",
  });

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

  const handleRemoveFromWatchlist = (eventId: number) => {
    setWatchlistEvents((prev) => prev.filter((event) => event.id !== eventId));
    setToast({
      isOpen: true,
      message: "Event removed from watchlist",
      type: "success",
    });
    setTimeout(() => setToast({ ...toast, isOpen: false }), 3000);
  };

  const handleShare = (event: WatchlistEvent) => {
    setToast({
      isOpen: true,
      message: `Sharing "${event.title}"`,
      type: "success",
    });
    setSortBy("")
    setTimeout(() => setToast({ ...toast, isOpen: false }), 3000);
  };



  const filteredEvents = watchlistEvents
    .filter(
      (event) =>
        (selectedCategory === "all" ||
          event.categoryName === selectedCategory) &&
        (searchQuery === "" ||
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.venueName.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.addedOn).getTime() - new Date(a.addedOn).getTime();
      } else if (sortBy === "price-low") {
        return a.ticketPrice - b.ticketPrice;
      } else if (sortBy === "price-high") {
        return b.ticketPrice - a.ticketPrice;
      } else if (sortBy === "date") {
        return (
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
      }
      return 0;
    });

  return (
    <div className="bg-gradient-to-br from-background via-background to-blue-50/10 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-blue-100 top-0 z-10 shadow-sm">
        <div className="px-6 py-4 flex flex-row items-start sm:items-center justify-between gap-4">
          {/* Title Section */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900">   My Watchlist</h1>
            <p className="text-sm text-slate-600 mt-1">
   {" "}
                {watchlistEvents.length}{" "}
                {watchlistEvents.length === 1 ? "event" : "events"} saved            </p>
          </div>

          {/* Venue Filter Dropdown */}
          <div className="bg-gradient-to-r from-blue-100 to-orange-100 text-blue-700 px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-sm border border-blue-200">
              <Heart className="w-5 h-5 fill-current" />
              <span>{watchlistEvents.length}</span>
            </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white border-2 border-blue-100 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-blue-300 transition-all duration-300 group transform hover:-translate-y-1"
                >
                  {/* Image Section */}
                  <div className="relative h-52 bg-gradient-to-br from-blue-100 to-orange-50 overflow-hidden">
                    <img
                      src={event.imageUrl || "/placeholder.svg"}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />

                    {/* Overlay badges and actions */}
                    <div className="absolute inset-0 p-4 flex justify-between items-start bg-gradient-to-b from-black/20 to-transparent">
                      <div className="flex flex-col gap-2">
                        <div className="bg-gradient-to-r from-blue-500 to-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md">
                          {event.categoryName}
                        </div>
                        {event.trending && (
                          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md">
                            <TrendingUp className="w-3 h-3" />
                            TRENDING
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleShare(event)}
                          className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white shadow-md border border-white/30 transition-all duration-200 transform hover:scale-110"
                          title="Share Event"
                        >
                          <Share2 className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleRemoveFromWatchlist(event.id)}
                          className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white shadow-md border border-white/30 transition-all duration-200 transform hover:scale-110"
                          title="Remove from Watchlist"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>

                    {/* Bottom overlay with price and seats */}
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                      <div className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md border border-white/30">
                        <Users className="w-4 h-4 text-emerald-600" />
                        <span className="text-slate-800">
                          {event.availableSeats} available
                        </span>
                      </div>
                      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-1 text-sm font-bold shadow-md">
                        <IndianRupee className="w-4 h-4" />
                        {event.ticketPrice}
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-5">
                    {/* Title */}
                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {event.title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2 font-medium">
                      {event.description}
                    </p>

                    {/* Event Details */}
                    <div className="space-y-2 mb-4 bg-slate-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                        <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                        <Clock className="w-4 h-4 text-orange-500 shrink-0" />
                        <span>
                          {formatTime(event.startDate)} -{" "}
                          {formatTime(event.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                        <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="truncate">{event.venueName}</span>
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between text-xs pt-3 border-t border-blue-100">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Heart className="w-3 h-3 fill-current text-blue-500" />
                        <span className="font-medium">
                          Added {new Date(event.addedOn).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-slate-600 font-medium">
                        {event.availableSeats}/{event.totalSeats} seats
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-5 pb-5">
                    <Button     className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg group/btn"
                       >
                      <Ticket className="w-4 h-4" />
                      Book Tickets
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="bg-white rounded-2xl border-2 border-blue-100 p-12 max-w-md mx-auto shadow-sm">
                <Heart className="w-16 h-16 text-blue-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {searchQuery || selectedCategory !== "all"
                    ? "No events found"
                    : "Your watchlist is empty"}
                </h3>
                <p className="text-slate-600 text-sm mb-6 font-medium">
                  {searchQuery || selectedCategory !== "all"
                    ? "Try adjusting your filters to find events"
                    : "Start adding events to your watchlist to keep track of them"}
                </p>
                {(searchQuery || selectedCategory !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}
                    className="text-blue-600 hover:text-blue-700 font-bold text-sm px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast.isOpen && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md">
          <div
            className={`flex items-start gap-3 px-4 py-4 rounded-xl shadow-lg border-2 font-medium ${
              toast.type === "success"
                ? "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-300 text-emerald-800"
                : "bg-gradient-to-r from-red-50 to-blue-50 border-red-300 text-red-800"
            }`}
          >
            <Heart className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => setToast({ ...toast, isOpen: false })}
              className="text-slate-400 hover:text-slate-600 ml-2 flex-shrink-0 text-lg font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchlistPage;
