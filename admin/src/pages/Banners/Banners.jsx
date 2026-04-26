import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const Banners = () => {
    const [banners, setBanners] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', subtitle: '', imageUrl: '', linkUrl: '', position: 'top' });

    useEffect(() => { fetchBanners(); }, []);

    const fetchBanners = async () => {
        try {
            const res = await API.get('/admin/banners');
            setBanners(res.data.banners);
        } catch (err) {
            toast.error('Failed to load');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/admin/banners', form);
            toast.success('Banner created! 🎨');
            setShowForm(false);
            setForm({ title: '', subtitle: '', imageUrl: '', linkUrl: '', position: 'top' });
            fetchBanners();
        } catch (err) {
            toast.error('Failed!');
        }
    };

    const handleToggle = async (id) => {
        try {
            const res = await API.put(`/admin/banners/${id}/toggle`);
            toast.success(res.data.message);
            fetchBanners();
        } catch (err) {
            toast.error('Failed!');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this banner?')) return;
        try {
            await API.delete(`/admin/banners/${id}`);
            toast.success('Banner deleted!');
            fetchBanners();
        } catch (err) {
            toast.error('Failed!');
        }
    };

    return (
        <div style={styles.layout}>
            <Sidebar />
            <div style={styles.content}>
                <Navbar title="🎨 Banner Management" />
                <div style={styles.inner}>

                    <div style={styles.topRow}>
                        <h3 style={styles.count}>{banners.length} banners</h3>
                        <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
                            {showForm ? '✕ Cancel' : '➕ Add Banner'}
                        </button>
                    </div>

                    {showForm && (
                        <form onSubmit={handleSubmit} style={styles.form}>
                            <h3 style={styles.formTitle}>Create New Banner</h3>
                            <div style={styles.formGrid}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Title</label>
                                    <input style={styles.input} placeholder="Banner title" value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })} required />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Subtitle</label>
                                    <input style={styles.input} placeholder="Banner subtitle" value={form.subtitle}
                                        onChange={e => setForm({ ...form, subtitle: e.target.value })} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Image URL</label>
                                    <input style={styles.input} placeholder="https://..." value={form.imageUrl}
                                        onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Link URL</label>
                                    <input style={styles.input} placeholder="https://..." value={form.linkUrl}
                                        onChange={e => setForm({ ...form, linkUrl: e.target.value })} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Position</label>
                                    <select style={styles.input} value={form.position}
                                        onChange={e => setForm({ ...form, position: e.target.value })}>
                                        {['hero', 'top', 'middle', 'bottom', 'popup'].map(p => (
                                            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button type="submit" style={styles.submitBtn}>🎨 Create Banner</button>
                        </form>
                    )}

                    <div style={styles.grid}>
                        {banners.map(b => (
                            <div key={b._id} style={{ ...styles.card, opacity: b.isActive ? 1 : 0.6 }}>
                                {b.imageUrl ? (
                                    <img src={b.imageUrl} alt={b.title} style={styles.bannerImg} />
                                ) : (
                                    <div style={styles.bannerPlaceholder}>🖼️ No Image</div>
                                )}
                                <div style={styles.cardBody}>
                                    <div style={styles.cardTitle}>{b.title}</div>
                                    {b.subtitle && <div style={styles.cardSub}>{b.subtitle}</div>}
                                    <div style={styles.cardMeta}>
                                        <span style={{
                                            padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                                            background: '#E3F2FD', color: '#1565C0'
                                        }}>
                                            📍 {b.position}
                                        </span>
                                        <span style={{
                                            padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                                            background: b.isActive ? '#E8F5E9' : '#FFEBEE',
                                            color: b.isActive ? '#2E7D32' : '#C62828'
                                        }}>
                                            {b.isActive ? '✅ Active' : '❌ Inactive'}
                                        </span>
                                    </div>
                                    <div style={styles.cardActions}>
                                        <button
                                            style={{ ...styles.actionBtn, background: b.isActive ? '#FFEBEE' : '#E8F5E9', color: b.isActive ? '#C62828' : '#2E7D32' }}
                                            onClick={() => handleToggle(b._id)}
                                        >
                                            {b.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
                                        </button>
                                        <button
                                            style={{ ...styles.actionBtn, background: '#FFEBEE', color: '#C62828' }}
                                            onClick={() => handleDelete(b._id)}
                                        >🗑️ Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {banners.length === 0 && !showForm && (
                            <div style={styles.empty}>
                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎨</div>
                                <p style={{ color: '#999' }}>No banners yet. Create one!</p>
                            </div>
                        )}
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
    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    count: { fontSize: '15px', color: '#555', fontWeight: '600' },
    addBtn: { padding: '10px 20px', background: '#1A0A0A', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
    form: { background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    formTitle: { fontSize: '16px', fontWeight: '700', color: '#1A0A0A', marginBottom: '16px' },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' },
    formGroup: { marginBottom: '0' },
    label: { display: 'block', fontSize: '11px', fontWeight: '700', color: '#555', marginBottom: '5px', textTransform: 'uppercase' },
    input: { width: '100%', padding: '10px 14px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', outline: 'none', fontFamily: 'sans-serif', boxSizing: 'border-box' },
    submitBtn: { padding: '12px 28px', background: 'linear-gradient(135deg, #1A0A0A, #3D1A1A)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
    card: { background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #E0E0E0' },
    bannerImg: { width: '100%', height: '140px', objectFit: 'cover' },
    bannerPlaceholder: { height: '140px', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#999' },
    cardBody: { padding: '16px' },
    cardTitle: { fontSize: '15px', fontWeight: '700', color: '#1A0A0A', marginBottom: '4px' },
    cardSub: { fontSize: '13px', color: '#555', marginBottom: '8px' },
    cardMeta: { display: 'flex', gap: '6px', marginBottom: '12px' },
    cardActions: { display: 'flex', gap: '8px' },
    actionBtn: { flex: 1, padding: '7px', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
    empty: { gridColumn: '1/-1', textAlign: 'center', padding: '60px' }
};

export default Banners;