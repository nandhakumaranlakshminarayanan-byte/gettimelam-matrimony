import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentUsers, setRecentUsers] = useState([]);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await API.get('/admin/stats');
            setStats(res.data.stats);
            setRecentUsers(res.data.recentUsers || []);
        } catch (err) {
            toast.error('Failed to load stats');
        }
    };

    return (
        <div style={styles.layout}>
            <Sidebar />
            <div style={styles.content}>
                <Navbar title="📊 Dashboard Overview" />
                <div style={styles.inner}>

                    {/* Stats Grid */}
                    {stats && (
                        <div style={styles.statsGrid}>
                            {[
                                { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#E3F2FD', border: '#1565C0' },
                                { label: 'Total Profiles', value: stats.totalProfiles, icon: '👤', color: '#F3E5F5', border: '#6A1B9A' },
                                { label: 'Premium Users', value: stats.premiumUsers, icon: '⭐', color: '#FFF8E1', border: '#F57F17' },
                                { label: 'Free Users', value: stats.freeUsers, icon: '🆓', color: '#E8F5E9', border: '#2E7D32' },
                                { label: 'Total Services', value: stats.totalServices, icon: '💍', color: '#FCE4EC', border: '#880E4F' },
                                { label: 'Total Bookings', value: stats.totalBookings, icon: '📅', color: '#E0F2F1', border: '#00695C' },
                            ].map(s => (
                                <div key={s.label} style={{
                                    ...styles.statCard,
                                    background: s.color,
                                    borderLeft: `4px solid ${s.border}`
                                }}>
                                    <div style={styles.statIcon}>{s.icon}</div>
                                    <div style={styles.statValue}>{s.value}</div>
                                    <div style={styles.statLabel}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Revenue Card */}
                    {stats && (
                        <div style={styles.revenueCard}>
                            <h3 style={styles.revenueTitle}>💰 Revenue Estimate</h3>
                            <div style={styles.revenueGrid}>
                                {[
                                    { label: 'Monthly Revenue', value: `₹${(stats.premiumUsers * 1800).toLocaleString('en-IN')}` },
                                    { label: 'Yearly Revenue', value: `₹${(stats.premiumUsers * 1800 * 12).toLocaleString('en-IN')}` },
                                    { label: 'Premium Members', value: stats.premiumUsers },
                                    { label: 'Conversion Rate', value: `${stats.totalUsers > 0 ? Math.round((stats.premiumUsers / stats.totalUsers) * 100) : 0}%` },
                                ].map(r => (
                                    <div key={r.label} style={styles.revenueItem}>
                                        <div style={styles.revenueValue}>{r.value}</div>
                                        <div style={styles.revenueLabel}>{r.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Users */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>🆕 Recent Registrations</h3>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tableHead}>
                                    <th style={styles.th}>Name</th>
                                    <th style={styles.th}>Mobile</th>
                                    <th style={styles.th}>Gender</th>
                                    <th style={styles.th}>Plan</th>
                                    <th style={styles.th}>Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentUsers.map((u, i) => (
                                    <tr key={u._id} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                                        <td style={styles.td}><strong>{u.name}</strong></td>
                                        <td style={styles.td}>{u.mobile}</td>
                                        <td style={styles.td}>{u.gender === 'Female' ? '👩' : '👨'} {u.gender}</td>
                                        <td style={styles.td}>
                                            <span style={{
                                                padding: '3px 10px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                background: u.isPremium ? '#FFF8E1' : '#F5F5F5',
                                                color: u.isPremium ? '#F57F17' : '#757575'
                                            }}>
                                                {u.isPremium ? '⭐ Premium' : '🆓 Free'}
                                            </span>
                                        </td>
                                        <td style={styles.td}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                                    </tr>
                                ))}
                                {recentUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ ...styles.td, textAlign: 'center', color: '#999' }}>
                                            No users yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
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
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        marginBottom: '28px'
    },
    statCard: {
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    },
    statIcon: { fontSize: '32px', marginBottom: '8px' },
    statValue: {
        fontFamily: "'Georgia', serif",
        fontSize: '36px',
        fontWeight: '700',
        color: '#1A0A0A',
        marginBottom: '4px'
    },
    statLabel: { fontSize: '13px', color: '#757575' },
    revenueCard: {
        background: 'linear-gradient(135deg, #1A0A0A, #3D1A1A)',
        borderRadius: '16px',
        padding: '28px',
        marginBottom: '28px'
    },
    revenueTitle: {
        color: '#fff',
        fontSize: '18px',
        marginBottom: '20px'
    },
    revenueGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px'
    },
    revenueItem: { textAlign: 'center' },
    revenueValue: {
        fontFamily: "'Georgia', serif",
        fontSize: '24px',
        fontWeight: '700',
        color: '#C9A84C',
        marginBottom: '4px'
    },
    revenueLabel: { fontSize: '12px', color: 'rgba(255,255,255,0.5)' },
    section: {
        background: '#fff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    },
    sectionTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#1A0A0A',
        marginBottom: '16px'
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHead: { background: '#F5F5F5' },
    th: {
        padding: '12px 16px',
        fontSize: '12px',
        fontWeight: '700',
        color: '#555',
        textAlign: 'left',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        borderBottom: '1px solid #E0E0E0'
    },
    td: {
        padding: '12px 16px',
        fontSize: '13px',
        color: '#333',
        borderBottom: '1px solid #F0F0F0'
    }
};

export default Dashboard;