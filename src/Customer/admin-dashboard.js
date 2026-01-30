import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './admin-dashboard.css';
import AdminProfile from './admin-profile';

function AdminDashboard() {
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeItem, setActiveItem] = useState('dashboard');

    // ✅ added (mobile sidebar state)
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // ✅ added (swipe tracking)
    let touchStartX = 0;
    let touchEndX = 0;

    const menuItems = [
        {id: 'profile', label: 'Profile', path: '/admin-profile'},
        {id: 'dashboard', label: 'Dashboard', path: '/admin-dashboard'},
        {id: 'orders', label: 'Orders', path: '/admin/orders'},
        {id: 'products', label: 'Products', path: '/admin/products'},
        {id: 'customers', label: 'Customers', path: '/admin/customers'},
        {id: 'analytics', label: 'Analytics', path: '/admin/analytics'},
        {id: 'settings', label: 'Settings', path: '/admin/settings'},
    ];

    const handleMenuItemClick = (item) => {
        setActiveItem(item.id);
        if (item.path) {
            navigate(item.path);
            setIsMobileOpen(false); // ✅ close on mobile
        }
    };

    const handleLogout = () => {
        console.log('Logging out...');

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');

        sessionStorage.clear();

        document.cookie.split(";").forEach(function(c) {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        setActiveItem('App');
        setIsCollapsed(false);
        setIsMobileOpen(false);

        setTimeout(() => {
            navigate('/');
        }, 100);

        alert('You have been logged out successfully!');
    };

    // ✅ swipe handlers
    const handleTouchStart = (e) => {
        touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchMove = (e) => {
        touchEndX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = () => {
        if (touchStartX - touchEndX > 50) {
            setIsMobileOpen(false); // swipe left → close
        }
        if (touchEndX - touchStartX > 50) {
            setIsMobileOpen(true); // swipe right → open
        }
    };

    return (
        <div className="admin-dashboard">

            {/* Sidebar */}
            <div
                className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className='sidebar-header'>
                    {!isCollapsed && <h2 className="sidebar-title">Admin Panel</h2>}
                    <button
                        className="collapse-btn"
                        onClick={() => {
                            setIsCollapsed(!isCollapsed);
                            setIsMobileOpen(false);
                        }}
                        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                    >
                        {isCollapsed ? '→' : '←'}
                    </button>
                </div>

                {!isCollapsed && (
                    <div className="user-info">
                        <div className="user-avatar">
                            <div className="avatar-circle">AD</div>
                        </div>
                        <div className="user-details">
                            <h4 className="user-name">Admin User</h4>
                            <p className="user-role">Administrator</p>
                        </div>
                    </div>
                )}

                {isCollapsed && (
                    <div className="user-collapsed">
                        <div className="avatar-small">A</div>
                    </div>
                )}

                <nav className="sidebar-menu">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            className={`menu-item ${activeItem === item.id ? 'active' : ''}`}
                            onClick={() => handleMenuItemClick(item)}
                            title={isCollapsed ? item.label : ''}
                        >
                            {!isCollapsed && <span className="menu-label">{item.label}</span>}
                            {isCollapsed && <span className="menu-label-collapsed">{item.label.charAt(0)}</span>}
                        </button>
                    ))}
                </nav>

                <div className="sidebar-bottom">
                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                        title={isCollapsed ? 'Logout' : ''}
                    >
                        {!isCollapsed && 'Logout'}
                    </button>
                </div>
            </div>

            {/* ✅ dark overlay */}
            {isMobileOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <main className="dashboard-content">

                <header className="dashboard-header">
                    {/* ✅ mobile menu button */}
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setIsMobileOpen(true)}
                    >
                        ☰
                    </button>

                    <div className="header-left">
                        <h1>Dashboard</h1>
                        <p className="subtitle">Welcome back, Admin!</p>
                    </div>

                    <div className="header-right">
                        <div className="stats-summary">
                            <span className="stat-item">📊 1,234 Users</span>
                            <span className="stat-item">💰 $45,678</span>
                            <span className="stat-item">📦 567 Orders</span>
                        </div>
                    </div>
                </header>

                <div className="content-wrapper">
                    <div className="content-grid">
                        <div className="stats-card">
                            <h3>Total Revenue</h3>
                            <p className="stat-number">$45,678</p>
                        </div>

                        <div className="stats-card">
                            <h3>New Users</h3>
                            <p className="stat-number">1,234</p>
                        </div>

                        <div className="stats-card">
                            <h3>Orders</h3>
                            <p className="stat-number">567</p>
                        </div>

                        <div className="stats-card">
                            <h3>Conversion Rate</h3>
                            <p className="stat-number">3.4%</p>
                        </div>

                        <div className="recent-activity">
                            <h2>Recent Activity</h2>
                            {/* <div className="activity-list">
                                <div className="activity-item">
                                    <div className="activity-content">
                                        <p><strong>New order #12345</strong> has been placed</p>
                                        <span className="activity-time">10 minutes ago</span>
                                    </div>
                                </div>
                            </div> */}
                        </div>

                        {/* <div className="quick-actions">
                            <h2>Quick Actions</h2>
                            <div className="actions-grid">
                                <button className="action-btn" onClick={() => navigate('/admin/products/add')}>
                                    Add New Product
                                </button>
                                <button className="action-btn" onClick={() => navigate('/admin/analytics')}>
                                    View Analytics
                                </button>
                                <button className="action-btn" onClick={() => navigate('/admin/settings')}>
                                    System Settings
                                </button>
                                <button className="action-btn" onClick={() => navigate('/admin/users')}>
                                    Manage Users
                                </button>
                            </div>
                        </div> */}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AdminDashboard;
