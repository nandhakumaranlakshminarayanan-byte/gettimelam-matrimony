import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { admin, logout } = useAdmin();

    const menuItems = [
        { path: '/dashboard', icon: '📊', label: 'Dashboard' },
        { path: '/users', icon: '👥', label: 'Users' },
        { path: '/profiles', icon: '👤', label: 'Profiles' },
        { path: '/bookings', icon: '📅', label: 'Bookings' },
        { path: '/plans', icon: '💳', label: 'Plans' },
        { path: '/testimonials', icon: '💍', label: 'Success Stories' },
        { path: '/analytics', icon: '📈', label: 'Analytics' },
        { path: '/notifications', icon: '🔔', label: 'Notifications' },
        { path: '/banners', icon: '🎨', label: 'Banners' },
        { path: '/messages', icon: '💬', label: 'Messages' },
        { path: '/services', icon: '🛍️', label: 'Services' },
    ];
    return (
        <div style={styles.sidebar}>
            {/* Logo */}
            <div style={styles.logo}>
                <div style={styles.logoIcon}>🛡️</div>
                <div>
                    <div style={styles.logoText}>Gettimelam</div>
                    <div style={styles.logoSub}>Admin Panel</div>
                </div>
            </div>

            {/* Admin Info */}
            <div style={styles.adminInfo}>
                <div style={styles.adminAvatar}>👤</div>
                <div>
                    <div style={styles.adminName}>{admin?.name}</div>
                    <div style={styles.adminRole}>🛡️ Administrator</div>
                </div>
            </div>

            {/* Menu */}
            <div style={styles.menu}>
                {menuItems.map(item => (
                    <div
                        key={item.path}
                        style={{
                            ...styles.menuItem,
                            ...(location.pathname === item.path ? styles.menuItemActive : {})
                        }}
                        onClick={() => navigate(item.path)}
                    >
                        <span style={styles.menuIcon}>{item.icon}</span>
                        <span>{item.label}</span>
                    </div>
                ))}
            </div>

            {/* Bottom */}
            <div style={styles.bottom}>
                <div
                    style={styles.menuItem}
                    onClick={() => window.open('http://localhost:3000', '_blank')}
                >
                    <span style={styles.menuIcon}>🌐</span>
                    <span>View Website</span>
                </div>
                <div
                    style={{ ...styles.menuItem, color: '#FF6B6B' }}
                    onClick={logout}
                >
                    <span style={styles.menuIcon}>🚪</span>
                    <span>Logout</span>
                </div>
            </div>
        </div>
    );
};

const styles = {
    sidebar: {
        width: '240px',
        background: '#1A0A0A',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '24px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)'
    },
    logoIcon: { fontSize: '28px' },
    logoText: {
        fontFamily: "'Georgia', serif",
        fontSize: '16px',
        fontWeight: '700',
        color: '#fff'
    },
    logoSub: {
        fontSize: '11px',
        color: '#C9A84C',
        letterSpacing: '1px',
        textTransform: 'uppercase'
    },
    adminInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 20px',
        background: 'rgba(255,255,255,0.04)',
        margin: '16px 12px',
        borderRadius: '10px'
    },
    adminAvatar: { fontSize: '28px' },
    adminName: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#fff'
    },
    adminRole: {
        fontSize: '11px',
        color: '#C9A84C'
    },
    menu: {
        flex: 1,
        padding: '8px 12px'
    },
    menuItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        color: 'rgba(255,255,255,0.6)',
        marginBottom: '4px',
        transition: 'all 0.2s'
    },
    menuItemActive: {
        background: 'rgba(201,168,76,0.15)',
        color: '#C9A84C'
    },
    menuIcon: { fontSize: '18px', width: '24px' },
    bottom: {
        padding: '12px',
        borderTop: '1px solid rgba(255,255,255,0.08)'
    }
};

export default Sidebar;