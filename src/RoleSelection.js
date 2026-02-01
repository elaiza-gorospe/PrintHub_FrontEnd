import React from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from './assets/images/pmg-image.jpg';
import './RoleSelection.css';

function RoleSelectionPage() {
  const navigate = useNavigate();

  return (
    <div className="role-selection-container">
      <button className="back-button" onClick={() => navigate(-1)} title="Go back">
        ← Back
      </button>

      <div className="role-selection-content">
        <h2>Welcome to PMG Printing House!</h2>
        <p>Please select your login type</p>

        <div className="role-selection-cards">
          <div 
            className="role-card user-role"
            onClick={() => navigate('/user-login')}
          >
            <div className="role-icon">👤</div>
            <h2>Customer Login</h2>
            <p>Sign in as a customer to access printing services</p>
            <button className="role-button">Continue as Customer</button>
          </div>

          <div 
            className="role-card admin-role"
            onClick={() => navigate('/admin-login')}
          >
            <div className="role-icon">⚙️</div>
            <h2>Admin Login</h2>
            <p>Sign in as an admin to manage the platform</p>
            <button className="role-button">Continue as Admin</button>
          </div>
        </div>
      </div>
      </div>
  );
}

export default RoleSelectionPage;
