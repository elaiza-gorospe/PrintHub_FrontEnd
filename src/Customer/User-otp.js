import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './User-otp.css';

function UserOtpPage() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  if (!email) {
    navigate('/user-register');
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp) {
      setError('Please enter the OTP');
      return;
    }

    setLoading(true);

    try {
      // 1) verify OTP
      const response = await fetch('http://localhost:3000/api/register/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'OTP verification failed');
        setLoading(false);
        return;
      }

      // 2) get pending registration data (saved by User-regis.js)
      const saved = localStorage.getItem('pending_registration');

      if (!saved) {
        setError('Registration data missing. Please register again.');
        setLoading(false);
        return;
      }

      let regData;
      try {
        regData = JSON.parse(saved);
      } catch {
        setError('Registration data invalid. Please register again.');
        setLoading(false);
        return;
      }

      // safety: must match the email we verified
      if (!regData?.email || regData.email !== email) {
        setError('Email mismatch. Please register again.');
        setLoading(false);
        return;
      }

      // 3) complete registration (insert into DB)
      const completeRes = await fetch('http://localhost:3000/api/register/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData),
      });

      const completeData = await completeRes.json();

      if (!completeRes.ok) {
        setError(completeData.message || 'Registration failed');
        setLoading(false);
        return;
      }

      // clear saved registration
      localStorage.removeItem('pending_registration');

      alert('Account verified successfully!');
      navigate('/user-login');

    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-otp-container">
      <div className="otp-card">
        <div className="otp-header">
          <h2>Email Verification</h2>
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
            disabled={loading}
          />

          <button type="submit" className="otp-button" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div className="otp-footer">
          Didn’t receive the code? Check your spam folder.
        </div>
      </div>
    </div>
  );
}

export default UserOtpPage;
