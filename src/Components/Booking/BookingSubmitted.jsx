import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const BookingSubmitted = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract all booking data from navigation state
  const {
    bookingId,
    pnr,
    airlineConfirmation,
    message,
    status,
    ticketingDeadline,
    details,
  } = location.state || {};

  // If no booking data, redirect to home
  if (!bookingId) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.errorIcon}>❌</div>
          <h1 style={styles.title}>No Booking Found</h1>
          <p style={styles.message}>
            We couldn't find your booking information.
          </p>
          <button
            onClick={() => navigate("/flight-demo")}
            style={styles.button}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Copy to clipboard function
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // Format ticketing deadline
  const formatDeadline = (deadline) => {
    if (!deadline) return null;
    try {
      return new Date(deadline).toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return deadline;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.successIcon}>✅</div>

        <h1 style={styles.title}>Booking Submitted Successfully!</h1>

        {/* Main Booking Info */}
        <div style={styles.infoBox}>
          <div style={styles.bookingIdRow}>
            <div>
              <p style={styles.label}>Universal Record (UR)</p>
              <p style={styles.bookingId}>{bookingId}</p>
            </div>
            <button
              onClick={() => copyToClipboard(bookingId)}
              style={styles.copyButton}
              title="Copy Booking ID"
            >
              📋 Copy
            </button>
          </div>

          {pnr && pnr !== bookingId && (
            <div style={styles.bookingIdRow}>
              <div>
                <p style={styles.label}>Provider PNR</p>
                <p style={styles.pnr}>{pnr}</p>
              </div>
              <button
                onClick={() => copyToClipboard(pnr)}
                style={styles.copyButton}
                title="Copy PNR"
              >
                📋 Copy
              </button>
            </div>
          )}

          {airlineConfirmation && (
            <div style={styles.bookingIdRow}>
              <div>
                <p style={styles.label}>Airline Confirmation</p>
                <p style={styles.confirmation}>{airlineConfirmation}</p>
              </div>
              <button
                onClick={() => copyToClipboard(airlineConfirmation)}
                style={styles.copyButton}
                title="Copy Confirmation"
              >
                📋 Copy
              </button>
            </div>
          )}

          {message && <p style={styles.message}>{message}</p>}
        </div>

        {/* Status Badge */}
        <div style={styles.statusBox}>
          <div style={styles.statusBadge}>
            <span style={styles.statusDot}>⏳</span>
            <span>Status: {status || "Pending Approval"}</span>
          </div>
        </div>

        {/* Booking Details Summary */}
        {details && (
          <div style={styles.detailsBox}>
            <div style={styles.detailsGrid}>
              {details.passengers && (
                <div style={styles.detailItem}>
                  <span style={styles.detailIcon}>👥</span>
                  <div>
                    <p style={styles.detailLabel}>Passengers</p>
                    <p style={styles.detailValue}>{details.passengers}</p>
                  </div>
                </div>
              )}
              {details.segments && (
                <div style={styles.detailItem}>
                  <span style={styles.detailIcon}>✈️</span>
                  <div>
                    <p style={styles.detailLabel}>Segments</p>
                    <p style={styles.detailValue}>{details.segments}</p>
                  </div>
                </div>
              )}
              {details.totalPrice && (
                <div style={styles.detailItem}>
                  <span style={styles.detailIcon}>💰</span>
                  <div>
                    <p style={styles.detailLabel}>Total Price</p>
                    <p style={styles.detailValue}>{details.totalPrice}</p>
                  </div>
                </div>
              )}
              {details.email && (
                <div style={styles.detailItem}>
                  <span style={styles.detailIcon}>📧</span>
                  <div>
                    <p style={styles.detailLabel}>Email</p>
                    <p style={styles.detailValue}>{details.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ticketing Deadline Warning */}
        {ticketingDeadline && (
          <div style={styles.deadlineBox}>
            <p style={styles.deadlineTitle}>⏰ Ticketing Deadline</p>
            <p style={styles.deadlineText}>
              Tickets must be issued by:{" "}
              <strong>{formatDeadline(ticketingDeadline)}</strong>
            </p>
          </div>
        )}

        {/* Warnings */}
        {details?.warnings && details.warnings.length > 0 && (
          <div style={styles.warningsBox}>
            <p style={styles.warningsTitle}>⚠️ Important Notices</p>
            <ul style={styles.warningsList}>
              {details.warnings.map((warning, idx) => (
                <li key={idx} style={styles.warningItem}>
                  {warning.message || warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* What's Next Section */}
        <div style={styles.infoSection}>
          <h3 style={styles.sectionTitle}>What's Next?</h3>
          <ul style={styles.stepsList}>
            <li>✅ Your booking request has been received</li>
            <li>🔍 Our team will review your booking within 24 hours</li>
            <li>📧 You'll receive an email confirmation once approved</li>
            <li>💳 Payment instructions will be sent via email</li>
            <li>
              📝 Keep your Booking ID (<strong>{bookingId}</strong>) for
              reference
            </li>
            {ticketingDeadline && (
              <li>
                ⏰ Complete payment before{" "}
                <strong>{formatDeadline(ticketingDeadline)}</strong>
              </li>
            )}
          </ul>
        </div>

        {/* Important Information */}
        <div style={styles.importantBox}>
          <p style={styles.importantTitle}>⚠️ Important</p>
          <ul style={styles.importantList}>
            <li>
              Please check your email (including spam folder) for booking
              confirmation
            </li>
            <li>
              Booking will be held for 24 hours pending payment confirmation
            </li>
            <li>Contact us immediately if you need to make changes</li>
            {airlineConfirmation && (
              <li>
                Save your airline confirmation code:{" "}
                <strong>{airlineConfirmation}</strong>
              </li>
            )}
          </ul>
        </div>

        {/* Contact Information */}
        <div style={styles.contactBox}>
          <p style={styles.contactText}>
            <strong>Need help?</strong> Contact us at{" "}
            <a href="mailto:support@yourcompany.com" style={styles.link}>
              support@yourcompany.com
            </a>{" "}
            or call <strong>+92-300-1234567</strong>
          </p>
        </div>

        {/* Action Buttons */}
        <div style={styles.actions}>
          <button onClick={() => navigate("/")} style={styles.primaryButton}>
            🏠 Back to Home
          </button>
          <button onClick={() => navigate("/")} style={styles.secondaryButton}>
            🔍 Search More Flights
          </button>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            Booking confirmed at{" "}
            {new Date().toLocaleString("en-GB", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    background: "white",
    borderRadius: "16px",
    padding: "40px",
    maxWidth: "700px",
    width: "100%",
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
    textAlign: "center",
  },
  successIcon: {
    fontSize: "80px",
    marginBottom: "20px",
    animation: "bounce 1s ease",
  },
  errorIcon: {
    fontSize: "80px",
    marginBottom: "20px",
  },
  title: {
    fontSize: "28px",
    color: "#333",
    marginBottom: "20px",
    fontWeight: "600",
  },
  infoBox: {
    background: "#f0f7ff",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "20px",
    border: "2px solid #667eea",
  },
  bookingIdRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    marginBottom: "15px",
  },
  label: {
    fontSize: "12px",
    color: "#666",
    marginBottom: "5px",
    textAlign: "left",
  },
  bookingId: {
    fontSize: "24px",
    color: "#667eea",
    fontWeight: "bold",
    fontFamily: "monospace",
    margin: 0,
  },
  pnr: {
    fontSize: "20px",
    color: "#764ba2",
    fontWeight: "bold",
    fontFamily: "monospace",
    margin: 0,
  },
  confirmation: {
    fontSize: "18px",
    color: "#28a745",
    fontWeight: "bold",
    fontFamily: "monospace",
    margin: 0,
  },
  copyButton: {
    padding: "8px 16px",
    background: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
  },
  message: {
    fontSize: "16px",
    color: "#555",
    lineHeight: "1.6",
    marginTop: "10px",
  },
  statusBox: {
    marginBottom: "30px",
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "#fff3cd",
    padding: "10px 20px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#856404",
  },
  statusDot: {
    fontSize: "16px",
  },
  detailsBox: {
    background: "#f8f9fa",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "20px",
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "15px",
  },
  detailItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  detailIcon: {
    fontSize: "24px",
  },
  detailLabel: {
    fontSize: "12px",
    color: "#666",
    margin: 0,
    textAlign: "left",
  },
  detailValue: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
    margin: 0,
    textAlign: "left",
  },
  deadlineBox: {
    background: "#fff3e0",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
    border: "2px solid #ff9800",
  },
  deadlineTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#f57c00",
    marginBottom: "5px",
  },
  deadlineText: {
    fontSize: "14px",
    color: "#666",
    margin: 0,
  },
  warningsBox: {
    background: "#fff3e0",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
    textAlign: "left",
    border: "1px solid #ff9800",
  },
  warningsTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#f57c00",
    marginBottom: "10px",
  },
  warningsList: {
    fontSize: "13px",
    color: "#666",
    lineHeight: "1.8",
    paddingLeft: "20px",
    margin: 0,
  },
  warningItem: {
    marginBottom: "5px",
  },
  infoSection: {
    textAlign: "left",
    marginBottom: "30px",
    background: "#f8f9fa",
    padding: "20px",
    borderRadius: "12px",
  },
  sectionTitle: {
    fontSize: "18px",
    color: "#333",
    marginBottom: "15px",
    fontWeight: "600",
  },
  stepsList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    lineHeight: "2",
    color: "#555",
  },
  importantBox: {
    background: "#e3f2fd",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
    textAlign: "left",
    border: "1px solid #2196f3",
  },
  importantTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1976d2",
    marginBottom: "10px",
  },
  importantList: {
    fontSize: "14px",
    color: "#666",
    lineHeight: "1.8",
    paddingLeft: "20px",
  },
  contactBox: {
    background: "#e8f5e9",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "30px",
  },
  contactText: {
    fontSize: "14px",
    color: "#2e7d32",
    margin: 0,
  },
  link: {
    color: "#667eea",
    textDecoration: "none",
    fontWeight: "600",
  },
  actions: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  primaryButton: {
    flex: 1,
    minWidth: "150px",
    padding: "12px 24px",
    background: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  secondaryButton: {
    flex: 1,
    minWidth: "150px",
    padding: "12px 24px",
    background: "white",
    color: "#667eea",
    border: "2px solid #667eea",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  footer: {
    marginTop: "30px",
    paddingTop: "20px",
    borderTop: "1px solid #e0e0e0",
  },
  footerText: {
    fontSize: "12px",
    color: "#999",
  },
  button: {
    padding: "12px 24px",
    background: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "20px",
  },
};

// Add hover effects
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-20px); }
      60% { transform: translateY(-10px); }
    }
    
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }
  `;
  document.head.appendChild(style);
}

export default BookingSubmitted;
