import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin-profile.css';   

function AdminProfile(){

    const navigate = useNavigate();

    return(
        <div className='admin-profile'>
            <button className="back-button" onClick={() => {navigate('/admin/dashboard')}}>← Back to Dashboard</button>
        </div>
    );

}

export default AdminProfile;
