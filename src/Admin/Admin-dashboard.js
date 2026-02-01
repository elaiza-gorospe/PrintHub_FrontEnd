import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin-dashboard.css';
import AdminProfile from './Admin-profile';
import AdminManageAccounts from './Admin-manageacc';

function AdminDashboard() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');

  const menuItems = [
    { id: 'profile', label: 'Profile', external: true, path: '/admin-profile' },
    { id: 'orders', label: 'Orders' },
    { id: 'products', label: 'Products' },
    { id: 'customers', label: 'Manage Accounts' },
    { id: 'settings', label: 'Settings' },
  ];

  const handleMenuItemClick = (item) => {
    // Profile = separate page
    if (item.external) {
      navigate(item.path);
      return;
    }
    setActiveItem(item.id);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    sessionStorage.clear();

    document.cookie.split(";").forEach(function (c) {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    setTimeout(() => navigate('/'), 100);
    alert('You have been logged out successfully!');
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className='sidebar-header'>
          {!isCollapsed && <h2 className="sidebar-title">Admin Panel</h2>}
          <button
            type="button"
            className="collapse-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>

        {!isCollapsed && (
          <div className="user-info">
            <div className="user-avatar">
              <div className="avatar-circle">AD</div>
            </div>
            <div className="user-details">
              <h4 className="user-name">Admin User</h4>
              <p className="user-role">Administrator</p>
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
              className={`menu-item ${activeItem === item.id ? 'active' : ''}`}
              onClick={() => handleMenuItemClick(item)}
            >
              {!isCollapsed && <span className="menu-label">{item.label}</span>}
              {isCollapsed && <span className="menu-label-collapsed">{item.label.charAt(0)}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button type="button" className="logout-btn" onClick={handleLogout}>
            {!isCollapsed && 'Logout'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="dashboard-content">
        <header className="dashboard-header">
          <div className="header-left">
            <h1>
              {activeItem === "dashboard" && "Dashboard"}
              {activeItem === "profile" && "Profile"}
              {activeItem === "customers" && "Manage Accounts"}
              {activeItem === "orders" && "Orders"}
              {activeItem === "products" && "Products"}
              {activeItem === "settings" && "Settings"}
            </h1>
            <p className="subtitle">Welcome back, Admin!</p>
          </div>
        </header>

        <div className="content-wrapper">
          {/* ✅ Switch what shows INSIDE dashboard */}
          {activeItem === "dashboard" && (
            <div className="content-grid">
              <div className="stats-card">
                <h3>Total Revenue</h3>
                <p className="stat-number">$45,678</p>
              </div>
              <div className="stats-card">
                <h3>New Users</h3>
                <p className="stat-number">1,234</p>
              </div>
              <div className="stats-card">
                <h3>Orders</h3>
                <p className="stat-number">567</p>
              </div>
              <div className="stats-card">
                <h3>Conversion Rate</h3>
                <p className="stat-number">3.4%</p>
              </div>
            </div>
          )}

          {activeItem === "profile" && <AdminProfile />}

          {/* ✅ Manage Accounts shows within dashboard */}
          {activeItem === "customers" && <AdminManageAccounts />}

          {activeItem === "orders" && (
            <div className="profile-card"><h2>Orders</h2></div>
          )}

          {activeItem === "products" && (
            <div className="profile-card"><h2>Products</h2></div>
          )}

          {activeItem === "settings" && (
            <div className="profile-card"><h2>Settings</h2></div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
