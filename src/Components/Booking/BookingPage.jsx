// import React, { useState } from "react";
// import { useLocation } from "react-router-dom";
// import Passengers from "./Passengers";
// import ContactInfo from "./Contactinfo";
// import ReviewBooking from "./ReviewBooking";
// import { mockBookingData } from "./MockData.js";

// const steps = ["Passengers", "Contact Info", "Review"];

// const BookingPage = () => {
//   const { state } = useLocation();

//   // ✅ Normalize data FIRST
//   const bookingData =
//     state?.flight && state?.pricingSolution ? state : mockBookingData;

//   const { flight, pricingSolution, itinerary } = bookingData;

//   const [step, setStep] = useState(1);
//   const [passengers, setPassengers] = useState([]);
//   const [contactInfo, setContactInfo] = useState(null);

//   return (
//     <div className="min-h-screen bg-gray-100 py-10">
//       <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
//         {/* DEV WARNING */}
//         {!state && (
//           <div className="mb-4 text-sm bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg">
//             ⚠ API not found — showing mock booking data
//           </div>
//         )}

//         {/* Header */}
//         <h1 className="text-2xl font-bold mb-2">Complete Your Booking</h1>
//         <p className="text-gray-600 mb-6">
//           {flight.segments[0].from} → {flight.segments.at(-1).to} •{" "}
//           {flight.currency} {flight.price}
//         </p>

//         {/* Stepper */}
//         <div className="flex items-center justify-between mb-8">
//           {steps.map((label, index) => (
//             <div key={label} className="flex-1 text-center">
//               <div
//                 className={`mx-auto w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold
//                 ${step === index + 1 ? "bg-indigo-600" : "bg-gray-300"}`}
//               >
//                 {index + 1}
//               </div>
//               <p
//                 className={`mt-2 text-sm ${
//                   step === index + 1
//                     ? "text-indigo-600 font-medium"
//                     : "text-gray-400"
//                 }`}
//               >
//                 {label}
//               </p>
//             </div>
//           ))}
//         </div>

//         {/* Steps */}
//         {step === 1 && (
//           <Passengers
//             onNext={(data) => {
//               setPassengers(data);
//               setStep(2);
//             }}
//           />
//         )}

//         {step === 2 && (
//           <ContactInfo
//             onNext={(data) => {
//               setContactInfo(data);
//               setStep(3);
//             }}
//             onBack={() => setStep(1)}
//           />
//         )}

//         {step === 3 && (
//           <ReviewBooking
//             pricingSolution={pricingSolution}
//             passengers={passengers}
//             contactInfo={contactInfo}
//             itinerary={itinerary}
//             flight={flight}
//             onBack={() => setStep(2)}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default BookingPage;
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Passengers from "./Passengers";
import ContactInfo from "./ContactInfo";
import ReviewBooking from "./ReviewBooking";

const steps = ["Passengers", "Contact Info", "Review"];

const BookingPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [passengers, setPassengers] = useState([]);
  const [contactInfo, setContactInfo] = useState(null);
  const [flight, setFlight] = useState(null);

  // ================= LOAD FLIGHT DATA =================
  useEffect(() => {
    // Check if flight data exists in location state
    if (state?.flight) {
      setFlight(state.flight);
      return;
    }

    // If not in state, check sessionStorage for travelportData
    const travelportDataStr = sessionStorage.getItem("flightSearchResults");

    if (!travelportDataStr) {
      // No flight data found, redirect to search
      alert("No flight selected. Please search for flights first.");
      navigate("/");
      return;
    }

    // Parse travelportData and reconstruct flight info
    try {
      const travelportData = JSON.parse(travelportDataStr);

      // Check if we also have flight details stored
      const flightDetailsStr = sessionStorage.getItem("selectedFlight");
      if (flightDetailsStr) {
        const flightDetails = JSON.parse(flightDetailsStr);
        setFlight(flightDetails);
      } else {
        // Fallback: Create minimal flight object from travelportData
        setFlight({
          segments: [],
          currency: "PKR",
          displayPrice: 0,
          travelportData,
        });
      }
    } catch (err) {
      console.error("Error loading flight data:", err);
      alert("Invalid flight data. Please search again.");
      navigate("/");
    }
  }, [state, navigate]);

  // ================= FORMAT HELPERS =================
  const formatDuration = (minutes) => {
    if (!minutes) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // ================= LOADING STATE =================
  if (!flight) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  // ================= RENDER =================
  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        {/* Flight Summary Header */}
        <div className="mb-6 pb-6 border-b">
          <h1 className="text-2xl font-bold mb-3">Complete Your Booking</h1>

          {flight.segments && flight.segments.length > 0 ? (
            <div className="bg-indigo-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xl font-semibold text-indigo-600">
                    {flight.segments[0]?.from} →{" "}
                    {flight.segments[flight.segments.length - 1]?.to}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {flight.stops === 0
                      ? "Non-stop"
                      : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
                    {flight.durationMinutes &&
                      ` • ${formatDuration(flight.durationMinutes)}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-600">
                    {flight.currency}{" "}
                    {flight.displayPrice?.toLocaleString() || "0"}
                  </p>
                  <p className="text-xs text-gray-500">Total Price</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Limited flight information available. Proceeding with
                booking...
              </p>
            </div>
          )}
        </div>

        {/* Progress Stepper */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((label, index) => (
            <React.Fragment key={label}>
              <div className="flex-1 text-center">
                <div
                  className={`mx-auto w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold transition-all
                  ${
                    step > index + 1
                      ? "bg-green-500"
                      : step === index + 1
                      ? "bg-indigo-600 ring-4 ring-indigo-200"
                      : "bg-gray-300"
                  }`}
                >
                  {step > index + 1 ? "✓" : index + 1}
                </div>
                <p
                  className={`mt-2 text-sm ${
                    step === index + 1
                      ? "text-indigo-600 font-medium"
                      : step > index + 1
                      ? "text-green-600 font-medium"
                      : "text-gray-400"
                  }`}
                >
                  {label}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded transition-all ${
                    step > index + 1 ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Components */}
        <div className="mt-6">
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
              passengers={passengers}
              contactInfo={contactInfo}
              flight={flight}
              onBack={() => setStep(2)}
            />
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 pt-6 border-t">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
            <p className="text-sm text-blue-800">
              If you encounter any issues, contact our support team at{" "}
              <a
                href="mailto:support@yourcompany.com"
                className="underline font-medium"
              >
                support@yourcompany.com
              </a>{" "}
              or call <strong>+92-300-1234567</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
