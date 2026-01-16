import { useState, useEffect, useMemo } from "react";
import FlightDetailsModal from "./FlightDetailModal";

const getAirlineLogo = (carrierCode) => {
  try {
    return new URL(
      `../../assets/AirlineLogos/${carrierCode?.toUpperCase()}.png`,
      import.meta.url
    ).href;
  } catch (err) {
    return "";
  }
};

const FlightScheduleComp = ({
  flights = [],
  tripType = "oneway",
  loading = false,
  hasSearched = false,
  searchParams = null,
}) => {
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [absoluteMaxPrice, setAbsoluteMaxPrice] = useState(0);
  const [filters, setFilters] = useState({
    stops: "all",
    maxPrice: 0,
  });

  useEffect(() => {
    if (flights.length > 0) {
      const prices = flights
        .map((f) => Number(f.displayPrice))
        .filter((p) => !isNaN(p));
      if (prices.length > 0) {
        const highest = Math.max(...prices);
        setAbsoluteMaxPrice(highest);
        setFilters((prev) => ({ ...prev, maxPrice: highest }));
      }
    }
  }, [flights]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredFlights = useMemo(() => {
    return flights.filter((f) => {
      const flightPrice = Number(f.displayPrice) || 0;
      const priceMatch = flightPrice <= filters.maxPrice;
      let stopMatch = true;
      if (filters.stops !== "all") {
        if (filters.stops === "2+") {
          stopMatch = f.stops >= 2;
        } else {
          stopMatch = f.stops === Number(filters.stops);
        }
      }
      return priceMatch && stopMatch;
    });
  }, [flights, filters]);

  const renderFlightCard = (f, i) => {
    const carrierCode = f.segments?.[0]?.carrier || "Unknown";

    const adultCount = Number(searchParams?.travelers?.adults || 0);
    const childCount = Number(searchParams?.travelers?.child || 0);
    const infantCount = Number(searchParams?.travelers?.infant || 0);

    // 2. Find Unit Prices from the breakdown
    const adtUnit =
      f.passengerBreakdown?.find((p) => p.type === "ADT")?.unitPrice || 0;
    const cnnUnit =
      f.passengerBreakdown?.find((p) => p.type === "CNN")?.unitPrice || 0;
    const infUnit =
      f.passengerBreakdown?.find((p) => p.type === "INF")?.unitPrice || 0;

    // 3. Calculate Totals (Unit Price * Count)
    // If unit price is missing but count exists, we fallback to a safe calculation
    const adultTotal = adtUnit * adultCount;
    const childTotal = cnnUnit * childCount;
    const infantTotal = infUnit * infantCount;

    return (
      <div
        key={f.id || i}
        className="bg-gray-300 border border-slate-200 rounded-2xl p-6 shadow-sm mb-5 hover:border-blue-400 transition-all"
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Airline Logo Section */}
          <div className="flex flex-col items-center justify-center">
            <img
              src={getAirlineLogo(carrierCode)}
              alt={carrierCode}
              className="w-16 h-16 object-contain rounded-xl border border-slate-100 p-2 shadow-sm bg-white"
            />
            <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
              {carrierCode}
            </span>
          </div>

          {/* Route Info Section */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
              <h4 className="font-black text-xl text-slate-800">
                {f.segments?.[0]?.from}
              </h4>
              <span className="text-blue-500 font-bold">→</span>
              <h4 className="font-black text-xl text-slate-800">
                {f.segments?.[f.segments.length - 1]?.to}
              </h4>
            </div>
            <div className="text-sm text-slate-500 font-medium">
              {f.stops === 0 ? "Non-stop" : `${f.stops} Stop(s)`} |{" "}
              {f.segments?.[0]?.cabinClass}
            </div>
          </div>

          {/* Pricing Section - Split Breakdown */}
          <div className="text-center md:text-right min-w-[180px] border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
            <div className="space-y-2 mb-4">
              {/* Adult Price Row */}
              <div className="flex justify-between md:justify-end items-center gap-4">
                <span className="text-[10px] font-black text-slate-400 uppercase">
                  Adult x{adultCount}
                </span>
                <span className="text-sm font-bold text-slate-700">
                  {f.currency} {adultTotal.toLocaleString()}
                </span>
              </div>

              {/* Child Price Row (Only if child exists) */}
              {childCount > 0 && childTotal && (
                <div className="flex justify-between md:justify-end items-center gap-4">
                  <span className="text-[10px] font-black text-indigo-500 uppercase">
                    Child x{childCount}
                  </span>
                  <span className="text-sm font-bold text-slate-700">
                    {f.currency} {childTotal.toLocaleString()}
                  </span>
                </div>
              )}

              {/* Infant Price Row (Only if infant exists) */}
              {infantCount > 0 && infantPrice && (
                <div className="flex justify-between md:justify-end items-center gap-4">
                  <span className="text-[10px] font-black text-orange-500 uppercase">
                    Infant x{infantCount}
                  </span>
                  <span className="text-sm font-bold text-slate-700">
                    {f.currency} {childTotal.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Grand Total */}
            <div className="border-t border-slate-200 pt-2 mb-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                Total Payable
              </p>
              <div className="text-2xl font-black text-blue-600 leading-tight">
                <span className="text-sm mr-1 font-bold">{f.currency}</span>
                {f.displayPrice.toLocaleString()}
              </div>
            </div>

            <button
              onClick={() => setSelectedFlight(f)}
              className="w-full bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-black hover:bg-blue-600 transition-all cursor-pointer"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading)
    return <div className="p-20 text-center font-bold">Loading flights...</div>;
  if (!hasSearched)
    return (
      <div className="p-20 text-center text-slate-400 font-medium">
        Please perform a search.
      </div>
    );

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto p-6">
      <aside className="w-full md:w-72 space-y-8 bg-white p-7 rounded-3xl h-fit border border-slate-100 shadow-sm">
        <div>
          <h3 className="font-black text-slate-800 text-lg mb-5 border-b pb-2">
            Stops
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
            {["all", "0", "1", "2+"].map((s) => (
              <button
                key={s}
                onClick={() => handleFilterChange("stops", s)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black border transition-all ${
                  filters.stops === s
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-500 hover:border-blue-300"
                }`}
              >
                {s === "all"
                  ? "All Flights"
                  : s === "0"
                  ? "Non-stop"
                  : s === "1"
                  ? "1 Stop"
                  : "2+ Stops"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-black text-slate-800 text-lg mb-2">
            Price Limit
          </h3>
          <p className="text-sm font-black text-blue-600 mb-4 bg-blue-50 py-1 px-3 rounded-lg inline-block">
            Max: {flights[0]?.currency || ""}{" "}
            {filters.maxPrice.toLocaleString()}
          </p>
          <input
            type="range"
            min={0}
            max={absoluteMaxPrice}
            value={filters.maxPrice}
            onChange={(e) =>
              handleFilterChange("maxPrice", Number(e.target.value))
            }
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </aside>

      <main className="flex-1">
        {searchParams && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-700">Travelers:</span>
                <span className="bg-white px-3 py-1 rounded-lg font-bold text-slate-600">
                  {searchParams.travelers.adults} Adult
                  {searchParams.travelers.adults > 1 ? "s" : ""}
                  {searchParams.travelers.child > 0 &&
                    `, ${searchParams.travelers.child} Child${
                      searchParams.travelers.child > 1 ? "ren" : ""
                    }`}
                  {searchParams.travelers.infant > 0 &&
                    `, ${searchParams.travelers.infant} Infant${
                      searchParams.travelers.infant > 1 ? "s" : ""
                    }`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-700">Class:</span>
                <span className="bg-white px-3 py-1 rounded-lg font-bold text-slate-600">
                  {searchParams.travelClass}
                </span>
              </div>
            </div>
          </div>
        )}
        <h2 className="text-2xl font-black text-slate-800 mb-8 capitalize">
          {tripType.replace("-", " ")} Results ({filteredFlights.length})
        </h2>
        {filteredFlights.length > 0 ? (
          filteredFlights.map((f, i) => renderFlightCard(f, i))
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-500 font-bold">
              No flights match your filters.
            </p>
          </div>
        )}
      </main>

      {selectedFlight && (
        <FlightDetailsModal
          flight={selectedFlight}
          onClose={() => setSelectedFlight(null)}
          searchParams={searchParams}
        />
      )}
    </div>
  );
};

export default FlightScheduleComp;
