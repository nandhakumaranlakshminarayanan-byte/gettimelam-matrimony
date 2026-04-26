import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await API.get('/admin/users');
            setUsers(res.data.users);
        } catch (err) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
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

    const filtered = users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.mobile?.includes(search) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={styles.layout}>
            <Sidebar />
            <div style={styles.content}>
                <Navbar title="👥 Manage Users" />
                <div style={styles.inner}>

                    <div style={styles.topRow}>
                        <input
                            type="text"
                            placeholder="🔍 Search by name, mobile or email..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={styles.search}
                        />
                        <span style={styles.count}>{filtered.length} users</span>
                    </div>

                    {loading ? (
                        <div style={styles.loading}>Loading...</div>
                    ) : (
                        <div style={styles.tableWrapper}>
                            <table style={styles.table}>
                                <thead>
                                    <tr style={styles.head}>
                                        <th style={styles.th}>#</th>
                                        <th style={styles.th}>Name</th>
                                        <th style={styles.th}>Mobile</th>
                                        <th style={styles.th}>Email</th>
                                        <th style={styles.th}>Gender</th>
                                        <th style={styles.th}>Plan</th>
                                        <th style={styles.th}>Role</th>
                                        <th style={styles.th}>Joined</th>
                                        <th style={styles.th}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((u, i) => (
                                        <tr key={u._id} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                                            <td style={styles.td}>{i + 1}</td>
                                            <td style={styles.td}><strong>{u.name}</strong></td>
                                            <td style={styles.td}>{u.mobile}</td>
                                            <td style={styles.td}>{u.email}</td>
                                            <td style={styles.td}>{u.gender === 'Female' ? '👩' : '👨'} {u.gender}</td>
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
                                                    background: u.role === 'admin' ? '#FCE4EC' : '#E8F5E9',
                                                    color: u.role === 'admin' ? '#880E4F' : '#2E7D32'
                                                }}>
                                                    {u.role === 'admin' ? '🛡️ Admin' : '👤 User'}
                                                </span>
                                            </td>
                                            <td style={styles.td}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                                            <td style={styles.td}>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <button
                                                        style={{
                                                            padding: '5px 10px', border: 'none', borderRadius: '6px',
                                                            fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                                                            background: u.isPremium ? '#FFF8E1' : '#E8F5E9',
                                                            color: u.isPremium ? '#F57F17' : '#2E7D32'
                                                        }}
                                                        onClick={() => handleTogglePremium(u._id)}
                                                    >
                                                        {u.isPremium ? '⬇️ Free' : '⬆️ Premium'}
                                                    </button>
                                                    <button
                                                        style={{
                                                            padding: '5px 10px', border: 'none', borderRadius: '6px',
                                                            fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                                                            background: '#FFEBEE', color: '#C62828'
                                                        }}
                                                        onClick={() => handleDelete(u._id, u.name)}
                                                    >
                                                        🗑️ Delete
                                                    </button>
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
    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    search: {
        padding: '10px 16px', border: '1.5px solid #E0E0E0', borderRadius: '8px',
        fontSize: '14px', outline: 'none', width: '400px', fontFamily: 'sans-serif'
    },
    count: {
        background: '#FDF0F0', color: '#8B1A1A', padding: '6px 16px',
        borderRadius: '20px', fontSize: '14px', fontWeight: '600'
    },
    loading: { textAlign: 'center', padding: '40px', color: '#757575' },
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
    td: { padding: '12px 16px', fontSize: '13px', color: '#333', borderBottom: '1px solid #F0F0F0' }
};

export default Users;