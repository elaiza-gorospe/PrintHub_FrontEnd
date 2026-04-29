import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { buildApiUrl } from "../config/api";
import "./User-payment-return.css";

function UserPaymentReturn() {
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState({
    loading: true,
    message: "Verifying payment...",
  });

  const query = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const orderId = query.get("orderId");
  const returnStatus = query.get("status");

  useEffect(() => {
    const verifyPaymentStatus = async () => {
      if (!orderId) {
        setState({
          loading: false,
          message: "Missing order reference from payment return.",
        });
        return;
      }

      try {
        const res = await fetch(buildApiUrl(`/api/payments/${orderId}/status`));
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Unable to verify payment status.");
        }

        const isPaid = data?.payment_status === "paid";

        if (isPaid) {
          setState({
            loading: false,
            message: `Payment confirmed for Order #${orderId}.`,
          });
          return;
        }

        if (returnStatus === "cancelled") {
          setState({
            loading: false,
            message: "Payment was cancelled. You can try again from My Orders.",
          });
          return;
        }

        setState({
          loading: false,
          message:
            "Payment is still pending confirmation. If you completed payment, please wait a moment and refresh My Orders.",
        });
      } catch (error) {
        setState({
          loading: false,
          message:
            error.message ||
            "Could not verify payment status. Please check My Orders.",
        });
      }
    };

    verifyPaymentStatus();
  }, [orderId, returnStatus]);

  return (
    <>
      <Header />
      <div className="upr-page">
        <div className="upr-card">
          <h1 className="upr-title">Payment Return</h1>
          <p className="upr-message">
            {state.loading
              ? "Verifying payment with PayMongo..."
              : state.message}
          </p>

          <div className="upr-actions">
            <button
              type="button"
              className="upr-btn upr-btn-primary"
              onClick={() => navigate("/user-orders")}
            >
              Go to My Orders
            </button>
            <button
              type="button"
              className="upr-btn"
              onClick={() => navigate("/user-home")}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default UserPaymentReturn;
