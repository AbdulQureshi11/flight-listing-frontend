import * as Yup from "yup";
import { Formik, Form, FieldArray } from "formik";
import axios from "axios";
import { useState, useRef, useEffect, useMemo } from "react";
import PrimaryBtn from "../Common/PrimaryBtn";
import { useNavigate } from "react-router-dom";
import { IoSearchOutline, IoAirplane } from "react-icons/io5"; // Added IoAirplane
import { MdClose, MdAdd } from "react-icons/md";
import AirportAutocomplete from "../Common/AutoComplete";
import api from "../../../api.js";

import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const FlightSearch = () => {
  const navigate = useNavigate();
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
    segments: [
      { from: "", to: "", date: null },
      { from: "", to: "", date: null },
    ],
    adults: 1,
    child: 0,
    infant: 0,
    travelClass: "Economy",
  };

  const validationSchema = useMemo(() => {
    if (tripType === "multi") {
      return Yup.object({
        segments: Yup.array()
          .of(
            Yup.object({
              from: Yup.string()
                .length(3, "Use 3-letter code")
                .required("Required"),
              to: Yup.string()
                .length(3, "Use 3-letter code")
                .required("Required"),
              date: Yup.mixed().required("Required"),
            })
          )
          .min(2),
      });
    } else {
      return Yup.object({
        from: Yup.string().length(3, "Use 3-letter code").required("Required"),
        to: Yup.string().length(3, "Use 3-letter code").required("Required"),
        date: Yup.mixed().required("Departure required"),
        returnDate:
          tripType === "round"
            ? Yup.mixed().required("Return date required")
            : Yup.mixed().nullable(),
      });
    }
  }, [tripType]);

  const handleSubmit = async (values) => {
    setFormError("");
    setLoading(true);

    try {
      let payload = {
        tripType,
        travelers: {
          adults: values.adults,
          child: values.child,
          infant: values.infant,
        },
        travelClass: values.travelClass,
      };

      if (tripType === "multi") {
        payload.segments = values.segments.map((seg) => ({
          from: seg.from.toUpperCase(),
          to: seg.to.toUpperCase(),
          date: seg.date.format("YYYY-MM-DD"),
        }));
      } else {
        payload.from = values.from.toUpperCase();
        payload.to = values.to.toUpperCase();
        payload.date = values.date.format("YYYY-MM-DD");

        if (tripType === "round") {
          payload.returnDate = values.returnDate.format("YYYY-MM-DD");
        }
      }

      const res = await api.post("/api/search", payload);
      sessionStorage.setItem("flightSearchResults", JSON.stringify(res.data));
      sessionStorage.setItem(
        "searchParams",
        JSON.stringify({
          travelers: {
            adults: values.adults,
            child: values.child,
            infant: values.infant,
          },
          travelClass: values.travelClass,
          tripType,
        })
      );
      navigate("/flight-schedule");
    } catch (err) {
      setFormError(err.response?.data?.error || "Search failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-20 -mt-28">
      {/* ===== SEARCH LOADER OVERLAY ===== */}
      {loading && (
        <div className="fixed inset-0 z-[9999] bg-blue-900/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center">
            <div className="relative w-20 h-20 mb-4">
              <div className="absolute inset-0 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-blue-600">
                <IoAirplane className="text-3xl animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-800">
              Finding Flights...
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              Searching for the best deals for you
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm px-6 py-7 max-w-6xl mx-auto relative">
        <div className="absolute -top-5 left-6 bg-white px-4 py-2 rounded-full shadow text-sm font-semibold flex gap-5">
          {["round", "oneway", "multi"].map((t) => (
            <label key={t} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={tripType === t}
                onChange={() => setTripType(t)}
                disabled={loading}
              />
              <span className="capitalize">
                {t === "multi"
                  ? "Multi City"
                  : t === "round"
                  ? "Round Trip"
                  : "One Way"}
              </span>
            </label>
          ))}
        </div>

        {formError && (
          <div className="mb-3 text-sm text-red-600 font-semibold text-center bg-red-50 p-2 rounded-lg">
            {formError}
          </div>
        )}

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, setFieldValue, errors, touched }) => (
              <Form noValidate>
                {tripType === "multi" ? (
                  <FieldArray name="segments">
                    {({ push, remove }) => (
                      <div className="space-y-4">
                        {values.segments.map((segment, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end relative"
                          >
                            <AirportAutocomplete
                              placeholder="From"
                              value={segment.from}
                              onChange={(code) =>
                                setFieldValue(`segments.${index}.from`, code)
                              }
                            />
                            <AirportAutocomplete
                              placeholder="To"
                              value={segment.to}
                              onChange={(code) =>
                                setFieldValue(`segments.${index}.to`, code)
                              }
                            />
                            <DatePicker
                              label={`Flight ${index + 1} Date`}
                              value={segment.date}
                              onChange={(v) =>
                                setFieldValue(`segments.${index}.date`, v)
                              }
                              slotProps={{
                                textField: { size: "small", fullWidth: true },
                              }}
                            />
                            {values.segments.length > 2 && (
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="h-10 px-3 bg-red-500 text-white rounded-xl hover:bg-red-600 flex items-center justify-center"
                              >
                                <MdClose className="text-xl" />
                              </button>
                            )}
                          </div>
                        ))}
                        {values.segments.length < 5 && (
                          <button
                            type="button"
                            onClick={() =>
                              push({ from: "", to: "", date: null })
                            }
                            className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center gap-2 text-sm"
                          >
                            <MdAdd /> Add Another Flight
                          </button>
                        )}
                      </div>
                    )}
                  </FieldArray>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                    <AirportAutocomplete
                      placeholder="From (Airport Code)"
                      value={values.from}
                      onChange={(code) => setFieldValue("from", code)}
                    />
                    <AirportAutocomplete
                      placeholder="To (Airport Code)"
                      value={values.to}
                      onChange={(code) => setFieldValue("to", code)}
                    />
                    <DatePicker
                      label="Departure"
                      value={values.date}
                      onChange={(v) => setFieldValue("date", v)}
                      slotProps={{
                        textField: { size: "small", fullWidth: true },
                      }}
                    />
                    <DatePicker
                      label="Return"
                      disabled={tripType !== "round"}
                      value={values.returnDate}
                      onChange={(v) => setFieldValue("returnDate", v)}
                      slotProps={{
                        textField: { size: "small", fullWidth: true },
                      }}
                    />
                  </div>
                )}

                <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div
                    ref={travellerRef}
                    className="relative h-12 bg-gray-50 rounded-xl px-4 flex flex-col justify-center cursor-pointer w-full md:w-64 border border-transparent hover:border-blue-200 transition-all"
                    onClick={() => setTravellerOpen(true)}
                  >
                    <span className="text-sm font-black text-slate-700">
                      {values.adults} Adt, {values.child} Chd ·{" "}
                      {values.travelClass}
                    </span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">
                      Travellers & Class
                    </span>

                    {travellerOpen && (
                      <div
                        className="absolute left-0 top-14 bg-white shadow-2xl rounded-2xl p-5 w-72 z-[100] border border-slate-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {["adults", "child", "infant"].map((k) => (
                          <div
                            key={k}
                            className="flex justify-between items-center mb-4"
                          >
                            <span className="capitalize font-bold text-slate-700">
                              {k}
                            </span>
                            <div className="flex items-center gap-4 bg-slate-50 rounded-lg px-2 py-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setFieldValue(
                                    k,
                                    Math.max(
                                      k === "adults" ? 1 : 0,
                                      values[k] - 1
                                    )
                                  )
                                }
                                className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg shadow-sm hover:text-blue-600"
                              >
                                {" "}
                                −{" "}
                              </button>
                              <span className="font-black min-w-[20px] text-center">
                                {values[k]}
                              </span>
                              <button
                                type="button"
                                onClick={() => setFieldValue(k, values[k] + 1)}
                                className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg shadow-sm hover:text-blue-600"
                              >
                                {" "}
                                +{" "}
                              </button>
                            </div>
                          </div>
                        ))}

                        <div className="border-t pt-4 space-y-2">
                          {["Economy", "Business", "First"].map((c) => (
                            <label
                              key={c}
                              className="flex items-center gap-3 text-sm font-bold text-slate-600 cursor-pointer hover:text-blue-600"
                            >
                              <input
                                type="radio"
                                checked={values.travelClass === c}
                                onChange={() => setFieldValue("travelClass", c)}
                                className="accent-blue-600"
                              />
                              {c}
                            </label>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => setTravellerOpen(false)}
                          className="w-full mt-4 bg-blue-600 text-white py-2 rounded-xl text-xs font-black"
                        >
                          Done
                        </button>
                      </div>
                    )}
                  </div>

                  <PrimaryBtn
                    type="submit"
                    disabled={loading}
                    className={`px-14 py-3 rounded-full text-sm font-black text-white shadow-lg flex items-center gap-2 transition-all ${
                      loading
                        ? "bg-slate-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 active:scale-95"
                    }`}
                  >
                    <IoSearchOutline className="text-xl" />
                    {loading ? "SEARCHING..." : "SEARCH FLIGHTS"}
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
