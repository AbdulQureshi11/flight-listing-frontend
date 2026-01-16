import React, { useState, useEffect } from "react";
import FlightScheduleComp from "./FlightScheduleComp";

const FlightSchedule = () => {
  const [flights, setFlights] = useState([]);
  const [tripType, setTripType] = useState("oneway");
  const [loading, setLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchParams, setSearchParams] = useState(null);

  useEffect(() => {
    const resultsStr = sessionStorage.getItem("flightSearchResults");
    const searchParamsStr = sessionStorage.getItem("searchParams");

    if (resultsStr) {
      try {
        const searchResults = JSON.parse(resultsStr);
        setFlights(searchResults.flights || []);
        setTripType(searchResults.tripType || "oneway");
        setHasSearched(true);

        if (searchParamsStr) {
          setSearchParams(JSON.parse(searchParamsStr));
        }
      } catch (error) {
        console.error("Error parsing flight results:", error);
      }
    }
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <FlightScheduleComp
        flights={flights} // Simplified: Single array of flight objects
        tripType={tripType}
        loading={loading}
        hasSearched={hasSearched}
        searchParams={searchParams}
      />
    </div>
  );
};

export default FlightSchedule;
