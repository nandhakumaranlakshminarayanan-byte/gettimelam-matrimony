import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const AdminAccess = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        name: '', email: '', mobile: '', password: '', canHandleSupport: false
    });

    useEffect(() => { fetchAdmins(); }, []);

    const fetchAdmins = async () => {
        try {
            const res = await API.get('/admin/admins');
            setAdmins(res.data.admins || []);
        } catch (err) {
            toast.error('Failed to load admins');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) {
            toast.error('Password must be at least 6 characters!');
            return;
        }
        try {
            await API.post('/admin/admins', form);
            toast.success('Admin account created! 🎊');
            setShowForm(false);
            setForm({ name: '', email: '', mobile: '', password: '', canHandleSupport: false });
            fetchAdmins();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed!');
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Remove admin access for ${name}?`)) return;
        try {
            await API.delete(`/admin/admins/${id}`);
            toast.success('Admin removed!');
            fetchAdmins();
        } catch (err) {
            toast.error('Failed!');
        }
    };

    const handleToggleSupport = async (id) => {
        try {
            const res = await API.put(`/admin/admins/${id}/toggle-support`);
            toast.success(res.data.message);
            fetchAdmins();
        } catch (err) {
            toast.error('Failed!');
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F5' }}>
            <Sidebar />
            <div style={{ marginLeft: '240px', flex: 1 }}>
                <Navbar title="🛡️ Admin Access Management" />
                <div style={styles.inner}>

                    {/* Info Banner */}
                    <div style={styles.infoBanner}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ fontSize: '48px' }}>🛡️</div>
                            <div>
                                <h2 style={{ color: '#fff', marginBottom: '4px', fontSize: '20px' }}>
                                    Admin Access Control
                                </h2>
                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                                    Create and manage admin accounts. All admins have full access to this panel.
                                </p>
                            </div>
                        </div>
                        <div style={styles.bannerStats}>
                            <div style={styles.bannerStat}>
                                <div style={styles.bannerStatValue}>{admins.length}</div>
                                <div style={styles.bannerStatLabel}>Total Admins</div>
                            </div>
                        </div>
                    </div>

                    {/* Top Row */}
                    <div style={styles.topRow}>
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1A0A0A' }}>
                                Admin Accounts ({admins.length})
                            </h3>
                            <p style={{ fontSize: '13px', color: '#757575', marginTop: '4px' }}>
                                These accounts have full access to the admin panel
                            </p>
                        </div>
                        <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
                            {showForm ? '✕ Cancel' : '➕ Create Admin Account'}
                        </button>
                    </div>

                    {/* Create Form */}
                    {showForm && (
                        <div style={styles.formCard}>
                            <h3 style={styles.formTitle}>➕ Create New Admin Account</h3>
                            <form onSubmit={handleSubmit}>
                                <div style={styles.formGrid}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Full Name *</label>
                                        <input style={styles.input} placeholder="Admin full name"
                                            value={form.name}
                                            onChange={e => setForm({ ...form, name: e.target.value })}
                                            required />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Mobile Number *</label>
                                        <input style={styles.input} placeholder="10 digit mobile number"
                                            value={form.mobile}
                                            onChange={e => setForm({ ...form, mobile: e.target.value })}
                                            required />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Email Address *</label>
                                        <input type="email" style={styles.input} placeholder="admin@gettimelam.com"
                                            value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })}
                                            required />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Password *</label>
                                        <input type="password" style={styles.input} placeholder="Min 6 characters"
                                            value={form.password}
                                            onChange={e => setForm({ ...form, password: e.target.value })}
                                            required />
                                    </div>
                                </div>

                                <label style={styles.supportCheckboxRow}>
                                    <input type="checkbox"
                                        checked={form.canHandleSupport}
                                        onChange={e => setForm({ ...form, canHandleSupport: e.target.checked })} />
                                    <span>🎧 Can handle Support Chats — this admin can be assigned live chat conversations from members and service providers</span>
                                </label>

                                <div style={styles.formNote}>
                                    ⚠️ <strong>Important:</strong> This account will have <strong>full admin access</strong> to the panel including user management, bookings, and financial data. Share credentials securely.
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button type="submit" style={styles.submitBtn}>
                                        🛡️ Create Admin Account
                                    </button>
                                    <button type="button" style={styles.cancelBtn}
                                        onClick={() => setShowForm(false)}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Admins List */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏳</div>
                            Loading admins...
                        </div>
                    ) : admins.length === 0 ? (
                        <div style={styles.empty}>
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛡️</div>
                            <h3 style={{ color: '#1A0A0A', marginBottom: '8px' }}>No Other Admin Accounts</h3>
                            <p style={{ color: '#999', fontSize: '13px' }}>
                                Create admin accounts to give others access to this panel
                            </p>
                        </div>
                    ) : (
                        <div>
                            {admins.map((admin) => (
                                <div key={admin._id} style={styles.adminCard}>
                                    <div style={styles.adminLeft}>
                                        <div style={styles.adminAvatar}>
                                            {admin.name?.charAt(0)?.toUpperCase() || 'A'}
                                        </div>
                                        <div>
                                            <div style={styles.adminName}>{admin.name}</div>
                                            <div style={styles.adminMeta}>📱 {admin.mobile}</div>
                                            <div style={styles.adminMeta}>📧 {admin.email}</div>
                                            <div style={styles.adminMeta}>
                                                📅 Created: {new Date(admin.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'long', year: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={styles.adminRight}>
                                        <span style={styles.adminBadge}>🛡️ Full Admin</span>
                                        {admin.canHandleSupport && (
                                            <span style={styles.supportBadge}>🎧 Support Agent</span>
                                        )}
                                        <button style={styles.toggleSupportBtn}
                                            onClick={() => handleToggleSupport(admin._id)}>
                                            {admin.canHandleSupport ? 'Remove from Support' : 'Make Support Agent'}
                                        </button>
                                        <button style={styles.deleteBtn}
                                            onClick={() => handleDelete(admin._id, admin.name)}>
                                            🗑️ Remove Access
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Security Note */}
                    <div style={styles.securityNote}>
                        <h4 style={{ color: '#1A0A0A', marginBottom: '8px' }}>🔒 Security Guidelines</h4>
                        <ul style={{ color: '#757575', fontSize: '13px', paddingLeft: '16px', lineHeight: 1.8 }}>
                            <li>Only create admin accounts for trusted team members</li>
                            <li>Use strong passwords with letters, numbers and symbols</li>
                            <li>Remove admin access immediately when no longer needed</li>
                            <li>Never share admin credentials via email or chat</li>
                            <li>Regularly review and audit admin accounts</li>
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    );
};

const styles = {
    inner: { padding: '28px' },
    infoBanner: { background: 'linear-gradient(135deg, #1A0A0A, #3D1A1A)', borderRadius: '16px', padding: '28px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    bannerStats: { display: 'flex', gap: '24px' },
    bannerStat: { textAlign: 'center', background: 'rgba(255,255,255,0.1)', padding: '16px 24px', borderRadius: '12px' },
    bannerStatValue: { fontFamily: "'Georgia', serif", fontSize: '32px', fontWeight: '700', color: '#C9A84C' },
    bannerStatLabel: { fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' },
    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
    addBtn: { padding: '10px 20px', background: '#1A0A0A', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
    formCard: { background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #E0E0E0' },
    formTitle: { fontSize: '16px', fontWeight: '700', color: '#1A0A0A', marginBottom: '20px' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
    formGroup: { marginBottom: '0' },
    label: { display: 'block', fontSize: '11px', fontWeight: '700', color: '#555', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    input: { width: '100%', padding: '10px 14px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'sans-serif' },
    formNote: { background: '#FFF8E1', border: '1px solid #FFE082', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#F57F17', marginBottom: '16px', lineHeight: 1.6 },
    submitBtn: { padding: '12px 28px', background: 'linear-gradient(135deg, #1A0A0A, #3D1A1A)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
    cancelBtn: { padding: '12px 20px', background: '#F5F5F5', color: '#555', border: '1px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
    adminCard: { background: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #E0E0E0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    adminLeft: { display: 'flex', gap: '16px', alignItems: 'flex-start' },
    adminAvatar: { width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, #1A0A0A, #3D1A1A)', color: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '700', flexShrink: 0 },
    adminName: { fontWeight: '700', color: '#1A0A0A', fontSize: '16px', marginBottom: '4px' },
    adminMeta: { fontSize: '12px', color: '#757575', marginBottom: '2px' },
    adminRight: { display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 },
    adminBadge: { background: '#FCE4EC', color: '#880E4F', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700' },
    supportBadge: { background: '#E3F2FD', color: '#1565C0', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700' },
    toggleSupportBtn: { background: '#fff', border: '1.5px solid #1565C0', color: '#1565C0', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
    supportCheckboxRow: { display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: '#333', background: '#F3F8FF', padding: '12px 14px', borderRadius: '8px', marginBottom: '16px', cursor: 'pointer', lineHeight: 1.5 },
    deleteBtn: { padding: '8px 16px', background: '#FFEBEE', color: '#C62828', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    empty: { textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    securityNote: { background: '#fff', borderRadius: '12px', padding: '20px', marginTop: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #E0E0E0' },
};

export default AdminAccess;