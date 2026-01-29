import React from 'react';
import { useNavigate } from 'react-router-dom';
import './admin-dashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="admin-dashboard-container">
      {/* NAVBAR */}
      <nav className="admin-dashboard-navbar">
        <div
          className="admin-dashboard-logo"
          onClick={() => navigate('/admin-dashboard')}
        >
          PrintHub Admin
        </div>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </nav>

      {/* HEADER */}
      <header className="admin-dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage orders, users, and system settings</p>

        <div className="admin-dashboard-actions">
          <button className="admin-dashboard-button">
            Manage Orders
          </button>
          <button className="admin-dashboard-button">
            View Users
          </button>
          <button className="admin-dashboard-button">
            Reports
          </button>
          <button className="admin-dashboard-button secondary">
            Settings
          </button>
        </div>
      </header>
    </div>
  );
}

export default AdminDashboard;
