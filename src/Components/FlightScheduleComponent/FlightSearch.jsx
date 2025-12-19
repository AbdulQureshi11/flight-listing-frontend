import * as Yup from "yup";
import { Formik, Form } from "formik";
import axios from "axios";
import { useState, useRef, useEffect, useMemo } from "react";
import PrimaryBtn from "../Common/PrimaryBtn";
import Inputfied from "../Common/Inputfield";
import { useNavigate } from "react-router-dom";
import { IoSearchOutline } from "react-icons/io5";


import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const FlightSearch = () => {
    const navigate = useNavigate();
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tripType, setTripType] = useState("round");
    const [travellerOpen, setTravellerOpen] = useState(false);
    const [formError, setFormError] = useState("");
    const travellerRef = useRef(null);

    /* ---------- OUTSIDE CLICK ---------- */
    useEffect(() => {
        const close = (e) => {
            if (travellerRef.current && !travellerRef.current.contains(e.target)) {
                setTravellerOpen(false);
            }
        };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    const initialValues = {
        from: "",
        to: "",
        date: null,
        returnDate: null,
        adults: 1,
        child: 0,
        infant: 0,
        travelClass: "Economy",
    };

    const validationSchema = useMemo(
        () =>
            Yup.object({
                from: Yup.string().length(3).required("Required"),
                to: Yup.string().length(3).required("Required"),
                date: Yup.mixed().required("Departure required"),
            }),
        []
    );

    const handleSubmit = async (values) => {
        setFormError("");

        // Safety check for dates
        if (!values.date) {
            setFormError("Please select a departure date");
            return;
        }

        if (tripType === "round" && !values.returnDate) {
            setFormError("Please select return date for round trip");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                from: values.from,
                to: values.to,
                date: values.date.format("YYYY-MM-DD"),
                adults: values.adults,
            };

            const res = await axios.post(
                "http://localhost:9000/api/search",
                payload
            );

            console.log("API RESPONSE FLIGHTS:", res.data.flights);

            if (!res.data?.flights?.length) {
                setFormError("No flights found for this route/date");
                return;
            }

            // Clear any old results before setting new ones
            sessionStorage.removeItem("flightResults");

            // 1. Save new data
            sessionStorage.setItem(
                "flightResults",
                JSON.stringify(res.data.flights)
            );

            // Also save the search payload so the results can be refreshed
            // when the schedule page mounts (e.g., after navigating back/forward).
            sessionStorage.setItem(
                "flightSearchPayload",
                JSON.stringify(payload)
            );

            // 2. Navigate
            navigate("/flight-schedule");

        } catch (err) {
            console.error("SEARCH ERROR:", err);
            setFormError(err.response?.data?.message || "Search failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative z-20 -mt-28">
            <div className="bg-white rounded-3xl shadow-sm px-6 py-7 max-w-6xl mx-auto relative">

                {/* ===== TRIP TYPE ===== */}
                <div className="absolute -top-5 left-6 bg-white px-4 py-2 rounded-full shadow text-sm font-semibold flex gap-5">
                    {["round", "oneway", "multi"].map((t) => (
                        <label key={t} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                checked={tripType === t}
                                onChange={() => setTripType(t)}
                            />
                            {t === "round"
                                ? "Round Trip"
                                : t === "oneway"
                                    ? "One Way"
                                    : "Multi City"}
                        </label>
                    ))}
                </div>

                {formError && (
                    <div className="mb-3 text-sm text-red-600 font-semibold text-center">
                        {formError}
                    </div>
                )}

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ values, setFieldValue }) => (
                            <Form noValidate>

                                {/* ===== FIXED GRID ===== */}
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">

                                    {/* FROM */}
                                    <Inputfied
                                        placeholder="From (City or Airport Code)"
                                        className="h-10 text-sm rounded-xl border border-gray-200 w-full"
                                        value={values.from}
                                        onChange={(e) =>
                                            setFieldValue("from", e.target.value.toUpperCase())
                                        }
                                    />

                                    {/* TO */}
                                    <Inputfied
                                        placeholder="To (City or Airport Code)"
                                        className="h-10 text-sm rounded-xl border border-gray-200 w-full"
                                        value={values.to}
                                        onChange={(e) =>
                                            setFieldValue("to", e.target.value.toUpperCase())
                                        }
                                    />

                                    {/* DEPARTURE */}
                                    <DatePicker
                                        label="Departure"
                                        className="border border-gray-200"
                                        value={values.date}
                                        onChange={(v) => setFieldValue("date", v)}
                                        slotProps={{
                                            textField: { size: "small", fullWidth: true },
                                        }}
                                    />

                                    {/* RETURN */}
                                    <DatePicker
                                        label="Return"
                                        disabled={tripType !== "round"}
                                        value={values.returnDate}
                                        onChange={(v) => setFieldValue("returnDate", v)}
                                        slotProps={{
                                            textField: { size: "small", fullWidth: true },
                                        }}
                                    />

                                    {/* TRAVELLERS */}
                                    <div
                                        ref={travellerRef}
                                        className="relative h-10 bg-gray-50 rounded-xl px-3 flex flex-col justify-center cursor-pointer"
                                        onClick={() => setTravellerOpen(true)}
                                    >
                                        <span className="text-sm font-semibold">
                                            {values.adults} Adult · {values.travelClass}
                                        </span>
                                        <span className="text-[11px] text-gray-500">
                                            Travellers & Class
                                        </span>

                                        {travellerOpen && (
                                            <div
                                                className="absolute right-0 top-12 bg-white shadow-xl rounded-xl p-4 w-72 z-30"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {["adults", "child", "infant"].map((k) => (
                                                    <div key={k} className="flex justify-between items-center mb-3">
                                                        <span className="capitalize">{k}</span>
                                                        <div className="flex gap-3">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setFieldValue(k, Math.max(0, values[k] - 1))
                                                                }
                                                                className="px-2 bg-blue-500 text-white rounded"
                                                            >
                                                                −
                                                            </button>
                                                            <span>{values[k]}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setFieldValue(k, values[k] + 1)
                                                                }
                                                                className="px-2 bg-blue-500 text-white rounded"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}

                                                <div className="border-t pt-3 space-y-2">
                                                    {["Economy", "Business", "First"].map((c) => (
                                                        <label key={c} className="flex gap-2 text-sm">
                                                            <input
                                                                type="radio"
                                                                checked={values.travelClass === c}
                                                                onChange={() =>
                                                                    setFieldValue("travelClass", c)
                                                                }
                                                            />
                                                            {c}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* SEARCH BUTTON */}
                                <div className="flex justify-center mt-5">
                                    <PrimaryBtn
                                        type="submit"
                                        className="px-14 py-2.5 rounded-full text-sm font-semibold
                    bg-gradient-to-r from-blue-600 to-blue-500
                    text-white shadow-md hover:shadow-lg flex items-center gap-2"
                                    >
                                        <IoSearchOutline className="text-[20px]" /> {loading ? "Searching..." : " Search Flights"}
                                    </PrimaryBtn>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </LocalizationProvider>
            </div>
        </div>
    );
};

export default FlightSearch;
