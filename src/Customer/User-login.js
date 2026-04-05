// User-login.js (FULL UPDATED FILE — adds Reactivation OTP modal + logic, no UI/layout changes)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/images/pmg-image.jpg";
import "./User-login.css";
import { MdVisibility, MdVisibilityOff } from "react-icons/md"; // ✅ ADD
import { buildApiUrl } from "../config/api";

function UserLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const [loginAttempts, setLoginAttempts] = useState(0);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // ✅ show/hide password
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Reactivation OTP modal states (NEW)
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [reactivateOtp, setReactivateOtp] = useState("");
  const [reactivateMsg, setReactivateMsg] = useState("");

  const blockClipboard = (e) => {
    e.preventDefault();
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please fill in Email field");
      return;
    } else if (!password) {
      setError("Please fill in Password field");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      const response = await fetch(buildApiUrl("/api/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // ✅ archived account -> show reactivation OTP modal
        if (data?.needsReactivation) {
          setReactivateMsg(
            data.message ||
              "This account is archived. OTP sent for reactivation.",
          );
          setShowReactivateModal(true);
          return;
        }

        setLoginAttempts((prev) => prev + 1);

        if (loginAttempts + 1 >= 3) {
          setShowForgotModal(true);
        }

        setError(data.message || "Login failed");
        return;
      }

      setLoginAttempts(0);

      // ✅ SAVE LOGGED IN USER (so Admin-dashboard can read role)
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userId", data.user.id); // ✅ Store userId for cart/orders

      // ✅ Role routing: admin/staff/customer
      if (data.user.role === "admin") {
        navigate("/admin-dashboard");
      } else if (data.user.role === "staff") {
        navigate("/admin-dashboard"); // staff uses same dashboard but no Manage Accounts
      } else {
        navigate("/user-home"); // customer
      }
    } catch (err) {
      setError("Network error, please try again later");
    }
  };

  // ✅ Send OTP for Forgot Password (existing)
  const handleForgotSendOtp = async () => {
    setError("");

    if (!email) {
      setError("Please enter your email");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      const response = await fetch(buildApiUrl("/api/password/send-otp"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to send OTP");
        return;
      }

      setShowForgotModal(false);
      navigate("/user-forgot-otp", { state: { email } });
    } catch (err) {
      setError("Network error, please try again later");
    }
  };

  // ✅ Verify Reactivation OTP (NEW)
  const handleVerifyReactivationOtp = async () => {
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!reactivateOtp || reactivateOtp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    try {
      const res = await fetch(buildApiUrl("/api/reactivate/verify-otp"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: reactivateOtp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Reactivation failed");
        return;
      }

      setShowReactivateModal(false);
      setReactivateOtp("");
      setReactivateMsg("");
      setError("");

      alert("Account reactivated! Please login again.");
    } catch (e) {
      setError("Network error");
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

              {/* ✅ PASSWORD WITH EYE ICON */}
              <div className="form-group" style={{ position: "relative" }}>
                <label>Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  onPaste={blockClipboard}
                  onCopy={blockClipboard}
                  onCut={blockClipboard}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="show-password-button"
                  style={{ paddingTop: "35px" }}
                >
                  {showPassword ? (
                    <MdVisibilityOff size={22} color="#555" />
                  ) : (
                    <MdVisibility size={22} color="#555" />
                  )}
                </button>
              </div>

              <div className="form-options">
                {/* ✅ open modal */}
                <span
                  className="forgot-password"
                  onClick={() => setShowForgotModal(true)}
                  style={{ cursor: "pointer" }}
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
                Don't have an account?{" "}
                <a onClick={() => navigate("/user-register")}>
                  Create one here
                </a>
              </p>
            </div>
          </div>
        </div>

        <div
          className="login-image-section"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </div>

      {/* 🔹 Forgot Password Modal (EXISTING) */}
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

      {/* ✅ Reactivation OTP Modal (NEW) */}
      {showReactivateModal && (
        <div className="forgot-password-modal">
          <div className="modal-content">
            <h2>Reactivate Account</h2>
            <p>
              {reactivateMsg ||
                "This account is archived. Enter the OTP sent to your email to reactivate it."}
            </p>

            <div className="form-group">
              <label>OTP</label>
              <input
                type="text"
                value={reactivateOtp}
                onChange={(e) =>
                  setReactivateOtp(e.target.value.replace(/\D/g, ""))
                }
                maxLength={6}
                placeholder="Enter 6-digit OTP"
              />
            </div>

            <button
              className="modal-button"
              onClick={handleVerifyReactivationOtp}
            >
              Verify OTP
            </button>

            <button
              className="modal-button cancel"
              onClick={() => {
                setShowReactivateModal(false);
                setReactivateOtp("");
                setReactivateMsg("");
              }}
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
