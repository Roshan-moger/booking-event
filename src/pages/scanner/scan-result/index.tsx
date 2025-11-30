import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { CheckCircle, XCircle, QrCode, Calendar, Tag, Clock } from 'lucide-react';
import axiosInstance from "../../../api/axiosInstance";
import type { InitialReduxStateProps } from "../../../redux/redux.props";

export default function ScanResult() {
  const { code } = useParams();
  const [ticket, setTicket] = useState<any>(null);
  const [verify, setVerify] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const role = useSelector(
    (state: InitialReduxStateProps) => state.tokenInfo.roles
  );

  // 1️⃣ Fetch ticket details
  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get(`/tickets/${code}`);
        if (res.status === 200) {
          setTicket(res.data);
        } else {
          throw new Error("Ticket fetch failed");
        }
        // Auto verify if NOT organizer
        if (!role.includes("ORGANIZER")) {
          const ver = await axiosInstance.get(`/qrs/verify?code=${code}`);
          debugger
          if (ver.status === 200) {
            setVerify(ver.data);
          } else {
            throw new Error("Verification failed");
          }
        }
      } catch (err: any) {
        console.log("ERROR:", err);
        const msg =
          err?.response?.data?.message || "Ticket expired or invalid";
        setErrorMessage(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [code]);

  // 2️⃣ Organizer - Check-in
  const handleCheckIn = async () => {
    try {
      setCheckingIn(true);
      const res = await axiosInstance.post(`/qrs/checkin?code=${code}`);
      if (res.status === 200) {
        setVerify(res.data);
        setErrorMessage(null);
      } else {
        throw new Error("Check-in failed");
      }
    } catch (err: any) {
      console.log("CHECK-IN ERROR:", err);
      const msg =
        err?.response?.data?.message || "Ticket expired or invalid";
      setErrorMessage(msg);
    } finally {
      setCheckingIn(false);
    }
  };

  // LOADING STATE
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-200 border-t-blue-600"></div>
          <p className="text-slate-600 font-medium">Verifying ticket...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="w-full max-w-md">
        {/* ERROR STATE */}
        {errorMessage && (
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 overflow-hidden">
            <div className="p-8 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Invalid Ticket
                </h2>
                <p className="text-slate-600 text-sm">{errorMessage.split("Unexpected error:")[1]}</p>
              </div>
            </div>
          </div>
        )}

        {/* SUCCESS STATE - NON-ORGANIZER */}
        {!errorMessage && !role.includes("ORGANIZER") && verify && ticket && (
          <div className="space-y-4">
            {/* STATUS CARD */}
            <div
              className={`bg-white rounded-2xl shadow-lg border-2 overflow-hidden transition-all ${
                verify.valid
                  ? "border-green-200 bg-gradient-to-br from-white to-green-50"
                  : "border-red-200 bg-gradient-to-br from-white to-red-50"
              }`}
            >
              <div className="p-8 flex flex-col items-center text-center gap-4">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center ${
                    verify.valid ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  {verify.valid ? (
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  ) : (
                    <XCircle className="w-10 h-10 text-red-600" />
                  )}
                </div>
                <h1
                  className={`text-3xl font-bold ${
                    verify.valid ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {verify.valid ? "Ticket Valid" : "Ticket Invalid"}
                </h1>
                <p className="text-slate-600 text-sm">
                  {verify.valid
                    ? "This ticket is ready for entry"
                    : "This ticket cannot be used"}
                </p>
              </div>
            </div>

            {/* TICKET DETAILS */}
            {ticket && (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                      Event
                    </p>
                    <p className="text-slate-900 font-semibold truncate">
                      {ticket.eventTitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Tag className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                      Amount
                    </p>
                    <p className="text-slate-900 font-semibold">
                      ₹{ticket.amount}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                      Issued
                    </p>
                    <p className="text-slate-900 font-semibold text-sm">
                      {new Date(ticket.issuedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CHECK-IN STATUS */}
            {verify.alreadyCheckedIn && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <p className="text-sm text-amber-900 text-center">
                  <span className="font-semibold">Already checked in</span> at{" "}
                  {new Date(verify.checkedInAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ORGANIZER CHECK-IN STATE */}
        {!errorMessage && role.includes("ORGANIZER") && ticket && (
          <div className="space-y-4">
            {/* TICKET DETAILS */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Ticket Info</h2>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-slate-400 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                    Event
                  </p>
                  <p className="text-slate-900 font-semibold truncate">
                    {ticket.eventTitle}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Tag className="w-5 h-5 text-slate-400 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                    Amount
                  </p>
                  <p className="text-slate-900 font-semibold">
                    ₹{ticket.amount}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-slate-400 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                    Issued
                  </p>
                  <p className="text-slate-900 font-semibold text-sm">
                    {new Date(ticket.issuedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* CHECK-IN BUTTON */}
            <button
              onClick={handleCheckIn}
              disabled={checkingIn}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 disabled:from-slate-400 disabled:to-slate-400 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:shadow-none text-lg"
            >
              {checkingIn ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Checking In...
                </span>
              ) : (
                "✓ Check In Ticket"
              )}
            </button>

            {/* RESULT BOX */}
            {verify && (
              <div
                className={`rounded-2xl border-2 p-6 text-center transition-all ${
                  verify.valid
                    ? "bg-gradient-to-br from-green-50 to-white border-green-200"
                    : "bg-gradient-to-br from-red-50 to-white border-red-200"
                }`}
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  {verify.valid ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                  <h3
                    className={`text-lg font-bold ${
                      verify.valid ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {verify.valid ? "Valid Ticket" : "Invalid Ticket"}
                  </h3>
                </div>
                <p
                  className={`text-sm ${
                    verify.valid ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {verify.valid
                    ? "Guest can now enter the event"
                    : "This ticket cannot be used"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}