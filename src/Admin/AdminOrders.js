import React, { useState, useEffect, useMemo } from "react";
import {
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaTrash,
  FaBox,
  FaCheck,
  FaEye,
  FaTimes,
  FaDownload,
  FaCube,
} from "react-icons/fa";
import "./Admin-dashboard.css";
import { buildApiUrl } from "../config/api";
import TshirtPreview3D from "../components/TshirtCustomizer/TshirtPreview3D";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ordersQuery, setOrdersQuery] = useState("");
  const [ordersStatus, setOrdersStatus] = useState("all");
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [detailOrder, setDetailOrder] = useState(null);
  const [aiPreviewModal, setAiPreviewModal] = useState(null); // { imageUrl, productName }
  const [ai3DPreviewModal, setAi3DPreviewModal] = useState(null); // { imageUrl, productName }

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch(buildApiUrl("/api/admin/orders"));
        if (!response.ok) throw new Error("Failed to fetch orders");

        const data = await response.json();

        // Transform API data to match UI format
        const transformedOrders = data.map((order) => ({
          id: `ORD-${String(order.id).padStart(4, "0")}`,
          customer: order.user
            ? `${order.user.first_name} ${order.user.last_name}`
            : "Unknown",
          total: parseFloat(order.total),
          status: order.status || "pending",
          date: new Date(order.createdAt).toISOString().slice(0, 10),
          dbId: order.id,
          items: order.items || [],
        }));

        setOrders(transformedOrders);
        setError(null);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    // Refresh orders every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter orders based on search query and status
  const filteredOrders = useMemo(() => {
    const q = ordersQuery.trim().toLowerCase();
    return orders
      .filter((o) => {
        const matchQuery =
          !q ||
          o.id.toLowerCase().includes(q) ||
          o.customer.toLowerCase().includes(q) ||
          String(o.total).includes(q);

        const matchStatus =
          ordersStatus === "all" ? true : o.status === ordersStatus;

        return matchQuery && matchStatus;
      })
      .sort((a, b) => b.dbId - a.dbId); // Sort descending - newest orders first
  }, [orders, ordersQuery, ordersStatus]);

  // Calculate stats from orders
  const ordersStats = useMemo(() => {
    const pending = orders.filter((o) => o.status === "pending").length;
    const processing = orders.filter((o) => o.status === "processing").length;
    const completed = orders.filter((o) => o.status === "completed").length;
    const cancelled = orders.filter((o) => o.status === "cancelled").length;
    return { pending, processing, completed, cancelled, total: orders.length };
  }, [orders]);

  const handleClearFilters = () => {
    setOrdersQuery("");
    setOrdersStatus("all");
  };

  // ✅ Delete order
  const handleDeleteOrder = async (order) => {
    if (!window.confirm(`Delete order "${order.id}"? This cannot be undone.`))
      return;

    try {
      const res = await fetch(buildApiUrl(`/api/orders/${order.dbId}`), {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete order");

      // ✅ Immediately remove from UI
      setOrders((prev) => prev.filter((o) => o.dbId !== order.dbId));

      alert("Order deleted successfully!");
    } catch (err) {
      console.error("Error deleting order:", err);
      alert(err.message || "Error deleting order");
    }
  };

  // ✅ Update order status
  const updateOrderStatus = async (order, newStatus) => {
    try {
      const res = await fetch(buildApiUrl(`/api/orders/${order.dbId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update order status");

      // ✅ Update local state
      setOrders((prev) =>
        prev.map((o) =>
          o.dbId === order.dbId ? { ...o, status: newStatus } : o,
        ),
      );

      const messages = {
        processing: "marked as processing",
        delivered: "marked as delivered",
        completed: "marked as completed",
      };
      alert(`Order ${messages[newStatus] || "updated"}!`);
    } catch (err) {
      console.error("Error updating order status:", err);
      alert(err.message || "Error updating order status");
    }
  };

  // Handlers for different status transitions
  const handleProcessOrder = (order) => updateOrderStatus(order, "processing");
  const handleDeliverOrder = (order) => updateOrderStatus(order, "delivered");
  const handleCompleteOrder = (order) => updateOrderStatus(order, "completed");

  // Download AI-generated image
  const handleDownloadAiImage = async (imageUrl, productName) => {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error("Failed to download image");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${productName.replace(/\s+/g, "-")}-ai-design.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading AI image:", err);
      alert("Failed to download image");
    }
  };

  if (loading) {
    return (
      <div className="dashpage dashpage-orders">
        <div className="dashpage-loading">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashpage dashpage-orders">
        <div className="dashpage-error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="dashpage dashpage-orders">
      {/* Stats Cards */}
      <div className="dashpage-stats">
        <div className="dashpage-stat-card">
          <div className="dashpage-stat-label">Total</div>
          <div className="dashpage-stat-value">{ordersStats.total}</div>
        </div>

        <div className="dashpage-stat-card">
          <div className="dashpage-stat-label">Pending</div>
          <div className="dashpage-stat-value orange">
            {ordersStats.pending}
          </div>
        </div>

        <div className="dashpage-stat-card">
          <div className="dashpage-stat-label">Processing</div>
          <div className="dashpage-stat-value blue">
            {ordersStats.processing}
          </div>
        </div>

        <div className="dashpage-stat-card">
          <div className="dashpage-stat-label">Completed</div>
          <div className="dashpage-stat-value green">
            {ordersStats.completed}
          </div>
        </div>
      </div>

      {/* Toolbar with Search and Filters */}
      <div className="dashpage-toolbar">
        <div className="dashpage-search">
          <span className="dashpage-search-icon">
            <FaSearch size={14} />
          </span>

          <input
            type="text"
            placeholder="Search order ID, customer, total..."
            value={ordersQuery}
            onChange={(e) => setOrdersQuery(e.target.value)}
          />
        </div>

        <div className="dashpage-filters">
          <select
            value={ordersStatus}
            onChange={(e) => setOrdersStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="delivered">Delivered</option>
            <option value="completed">Completed</option>
            <option value="return_requested">Return Requested</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            className="dashpage-filterbtn"
            type="button"
            onClick={handleClearFilters}
            title="Clear filters"
          >
            <FaFilter />
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="dashpage-table-card">
        <table className="dashpage-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.map((o) => (
              <React.Fragment key={o.dbId}>
                <tr>
                  <td data-label="Order">
                    <div className="dashpage-rowmain">
                      <div className="dashpage-rowtitle">{o.id}</div>
                    </div>
                  </td>
                  <td data-label="Customer">{o.customer}</td>
                  <td data-label="Total">₱ {o.total.toLocaleString()}</td>
                  <td data-label="Status">
                    <span className={`dashpage-pill status-${o.status}`}>
                      {o.status === "pending" && (
                        <FaClock style={{ marginRight: 6 }} />
                      )}
                      {o.status === "processing" && (
                        <FaClock style={{ marginRight: 6 }} />
                      )}
                      {o.status === "completed" && (
                        <FaCheckCircle style={{ marginRight: 6 }} />
                      )}
                      {o.status === "return_requested" && (
                        <FaExclamationTriangle style={{ marginRight: 6 }} />
                      )}
                      {o.status === "cancelled" && (
                        <FaExclamationTriangle style={{ marginRight: 6 }} />
                      )}
                      {o.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td data-label="Date">{o.date}</td>
                  <td data-label="Actions">
                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                        flexWrap: "wrap",
                        justifyContent: "left",
                      }}
                    >
                      {/* View Details button */}
                      <button
                        type="button"
                        onClick={() => setDetailOrder(o)}
                        title="View order details"
                        style={{
                          background: "#455073",
                          color: "#fff",
                          border: "none",
                          padding: "6px 8px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "11px",
                          display: "flex",
                          alignItems: "left",
                          gap: "3px",
                        }}
                      >
                        <FaEye size={11} />
                        Details
                      </button>
                      {/* Items expand button */}
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedOrderId(
                            expandedOrderId === o.dbId ? null : o.dbId,
                          )
                        }
                        title="View items"
                        style={{
                          background:
                            expandedOrderId === o.dbId ? "#455073" : "#f0f2f5",
                          color:
                            expandedOrderId === o.dbId ? "#fff" : "#455073",
                          border: "1px solid #455073",
                          padding: "6px 8px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "11px",
                        }}
                      >
                        {expandedOrderId === o.dbId
                          ? "Hide Items"
                          : `Items (${o.items.length})`}
                      </button>
                      {/* Process button - only for pending orders */}
                      {o.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => handleProcessOrder(o)}
                          title="Mark as processing"
                          style={{
                            background: "#3498db",
                            color: "#fff",
                            border: "none",
                            padding: "6px 8px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "11px",
                            display: "flex",
                            alignItems: "left",
                            gap: "3px",
                          }}
                        >
                          <FaClock size={11} />
                          Process
                        </button>
                      )}

                      {/* Deliver button - for processing orders */}
                      {o.status === "processing" && (
                        <button
                          type="button"
                          onClick={() => handleDeliverOrder(o)}
                          title="Mark as delivered"
                          style={{
                            background: "#2ecc71",
                            color: "#fff",
                            border: "none",
                            padding: "6px 8px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "11px",
                            display: "flex",
                            alignItems: "left",
                            gap: "3px",
                          }}
                        >
                          <FaBox size={11} />
                          Deliver
                        </button>
                      )}

                      {/* Complete button - for delivered orders */}
                      {o.status === "delivered" && (
                        <button
                          type="button"
                          onClick={() => handleCompleteOrder(o)}
                          title="Mark as completed"
                          style={{
                            background: "#27ae60",
                            color: "#fff",
                            border: "none",
                            padding: "6px 8px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "11px",
                            display: "flex",
                            alignItems: "left",
                            gap: "3px",
                          }}
                        >
                          <FaCheck size={11} />
                          Complete
                        </button>
                      )}

                      {/* Delete button - not available for completed orders */}
                      {o.status !== "completed" && (
                        <button
                          type="button"
                          onClick={() => handleDeleteOrder(o)}
                          title="Delete order"
                          style={{
                            background: "#e74c3c",
                            color: "#fff",
                            border: "none",
                            padding: "6px 8px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "11px",
                            display: "flex",
                            alignItems: "left",
                            gap: "3px",
                          }}
                        >
                          <FaTrash size={11} />
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>

                {/* Expandable items row */}
                {expandedOrderId === o.dbId && (
                  <tr key={`${o.dbId}-items`}>
                    <td
                      colSpan="6"
                      style={{ padding: "0 12px 12px", background: "#f8f9fc" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                          paddingTop: 10,
                        }}
                      >
                        {o.items.length === 0 && (
                          <p style={{ margin: 0, fontSize: 13, color: "#999" }}>
                            No items.
                          </p>
                        )}
                        {o.items.map((item) => {
                          const design = item.customizations?.design;
                          const productImg = item.product?.images?.[0];
                          const productName =
                            item.product?.name || `Product #${item.productId}`;
                          return (
                            <div
                              key={item.id}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 10,
                                background: "#fff",
                                borderRadius: 8,
                                padding: "10px 12px",
                                border: "1px solid #e4e9e7",
                              }}
                            >
                              {/* Product thumbnail */}
                              {productImg && (
                                <img
                                  src={productImg}
                                  alt={productName}
                                  style={{
                                    width: 52,
                                    height: 52,
                                    objectFit: "cover",
                                    borderRadius: 6,
                                    border: "1px solid #e0e5e3",
                                    flexShrink: 0,
                                  }}
                                />
                              )}
                              {/* AI design thumbnail */}
                              {design?.generatedImageUrl && (
                                <div
                                  style={{
                                    position: "relative",
                                    flexShrink: 0,
                                    cursor: "pointer",
                                  }}
                                  onClick={() =>
                                    setAiPreviewModal({
                                      imageUrl: design.generatedImageUrl,
                                      productName,
                                    })
                                  }
                                  title="Click to preview AI design"
                                >
                                  <img
                                    src={design.generatedImageUrl}
                                    alt="AI Design"
                                    style={{
                                      width: 52,
                                      height: 52,
                                      objectFit: "cover",
                                      borderRadius: 6,
                                      border: "2px solid #455073",
                                    }}
                                  />
                                  <span
                                    style={{
                                      position: "absolute",
                                      bottom: 0,
                                      left: 0,
                                      right: 0,
                                      textAlign: "center",
                                      background: "#455073",
                                      color: "#fff",
                                      fontSize: 8,
                                      fontWeight: 700,
                                      padding: "2px 0",
                                      borderRadius: "0 0 4px 4px",
                                    }}
                                  >
                                    AI
                                  </span>
                                </div>
                              )}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p
                                  style={{
                                    margin: 0,
                                    fontWeight: 600,
                                    fontSize: 13,
                                    color: "#2f3a45",
                                  }}
                                >
                                  {productName}
                                </p>
                                {design?.prompt && (
                                  <p
                                    style={{
                                      margin: "3px 0 0",
                                      fontSize: 11,
                                      color: "#667085",
                                      fontStyle: "italic",
                                    }}
                                  >
                                    "
                                    {design.prompt.length > 100
                                      ? design.prompt.slice(0, 100) + "…"
                                      : design.prompt}
                                    "
                                  </p>
                                )}
                                <p
                                  style={{
                                    margin: "3px 0 0",
                                    fontSize: 12,
                                    color: "#667085",
                                  }}
                                >
                                  Qty: {item.quantity}
                                </p>
                              </div>
                              <div
                                style={{
                                  whiteSpace: "nowrap",
                                  fontWeight: 700,
                                  fontSize: 13,
                                  color: "#0f352a",
                                  paddingTop: 2,
                                }}
                              >
                                ₱{parseFloat(item.unit_price).toLocaleString()}{" "}
                                × {item.quantity}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}

            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan="6" className="dashpage-empty">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Order Details Modal */}
      {detailOrder && (
        <div
          onClick={() => setDetailOrder(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 12,
              width: "100%",
              maxWidth: 560,
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 20px",
                borderBottom: "1px solid #e4e9f0",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 17, color: "#2f3a45" }}>
                  {detailOrder.id}
                </h3>
                <span style={{ fontSize: 12, color: "#667085" }}>
                  {detailOrder.date}
                </span>
              </div>
              <button
                onClick={() => setDetailOrder(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#667085",
                  padding: 4,
                }}
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Order Info */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #e4e9f0",
                display: "flex",
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <div style={{ flex: 1, minWidth: 140 }}>
                <div
                  style={{ fontSize: 11, color: "#667085", marginBottom: 2 }}
                >
                  CUSTOMER
                </div>
                <div
                  style={{ fontSize: 14, fontWeight: 600, color: "#2f3a45" }}
                >
                  {detailOrder.customer}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 120 }}>
                <div
                  style={{ fontSize: 11, color: "#667085", marginBottom: 2 }}
                >
                  STATUS
                </div>
                <span
                  className={`dashpage-pill status-${detailOrder.status}`}
                  style={{ fontSize: 12 }}
                >
                  {detailOrder.status === "pending" && (
                    <FaClock style={{ marginRight: 5 }} />
                  )}
                  {detailOrder.status === "processing" && (
                    <FaClock style={{ marginRight: 5 }} />
                  )}
                  {detailOrder.status === "completed" && (
                    <FaCheckCircle style={{ marginRight: 5 }} />
                  )}
                  {detailOrder.status === "cancelled" && (
                    <FaExclamationTriangle style={{ marginRight: 5 }} />
                  )}
                  {detailOrder.status}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 120 }}>
                <div
                  style={{ fontSize: 11, color: "#667085", marginBottom: 2 }}
                >
                  ORDER TOTAL
                </div>
                <div
                  style={{ fontSize: 16, fontWeight: 700, color: "#0f352a" }}
                >
                  ₱ {detailOrder.total.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Items */}
            <div style={{ padding: "16px 20px" }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#667085",
                  marginBottom: 10,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Items ({detailOrder.items.length})
              </div>
              {detailOrder.items.length === 0 && (
                <p style={{ margin: 0, fontSize: 13, color: "#999" }}>
                  No items.
                </p>
              )}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {detailOrder.items.map((item) => {
                  const design = item.customizations?.design;
                  const productImg = item.product?.images?.[0];
                  const productName =
                    item.product?.name || `Product #${item.productId}`;
                  return (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        background: "#f8f9fc",
                        borderRadius: 8,
                        padding: "10px 12px",
                        border: "1px solid #e4e9f0",
                      }}
                    >
                      {productImg && (
                        <img
                          src={productImg}
                          alt={productName}
                          style={{
                            width: 56,
                            height: 56,
                            objectFit: "cover",
                            borderRadius: 6,
                            border: "1px solid #e0e5e3",
                            flexShrink: 0,
                          }}
                        />
                      )}
                      {design?.generatedImageUrl && (
                        <div
                          style={{
                            position: "relative",
                            flexShrink: 0,
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            setAiPreviewModal({
                              imageUrl: design.generatedImageUrl,
                              productName,
                            })
                          }
                          title="Click to preview AI design"
                        >
                          <img
                            src={design.generatedImageUrl}
                            alt="AI Design"
                            style={{
                              width: 56,
                              height: 56,
                              objectFit: "cover",
                              borderRadius: 6,
                              border: "2px solid #455073",
                            }}
                          />
                          <span
                            style={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              textAlign: "center",
                              background: "#455073",
                              color: "#fff",
                              fontSize: 8,
                              fontWeight: 700,
                              padding: "2px 0",
                              borderRadius: "0 0 4px 4px",
                            }}
                          >
                            AI
                          </span>
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            margin: 0,
                            fontWeight: 600,
                            fontSize: 13,
                            color: "#2f3a45",
                          }}
                        >
                          {productName}
                        </p>
                        {design?.prompt && (
                          <p
                            style={{
                              margin: "3px 0 0",
                              fontSize: 11,
                              color: "#667085",
                              fontStyle: "italic",
                            }}
                          >
                            "
                            {design.prompt.length > 120
                              ? design.prompt.slice(0, 120) + "…"
                              : design.prompt}
                            "
                          </p>
                        )}
                        {item.customizations &&
                          Object.entries(item.customizations)
                            .filter(([k]) => k !== "design")
                            .map(([k, v]) => {
                              // Format key for display (e.g., inquiry_id → Inquiry ID)
                              const displayKey = k
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (char) => char.toUpperCase());
                              // Skip empty values
                              if (!v) return null;
                              return (
                                <p
                                  key={k}
                                  style={{
                                    margin: "2px 0 0",
                                    fontSize: 11,
                                    color: "#667085",
                                  }}
                                >
                                  <strong>{displayKey}:</strong>{" "}
                                  {typeof v === "object"
                                    ? JSON.stringify(v)
                                    : String(v)}
                                </p>
                              );
                            })}
                        <p
                          style={{
                            margin: "4px 0 0",
                            fontSize: 12,
                            color: "#667085",
                          }}
                        >
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div
                        style={{
                          whiteSpace: "nowrap",
                          fontWeight: 700,
                          fontSize: 13,
                          color: "#0f352a",
                          paddingTop: 2,
                        }}
                      >
                        ₱{parseFloat(item.unit_price).toLocaleString()}
                        <div
                          style={{
                            fontWeight: 400,
                            fontSize: 11,
                            color: "#667085",
                          }}
                        >
                          × {item.quantity} = ₱
                          {(
                            parseFloat(item.unit_price) * item.quantity
                          ).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Image Preview Modal */}
      {aiPreviewModal && (
        <div
          onClick={() => setAiPreviewModal(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 12,
              width: "100%",
              maxWidth: 600,
              overflow: "hidden",
              boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: "1px solid #e4e9f0",
              }}
            >
              <h3 style={{ margin: 0, fontSize: 16, color: "#2f3a45" }}>
                AI Generated Design
              </h3>
              <button
                onClick={() => setAiPreviewModal(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#667085",
                  padding: 4,
                  fontSize: 20,
                }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Preview Image */}
            <div
              style={{
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <img
                src={aiPreviewModal.imageUrl}
                alt="AI Design Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "400px",
                  borderRadius: 8,
                  border: "1px solid #e4e9f0",
                  marginBottom: 16,
                }}
              />
            </div>

            {/* Modal Footer with Download Button */}
            <div
              style={{
                padding: "16px 20px",
                borderTop: "1px solid #e4e9f0",
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setAiPreviewModal(null)}
                style={{
                  background: "#f0f2f5",
                  color: "#2f3a45",
                  border: "1px solid #e4e9f0",
                  padding: "8px 16px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  setAi3DPreviewModal({
                    imageUrl: aiPreviewModal.imageUrl,
                    productName: aiPreviewModal.productName,
                  });
                }}
                style={{
                  background: "#667085",
                  color: "#fff",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <FaCube size={12} />
                3D Preview
              </button>
              <button
                onClick={() => {
                  handleDownloadAiImage(
                    aiPreviewModal.imageUrl,
                    aiPreviewModal.productName,
                  );
                }}
                style={{
                  background: "#455073",
                  color: "#fff",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <FaDownload size={12} />
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3D Preview Modal */}
      {ai3DPreviewModal && (
        <div
          onClick={() => setAi3DPreviewModal(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 2100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 12,
              width: "100%",
              maxWidth: 900,
              height: "min(720px, 86vh)",
              overflow: "hidden",
              boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: "1px solid #e4e9f0",
              }}
            >
              <h3 style={{ margin: 0, fontSize: 16, color: "#2f3a45" }}>
                3D Design Preview
              </h3>
              <button
                onClick={() => setAi3DPreviewModal(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#667085",
                  padding: 4,
                  fontSize: 20,
                }}
              >
                <FaTimes />
              </button>
            </div>

            {/* 3D Canvas */}
            <div
              style={{
                flex: 1,
                display: "block",
                width: "100%",
                height: "100%",
              }}
            >
              <TshirtPreview3D
                modelPath="/models/tshirt.glb"
                zoneDesigns={{ front: { imageUrl: ai3DPreviewModal.imageUrl } }}
              />
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "12px 20px",
                borderTop: "1px solid #e4e9f0",
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <button
                onClick={() => setAi3DPreviewModal(null)}
                style={{
                  background: "#f0f2f5",
                  color: "#2f3a45",
                  border: "1px solid #e4e9f0",
                  padding: "8px 16px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
