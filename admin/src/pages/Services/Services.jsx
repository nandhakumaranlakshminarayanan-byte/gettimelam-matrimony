import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const Services = () => {
    const [vendors, setVendors] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');

    useEffect(() => {
        fetchVendors();
        fetchServices();
    }, []);

    const fetchVendors = async () => {
        try {
            const res = await API.get('/admin/vendors');
            setVendors(res.data.vendors || []);
        } catch (err) {
            toast.error('Failed to load vendors');
        } finally {
            setLoading(false);
        }
    };

    const fetchServices = async () => {
        try {
            const res = await API.get('/services');
            setServices(res.data.services || []);
        } catch (err) {
            console.log('No services');
        }
    };

    const approveVendor = async (id) => {
        try {
            await API.put(`/admin/vendors/${id}/approve`);
            toast.success('✅ Vendor approved!');
            fetchVendors();
        } catch (err) {
            toast.error('Failed to approve');
        }
    };

    const rejectVendor = async (id) => {
        try {
            await API.put(`/admin/vendors/${id}/reject`);
            toast.success('❌ Vendor rejected!');
            fetchVendors();
        } catch (err) {
            toast.error('Failed to reject');
        }
    };

    const deleteVendor = async (id) => {
        if (!window.confirm('Delete this vendor?')) return;
        try {
            await API.delete(`/admin/vendors/${id}`);
            toast.success('Vendor deleted!');
            fetchVendors();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const deleteService = async (id, name) => {
        if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
        try {
            await API.delete(`/admin/services/${id}`);
            toast.success('🗑️ Service deleted!');
            fetchServices();
        } catch (err) {
            toast.error('Failed to delete service');
        }
    };

    const verifyService = async (id, isVerified) => {
        try {
            await API.put(`/admin/services/${id}/verify`, { isVerified: !isVerified });
            toast.success(isVerified ? '⏳ Service unverified!' : '✅ Service verified!');
            fetchServices();
        } catch (err) {
            toast.error('Failed to update service');
        }
    };

    const pending = vendors.filter(v => !v.isApproved);
    const approved = vendors.filter(v => v.isApproved);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F5' }}>
            <Sidebar />
            <div style={{ marginLeft: '240px', flex: 1 }}>
                <Navbar title="🏪 Manage Service Providers" />
                <div style={styles.inner}>

                    {/* Stats */}
                    <div style={styles.statsRow}>
                        {[
                            { label: 'Total Vendors', value: vendors.length, color: '#E3F2FD', border: '#1565C0' },
                            { label: 'Pending Approval', value: pending.length, color: '#FFF8E1', border: '#F57F17' },
                            { label: 'Approved', value: approved.length, color: '#E8F5E9', border: '#2E7D32' },
                            { label: 'Total Services', value: services.length, color: '#F3E5F5', border: '#6A1B9A' },
                        ].map(s => (
                            <div key={s.label} style={{ ...styles.statCard, background: s.color, borderLeft: `4px solid ${s.border}` }}>
                                <div style={styles.statValue}>{s.value}</div>
                                <div style={styles.statLabel}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Tabs */}
                    <div style={styles.tabs}>
                        {[
                            { id: 'pending', label: `⏳ Pending (${pending.length})` },
                            { id: 'approved', label: `✅ Approved (${approved.length})` },
                            { id: 'services', label: `🏪 Services (${services.length})` },
                        ].map(tab => (
                            <button key={tab.id}
                                style={{ ...styles.tabBtn, ...(activeTab === tab.id ? styles.tabBtnActive : {}) }}
                                onClick={() => setActiveTab(tab.id)}>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* ── PENDING VENDORS ── */}
                    {activeTab === 'pending' && (
                        <div>
                            {pending.length === 0 ? (
                                <div style={styles.empty}>
                                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
                                    <p style={{ color: '#999' }}>No pending approvals!</p>
                                </div>
                            ) : (
                                pending.map(v => (
                                    <div key={v._id} style={{ ...styles.vendorCard, border: '1px solid #FFE082', background: '#FFFDE7' }}>
                                        <div style={styles.vendorInfo}>
                                            <div style={styles.vendorAvatar}>🏪</div>
                                            <div>
                                                <div style={styles.vendorName}>{v.businessName}</div>
                                                <div style={styles.vendorMeta}>👤 {v.ownerName} • 📱 {v.mobile}</div>
                                                <div style={styles.vendorMeta}>📧 {v.email}</div>
                                                <div style={styles.vendorMeta}>🏷️ {v.category} • 📍 {v.city}, {v.district}</div>
                                                <div style={styles.vendorMeta}>📅 Registered: {new Date(v.createdAt).toLocaleDateString('en-IN')}</div>
                                            </div>
                                        </div>
                                        <div style={styles.vendorActions}>
                                            <span style={{ ...styles.statusBadge, background: '#FFF8E1', color: '#F57F17' }}>
                                                ⏳ Pending
                                            </span>
                                            <button style={{ ...styles.actionBtn, background: '#E8F5E9', color: '#2E7D32' }}
                                                onClick={() => approveVendor(v._id)}>
                                                ✅ Approve
                                            </button>
                                            <button style={{ ...styles.actionBtn, background: '#FFEBEE', color: '#C62828' }}
                                                onClick={() => rejectVendor(v._id)}>
                                                ❌ Reject
                                            </button>
                                            <button style={{ ...styles.actionBtn, background: '#F5F5F5', color: '#333' }}
                                                onClick={() => deleteVendor(v._id)}>
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* ── APPROVED VENDORS ── */}
                    {activeTab === 'approved' && (
                        <div>
                            {approved.length === 0 ? (
                                <div style={styles.empty}>
                                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏪</div>
                                    <p style={{ color: '#999' }}>No approved vendors yet!</p>
                                </div>
                            ) : (
                                approved.map(v => (
                                    <div key={v._id} style={{ ...styles.vendorCard, border: '1px solid #A5D6A7', background: '#F9FBE7' }}>
                                        <div style={styles.vendorInfo}>
                                            <div style={styles.vendorAvatar}>🏪</div>
                                            <div>
                                                <div style={styles.vendorName}>{v.businessName}</div>
                                                <div style={styles.vendorMeta}>👤 {v.ownerName} • 📱 {v.mobile}</div>
                                                <div style={styles.vendorMeta}>📧 {v.email}</div>
                                                <div style={styles.vendorMeta}>🏷️ {v.category} • 📍 {v.city}, {v.district}</div>
                                                <div style={styles.vendorMeta}>📅 Registered: {new Date(v.createdAt).toLocaleDateString('en-IN')}</div>
                                            </div>
                                        </div>
                                        <div style={styles.vendorActions}>
                                            <span style={{ ...styles.statusBadge, background: '#E8F5E9', color: '#2E7D32' }}>
                                                ✅ Approved
                                            </span>
                                            <button style={{ ...styles.actionBtn, background: '#FFEBEE', color: '#C62828' }}
                                                onClick={() => rejectVendor(v._id)}>
                                                🚫 Deactivate
                                            </button>
                                            <button style={{ ...styles.actionBtn, background: '#F5F5F5', color: '#333' }}
                                                onClick={() => deleteVendor(v._id)}>
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* ── SERVICES ── */}
                    {activeTab === 'services' && (
                        <div style={styles.tableBox}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        {['#', 'Business', 'Category', 'Location', 'Price', 'Status', 'Actions'].map(h => (
                                            <th key={h} style={styles.th}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {services.map((s, i) => (
                                        <tr key={s._id} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                                            <td style={styles.td}>{i + 1}</td>
                                            <td style={styles.td}>
                                                <div style={{ fontWeight: '600' }}>{s.businessName}</div>
                                                <div style={{ fontSize: '11px', color: '#999' }}>{s.ownerName}</div>
                                            </td>
                                            <td style={styles.td}>{s.category}</td>
                                            <td style={styles.td}>{s.city}{s.district ? `, ${s.district}` : ''}</td>
                                            <td style={styles.td}>
                                                {s.priceMin && s.priceMax
                                                    ? `₹${s.priceMin.toLocaleString()} - ₹${s.priceMax.toLocaleString()}`
                                                    : s.price || '—'}
                                            </td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                                                    background: s.isVerified ? '#E8F5E9' : '#FFF8E1',
                                                    color: s.isVerified ? '#2E7D32' : '#F57F17'
                                                }}>
                                                    {s.isVerified ? '✅ Verified' : '⏳ Pending'}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <button
                                                        style={{ ...styles.actionBtn, background: s.isVerified ? '#FFF8E1' : '#E8F5E9', color: s.isVerified ? '#F57F17' : '#2E7D32', fontSize: '11px', padding: '5px 10px' }}
                                                        onClick={() => verifyService(s._id, s.isVerified)}>
                                                        {s.isVerified ? '⏳ Unverify' : '✅ Verify'}
                                                    </button>
                                                    <button
                                                        style={{ ...styles.actionBtn, background: '#FFEBEE', color: '#C62828', fontSize: '11px', padding: '5px 10px' }}
                                                        onClick={() => deleteService(s._id, s.businessName)}>
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {services.length === 0 && (
                                        <tr>
                                            <td colSpan={7} style={{ ...styles.td, textAlign: 'center', color: '#999', padding: '40px' }}>
                                                No services listed yet
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
    inner: { padding: '28px' },
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
    statCard: { borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    statValue: { fontFamily: "'Georgia', serif", fontSize: '32px', fontWeight: '700', color: '#1A0A0A', marginBottom: '4px' },
    statLabel: { fontSize: '13px', color: '#757575' },
    tabs: { display: 'flex', gap: '8px', marginBottom: '20px' },
    tabBtn: { padding: '10px 20px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', background: '#fff', color: '#555' },
    tabBtnActive: { background: '#1A0A0A', color: '#fff', border: '1.5px solid #1A0A0A' },
    vendorCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderRadius: '12px', marginBottom: '12px', gap: '16px' },
    vendorInfo: { display: 'flex', gap: '16px', alignItems: 'flex-start' },
    vendorAvatar: { fontSize: '32px', width: '52px', height: '52px', background: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', flexShrink: 0 },
    vendorName: { fontWeight: '700', color: '#1A0A0A', fontSize: '16px', marginBottom: '4px' },
    vendorMeta: { fontSize: '12px', color: '#757575', marginBottom: '2px' },
    vendorActions: { display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' },
    statusBadge: { padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
    actionBtn: { padding: '8px 16px', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    empty: { textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '12px' },
    tableBox: { background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '12px 16px', background: '#1A0A0A', color: '#fff', fontSize: '12px', fontWeight: '600', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.5px' },
    td: { padding: '12px 16px', fontSize: '13px', color: '#333', borderBottom: '1px solid #F0F0F0' },
};

export default Services;