import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import {
    IconStore, IconClock, IconCheck, IconX, IconTrash, IconBan, IconUsers,
} from '../../components/AdminIcons';

const C = {
    bg: '#0E0912',
    panel: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.08)',
    text: '#F3EDF7',
    dim: '#9C8FA6',
    gold: '#E8B84B',
    green: '#4ADE80',
    amber: '#FBBF24',
    red: '#F87171',
    violet: '#A78BFA',
};

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
            toast.success('Vendor approved');
            fetchVendors();
        } catch (err) {
            toast.error('Failed to approve');
        }
    };

    const rejectVendor = async (id) => {
        try {
            await API.put(`/admin/vendors/${id}/reject`);
            toast.success('Vendor rejected');
            fetchVendors();
        } catch (err) {
            toast.error('Failed to reject');
        }
    };

    const deleteVendor = async (id) => {
        if (!window.confirm('Delete this vendor?')) return;
        try {
            await API.delete(`/admin/vendors/${id}`);
            toast.success('Vendor deleted');
            fetchVendors();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const deleteService = async (id, name) => {
        if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
        try {
            await API.delete(`/admin/services/${id}`);
            toast.success('Service deleted');
            fetchServices();
        } catch (err) {
            toast.error('Failed to delete service');
        }
    };

    const verifyService = async (id, isVerified) => {
        try {
            await API.put(`/admin/services/${id}/verify`, { isVerified: !isVerified });
            toast.success(isVerified ? 'Service unverified' : 'Service verified');
            fetchServices();
        } catch (err) {
            toast.error('Failed to update service');
        }
    };

    const pending = vendors.filter(v => !v.isApproved);
    const approved = vendors.filter(v => v.isApproved);

    const stats = [
        { label: 'Total Vendors', value: vendors.length, accent: C.gold, Icon: IconUsers },
        { label: 'Pending Approval', value: pending.length, accent: C.amber, Icon: IconClock },
        { label: 'Approved', value: approved.length, accent: C.green, Icon: IconCheck },
        { label: 'Total Services', value: services.length, accent: C.violet, Icon: IconStore },
    ];

    const tabs = [
        { id: 'pending', label: `Pending (${pending.length})` },
        { id: 'approved', label: `Approved (${approved.length})` },
        { id: 'services', label: `Services (${services.length})` },
    ];

    const VendorCard = ({ v, isPending }) => (
        <div style={styles.vendorCard}>
            <div style={styles.vendorInfo}>
                <div style={styles.vendorAvatar}>
                    {(v.businessName || 'V').charAt(0).toUpperCase()}
                </div>
                <div>
                    <div style={styles.vendorName}>{v.businessName}</div>
                    <div style={styles.vendorMeta}>{v.ownerName} &middot; {v.mobile}</div>
                    <div style={styles.vendorMeta}>{v.email}</div>
                    <div style={styles.vendorMeta}>{v.category} &middot; {v.city}{v.district ? `, ${v.district}` : ''}</div>
                    <div style={styles.vendorMeta}>Registered {new Date(v.createdAt).toLocaleDateString('en-IN')}</div>
                </div>
            </div>
            <div style={styles.vendorActions}>
                {isPending ? (
                    <>
                        <span style={{ ...styles.chip, borderColor: C.amber, color: C.amber }}>
                            <IconClock size={12} color={C.amber} /> Pending
                        </span>
                        <button style={{ ...styles.btn, borderColor: C.green, color: C.green }}
                            onClick={() => approveVendor(v._id)}>
                            <IconCheck size={13} color={C.green} /> Approve
                        </button>
                        <button style={{ ...styles.btn, borderColor: C.red, color: C.red }}
                            onClick={() => rejectVendor(v._id)}>
                            <IconX size={13} color={C.red} /> Reject
                        </button>
                    </>
                ) : (
                    <>
                        <span style={{ ...styles.chip, borderColor: C.green, color: C.green }}>
                            <IconCheck size={12} color={C.green} /> Approved
                        </span>
                        <button style={{ ...styles.btn, borderColor: C.amber, color: C.amber }}
                            onClick={() => rejectVendor(v._id)}>
                            <IconBan size={13} color={C.amber} /> Deactivate
                        </button>
                        <button style={{ ...styles.btn, borderColor: C.red, color: C.red }}
                            onClick={() => deleteVendor(v._id)}>
                            <IconTrash size={13} color={C.red} /> Delete
                        </button>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: C.bg }}>
            <Sidebar />
            <div style={{ marginLeft: '240px', flex: 1 }}>
                <Navbar title="Manage Service Providers" />
                <div style={styles.inner}>

                    {/* Stats */}
                    <div style={styles.statsRow}>
                        {stats.map(s => (
                            <div key={s.label} style={styles.statCard}>
                                <div style={{ ...styles.statAccent, background: s.accent, boxShadow: `0 0 14px ${s.accent}66` }} />
                                <div style={styles.statTop}>
                                    <div style={styles.statValue}>{s.value}</div>
                                    <div style={{ ...styles.statIcon, borderColor: `${s.accent}55` }}>
                                        <s.Icon size={17} color={s.accent} />
                                    </div>
                                </div>
                                <div style={styles.statLabel}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Tabs */}
                    <div style={styles.tabs}>
                        {tabs.map(tab => (
                            <button key={tab.id}
                                style={{ ...styles.tabBtn, ...(activeTab === tab.id ? styles.tabBtnActive : {}) }}
                                onClick={() => setActiveTab(tab.id)}>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* PENDING */}
                    {activeTab === 'pending' && (
                        <div>
                            {pending.length === 0 ? (
                                <div style={styles.empty}>
                                    <IconCheck size={34} color={C.green} />
                                    <p style={styles.emptyText}>No pending approvals</p>
                                </div>
                            ) : (
                                pending.map(v => <VendorCard key={v._id} v={v} isPending />)
                            )}
                        </div>
                    )}

                    {/* APPROVED */}
                    {activeTab === 'approved' && (
                        <div>
                            {approved.length === 0 ? (
                                <div style={styles.empty}>
                                    <IconStore size={34} color={C.dim} />
                                    <p style={styles.emptyText}>No approved vendors yet</p>
                                </div>
                            ) : (
                                approved.map(v => <VendorCard key={v._id} v={v} />)
                            )}
                        </div>
                    )}

                    {/* SERVICES TABLE */}
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
                                        <tr key={s._id}
                                            style={styles.tr}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.035)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ ...styles.td, color: C.dim }}>{String(i + 1).padStart(2, '0')}</td>
                                            <td style={styles.td}>
                                                <div style={{ fontWeight: '600', color: C.text }}>{s.businessName}</div>
                                                <div style={{ fontSize: '11px', color: C.dim, marginTop: '2px' }}>{s.ownerName}</div>
                                            </td>
                                            <td style={styles.td}>{s.category}</td>
                                            <td style={styles.td}>{s.city}{s.district ? `, ${s.district}` : ''}</td>
                                            <td style={{ ...styles.td, color: C.gold, fontWeight: '600' }}>
                                                {s.priceMin && s.priceMax
                                                    ? `₹${s.priceMin.toLocaleString()} – ₹${s.priceMax.toLocaleString()}`
                                                    : s.price || '—'}
                                            </td>
                                            <td style={styles.td}>
                                                {s.isVerified ? (
                                                    <span style={{ ...styles.chip, borderColor: C.green, color: C.green }}>
                                                        <IconCheck size={12} color={C.green} /> Verified
                                                    </span>
                                                ) : (
                                                    <span style={{ ...styles.chip, borderColor: C.amber, color: C.amber }}>
                                                        <IconClock size={12} color={C.amber} /> Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td style={styles.td}>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        style={{ ...styles.btn, borderColor: s.isVerified ? C.amber : C.green, color: s.isVerified ? C.amber : C.green }}
                                                        onClick={() => verifyService(s._id, s.isVerified)}>
                                                        {s.isVerified
                                                            ? <><IconClock size={13} color={C.amber} /> Unverify</>
                                                            : <><IconCheck size={13} color={C.green} /> Verify</>}
                                                    </button>
                                                    <button
                                                        style={{ ...styles.btn, borderColor: C.red, color: C.red }}
                                                        onClick={() => deleteService(s._id, s.businessName)}>
                                                        <IconTrash size={13} color={C.red} /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {services.length === 0 && (
                                        <tr>
                                            <td colSpan={7} style={{ ...styles.td, textAlign: 'center', color: C.dim, padding: '44px' }}>
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
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '26px' },
    statCard: {
        position: 'relative',
        background: C.panel,
        border: `1px solid ${C.border}`,
        borderRadius: '14px',
        padding: '18px 20px 16px',
        overflow: 'hidden',
    },
    statAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: '2px' },
    statTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    statValue: { fontSize: '30px', fontWeight: '700', color: C.text, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' },
    statIcon: {
        width: '36px', height: '36px', borderRadius: '10px',
        border: '1px solid', background: 'rgba(255,255,255,0.03)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    statLabel: { fontSize: '11.5px', color: C.dim, marginTop: '8px', letterSpacing: '1px', textTransform: 'uppercase' },
    tabs: {
        display: 'inline-flex', gap: '4px', marginBottom: '22px',
        background: C.panel, border: `1px solid ${C.border}`,
        borderRadius: '12px', padding: '4px',
    },
    tabBtn: {
        padding: '9px 20px', border: 'none', borderRadius: '9px',
        fontSize: '13px', fontWeight: '600', cursor: 'pointer',
        background: 'transparent', color: C.dim, transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
    },
    tabBtnActive: {
        background: 'linear-gradient(135deg, rgba(232,184,75,0.2), rgba(232,184,75,0.08))',
        color: C.gold,
        boxShadow: 'inset 0 0 0 1px rgba(232,184,75,0.4)',
    },
    vendorCard: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '18px 20px', borderRadius: '14px', marginBottom: '12px', gap: '16px',
        background: C.panel, border: `1px solid ${C.border}`,
    },
    vendorInfo: { display: 'flex', gap: '16px', alignItems: 'flex-start' },
    vendorAvatar: {
        width: '48px', height: '48px', borderRadius: '13px',
        background: 'rgba(232,184,75,0.1)', border: '1px solid rgba(232,184,75,0.45)',
        color: C.gold, fontSize: '19px', fontWeight: '700',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    vendorName: { fontWeight: '650', color: C.text, fontSize: '15px', marginBottom: '4px' },
    vendorMeta: { fontSize: '12px', color: C.dim, marginBottom: '2px' },
    vendorActions: { display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' },
    chip: {
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '4px 11px', borderRadius: '999px',
        fontSize: '11.5px', fontWeight: '600',
        border: '1px solid', background: 'rgba(255,255,255,0.03)',
        whiteSpace: 'nowrap',
    },
    btn: {
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '7px 13px', borderRadius: '9px',
        fontSize: '12px', fontWeight: '600', cursor: 'pointer',
        border: '1px solid', background: 'rgba(255,255,255,0.03)',
        transition: 'all 0.15s ease', whiteSpace: 'nowrap',
    },
    empty: {
        textAlign: 'center', padding: '56px',
        background: C.panel, border: `1px solid ${C.border}`, borderRadius: '14px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
    },
    emptyText: { color: C.dim, fontSize: '14px', margin: 0 },
    tableBox: {
        background: C.panel, border: `1px solid ${C.border}`,
        borderRadius: '14px', overflow: 'hidden',
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: {
        padding: '13px 16px', background: 'rgba(255,255,255,0.03)',
        color: C.dim, fontSize: '11px', fontWeight: '650', textAlign: 'left',
        textTransform: 'uppercase', letterSpacing: '1.2px',
        borderBottom: `1px solid ${C.border}`,
    },
    tr: { transition: 'background 0.15s ease' },
    td: {
        padding: '13px 16px', fontSize: '13px', color: 'rgba(243,237,247,0.85)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
    },
};

export default Services;
