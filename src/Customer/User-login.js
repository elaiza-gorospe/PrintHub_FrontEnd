import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/images/pmg-image.jpg';
import './User-login.css';

function UserLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please fill in Email field');
      return;
    } else if (!password) {
      setError('Please fill in Password field');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Increment login attempts
        setLoginAttempts((prev) => prev + 1);

        // Show modal after 3 failed attempts
        if (loginAttempts + 1 >= 3) {
          setShowForgotModal(true);
        }

        setError(data.message || 'Login failed');
        return;
      }

      // Reset attempts on successful login
      setLoginAttempts(0);

      // Login success
      console.log('Logged in user:', data.user);
      if (data.user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/user-home');
      }

    } catch (err) {
      setError('Network error, please try again later');
      console.error(err);
    }
  };

  const handleChangePassword = () => {
    setShowForgotModal(false);
    navigate('/forgot-password'); // Redirect to your forgot password page
  };

  return (
    <div className="user-login-container">
      <button className="back-button" onClick={() => navigate("/")} title="Go back">
        ← Back
      </button>

      <div className='login-split'>
        <div className="login-form-section">
          <div className="login-card">
            <div className="login-header">
              <h1>Login</h1>
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
                  placeholder="customer@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>

              <div className="form-options">
                <a href="#forgot-password" className="forgot-password">Forgot password?</a>
              </div>

              <button type="submit" className="login-button">Sign In</button>
            </form>

            <div className="login-footer">
              <p>Don't have an account? <a href="#" onClick={() => navigate('/user-register')}>Create one here</a></p>
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

      {/* Forgot / Change Password Modal
{showForgotModal && (
  <div className="forgot-password-modal">
    <div className="modal-content">
      <h2>Forgot your password?</h2>
      <p>Please enter a new password below.</p>

      <div className="form-group">
        <label>New Password</label>
        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Confirm New Password</label>
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      {resetError && <div className="error-message">{resetError}</div>}
      {resetSuccess && <div className="success-message">{resetSuccess}</div>}

      <button className="modal-button" onClick={handlePasswordReset}>
        Change Password
      </button>
      <button
        className="modal-button cancel"
        onClick={() => setShowForgotModal(false)}
      >
        Cancel
      </button>
    </div>
  </div>
)} */}
    </div>
  );
}

export default UserLoginPage;
