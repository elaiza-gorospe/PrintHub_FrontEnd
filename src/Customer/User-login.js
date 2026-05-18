import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./User-login.css";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import backgroundImage from "../assets/images/pmg-image.jpg";
import { buildApiUrl } from "../config/api";
import AppModal from "../components/AppModal";

function UserLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [reactivateOtp, setReactivateOtp] = useState("");
  const [reactivateMsg, setReactivateMsg] = useState("");
  const [noticeModal, setNoticeModal] = useState(null);

  const blockClipboard = (e) => {
    e.preventDefault();
  };

  const saveLoggedInUser = (loggedInUser) => {
    const role = String(loggedInUser?.role || "").toLowerCase();

    if (role === "admin" || role === "staff") {
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
      localStorage.setItem("adminUser", JSON.stringify(loggedInUser));
      navigate("/admin-dashboard");
      return;
    }

    localStorage.removeItem("adminUser");
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    localStorage.setItem("userId", loggedInUser.id);
    navigate(location.state?.from || "/user-home", { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      const response = await fetch(buildApiUrl("/api/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await response.json();

      if (response.status === 403 && data.needsReactivation) {
        setReactivateMsg(data.message || "");
        setShowReactivateModal(true);
        return;
      }

      if (!response.ok) {
        const nextAttempts = loginAttempts + 1;
        setLoginAttempts(nextAttempts);
        if (nextAttempts >= 3) {
          setShowForgotModal(true);
        }
        setError(data.message || "Login failed");
        return;
      }

      setLoginAttempts(0);
      saveLoggedInUser(data.user);
    } catch (err) {
      setError("Network error, please try again later");
    }
  };

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

      setNoticeModal({
        title: "Account reactivated",
        message: "Please login again.",
        tone: "success",
      });
    } catch (e) {
      setError("Network error");
    }
  };

  return (
    <div className="user-login-container">
      <div className="auth-ink-drops" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <button
        className="back-button auth-back-button"
        onClick={() => {
          if (location.state?.from) navigate(location.state.from, { replace: true });
          else if (window.history.length > 1) navigate(-1);
          else navigate("/");
        }}
      >
        ← Back
      </button>

      <div className="login-split">
        <div className="login-form-section">
          <div className="login-card">
            <div className="auth-mini-brand">
              <span>P</span>
              <strong>PrintHub</strong>
            </div>
            <div className="login-header">
              <h1>Welcome Back</h1>
              <p>Sign in and keep your print orders moving.</p>
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
                <label>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember me
                </label>
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
                <button
                  type="button"
                  className="auth-text-link"
                  onClick={() => navigate("/user-register")}
                >
                  Create one here
                </button>
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
        >
          <div className="auth-visual-card">
            <div className="auth-bg-type" aria-hidden="true">PRINT CREATE DESIGN CUSTOMIZE</div>
            <div className="auth-marquee" aria-hidden="true">
              <span>CUSTOM APPAREL • PRINTING • PACKAGING • STICKERS • SIGNAGE • </span>
              <span>CUSTOM APPAREL • PRINTING • PACKAGING • STICKERS • SIGNAGE • </span>
            </div>
            <div className="auth-product-cloud" aria-hidden="true">
              <i className="auth-mock-shirt" />
              <i className="auth-mock-card" />
              <i className="auth-mock-sticker" />
              <i className="auth-mock-dieline" />
              <i className="auth-mock-brochure" />
            </div>
            <span>PMG PRINTING HOUSE</span>
            <h2 className="auth-kinetic-title">
              {["Print-ready", "ideas,", "made", "local."].map((word, index) => (
                <b key={word} style={{ "--word-delay": `${index * 0.09}s` }}>{word}</b>
              ))}
            </h2>
            <p>
              Custom shirts, signage, paper prints, IDs, mugs, machines, and
              supplies in one hands-on printing shop.
            </p>
            <div className="auth-color-row" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
        </div>
      </div>

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

      <AppModal
        open={Boolean(noticeModal)}
        title={noticeModal?.title}
        message={noticeModal?.message}
        tone={noticeModal?.tone}
        onConfirm={() => setNoticeModal(null)}
      />
    </div>
  );
}

export default UserLoginPage;
