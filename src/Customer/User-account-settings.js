import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./User-account-settings.css";

function UserAccountSettings() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("notifications");

  const menuItems = [
    { id: "notifications", label: "Notifications" },
    { id: "files", label: "Print Files & Designs" },
    { id: "billing", label: "Billing Method" },
    { id: "security", label: "Security" },
    { id: "preference", label: "Preferences" },
    { id: "account", label: "Account Management" },
  ];

  // demo user (replace later)
  const user = {
    name: "Kathleen",
    role: "Customer",
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();

    document.cookie.split(";").forEach(function (c) {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    setTimeout(() => navigate("/user-login"), 100);
    alert("You have been logged out successfully!");
  };

  return (
    <div className="user-settings-dashboard">
      {/* Sidebar */}
      <div className={`us-sidebar ${isCollapsed ? "collapsed" : ""}`}>
        <div className="us-sidebar-header">
          {!isCollapsed && <h2 className="us-sidebar-title">Settings</h2>}
          <button
            type="button"
            className="us-collapse-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? "→" : "←"}
          </button>
        </div>

        {!isCollapsed ? (
          <div className="us-user-info">
            <div className="us-user-avatar">
              <div className="us-avatar-circle">
                {(user.name || "U")
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
            </div>
            <div className="us-user-details">
              <h4 className="us-user-name">{user.name}</h4>
              <p className="us-user-role">{user.role}</p>
            </div>
          </div>
        ) : (
          <div className="us-user-collapsed">
            <div className="us-avatar-small">U</div>
          </div>
        )}

        <nav className="us-sidebar-menu">
          {menuItems.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`us-menu-item ${
                activeItem === item.id ? "active" : ""
              }`}
              onClick={() => setActiveItem(item.id)}
            >
              {!isCollapsed && <span className="us-menu-label">{item.label}</span>}
              {isCollapsed && (
                <span className="us-menu-label-collapsed">
                  {item.label.charAt(0)}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="us-sidebar-bottom">
          <button type="button" className="us-back-btn" onClick={() => navigate("/user-home")}>
            {!isCollapsed && "Back to Home"}
          </button>

          <button type="button" className="us-logout-btn" onClick={handleLogout}>
            {!isCollapsed && "Logout"}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="us-content">
        <header className="us-header">
          <div className="us-header-left">
            <h1>
              {activeItem === "notifications" && "Notifications"}
              {activeItem === "files" && "Print Files & Designs"}
              {activeItem === "billing" && "Billing Method"}
              {activeItem === "security" && "Security"}
              {activeItem === "preference" && "Preferences"}
              {activeItem === "account" && "Account Management"}
            </h1>
            <p className="us-subtitle">Manage your account settings</p>
          </div>
        </header>

        <div className="us-wrapper">
          {/* Notifications */}
          {activeItem === "notifications" && (
            <div className="us-card">
              <h2>Email & App Notifications</h2>
              <p className="us-muted">
                Choose what updates you want to receive.
              </p>

              <div className="us-setting-row">
                <div>
                  <h4>Order updates</h4>
                  <p className="us-muted">Get notified about order status changes.</p>
                </div>
                <input type="checkbox" defaultChecked />
              </div>

              <div className="us-setting-row">
                <div>
                  <h4>Promotions</h4>
                  <p className="us-muted">Receive discounts and announcements.</p>
                </div>
                <input type="checkbox" />
              </div>

              <div className="us-setting-row">
                <div>
                  <h4>Reminders</h4>
                  <p className="us-muted">Cart reminders and unfinished requests.</p>
                </div>
                <input type="checkbox" defaultChecked />
              </div>
            </div>
          )}

          {/* Print Files & Designs */}
          {activeItem === "files" && (
            <div className="us-card">
              <h2>Print Files & Designs</h2>
              <p className="us-muted">
                Manage uploaded files and saved designs.
              </p>

              <div className="us-actions-row">
                <button className="us-primary-btn" type="button">
                  Upload New File
                </button>
                <button className="us-secondary-btn" type="button">
                  View My Uploads
                </button>
              </div>

              <div className="us-note">
                Tip: Later we can connect this to your database table for uploads.
              </div>
            </div>
          )}

          {/* Billing Method */}
          {activeItem === "billing" && (
            <div className="us-card">
              <h2>Billing Method</h2>
              <p className="us-muted">
                Add or update your preferred payment method.
              </p>

              <div className="us-actions-row">
                <button className="us-primary-btn" type="button">
                  Add Payment Method
                </button>
                <button className="us-secondary-btn" type="button">
                  Manage Methods
                </button>
              </div>

              <div className="us-note">
                Example: GCash / PayMaya / Card (PayMongo integration later).
              </div>
            </div>
          )}

          {/* Security */}
          {activeItem === "security" && (
            <div className="us-card">
              <h2>Security</h2>
              <p className="us-muted">
                Protect your account by updating security settings.
              </p>

              <div className="us-actions-row">
                <button
                  className="us-primary-btn"
                  type="button"
                  onClick={() => navigate("/user-reset-password")}
                >
                  Change Password
                </button>
                <button className="us-secondary-btn" type="button">
                  Enable 2FA (Coming Soon)
                </button>
              </div>
            </div>
          )}

          {/* Preferences */}
          {activeItem === "preference" && (
            <div className="us-card">
              <h2>Preferences</h2>
              <p className="us-muted">
                Set your experience preferences.
              </p>

              <div className="us-setting-row">
                <div>
                  <h4>Default delivery option</h4>
                  <p className="us-muted">Pickup or Delivery.</p>
                </div>
                <select className="us-select" defaultValue="pickup">
                  <option value="pickup">Pickup</option>
                  <option value="delivery">Delivery</option>
                </select>
              </div>

              <div className="us-setting-row">
                <div>
                  <h4>Preferred file format</h4>
                  <p className="us-muted">Used for printing requests.</p>
                </div>
                <select className="us-select" defaultValue="pdf">
                  <option value="pdf">PDF</option>
                  <option value="png">PNG</option>
                  <option value="jpg">JPG</option>
                </select>
              </div>
            </div>
          )}

          {/* Account Management */}
          {activeItem === "account" && (
            <div className="us-card">
              <h2>Account Management</h2>
              <p className="us-muted">
                You can deactivate or permanently delete your account.
              </p>

              <div className="us-danger-box">
                <h3>Deactivate Account</h3>
                <p className="us-muted">
                  Temporarily disable your account. You can reactivate later.
                </p>
                <button
                  className="us-danger-btn"
                  type="button"
                  onClick={() => alert("Deactivate (connect to backend later)")}
                >
                  Deactivate
                </button>
              </div>

              <div className="us-danger-box">
                <h3>Delete Account</h3>
                <p className="us-muted">
                  This permanently removes your data. This cannot be undone.
                </p>
                <button
                  className="us-danger-btn"
                  type="button"
                  onClick={() => alert("Delete (connect to backend later)")}
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default UserAccountSettings;
