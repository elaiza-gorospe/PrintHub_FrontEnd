import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './User-otp.css';

function UserForgotOtpPage() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  if (!email) {
    navigate('/user-login');
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp) {
      setError('Please enter the OTP');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/password/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'OTP verification failed');
        return;
      }

      navigate('/user-reset-password', { state: { email } });

    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="user-otp-container">
      <div className="otp-card">
        <div className="otp-header">
          <h2>Password Reset</h2>
          <p>Enter the OTP sent to <strong>{email}</strong></p>
        </div>

        {error && <div className="otp-error">{error}</div>}

        <form onSubmit={handleVerify}>
          <input
            type="text"
            className="otp-input"
            placeholder="● ● ● ● ● ●"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
          />

          <button type="submit" className="otp-button">
            Enter
          </button>
        </form>

        <div className="otp-footer">
          Didn’t receive the code? Check your spam folder.
        </div>
      </div>
    </div>
  );
}

export default UserForgotOtpPage;
