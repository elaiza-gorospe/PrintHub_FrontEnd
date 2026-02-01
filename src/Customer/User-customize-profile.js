import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./User-customize-profile.css";

function UserCustomizeProfile() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    birthday: "",
    gender: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("userProfile");
    if (saved) {
      try {
        setForm(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    localStorage.setItem("userProfile", JSON.stringify(form));
    alert("Profile updated!");
    navigate("/user-home");
  };

  return (
    <div className="ucp-page">
      <div className="ucp-topbar">
        <button className="ucp-back" type="button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1 className="ucp-title">Customize Profile</h1>
      </div>

      <div className="ucp-card">
        <div className="ucp-row">
          <label className="ucp-label">Name</label>
          <input
            className="ucp-input"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your full name"
          />
        </div>

        <div className="ucp-row">
          <label className="ucp-label">Birthday</label>
          <input
            className="ucp-input"
            type="date"
            name="birthday"
            value={form.birthday}
            onChange={handleChange}
          />
        </div>

        <div className="ucp-row">
          <label className="ucp-label">Gender</label>
          <select
            className="ucp-input"
            name="gender"
            value={form.gender}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Prefer not to say">Prefer not to say</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="ucp-row">
          <label className="ucp-label">Phone Number</label>
          <input
            className="ucp-input"
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+63xxxxxxxxxx"
          />
        </div>

        <div className="ucp-row">
          <label className="ucp-label">Address</label>
          <textarea
            className="ucp-textarea"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="House No., Street, Barangay, City, Province"
          />
        </div>

        <div className="ucp-actions">
          <button className="ucp-cancel" type="button" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button className="ucp-save" type="button" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserCustomizeProfile;
