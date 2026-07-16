import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const [providers, setProviders] = useState([]);

    useEffect(() => {
        fetchUsers();
        fetchProviders();
        // Clears the "new signups" sidebar badge, and tells the sidebar to
        // refresh right away instead of waiting up to 60s for its next poll.
        API.put('/admin/mark-users-seen').then(() => {
            window.dispatchEvent(new Event('usersSeen'));
        }).catch(() => { });
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await API.get('/admin/users');
            setUsers(res.data.users || []);
        } catch (err) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const fetchProviders = async () => {
        try {
            const res = await API.get('/admin/vendors');
            setProviders(res.data.vendors || []);
        } catch (err) { }
    };

    const handleTogglePremium = async (id) => {
        try {
            const res = await API.put(`/admin/users/${id}/toggle-premium`);
            toast.success(res.data.message);
            fetchUsers();
        } catch (err) {
            toast.error('Failed!');
        }
    };

    // ✅ Verify user
    const handleVerify = async (id, isVerified) => {
        try {
            const endpoint = isVerified ? 'unverify' : 'verify';
            const res = await API.put(`/admin/users/${id}/${endpoint}`);
            toast.success(res.data.message);
            fetchUsers();
        } catch (err) {
            toast.error('Failed!');
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete ${name}?`)) return;
        try {
            await API.delete(`/admin/users/${id}`);
            toast.success('User deleted!');
            fetchUsers();
        } catch (err) {
            toast.error('Failed!');
        }
    };

    const getDisplayName = (u) => u.name || u.businessName || u.ownerName || '—';

    const getRoleBadge = (role) => {
        if (role === 'admin') return { label: '🛡️ Admin', bg: '#FCE4EC', color: '#880E4F' };
        if (role === 'service') return { label: '🏪 Service Provider', bg: '#E3F2FD', color: '#1565C0' };
        return { label: '👤 Member', bg: '#E8F5E9', color: '#2E7D32' };
    };

    const filtered = filter === 'service'
        ? providers.filter(u => {
            const q = search.toLowerCase();
            return !q || (u.businessName || '').toLowerCase().includes(q) || (u.mobile || '').includes(q) || (u.email || '').toLowerCase().includes(q);
        })
        : users.filter(u => {
            const name = getDisplayName(u).toLowerCase();
            const matchSearch = name.includes(search.toLowerCase()) ||
                u.mobile?.includes(search) ||
                u.email?.toLowerCase().includes(search.toLowerCase());
            const matchFilter = filter === 'all' || u.role === filter;
            return matchSearch && matchFilter;
        });

    const members = users.filter(u => u.role === 'member');
    const services = providers;
    const admins = users.filter(u => u.role === 'admin');

    return (
        <div style={styles.layout}>
            <Sidebar />
            <div style={styles.content}>
                <Navbar title="👥 Manage Users" />
                <div style={styles.inner}>

                    {/* Stats */}
                    <div style={styles.statsRow}>
                        {[
                            { label: 'Total Users', value: users.length, color: '#E3F2FD', border: '#1565C0' },
                            { label: 'Members', value: members.length, color: '#E8F5E9', border: '#2E7D32' },
                            { label: 'Service Providers', value: services.length, color: '#FFF8E1', border: '#F57F17' },
                            { label: 'Admins', value: admins.length, color: '#FCE4EC', border: '#880E4F' },
                        ].map(s => (
                            <div key={s.label} style={{ ...styles.statCard, background: s.color, borderLeft: `4px solid ${s.border}` }}>
                                <div style={styles.statValue}>{s.value}</div>
                                <div style={styles.statLabel}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Search + Filter */}
                    <div style={styles.topRow}>
                        <input type="text" placeholder="🔍 Search by name, mobile or email..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            style={styles.search} />
                        <div style={styles.filterBtns}>
                            {[
                                { id: 'all', label: 'All' },
                                { id: 'member', label: '👤 Members' },
                                { id: 'service', label: '🏪 Providers' },
                                { id: 'admin', label: '🛡️ Admins' },
                            ].map(f => (
                                <button key={f.id}
                                    style={{ ...styles.filterBtn, ...(filter === f.id ? styles.filterBtnActive : {}) }}
                                    onClick={() => setFilter(f.id)}>
                                    {f.label}
                                </button>
                            ))}
                        </div>
                        <span style={styles.count}>{filtered.length} users</span>
                    </div>

                    {loading ? (
                        <div style={styles.loading}>Loading...</div>
                    ) : (
                        <div style={styles.tableWrapper}>
                            <table style={styles.table}>
                                <thead>
                                    <tr style={styles.head}>
                                        {['#', 'Name', 'Mobile', 'Email', 'Gender/Type', 'Plan', 'Role', 'Verified', 'Joined', 'Actions'].map(h => (
                                            <th key={h} style={styles.th}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((u, i) => {
                                        const badge = getRoleBadge(u.role);
                                        return (
                                            <tr key={u._id} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                                                <td style={styles.td}>{i + 1}</td>
                                                <td style={styles.td}>
                                                    <div style={{ fontWeight: '700', color: '#1A0A0A' }}>
                                                        {getDisplayName(u)}
                                                    </div>
                                                    {u.role === 'service' && u.category && (
                                                        <div style={{ fontSize: '11px', color: '#1565C0', fontWeight: '600' }}>
                                                            🏪 {u.category}
                                                        </div>
                                                    )}
                                                    {/* Profile registered on behalf of someone else — surface who it's actually for */}
                                                    {u.role === 'member' && u.profileFor && u.profileFor !== 'Myself' && (
                                                        <div style={{ fontSize: '11px', color: '#8B1A1A', fontWeight: '600', marginTop: '2px' }}>
                                                            👤 For {u.profileFor}: {u.profileName || '—'}
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={styles.td}>{u.mobile}</td>
                                                <td style={styles.td}>{u.email}</td>
                                                <td style={styles.td}>
                                                    {u.role === 'service' ? (
                                                        <span>📍 {u.city || '—'}</span>
                                                    ) : (
                                                        <span>
                                                            {u.gender === 'Female' ? '👩' : u.gender === 'Male' ? '👨' : '?'} {u.gender || '—'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={{
                                                        padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                                                        background: u.isPremium ? '#FFF8E1' : '#F5F5F5',
                                                        color: u.isPremium ? '#F57F17' : '#757575'
                                                    }}>
                                                        {u.isPremium ? '⭐ Premium' : '🆓 Free'}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={{
                                                        padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                                                        background: badge.bg, color: badge.color
                                                    }}>
                                                        {badge.label}
                                                    </span>
                                                </td>

                                                {/* ✅ Verified Status */}
                                                <td style={styles.td}>
                                                    <span style={{
                                                        padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                                                        background: u.isVerified ? '#E8F5E9' : '#FFEBEE',
                                                        color: u.isVerified ? '#2E7D32' : '#C62828'
                                                    }}>
                                                        {u.isVerified ? '✅ Verified' : '⏳ Pending'}
                                                    </span>
                                                </td>

                                                <td style={styles.td}>
                                                    {new Date(u.createdAt).toLocaleDateString('en-IN')}
                                                </td>

                                                <td style={styles.td}>
                                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>

                                                        {/* ✅ Verify Button */}
                                                        {u.role !== 'admin' && (
                                                            <button style={{
                                                                padding: '5px 10px', border: 'none', borderRadius: '6px',
                                                                fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                                                                background: u.isVerified ? '#FFEBEE' : '#E8F5E9',
                                                                color: u.isVerified ? '#C62828' : '#2E7D32'
                                                            }}
                                                                onClick={() => handleVerify(u._id, u.isVerified)}>
                                                                {u.isVerified ? '❌ Unverify' : '✅ Verify'}
                                                            </button>
                                                        )}

                                                        {/* Premium Toggle */}
                                                        {u.role !== 'admin' && (
                                                            <button style={{
                                                                padding: '5px 10px', border: 'none', borderRadius: '6px',
                                                                fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                                                                background: u.isPremium ? '#FFF8E1' : '#E3F2FD',
                                                                color: u.isPremium ? '#F57F17' : '#1565C0'
                                                            }}
                                                                onClick={() => handleTogglePremium(u._id)}>
                                                                {u.isPremium ? '⬇️ Free' : '⬆️ Premium'}
                                                            </button>
                                                        )}

                                                        {/* Delete */}
                                                        <button style={{
                                                            padding: '5px 10px', border: 'none', borderRadius: '6px',
                                                            fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                                                            background: '#FFEBEE', color: '#C62828'
                                                        }}
                                                            onClick={() => handleDelete(u._id, getDisplayName(u))}>
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filtered.length === 0 && (
                                        <tr>
                                            <td colSpan={10} style={{ ...styles.td, textAlign: 'center', color: '#999', padding: '40px' }}>
                                                No users found
                                            </td>
                                        </tr>
                                    )}
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
    statCard: { borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    statValue: { fontFamily: "'Georgia', serif", fontSize: '32px', fontWeight: '700', color: '#1A0A0A', marginBottom: '4px' },
    statLabel: { fontSize: '13px', color: '#757575' },
    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' },
    search: { padding: '10px 16px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', outline: 'none', width: '300px' },
    filterBtns: { display: 'flex', gap: '6px' },
    filterBtn: { padding: '7px 14px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: '#fff', color: '#555' },
    filterBtnActive: { background: '#1A0A0A', color: '#fff', border: '1.5px solid #1A0A0A' },
    count: { background: '#FDF0F0', color: '#8B1A1A', padding: '6px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '600' },
    loading: { textAlign: 'center', padding: '40px', color: '#757575' },
    tableWrapper: { background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #E0E0E0' },
    table: { width: '100%', borderCollapse: 'collapse' },
    head: { background: '#F5F5F5' },
    th: { padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#555', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #E0E0E0' },
    td: { padding: '12px 16px', fontSize: '13px', color: '#333', borderBottom: '1px solid #F0F0F0' },
};

export default Users;