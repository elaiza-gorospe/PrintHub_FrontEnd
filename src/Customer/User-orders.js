import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./User-orders.css";
import "./User-inquiries.css";
import Header from "../components/Header";
import { FaArrowLeft, FaFileInvoiceDollar } from "react-icons/fa";
import { buildApiUrl } from "../config/api";
import { Capacitor } from "@capacitor/core";

const ORDER_TABS = [
  { key: "all", label: "All" },
  { key: "to_pay", label: "To pay" },
  { key: "to_receive", label: "To receive" },
  { key: "to_review", label: "To review" },
  { key: "return", label: "Return" },
];

function getOrderBucket(order) {
  if (order.status === "return_requested") return "return";
  if (order.payment_status !== "paid" && order.status !== "cancelled") {
    return "to_pay";
  }
  if (order.payment_status === "paid" && order.status === "delivered") {
    return "to_review";
  }
  if (
    order.payment_status === "paid" &&
    !["delivered", "cancelled", "return_requested"].includes(order.status)
  ) {
    return "to_receive";
  }
  return "all";
}

function UserOrders() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [cancellingId, setCancellingId] = useState(null);
  const [payingId, setPayingId] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [complaintOrder, setComplaintOrder] = useState(null);
  const [complaintReason, setComplaintReason] = useState("");
  const [complaintDetails, setComplaintDetails] = useState("");
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  }, []);

  const fetchOrders = async () => {
    try {
      if (!currentUser?.id) {
        navigate("/user-login");
        return;
      }

      const res = await fetch(
        buildApiUrl(`/api/user/${currentUser.id}/orders`),
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to load orders");

      const sortedOrders = Array.isArray(data)
        ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];
      setOrders(sortedOrders);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Inquiries tab state
  const [inquiries, setInquiries] = useState([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [inquiriesError, setInquiriesError] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const filteredOrders = useMemo(() => {
    if (activeTab === "all") return orders;
    return orders.filter((order) => getOrderBucket(order) === activeTab);
  }, [activeTab, orders]);

  const tabCounts = useMemo(() => {
    return ORDER_TABS.reduce((acc, tab) => {
      acc[tab.key] =
        tab.key === "all"
          ? orders.length
          : orders.filter((order) => getOrderBucket(order) === tab.key).length;
      return acc;
    }, {});
  }, [orders]);

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

  const handlePayNow = async (order) => {
    setPayingId(order.id);
    try {
      const returnBase = Capacitor.isNativePlatform()
        ? "com.printhub.customer://"
        : window.location.origin;
      const res = await fetch(buildApiUrl("/api/payments/checkout"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, returnBase }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to create payment session");
      window.location.assign(data.checkout_url);
    } catch (err) {
      alert(err.message || "Could not initiate payment. Please try again.");
      setPayingId(null);
    }
  };

  const handleViewReceipt = async (orderId) => {
    try {
      const res = await fetch(buildApiUrl(`/api/orders/${orderId}/receipt`));
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load receipt");
      setReceipt(data);
    } catch (err) {
      alert(err.message || "Could not load e-receipt.");
    }
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!complaintOrder || !complaintReason.trim()) return;
    setSubmittingComplaint(true);
    try {
      const res = await fetch(
        buildApiUrl(`/api/orders/${complaintOrder.id}/return-complaint`),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUser.id,
            reason: complaintReason,
            details: complaintDetails,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to submit complaint");
      setOrders((prev) =>
        prev.map((order) =>
          order.id === complaintOrder.id
            ? { ...order, status: "return_requested" }
            : order,
        ),
      );
      setComplaintOrder(null);
      setComplaintReason("");
      setComplaintDetails("");
      alert(
        `${data.message}. Mock email: ${data.mockEmail?.subject || "received"}`,
      );
    } catch (err) {
      alert(err.message || "Could not submit return complaint.");
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const formatCurrency = (price) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(Number(price || 0));

  const getStatusLabel = (order) => {
    if (order.status === "return_requested") return "Return requested";
    if (order.status === "cancelled") return "Cancelled";
    if (order.payment_status !== "paid") return "Payment pending";
    if (order.status === "delivered") return "Delivered";
    return order.status?.charAt(0).toUpperCase() + order.status?.slice(1);
  };

  const getStatusClass = (order) => {
    if (order.status === "return_requested") return "return";
    if (order.status === "cancelled") return "cancelled";
    if (order.payment_status !== "paid") return "pending";
    if (order.status === "delivered") return "delivered";
    return "paid";
  };

  const renderOrder = (order) => (
    <div key={order.id} className="uo-order-card">
      <div className="uo-order-header">
        <div className="uo-order-info">
          <h3>Order #{order.id}</h3>
          <p className="uo-date">
            {new Date(order.createdAt).toLocaleDateString("en-PH", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className={`uo-status ${getStatusClass(order)}`}>
          {getStatusLabel(order)}
        </div>
      </div>

      <div className="uo-items">
        <h4>Items</h4>
        {order.items?.length ? (
          <div className="uo-items-list">
            {order.items.map((item) => {
              const design = item.customizations?.design;
              const productImg = item.product?.images?.[0];
              const productName =
                item.product?.name || `Product #${item.productId}`;
              const zoneImgs = Object.values(design?.zones || {})
                .filter((z) => z?.imageUrl)
                .map((z) => z.imageUrl);
              const imgs = zoneImgs.length
                ? zoneImgs
                : design?.generatedImageUrl
                  ? [design.generatedImageUrl]
                  : [];

              return (
                <div key={item.id} className="uo-item-row">
                  <div className="uo-item-thumbs">
                    {productImg && (
                      <img
                        src={productImg}
                        alt={productName}
                        className="uo-item-thumb"
                      />
                    )}
                    {imgs.map((src, i) => (
                      <div key={i} className="uo-item-design-wrap">
                        <img
                          src={src}
                          alt={`Design ${i + 1}`}
                          className="uo-item-thumb uo-item-thumb-design"
                        />
                        {i === 0 && (
                          <span className="uo-design-badge">AI Design</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="uo-item-details">
                    <p className="uo-item-name">{productName}</p>
                    {design?.prompt && (
                      <p className="uo-item-design-prompt">
                        "
                        {design.prompt.length > 80
                          ? design.prompt.slice(0, 80) + "..."
                          : design.prompt}
                        "
                      </p>
                    )}
                    <p className="uo-item-qty">Qty: {item.quantity}</p>
                  </div>
                  <div className="uo-item-price">
                    {formatCurrency(item.unit_price)} x {item.quantity} ={" "}
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
        <div className="uo-action-row">
          {order.payment_status !== "paid" && order.status !== "cancelled" && (
            <>
              <button
                type="button"
                className="uo-cancel-btn"
                disabled={cancellingId === order.id}
                onClick={() => handleCancelOrder(order.id)}
              >
                {cancellingId === order.id ? "Cancelling..." : "Cancel Order"}
              </button>
              <button
                type="button"
                className="uo-pay-btn"
                disabled={payingId === order.id}
                onClick={() => handlePayNow(order)}
              >
                {payingId === order.id ? "Redirecting..." : "Pay Now"}
              </button>
            </>
          )}

          {order.payment_status === "paid" && (
            <button
              type="button"
              className="uo-receipt-btn"
              onClick={() => handleViewReceipt(order.id)}
            >
              E-Receipt
            </button>
          )}

          {order.payment_status === "paid" && order.status === "delivered" && (
            <button
              type="button"
              className="uo-return-btn"
              onClick={() => setComplaintOrder(order)}
            >
              File complaint
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Header />
      <div className="uo-page">
        {/* Tab switcher */}
        <div className="uo-tabs">
          <button
            type="button"
            className={`uo-tab${activeTab === "orders" ? " uo-tab--active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </button>
          <button
            type="button"
            className={`uo-tab${activeTab === "inquiries" ? " uo-tab--active" : ""}`}
            onClick={() => setActiveTab("inquiries")}
          >
            Inquiries
          </button>
        </div>

        <div className="uo-top">
          <button
            className="uo-back"
            type="button"
            onClick={() => navigate("/user-home")}
          >
            <FaArrowLeft /> Back
          </button>
          <h1 className="uo-title">
            {activeTab === "orders" ? "My Orders" : "My Inquiries"}
          </h1>
        </div>

        <div className="uo-tabs">
          {ORDER_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`uo-tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              <span>{tabCounts[tab.key] || 0}</span>
            </button>
          ))}
        </div>

        {loading && (
          <div className="uo-loading">
            <p>Loading orders...</p>
          </div>
        )}

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
              onClick={() => navigate("/product-overview")}
            >
              Start Shopping
            </button>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="uo-orders">
            {filteredOrders.length ? (
              filteredOrders.map(renderOrder)
            ) : (
              <div className="uo-empty">
                <p>No orders in this tab.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {receipt && (
        <div className="uo-modal" role="dialog" aria-modal="true">
          <div className="uo-modal-card">
            <button
              type="button"
              className="uo-modal-close"
              onClick={() => setReceipt(null)}
            >
              x
            </button>
            <h2>E-Receipt</h2>
            <div className="uo-receipt-meta">
              <span>{receipt.receiptNo}</span>
              <span>{receipt.paymentStatus.toUpperCase()}</span>
            </div>
            <p>
              <strong>Customer:</strong> {receipt.customerName}
            </p>
            <p>
              <strong>Payment Reference:</strong>{" "}
              {receipt.paymentReference || "Pending confirmation"}
            </p>
            <div className="uo-receipt-items">
              {receipt.items.map((item) => (
                <div key={item.id}>
                  <span>
                    {item.productName} x {item.quantity}
                  </span>
                  <strong>{formatCurrency(item.totalPrice)}</strong>
                </div>
              ))}
            </div>
            <div className="uo-receipt-total">
              <span>Total</span>
              <strong>{formatCurrency(receipt.total)}</strong>
            </div>
            <div className="uo-mock-email">
              <strong>Mock email notification</strong>
              <p>To: {receipt.mockEmail.to || receipt.customerEmail}</p>
              <p>Subject: {receipt.mockEmail.subject}</p>
              <p>{receipt.mockEmail.body}</p>
            </div>
          </div>
        </div>
      )}

      {complaintOrder && (
        <div className="uo-modal" role="dialog" aria-modal="true">
          <form className="uo-modal-card" onSubmit={handleSubmitComplaint}>
            <button
              type="button"
              className="uo-modal-close"
              onClick={() => setComplaintOrder(null)}
            >
              x
            </button>
            <h2>Return Complaint</h2>
            <p>Order #{complaintOrder.id}</p>
            <label>
              Reason
              <select
                value={complaintReason}
                onChange={(e) => setComplaintReason(e.target.value)}
                required
              >
                <option value="">Select a reason</option>
                <option value="Faulty or damaged product">
                  Faulty or damaged product
                </option>
                <option value="Wrong item or print">Wrong item or print</option>
                <option value="Poor print quality">Poor print quality</option>
                <option value="Missing item">Missing item</option>
                <option value="Other">Other</option>
              </select>
            </label>
            <label>
              Details
              <textarea
                value={complaintDetails}
                onChange={(e) => setComplaintDetails(e.target.value)}
                rows="4"
                placeholder="Describe the problem so staff can review it."
              />
            </label>
            <button
              type="submit"
              className="uo-submit-return"
              disabled={submittingComplaint || !complaintReason}
            >
              {submittingComplaint ? "Submitting..." : "Submit complaint"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default UserOrders;
