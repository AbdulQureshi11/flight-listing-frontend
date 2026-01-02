import { useState } from "react";
import { validatePassengersAPI } from "../../../api";

const emptyPassenger = () => ({
  title: "MR",
  firstName: "",
  lastName: "",
  gender: "M",
  type: "ADT",
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
  const [passengers, setPassengers] = useState([emptyPassenger()]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (idx, field, value) => {
    const copy = [...passengers];
    copy[idx][field] = value;
    setPassengers(copy);
  };

  const addPassenger = () => {
    setPassengers([...passengers, emptyPassenger()]);
  };

  const removePassenger = (idx) => {
    if (passengers.length === 1) return;
    setPassengers(passengers.filter((_, i) => i !== idx));
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
      await validatePassengersAPI({ passengers });
      onNext(passengers);
    } catch (err) {
      setError(err.response?.data?.errors?.join(", "));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Passenger Details</h2>

      {passengers.map((p, idx) => (
        <div key={idx} className="border rounded-xl p-4 mb-4 bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">
              Passenger {idx + 1} ({p.type})
            </h3>
            {passengers.length > 1 && (
              <button
                onClick={() => removePassenger(idx)}
                className="text-red-600 text-sm"
              >
                Remove
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Title">
              <select
                className="input border"
                value={p.title}
                onChange={(e) => handleChange(idx, "title", e.target.value)}
              >
                <option value="MR">Mr</option>
                <option value="MS">Ms</option>
                <option value="MISS">Miss</option>
              </select>
            </Field>

            <Field label="First Name">
              <input
                className="input border"
                value={p.firstName}
                onChange={(e) => handleChange(idx, "firstName", e.target.value)}
              />
            </Field>

            <Field label="Last Name">
              <input
                className="input border"
                value={p.lastName}
                onChange={(e) => handleChange(idx, "lastName", e.target.value)}
              />
            </Field>

            <Field label="Gender">
              <select
                className="input border"
                value={p.gender}
                onChange={(e) => handleChange(idx, "gender", e.target.value)}
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </Field>

            <Field label="Passenger Type">
              <select
                className="input border"
                value={p.type}
                onChange={(e) => handleChange(idx, "type", e.target.value)}
              >
                <option value="ADT">Adult</option>
                <option value="CNN">Child</option>
                <option value="INF">Infant</option>
              </select>
            </Field>

            <Field label="Date of Birth">
              <input
                type="date"
                className="input border"
                value={p.dob}
                onChange={(e) => handleChange(idx, "dob", e.target.value)}
              />
            </Field>

            <Field label="Passport Number">
              <input
                className="input border"
                value={p.passportNumber}
                onChange={(e) =>
                  handleChange(idx, "passportNumber", e.target.value)
                }
              />
            </Field>

            <Field label="Passport Expiry">
              <input
                type="date"
                className="input border"
                value={p.passportExpiry}
                onChange={(e) =>
                  handleChange(idx, "passportExpiry", e.target.value)
                }
              />
            </Field>

            <Field label="Nationality">
              <input
                className="input border"
                value={p.nationality}
                onChange={(e) =>
                  handleChange(idx, "nationality", e.target.value)
                }
              />
            </Field>
          </div>
        </div>
      ))}

      {error && <p className="text-red-600 mb-3">{error}</p>}

      <div className="flex justify-between">
        <button onClick={addPassenger} className="btn-secondary">
          + Add Passenger
        </button>

        <button onClick={submit} disabled={loading} className="btn-primary">
          {loading ? "Validating..." : "Continue"}
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        ⚠ One adult can carry only one infant
      </p>
    </div>
  );
}
