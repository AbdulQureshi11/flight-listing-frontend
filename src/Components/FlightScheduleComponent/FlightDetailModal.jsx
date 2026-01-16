import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import api from "../../../api.js";

const carrierNameLookup = {
  EK: "Emirates",
  BA: "British Airways",
  PK: "PIA",
  QR: "Qatar Airways",
  TK: "Turkish Airlines",
  EY: "Etihad Airways",
  PA: "Airblue",
  ER: "Serene Air",
  IF: "Fly Baghdad",
};

const getAirlineLogo = (carrierCode) => {
  try {
    return new URL(
      `../../assets/AirlineLogos/${carrierCode.toUpperCase()}.png`,
      import.meta.url
    ).href;
  } catch (err) {
    return "";
  }
};

const FlightDetailsModal = ({
  flight: initialFlight,
  onClose,
  searchParams,
}) => {
  const navigate = useNavigate();

  const [currentFlight, setCurrentFlight] = useState(initialFlight);
  const [pricing, setPricing] = useState(null);
  const [pricingFlight, setPricingFlight] = useState(null);
  const [loadingPricing, setLoadingPricing] = useState(true);
  const [errorPricing, setErrorPricing] = useState(null);

  const displayFlight = pricingFlight || currentFlight;
  const displaySegments = displayFlight?.segments || [];

  const mainCarrierCode = displaySegments[0]?.carrier || "";
  const mainCarrierName = carrierNameLookup[mainCarrierCode] || mainCarrierCode;

  // Calculate passenger counts
  const travelers = useMemo(
    () => ({
      adults: Number(searchParams?.travelers?.adults || 1),
      children: Number(searchParams?.travelers?.child || 0),
      infants: Number(searchParams?.travelers?.infant || 0),
      total:
        Number(searchParams?.travelers?.adults || 1) +
        Number(searchParams?.travelers?.child || 0) +
        Number(searchParams?.travelers?.infant || 0),
    }),
    [searchParams]
  );

  const formatTime = (iso) =>
    !iso
      ? ""
      : new Date(iso).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
  const formatDate = (iso) =>
    !iso
      ? ""
      : new Date(iso).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });

  const calculateDuration = (dep, arr) => {
    if (!dep || !arr) return "";
    const diff = new Date(arr) - new Date(dep);
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  const groupedSegments = useMemo(() => {
    if (!displaySegments.length) return [];
    const groups = {};
    displaySegments.forEach((seg) => {
      if (!groups[seg.group]) groups[seg.group] = [];
      groups[seg.group].push(seg);
    });
    return Object.values(groups);
  }, [displaySegments]);

  useEffect(() => {
    const fetchPricing = async () => {
      setLoadingPricing(true);
      setErrorPricing(null);
      try {
        const storedData = JSON.parse(
          sessionStorage.getItem("flightSearchResults") || "{}"
        );

        const passengerPayload = [];
        if (travelers.adults > 0)
          passengerPayload.push({ type: "ADT", quantity: travelers.adults });
        if (travelers.children > 0)
          passengerPayload.push({ type: "CNN", quantity: travelers.children });
        if (travelers.infants > 0)
          passengerPayload.push({ type: "INF", quantity: travelers.infants });

        const res = await api.post("/api/air-pricing", {
          selectedFlight: currentFlight,
          passengers: passengerPayload,
          allFlights: storedData.flights || [],
        });

        if (res.data?.success) {
          const clean = (v) =>
            typeof v === "string" ? parseFloat(v.replace(/[^\d.]/g, "")) : v;

          // Get per-person pricing from the AirPricingInfo parser
          const unitTotal = clean(res.data.pricing.totalPrice);
          const unitBase = clean(res.data.pricing.basePrice);
          const unitTaxes = clean(res.data.pricing.taxes);

          setPricing({
            currency:
              res.data.flight.travelportData?.currency ||
              currentFlight.currency ||
              "PKR",
            perPassenger: unitTotal,
            // Multiply by total passenger count
            grandTotal: unitTotal * travelers.total,
            totalBase: unitBase * travelers.total,
            totalTaxes: unitTaxes * travelers.total,
          });
          setPricingFlight(res.data.flight);
        }
      } catch (err) {
        setErrorPricing(
          err.response?.data?.message || "Could not verify the latest price."
        );
      } finally {
        setLoadingPricing(false);
      }
    };

    if (currentFlight) fetchPricing();
  }, [currentFlight, travelers]);

  return (
    <div
      className="fixed inset-0 bg-black/70 flex justify-center items-center backdrop-blur-md z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-[650px] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <img
              src={getAirlineLogo(mainCarrierCode)}
              alt={mainCarrierCode}
              className="w-14 h-14 object-contain p-2 border border-slate-100 rounded-xl"
            />
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {mainCarrierName}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Review your itinerary and fare
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors border-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-grow p-6">
          {/* Pricing Card */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 mb-8">
            {loadingPricing ? (
              <div className="py-4 text-center">
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-indigo-600 border-t-transparent mb-2"></div>
                <p className="text-sm text-indigo-600 font-bold">
                  Verifying live availability & price...
                </p>
              </div>
            ) : errorPricing ? (
              <div className="p-3 text-center text-red-600 bg-red-50 rounded-lg border border-red-100 text-sm font-medium">
                {errorPricing}
              </div>
            ) : (
              pricing && (
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">
                        Total Amount Payable
                      </p>
                      <h3 className="text-3xl font-black text-slate-900 leading-none">
                        <span className="text-lg font-bold mr-1">
                          {pricing.currency}
                        </span>
                        {pricing.grandTotal.toLocaleString()}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 font-medium">
                        Total for {travelers.total} Traveler(s)
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Incl. Base + Taxes
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-indigo-100">
                    <div className="bg-white/60 p-2 rounded-lg text-center">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">
                        Base Fare
                      </p>
                      <p className="text-sm font-bold text-slate-700">
                        {pricing.currency} {pricing.totalBase.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white/60 p-2 rounded-lg text-center">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">
                        Surviving Taxes
                      </p>
                      <p className="text-sm font-bold text-slate-700">
                        {pricing.currency} {pricing.totalTaxes.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Itinerary Timeline */}
          <div className="space-y-8">
            {groupedSegments.map((group, gIdx) => (
              <div
                key={gIdx}
                className="relative pl-4 border-l-2 border-dashed border-slate-200 ml-2"
              >
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-indigo-600"></div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-6">
                  {gIdx === 0 ? "Outbound Trip" : "Return Trip"} —{" "}
                  {formatDate(group[0].departure)}
                </h3>

                {group.map((seg, sIdx) => {
                  const isLast = sIdx === group.length - 1;
                  const nextSeg = group[sIdx + 1];

                  return (
                    <div key={sIdx} className="mb-8 last:mb-0">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-lg font-black text-slate-900">
                              {formatTime(seg.departure)}
                            </span>
                            <span className="w-4 h-[1px] bg-slate-300"></span>
                            <span className="text-sm font-bold text-slate-600">
                              {seg.from}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 font-medium mb-3">
                            {formatDate(seg.departure)}
                          </p>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500">
                            {calculateDuration(seg.departure, seg.arrival)}
                          </div>
                        </div>

                        <div className="flex-1 text-right">
                          <div className="flex items-center justify-end gap-3 mb-1">
                            <span className="text-sm font-bold text-slate-600">
                              {seg.to}
                            </span>
                            <span className="w-4 h-[1px] bg-slate-300"></span>
                            <span className="text-lg font-black text-slate-900">
                              {formatTime(seg.arrival)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 font-medium mb-3">
                            {formatDate(seg.arrival)}
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-500 uppercase">
                          {seg.carrier} {seg.flightNumber}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="font-bold text-indigo-600">
                          {seg.cabinClass}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">
                          Equip: {seg.equipment || "Boeing/Airbus"}
                        </span>
                      </div>

                      {/* Connection/Layover */}
                      {!isLast && nextSeg && (
                        <div className="my-4 py-2 border-y border-slate-50 flex items-center justify-center gap-2">
                          <span className="text-[11px] font-black text-orange-600 uppercase tracking-tighter">
                            ⏱ Layover:{" "}
                            {calculateDuration(seg.arrival, nextSeg.departure)}{" "}
                            in {seg.to}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-4 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition-all cursor-pointer"
          >
            Go Back
          </button>
          <button
            disabled={loadingPricing || errorPricing}
            onClick={() => {
              // Store the final priced flight for the booking page
              const finalFlightData = {
                ...pricingFlight,
                displayPrice: pricing.grandTotal,
                currency: pricing.currency,
                pricingDetails: pricing, // Includes breakdown for summary page
              };
              sessionStorage.setItem(
                "selectedFlight",
                JSON.stringify(finalFlightData)
              );
              navigate("/booking");
            }}
            className={`flex-[2] px-6 py-4 rounded-2xl font-black text-white shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] ${
              loadingPricing || errorPricing
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
            }`}
          >
            {loadingPricing ? "Updating Prices..." : "Review & Book"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlightDetailsModal;
