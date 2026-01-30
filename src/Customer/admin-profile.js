import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './admin-profile.css';

function AdminProfile() {

    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);

    const [adminData, setAdminData] = useState({
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'Administrator',
        joined: 'January 1, 2023',
    });

    const handleChange = (e) => {
        setAdminData({
            ...adminData,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = () => {
        // Save changes here (API call can be added)
        setIsEditing(false);
        alert('Profile updated successfully!');
    };

    const handleCancel = () => {
        // Cancel editing (you may reset to previous values if needed)
        setIsEditing(false);
    };

    return (
        <div className='admin-profile'>
            <button className="back-button" onClick={() => navigate('/admin-dashboard')}>← Back to Dashboard</button>
            
            <div className="profile-card">
                <div className="profile-header">
                    <div className="avatar-circle">AD</div>
                    
                    <div className="profile-info">
                        {isEditing ? (
                            <>
                                <label>Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={adminData.name}
                                    onChange={handleChange}
                                    className="edit-input"
                                />
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={adminData.email}
                                    onChange={handleChange}
                                    className="edit-input"
                                />
                                <label>Role</label>
                                <input
                                    type="text"
                                    name="role"
                                    value={adminData.role}
                                    onChange={handleChange}
                                    className="edit-input"
                                />
                                <p className="joined">Joined: {adminData.joined}</p>

                                <div className="edit-buttons">
                                    <button className="save-btn" onClick={handleSave}>Save</button>
                                    <button className="cancel-btn" onClick={handleCancel}>Back</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2>{adminData.name}</h2>
                                <p className="role">{adminData.role}</p>
                                <p className="email">{adminData.email}</p>
                                <p className="joined">Joined: {adminData.joined}</p>
                                <button
                                    className="edit-btn"
                                    onClick={() => setIsEditing(true)}
                                >
                                    Edit Profile
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminProfile;
