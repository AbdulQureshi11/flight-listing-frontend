import React, { useState, useMemo } from "react";
import api from "../../../api.js";
import { useNavigate } from "react-router-dom";

// const ReviewBooking = ({ passengers, contactInfo, flight }) => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();

//   const safePassengers = Array.isArray(passengers) ? passengers : [];
//   const safeContact = contactInfo || {};
//   debugger;
//   const handleSubmitBooking = async () => {
//     // ================= VALIDATION =================
//     if (!safePassengers.length) {
//       setError("No passengers found. Please go back and add passengers.");
//       return;
//     }

//     if (!safeContact.email) {
//       setError(
//         "Contact information missing. Please go back and add your email."
//       );
//       return;
//     }

//     // Get flight data from sessionStorage
//     const selectedFlightStr = sessionStorage.getItem("selectedFlight");
//     if (!selectedFlightStr) {
//       setError("Flight selection expired. Please search for flights again.");
//       return;
//     }

//     let selectedFlight;
//     selectedFlight = JSON.parse(selectedFlightStr);
//     try {
//       setLoading(true);
//       setError(null);

//       const bookingResponse = await api.post("/api/bookings", {
//         selectedFlight: selectedFlight,
//         passengers: safePassengers,
//         contactInfo: safeContact,
//         formOfPayment: { type: "Cash" },
//       });

//       if (bookingResponse.data.success) {
//         // Clear sessionStorage
//         sessionStorage.removeItem("travelportData");
//         sessionStorage.removeItem("selectedFlight");

//         // Navigate to success page
//         navigate("/booking-submitted", {
//           state: {
//             bookingId: bookingResponse.data.bookingId,
//             pnr: bookingResponse.data.pnr,
//             message: bookingResponse.data.message,
//           },
//         });
//       }
//     } catch (err) {
//       console.error("Booking error:", err);
//       setError(
//         err.response?.data?.error ||
//           err.response?.data?.message ||
//           err.message ||
//           "Failed to submit booking. Please try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

const ReviewBooking = ({ passengers, contactInfo, flight: flightProp }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 1. Unified Flight Data: Prop has priority, Session is the backup
  const flightData = useMemo(() => {
    if (flightProp && Object.keys(flightProp).length > 0) return flightProp;

    const saved = sessionStorage.getItem("selectedFlight");
    return saved ? JSON.parse(saved) : null;
  }, [flightProp]);

  const safePassengers = Array.isArray(passengers) ? passengers : [];
  const safeContact = contactInfo || {};

  const handleSubmitBooking = async () => {
    // ================= VALIDATION =================
    if (!flightData) {
      setError("Flight selection missing or expired. Please search again.");
      return;
    }

    if (!safePassengers.length) {
      setError("No passengers found. Please go back and add passengers.");
      return;
    }

    if (!safeContact.email) {
      setError(
        "Contact information missing. Please go back and add your email."
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // ================= API CALL =================
      // We use flightData which is guaranteed to match the UI
      const bookingResponse = await api.post("/api/bookings", {
        selectedFlight: flightData,
        passengers: safePassengers,
        contactInfo: safeContact,
        formOfPayment: { type: "Cash" },
      });

      if (bookingResponse.data.success) {
        // Clear storage only after success
        sessionStorage.removeItem("travelportData");
        sessionStorage.removeItem("selectedFlight");

        navigate("/booking-submitted", {
          state: {
            bookingId: bookingResponse.data.bookingId,
            pnr: bookingResponse.data.pnr,
            message: bookingResponse.data.message,
          },
        });
      }
    } catch (err) {
      console.error("Booking error:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to submit booking. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Review Your Booking</h2>

      {/* ================= FLIGHT DETAILS ================= */}
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          ✈️ Flight Details
        </h3>

        {flightData?.segments?.length ? (
          <div className="space-y-4">
            {/* Route Summary */}
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold text-indigo-600">
                    {flightData.segments[0].from} →{" "}
                    {flightData.segments[flightData.segments.length - 1].to}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {flightData.stops === 0
                      ? "Non-stop"
                      : `${flightData.stops} stop${
                          flightData.stops > 1 ? "s" : ""
                        }`}{" "}
                    • {formatDuration(flightData.durationMinutes)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-indigo-600">
                    {flightData.currency}{" "}
                    {flightData.displayPrice.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Each Segment */}
            {flightData.segments.map((seg, idx) => (
              <div
                key={idx}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-lg">
                      {seg.carrier} {seg.flightNumber}
                    </p>
                    <p className="text-sm text-gray-500">
                      {seg.equipment} • {seg.cabinClass} Class
                    </p>
                  </div>
                  <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                    Flight {idx + 1} of {flightData.segments.length}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  {/* Departure */}
                  <div>
                    <p className="text-2xl font-bold">{seg.from}</p>
                    <p className="text-sm text-gray-600">
                      {formatDateTime(seg.departure)}
                    </p>
                  </div>

                  {/* Duration */}
                  <div className="text-center">
                    <p className="text-sm text-gray-500">
                      {formatDuration(flightData.durationMinutes)}
                    </p>
                    <div className="w-full h-0.5 bg-indigo-300 my-2"></div>
                    <p className="text-xs text-gray-400">
                      {seg.distance ? `${seg.distance} km` : ""}
                    </p>
                  </div>

                  {/* Arrival */}
                  <div className="text-right">
                    <p className="text-2xl font-bold">{seg.to}</p>
                    <p className="text-sm text-gray-600">
                      {formatDateTime(seg.arrival)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No flight details available</p>
        )}
      </div>

      {/* ================= PASSENGERS ================= */}
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          👥 Passengers ({safePassengers.length})
        </h3>

        {safePassengers.length ? (
          <div className="divide-y">
            {safePassengers.map((pax, idx) => (
              <div key={idx} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    {pax.title} {pax.firstName} {pax.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {pax.type === "ADT"
                      ? "Adult"
                      : pax.type === "CNN"
                      ? "Child"
                      : "Infant"}{" "}
                    • {pax.gender === "M" ? "Male" : "Female"}
                    {pax.dob && ` • Born ${pax.dob}`}
                  </p>
                </div>
                <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                  Passenger {idx + 1}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No passenger data</p>
        )}
      </div>

      {/* ================= CONTACT INFO ================= */}
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          📧 Contact Information
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium">{safeContact.email || "-"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Phone:</span>
            <span className="font-medium">
              +{safeContact.phoneCountryCode || ""} {safeContact.phone || "-"}
            </span>
          </div>
        </div>
      </div>

      {/* ================= PRICE SUMMARY ================= */}
      {flightData?.pricing && (
        <div className=" from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-5">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            💰 Price Breakdown
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Base Fare:</span>
              <span className="font-medium">
                {flightData.pricingDetails.totalBase}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Taxes & Fees:</span>
              <span className="font-medium">
                {flightData.pricingDetails.totalTaxes}
              </span>
            </div>

            <hr className="my-3 border-indigo-200" />

            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount:</span>
              <span className="text-indigo-600">
                {flightData.pricingDetails.grandTotal}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ================= ERROR MESSAGE ================= */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <p className="font-medium">❌ {error}</p>
        </div>
      )}

      {/* ================= SUBMIT BUTTON ================= */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
          disabled={loading}
        >
          ← Go Back
        </button>

        <button
          onClick={handleSubmitBooking}
          disabled={loading}
          className={`px-8 py-3 rounded-xl text-white font-semibold transition
            ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl"
            }`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Submitting...
            </span>
          ) : (
            "Confirm & Submit Booking →"
          )}
        </button>
      </div>
    </div>
  );
};

export default ReviewBooking;
