import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/images/pmg-image.jpg';
import './User-login.css';


function UserLoginPage() {
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
      setError('Please enter a valid email address');
      return;
    }

    // TODO: Replace with actual API call
    console.log('User login attempt:', { email, password, rememberMe });
    
    // Simulate successful login
    alert('Login successful!');
    navigate('/user-home');
  };

  return (
    <div className="user-login-container">
        <button className="back-button" onClick={() => navigate(-1)} title="Go back">
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

                <button type="submit" className="login-button" onClick={() => navigate('/user-home')}>Sign In</button>
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
    </div>
  );
}

export default UserLoginPage;
