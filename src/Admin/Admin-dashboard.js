// Admin-dashboard.js (FULL UPDATED FILE — adds Logout confirmation modal ONLY, no other UI/layout changes)
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin-dashboard.css";
import AdminProfile from "./Admin-profile";
import AdminManageAccounts from "./Admin-manageacc";
import AdminOrders from "./AdminOrders";
import AdminProducts from "./AdminProducts";

// ✅ Icons (only keep unused, but needed)
import {
  FaMoneyBillWave,
  FaUserPlus,
  FaShoppingBag,
  FaChartLine,
  FaCog,
  FaPlus,
  FaCheckCircle,
} from "react-icons/fa";

function AdminDashboard() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");

  // ✅ Mobile sidebar drawer
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [settingsTab, setSettingsTab] = useState("general");

  // ✅ NEW: Logout confirm modal
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
      {
        id: "profile",
        label: "Profile",
        external: true,
        path: "/admin-profile",
      },
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

  // ✅ unchanged logout logic moved here (same behavior)
  const doLogout = () => {
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
    setShowLogoutModal(false);
    setTimeout(() => navigate("/"), 100);
    alert("You have been logged out successfully!");
  };

  // ✅ NEW: open confirm modal instead of immediate logout
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  // If staff somehow lands on customers, kick back to dashboard
  if (role === "staff" && activeItem === "customers") {
    setActiveItem("dashboard");
  }

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

      {/* ✅ NEW: Logout confirmation modal */}
      {showLogoutModal && (
        <div
          className="ad-logout-overlay"
          onMouseDown={() => setShowLogoutModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="ad-logout-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <h3 className="ad-logout-title">Log out?</h3>
            <p className="ad-logout-text">Are you sure you want to logout?</p>

            <div className="ad-logout-actions">
              <button
                type="button"
                className="ad-logout-btn ghost"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="ad-logout-btn danger"
                onClick={doLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
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
              <h4 className="user-name">
                {storedUser?.firstName || "Admin User"}
              </h4>
              <p className="user-role">
                {role === "admin"
                  ? "Administrator"
                  : role === "staff"
                    ? "Staff"
                    : "Customer"}
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
              {isCollapsed && (
                <span className="menu-label-collapsed">
                  {item.label.charAt(0)}
                </span>
              )}
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
                  Welcome back
                  {storedUser?.firstName ? `, ${storedUser.firstName}` : ""}!
                </p>
              </div>
            </div>
          </div>

          {/* ✅ top button ONLY (this is the one you want to keep) */}
          <div className="header-actions">
            {activeItem === "orders" && (
              <button
                className="header-pill"
                type="button"
                onClick={() => alert("Add Order (demo)")}
              >
                <FaPlus /> New Order
              </button>
            )}
            {activeItem === "products" && (
              <button
                className="header-pill"
                type="button"
                onClick={() => alert("Add Product (demo)")}
              >
                <FaPlus /> New Product
              </button>
            )}
            {activeItem === "settings" && (
              <button
                className="header-pill ghost"
                type="button"
                onClick={() => alert("Saved (demo)")}
              >
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
                  <p className="dash-desc">
                    Track performance and manage operations faster.
                  </p>
                </div>

                <div className="dash-hero-right">
                  <button
                    className="dash-quick-btn"
                    type="button"
                    onClick={() => setActiveItem("customers")}
                  >
                    Manage Accounts
                  </button>

                  <button
                    className="dash-quick-btn ghost"
                    type="button"
                    onClick={() => setActiveItem("orders")}
                  >
                    View Orders
                  </button>
                </div>
              </div>

              <div className="content-grid">
                <div className="stats-card revenue">
                  <div className="stat-top">
                    <div>
                      <h3>Total Revenue</h3>
                      <p className="stat-number">₱ 45,678</p>
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
          {activeItem === "customers" && role !== "staff" && (
            <AdminManageAccounts />
          )}

          {/* ✅ ORDERS - Dynamic component */}
          {activeItem === "orders" && <AdminOrders />}

          {/* ✅ PRODUCTS - Dynamic component */}
          {activeItem === "products" && <AdminProducts />}

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
                    Manage security, store settings, and preferences in one
                    place.
                  </p>
                </div>

                <div className="section-hero-right">
                  <button
                    className="primary-action"
                    type="button"
                    onClick={() => alert("Saved (demo)")}
                  >
                    <FaCheckCircle /> Save Changes
                  </button>
                  <button
                    className="secondary-action"
                    type="button"
                    onClick={() => alert("Reset (demo)")}
                  >
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
                        <p className="muted">
                          Basic preferences for the admin panel.
                        </p>
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
                            <span className="muted">
                              Require two-factor authentication for admins
                            </span>
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
                        <p className="muted">
                          Manage store behavior and checkout rules.
                        </p>
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
                        <p className="muted">
                          Control alerts and email notifications.
                        </p>
                      </div>

                      <div className="settings-list">
                        <div className="settings-item">
                          <div>
                            <div className="strong">New orders</div>
                            <div className="muted">
                              Notify when a new order is placed
                            </div>
                          </div>
                          <label className="switch">
                            <input type="checkbox" defaultChecked />
                            <span className="slider" />
                          </label>
                        </div>

                        <div className="settings-item">
                          <div>
                            <div className="strong">Low stock</div>
                            <div className="muted">
                              Alert when inventory is low
                            </div>
                          </div>
                          <label className="switch">
                            <input type="checkbox" defaultChecked />
                            <span className="slider" />
                          </label>
                        </div>

                        <div className="settings-item">
                          <div>
                            <div className="strong">Weekly summary</div>
                            <div className="muted">
                              Send a weekly performance report
                            </div>
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
