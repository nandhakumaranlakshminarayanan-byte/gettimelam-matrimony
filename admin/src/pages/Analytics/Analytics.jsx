import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#8B1A1A', '#C9A84C', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4', '#FF5722'];

const Analytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchAnalytics();
        fetchBookings();
        fetchUsers();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await API.get('/admin/analytics');
            setAnalytics(res.data.analytics);
        } catch (err) {
            toast.error('Failed to load analytics');
        }
    };

    const fetchBookings = async () => {
        try {
            const res = await API.get('/admin/bookings');
            setBookings(res.data.bookings || []);
        } catch (err) { }
    };

    const fetchUsers = async () => {
        try {
            const res = await API.get('/admin/users');
            setUsers(res.data.users || []);
        } catch (err) { }
    };

    // ── Chart data generators ──
    const getLast7Days = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
            const dateStr = d.toDateString();
            days.push({
                day: label,
                Members: users.filter(u => new Date(u.createdAt).toDateString() === dateStr).length,
                Bookings: bookings.filter(b => new Date(b.createdAt).toDateString() === dateStr).length,
            });
        }
        return days;
    };

    const getBookingStatusData = () => [
        { name: 'Pending', value: bookings.filter(b => b.status === 'Pending').length, color: '#FFC107' },
        { name: 'Confirmed', value: bookings.filter(b => b.status === 'Confirmed').length, color: '#4CAF50' },
        { name: 'Cancelled', value: bookings.filter(b => b.status === 'Cancelled').length, color: '#F44336' },
    ].filter(d => d.value > 0);

    const getGenderChartData = () =>
        analytics?.genderStats?.map(g => ({
            name: g._id === 'Female' ? 'Brides' : 'Grooms',
            value: g.count,
            color: g._id === 'Female' ? '#E91E63' : '#1565C0'
        })) || [];

    const getReligionChartData = () =>
        analytics?.religionStats?.map(r => ({
            name: r._id || 'Other',
            value: r.count
        })) || [];

    const getDistrictChartData = () =>
        analytics?.districtStats?.slice(0, 6).map(d => ({
            name: d._id || 'Unknown',
            value: d.count
        })) || [];

    if (!analytics) return (
        <div style={styles.layout}>
            <Sidebar />
            <div style={styles.content}>
                <Navbar title="📈 Reports & Analytics" />
                <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>⏳</div>
                    Loading analytics...
                </div>
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
                            { label: 'New Users This Week', value: analytics.newUsersThisWeek, icon: '📈', color: '#E3F2FD', border: '#1565C0' },
                            { label: 'New Users This Month', value: analytics.newUsersThisMonth, icon: '📊', color: '#E8F5E9', border: '#2E7D32' },
                            { label: 'New Profiles This Week', value: analytics.newProfilesThisWeek, icon: '👤', color: '#F3E5F5', border: '#6A1B9A' },
                            { label: 'Total Bookings', value: bookings.length, icon: '📅', color: '#FFF8E1', border: '#F57F17' },
                            { label: 'Confirmed Bookings', value: bookings.filter(b => b.status === 'Confirmed').length, icon: '✅', color: '#E8F5E9', border: '#2E7D32' },
                            { label: 'Pending Bookings', value: bookings.filter(b => b.status === 'Pending').length, icon: '⏳', color: '#FCE4EC', border: '#880E4F' },
                        ].map(s => (
                            <div key={s.label} style={{ ...styles.growthCard, background: s.color, borderLeft: `4px solid ${s.border}` }}>
                                <div style={styles.growthIcon}>{s.icon}</div>
                                <div style={styles.growthValue}>{s.value}</div>
                                <div style={styles.growthLabel}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* ── Line Chart: Last 7 Days ── */}
                    <div style={{ ...styles.chartCard, marginBottom: '20px' }}>
                        <h3 style={styles.chartTitle}>📊 Last 7 Days — Registrations & Bookings</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={getLast7Days()}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="day" fontSize={11} />
                                <YAxis fontSize={11} allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="Members" stroke="#8B1A1A" strokeWidth={2} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                                <Line type="monotone" dataKey="Bookings" stroke="#C9A84C" strokeWidth={2} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* ── Row 1: Gender Pie + Booking Status Bar ── */}
                    <div style={styles.chartsGrid}>

                        {/* Gender Pie Chart */}
                        <div style={styles.chartCard}>
                            <h3 style={styles.chartTitle}>👥 Gender Distribution</h3>
                            {getGenderChartData().length > 0 ? (
                                <ResponsiveContainer width="100%" height={240}>
                                    <PieChart>
                                        <Pie data={getGenderChartData()} cx="50%" cy="50%"
                                            outerRadius={80} dataKey="value"
                                            label={({ name, value }) => `${name}: ${value}`}>
                                            {getGenderChartData().map((entry, i) => (
                                                <Cell key={i} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={styles.noData}>No profile data yet</div>
                            )}
                        </div>

                        {/* Booking Status Bar Chart */}
                        <div style={styles.chartCard}>
                            <h3 style={styles.chartTitle}>📅 Booking Status</h3>
                            {getBookingStatusData().length > 0 ? (
                                <ResponsiveContainer width="100%" height={240}>
                                    <BarChart data={getBookingStatusData()}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="name" fontSize={12} />
                                        <YAxis fontSize={12} allowDecimals={false} />
                                        <Tooltip />
                                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                            {getBookingStatusData().map((entry, i) => (
                                                <Cell key={i} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={styles.noData}>No bookings yet</div>
                            )}
                        </div>

                        {/* Religion Bar Chart */}
                        <div style={styles.chartCard}>
                            <h3 style={styles.chartTitle}>🙏 Religion Distribution</h3>
                            {getReligionChartData().length > 0 ? (
                                <ResponsiveContainer width="100%" height={240}>
                                    <BarChart data={getReligionChartData()}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="name" fontSize={12} />
                                        <YAxis fontSize={12} allowDecimals={false} />
                                        <Tooltip />
                                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                            {getReligionChartData().map((_, i) => (
                                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={styles.noData}>No profile data yet</div>
                            )}
                        </div>
                    </div>

                    {/* ── Row 2: Top Districts + Religion Pie ── */}
                    <div style={{ ...styles.chartsGrid, marginTop: '20px' }}>

                        {/* Top Districts Bar */}
                        <div style={{ ...styles.chartCard, gridColumn: '1 / 3' }}>
                            <h3 style={styles.chartTitle}>📍 Top Districts</h3>
                            {getDistrictChartData().length > 0 ? (
                                <ResponsiveContainer width="100%" height={240}>
                                    <BarChart data={getDistrictChartData()} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis type="number" fontSize={11} allowDecimals={false} />
                                        <YAxis type="category" dataKey="name" fontSize={11} width={80} />
                                        <Tooltip />
                                        <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="#8B1A1A" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={styles.noData}>No location data yet</div>
                            )}
                        </div>

                        {/* Religion Pie */}
                        <div style={styles.chartCard}>
                            <h3 style={styles.chartTitle}>🙏 Religion Pie</h3>
                            {getReligionChartData().length > 0 ? (
                                <ResponsiveContainer width="100%" height={240}>
                                    <PieChart>
                                        <Pie data={getReligionChartData()} cx="50%" cy="50%"
                                            innerRadius={50} outerRadius={80}
                                            dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                                            {getReligionChartData().map((_, i) => (
                                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={styles.noData}>No data yet</div>
                            )}
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
    growthGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' },
    growthCard: { borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' },
    growthIcon: { fontSize: '28px', marginBottom: '8px' },
    growthValue: { fontFamily: "'Georgia', serif", fontSize: '32px', fontWeight: '700', color: '#1A0A0A', marginBottom: '4px' },
    growthLabel: { fontSize: '12px', color: '#757575' },
    chartsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
    chartCard: { background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    chartTitle: { fontSize: '15px', fontWeight: '700', color: '#1A0A0A', marginBottom: '16px' },
    noData: { textAlign: 'center', padding: '40px', color: '#999', fontSize: '13px' },
};

export default Analytics;