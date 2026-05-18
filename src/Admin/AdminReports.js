import React, { useEffect, useMemo, useState } from "react";
import { FaChartLine, FaDownload, FaSyncAlt } from "react-icons/fa";
import "./Admin-dashboard.css";
import { buildApiUrl } from "../config/api";

const peso = (value) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const today = new Date().toISOString().slice(0, 10);
const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  .toISOString()
  .slice(0, 10);

export default function AdminReports() {
  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(today);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const qs = useMemo(() => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    return params.toString();
  }, [from, to]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(buildApiUrl(`/api/admin/reports/sales?${qs}`));
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load report");
      setReport(data);
    } catch (err) {
      setError(err.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qs]);

  const exportCsv = () => {
    if (!report) return;
    const rows = [
      ["Order ID", "Customer", "Status", "Payment", "Total", "Date"],
      ...(report.recentOrders || []).map((order) => [
        order.id,
        order.customer,
        order.status,
        order.payment_status,
        order.total,
        new Date(order.createdAt).toLocaleDateString("en-PH"),
      ]),
    ];
    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `printhub-sales-${from || "all"}-${to || "today"}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const summary = report?.summary || {};
  const statusRows = Object.entries(report?.byStatus || {});

  return (
    <div className="dashpage dashpage-reports">
      <div className="section-hero settings-hero">
        <div className="section-hero-left">
          <div className="section-kicker">
            <FaChartLine /> Reports
          </div>
          <h2 className="section-title">Sales and production snapshot</h2>
          <p className="section-desc">
            Track paid revenue, order volume, production status, and top products.
          </p>
        </div>
        <div className="section-hero-right">
          <button className="secondary-action" type="button" onClick={fetchReport}>
            <FaSyncAlt /> Refresh
          </button>
          <button className="primary-action" type="button" onClick={exportCsv}>
            <FaDownload /> Export CSV
          </button>
        </div>
      </div>

      <div className="dashpage-toolbar">
        <div className="field">
          <label>From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="field">
          <label>To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      {loading && <div className="dashpage-loading">Loading report...</div>}
      {error && <div className="dashpage-error">{error}</div>}

      {!loading && !error && report && (
        <>
          <div className="dashpage-stats">
            <div className="dashpage-stat-card">
              <div className="dashpage-stat-label">Paid Revenue</div>
              <div className="dashpage-stat-value green">
                {peso(summary.revenue)}
              </div>
            </div>
            <div className="dashpage-stat-card">
              <div className="dashpage-stat-label">Orders</div>
              <div className="dashpage-stat-value">{summary.orders || 0}</div>
            </div>
            <div className="dashpage-stat-card">
              <div className="dashpage-stat-label">Paid Orders</div>
              <div className="dashpage-stat-value blue">
                {summary.paidOrders || 0}
              </div>
            </div>
            <div className="dashpage-stat-card">
              <div className="dashpage-stat-label">Average Order</div>
              <div className="dashpage-stat-value orange">
                {peso(summary.averageOrderValue)}
              </div>
            </div>
          </div>

          <div className="content-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div className="data-table-card">
              <div className="data-table-head">
                <h3>Status Breakdown</h3>
              </div>
              <table className="data-table">
                <tbody>
                  {statusRows.map(([status, count]) => (
                    <tr key={status}>
                      <td>{status.replace(/_/g, " ")}</td>
                      <td className="right">{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="data-table-card">
              <div className="data-table-head">
                <h3>Top Products</h3>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th className="right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {(report.topProducts || []).map((product) => (
                    <tr key={product.productId}>
                      <td>{product.name}</td>
                      <td>{product.quantity}</td>
                      <td className="right">{peso(product.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="data-table-card" style={{ marginTop: 12 }}>
            <div className="data-table-head">
              <h3>Recent Orders</h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th className="right">Total</th>
                </tr>
              </thead>
              <tbody>
                {(report.recentOrders || []).map((order) => (
                  <tr key={order.id}>
                    <td>ORD-{String(order.id).padStart(4, "0")}</td>
                    <td>{order.customer}</td>
                    <td>{order.status.replace(/_/g, " ")}</td>
                    <td>{order.payment_status.replace(/_/g, " ")}</td>
                    <td className="right">{peso(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
