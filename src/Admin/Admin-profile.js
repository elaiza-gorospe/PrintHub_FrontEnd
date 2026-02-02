import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin-profile.css';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';

function AdminProfile() {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    birthday: "",
    gender: "", // ✅ added
  });

  const [isEditing, setIsEditing] = useState(false);

  // ✅ Change password modal state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [changePassError, setChangePassError] = useState("");
  const [changePassSuccess, setChangePassSuccess] = useState("");

  // ✅ eye toggles for change password modal
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // ✅ criteria for change password modal (same rules)
  const [cpCriteria, setCpCriteria] = useState({
    uppercase: false,
    number: false,
    special: false,
    length: false,
  });

  // ✅ ADDED: OTP sending loading
  const [otpLoading, setOtpLoading] = useState(false);

  // ✅ Load profile from DB
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) return;

    let user;
    try {
      user = JSON.parse(stored);
    } catch {
      return;
    }

    if (!user?.id) return;

    fetch(`http://localhost:3000/api/user-profile/${user.id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to load profile");

        const fullName = data.name || "";
        const parts = fullName.trim().split(" ");
        const firstName = parts[0] || "";
        const lastName = parts.slice(1).join(" ") || "";

        setAdmin({
          firstName,
          lastName,
          email: user.email || "",
          role: user.role || "",
          birthday: data.birthday || "",
          gender: data.gender || "",
        });
      })
      .catch((err) => {
        console.error(err);
        alert(err.message || "Error loading profile");
      });
  }, []);

  const handleChange = (e) => {
    setAdmin({ ...admin, [e.target.name]: e.target.value });
  };

  const handleEdit = () => setIsEditing(true);

  const handleSave = async () => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      alert("No logged-in user found.");
      return;
    }

    let user;
    try {
      user = JSON.parse(stored);
    } catch {
      alert("Invalid user session.");
      return;
    }

    if (!user?.id) {
      alert("User ID missing.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/user-profile/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${admin.firstName} ${admin.lastName}`.trim(),

          // ✅ ADDED ONLY: send email so server can update it
          email: admin.email,

          birthday: admin.birthday,
          gender: admin.gender,
          phone: "+63" + "0000000000",
          address: ""
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to update profile");

      localStorage.setItem("user", JSON.stringify({
        ...user,
        firstName: admin.firstName,
        email: admin.email,
      }));

      setIsEditing(false);
      alert("Profile Updated Successfully!");
    } catch (err) {
      console.error(err);
      alert(err.message || "Error updating profile");
    }
  };

  // ✅ update criteria as user types new password
  const handleCpNewPasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);

    setCpCriteria({
      uppercase: /[A-Z]/.test(value),
      number: /\d/.test(value),
      special: /[^A-Za-z0-9]/.test(value),
      length: value.length >= 8 && value.length <= 12,
    });
  };

  const cpPasswordValid = () =>
    cpCriteria.uppercase && cpCriteria.number && cpCriteria.special && cpCriteria.length;

  const renderCpCriteria = (text, ok) => (
    <p className={`cp-criteria-item ${ok ? "ok" : ""}`} key={text}>
      {ok ? "✅" : "❌"} {text}
    </p>
  );

  const openChangePassword = () => {
    setShowChangePassword(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setChangePassError("");
    setChangePassSuccess("");

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
    setCpCriteria({
      uppercase: false,
      number: false,
      special: false,
      length: false,
    });
  };

  const closeChangePassword = () => {
    setShowChangePassword(false);
    setChangePassError("");
    setChangePassSuccess("");
  };

  // ✅ ADDED: helper to get logged-in email
  const getLoggedInEmail = () => {
    const stored = localStorage.getItem("user");
    if (!stored) return "";
    try {
      const u = JSON.parse(stored);
      return u?.email || "";
    } catch {
      return "";
    }
  };

  // ✅ ADDED: Send OTP then go to existing OTP page
  const handleSendOtpForPassword = async () => {
    setChangePassError("");
    setChangePassSuccess("");

    const email = getLoggedInEmail();
    if (!email) {
      setChangePassError("No email found. Please login again.");
      return;
    }

    setOtpLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setChangePassError(data?.message || "Failed to send OTP");
        return;
      }

      setChangePassSuccess("OTP sent! Please enter it on the OTP page.");
      navigate("/user-forgot-otp", { state: { email } });
    } catch (err) {
      setChangePassError("Network error while sending OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  // ✅ Submit change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangePassError("");
    setChangePassSuccess("");

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setChangePassError("All fields are required.");
      return;
    }

    if (!cpPasswordValid()) {
      setChangePassError("New password does not meet the criteria.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setChangePassError("New password and confirm password do not match.");
      return;
    }

    if (newPassword === currentPassword) {
      setChangePassError("New password must be different from current password.");
      return;
    }

    const stored = localStorage.getItem('user');
    if (!stored) {
      setChangePassError("No logged-in user found.");
      return;
    }

    let user;
    try {
      user = JSON.parse(stored);
    } catch {
      setChangePassError("Invalid user session.");
      return;
    }

    if (!user?.id) {
      setChangePassError("User ID missing.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/profile/${user.id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok && (res.status === 403 || String(data?.message || "").toLowerCase().includes("otp"))) {
        const email = user?.email || getLoggedInEmail();
        setChangePassError("OTP verification required. Sending you to OTP page...");
        if (email) navigate("/user-forgot-otp", { state: { email } });
        return;
      }

      if (!res.ok) throw new Error(data?.message || "Failed to change password");

      setChangePassSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

      setCpCriteria({
        uppercase: false,
        number: false,
        special: false,
        length: false,
      });
    } catch (err) {
      setChangePassError(err.message || "Error changing password");
    }
  };

  return (
    <div className="admin-profile">

      <button className="back-button" onClick={() => navigate('/admin-dashboard')}>
        ← Back to Dashboard
      </button>

      <div className="profile-card">

        {/* TOP DISPLAY */}
        <div className="profile-top">
          <div className="profile-avatar">
            <span>👤</span>
          </div>

          <div className="profile-summary">
            <h2 className="profile-name">
              {admin.firstName} {admin.lastName}
            </h2>
            <p className="profile-role">{admin.role}</p>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="profile-actions">
          <button
            className="edit-button"
            onClick={handleEdit}
            disabled={isEditing}
          >
            Edit
          </button>

          <button
            className="save-button"
            onClick={handleSave}
            disabled={!isEditing}
          >
            Save
          </button>

          <button
            className="change-password-button"
            onClick={openChangePassword}
          >
            Change Password
          </button>
        </div>

        {/* EDITABLE TABLE / FORM */}
        <div className="profile-form">

          <div className="form-row">
            <label>First Name</label>
            <input
              type="text"
              name="firstName"
              value={admin.firstName}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-row">
            <label>Last Name</label>
            <input
              type="text"
              name="lastName"
              value={admin.lastName}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-row">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={admin.email}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-row">
            <label>Role</label>
            <input
              type="text"
              name="role"
              value={admin.role}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          {/* ✅ Gender */}
          <div className="form-row">
            <label>Gender</label>
            <select
              name="gender"
              value={admin.gender}
              onChange={handleChange}
              disabled={!isEditing}
            >
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div className="form-row">
            <label>Birthday</label>
            <input
              type="date"
              name="birthday"
              value={admin.birthday}
              onChange={handleChange}
              disabled={!isEditing}
              max="2010-12-31"
            />
          </div>

        </div>
      </div>

      {/* ✅ Change Password Modal */}
      {showChangePassword && (
        <div className="cp-modal-overlay" onClick={closeChangePassword}>
          <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="cp-title">Change Password</h3>

            {/* ✅ Send OTP button ONLY (form removed) */}
            <button
              type="button"
              className="cp-save"
              onClick={handleSendOtpForPassword}
              disabled={otpLoading}
              style={{ marginBottom: "10px", width: "100%" }}
            >
              {otpLoading ? "Sending OTP..." : "Send OTP"}
            </button>

            {/* ✅ optional: keep your feedback messages */}
            {changePassError && <p className="cp-error">{changePassError}</p>}
            {changePassSuccess && <p className="cp-success">{changePassSuccess}</p>}

          </div>
        </div>
      )}

    </div>
  );
}

export default AdminProfile;
