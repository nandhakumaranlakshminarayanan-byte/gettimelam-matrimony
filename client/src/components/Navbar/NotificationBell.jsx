import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:5000';

const BellIcon = ({ color = '#F5D98B' }) => (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 15.5v-5a6 6 0 10-12 0v5L4.5 18h15z" />
        <path d="M10 20.5a2 2 0 004 0" />
    </svg>
);

const timeAgo = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

const NotificationBell = () => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [alerts, setAlerts] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const wrapRef = useRef(null);

    const fetchUnreadCount = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/user-alerts/unread-count`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUnreadCount(res.data.count || 0);
        } catch (err) { }
    };

    const fetchAlerts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/user-alerts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAlerts(res.data.alerts || []);
        } catch (err) { }
    };

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // poll every 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOpen = () => {
        const next = !open;
        setOpen(next);
        if (next) fetchAlerts();
    };

    const handleAlertClick = async (alert) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API}/api/user-alerts/${alert._id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAlerts(prev => prev.map(a => a._id === alert._id ? { ...a, isRead: true } : a));
            setUnreadCount(prev => Math.max(0, prev - (alert.isRead ? 0 : 1)));
        } catch (err) { }
        setOpen(false);
        if (alert.link) navigate(alert.link);
    };

    const markAllRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API}/api/user-alerts/mark-all-read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
            setUnreadCount(0);
        } catch (err) { }
    };

    return (
        <div ref={wrapRef} style={{ position: 'relative' }}>
            <button onClick={toggleOpen} style={styles.bellBtn} title="Notifications">
                <BellIcon />
                {unreadCount > 0 && (
                    <span style={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            {open && (
                <div style={styles.dropdown}>
                    <div style={styles.dropHeader}>
                        <span style={styles.dropTitle}>Notifications</span>
                        {unreadCount > 0 && (
                            <span style={styles.markAll} onClick={markAllRead}>Mark all read</span>
                        )}
                    </div>
                    <div style={styles.dropList}>
                        {alerts.length === 0 ? (
                            <div style={styles.empty}>No notifications yet</div>
                        ) : (
                            alerts.map(a => (
                                <div key={a._id}
                                    style={{ ...styles.alertItem, background: a.isRead ? 'transparent' : 'rgba(240,180,41,0.08)' }}
                                    onClick={() => handleAlertClick(a)}>
                                    {!a.isRead && <span style={styles.dot} />}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={styles.alertTitle}>{a.title}</div>
                                        <div style={styles.alertMsg}>{a.message}</div>
                                        <div style={styles.alertTime}>{timeAgo(a.createdAt)}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    bellBtn: {
        position: 'relative', width: '34px', height: '34px', borderRadius: '9px',
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(245,217,139,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
    },
    badge: {
        position: 'absolute', top: '-5px', right: '-5px',
        background: '#D32F2F', color: '#fff', fontSize: '10px', fontWeight: '700',
        minWidth: '17px', height: '17px', borderRadius: '999px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 3px', border: '1.5px solid #1C0812',
    },
    dropdown: {
        position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: '320px',
        background: 'rgba(28,8,18,0.97)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(240,180,41,0.35)', borderRadius: '12px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.55)', overflow: 'hidden', zIndex: 300,
    },
    dropHeader: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)',
    },
    dropTitle: { fontSize: '13.5px', fontWeight: '700', color: '#FFF8E1' },
    markAll: { fontSize: '11.5px', color: '#F5D98B', cursor: 'pointer' },
    dropList: { maxHeight: '360px', overflowY: 'auto' },
    empty: { padding: '30px 16px', textAlign: 'center', fontSize: '13px', color: '#9C8FA6' },
    alertItem: {
        display: 'flex', gap: '8px', padding: '12px 16px', cursor: 'pointer',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
    },
    dot: { width: '7px', height: '7px', borderRadius: '50%', background: '#F0B429', flexShrink: 0, marginTop: '5px' },
    alertTitle: { fontSize: '12.5px', fontWeight: '650', color: '#FFF8E1' },
    alertMsg: { fontSize: '11.5px', color: '#B8A388', marginTop: '2px', lineHeight: 1.4 },
    alertTime: { fontSize: '10px', color: '#8A7A6A', marginTop: '4px' },
};

export default NotificationBell;
