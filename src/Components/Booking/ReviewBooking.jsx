import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ReviewBooking = ({
  pricingSolution,
  itinerary,
  passengers,
  contactInfo,
  flight,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const safePassengers = Array.isArray(passengers) ? passengers : [];
  const safeContact = contactInfo || {};
  const safePricing = pricingSolution || {};

  const handleSubmitBooking = async () => {
    if (!safePassengers.length || !safeContact.email || !pricingSolution) {
      setError("Incomplete booking data. Please restart booking flow.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post("http://localhost:9000/api/bookings", {
        flight,
        pricingSolution,
        itinerary,
        passengers: safePassengers,
        contactInfo: safeContact,
        formOfPayment: { type: "Cash" },
      });

      if (response.data.success) {
        navigate("/booking-submitted", {
          state: {
            bookingId: response.data.bookingId,
            message: response.data.message,
          },
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit booking");
    } finally {
      setLoading(false);
    }
  };
  const formatDateTime = (value) =>
    new Date(value).toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Review Your Booking</h2>

      {/* Flight Details */}
      {/* Flight Details */}
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="text-lg font-semibold mb-4">✈️ Flight Details</h3>

        {flight?.segments?.length ? (
          <div className="space-y-4">
            {flight.segments.map((seg, idx) => (
              <div
                key={idx}
                className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between"
              >
                {/* Route */}
                <div>
                  <p className="text-xl font-bold">
                    {seg.from} → {seg.to}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDateTime(seg.departure)} —{" "}
                    {formatDateTime(seg.arrival)}
                  </p>
                </div>

                {/* Airline */}
                <div className="mt-3 md:mt-0 text-sm">
                  <p className="font-medium">
                    Airline: {seg.airline} {seg.flightNumber}
                  </p>
                  <p className="text-gray-500">
                    Journey: {itinerary?.journeyType?.replace("_", " ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No flight details available</p>
        )}
      </div>

      {/* Passengers */}
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="text-lg font-semibold mb-4">👤 Passengers</h3>

        {safePassengers.length ? (
          <div className="divide-y">
            {safePassengers.map((pax, idx) => (
              <div key={idx} className="py-2 flex justify-between">
                <span className="font-medium">
                  {pax.firstName} {pax.lastName}
                </span>
                <span className="text-sm text-gray-500">{pax.type}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No passenger data</p>
        )}
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="text-lg font-semibold mb-3">📞 Contact Information</h3>
        <p className="text-gray-700">{safeContact.email || "-"}</p>
        <p className="text-gray-700">
          +{safeContact.phoneCountryCode || ""} {safeContact.phone || ""}
        </p>
      </div>

      {/* Price Summary */}
      <div className="bg-gray-50 border rounded-xl p-5">
        <h3 className="text-lg font-semibold mb-3">💰 Fare Breakdown</h3>

        <div className="flex justify-between text-sm">
          <span>Base Fare</span>
          <span>{pricingSolution?.["@_BasePrice"]}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Taxes</span>
          <span>{pricingSolution?.["@_Taxes"]}</span>
        </div>

        <hr className="my-2" />

        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>{pricingSolution?.["@_TotalPrice"]}</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg">{error}</div>
      )}

      {/* CTA */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmitBooking}
          disabled={loading}
          className={`px-8 py-3 rounded-xl text-white font-semibold transition
            ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
        >
          {loading ? "Submitting..." : "Submit Booking for Approval"}
        </button>
      </div>
    </div>
  );
};

export default ReviewBooking;
