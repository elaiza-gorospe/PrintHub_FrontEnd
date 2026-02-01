import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin-dashboard.css';
import AdminProfile from './Admin-profile';


function AdminDashboard() {
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeItem, setActiveItem] = useState('dashboard');

    const menuItems = [
        { id: 'profile', label: 'Profile', path: '/admin-profile' },
        { id: 'orders', label: 'Orders', path: '/admin/orders' },
        { id: 'products', label: 'Products', path: '/admin/products' },
        { id: 'customers', label: 'Manage Accounts', path: '/admin/customers' },
        { id: 'settings', label: 'Settings', path: '/admin/settings' },
    ];

    const handleMenuItemClick = (item) => {
        setActiveItem(item.id);
        if(item.path){
            navigate(item.path);
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

        setTimeout(() => {
            navigate('/');
          }, 100);

          alert('You have been logged out successfully!');
    };

    return (
        <div className="admin-dashboard">
            {/* Sidebar */}
            <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
                <div className='sidebar-header'>
                    {!isCollapsed && <h2 className="sidebar-title">Admin Panel</h2>}
                    <button 
                        className="collapse-btn" 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                    >
                        {isCollapsed ? '→' : '←'}
                    </button>
                </div>

                {/* User Info (visible when expanded) */}
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

                {/* Collapsed User (visible when collapsed) */}
                {isCollapsed && (
                    <div className="user-collapsed">
                        <div className="avatar-small">A</div>
                    </div>
                )}

                {/* Main Menu Items */}
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

                {/* Bottom Section */}
                <div className="sidebar-bottom">
                    <button 
                        className="logout-btn"
                        onClick={() => handleLogout('/logout')}
                        title={isCollapsed ? 'Logout' : ''}
                    >
                        {!isCollapsed && 'Logout'}
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="dashboard-content">
                {/* Top Navigation */}
                <header className="dashboard-header">
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

                {/* Dashboard Content */}
                <div className="content-wrapper">
                    <div className="content-grid">
                        {/* Stats Cards */}
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

                        {/* Recent Activity */}
                        <div className="recent-activity">
                            <h2>Recent Activity</h2>
                            <div className="activity-list">
                                <div className="activity-item">
                                    <div className="activity-content">
                                        <p><strong>New order #12345</strong> has been placed</p>
                                        <span className="activity-time">10 minutes ago</span>
                                    </div>
                                </div>
                                <div className="activity-item">
                                    <div className="activity-content">
                                        <p><strong>User registration</strong> completed successfully</p>
                                        <span className="activity-time">1 hour ago</span>
                                    </div>
                                </div>
                                <div className="activity-item">
                                    <div className="activity-content">
                                        <p><strong>Product "Premium Plan"</strong> has been updated</p>
                                        <span className="activity-time">2 hours ago</span>
                                    </div>
                                </div>
                                <div className="activity-item">
                                    <div className="activity-content">
                                        <p><strong>Payment received</strong> for invoice #7890</p>
                                        <span className="activity-time">3 hours ago</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="quick-actions">
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
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AdminDashboard;