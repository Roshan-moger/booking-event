import { useState, useEffect } from "react";
import { Button } from "../../../components/UI/button";
import Toast from "../../../components/UI/toast";
import axiosInstance from "../../../api/axiosInstance";
import { useNavigate, useParams } from "react-router-dom";

// Types
interface Seat {
  row: string;
  number: number;
  categoryName: string;
  status: "AVAILABLE" | "LOCKED";
  price: number; // Added price field
  color: string; // Added color/swatch field
}

interface SeatProps {
  label: string;
  status: "AVAILABLE" | "LOCKED";
  onClick: (label: string) => void;
  isSelected: boolean;
  swatch?: string; 
  categoryName: string;
}

interface SeatGridData {
  [key: string]: Seat[];
}

interface ToastProps {
  isOpen: boolean;
  message: string;
  type?: "success" | "error" | "info";
}

// Seat Button Component
const SeatButton = ({
  label,
  status,
  onClick,
  isSelected,
  swatch,
  categoryName,
}: SeatProps) => {
  let buttonClasses =
    "w-8 h-8 sm:w-10 sm:h-10 rounded-md flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-200 relative";

  switch (status) {
    case "AVAILABLE":
      if (categoryName.toLocaleLowerCase() === "walk space") {
        buttonClasses +=
          " bg-gray-300 text-gray-500 cursor-not-allowed opacity-60";
      } else {
        buttonClasses +=
          " bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:shadow-md";
      }

      if (isSelected) {
        buttonClasses +=
          " !bg-gradient-to-br !from-blue-500 !to-blue-600 !text-white !border-blue-600 shadow-lg";
      }
      break;
    case "LOCKED":
      buttonClasses +=
        " bg-gray-300 text-gray-500 cursor-not-allowed opacity-60";
      break;
  }

  return (
    <button
      className={buttonClasses}
      onClick={() => onClick(label)}
      disabled={status === "LOCKED"}
      aria-label={`Seat ${label}`}
      title={swatch ? `${label} - ${categoryName}` : `Seat ${label}`}
    >
      {swatch && !isSelected && (
        <div
          className="absolute inset-0 rounded-md opacity-30"
          style={{ backgroundColor: swatch }}
        />
      )}
      <span className="relative z-10">{label}</span>
    </button>
  );
};

// Main Component
const SeatBookingPage = () => {
  const [seatData, setSeatData] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [locking, setLocking] = useState(false);
  const { eventId } = useParams();
  const [toast, setToast] = useState<ToastProps>({
    isOpen: false,
    type: "success",
    message: "",
  });
  const navigate = useNavigate();
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

  useEffect(() => {
    if (!eventId) {
      showToast("Event ID is required", "error");

      return;
    }

    axiosInstance(`organizer/events/${eventId}`)
      .then((response) => {
        setSeatData(response.data.seats || []);
      })
      .catch((err) => {
        console.error("Failed to fetch seat grid", err);
        showToast("Failed to load seats. Please try again.", "error");
      });
  }, [eventId]);

  const organizeSeatsByRow = (): SeatGridData => {
    const organized: SeatGridData = {};
    seatData.forEach((seat) => {
      if (!organized[seat.row]) {
        organized[seat.row] = [];
      }
      organized[seat.row].push(seat);
    });

    Object.keys(organized).forEach((row) => {
      organized[row].sort((a, b) => a.number - b.number);
    });

    return organized;
  };

  const handleSeatClick = (seat: Seat) => {
    setSelectedSeats((prevSelectedSeats) => {
      const isSelected = prevSelectedSeats.some(
        (s) => s.row === seat.row && s.number === seat.number
      );

      if (isSelected) {
        return prevSelectedSeats.filter(
          (s) => !(s.row === seat.row && s.number === seat.number)
        );
      } else {
        return [...prevSelectedSeats, seat];
      }
    });
  };

  const handleProceed = () => {
    if (selectedSeats.length === 0) {
      showToast("Please select at least one seat", "error");

      return;
    }

    if (!eventId) {
      showToast("Event ID is required", "error");

      return;
    }

    setLocking(true);

    const lockPayload = {
      eventId: Number.parseInt(eventId),
      seats: selectedSeats.map((seat) => ({
        row: seat.row,
        number: seat.number,
        categoryName: seat.categoryName,
      })),
      ticketCount: selectedSeats.length,
      paymentMethodId: 1,
    };

    axiosInstance
      .post("/bookings/lock", lockPayload)
      .then((res) => {
        console.log("Seats locked successfully:", res.data);
        navigate(
          `/dashboard/ticketbook/confirmbook?eventId=${eventId}&bookingId=${res.data.bookingId}`,
          {
            state: { selectedSeats },
          }
        );
      })
      .catch((err) => {
        console.error("Failed to lock seats", err);
        showToast("Failed to lock seats. Please try again.", "error");
      })
      .finally(() => {
        setLocking(false);
      });
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((sum, seat) => sum + seat.price, 0).toFixed(0);
  };

  const displaySeats = selectedSeats
    .map((s) => `${s.row}${s.number}`)
    .join(", ");

  const getSelectedCategories = () => {
    const categories = new Map<string, { price: number; color: string }>();
    selectedSeats.forEach((seat) => {
      if (!categories.has(seat.categoryName)) {
        categories.set(seat.categoryName, {
          price: seat.price,
          color: seat.color,
        });
      }
    });
    return Array.from(categories.entries());
  };

  const seatsByRow = organizeSeatsByRow();
  const sortedRows = Object.keys(seatsByRow).sort();

  return (
    <div className="flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 sm:py-5 flex-shrink-0">
        <div className="">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Choose Your Seats
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Select your preferred seats for the event
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Seat Selection Area */}
        <section className="flex-1 flex flex-col overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="max-w-8xl mx-auto w-full flex flex-col gap-4 sm:gap-6">
            {/* Legend */}
            <div className="flex flex-wrap gap-3 sm:gap-6 bg-white rounded-lg p-3 sm:p-4 border border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 rounded-sm" />
                <span className="text-xs sm:text-sm text-gray-700 font-medium">
                  Booked
                </span>
              </div>
              {/* <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-300 bg-white rounded-sm" />
                <span className="text-xs sm:text-sm text-gray-700 font-medium">
                  Available
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-amber-400 to-amber-500 rounded-sm" />
                <span className="text-xs sm:text-sm text-gray-700 font-medium">
                  Being Booked
                </span>
              </div> */}
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-sm" />
                <span className="text-xs sm:text-sm text-gray-700 font-medium">
                  Selected
                </span>
              </div>
            </div>

            {/* Screen Indicator */}
            <div className="text-center">
              <div className="inline-block bg-gradient-to-r from-slate-700 to-slate-900 text-white px-4 py-2 rounded-full text-xs sm:text-sm font-semibold">
                🎬 SCREEN
              </div>
            </div>

            {/* Seat Grid */}
            <div className="flex justify-center">
              <div className="grid gap-1 sm:gap-2">
                {sortedRows.map((row) => (
                  <div key={row} className="flex gap-1 sm:gap-2 items-center">
                    <span className="w-6 sm:w-8 text-xs sm:text-sm font-bold text-slate-600 text-center flex-shrink-0">
                      {row}
                    </span>
                    <div className="flex gap-1 sm:gap-2">
                      {seatsByRow[row].map((seat) => (
                        <SeatButton
                          key={`${seat.row}-${seat.number}`}
                          label={seat.number.toString()}
                          status={seat.status}
                          onClick={() => handleSeatClick(seat)}
                          isSelected={selectedSeats.some(
                            (s) =>
                              s.row === seat.row && s.number === seat.number
                          )}
                          swatch={seat.color}
                          categoryName={seat.categoryName}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Footer - Sticky */}
        <footer className="bg-white border-t border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
              {/* Total Price */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 sm:p-4 border border-blue-200">
                <div className="text-xs sm:text-sm text-blue-600 font-medium">
                  Total Price
                </div>
                <div className="text-lg sm:text-2xl font-bold text-blue-900">
                  ₹ {calculateTotal()}
                </div>
              </div>

              {/* Seats Count */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 sm:p-4 border border-purple-200">
                <div className="text-xs sm:text-sm text-purple-600 font-medium">
                  Seats
                </div>
                <div className="text-lg sm:text-2xl font-bold text-purple-900">
                  {selectedSeats.length}
                </div>
              </div>

              {/* Selected Seats */}
              <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-3 sm:p-4 border border-emerald-200">
                <div className="text-xs sm:text-sm text-emerald-600 font-medium">
                  Selected
                </div>
                <div className="text-sm sm:text-lg font-bold text-emerald-900 truncate">
                  {displaySeats || "None"}
                </div>
              </div>

              {getSelectedCategories().length > 0 && (
                <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-3 sm:p-4 border border-pink-200">
                  <div className="text-xs sm:text-sm text-pink-600 font-medium mb-2">
                    Categories
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {getSelectedCategories().map(([category, { color }]) => (
                      <div
                        key={category}
                        className="flex items-center gap-1 text-xs"
                        title={category}
                      >
                        <div
                          className="w-3 h-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-pink-900 font-medium">
                          {category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 sm:gap-3 justify-end">
              <Button className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 bg-white py-2 sm:py-3 px-4 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base">
                CANCEL
              </Button>
              <Button onClick={handleProceed} disabled={locking}>
                {locking ? "LOCKING..." : "PROCEED"}
              </Button>
            </div>
          </div>
        </footer>
      </main>

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

export default SeatBookingPage;
