import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import API from '../utils/api';
import {
    IconGrid, IconUsers, IconIdCard, IconCalendar, IconCard, IconHeart,
    IconChart, IconBell, IconImage, IconLayers, IconChat, IconStore,
    IconShield, IconGlobe, IconLogout, IconSliders, IconTag,
} from './AdminIcons';

const GOLD = '#E8B84B';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { admin, logout } = useAdmin();
    const scrollRef = useRef(null);

    // Every page mounts its own <Sidebar />, so without this it snaps back
    // to the top on every single navigation — this remembers where you
    // were scrolled to (per tab, via sessionStorage) and restores it right
    // after mount, before the browser has a chance to paint the reset.
    useEffect(() => {
        const saved = sessionStorage.getItem('adminSidebarScroll');
        if (saved && scrollRef.current) scrollRef.current.scrollTop = Number(saved);
    }, []);

    const handleSidebarScroll = (e) => {
        sessionStorage.setItem('adminSidebarScroll', e.currentTarget.scrollTop);
    };
    const [pendingCount, setPendingCount] = useState(0);
    const [newUsersCount, setNewUsersCount] = useState(0);
    const [unreadSupportCount, setUnreadSupportCount] = useState(0);

    // Visible from every admin page, not just Profile Options itself —
    // that page was the whole reason this went unnoticed before.
    useEffect(() => {
        const fetchCount = () => {
            API.get('/admin/options/pending-count')
                .then(res => setPendingCount(res.data.count || 0))
                .catch(() => { });
        };
        fetchCount();
        const interval = setInterval(fetchCount, 60000); // refresh every minute
        return () => clearInterval(interval);
    }, []);

    // New members registered since this admin last viewed Users, and
    // support threads with an unread user message — same
    // always-visible-in-sidebar treatment.
    useEffect(() => {
        const fetchCounts = () => {
            API.get('/admin/new-users-count')
                .then(res => setNewUsersCount(res.data.count || 0))
                .catch(() => { });
            API.get('/support/admin/unread-count')
                .then(res => setUnreadSupportCount(res.data.count || 0))
                .catch(() => { });
        };
        fetchCounts();
        const interval = setInterval(fetchCounts, 60000);
        // Fired by the Users page right after it marks itself seen, so the
        // badge clears the moment you visit rather than up to 60s later.
        window.addEventListener('usersSeen', fetchCounts);
        return () => {
            clearInterval(interval);
            window.removeEventListener('usersSeen', fetchCounts);
        };
    }, []);

    const menuItems = [
        { path: '/dashboard', Icon: IconGrid, label: 'Dashboard' },
        { path: '/users', Icon: IconUsers, label: 'Users' },
        { path: '/profiles', Icon: IconIdCard, label: 'Profiles' },
        { path: '/bookings', Icon: IconCalendar, label: 'Bookings' },
        { path: '/plans', Icon: IconCard, label: 'Plans' },
        { path: '/testimonials', Icon: IconHeart, label: 'Success Stories' },
        { path: '/analytics', Icon: IconChart, label: 'Analytics' },
        { path: '/notifications', Icon: IconBell, label: 'Notifications' },
        { path: '/banners', Icon: IconImage, label: 'Banners' },
        { path: '/service-categories', Icon: IconTag, label: 'Service Categories' },
        { path: '/service-cards', Icon: IconLayers, label: 'Service Cards' },
        { path: '/messages', Icon: IconChat, label: 'Messages' },
        { path: '/support-chat', Icon: IconChat, label: 'Support Chat' },
        { path: '/services', Icon: IconStore, label: 'Services' },
        { path: '/profile-options', Icon: IconSliders, label: 'Profile Options' },
        { path: '/admin-access', Icon: IconShield, label: 'Admin Access' },
    ];

    return (
        <div style={styles.sidebar} ref={scrollRef} onScroll={handleSidebarScroll}>
            {/* Brand */}
            <div style={styles.logo}>
                <div style={styles.logoMark}>
                    <IconShield size={20} color="#1A0A0A" sw={2} />
                </div>
                <div>
                    <div style={styles.logoText}>Gettimelam</div>
                    <div style={styles.logoSub}>Admin Console</div>
                </div>
            </div>

            {/* Admin identity */}
            <div style={styles.adminInfo}>
                <div style={styles.adminAvatar}>
                    {(admin?.name || 'A').charAt(0).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                    <div style={styles.adminName}>{admin?.name}</div>
                    <div style={styles.adminRole}>Administrator</div>
                </div>
                <span style={styles.onlineDot} />
            </div>

            {/* Menu */}
            <div style={styles.menu}>
                {menuItems.map(item => {
                    const active = location.pathname === item.path;
                    return (
                        <div key={item.path}
                            style={{
                                ...styles.menuItem,
                                ...(active ? styles.menuItemActive : {}),
                            }}
                            onClick={() => navigate(item.path)}
                            onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                            onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                            {active && <span style={styles.activeRail} />}
                            <item.Icon size={17} color={active ? GOLD : 'rgba(243,237,247,0.55)'} />
                            <span>{item.label}</span>
                            {item.path === '/profile-options' && pendingCount > 0 && (
                                <span style={styles.pendingBadge}>{pendingCount}</span>
                            )}
                            {item.path === '/users' && newUsersCount > 0 && (
                                <span style={styles.pendingBadge}>{newUsersCount}</span>
                            )}
                            {item.path === '/support-chat' && unreadSupportCount > 0 && (
                                <span style={styles.pendingBadge}>{unreadSupportCount}</span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Bottom */}
            <div style={styles.bottom}>
                <div style={styles.menuItem}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => window.open('http://localhost:3000', '_blank')}>
                    <IconGlobe size={17} color="rgba(243,237,247,0.55)" />
                    <span>View Website</span>
                </div>
                <div style={{ ...styles.menuItem, color: '#F87171' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={logout}>
                    <IconLogout size={17} color="#F87171" />
                    <span>Logout</span>
                </div>
            </div>
        </div>
    );
};

const styles = {
    sidebar: {
        width: '240px',
        background: 'linear-gradient(180deg, #16101B 0%, #0E0912 100%)',
        borderRight: '1px solid rgba(232,184,75,0.14)',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0, top: 0, bottom: 0,
        zIndex: 100,
        overflowY: 'auto',
    },
    logo: {
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '22px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
    },
    logoMark: {
        width: '38px', height: '38px', borderRadius: '11px',
        background: 'linear-gradient(135deg, #F5D98B, #C9941A)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 6px 18px rgba(232,184,75,0.3)',
        flexShrink: 0,
    },
    logoText: { fontSize: '15px', fontWeight: '700', color: '#F3EDF7', letterSpacing: '0.3px' },
    logoSub: { fontSize: '10px', color: '#E8B84B', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '2px' },
    adminInfo: {
        display: 'flex', alignItems: 'center', gap: '11px',
        padding: '13px 14px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
        margin: '16px 12px',
        borderRadius: '12px',
        flexShrink: 0,
        position: 'relative',
    },
    adminAvatar: {
        width: '36px', height: '36px', borderRadius: '50%',
        background: 'rgba(232,184,75,0.12)',
        border: '1px solid rgba(232,184,75,0.5)',
        color: '#E8B84B', fontSize: '15px', fontWeight: '700',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    },
    adminName: { fontSize: '13px', fontWeight: '600', color: '#F3EDF7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' },
    adminRole: { fontSize: '10.5px', color: '#9C8FA6', letterSpacing: '0.5px', marginTop: '1px' },
    onlineDot: {
        position: 'absolute', top: '12px', right: '12px',
        width: '7px', height: '7px', borderRadius: '50%',
        background: '#4ADE80', boxShadow: '0 0 8px rgba(74,222,128,0.8)',
    },
    menu: { flex: 1, padding: '4px 12px' },
    menuItem: {
        position: 'relative',
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '10.5px 14px', borderRadius: '10px',
        cursor: 'pointer', fontSize: '13.5px', fontWeight: '500',
        color: 'rgba(243,237,247,0.6)',
        marginBottom: '2px', transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
    },
    pendingBadge: {
        marginLeft: 'auto', background: '#D32F2F', color: '#fff',
        fontSize: '10.5px', fontWeight: '700', padding: '1px 7px',
        borderRadius: '10px', lineHeight: 1.5,
    },
    menuItemActive: {
        background: 'linear-gradient(90deg, rgba(232,184,75,0.14), rgba(232,184,75,0.04))',
        color: '#E8B84B',
        fontWeight: '600',
    },
    activeRail: {
        position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '3px',
        borderRadius: '3px', background: 'linear-gradient(180deg, #F5D98B, #C9941A)',
        boxShadow: '0 0 10px rgba(232,184,75,0.6)',
    },
    bottom: {
        padding: '12px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
    },
};

export default Sidebar;
