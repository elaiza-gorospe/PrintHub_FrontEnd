import React, { useState } from 'react';
import './User-registration.css';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/images/pmg-image.jpg';

function UserRegistrationPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false); // show/hide password
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // for confirm password
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.agreeTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/register/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || data.message?.includes('already registered')) {
        setError(data.message || 'Failed to send OTP');
        return;
      }

      navigate('/user-otp', { state: { email: formData.email } });

    } catch (err) {
      setError('Network error, please try again later');
    }
  };

  return (
    <div className="user-registration-container">
      <button className="back-button" onClick={() => navigate(-1)} title="Go back">
        ← Back
      </button>
      
      <div className="registration-split">
        <div className="registration-form-section">
          <div className="registration-card">
            <div className="registration-header">
              <h1>Create Account</h1>
              <p>Join PMG Printing House!</p>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group" style={{ position: 'relative' }}>
                  <label htmlFor="password">Password *</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="show-password-button"
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '600',
                      color: '#0f3429'
                    }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>

                <div className="form-group" style={{ position: 'relative' }}>
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="show-password-button"
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '600',
                      color: '#0f3429'
                    }}
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="form-agreement">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                  />
                  <span>I agree to the <a href="#terms">Terms and Conditions</a> and <a href="#privacy">Privacy Policy</a></span>
                </label>
              </div>

              <button type="submit" className="register-button">Create Account</button>
            </form>

            <div className="registration-footer">
              <p>Already have an account? <a href="#" onClick={() => navigate('/user-login')}>Sign in here</a></p>
            </div>
          </div>
        </div>

        <div 
          className="registration-image-section"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      </div>
    </div>
  );
}

export default UserRegistrationPage;
