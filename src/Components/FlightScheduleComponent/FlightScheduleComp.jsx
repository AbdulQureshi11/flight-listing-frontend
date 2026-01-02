import React, { useState, useEffect } from "react";
import FlightDetailsModal from "./FlightDetailModal";

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
                  {f.stops === 0
                    ? "Direct Flight"
                    : `${f.stops} Stop${f.stops > 1 ? "s" : ""}`}
                </span>
              </div>
              <div className="text-right font-bold">
                {f.currency ?? ""}{" "}
                {f.price !== null ? f.price.toLocaleString() : "N/A"}
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
