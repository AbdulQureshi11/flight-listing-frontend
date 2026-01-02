import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const BookingSubmitted = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { bookingId, message } = location.state || {};

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
          <button onClick={() => navigate("/")} style={styles.button}>
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.successIcon}>✅</div>

        <h1 style={styles.title}>Booking Submitted Successfully!</h1>

        <div style={styles.infoBox}>
          <p style={styles.bookingId}>
            <strong>Booking ID:</strong> {bookingId}
          </p>
          <p style={styles.message}>{message}</p>
        </div>

        <div style={styles.statusBox}>
          <div style={styles.statusBadge}>
            <span style={styles.statusDot}>⏳</span>
            <span>Status: Pending Approval</span>
          </div>
        </div>

        <div style={styles.infoSection}>
          <h3 style={styles.sectionTitle}>What's Next?</h3>
          <ul style={styles.stepsList}>
            <li>Our team will review your booking request</li>
            <li>You'll receive an email confirmation once approved</li>
            <li>Payment instructions will be sent via email</li>
            <li>Keep your Booking ID for reference</li>
          </ul>
        </div>

        <div style={styles.contactBox}>
          <p style={styles.contactText}>
            <strong>Need help?</strong> Contact us at{" "}
            <a href="mailto:support@yourcompany.com" style={styles.link}>
              support@yourcompany.com
            </a>
          </p>
        </div>

        <div style={styles.actions}>
          <button onClick={() => navigate("/")} style={styles.primaryButton}>
            Back to Home
          </button>
          <button
            onClick={() => navigate("/my-bookings")}
            style={styles.secondaryButton}
          >
            View My Bookings
          </button>
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
    maxWidth: "600px",
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
    background: "#f8f9fa",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "20px",
  },
  bookingId: {
    fontSize: "18px",
    color: "#667eea",
    marginBottom: "10px",
    fontFamily: "monospace",
  },
  message: {
    fontSize: "16px",
    color: "#555",
    lineHeight: "1.6",
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
  },
  contactBox: {
    background: "#e3f2fd",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "30px",
  },
  contactText: {
    fontSize: "14px",
    color: "#1565c0",
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
};

// Add hover effects with inline style (or use CSS)
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
