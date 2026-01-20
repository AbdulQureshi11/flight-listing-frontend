import { useState, useEffect } from "react";
import { validatePassengersAPI } from "../../../api";

// Helper to create a passenger object with a specific type
const emptyPassenger = (type = "ADT") => ({
  title: "MR",
  firstName: "",
  lastName: "",
  gender: "M",
  type: type, // Now takes type as argument
  dob: "",
  passportNumber: "",
  passportExpiry: "",
  nationality: "",
});

const Field = ({ label, children }) => (
  <div className="flex flex-col">
    <label className="text-xs font-medium text-gray-600 mb-1">{label}</label>
    {children}
  </div>
);

export default function Passengers({ onNext }) {
  const [passengers, setPassengers] = useState([]); // Start with empty array
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // ================= NEW LOGIC: AUTO-MAP FROM SEARCH =================
  useEffect(() => {
    const searchParamsStr = sessionStorage.getItem("searchParams");
    if (searchParamsStr) {
      const { travelers } = JSON.parse(searchParamsStr);

      const initialPassengers = [];

      // Add Adults
      for (let i = 0; i < (travelers.adults || 0); i++) {
        initialPassengers.push(emptyPassenger("ADT"));
      }
      // Add Children
      for (let i = 0; i < (travelers.child || 0); i++) {
        initialPassengers.push(emptyPassenger("CNN"));
      }
      // Add Infants
      for (let i = 0; i < (travelers.infant || 0); i++) {
        initialPassengers.push(emptyPassenger("INF"));
      }

      setPassengers(initialPassengers);
    } else {
      // Fallback if no session data found
      setPassengers([emptyPassenger("ADT")]);
    }
  }, []);

  const handleChange = (idx, field, value) => {
    const copy = [...passengers];
    copy[idx][field] = value;
    setPassengers(copy);
  };

  const validateInfantRule = () => {
    const adults = passengers.filter((p) => p.type === "ADT").length;
    const infants = passengers.filter((p) => p.type === "INF").length;
    if (infants > adults) {
      return "Each infant must be associated with one adult (1 infant per adult allowed)";
    }
    return null;
  };

  const submit = async () => {
    const infantError = validateInfantRule();
    if (infantError) {
      setError(infantError);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // Ensure data is sent to your API
      await validatePassengersAPI({ passengers });
      onNext(passengers);
    } catch (err) {
      setError(err.response?.data?.errors?.join(", ") || "Validation failed");
    } finally {
      setLoading(false);
    }
  };

  if (passengers.length === 0) return <div>Loading passenger forms...</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Passenger Details</h2>

      {passengers.map((p, idx) => (
        <div key={idx} className="border rounded-xl p-4 mb-4 bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-indigo-700">
              Passenger {idx + 1}:{" "}
              {p.type === "ADT"
                ? "Adult"
                : p.type === "CNN"
                  ? "Child"
                  : "Infant"}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Title">
              <select
                className="p-2 rounded border bg-white"
                value={p.title}
                onChange={(e) => handleChange(idx, "title", e.target.value)}
              >
                <option value="MR">Mr</option>
                <option value="MS">Ms</option>
                <option value="MRS">Mrs</option>
                <option value="MSTR">Mstr</option>
                <option value="MISS">Miss</option>
              </select>
            </Field>

            <Field label="First Name">
              <input
                className="p-2 rounded border bg-white"
                placeholder="As per Passport"
                value={p.firstName}
                onChange={(e) => handleChange(idx, "firstName", e.target.value)}
              />
            </Field>

            <Field label="Last Name">
              <input
                className="p-2 rounded border bg-white"
                placeholder="As per Passport"
                value={p.lastName}
                onChange={(e) => handleChange(idx, "lastName", e.target.value)}
              />
            </Field>

            <Field label="Gender">
              <select
                className="p-2 rounded border bg-white"
                value={p.gender}
                onChange={(e) => handleChange(idx, "gender", e.target.value)}
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </Field>

            <Field label="Date of Birth">
              <input
                type="date"
                max="9999-12-31"
                className="p-2 rounded border bg-white"
                value={p.dob}
                onChange={(e) => handleChange(idx, "dob", e.target.value)}
              />
            </Field>

            <Field label="Country Code">
              <select
                className="p-2 rounded border bg-white"
                value={p.nationality}
                onChange={(e) =>
                  handleChange(idx, "nationality", e.target.value)
                }
              >
                <option value="">Select Country</option>
                <option value="PK">PK (Pakistan)</option>
                <option value="US">US (United States)</option>
                <option value="GB">GB (United Kingdom)</option>
                <option value="SA">SA (Saudi Arabia)</option>
                <option value="UAE">UAE (United Arab Emirates)</option>
                <option value="DE">DE (Germany)</option>
                {/* Add more countries as needed */}
              </select>
            </Field>

            <Field label="Passport Number">
              <input
                className="p-2 rounded border bg-white"
                value={p.passportNumber}
                onChange={(e) =>
                  handleChange(idx, "passportNumber", e.target.value)
                }
              />
            </Field>

            <Field label="Passport Expiry">
              <input
                type="date"
                max="9999-12-31"
                className="p-2 rounded border bg-white"
                value={p.passportExpiry}
                onChange={(e) =>
                  handleChange(idx, "passportExpiry", e.target.value)
                }
              />
            </Field>
          </div>
        </div>
      ))}

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="flex justify-end mt-6">
        <button
          onClick={submit}
          disabled={loading}
          className={`px-10 py-3 rounded-full font-bold text-white transition-all ${
            loading
              ? "bg-gray-400"
              : "bg-indigo-600 hover:bg-indigo-700 shadow-lg"
          }`}
        >
          {loading ? "Validating..." : "Continue to Contact Info"}
        </button>
      </div>
    </div>
  );
}
