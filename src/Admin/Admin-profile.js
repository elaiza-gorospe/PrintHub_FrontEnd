import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin-profile.css';

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

    fetch(`http://localhost:3000/api/profile/${user.id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to load profile");
        setAdmin({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          role: data.role || "",
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
      const res = await fetch(`http://localhost:3000/api/profile/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(admin),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to update profile");

      // ✅ optional: keep localStorage in sync for sidebar greeting
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

          {/* ✅ NEW: Gender */}
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
              max="2010-12-31"   // ✅ only year below 2011
            />
          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminProfile;
