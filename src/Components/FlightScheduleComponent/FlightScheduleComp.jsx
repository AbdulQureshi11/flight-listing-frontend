import React from "react";
import { AIRLINES } from "../../utils/airlines";

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

/* -------- COMPONENT -------- */

const FlightScheduleComp = ({ flights = [], loading, hasSearched }) => {

    // Loader (NO "No flights" during loading)
    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black mx-auto"></div>
                <p className="mt-3 text-sm text-gray-500">
                    Searching best flights for you…
                </p>
            </div>
        );
    }

    // ❌ API abhi complete nahi hui
    if (!hasSearched) return null;

    // ❌ API complete + empty result
    if (!Array.isArray(flights) || flights.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-lg font-semibold">No flights found</p>
                <button
                    onClick={() => window.location.href = "/"}
                    className="text-blue-500 underline mt-2"
                >
                    Go Back to Search
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="max-w-5xl mx-auto space-y-6">
                {flights.map((f, i) => (
                    <div
                        key={i}
                        className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-5"
                    >
                        {/* HEADER */}
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-lg font-bold">
                                    {f.segments[0].from} →{" "}
                                    {f.segments[f.segments.length - 1].to}
                                </h2>
                                <span className="text-sm text-gray-500">
                                    {f.stops === 0 ? "Direct Flight" : `${f.stops} Stop`}
                                </span>
                            </div>

                            <div className="text-right">
                                <div className="text-2xl font-extrabold text-black">
                                    {f.currency} {f.price.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500">
                                    Duration: {Math.floor(f.durationMinutes / 60)}h{" "}
                                    {f.durationMinutes % 60}m
                                </div>
                            </div>
                        </div>

                        {/* SEGMENTS */}
                        <div className="space-y-3">
                            {f.segments.map((s, idx) => (
                                <div key={idx} className="bg-gray-50 rounded-xl p-4">
                                    <div className="flex justify-between">
                                        <div>
                                            <p className="font-semibold">
                                                {s.from} → {s.to}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {AIRLINES[s.carrier] || s.carrier} • {s.carrier}-
                                                {s.flightNumber}
                                            </p>
                                        </div>

                                        <div className="text-right text-sm">
                                            <p>{formatDateTime(s.departure)}</p>
                                            <p className="text-gray-500">to</p>
                                            <p>{formatDateTime(s.arrival)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ACTION */}
                        <button className="w-full mt-4 bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-900 transition">
                            Select Flight
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FlightScheduleComp;
