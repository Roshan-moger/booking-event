import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2, Shield } from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import type { Event } from "../../../helpers";
import { Button } from "../../../components/UI/button";
import { loadRazorpayScript } from "../../../api/razorpay";
import { useSelector } from "react-redux";
import type { InitialReduxStateProps } from "../../../redux/redux.props";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/UI/card";

type PaymentState = "idle" | "processing" | "success" | "failure";

export default function ConfirmationPage() {
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const selectedSeats = location.state?.selectedSeats || [];
  const selectedSeatLabels = selectedSeats.map(
    (seat: any) => `${seat.row}${seat.number}`
  );
  const tokenInfo = useSelector(
    (state: InitialReduxStateProps) => state.tokenInfo
  );
  const totalAmount = selectedSeats.reduce(
    (sum: number, seat: any) => sum + seat.price,
    0
  );
  const [timeLeft, setTimeLeft] = useState(600);
  const eventId = searchParams.get("eventId");
  const bookingId = searchParams.get("bookingId");
  const [event, setEvent] = useState<Event | null>(null);
  useEffect(() => {
    if (!eventId || selectedSeats.length === 0) return;

    const fetchEventData = async () => {
      try {
        const res = await axiosInstance.get(`/organizer/events/${eventId}`);
        setEvent(res.data);
      } catch (err) {
        console.error("Failed to fetch event data", err);
        setError("Failed to fetch event data");
      }
    };

    fetchEventData();
  }, [eventId, selectedSeats]);

  const ticketDetails = {
    regularSeat: 50000,
    platformFees: 50000,
    CGST: 9,
    SGST: 9,
    couponDiscount: 70000,
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);
    setPaymentState("processing");

    const res = await loadRazorpayScript();
    if (!res) {
      setError("Failed to load Razorpay SDK. Check your internet connection.");
      setIsProcessing(false);
      setPaymentState("failure");
      return;
    }

    try {
      const response = await axiosInstance.get(
        `/bookings/createorder/${bookingId}`
      );

      const { orderId } = response.data;

      const options: any = {
        key: "rzp_test_RUxcY5tE583K5C",
        amount: TotalPaymentAmount,
        currency: "INR",
        name: "Spot Event Booking",
        description: `Payment for ${event?.title || "Event"}`,
        order_id: orderId,
        handler: async (responseData: any) => {
          try {
            setPaymentState("processing");
            const verifyResponse = await axiosInstance.post(
              `/bookings/verifyPaymentSiganture`,
              {
                provider: "RAZORPAY",
                orderId: responseData.razorpay_order_id,
                paymentId: responseData.razorpay_payment_id,
                signature: responseData.razorpay_signature,
              }
            );

            if (verifyResponse.status === 200) {
              // const QRresponse = await axiosInstance.post(
              //   `bookings/${bookingId}/qr`
              // );
              // setQrBase64(QRresponse.data.qrBase64);
              // console.log(QRresponse.data);
              setPaymentState("success");
              setIsProcessing(false);
            } else {
              setError("Payment verification failed");
              setPaymentState("failure");
              setIsProcessing(false);
            }
          } catch (error) {
            console.error("Error verifying payment:", error);
            setError("Payment verification failed");
            setPaymentState("failure");
            setIsProcessing(false);
          }
        },
        prefill: {
          name: tokenInfo.name,
          email: tokenInfo.email,
        },
        theme: {
          color: "#6d28d9",
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setError("Payment was cancelled");
            setPaymentState("failure");
          },
        },
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.open();
    } catch (err: any) {
      console.error("Error during payment:", err);
      setError("Payment initiation failed");
      setPaymentState("failure");
      setIsProcessing(false);
    }
  };

  function formatDateOnly(isoString: any): string {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  }

  function formatTimeOnly(isoString: any): string {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return date.toLocaleTimeString("en-US", options);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  if (paymentState === "success") {
    return (
      <PaymentSuccess
        bookingId={bookingId || ""}
        eventId={eventId || ""}
        selectedSeats={selectedSeats}
        onViewTicket={() => {
          navigate("/tickets");
        }}
      />
    );
  }

  if (paymentState === "failure") {
    return (
      <PaymentFailure
        errorMessage={error || "Payment failed. Please try again."}
        onRetry={() => {
          setPaymentState("idle");
          setError(null);
          handlePayment();
        }}
        onGoBack={() => {
          navigate(`/dashboard/ticketbook/${eventId}`);
        }}
      />
    );
  }

  const TotalPaymentAmount = totalAmount + totalAmount*ticketDetails.CGST/100 + totalAmount*ticketDetails.SGST/100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-6 p-4 rounded-lg bg-gradient-to-r from-white via-slate-50 to-white shadow-sm border border-slate-200">
        <div>
          <h1 className="text-3xl text-slate-800 tracking-tight">
            Confirm Book Ticket
          </h1>
          <p className="mt-1 text-sm font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded inline-block shadow-sm">
            ⏳ Time left: {formatTime(timeLeft)}
          </p>
        </div>
        <Button
          onClick={() => navigate(-1)}
          variant="secondary"
          className="flex items-center px-4 h-10 border-2 border-slate-300 hover:border-[#5d33fb] bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-md transition-all duration-200 shadow-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>Back</span>
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Left Section - Event Details */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 border border-slate-200">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-6">
              Event Details
            </h2>

            <div className="space-y-6">
              {/* Event Name */}
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                  Name
                </p>
                <p className="text-lg md:text-xl font-bold text-slate-900">
                  {event?.title || "Loading..."}
                </p>
              </div>

              {/* Date */}
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                  Date
                </p>
                <p className="text-base md:text-lg font-semibold text-slate-900">
                  {formatDateOnly(event?.startDate)}
                </p>
              </div>

              {/* Time */}
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                  Time
                </p>
                <p className="text-base md:text-lg font-semibold text-slate-900">
                  {formatTimeOnly(event?.startDate)}
                </p>
              </div>

              {/* Seats */}
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                  Seats ({selectedSeatLabels.length})
                </p>
                <p className="text-base md:text-lg font-semibold text-slate-900">
                  {selectedSeatLabels.join(", ") || "None"}
                </p>
              </div>

              {/* Venue */}
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                  Venue
                </p>
                <p className="text-base md:text-lg font-semibold text-slate-900">
                  {event?.venueName || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Order Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 border border-slate-200">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-6">
              Preview Order
            </h2>

            {/* Ticket Details */}
            <div className="mb-8 pb-8 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">
                Ticket Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Seats</span>
                  <span className="text-sm font-semibold text-slate-900">
                    ₹ {totalAmount.toLocaleString()}
                  </span>
                </div>
                {/* <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Platform Fees</span>
                  <span className="text-sm font-semibold text-slate-900">
                    ₹ {ticketDetails.platformFees.toLocaleString()}
                  </span>
                </div> */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">SGST</span>
                  <span className="text-sm font-semibold text-slate-900">
                    ₹ {ticketDetails.SGST.toLocaleString()}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">CGST</span>
                  <span className="text-sm font-semibold text-slate-900">
                    ₹ {ticketDetails.CGST.toLocaleString()}%
                  </span>
                </div>
              </div>
            </div>

            {/* Coupon Section */}
            <div className="mb-8 pb-8 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">
                Coupon or Voucher
              </h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="XXXXX"
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm font-medium rounded-lg transition-colors">
                  Apply
                </button>
              </div>
              {ticketDetails.couponDiscount > 0 && (
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-slate-600">Coupon ID</span>
                  <span className="text-sm font-semibold text-green-600">
                    - ₹ {ticketDetails.couponDiscount.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Total Amount */}
            <div className="mb-8 pb-8 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-slate-900">
                  Total Amount
                </span>
                <span className="text-xl md:text-2xl font-bold text-blue-600">
                  ₹ {TotalPaymentAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  Payment Method
                </h3>
                <button className="text-xs font-medium text-blue-600 hover:text-blue-700">
                  Choose One
                </button>
              </div>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="w-4 h-4 rounded-full border-2 border-blue-600 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                </div>
                <span className="text-sm font-medium text-slate-900">UPI</span>
              </div>
            </div>

            {/* Proceed Payment Button */}
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full py-3 md:py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-400 text-white font-bold text-sm md:text-base uppercase tracking-wide rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {isProcessing ? "Processing..." : "Proceed Payment"}
            </button>

            {/* Disclaimer */}
            <p className="text-xs text-slate-500 text-center mt-4">
              By proceeding, you agree to our terms and conditions
            </p>

            {/* Error Message */}
            {error && paymentState === "idle" && (
              <p className="text-xs text-red-500 text-center mt-4">{error}</p>
            )}
          </div>
        </div>
      </div>

      {/* Processing State */}
      {paymentState === "processing" && <PaymentProcessingCard />}
    </div>
  );
}

interface PaymentSuccessProps {
  bookingId: string;
  eventId: string;
  selectedSeats: any[];
  onViewTicket: () => void;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  selectedSeats,
  onViewTicket,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-green-50 to-white">
      <Card className="w-full max-w-md border-green-200 bg-white shadow-xl rounded-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3 shadow-inner">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-green-700 font-bold">
            Payment Successful!
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Success Message */}
          <div className="text-center space-y-2">
            <p className="text-sm text-slate-600">
              Your payment has been processed successfully.
            </p>
         
            <p className="text-xs text-slate-500">
              Seats:{" "}
              <span className="font-semibold">{selectedSeats.length}</span>
            </p>
          </div>

  

          {/* Confirmation */}
          <div className="rounded-lg bg-green-50 border border-green-200 p-3">
            <p className="text-sm text-green-800">
              ✓ Your tickets have been confirmed and are ready to view.
            </p>
          </div>

          {/* View Tickets Button */}
          <Button
            onClick={onViewTicket}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
            size="lg"
          >
            View Your Tickets
          </Button>

          <p className="text-xs text-slate-500 text-center">
            A confirmation email has been sent to your registered email address.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

interface PaymentFailureProps {
  errorMessage: string;
  onRetry: () => void;
  onGoBack: () => void;
}

export function PaymentFailure({
  errorMessage,
  onRetry,
  onGoBack,
}: PaymentFailureProps) {
  return (
    <div className="min-h-screen  flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-red-200 bg-white shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-100 p-3">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-red-700">
            Payment Failed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 text-center">
            <p className="text-sm text-slate-600">
              Unfortunately, your payment could not be processed.
            </p>
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-xs text-red-800 font-medium">
                {errorMessage || "An error occurred during payment processing."}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={onRetry}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              size="lg"
            >
              Try Again
            </Button>

            <Button
              onClick={onGoBack}
              variant="outline"
              className="w-full bg-transparent"
              size="lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back to Booking
            </Button>
          </div>

          <p className="text-xs text-slate-500 text-center">
            Your seats are still reserved. Please try again or contact support
            if the problem persists.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

interface PaymentProcessingCardProps {
  message?: string;
  subMessage?: string;
}

export function PaymentProcessingCard({
  message = "Processing Payment",
  subMessage = "Please wait while we verify your payment...",
}: PaymentProcessingCardProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
      <div className="max-w-md w-full mx-auto shadow-2xl border-0 bg-white/90 rounded-xl">
        <div className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {message}
            </h3>
            <p className="text-gray-600">{subMessage}</p>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-purple-600">
              <Shield className="w-4 h-4" />
              <span>Secure transaction in progress</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
