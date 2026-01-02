import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  const fetchPendingBookings = async () => {
    try {
      const response = await axios.get(
        "http://localhost:9000/api/admin/bookings/pending"
      );
      setBookings(response.data.bookings);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId) => {
    if (!window.confirm("Approve this booking?")) return;

    try {
      const response = await axios.post(
        `http://localhost:9000/api/admin/bookings/${bookingId}/approve`,
        { adminNotes: "Approved" }
      );

      if (response.data.success) {
        alert(`Booking confirmed! PNR: ${response.data.booking.pnr}`);
        fetchPendingBookings();
      }
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || err.message));
    }
  };

  const handleReject = async (bookingId) => {
    const reason = prompt("Rejection reason:");
    if (!reason) return;

    try {
      await axios.post(
        `http://localhost:9000/api/admin/bookings/${bookingId}/reject`,
        { rejectionReason: reason }
      );

      alert("Booking rejected");
      fetchPendingBookings();
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || err.message));
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">Loading pending bookings...</p>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Pending Bookings
      </h1>

      {bookings.length === 0 && (
        <p className="text-gray-500">No pending bookings at the moment.</p>
      )}

      <div className="space-y-6">
        {bookings.map((booking) => (
          <div
            key={booking.bookingId}
            className="bg-white shadow rounded-xl p-6 hover:shadow-lg transition"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Booking ID: {booking.bookingId}
              </h2>
              <p className="text-gray-500 text-sm">
                Submitted: {new Date(booking.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Flight Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="font-medium text-gray-700">Flight</p>
                <p className="text-gray-600">
                  {booking.flight.segments[0].from} →{" "}
                  {booking.flight.segments.at(-1).to}
                </p>
                <p className="text-gray-500 text-sm">
                  {booking.flight.currency} {booking.flight.price}
                </p>
              </div>

              <div>
                <p className="font-medium text-gray-700">Passengers</p>
                <ul className="text-gray-600 text-sm list-disc ml-4">
                  {booking.passengers.map((pax, idx) => (
                    <li key={idx}>
                      {pax.firstName} {pax.lastName} ({pax.type})
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-medium text-gray-700">Contact</p>
                <p className="text-gray-600">{booking.contactInfo.email}</p>
                <p className="text-gray-600">
                  +{booking.contactInfo.phoneCountryCode}{" "}
                  {booking.contactInfo.phone}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mt-4">
              <button
                onClick={() => handleApprove(booking.bookingId)}
                className="px-5 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
              >
                Approve & Confirm
              </button>
              <button
                onClick={() => handleReject(booking.bookingId)}
                className="px-5 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
