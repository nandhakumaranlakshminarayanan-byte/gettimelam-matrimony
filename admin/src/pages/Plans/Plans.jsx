import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const CARD_COLORS = [
    { bg: '#E3F2FD', border: '#1565C0' },
    { bg: '#F3E5F5', border: '#6A1B9A' },
    { bg: '#FFF8E1', border: '#F57F17' },
    { bg: '#E8F5E9', border: '#2E7D32' },
    { bg: '#FCE4EC', border: '#880E4F' },
];

const emptyForm = { name: '', targetType: 'member', price: '', originalPrice: '', features: '' };

const Plans = () => {
    const [plans, setPlans] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [users, setUsers] = useState([]);
    const [typeFilter, setTypeFilter] = useState('member');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const [assignUserId, setAssignUserId] = useState('');
    const [assignPlanId, setAssignPlanId] = useState('');
    const [assigning, setAssigning] = useState(false);

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        try {
            const [plansRes, subsRes, usersRes, vendorsRes] = await Promise.all([
                API.get('/plans/admin/all'),
                API.get('/subscriptions/admin/all'),
                API.get('/admin/users'),
                API.get('/admin/vendors'), // /admin/users excludes service providers entirely — fetch them separately
            ]);
            setPlans(plansRes.data.plans || []);
            setSubscriptions(subsRes.data.subscriptions || []);
            // Merge members + service providers into one assignable list
            setUsers([...(usersRes.data.users || []), ...(vendorsRes.data.vendors || [])]);
        } catch (err) {
            toast.error('Failed to load plans');
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await API.post('/plans', {
                name: form.name,
                targetType: form.targetType,
                price: Number(form.price),
                originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
                features: form.features.split('\n').map(f => f.trim()).filter(Boolean),
            });
            toast.success('Plan created!');
            setShowForm(false);
            setForm(emptyForm);
            fetchAll();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed!');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (plan) => {
        try {
            await API.put(`/plans/${plan._id}`, { isActive: !plan.isActive });
            toast.success(plan.isActive ? 'Plan hidden from new signups' : 'Plan reactivated');
            fetchAll();
        } catch (err) {
            toast.error('Failed!');
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete "${name}"? Existing subscribers keep what they already have — this only removes it for future assignment.`)) return;
        try {
            await API.delete(`/plans/${id}`);
            toast.success('Plan deleted');
            fetchAll();
        } catch (err) {
            toast.error('Failed!');
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!assignUserId || !assignPlanId) { toast.error('Pick a user and a plan'); return; }
        setAssigning(true);
        try {
            const res = await API.post('/subscriptions/assign', { userId: assignUserId, planId: assignPlanId });
            toast.success(res.data.message);
            setAssignUserId(''); setAssignPlanId('');
            fetchAll();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed!');
        } finally {
            setAssigning(false);
        }
    };

    const visiblePlans = plans.filter(p => p.targetType === typeFilter);
    const assignablePlans = plans.filter(p => p.isActive && p.targetType === typeFilter);
    const activeSubs = subscriptions.filter(s => new Date(s.expiresAt) > new Date());
    const totalRevenue = activeSubs.reduce((sum, s) => sum + (s.priceSnapshot || 0), 0);

    return (
        <div style={styles.layout}>
            <Sidebar />
            <div style={styles.content}>
                <Navbar title="💳 Plans & Subscriptions" />
                <div style={styles.inner}>

                    {/* Revenue Summary */}
                    <div style={styles.revenueBanner}>
                        <div style={styles.revenueItem}>
                            <div style={styles.revenueValue}>₹{totalRevenue.toLocaleString('en-IN')}</div>
                            <div style={styles.revenueLabel}>Active Subscription Value</div>
                        </div>
                        <div style={styles.revenueItem}>
                            <div style={styles.revenueValue}>{activeSubs.length}</div>
                            <div style={styles.revenueLabel}>Active Subscribers</div>
                        </div>
                        <div style={styles.revenueItem}>
                            <div style={styles.revenueValue}>{subscriptions.length - activeSubs.length}</div>
                            <div style={styles.revenueLabel}>Expired</div>
                        </div>
                    </div>

                    {/* Type filter + Create button */}
                    <div style={styles.topRow}>
                        <div style={styles.tabs}>
                            {[
                                { id: 'member', label: '👤 Member Plans' },
                                { id: 'service', label: '🏪 Service Provider Plans' },
                            ].map(t => (
                                <button key={t.id}
                                    style={{ ...styles.tabBtn, ...(typeFilter === t.id ? styles.tabBtnActive : {}) }}
                                    onClick={() => { setTypeFilter(t.id); setAssignUserId(''); setAssignPlanId(''); }}>
                                    {t.label}
                                </button>
                            ))}
                        </div>
                        <button style={styles.addBtn} onClick={() => { setShowForm(!showForm); setForm({ ...emptyForm, targetType: typeFilter }); }}>
                            {showForm ? '✕ Cancel' : '➕ Create Plan'}
                        </button>
                    </div>

                    {/* Create Plan Form */}
                    {showForm && (
                        <form onSubmit={handleCreate} style={styles.form}>
                            <h3 style={styles.formTitle}>Create New Plan</h3>
                            <div style={styles.formGrid}>
                                <div>
                                    <label style={styles.label}>Plan Name</label>
                                    <input style={styles.input} placeholder="e.g. Diamond Plan" value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })} required />
                                </div>
                                <div>
                                    <label style={styles.label}>For</label>
                                    <select style={styles.input} value={form.targetType}
                                        onChange={e => setForm({ ...form, targetType: e.target.value })}>
                                        <option value="member">👤 Member (matrimony)</option>
                                        <option value="service">🏪 Service Provider</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={styles.label}>Price (₹)</label>
                                    <input style={styles.input} type="number" placeholder="2200" value={form.price}
                                        onChange={e => setForm({ ...form, price: e.target.value })} required />
                                </div>
                                <div>
                                    <label style={styles.label}>Original Price (₹) — optional, for strikethrough</label>
                                    <input style={styles.input} type="number" placeholder="5000" value={form.originalPrice}
                                        onChange={e => setForm({ ...form, originalPrice: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={styles.label}>Features — one per line</label>
                                <textarea style={{ ...styles.input, height: '90px', resize: 'vertical' }}
                                    placeholder={'80 Contacts\nUnlimited Validity\nWhatsApp Support\nHoroscope View'}
                                    value={form.features}
                                    onChange={e => setForm({ ...form, features: e.target.value })} />
                            </div>
                            <p style={{ fontSize: '12px', color: '#999', marginBottom: '14px' }}>
                                📌 Duration is fixed at 1 year for all plans. Editing this plan later only affects new subscribers — existing ones keep the price and features they signed up with.
                            </p>
                            <button type="submit" style={{ ...styles.submitBtn, opacity: saving ? 0.7 : 1 }} disabled={saving}>
                                {saving ? 'Creating...' : '💳 Create Plan'}
                            </button>
                        </form>
                    )}

                    {/* Plan Cards */}
                    <div style={styles.plansGrid}>
                        {visiblePlans.map((p, i) => {
                            const color = CARD_COLORS[i % CARD_COLORS.length];
                            const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : null;
                            const subCount = subscriptions.filter(s => s.plan === p._id || s.planNameSnapshot === p.name).length;
                            return (
                                <div key={p._id} style={{
                                    ...styles.planCard, background: color.bg, borderTop: `4px solid ${color.border}`,
                                    opacity: p.isActive ? 1 : 0.55,
                                }}>
                                    {!p.isActive && <div style={styles.hiddenBadge}>Hidden from new signups</div>}
                                    <div style={styles.planName}>{p.name}</div>
                                    <div style={styles.planPrice}>₹{p.price.toLocaleString('en-IN')}</div>
                                    {p.originalPrice && (
                                        <>
                                            <div style={styles.planOriginal}>₹{p.originalPrice.toLocaleString('en-IN')}</div>
                                            <div style={{ ...styles.planDiscount, color: color.border }}>{discount}% OFF</div>
                                        </>
                                    )}
                                    <div style={styles.featureList}>
                                        {(p.features || []).map(f => (
                                            <div key={f} style={styles.featureItem}>✅ {f}</div>
                                        ))}
                                    </div>
                                    <div style={styles.planFooter}>
                                        <span style={styles.subCount}>{subCount} subscriber{subCount !== 1 ? 's' : ''}</span>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button style={styles.toggleBtn} onClick={() => handleToggleActive(p)}>
                                                {p.isActive ? '🚫 Hide' : '✅ Show'}
                                            </button>
                                            <button style={styles.deleteBtnSmall} onClick={() => handleDelete(p._id, p.name)}>🗑️</button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {visiblePlans.length === 0 && (
                            <div style={styles.emptyPlans}>
                                <div style={{ fontSize: '40px', marginBottom: '10px' }}>💳</div>
                                <p style={{ color: '#999' }}>No {typeFilter === 'member' ? 'member' : 'service provider'} plans yet</p>
                            </div>
                        )}
                    </div>

                    {/* Assign Plan */}
                    <div style={styles.assignBox}>
                        <h3 style={styles.formTitle}>🎁 Assign Plan to a User</h3>
                        {typeFilter === 'service' && users.filter(u => u.role === 'service').length === 0 && (
                            <p style={styles.noProvidersHint}>
                                ⚠️ No service provider accounts are registered yet — nothing to assign this plan to until one signs up.
                            </p>
                        )}
                        {typeFilter === 'member' && users.filter(u => u.role === 'member').length === 0 && (
                            <p style={styles.noProvidersHint}>
                                ⚠️ No member accounts are registered yet.
                            </p>
                        )}
                        <form onSubmit={handleAssign} style={styles.assignRow}>
                            <select style={styles.input} value={assignUserId} onChange={e => { setAssignUserId(e.target.value); setAssignPlanId(''); }} required>
                                <option value="">Select {typeFilter === 'service' ? 'service provider' : 'member'}...</option>
                                {users.filter(u => u.role === typeFilter).map(u => (
                                    <option key={u._id} value={u._id}>
                                        {typeFilter === 'service' ? (u.businessName || u.name) : u.name} — {u.mobile}
                                    </option>
                                ))}
                            </select>
                            <select style={styles.input} value={assignPlanId} onChange={e => setAssignPlanId(e.target.value)} required disabled={!assignUserId}>
                                <option value="">Select plan...</option>
                                {assignablePlans.map(p => (
                                    <option key={p._id} value={p._id}>{p.name} — ₹{p.price.toLocaleString('en-IN')}</option>
                                ))}
                            </select>
                            <button type="submit" style={{ ...styles.submitBtn, opacity: assigning ? 0.7 : 1 }} disabled={assigning}>
                                {assigning ? 'Assigning...' : '🎁 Assign'}
                            </button>
                        </form>
                    </div>

                    {/* Recent Subscribers */}
                    <div style={styles.subscribersBox}>
                        <h3 style={styles.formTitle}>👥 Recent Subscribers</h3>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    {['#', 'Name', 'Mobile', 'Plan', 'Price Paid', 'Assigned', 'Expires', 'Status'].map(h => (
                                        <th key={h} style={styles.th}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {subscriptions.map((s, i) => {
                                    const isActive = new Date(s.expiresAt) > new Date();
                                    return (
                                        <tr key={s._id} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                                            <td style={styles.td}>{i + 1}</td>
                                            <td style={styles.td}>{s.user?.name || s.user?.businessName || '—'}</td>
                                            <td style={styles.td}>{s.user?.mobile}</td>
                                            <td style={styles.td}>{s.planNameSnapshot}</td>
                                            <td style={styles.td}>₹{s.priceSnapshot?.toLocaleString('en-IN')}</td>
                                            <td style={styles.td}>{new Date(s.purchasedAt).toLocaleDateString('en-IN')}</td>
                                            <td style={styles.td}>{new Date(s.expiresAt).toLocaleDateString('en-IN')}</td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                                                    background: isActive ? '#E8F5E9' : '#FFEBEE',
                                                    color: isActive ? '#2E7D32' : '#C62828',
                                                }}>
                                                    {isActive ? '✅ Active' : '❌ Expired'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {subscriptions.length === 0 && (
                                    <tr><td colSpan={8} style={{ ...styles.td, textAlign: 'center', color: '#999', padding: '40px' }}>No subscribers yet</td></tr>
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
    revenueBanner: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' },
    revenueItem: { background: '#1A0A0A', borderRadius: '12px', padding: '20px', textAlign: 'center' },
    revenueValue: { fontFamily: "'Georgia', serif", fontSize: '28px', fontWeight: '700', color: '#F5D98B' },
    revenueLabel: { fontSize: '12px', color: '#ccc', marginTop: '4px' },
    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' },
    tabs: { display: 'inline-flex', gap: '6px', background: '#fff', padding: '4px', borderRadius: '10px', border: '1px solid #E0E0E0' },
    tabBtn: { padding: '9px 18px', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', background: 'transparent', color: '#666' },
    tabBtnActive: { background: '#1A0A0A', color: '#fff' },
    addBtn: { padding: '10px 20px', background: '#1A0A0A', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
    form: { background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    formTitle: { fontSize: '16px', fontWeight: '700', color: '#1A0A0A', marginBottom: '16px' },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' },
    label: { display: 'block', fontSize: '11px', fontWeight: '700', color: '#555', marginBottom: '5px', textTransform: 'uppercase' },
    input: { width: '100%', padding: '10px 14px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
    submitBtn: { padding: '12px 28px', background: 'linear-gradient(135deg, #1A0A0A, #3D1A1A)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' },
    plansGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '18px', marginBottom: '24px' },
    planCard: { borderRadius: '14px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', position: 'relative' },
    hiddenBadge: { fontSize: '10px', fontWeight: '700', color: '#C62828', background: '#fff', display: 'inline-block', padding: '3px 8px', borderRadius: '20px', marginBottom: '8px' },
    planName: { fontSize: '16px', fontWeight: '700', color: '#1A0A0A', marginBottom: '8px' },
    planPrice: { fontSize: '26px', fontWeight: '700', color: '#1A0A0A' },
    planOriginal: { fontSize: '13px', color: '#999', textDecoration: 'line-through', marginTop: '2px' },
    planDiscount: { fontSize: '12px', fontWeight: '700', marginTop: '2px' },
    featureList: { marginTop: '14px', marginBottom: '14px' },
    featureItem: { fontSize: '12px', color: '#444', marginBottom: '5px' },
    planFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.08)' },
    subCount: { fontSize: '12px', color: '#666' },
    toggleBtn: { padding: '5px 10px', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', background: '#fff' },
    deleteBtnSmall: { padding: '5px 8px', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', background: '#FFEBEE' },
    emptyPlans: { gridColumn: '1/-1', textAlign: 'center', padding: '50px' },
    assignBox: { background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    noProvidersHint: { fontSize: '12.5px', color: '#B26A00', background: '#FFF3E0', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px' },
    assignRow: { display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' },
    subscribersBox: { background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '12px' },
    th: { padding: '12px 14px', fontSize: '11px', fontWeight: '700', color: '#555', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #E0E0E0' },
    td: { padding: '12px 14px', fontSize: '13px', color: '#333', borderBottom: '1px solid #F0F0F0' },
};

export default Plans;
