import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin-profile.css';   

function AdminProfile(){

    const navigate = useNavigate();

    const [admin, setAdmin] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "admin@printhub.com",
    role: "Store Manager",
    birthday: "2002-01-15",
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    setAdmin({ ...admin, [e.target.name]: e.target.value });
  };

  const handleEdit = () => setIsEditing(true);

  const handleSave = () => {
    setIsEditing(false);
    alert("Profile Updated Successfully!");
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

          <div className="form-row">
            <label>Birthday</label>
            <input
              type="date"
              name="birthday"
              value={admin.birthday}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;
