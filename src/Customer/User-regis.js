import React, { useState } from 'react';
import './User-registration.css';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/images/pmg-image.jpg';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';

function UserRegistrationPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '+63',
    address: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [criteria, setCriteria] = useState({
    uppercase: false,
    number: false,
    special: false,
    length: false,
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const navigate = useNavigate();

  // ===================== ADDED HANDLERS (ONLY VALIDATION) =====================

  const handleNameChange = (e) => {
    const { name, value } = e.target;
    if (/^[A-Za-z\s]*$/.test(value)) {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePhoneChange = (e) => {
    // Remove non-numeric characters
    let digits = e.target.value.replace(/[^0-9]/g, '');

    // Always start with 63
    if (!digits.startsWith('63')) digits = '63';

    // Limit to 63 + 10 digits
    if (digits.length > 12) digits = digits.slice(0, 12);

    // Update formData
    setFormData(prev => ({ ...prev, phone: '+' + digits }));

    // Validate length (must have 10 digits after 63)
    if (digits.length < 12) {
      setPhoneError('Phone number must have 10 digits after +63');
    } else {
      setPhoneError('');
    }
  };

  // ===================== ORIGINAL CODE (UNCHANGED) =====================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, password: value }));

    setCriteria({
      uppercase: /[A-Z]/.test(value),
      number: /\d/.test(value),
      special: /[^A-Za-z0-9]/.test(value),
      length: value.length >= 8 && value.length <= 12,
    });

    if (formData.confirmPassword && value !== formData.confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, confirmPassword: value }));

    if (formData.password && value !== formData.password) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setConfirmPasswordError('');
    setPhoneError('');

    const { firstName, lastName, email, password, confirmPassword, agreeTerms, phone } = formData;

    if (!firstName || !lastName || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!criteria.uppercase || !criteria.number || !criteria.special || !criteria.length) {
      setError('Password does not meet all criteria');
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }

    // Phone validation on submit
    if (phone.replace(/[^0-9]/g, '').length < 12) {
      setPhoneError('Phone number must have 10 digits after +63');
      return;
    }

    if (!agreeTerms) {
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

  const renderCriteria = (label, met) => (
    <p style={{ color: met ? 'green' : 'red', margin: '2px 0', fontSize: '13px' }}>
      {met ? '✔' : '✖'} {label}
    </p>
  );

  return (
    <div className="user-registration-container">
      <button className="back-button" onClick={() => navigate("/User-login")} title="Go back">
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
                    onChange={handleNameChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleNameChange}
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
                  onChange={handlePhoneChange}
                />
                {phoneError && (
                  <div className="error-message" style={{ marginTop: '5px' }}>
                    {phoneError}
                  </div>
                )}
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

              <div className="form-group" style={{ position: 'relative' }}>
                <label htmlFor="password">Password *</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handlePasswordChange}
                  onCopy={(e) => e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="show-password-button"
                  style={{ paddingTop: "35px" }}
                >
                  {showPassword ? <MdVisibilityOff size={22} color="#555" /> : <MdVisibility size={22} color="#555" />}
                </button>
              </div>

              {formData.password.length > 0 && (
                <div className="password-criteria">
                  {renderCriteria('At least 1 Uppercase', criteria.uppercase)}
                  {renderCriteria('At least 1 Number', criteria.number)}
                  {renderCriteria('At least 1 Special Character', criteria.special)}
                  {renderCriteria('8-12 Characters', criteria.length)}
                </div>
              )}

              <div className="form-group" style={{ position: 'relative' }}>
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  onCopy={(e) => e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="show-password-button"
                  style={{ paddingTop: "35px" }}
                >
                  {showConfirmPassword ? <MdVisibilityOff size={22} color="#555" /> : <MdVisibility size={22} color="#555" />}
                </button>
              </div>

              {confirmPasswordError && (
                <div className="error-message" style={{ marginTop: '5px' }}>
                  {confirmPasswordError}
                </div>
              )}

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
