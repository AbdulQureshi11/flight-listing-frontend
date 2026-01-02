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

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Send OTP to email
  const sendOtp = async () => {
    if (!contact.email) {
      setError("Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios("http://localhost:9000/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: contact.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setOtpSent(true);
      startResendTimer();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios("http://localhost:9000/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: contact.email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid OTP");
      }

      // OTP verified successfully, proceed to next step
      onNext(contact);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const resendOtp = async () => {
    setOtp("");
    setError(null);
    await sendOtp();
  };

  // Start countdown timer for resend button
  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Contact Information</h2>

      {!otpSent ? (
        // Step 1: Email & Phone Input
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Field label="Email Address">
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. john.doe@email.com"
                value={contact.email}
                onChange={(e) =>
                  setContact({ ...contact, email: e.target.value })
                }
              />
            </Field>

            <Field label="Phone Number">
              <div className="flex gap-2">
                <input
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+92"
                  value={contact.phoneCountryCode}
                  onChange={(e) =>
                    setContact({
                      ...contact,
                      phoneCountryCode: e.target.value,
                    })
                  }
                />
                <input
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="3001234567"
                  value={contact.phone}
                  onChange={(e) =>
                    setContact({ ...contact, phone: e.target.value })
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
              onClick={sendOtp}
              disabled={loading}
              className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            📧 A verification code will be sent to your email
          </p>
        </>
      ) : (
        // Step 2: OTP Verification
        <>
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              We've sent a 6-digit verification code to{" "}
              <strong>{contact.email}</strong>
            </p>
          </div>

          <Field label="Enter OTP">
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
              placeholder="000000"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            />
          </Field>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="mt-4 text-center">
            {resendTimer > 0 ? (
              <p className="text-sm text-gray-500">
                Resend OTP in {resendTimer}s
              </p>
            ) : (
              <button
                onClick={resendOtp}
                disabled={loading}
                className="text-sm text-blue-600 hover:text-blue-700 underline disabled:text-gray-400"
              >
                Didn't receive the code? Resend OTP
              </button>
            )}
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => {
                setOtpSent(false);
                setOtp("");
                setError(null);
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              ← Change Email
            </button>

            <button
              onClick={verifyOtp}
              disabled={loading || otp.length !== 6}
              className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-3 text-center">
            The OTP is valid for 10 minutes
          </p>
        </>
      )}
    </div>
  );
}
