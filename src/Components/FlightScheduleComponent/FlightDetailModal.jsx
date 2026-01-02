import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const FlightDetailsModal = ({ flight, onClose }) => {
  const [pricinginfo, setPricinginfo] = useState(null);
  const [rawpricingsolution, setrawPricingSolution] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [brandInfo, setBrandInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.post("http://localhost:9000/api/details", {
          segments: flight.segments,
        });
        console.log(res.data);
        setrawPricingSolution(res.data.pricingSolution);
        setItinerary(res.data.itinerary);
        setPricinginfo(res.data.pricingSolution?.["air:AirPricingInfo"]);
        // Extract brand info
        const fareInfo =
          res.data.pricingSolution?.["air:AirPricingInfo"]?.["air:FareInfo"];
        if (fareInfo) {
          const fareInfoArray = Array.isArray(fareInfo) ? fareInfo : [fareInfo];
          const brandsData = fareInfoArray
            .map((fi) => fi?.["air:Brand"])
            .filter(Boolean);
          setBrandInfo(brandsData);
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDetails();
  }, [flight]);

  const formatDateTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);

    const date = d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const time = d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${date} • ${time}`;
  };

  const getServiceStatus = (service) => {
    const chargeable = service?.["@_Chargeable"];
    if (chargeable === "Included in the brand")
      return { text: "✅ Included", color: "#4caf50" };
    if (chargeable === "Available for a charge")
      return { text: "💳 Available (Fee)", color: "#ff9800" };
    if (chargeable === "Not offered")
      return { text: "❌ Not available", color: "#f44336" };
    return { text: "ℹ️ Unknown", color: "#9e9e9e" };
  };

  const extractServices = (brand) => {
    const optServices =
      brand?.["air:OptionalServices"]?.["air:OptionalService"];
    if (!optServices) return [];
    return Array.isArray(optServices) ? optServices : [optServices];
  };

  if (!flight) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
        overflowY: "auto",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          maxWidth: "900px",
          width: "100%",
          padding: "20px",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "red",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: "30px",
            height: "30px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>

        {loading && <p>Loading flight details...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && (
          <div style={{ fontFamily: "Arial, sans-serif" }}>
            {/* Flight Header */}
            <h2>
              {flight.segments[0].from} →{" "}
              {flight.segments[flight.segments.length - 1].to}
            </h2>
            <p>
              Price:{" "}
              {pricinginfo?.["@_TotalPrice"] ||
                `${flight.currency} ${flight.price}`}
            </p>
            <p>
              Duration: {Math.floor(flight.durationMinutes / 60)}h{" "}
              {flight.durationMinutes % 60}m
            </p>

            {/* Flight Segments */}
            <div style={{ margin: "15px 0" }}>
              {flight.segments.map((s, idx) => (
                <div
                  key={idx}
                  style={{
                    marginBottom: "10px",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                  }}
                >
                  <strong>
                    {s.from} → {s.to}
                  </strong>{" "}
                  ({s.carrier}-{s.flightNumber})
                  <div>Departure: {formatDateTime(s.departure)}</div>
                  <div>Arrival: {formatDateTime(s.arrival)}</div>
                </div>
              ))}
            </div>

            {/* Brand & Services */}
            {/* Brand & Key Services */}
            {brandInfo && brandInfo.length > 0 && (
              <div>
                {brandInfo.map((brand, idx) => {
                  const services = extractServices(brand).filter((s) =>
                    [
                      "Baggage",
                      "MealOrBeverage",
                      "InFlightEntertainment",
                    ].includes(s["@_Type"])
                  );

                  // Map to only the "best" per type
                  const serviceMap = {};

                  services.forEach((s) => {
                    const type = s["@_Type"];
                    const chargeable = s["@_Chargeable"];
                    const existing = serviceMap[type];

                    // Keep Included or Available, ignore Not offered if we already have something
                    if (
                      !existing ||
                      (existing["@_Chargeable"] === "Not offered" &&
                        chargeable !== "Not offered")
                    ) {
                      serviceMap[type] = s;
                    }
                  });

                  // Convert map to array and sort by priority: Baggage, Meal, WiFi
                  const finalServices = [
                    "Baggage",
                    "MealOrBeverage",
                    "InFlightEntertainment",
                  ]
                    .map((type) => serviceMap[type])
                    .filter(Boolean);

                  return (
                    <div
                      key={idx}
                      style={{
                        margin: "15px 0",
                        padding: "15px",
                        background: "#f8f9fa",
                        borderRadius: "8px",
                      }}
                    >
                      <h3 style={{ margin: "0 0 10px", color: "#667eea" }}>
                        Entertainment & Refreshment
                      </h3>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(220px, 1fr))",
                          gap: "10px",
                        }}
                      >
                        {finalServices.map((service, sIdx) => {
                          const type = service["@_Type"];
                          const icons = {
                            Baggage: "🧳",
                            MealOrBeverage: "🍽️",
                            InFlightEntertainment: "📶",
                          };

                          // Title
                          let title = type;
                          if (type === "Baggage") {
                            const desc =
                              service["common_v54_0:ServiceInfo"]?.[
                                "common_v54_0:Description"
                              ];
                            title = desc || "Baggage";
                          } else if (type === "MealOrBeverage") {
                            title = "Meal";
                          } else if (type === "InFlightEntertainment") {
                            title = "WiFi";
                          }

                          const status = getServiceStatus(service);

                          return (
                            <div
                              key={sIdx}
                              style={{
                                padding: "8px",
                                background: "white",
                                borderRadius: "6px",
                                border: "1px solid #ccc",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  marginBottom: "4px",
                                }}
                              >
                                <span>{icons[type]}</span>
                                <strong>{title}</strong>
                              </div>
                              <div
                                style={{
                                  fontSize: "13px",
                                  color: status.color,
                                }}
                              >
                                {status.text}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Price Breakdown */}
            {pricinginfo && (
              <div
                style={{
                  margin: "15px 0",
                  padding: "15px",
                  background: "#fff3e0",
                  borderRadius: "8px",
                }}
              >
                <h4>💰 Price Breakdown</h4>
                <p>Base Fare: {pricinginfo["@_EquivalentBasePrice"]}</p>
                <p>Taxes & Fees: {pricinginfo["@_Taxes"]}</p>
                <strong>Total: {pricinginfo["@_TotalPrice"]}</strong>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "white",
                  border: "2px solid #667eea",
                  color: "#667eea",
                  borderRadius: "8px",
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  if (!rawpricingsolution || !itinerary) {
                    alert("Pricing or itinerary not available");
                    return;
                  }

                  navigate("/booking", {
                    state: {
                      flight,
                      pricingSolution: rawpricingsolution, // 🔴 RAW OBJECT
                      itinerary,
                    },
                  });
                }}
                style={{
                  flex: 2,
                  padding: "10px",
                  background: "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                }}
              >
                Continue to Booking →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default FlightDetailsModal;
