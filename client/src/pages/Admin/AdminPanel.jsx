import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminPanel = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        if (!user) { navigate('/'); return; }
        if (user.role !== 'admin') { navigate('/'); return; }
        fetchStats();
        fetchUsers();
        fetchVendors();
        fetchBookings();
    }, [user]);

    const fetchStats = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/stats', { headers });
            setStats(res.data.stats);
        } catch (err) { console.log(err); }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/users', { headers });
            setUsers(res.data.users || []);
        } catch (err) { console.log(err); }
    };

    const fetchVendors = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/vendors', { headers });
            setVendors(res.data.vendors || []);
        } catch (err) { console.log(err); }
    };

    const fetchBookings = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/bookings', { headers });
            setBookings(res.data.bookings || []);
        } catch (err) { console.log(err); }
    };

    const approveVendor = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/admin/vendors/${id}/approve`, {}, { headers });
            toast.success('Vendor approved!');
            fetchVendors();
        } catch (err) { toast.error('Failed'); }
    };

    const rejectVendor = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/admin/vendors/${id}/reject`, {}, { headers });
            toast.success('Vendor rejected!');
            fetchVendors();
        } catch (err) { toast.error('Failed'); }
    };

    const togglePremium = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/admin/users/${id}/toggle-premium`, {}, { headers });
            toast.success('Premium status updated!');
            fetchUsers();
        } catch (err) { toast.error('Failed'); }
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/admin/users/${id}`, { headers });
            toast.success('User deleted!');
            fetchUsers();
        } catch (err) { toast.error('Failed'); }
    };

    const tabs = [
        { id: 'dashboard', label: '📊 Dashboard' },
        { id: 'users', label: '👥 Members' },
        { id: 'vendors', label: '🏪 Vendors' },
        { id: 'bookings', label: '📅 Bookings' },
    ];

    return (
        <div style={{ background: '#F5F5F5', minHeight: '100vh', display: 'flex' }}>

            {/* SIDEBAR */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarLogo}>
                    <div style={{ fontSize: '24px' }}>⚙️</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>Admin Panel</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Gettimelam</div>
                </div>

                {tabs.map(tab => (
                    <div
                        key={tab.id}
                        style={{ ...styles.sideTab, ...(activeTab === tab.id ? styles.sideTabActive : {}) }}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </div>
                ))}

                <div style={{ marginTop: 'auto', padding: '16px' }}>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                        Logged in as Admin
                    </div>
                    <button style={styles.logoutBtn} onClick={() => { logout(); navigate('/'); }}>
                        🚪 Logout
                    </button>
                    <button style={{ ...styles.logoutBtn, background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', marginTop: '8px' }}
                        onClick={() => navigate('/')}>
                        🌐 View Site
                    </button>
                </div>
            </div>

            {/* MAIN */}
            <div style={styles.main}>

                {/* DASHBOARD */}
                {activeTab === 'dashboard' && (
                    <div>
                        <h1 style={styles.pageTitle}>📊 Dashboard Overview</h1>
                        <div style={styles.statsGrid}>
                            {[
                                { icon: '👥', label: 'Total Members', value: stats?.totalUsers || 0, color: '#E3F2FD', border: '#90CAF9' },
                                { icon: '🏪', label: 'Total Vendors', value: vendors.length, color: '#E8F5E9', border: '#A5D6A7' },
                                { icon: '📅', label: 'Total Bookings', value: stats?.totalBookings || 0, color: '#FFF8E1', border: '#FFE082' },
                                { icon: '⭐', label: 'Premium Members', value: stats?.premiumUsers || 0, color: '#FCE4EC', border: '#F48FB1' },
                                { icon: '👤', label: 'Profiles Created', value: stats?.totalProfiles || 0, color: '#F3E5F5', border: '#CE93D8' },
                                { icon: '🏪', label: 'Services Listed', value: stats?.totalServices || 0, color: '#E0F2F1', border: '#80CBC4' },
                            ].map(s => (
                                <div key={s.label} style={{ ...styles.statCard, background: s.color, border: `1px solid ${s.border}` }}>
                                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>{s.icon}</div>
                                    <div style={styles.statValue}>{s.value}</div>
                                    <div style={styles.statLabel}>{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Pending vendors alert */}
                        {vendors.filter(v => !v.isApproved).length > 0 && (
                            <div style={styles.alert}>
                                <strong>⏳ {vendors.filter(v => !v.isApproved).length} vendor(s) waiting for approval!</strong>
                                <button style={styles.alertBtn} onClick={() => setActiveTab('vendors')}>
                                    Review Now →
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* MEMBERS */}
                {activeTab === 'users' && (
                    <div>
                        <h1 style={styles.pageTitle}>👥 Members ({users.length})</h1>
                        <div style={styles.tableBox}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        {['Name', 'Mobile', 'Email', 'Plan', 'Joined', 'Actions'].map(h => (
                                            <th key={h} style={styles.th}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.filter(u => u.role === 'member').map((u, i) => (
                                        <tr key={u._id} style={{ background: i % 2 === 0 ? '#FAFAFA' : '#fff' }}>
                                            <td style={styles.td}>{u.name}</td>
                                            <td style={styles.td}>{u.mobile}</td>
                                            <td style={styles.td}>{u.email}</td>
                                            <td style={styles.td}>
                                                <span style={{ ...styles.pill, background: u.isPremium ? '#FFF8E1' : '#F5F5F5', color: u.isPremium ? '#F57F17' : '#666' }}>
                                                    {u.isPremium ? '⭐ Premium' : 'Free'}
                                                </span>
                                            </td>
                                            <td style={styles.td}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                                            <td style={styles.td}>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <button style={styles.actionBtn} onClick={() => togglePremium(u._id)}>
                                                        {u.isPremium ? 'Downgrade' : '⭐ Premium'}
                                                    </button>
                                                    <button style={{ ...styles.actionBtn, background: '#FFEBEE', color: '#C62828' }} onClick={() => deleteUser(u._id)}>
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* VENDORS */}
                {activeTab === 'vendors' && (
                    <div>
                        <h1 style={styles.pageTitle}>🏪 Vendors ({vendors.length})</h1>

                        {/* Pending first */}
                        {vendors.filter(v => !v.isApproved).length > 0 && (
                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{ color: '#F57F17', marginBottom: '12px' }}>⏳ Pending Approval</h3>
                                {vendors.filter(v => !v.isApproved).map(v => (
                                    <div key={v._id} style={{ ...styles.vendorRow, border: '1px solid #FFE082', background: '#FFFDE7' }}>
                                        <div>
                                            <div style={styles.vendorName}>{v.businessName}</div>
                                            <div style={styles.vendorMeta}>{v.ownerName} • {v.category} • {v.city}</div>
                                            <div style={styles.vendorMeta}>{v.mobile} | {v.email}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button style={{ ...styles.actionBtn, background: '#E8F5E9', color: '#2E7D32' }} onClick={() => approveVendor(v._id)}>
                                                ✅ Approve
                                            </button>
                                            <button style={{ ...styles.actionBtn, background: '#FFEBEE', color: '#C62828' }} onClick={() => rejectVendor(v._id)}>
                                                ❌ Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <h3 style={{ color: '#2E7D32', marginBottom: '12px' }}>✅ Approved Vendors</h3>
                        {vendors.filter(v => v.isApproved).map(v => (
                            <div key={v._id} style={{ ...styles.vendorRow, border: '1px solid #A5D6A7', background: '#F9FBE7' }}>
                                <div>
                                    <div style={styles.vendorName}>{v.businessName}</div>
                                    <div style={styles.vendorMeta}>{v.ownerName} • {v.category} • {v.city}</div>
                                    <div style={styles.vendorMeta}>{v.mobile} | {v.email}</div>
                                </div>
                                <button style={{ ...styles.actionBtn, background: '#FFEBEE', color: '#C62828' }} onClick={() => rejectVendor(v._id)}>
                                    Deactivate
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* BOOKINGS */}
                {activeTab === 'bookings' && (
                    <div>
                        <h1 style={styles.pageTitle}>📅 All Bookings ({bookings.length})</h1>
                        <div style={styles.tableBox}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        {['Customer', 'Service', 'Event Date', 'Type', 'Guests', 'Status'].map(h => (
                                            <th key={h} style={styles.th}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((b, i) => (
                                        <tr key={b._id} style={{ background: i % 2 === 0 ? '#FAFAFA' : '#fff' }}>
                                            <td style={styles.td}>{b.user?.name || '—'}</td>
                                            <td style={styles.td}>{b.service?.businessName || '—'}</td>
                                            <td style={styles.td}>{new Date(b.eventDate).toLocaleDateString('en-IN')}</td>
                                            <td style={styles.td}>{b.eventType}</td>
                                            <td style={styles.td}>{b.guestCount || '—'}</td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    ...styles.pill,
                                                    background: b.status === 'Confirmed' ? '#E8F5E9' : b.status === 'Cancelled' ? '#FFEBEE' : '#FFF8E1',
                                                    color: b.status === 'Confirmed' ? '#2E7D32' : b.status === 'Cancelled' ? '#C62828' : '#F57F17'
                                                }}>
                                                    {b.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

const styles = {
    sidebar: {
        width: '240px', minHeight: '100vh', background: 'linear-gradient(180deg, #1A0A0A, #3D1A1A)',
        display: 'flex', flexDirection: 'column', flexShrink: 0
    },
    sidebarLogo: { padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' },
    sideTab: { padding: '14px 20px', fontSize: '14px', fontWeight: '500', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'all 0.2s' },
    sideTabActive: { background: 'rgba(255,255,255,0.1)', color: '#fff', borderLeft: '3px solid #C9A84C' },
    logoutBtn: { width: '100%', padding: '9px', background: '#C0392B', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    main: { flex: 1, padding: '32px', overflowY: 'auto' },
    pageTitle: { fontFamily: "'Playfair Display', serif", fontSize: '28px', color: '#1A0A0A', marginBottom: '24px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' },
    statCard: { borderRadius: '12px', padding: '20px', textAlign: 'center' },
    statValue: { fontFamily: "'Playfair Display', serif", fontSize: '32px', fontWeight: '700', color: '#8B1A1A', marginBottom: '4px' },
    statLabel: { fontSize: '13px', color: '#555' },
    alert: {
        background: '#FFF8E1', border: '1px solid #FFE082', borderRadius: '12px',
        padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    },
    alertBtn: { padding: '8px 16px', background: '#F57F17', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    tableBox: { background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '12px 16px', background: '#1A0A0A', color: '#fff', fontSize: '12px', fontWeight: '600', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.5px' },
    td: { padding: '12px 16px', fontSize: '13px', color: '#2C1810', borderBottom: '1px solid #F5F5F5' },
    pill: { padding: '4px 10px', borderRadius: '50px', fontSize: '11px', fontWeight: '600' },
    actionBtn: { padding: '6px 12px', background: '#F5F5F5', color: '#333', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
    vendorRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderRadius: '12px', marginBottom: '12px' },
    vendorName: { fontWeight: '700', color: '#1A0A0A', fontSize: '15px', marginBottom: '4px' },
    vendorMeta: { fontSize: '12px', color: '#7A6055' },
};

export default AdminPanel;