import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin-dashboard.css";
import AdminProfile from "./Admin-profile";
import AdminManageAccounts from "./Admin-manageacc";

// ✅ Icons
import {
  FaMoneyBillWave,
  FaUserPlus,
  FaShoppingBag,
  FaChartLine,
  FaCog,
  FaPlus,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";

function AdminDashboard() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");

  // ✅ Mobile sidebar drawer
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // ✅ demo states for Orders/Products pages
  const [ordersQuery, setOrdersQuery] = useState("");
  const [ordersStatus, setOrdersStatus] = useState("all");

  const [productsQuery, setProductsQuery] = useState("");
  const [productsCategory, setProductsCategory] = useState("all");

  const [settingsTab, setSettingsTab] = useState("general");

  // ✅ close mobile sidebar if resized to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768) setIsMobileSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const storedUser = useMemo(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("user")) ||
        JSON.parse(localStorage.getItem("adminUser")) ||
        null
      );
    } catch {
      return null;
    }
  }, []);

  const role = storedUser?.role || "admin";

  const menuItems = useMemo(() => {
    const base = [
      { id: "profile", label: "Profile", external: true, path: "/admin-profile" },
      { id: "orders", label: "Orders" },
      { id: "products", label: "Products" },
      { id: "customers", label: "Manage Accounts" },
      { id: "settings", label: "Settings" },
    ];

    // Staff: remove Manage Accounts
    if (role === "staff") {
      return base.filter((i) => i.id !== "customers");
    }

    return base;
  }, [role]);

  const handleMenuItemClick = (item) => {
    // Profile = separate page
    if (item.external) {
      setIsMobileSidebarOpen(false);
      navigate(item.path);
      return;
    }

    // Extra safety: staff can't open Manage Accounts even if forced
    if (role === "staff" && item.id === "customers") return;

    setActiveItem(item.id);
    setIsMobileSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    sessionStorage.clear();

    document.cookie.split(";").forEach(function (c) {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    setIsMobileSidebarOpen(false);
    setTimeout(() => navigate("/"), 100);
    alert("You have been logged out successfully!");
  };

  // If staff somehow lands on customers, kick back to dashboard
  if (role === "staff" && activeItem === "customers") {
    setActiveItem("dashboard");
  }

  // ✅ Demo data (replace later with DB)
  const orders = useMemo(
    () => [
      { id: "ORD-1001", customer: "Kathleen Buhay", total: 1250, status: "pending", date: "2026-02-08" },
      { id: "ORD-1002", customer: "Admin User", total: 499, status: "processing", date: "2026-02-08" },
      { id: "ORD-1003", customer: "Juan Dela Cruz", total: 899, status: "completed", date: "2026-02-07" },
      { id: "ORD-1004", customer: "Maria Santos", total: 199, status: "cancelled", date: "2026-02-06" },
    ],
    []
  );

  const products = useMemo(
    () => [
      { sku: "PRD-BC-001", name: "Business Cards", category: "print", price: 199, stock: 32, status: "active" },
      { sku: "PRD-ST-002", name: "Stickers", category: "print", price: 149, stock: 0, status: "out" },
      { sku: "PRD-LB-003", name: "Labels", category: "print", price: 99, stock: 12, status: "active" },
      { sku: "PRD-DS-004", name: "Logo Design", category: "service", price: 999, stock: 999, status: "active" },
    ],
    []
  );

  const filteredOrders = useMemo(() => {
    const q = ordersQuery.trim().toLowerCase();
    return orders.filter((o) => {
      const matchQuery =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.customer.toLowerCase().includes(q) ||
        String(o.total).includes(q);

      const matchStatus = ordersStatus === "all" ? true : o.status === ordersStatus;

      return matchQuery && matchStatus;
    });
  }, [orders, ordersQuery, ordersStatus]);

  const filteredProducts = useMemo(() => {
    const q = productsQuery.trim().toLowerCase();
    return products.filter((p) => {
      const matchQuery =
        !q ||
        p.sku.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        String(p.price).includes(q);

      const matchCategory = productsCategory === "all" ? true : p.category === productsCategory;

      return matchQuery && matchCategory;
    });
  }, [products, productsQuery, productsCategory]);

  const ordersStats = useMemo(() => {
    const pending = orders.filter((o) => o.status === "pending").length;
    const processing = orders.filter((o) => o.status === "processing").length;
    const completed = orders.filter((o) => o.status === "completed").length;
    const cancelled = orders.filter((o) => o.status === "cancelled").length;
    return { pending, processing, completed, cancelled, total: orders.length };
  }, [orders]);

  const productsStats = useMemo(() => {
    const active = products.filter((p) => p.status === "active").length;
    const out = products.filter((p) => p.status === "out").length;
    const services = products.filter((p) => p.category === "service").length;
    const prints = products.filter((p) => p.category === "print").length;
    return { active, out, services, prints, total: products.length };
  }, [products]);

  const pageTitle = useMemo(() => {
    if (activeItem === "dashboard") return "Dashboard";
    if (activeItem === "profile") return "Profile";
    if (activeItem === "customers") return "Manage Accounts";
    if (activeItem === "orders") return "Orders";
    if (activeItem === "products") return "Products";
    if (activeItem === "settings") return "Settings";
    return "Dashboard";
  }, [activeItem]);

  return (
    <div className="admin-dashboard">
      {/* ✅ Mobile overlay when sidebar open */}
      {isMobileSidebarOpen && (
        <button
          className="mobile-overlay"
          type="button"
          aria-label="Close menu"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`sidebar ${isCollapsed ? "collapsed" : ""} ${
          isMobileSidebarOpen ? "mobile-open" : ""
        }`}
      >
        <div className="sidebar-header">
          {!isCollapsed && <h2 className="sidebar-title">Admin Panel</h2>}
          <button
            type="button"
            className="collapse-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? "→" : "←"}
          </button>
        </div>

        {!isCollapsed && (
          <div className="user-info">
            <div className="user-avatar">
              <div className="avatar-circle">AD</div>
            </div>
            <div className="user-details">
              <h4 className="user-name">{storedUser?.firstName || "Admin User"}</h4>
              <p className="user-role">
                {role === "admin" ? "Administrator" : role === "staff" ? "Staff" : "Customer"}
              </p>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="user-collapsed">
            <div className="avatar-small">A</div>
          </div>
        )}

        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`menu-item ${activeItem === item.id ? "active" : ""}`}
              onClick={() => handleMenuItemClick(item)}
            >
              {!isCollapsed && <span className="menu-label">{item.label}</span>}
              {isCollapsed && <span className="menu-label-collapsed">{item.label.charAt(0)}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button type="button" className="logout-btn" onClick={handleLogout}>
            {!isCollapsed && "Logout"}
          </button>
        </div>
      </div>

      <main className="dashboard-content">
        <header className="dashboard-header">
          <div className="header-left">
            {/* ✅ Mobile hamburger + title row */}
            <div className="mobile-header-row">
              <button
                type="button"
                className="mobile-menu-btn"
                onClick={() => setIsMobileSidebarOpen(true)}
                aria-label="Open menu"
              >
                ☰
              </button>

              <div className="page-title-wrap">
                <h1 className="page-title">{pageTitle}</h1>
                <p className="subtitle">
                  Welcome back{storedUser?.firstName ? `, ${storedUser.firstName}` : ""}!
                </p>
              </div>
            </div>
          </div>

          {/* ✅ top button ONLY (this is the one you want to keep) */}
          <div className="header-actions">
            {activeItem === "orders" && (
              <button className="header-pill" type="button" onClick={() => alert("Add Order (demo)")}>
                <FaPlus /> New Order
              </button>
            )}
            {activeItem === "products" && (
              <button className="header-pill" type="button" onClick={() => alert("Add Product (demo)")}>
                <FaPlus /> New Product
              </button>
            )}
            {activeItem === "settings" && (
              <button className="header-pill ghost" type="button" onClick={() => alert("Saved (demo)")}>
                <FaCog /> Save
              </button>
            )}
          </div>
        </header>

        <div className="content-wrapper">
          {/* ✅ DASHBOARD (UNCHANGED) */}
          {activeItem === "dashboard" && (
            <>
              <div className="dash-hero">
                <div className="dash-hero-left">
                  <div className="dash-kicker">Overview</div>
                  <h2 className="dash-title">Your store at a glance</h2>
                  <p className="dash-desc">Track performance and manage operations faster.</p>
                </div>

                <div className="dash-hero-right">
                  <button className="dash-quick-btn" type="button" onClick={() => setActiveItem("customers")}>
                    Manage Accounts
                  </button>

                  <button className="dash-quick-btn ghost" type="button" onClick={() => setActiveItem("orders")}>
                    View Orders
                  </button>
                </div>
              </div>

              <div className="content-grid">
                <div className="stats-card revenue">
                  <div className="stat-top">
                    <div>
                      <h3>Total Revenue</h3>
                      <p className="stat-number">$45,678</p>
                    </div>
                    <div className="stat-icon">
                      <FaMoneyBillWave />
                    </div>
                  </div>
                  <div className="stat-foot">Compared to last month: +12%</div>
                </div>

                <div className="stats-card users">
                  <div className="stat-top">
                    <div>
                      <h3>New Users</h3>
                      <p className="stat-number">1,234</p>
                    </div>
                    <div className="stat-icon">
                      <FaUserPlus />
                    </div>
                  </div>
                  <div className="stat-foot">Today: 26 signups</div>
                </div>

                <div className="stats-card orders">
                  <div className="stat-top">
                    <div>
                      <h3>Orders</h3>
                      <p className="stat-number">567</p>
                    </div>
                    <div className="stat-icon">
                      <FaShoppingBag />
                    </div>
                  </div>
                  <div className="stat-foot">Pending: 18</div>
                </div>

                <div className="stats-card conversion">
                  <div className="stat-top">
                    <div>
                      <h3>Conversion Rate</h3>
                      <p className="stat-number">3.4%</p>
                    </div>
                    <div className="stat-icon">
                      <FaChartLine />
                    </div>
                  </div>
                  <div className="stat-foot">Weekly trend: steady</div>
                </div>
              </div>
            </>
          )}

          {activeItem === "profile" && <AdminProfile />}
          {activeItem === "customers" && role !== "staff" && <AdminManageAccounts />}

          {/* ✅ ORDERS (NO MORE DUPLICATE TITLE/BUTTON) */}
          {activeItem === "orders" && (
            <div className="dashpage dashpage-orders">
              {/* stat cards */}
              <div className="dashpage-stats">
                <div className="dashpage-stat-card">
                  <div className="dashpage-stat-label">Total</div>
                  <div className="dashpage-stat-value">{ordersStats.total}</div>
                </div>

                <div className="dashpage-stat-card">
                  <div className="dashpage-stat-label">Pending</div>
                  <div className="dashpage-stat-value orange">{ordersStats.pending}</div>
                </div>

                <div className="dashpage-stat-card">
                  <div className="dashpage-stat-label">Processing</div>
                  <div className="dashpage-stat-value blue">{ordersStats.processing}</div>
                </div>

                <div className="dashpage-stat-card">
                  <div className="dashpage-stat-label">Completed</div>
                  <div className="dashpage-stat-value green">{ordersStats.completed}</div>
                </div>
              </div>

              {/* toolbar */}
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
                  <select value={ordersStatus} onChange={(e) => setOrdersStatus(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <button
                    className="dashpage-filterbtn"
                    type="button"
                    onClick={() => {
                      setOrdersQuery("");
                      setOrdersStatus("all");
                    }}
                    title="Clear filters"
                  >
                    <FaFilter />
                  </button>
                </div>
              </div>

              {/* table */}
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
                      <tr key={o.id}>
                        <td data-label="Order">
                          <div className="dashpage-rowmain">
                            <div className="dashpage-rowtitle">{o.id}</div>
                          </div>
                        </td>
                        <td data-label="Customer">{o.customer}</td>
                        <td data-label="Total">₱ {o.total.toLocaleString()}</td>
                        <td data-label="Status">
                          <span className={`dashpage-pill status-${o.status}`}>
                            {o.status === "pending" && <FaClock style={{ marginRight: 6 }} />}
                            {o.status === "processing" && <FaClock style={{ marginRight: 6 }} />}
                            {o.status === "completed" && <FaCheckCircle style={{ marginRight: 6 }} />}
                            {o.status === "cancelled" && <FaExclamationTriangle style={{ marginRight: 6 }} />}
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
          )}

          {/* ✅ PRODUCTS (NO MORE DUPLICATE TITLE/BUTTON) */}
          {activeItem === "products" && (
            <div className="dashpage dashpage-products">
              {/* stat cards */}
              <div className="dashpage-stats">
                <div className="dashpage-stat-card">
                  <div className="dashpage-stat-label">Total</div>
                  <div className="dashpage-stat-value">{productsStats.total}</div>
                </div>

                <div className="dashpage-stat-card">
                  <div className="dashpage-stat-label">Active</div>
                  <div className="dashpage-stat-value green">{productsStats.active}</div>
                </div>

                <div className="dashpage-stat-card">
                  <div className="dashpage-stat-label">Out of Stock</div>
                  <div className="dashpage-stat-value red">{productsStats.out}</div>
                </div>

                <div className="dashpage-stat-card">
                  <div className="dashpage-stat-label">Services</div>
                  <div className="dashpage-stat-value purple">{productsStats.services}</div>
                </div>
              </div>

              {/* toolbar */}
              <div className="dashpage-toolbar">
                <div className="dashpage-search">
                  <span className="dashpage-search-icon">
                    <FaSearch size={14} />
                  </span>

                  <input
                    type="text"
                    placeholder="Search SKU, product name, price..."
                    value={productsQuery}
                    onChange={(e) => setProductsQuery(e.target.value)}
                  />
                </div>

                <div className="dashpage-filters">
                  <select value={productsCategory} onChange={(e) => setProductsCategory(e.target.value)}>
                    <option value="all">All Categories</option>
                    <option value="print">Print</option>
                    <option value="service">Service</option>
                  </select>

                  <button
                    className="dashpage-filterbtn"
                    type="button"
                    onClick={() => {
                      setProductsQuery("");
                      setProductsCategory("all");
                    }}
                    title="Clear filters"
                  >
                    <FaFilter />
                  </button>
                </div>
              </div>

              {/* table */}
              <div className="dashpage-table-card">
                <table className="dashpage-table">
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p.sku}>
                        <td data-label="SKU" className="strong">
                          {p.sku}
                        </td>
                        <td data-label="Product">{p.name}</td>
                        <td data-label="Category">
                          <span className={`dashpage-pill cat-${p.category}`}>{p.category}</span>
                        </td>
                        <td data-label="Price">₱ {p.price.toLocaleString()}</td>
                        <td data-label="Stock">{p.category === "service" ? "—" : p.stock}</td>
                        <td data-label="Status">
                          <span
                            className={`dashpage-pill status-${
                              p.status === "active" ? "completed" : "cancelled"
                            }`}
                          >
                            {p.status === "active" ? (
                              <FaCheckCircle style={{ marginRight: 6 }} />
                            ) : (
                              <FaExclamationTriangle style={{ marginRight: 6 }} />
                            )}
                            {p.status === "active" ? "active" : "out"}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan="6" className="dashpage-empty">
                          No products found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ✅ SETTINGS (unchanged) */}
          {activeItem === "settings" && (
            <div className="page-shell">
              <div className="section-hero settings-hero">
                <div className="section-hero-left">
                  <div className="section-kicker">
                    <FaCog /> Admin Settings
                  </div>
                  <h2 className="section-title">Customize your workspace</h2>
                  <p className="section-desc">
                    Manage security, store settings, and preferences in one place.
                  </p>
                </div>

                <div className="section-hero-right">
                  <button className="primary-action" type="button" onClick={() => alert("Saved (demo)")}>
                    <FaCheckCircle /> Save Changes
                  </button>
                  <button className="secondary-action" type="button" onClick={() => alert("Reset (demo)")}>
                    Reset
                  </button>
                </div>
              </div>

              <div className="settings-grid">
                <div className="settings-nav">
                  <button
                    className={`settings-tab ${settingsTab === "general" ? "active" : ""}`}
                    type="button"
                    onClick={() => setSettingsTab("general")}
                  >
                    General
                  </button>
                  <button
                    className={`settings-tab ${settingsTab === "security" ? "active" : ""}`}
                    type="button"
                    onClick={() => setSettingsTab("security")}
                  >
                    Security
                  </button>
                  <button
                    className={`settings-tab ${settingsTab === "store" ? "active" : ""}`}
                    type="button"
                    onClick={() => setSettingsTab("store")}
                  >
                    Store
                  </button>
                  <button
                    className={`settings-tab ${settingsTab === "notifications" ? "active" : ""}`}
                    type="button"
                    onClick={() => setSettingsTab("notifications")}
                  >
                    Notifications
                  </button>
                </div>

                <div className="settings-card">
                  {settingsTab === "general" && (
                    <>
                      <div className="settings-head">
                        <h3>General</h3>
                        <p className="muted">Basic preferences for the admin panel.</p>
                      </div>

                      <div className="form-grid">
                        <div className="field">
                          <label>Panel Name</label>
                          <input defaultValue="Admin Panel" />
                        </div>
                        <div className="field">
                          <label>Timezone</label>
                          <select defaultValue="Asia/Manila">
                            <option>Asia/Manila</option>
                            <option>Asia/Singapore</option>
                            <option>UTC</option>
                          </select>
                        </div>
                        <div className="field full">
                          <label>Support Email</label>
                          <input defaultValue="support@printhub.com" />
                        </div>
                      </div>
                    </>
                  )}

                  {settingsTab === "security" && (
                    <>
                      <div className="settings-head">
                        <h3>Security</h3>
                        <p className="muted">Protect accounts and access.</p>
                      </div>

                      <div className="form-grid">
                        <div className="field full">
                          <label>2FA</label>
                          <div className="toggle-row">
                            <span className="muted">Require two-factor authentication for admins</span>
                            <label className="switch">
                              <input type="checkbox" defaultChecked />
                              <span className="slider" />
                            </label>
                          </div>
                        </div>

                        <div className="field">
                          <label>Password Policy</label>
                          <select defaultValue="strong">
                            <option value="basic">Basic</option>
                            <option value="strong">Strong</option>
                            <option value="strict">Strict</option>
                          </select>
                        </div>

                        <div className="field">
                          <label>Session Timeout</label>
                          <select defaultValue="30">
                            <option value="15">15 minutes</option>
                            <option value="30">30 minutes</option>
                            <option value="60">1 hour</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {settingsTab === "store" && (
                    <>
                      <div className="settings-head">
                        <h3>Store</h3>
                        <p className="muted">Manage store behavior and checkout rules.</p>
                      </div>

                      <div className="form-grid">
                        <div className="field full">
                          <label>Store Status</label>
                          <select defaultValue="open">
                            <option value="open">Open</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="closed">Closed</option>
                          </select>
                        </div>

                        <div className="field">
                          <label>Minimum Order</label>
                          <input defaultValue="100" />
                        </div>

                        <div className="field">
                          <label>Currency</label>
                          <select defaultValue="PHP">
                            <option>PHP</option>
                            <option>USD</option>
                            <option>SGD</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {settingsTab === "notifications" && (
                    <>
                      <div className="settings-head">
                        <h3>Notifications</h3>
                        <p className="muted">Control alerts and email notifications.</p>
                      </div>

                      <div className="settings-list">
                        <div className="settings-item">
                          <div>
                            <div className="strong">New orders</div>
                            <div className="muted">Notify when a new order is placed</div>
                          </div>
                          <label className="switch">
                            <input type="checkbox" defaultChecked />
                            <span className="slider" />
                          </label>
                        </div>

                        <div className="settings-item">
                          <div>
                            <div className="strong">Low stock</div>
                            <div className="muted">Alert when inventory is low</div>
                          </div>
                          <label className="switch">
                            <input type="checkbox" defaultChecked />
                            <span className="slider" />
                          </label>
                        </div>

                        <div className="settings-item">
                          <div>
                            <div className="strong">Weekly summary</div>
                            <div className="muted">Send a weekly performance report</div>
                          </div>
                          <label className="switch">
                            <input type="checkbox" />
                            <span className="slider" />
                          </label>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
