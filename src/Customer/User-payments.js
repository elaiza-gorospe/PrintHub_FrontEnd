import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { buildApiUrl } from "../config/api";
import { FaArrowLeft, FaEnvelope, FaFileInvoiceDollar } from "react-icons/fa";
import "./User-payments.css";

function UserPayments() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const stored = localStorage.getItem("user");
        if (!stored) {
          navigate("/user-login", { state: { from: "/user-payments" } });
          return;
        }

        const user = JSON.parse(stored);
        if (!user?.id) {
          navigate("/user-login", { state: { from: "/user-payments" } });
          return;
        }

        const res = await fetch(buildApiUrl(`/api/user/${user.id}/payment-logs`));
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load payments");
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Failed to load payments");
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, [navigate]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(Number(amount || 0));

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleString("en-PH", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Not paid yet";

  return (
    <>
      <Header />
      <main className="upay-page">
        <div className="upay-top">
          <button
            type="button"
            className="upay-back"
            onClick={() => navigate("/user-home")}
          >
            <FaArrowLeft /> Back
          </button>
          <div>
            <h1>Payment Logs & Invoices</h1>
            <p className="upay-subtitle">Keep every receipt, status, and payment trail in one lively dashboard.</p>
          </div>
        </div>

        {loading && <div className="upay-state">Loading payment logs...</div>}
        {error && <div className="upay-state upay-error">{error}</div>}

        {!loading && !error && logs.length === 0 && (
          <div className="upay-state">
            <FaFileInvoiceDollar size={36} />
            <p>No payment logs yet.</p>
          </div>
        )}

        {!loading && !error && logs.length > 0 && (
          <div className="upay-list">
            {logs.map((log) => (
              <article key={log.orderId} className="upay-card">
                <div>
                  <span
                    className={`upay-pill ${
                      log.paymentStatus === "paid" ? "paid" : "pending"
                    }`}
                  >
                    {log.paymentStatus === "paid" ? "Paid" : "To pay"}
                  </span>
                  <h2>{log.receiptNo}</h2>
                  <p>Order #{log.orderId}</p>
                  <p>{formatDate(log.paidAt || log.issuedAt)}</p>
                </div>
                <div className="upay-card-side">
                  <strong>{formatCurrency(log.total)}</strong>
                  <button type="button" onClick={() => setSelected(log)}>
                    {log.paymentStatus === "paid" ? "View E-Receipt" : "View Invoice"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {selected && (
          <div className="upay-modal" role="dialog" aria-modal="true">
            <div className="upay-receipt">
              <button
                type="button"
                className="upay-close"
                onClick={() => setSelected(null)}
              >
                x
              </button>
              <h2>E-Receipt</h2>
              <div className="upay-receipt-meta">
                <span>{selected.receiptNo}</span>
                <span>{selected.paymentStatus.toUpperCase()}</span>
              </div>
              <p>
                <strong>Customer:</strong> {selected.customerName}
              </p>
              <p>
                <strong>Email:</strong> {selected.customerEmail || "N/A"}
              </p>
              <p>
                <strong>Payment method:</strong> {selected.paymentMethod}
              </p>
              <p>
                <strong>Reference:</strong>{" "}
                {selected.paymentReference || "Pending confirmation"}
              </p>

              <div className="upay-items">
                {(selected.items || []).map((item) => (
                  <div key={item.id}>
                    <span>
                      {item.productName} x {item.quantity}
                    </span>
                    <strong>{formatCurrency(item.totalPrice)}</strong>
                  </div>
                ))}
              </div>

              <div className="upay-total">
                <span>Total</span>
                <strong>{formatCurrency(selected.total)}</strong>
              </div>

              <div className="upay-email">
                <FaEnvelope />
                <div>
                  <strong>Mock email notification</strong>
                  <p>To: {selected.mockEmail?.to || selected.customerEmail}</p>
                  <p>Subject: {selected.mockEmail?.subject || "Payment update"}</p>
                  <p>{selected.mockEmail?.body || "Payment details are available in this invoice."}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default UserPayments;
