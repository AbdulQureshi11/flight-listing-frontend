import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FlightScheduleComp from "./FlightScheduleComp";

const FlightSchedule = () => {
    const navigate = useNavigate();

    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasSearched, setHasSearched] = useState(false); // 🔥 NEW

    useEffect(() => {
        const payloadStr = sessionStorage.getItem("flightSearchPayload");

        // 🚫 Block direct URL access
        if (!payloadStr) {
            setFlights([]);
            setLoading(false);
            setHasSearched(false);
            return;
        }

        const payload = JSON.parse(payloadStr);

        setLoading(true);

        axios
            .post("http://localhost:9000/api/search", payload)
            .then((res) => {
                setFlights(res.data?.flights || []);
            })
            .catch((err) => {
                console.error("SEARCH ERROR:", err);
                setFlights([]);
            })
            .finally(() => {
                setHasSearched(true);   // ✅ API finished
                setLoading(false);
            });

        // 🔥 CLEAR DATA when leaving page
        return () => {
            sessionStorage.removeItem("flightResults");
            sessionStorage.removeItem("flightSearchPayload");
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 py-6">
            <FlightScheduleComp
                flights={flights}
                loading={loading}
                hasSearched={hasSearched}
            />
        </div>
    );
};

export default FlightSchedule;
