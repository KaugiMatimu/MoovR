"use client";

import { useEffect, useState } from "react";

export default function WithdrawalsManager() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  // Retrieve the token dynamically from localStorage (or use your auth method)
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    } else {
      console.error("No token found in localStorage");
    }
  }, []);

  // Function to fetch withdrawals list
  const fetchWithdrawals = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("https://moovr-api.vercel.app/api/v1/wallet/withdrawals", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch withdrawals");
      }
      const data = await response.json();
      // Assume the API returns an array of withdrawal objects
      setWithdrawals(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch withdrawals whenever the token is available
  useEffect(() => {
    if (token) fetchWithdrawals();
  }, [token]);

  // Handle approval or rejection
  const handleWithdrawalAction = async (transactionId, status) => {
    if (!token) {
      alert("Token not available");
      return;
    }
    setActionLoading(transactionId);
    try {
      const response = await fetch("https://moovr-api.vercel.app/api/v1/wallet/withdraw/approval", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          status, // "approved" or "rejected"
          transactionId,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update withdrawal status");
      }
      const updatedWithdrawal = await response.json();
      // Update the withdrawal status in the local state
      setWithdrawals((prevWithdrawals) =>
        prevWithdrawals.map((w) =>
          w.transactionId === transactionId ? { ...w, status: updatedWithdrawal.status } : w
        )
      );
      alert(`Withdrawal ${status} successfully!`);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Withdrawal Requests</h1>
      {loading ? (
        <p style={styles.info}>Loading withdrawals...</p>
      ) : error ? (
        <p style={styles.error}>Error: {error}</p>
      ) : withdrawals.length === 0 ? (
        <p style={styles.info}>No withdrawals available.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Transaction ID</th>
              <th style={styles.th}>Amount</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((w) => (
              <tr key={w.transactionId}>
                <td style={styles.td}>{w.transactionId}</td>
                <td style={styles.td}>${w.amount}</td>
                <td style={styles.td}>{w.status}</td>
                <td style={styles.td}>
                  <button
                    style={styles.approveBtn}
                    onClick={() => handleWithdrawalAction(w.transactionId, "approved")}
                    disabled={actionLoading === w.transactionId}
                  >
                    {actionLoading === w.transactionId ? "Processing..." : "Approve"}
                  </button>
                  <button
                    style={styles.rejectBtn}
                    onClick={() => handleWithdrawalAction(w.transactionId, "rejected")}
                    disabled={actionLoading === w.transactionId}
                  >
                    {actionLoading === w.transactionId ? "Processing..." : "Reject"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button style={styles.refreshBtn} onClick={fetchWithdrawals} disabled={loading}>
        {loading ? "Refreshing..." : "Refresh List"}
      </button>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "900px",
    margin: "40px auto",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background: "#f8f9fa",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#333",
  },
  info: {
    textAlign: "center",
    color: "#555",
  },
  error: {
    textAlign: "center",
    color: "#d32f2f",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "20px",
  },
  th: {
    padding: "12px",
    borderBottom: "2px solid #dee2e6",
    backgroundColor: "#e9ecef",
    textAlign: "left",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #dee2e6",
  },
  approveBtn: {
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    marginRight: "8px",
  },
  rejectBtn: {
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "4px",
    cursor: "pointer",
  },
  refreshBtn: {
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "4px",
    cursor: "pointer",
    display: "block",
    margin: "0 auto",
  },
};
