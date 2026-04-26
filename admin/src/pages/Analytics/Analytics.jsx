import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const Analytics = () => {
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => { fetchAnalytics(); }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await API.get('/admin/analytics');
            setAnalytics(res.data.analytics);
        } catch (err) {
            toast.error('Failed to load analytics');
        }
    };

    if (!analytics) return (
        <div style={styles.layout}>
            <Sidebar />
            <div style={styles.content}>
                <Navbar title="📈 Reports & Analytics" />
                <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Loading analytics...</div>
            </div>
        </div>
    );

    return (
        <div style={styles.layout}>
            <Sidebar />
            <div style={styles.content}>
                <Navbar title="📈 Reports & Analytics" />
                <div style={styles.inner}>

                    {/* Growth Stats */}
                    <div style={styles.growthGrid}>
                        {[
                            { label: 'New Users This Week', value: analytics.newUsersThisWeek, icon: '📈', color: '#E3F2FD' },
                            { label: 'New Users This Month', value: analytics.newUsersThisMonth, icon: '📊', color: '#E8F5E9' },
                            { label: 'New Profiles This Week', value: analytics.newProfilesThisWeek, icon: '👤', color: '#F3E5F5' },
                        ].map(s => (
                            <div key={s.label} style={{ ...styles.growthCard, background: s.color }}>
                                <div style={styles.growthIcon}>{s.icon}</div>
                                <div style={styles.growthValue}>{s.value}</div>
                                <div style={styles.growthLabel}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    <div style={styles.chartsGrid}>

                        {/* Gender Stats */}
                        <div style={styles.chartCard}>
                            <h3 style={styles.chartTitle}>👥 Gender Distribution</h3>
                            {analytics.genderStats.map(g => (
                                <div key={g._id} style={styles.barRow}>
                                    <div style={styles.barLabel}>{g._id === 'Female' ? '👩 Brides' : '👨 Grooms'}</div>
                                    <div style={styles.barTrack}>
                                        <div style={{
                                            ...styles.barFill,
                                            width: `${Math.min(100, (g.count / Math.max(...analytics.genderStats.map(x => x.count))) * 100)}%`,
                                            background: g._id === 'Female' ? '#E91E63' : '#1565C0'
                                        }} />
                                    </div>
                                    <div style={styles.barValue}>{g.count}</div>
                                </div>
                            ))}
                        </div>

                        {/* Religion Stats */}
                        <div style={styles.chartCard}>
                            <h3 style={styles.chartTitle}>🙏 Religion Distribution</h3>
                            {analytics.religionStats.length > 0 ? analytics.religionStats.map(r => (
                                <div key={r._id} style={styles.barRow}>
                                    <div style={styles.barLabel}>
                                        {r._id === 'Hindu' ? '🕉️' : r._id === 'Muslim' ? '☪️' : '✝️'} {r._id || 'Other'}
                                    </div>
                                    <div style={styles.barTrack}>
                                        <div style={{
                                            ...styles.barFill,
                                            width: `${Math.min(100, (r.count / Math.max(...analytics.religionStats.map(x => x.count))) * 100)}%`,
                                            background: '#C9A84C'
                                        }} />
                                    </div>
                                    <div style={styles.barValue}>{r.count}</div>
                                </div>
                            )) : <p style={{ color: '#999', fontSize: '13px' }}>No profile data yet</p>}
                        </div>

                        {/* Top Districts */}
                        <div style={styles.chartCard}>
                            <h3 style={styles.chartTitle}>📍 Top Districts</h3>
                            {analytics.districtStats.length > 0 ? analytics.districtStats.map((d, i) => (
                                <div key={d._id} style={styles.barRow}>
                                    <div style={styles.barLabel}>#{i + 1} {d._id || 'Unknown'}</div>
                                    <div style={styles.barTrack}>
                                        <div style={{
                                            ...styles.barFill,
                                            width: `${Math.min(100, (d.count / analytics.districtStats[0].count) * 100)}%`,
                                            background: '#8B1A1A'
                                        }} />
                                    </div>
                                    <div style={styles.barValue}>{d.count}</div>
                                </div>
                            )) : <p style={{ color: '#999', fontSize: '13px' }}>No location data yet</p>}
                        </div>

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
    growthGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '28px' },
    growthCard: { borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' },
    growthIcon: { fontSize: '32px', marginBottom: '8px' },
    growthValue: { fontFamily: "'Georgia', serif", fontSize: '36px', fontWeight: '700', color: '#1A0A0A', marginBottom: '4px' },
    growthLabel: { fontSize: '13px', color: '#757575' },
    chartsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
    chartCard: { background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    chartTitle: { fontSize: '15px', fontWeight: '700', color: '#1A0A0A', marginBottom: '16px' },
    barRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
    barLabel: { fontSize: '12px', color: '#555', width: '100px', flexShrink: 0 },
    barTrack: { flex: 1, height: '8px', background: '#F0F0F0', borderRadius: '50px', overflow: 'hidden' },
    barFill: { height: '100%', borderRadius: '50px', transition: 'width 0.5s' },
    barValue: { fontSize: '12px', fontWeight: '700', color: '#333', width: '30px', textAlign: 'right' }
};

export default Analytics;