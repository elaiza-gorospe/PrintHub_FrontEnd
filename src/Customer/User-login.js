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

    // 🔹 reset password states (kept - not used in this new flow, but unchanged as you had it)
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetError, setResetError] = useState('');
    const [resetSuccess, setResetSuccess] = useState('');

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
                setLoginAttempts((prev) => prev + 1);

                if (loginAttempts + 1 >= 3) {
                    setShowForgotModal(true);
                }

                setError(data.message || 'Login failed');
                return;
            }

            setLoginAttempts(0);

            // ✅ SAVE LOGGED IN USER (so Admin-dashboard can read role)
            localStorage.setItem('user', JSON.stringify(data.user));

            // ✅ Role routing: admin/staff/customer
            if (data.user.role === 'admin') {
                navigate('/admin-dashboard');
            } else if (data.user.role === 'staff') {
                navigate('/admin-dashboard'); // staff uses same dashboard but no Manage Accounts
            } else {
                navigate('/user-home'); // customer
            }

        } catch (err) {
            setError('Network error, please try again later');
        }
    };

    // ✅ Send OTP for Forgot Password (NEW)
    const handleForgotSendOtp = async () => {
        setError('');

        if (!email) {
            setError('Please enter your email');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/password/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Failed to send OTP');
                return;
            }

            setShowForgotModal(false);
            navigate('/user-forgot-otp', { state: { email } });

        } catch (err) {
            setError('Network error, please try again later');
        }
    };

    return (
        <div className="user-login-container">
            <button className="back-button" onClick={() => navigate("/")}>
                ← Back
            </button>

            <div className="login-split">
                <div className="login-form-section">
                    <div className="login-card">
                        <div className="login-header">
                            <h1>Login</h1>
                            <p>Sign in to your account</p>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="customer@example.com"
                                />
                            </div>

                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                />
                            </div>

                            <div className="form-options">
                                {/* ✅ make it open modal */}
                                <span
                                    className="forgot-password"
                                    onClick={() => setShowForgotModal(true)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    Forgot password?
                                </span>
                            </div>

                            <button type="submit" className="login-button">
                                Sign In
                            </button>
                        </form>

                        <div className="login-footer">
                            <p>
                                Don't have an account?{' '}
                                <a onClick={() => navigate('/user-register')}>Create one here</a>
                            </p>
                        </div>
                    </div>
                </div>

                <div
                    className="login-image-section"
                    style={{
                        backgroundImage: `url(${backgroundImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
            </div>

            {/* 🔹 Forgot Password Modal */}
            {showForgotModal && (
                <div className="forgot-password-modal">
                    <div className="modal-content">
                        <h2>Forgot your password?</h2>
                        <p>We will send you an OTP via email to reset your password</p>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                            />
                        </div>

                        <button className="modal-button" onClick={handleForgotSendOtp}>
                            Confirm
                        </button>

                        <button
                            className="modal-button cancel"
                            onClick={() => setShowForgotModal(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserLoginPage;
