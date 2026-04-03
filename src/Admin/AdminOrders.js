import React, { useState, useEffect, useMemo } from "react";
import {
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";
import "./Admin-dashboard.css";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ordersQuery, setOrdersQuery] = useState("");
  const [ordersStatus, setOrdersStatus] = useState("all");

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3000/api/admin/orders");
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
    return orders.filter((o) => {
      const matchQuery =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.customer.toLowerCase().includes(q) ||
        String(o.total).includes(q);

      const matchStatus =
        ordersStatus === "all" ? true : o.status === ordersStatus;

      return matchQuery && matchStatus;
    });
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
            </tr>
          </thead>

          <tbody>
            {filteredOrders.map((o) => (
              <tr key={o.dbId}>
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
              </tr>
            ))}

            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan="5" className="dashpage-empty">
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
