import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./User-orders.css";
import Header from "../components/Header";
import { FaArrowLeft } from "react-icons/fa";
import { buildApiUrl } from "../config/api";
import { Capacitor } from "@capacitor/core";

const STATUS_GROUPS = [
  {
    key: "active",
    label: "Active Orders",
    match: (o) => o.payment_status !== "paid" && o.status !== "cancelled",
  },
  {
    key: "paid",
    label: "Paid / Processing",
    match: (o) =>
      o.payment_status === "paid" &&
      !["delivered", "cancelled"].includes(o.status),
  },
  {
    key: "delivered",
    label: "Delivered",
    match: (o) => o.status === "delivered",
  },
  {
    key: "cancelled",
    label: "Cancelled",
    match: (o) => o.status === "cancelled",
  },
];

function UserOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const stored = localStorage.getItem("user");
        if (!stored) {
          navigate("/user-login");
          return;
        }

        const user = JSON.parse(stored);
        if (!user?.id) {
          navigate("/user-login");
          return;
        }

        const res = await fetch(buildApiUrl(`/api/user/${user.id}/orders`));
        const data = await res.json();

        if (!res.ok) throw new Error(data?.message || "Failed to load orders");

        // Sort orders by date added in descending order (newest first)
        const sortedOrders = Array.isArray(data)
          ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          : [];
        setOrders(sortedOrders);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load orders");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setCancellingId(orderId);
    try {
      const res = await fetch(buildApiUrl(`/api/orders/${orderId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to cancel order");
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o)),
      );
    } catch (err) {
      alert(err.message || "Could not cancel order. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  const formatCurrency = (price) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(price);
  };

  const getStatusColor = (status, paymentStatus) => {
    // If payment is not done, prioritize payment status in display
    if (paymentStatus !== "paid") {
      return "#ff6b6b"; // Red for unpaid orders
    }

    switch (status) {
      case "pending":
        return "#ff9800";
      case "processing":
        return "#2196f3";
      case "confirmed":
        return "#4caf50";
      case "shipped":
        return "#4caf50";
      case "delivered":
        return "#4caf50";
      case "cancelled":
        return "#f44336";
      default:
        return "#999";
    }
  };

  return (
    <>
      <Header />
      <div className="uo-page">
        <div className="uo-top">
          <button
            className="uo-back"
            type="button"
            onClick={() => navigate("/user-home")}
          >
            <FaArrowLeft /> Back
          </button>
          <h1 className="uo-title">My Orders</h1>
        </div>
        {error && (
          <div className="uo-error">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="uo-empty">
            <p>No orders yet.</p>
            <button
              className="uo-shop-btn"
              type="button"
              onClick={() => navigate("/Product-overview")}
            >
              Start Shopping
            </button>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="uo-orders">
            {STATUS_GROUPS.map((group) => {
              const grouped = orders.filter(group.match);
              if (!grouped.length) return null;
              return (
                <div key={group.key} className="uo-group">
                  <h2 className="uo-group-title">{group.label}</h2>
                  {grouped.map((order) => (
                    <div key={order.id} className="uo-order-card">
                      <div className="uo-order-header">
                        <div className="uo-order-info">
                          <h3>Order #{order.id}</h3>
                          <p className="uo-date">
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-PH",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </p>
                        </div>
                        <div
                          className="uo-status"
                          style={{
                            backgroundColor: getStatusColor(
                              order.status,
                              order.payment_status,
                            ),
                          }}
                        >
                          {order.status === "cancelled"
                            ? "CANCELLED"
                            : order.payment_status !== "paid"
                              ? `PAYMENT PENDING`
                              : order.status?.charAt(0).toUpperCase() +
                                order.status?.slice(1)}
                        </div>
                      </div>

                      <div className="uo-items">
                        <h4>Items</h4>
                        {order.items && order.items.length > 0 ? (
                          <div className="uo-items-list">
                            {order.items.map((item) => {
                              const design = item.customizations?.design;
                              const productImg = item.product?.images?.[0];
                              const productName =
                                item.product?.name ||
                                `Product #${item.productId}`;
                              return (
                                <div key={item.id} className="uo-item-row">
                                  <div className="uo-item-thumbs">
                                    {productImg && (
                                      <img
                                        src={productImg}
                                        alt={productName}
                                        className="uo-item-thumb"
                                        title="Product"
                                      />
                                    )}
                                    {(() => {
                                      const zoneImgs = Object.values(
                                        design?.zones || {},
                                      )
                                        .filter((z) => z?.imageUrl)
                                        .map((z) => z.imageUrl);
                                      const imgs = zoneImgs.length
                                        ? zoneImgs
                                        : design?.generatedImageUrl
                                          ? [design.generatedImageUrl]
                                          : [];
                                      return imgs.map((src, i) => (
                                        <div
                                          key={i}
                                          className="uo-item-design-wrap"
                                        >
                                          <img
                                            src={src}
                                            alt={`AI Design zone ${i + 1}`}
                                            className="uo-item-thumb uo-item-thumb-design"
                                            title={`AI Design zone ${i + 1}`}
                                          />
                                          {i === 0 && (
                                            <span className="uo-design-badge">
                                              AI Design
                                            </span>
                                          )}
                                        </div>
                                      ));
                                    })()}
                                  </div>
                                  <div className="uo-item-details">
                                    <p className="uo-item-name">
                                      {productName}
                                    </p>
                                    {design?.prompt && (
                                      <p className="uo-item-design-prompt">
                                        "
                                        {design.prompt.length > 80
                                          ? design.prompt.slice(0, 80) + "…"
                                          : design.prompt}
                                        "
                                      </p>
                                    )}
                                    <p className="uo-item-qty">
                                      Qty: {item.quantity}
                                    </p>
                                  </div>
                                  <div className="uo-item-price">
                                    {formatCurrency(item.unit_price)} ×{" "}
                                    {item.quantity} ={" "}
                                    {formatCurrency(item.total_price)}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="uo-no-items">No items in this order</p>
                        )}
                      </div>

                      {order.shipping_address && (
                        <div className="uo-shipping">
                          <h4>Shipping Address</h4>
                          <p>{order.shipping_address}</p>
                        </div>
                      )}

                      <div className="uo-order-footer">
                        <div className="uo-total">
                          <strong>Total:</strong>
                          <strong>{formatCurrency(order.total)}</strong>
                        </div>
                        {order.total > 0 &&
                          order.status !== "cancelled" &&
                          order.payment_status !== "paid" && (
                            <div className="uo-pay-row">
                              <button
                                type="button"
                                className="uo-cancel-btn"
                                disabled={cancellingId === order.id}
                                onClick={() => handleCancelOrder(order.id)}
                              >
                                {cancellingId === order.id
                                  ? "Cancelling…"
                                  : "Cancel Order"}
                              </button>
                              <button
                                type="button"
                                className="uo-pay-btn"
                                onClick={async () => {
                                  // Use stored checkout_url if available
                                  if (order.checkout_url) {
                                    // Always create a fresh session so the return URL matches current platform
                                    // Fall through to create new session below
                                  }
                                  // Create a new PayMongo session with correct return URL for this platform
                                  try {
                                    const returnBase =
                                      Capacitor.isNativePlatform()
                                        ? "com.printhub.customer://"
                                        : window.location.origin;
                                    const res = await fetch(
                                      buildApiUrl("/api/payments/checkout"),
                                      {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                          orderId: order.id,
                                          returnBase,
                                        }),
                                      },
                                    );
                                    const data = await res.json();
                                    if (!res.ok)
                                      throw new Error(
                                        data.message ||
                                          "Failed to create payment session",
                                      );
                                    window.location.assign(data.checkout_url);
                                  } catch (err) {
                                    alert(
                                      err.message ||
                                        "Could not initiate payment. Please try again.",
                                    );
                                  }
                                }}
                              >
                                Pay Now
                              </button>
                            </div>
                          )}
                        {order.delivered_at && (
                          <p className="uo-delivered">
                            Delivered on{" "}
                            {new Date(order.delivered_at).toLocaleDateString(
                              "en-PH",
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default UserOrders;
