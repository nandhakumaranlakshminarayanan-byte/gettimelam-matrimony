import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');

    useEffect(() => { fetchBookings(); }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await API.get('/admin/bookings');
            setBookings(res.data.bookings);
        } catch (err) {
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleStatus = async (id, status) => {
        try {
            await API.put(`/admin/bookings/${id}/status`, { status });
            toast.success(`Booking ${status}!`);
            fetchBookings();
        } catch (err) {
            toast.error('Failed!');
        }
    };

    const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

    return (
        <div style={styles.layout}>
            <Sidebar />
            <div style={styles.content}>
                <Navbar title="📅 Manage Bookings" />
                <div style={styles.inner}>

                    {/* Stats */}
                    <div style={styles.statsRow}>
                        {[
                            { label: 'Total', value: bookings.length, color: '#E3F2FD' },
                            { label: 'Pending', value: bookings.filter(b => b.status === 'Pending').length, color: '#FFF8E1' },
                            { label: 'Confirmed', value: bookings.filter(b => b.status === 'Confirmed').length, color: '#E8F5E9' },
                            { label: 'Cancelled', value: bookings.filter(b => b.status === 'Cancelled').length, color: '#FFEBEE' },
                        ].map(s => (
                            <div key={s.label} style={{ ...styles.statCard, background: s.color }}>
                                <div style={styles.statValue}>{s.value}</div>
                                <div style={styles.statLabel}>{s.label} Bookings</div>
                            </div>
                        ))}
                    </div>

                    {/* Filter */}
                    <div style={styles.filterRow}>
                        {['all', 'Pending', 'Confirmed', 'Cancelled'].map(f => (
                            <button
                                key={f}
                                style={{ ...styles.filterBtn, ...(filter === f ? styles.filterActive : {}) }}
                                onClick={() => setFilter(f)}
                            >
                                {f === 'all' ? 'All' : f}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div style={styles.loading}>Loading...</div>
                    ) : filtered.length === 0 ? (
                        <div style={styles.empty}>
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📅</div>
                            <p style={{ color: '#999' }}>No bookings yet</p>
                        </div>
                    ) : (
                        <div style={styles.tableWrapper}>
                            <table style={styles.table}>
                                <thead>
                                    <tr style={styles.head}>
                                        <th style={styles.th}>#</th>
                                        <th style={styles.th}>Customer</th>
                                        <th style={styles.th}>Service</th>
                                        <th style={styles.th}>Event Type</th>
                                        <th style={styles.th}>Event Date</th>
                                        <th style={styles.th}>Guests</th>
                                        <th style={styles.th}>Status</th>
                                        <th style={styles.th}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((b, i) => (
                                        <tr key={b._id} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                                            <td style={styles.td}>{i + 1}</td>
                                            <td style={styles.td}>
                                                <strong>{b.user?.name}</strong>
                                                <div style={{ fontSize: '11px', color: '#999' }}>{b.user?.mobile}</div>
                                            </td>
                                            <td style={styles.td}>
                                                <strong>{b.service?.businessName}</strong>
                                                <div style={{ fontSize: '11px', color: '#999' }}>{b.service?.category}</div>
                                            </td>
                                            <td style={styles.td}>{b.eventType}</td>
                                            <td style={styles.td}>{new Date(b.eventDate).toLocaleDateString('en-IN')}</td>
                                            <td style={styles.td}>{b.guestCount || '-'}</td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                                                    background: b.status === 'Confirmed' ? '#E8F5E9' : b.status === 'Pending' ? '#FFF8E1' : '#FFEBEE',
                                                    color: b.status === 'Confirmed' ? '#2E7D32' : b.status === 'Pending' ? '#F57F17' : '#C62828'
                                                }}>
                                                    {b.status}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    {b.status === 'Pending' && (
                                                        <button
                                                            style={{ ...styles.actionBtn, background: '#E8F5E9', color: '#2E7D32' }}
                                                            onClick={() => handleStatus(b._id, 'Confirmed')}
                                                        >✅ Confirm</button>
                                                    )}
                                                    {b.status !== 'Cancelled' && (
                                                        <button
                                                            style={{ ...styles.actionBtn, background: '#FFEBEE', color: '#C62828' }}
                                                            onClick={() => handleStatus(b._id, 'Cancelled')}
                                                        >❌ Cancel</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    layout: { display: 'flex', minHeight: '100vh', background: '#F5F5F5' },
    content: { marginLeft: '240px', flex: 1 },
    inner: { padding: '28px' },
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
    statCard: { borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    statValue: { fontFamily: "'Georgia', serif", fontSize: '32px', fontWeight: '700', color: '#1A0A0A', marginBottom: '4px' },
    statLabel: { fontSize: '13px', color: '#757575' },
    filterRow: { display: 'flex', gap: '8px', marginBottom: '20px' },
    filterBtn: {
        padding: '8px 18px', border: '1.5px solid #E0E0E0', borderRadius: '8px',
        fontSize: '13px', fontWeight: '500', cursor: 'pointer', background: '#fff', color: '#555'
    },
    filterActive: { background: '#1A0A0A', color: '#fff', border: '1.5px solid #1A0A0A' },
    loading: { textAlign: 'center', padding: '40px', color: '#757575' },
    empty: { textAlign: 'center', padding: '60px' },
    tableWrapper: {
        background: '#fff', borderRadius: '12px', overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #E0E0E0'
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    head: { background: '#F5F5F5' },
    th: {
        padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#555',
        textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.5px',
        borderBottom: '1px solid #E0E0E0'
    },
    td: { padding: '12px 16px', fontSize: '13px', color: '#333', borderBottom: '1px solid #F0F0F0' },
    actionBtn: { padding: '5px 10px', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }
};

export default Bookings;