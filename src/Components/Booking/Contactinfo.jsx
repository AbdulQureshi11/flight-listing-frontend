import { useState } from "react";
import axios from "axios";

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-gray-600">{label}</label>
    {children}
  </div>
);

export default function ContactInfo({ onNext, onBack }) {
  const [contact, setContact] = useState({
    email: "",
    phone: "",
    phoneCountryCode: "92",
  });

  // const [otpSent, setOtpSent] = useState(false);
  // const [otp, setOtp] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  // const [resendTimer, setResendTimer] = useState(0);

  // ================== OTP Functions ==================
  /*
  // Send OTP to email
  const sendOtp = async () => { ... }

  // Verify OTP
  const verifyOtp = async () => { ... }

  // Resend OTP
  const resendOtp = async () => { ... }

  // Start countdown timer for resend button
  const startResendTimer = () => { ... }
  */

  const handleContinue = () => {
    if (!contact.email || !contact.phone) {
      setError("Please enter both email and phone number");
      return;
    }
    setError(null);
    onNext(contact);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Contact Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Field label="Email Address *">
          <input
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. john.doe@email.com"
            value={contact.email}
            onChange={(e) => setContact({ ...contact, email: e.target.value })}
          />
        </Field>

        <Field label="Phone Number *">
          <div className="flex gap-2">
            <input
              className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+92"
              value={contact.phoneCountryCode}
              onChange={(e) =>
                setContact({
                  ...contact,
                  phoneCountryCode: e.target.value.replace(/\D/g, ""),
                })
              }
            />
            <input
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="3001234567"
              value={contact.phone}
              onChange={(e) =>
                setContact({
                  ...contact,
                  phone: e.target.value.replace(/\D/g, ""),
                })
              }
            />
          </div>
        </Field>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          ← Back
        </button>

        <button
          onClick={handleContinue}
          disabled={loading || !contact.email || !contact.phone}
          className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Processing..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
