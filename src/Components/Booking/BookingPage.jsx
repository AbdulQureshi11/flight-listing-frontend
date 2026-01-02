import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Passengers from "./Passengers";
import ContactInfo from "./Contactinfo";
import ReviewBooking from "./ReviewBooking";
import { mockBookingData } from "./MockData.js";

const steps = ["Passengers", "Contact Info", "Review"];

const BookingPage = () => {
  const { state } = useLocation();

  // ✅ Normalize data FIRST
  const bookingData =
    state?.flight && state?.pricingSolution ? state : mockBookingData;

  const { flight, pricingSolution, itinerary } = bookingData;

  const [step, setStep] = useState(1);
  const [passengers, setPassengers] = useState([]);
  const [contactInfo, setContactInfo] = useState(null);

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        {/* DEV WARNING */}
        {!state && (
          <div className="mb-4 text-sm bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg">
            ⚠ API not found — showing mock booking data
          </div>
        )}

        {/* Header */}
        <h1 className="text-2xl font-bold mb-2">Complete Your Booking</h1>
        <p className="text-gray-600 mb-6">
          {flight.segments[0].from} → {flight.segments.at(-1).to} •{" "}
          {flight.currency} {flight.price}
        </p>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((label, index) => (
            <div key={label} className="flex-1 text-center">
              <div
                className={`mx-auto w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold
                ${step === index + 1 ? "bg-indigo-600" : "bg-gray-300"}`}
              >
                {index + 1}
              </div>
              <p
                className={`mt-2 text-sm ${
                  step === index + 1
                    ? "text-indigo-600 font-medium"
                    : "text-gray-400"
                }`}
              >
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Steps */}
        {step === 1 && (
          <Passengers
            onNext={(data) => {
              setPassengers(data);
              setStep(2);
            }}
          />
        )}

        {step === 2 && (
          <ContactInfo
            onNext={(data) => {
              setContactInfo(data);
              setStep(3);
            }}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <ReviewBooking
            pricingSolution={pricingSolution}
            passengers={passengers}
            contactInfo={contactInfo}
            itinerary={itinerary}
            flight={flight}
            onBack={() => setStep(2)}
          />
        )}
      </div>
    </div>
  );
};

export default BookingPage;
