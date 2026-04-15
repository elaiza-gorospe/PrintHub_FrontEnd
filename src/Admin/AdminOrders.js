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
} from "react-icons/fa";
import "./Admin-dashboard.css";
import { buildApiUrl } from "../config/api";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ordersQuery, setOrdersQuery] = useState("");
  const [ordersStatus, setOrdersStatus] = useState("all");
  const [expandedOrderId, setExpandedOrderId] = useState(null);

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
            <option value="completed">Completed</option>
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
                    {o.status === "cancelled" && (
                      <FaExclamationTriangle style={{ marginRight: 6 }} />
                    )}
                    {o.status}
                  </span>
                </td>
                <td data-label="Date">{o.date}</td>
                <td data-label="Actions">
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      flexWrap: "wrap",
                      justifyContent: "center",
                    }}
                  >
                    {/* Items expand button */}
                    <button
                      type="button"
                      onClick={() => setExpandedOrderId(expandedOrderId === o.dbId ? null : o.dbId)}
                      title="View items"
                      style={{
                        background: expandedOrderId === o.dbId ? "#455073" : "#f0f2f5",
                        color: expandedOrderId === o.dbId ? "#fff" : "#455073",
                        border: "1px solid #455073",
                        padding: "6px 8px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "11px",
                      }}
                    >
                      {expandedOrderId === o.dbId ? "Hide Items" : `Items (${o.items.length})`}
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
                          alignItems: "center",
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
                          alignItems: "center",
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
                          alignItems: "center",
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
                          alignItems: "center",
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
                  <td colSpan="6" style={{ padding: "0 12px 12px", background: "#f8f9fc" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 10 }}>
                      {o.items.length === 0 && (
                        <p style={{ margin: 0, fontSize: 13, color: "#999" }}>No items.</p>
                      )}
                      {o.items.map((item) => {
                        const design = item.customizations?.design;
                        const productImg = item.product?.images?.[0];
                        const productName = item.product?.name || `Product #${item.productId}`;
                        return (
                          <div key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "#fff", borderRadius: 8, padding: "10px 12px", border: "1px solid #e4e9e7" }}>
                            {/* Product thumbnail */}
                            {productImg && (
                              <img src={productImg} alt={productName} style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 6, border: "1px solid #e0e5e3", flexShrink: 0 }} />
                            )}
                            {/* AI design thumbnail */}
                            {design?.generatedImageUrl && (
                              <div style={{ position: "relative", flexShrink: 0 }}>
                                <img src={design.generatedImageUrl} alt="AI Design" title="AI Design" style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 6, border: "2px solid #455073" }} />
                                <span style={{ position: "absolute", bottom: 0, left: 0, right: 0, textAlign: "center", background: "#455073", color: "#fff", fontSize: 8, fontWeight: 700, padding: "2px 0", borderRadius: "0 0 4px 4px" }}>AI</span>
                              </div>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: "#2f3a45" }}>{productName}</p>
                              {design?.prompt && (
                                <p style={{ margin: "3px 0 0", fontSize: 11, color: "#667085", fontStyle: "italic" }}>
                                  "{design.prompt.length > 100 ? design.prompt.slice(0, 100) + "…" : design.prompt}"
                                </p>
                              )}
                              <p style={{ margin: "3px 0 0", fontSize: 12, color: "#667085" }}>Qty: {item.quantity}</p>
                            </div>
                            <div style={{ whiteSpace: "nowrap", fontWeight: 700, fontSize: 13, color: "#0f352a", paddingTop: 2 }}>
                              ₱{parseFloat(item.unit_price).toLocaleString()} × {item.quantity}
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
    </div>
  );
}

export default AdminOrders;
