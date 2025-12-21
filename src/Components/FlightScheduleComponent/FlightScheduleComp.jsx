import React, { useState, useEffect } from "react";
import axios from "axios";

/* -------- HELPERS -------- */
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
  const optServices = brand?.["air:OptionalServices"]?.["air:OptionalService"];
  if (!optServices) return [];
  return Array.isArray(optServices) ? optServices : [optServices];
};

const formatBaggageText = (text) => {
  if (!text) return "Not specified";
  if (Array.isArray(text)) return text.join(" • ");
  return text;
};

/* -------- MODAL COMPONENT -------- */
const FlightDetailsModal = ({ flight, onClose }) => {
  const [pricing, setPricing] = useState(null);
  const [brandInfo, setBrandInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.post("http://localhost:9000/api/details", {
          segments: flight.segments,
        });
        console.log(res.data);
        setPricing(res.data.pricing);

        // Extract brand info
        const fareInfo = res.data.pricing?.["air:FareInfo"];
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
              {pricing?.["@_TotalPrice"] ||
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
            {pricing && (
              <div
                style={{
                  margin: "15px 0",
                  padding: "15px",
                  background: "#fff3e0",
                  borderRadius: "8px",
                }}
              >
                <h4>💰 Price Breakdown</h4>
                <p>Base Fare: {pricing["@_EquivalentBasePrice"]}</p>
                <p>Taxes & Fees: {pricing["@_Taxes"]}</p>
                <strong>Total: {pricing["@_TotalPrice"]}</strong>
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

/* -------- MAIN COMPONENT -------- */
const FlightScheduleComp = ({ flights = [], loading, hasSearched }) => {
  const [selectedFlight, setSelectedFlight] = useState(null);

  // Determine max price from flights
  const priceMax = flights.length
    ? Math.max(...flights.map((f) => f.price))
    : 1000;

  // Set filters, default maxPrice is priceMax
  const [filters, setFilters] = useState({
    stops: "all",
    maxPrice: priceMax,
  });

  // Update maxPrice if flights change
  useEffect(() => {
    setFilters((prev) => ({ ...prev, maxPrice: priceMax }));
  }, [priceMax]);

  // Filter flights
  const filteredFlights = flights.filter((f) => {
    if (filters.stops !== "all") {
      if (filters.stops === "2+" && f.stops < 2) return false;
      if (filters.stops !== "2+" && f.stops !== Number(filters.stops))
        return false;
    }
    if (f.price > filters.maxPrice) return false;
    return true;
  });

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  return (
    <div className="flex gap-6 max-w-7xl mx-auto">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 p-4 rounded-xl shadow-md flex flex-col gap-6">
        <h3 className="font-bold mb-2 text-lg">Filters</h3>

        {/* Stops Buttons */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold">Stops:</label>
          <div className="flex flex-wrap gap-2">
            {["all", "0", "1", "2+"].map((s) => (
              <button
                key={s}
                onClick={() => handleFilterChange("stops", s)}
                className={`px-3 py-1 rounded-full border text-sm ${
                  filters.stops === s
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                {s === "all"
                  ? "All"
                  : s === "0"
                  ? "Non-stop"
                  : s === "1"
                  ? "1 Stop"
                  : "2+ Stops"}
              </button>
            ))}
          </div>
        </div>

        {/* Price Slider */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold">
            Max Price: {filters.maxPrice.toLocaleString()}
          </label>
          <div className="flex items-center gap-2">
            <span>0</span>
            <input
              type="range"
              min={0}
              max={priceMax}
              value={filters.maxPrice}
              onChange={(e) =>
                handleFilterChange("maxPrice", Number(e.target.value))
              }
              className="flex-1 h-2 bg-gray-200 rounded-lg accent-blue-600"
            />
            <span>{priceMax.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Flight List */}
      <div className="flex-1 space-y-6">
        {filteredFlights.length === 0 && <p>No flights match the filters.</p>}

        {filteredFlights.map((f, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-md p-5">
            <div className="flex justify-between mb-4">
              <div>
                <h2 className="font-bold">
                  {f.segments[0].from} → {f.segments[f.segments.length - 1].to}
                </h2>
                <span>
                  {f.stops === 0 ? "Direct Flight" : `${f.stops} Stop`}
                </span>
              </div>
              <div className="text-right font-bold">
                {f.currency} {f.price.toLocaleString()}
              </div>
            </div>

            <button
              onClick={() => setSelectedFlight(f)}
              className="w-full mt-4 bg-black text-white py-2 rounded-xl"
            >
              View Details
            </button>
          </div>
        ))}

        {selectedFlight && (
          <FlightDetailsModal
            flight={selectedFlight}
            onClose={() => setSelectedFlight(null)}
          />
        )}
      </div>
    </div>
  );
};

export default FlightScheduleComp;
