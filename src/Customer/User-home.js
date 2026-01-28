import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@heroui/react';
import './User-home.css';

function UserHomePage() {
    const navigate = useNavigate();

    return(
        <div className="user-home-container">
            <nav className="user-home-navbar">
                <div className="user-home-logo" onClick={() => navigate('/')}>PMG</div>
                <Button 
                  color="danger" 
                  size="sm"
                  onClick={() => navigate('/')}
                >
                  Logout
                </Button>
            </nav>

            <header className="user-home-header">
                <h1>Welcome to PMG Customer Portal</h1>
                <p>Your gateway to seamless printing solutions</p>
            </header>
        </div>
    );
}

export default UserHomePage;

