import React, { useState } from 'react';
import './Admin-login.css';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/images/pmg-image.jpg';
import AdminDashboard from './Admin-dashboard';

function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Simple validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    // TODO: Replace with actual API call
    console.log('Login attempt:', { email, password, rememberMe });
    
    // Simulate successful login
    alert('Login successful!');
    navigate('/admin-dashboard');
  };

  return (
    <div className="admin-login-container">
      <button className="back-button" onClick={() => navigate(-1)} title="Go back">
        ← Back
      </button>

      <div className="login-split">
        <div className="login-form-section">
          <div className="login-card">
        <div className="login-header">
          <h1>Welcome, Admin!</h1>
          <p>Sign in to your account</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <a href="#forgot-password" className="forgot-password">Forgot password?</a>
          </div>

          <button type="submit" className="login-button" onClick={() => navigate('/admin-dashboard')}>Sign In</button>
        </form>

            <div className="login-footer">
              <p>Don't have an account? <a href="#" onClick={() => navigate('/admin-register')}>Create one here</a></p>
            </div>
          </div>
        </div>

        <div className="login-image-section"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
