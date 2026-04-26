import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', message: '', type: 'all' });

    useEffect(() => { fetchNotifications(); }, []);

    const fetchNotifications = async () => {
        try {
            const res = await API.get('/admin/notifications');
            setNotifications(res.data.notifications);
        } catch (err) {
            toast.error('Failed to load');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/admin/notifications', form);
            toast.success('Notification sent! 🔔');
            setShowForm(false);
            setForm({ title: '', message: '', type: 'all' });
            fetchNotifications();
        } catch (err) {
            toast.error('Failed!');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this notification?')) return;
        try {
            await API.delete(`/admin/notifications/${id}`);
            toast.success('Deleted!');
            fetchNotifications();
        } catch (err) {
            toast.error('Failed!');
        }
    };

    return (
        <div style={styles.layout}>
            <Sidebar />
            <div style={styles.content}>
                <Navbar title="🔔 Notifications" />
                <div style={styles.inner}>

                    <div style={styles.topRow}>
                        <h3 style={styles.count}>{notifications.length} notifications sent</h3>
                        <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
                            {showForm ? '✕ Cancel' : '🔔 Send Notification'}
                        </button>
                    </div>

                    {showForm && (
                        <form onSubmit={handleSubmit} style={styles.form}>
                            <h3 style={styles.formTitle}>Send New Notification</h3>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Title</label>
                                <input style={styles.input} placeholder="Notification title" value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })} required />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Message</label>
                                <textarea style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                                    placeholder="Notification message..." value={form.message}
                                    onChange={e => setForm({ ...form, message: e.target.value })} required />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Send To</label>
                                <select style={styles.input} value={form.type}
                                    onChange={e => setForm({ ...form, type: e.target.value })}>
                                    <option value="all">All Users</option>
                                    <option value="premium">Premium Users Only</option>
                                    <option value="free">Free Users Only</option>
                                </select>
                            </div>
                            <button type="submit" style={styles.submitBtn}>🔔 Send Notification</button>
                        </form>
                    )}

                    <div style={styles.list}>
                        {notifications.map(n => (
                            <div key={n._id} style={styles.notifCard}>
                                <div style={styles.notifLeft}>
                                    <div style={styles.notifIcon}>
                                        {n.type === 'all' ? '📢' : n.type === 'premium' ? '⭐' : '🆓'}
                                    </div>
                                    <div>
                                        <div style={styles.notifTitle}>{n.title}</div>
                                        <div style={styles.notifMsg}>{n.message}</div>
                                        <div style={styles.notifMeta}>
                                            <span style={{
                                                padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                                                background: n.type === 'all' ? '#E3F2FD' : n.type === 'premium' ? '#FFF8E1' : '#E8F5E9',
                                                color: n.type === 'all' ? '#1565C0' : n.type === 'premium' ? '#F57F17' : '#2E7D32'
                                            }}>
                                                {n.type === 'all' ? '📢 All Users' : n.type === 'premium' ? '⭐ Premium' : '🆓 Free'}
                                            </span>
                                            <span style={{ fontSize: '11px', color: '#999', marginLeft: '8px' }}>
                                                {new Date(n.createdAt).toLocaleDateString('en-IN')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button style={styles.deleteBtn} onClick={() => handleDelete(n._id)}>🗑️</button>
                            </div>
                        ))}
                        {notifications.length === 0 && !showForm && (
                            <div style={styles.empty}>
                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔔</div>
                                <p style={{ color: '#999' }}>No notifications sent yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    layout: { display: 'flex', minHeight: '100vh', background: '#F5F5F5' },
    content: { marginLeft: '240px', flex: 1 },
    inner: { padding: '28px' },
    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    count: { fontSize: '15px', color: '#555', fontWeight: '600' },
    addBtn: {
        padding: '10px 20px', background: '#1A0A0A', color: '#fff',
        border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
    },
    form: { background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    formTitle: { fontSize: '16px', fontWeight: '700', color: '#1A0A0A', marginBottom: '16px' },
    formGroup: { marginBottom: '16px' },
    label: { display: 'block', fontSize: '11px', fontWeight: '700', color: '#555', marginBottom: '5px', textTransform: 'uppercase' },
    input: { width: '100%', padding: '10px 14px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', outline: 'none', fontFamily: 'sans-serif', boxSizing: 'border-box' },
    submitBtn: { padding: '12px 28px', background: 'linear-gradient(135deg, #1A0A0A, #3D1A1A)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
    list: { display: 'flex', flexDirection: 'column', gap: '12px' },
    notifCard: {
        background: '#fff', borderRadius: '12px', padding: '16px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #E0E0E0'
    },
    notifLeft: { display: 'flex', gap: '14px', alignItems: 'flex-start' },
    notifIcon: { fontSize: '24px', marginTop: '2px' },
    notifTitle: { fontSize: '15px', fontWeight: '700', color: '#1A0A0A', marginBottom: '4px' },
    notifMsg: { fontSize: '13px', color: '#555', marginBottom: '6px' },
    notifMeta: { display: 'flex', alignItems: 'center' },
    deleteBtn: { background: '#FFEBEE', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '16px' },
    empty: { textAlign: 'center', padding: '60px' }
};

export default Notifications;