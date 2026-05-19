import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const Banners = () => {
    const [banners, setBanners] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [form, setForm] = useState({
        title: '', subtitle: '', imageUrl: '', linkUrl: '', position: 'top'
    });

    useEffect(() => { fetchBanners(); }, []);

    const fetchBanners = async () => {
        try {
            const res = await API.get('/admin/banners');
            setBanners(res.data.banners || []);
        } catch (err) {
            toast.error('Failed to load');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File too large! Max 5MB');
            return;
        }
        setUploading(true);
        const formData = new FormData();
        formData.append('photo', file);
        try {
            const res = await API.post('/profiles/upload-photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const fullUrl = `http://localhost:5000${res.data.photoUrl}`;
            setForm(f => ({ ...f, imageUrl: fullUrl }));
            toast.success('Image uploaded! ✅');
        } catch (err) {
            toast.error('Upload failed!');
        } finally {
            setUploading(false);
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

                    {/* Info Banner */}
                    <div style={styles.infoBanner}>
                        <div>
                            <h3 style={{ color: '#fff', marginBottom: '4px' }}>
                                📐 Banner Size Guidelines
                            </h3>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                                Recommended size: <strong style={{ color: '#C9A84C' }}>1220px × 450px</strong> — JPG or PNG format, max 5MB
                            </p>
                        </div>
                        <div style={styles.infoStats}>
                            <div style={styles.infoStat}>
                                <div style={styles.infoStatVal}>{banners.length}</div>
                                <div style={styles.infoStatLabel}>Total</div>
                            </div>
                            <div style={styles.infoStat}>
                                <div style={styles.infoStatVal}>{banners.filter(b => b.isActive).length}</div>
                                <div style={styles.infoStatLabel}>Active</div>
                            </div>
                        </div>
                    </div>

                    <div style={styles.topRow}>
                        <h3 style={styles.count}>{banners.length} banners</h3>
                        <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
                            {showForm ? '✕ Cancel' : '➕ Add Banner'}
                        </button>
                    </div>

                    {showForm && (
                        <form onSubmit={handleSubmit} style={styles.form}>
                            <h3 style={styles.formTitle}>Create New Banner</h3>

                            {/* Image Upload */}
                            <div style={styles.uploadArea}>
                                <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#555', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Banner Image (1220×450px)
                                </h4>
                                {form.imageUrl ? (
                                    <div style={{ position: 'relative' }}>
                                        <img src={form.imageUrl} alt="Preview"
                                            style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #E0E0E0' }} />
                                        <button type="button"
                                            style={{ position: 'absolute', top: '8px', right: '8px', background: '#C62828', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px' }}
                                            onClick={() => setForm(f => ({ ...f, imageUrl: '' }))}>
                                            ✕ Remove
                                        </button>
                                    </div>
                                ) : (
                                    <label style={{ cursor: 'pointer', display: 'block' }}>
                                        <input type="file" accept="image/*"
                                            onChange={handleImageUpload}
                                            style={{ display: 'none' }} />
                                        <div style={styles.uploadBox}>
                                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🖼️</div>
                                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#555', marginBottom: '4px' }}>
                                                {uploading ? '⏳ Uploading...' : 'Click to upload banner image'}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#999' }}>
                                                Recommended: 1220×450px • JPG or PNG • Max 5MB
                                            </div>
                                        </div>
                                    </label>
                                )}
                            </div>

                            <div style={styles.formGrid}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Title *</label>
                                    <input style={styles.input} placeholder="Banner title"
                                        value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                        required />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Subtitle</label>
                                    <input style={styles.input} placeholder="Banner subtitle"
                                        value={form.subtitle}
                                        onChange={e => setForm({ ...form, subtitle: e.target.value })} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Or Paste Image URL</label>
                                    <input style={styles.input} placeholder="https://example.com/image.jpg"
                                        value={form.imageUrl}
                                        onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Link URL (optional)</label>
                                    <input style={styles.input} placeholder="/browse or https://..."
                                        value={form.linkUrl}
                                        onChange={e => setForm({ ...form, linkUrl: e.target.value })} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Position</label>
                                    <select style={styles.input} value={form.position}
                                        onChange={e => setForm({ ...form, position: e.target.value })}>
                                        {['hero', 'top', 'middle', 'bottom', 'popup'].map(p => (
                                            <option key={p} value={p}>
                                                {p.charAt(0).toUpperCase() + p.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button type="submit" style={styles.submitBtn}>
                                🎨 Create Banner
                            </button>
                        </form>
                    )}

                    {/* Banners Grid */}
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
                                        <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: '#E3F2FD', color: '#1565C0' }}>
                                            📍 {b.position}
                                        </span>
                                        <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: b.isActive ? '#E8F5E9' : '#FFEBEE', color: b.isActive ? '#2E7D32' : '#C62828' }}>
                                            {b.isActive ? '✅ Active' : '❌ Inactive'}
                                        </span>
                                    </div>
                                    <div style={styles.cardActions}>
                                        <button style={{ ...styles.actionBtn, background: b.isActive ? '#FFEBEE' : '#E8F5E9', color: b.isActive ? '#C62828' : '#2E7D32' }}
                                            onClick={() => handleToggle(b._id)}>
                                            {b.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
                                        </button>
                                        <button style={{ ...styles.actionBtn, background: '#FFEBEE', color: '#C62828' }}
                                            onClick={() => handleDelete(b._id)}>
                                            🗑️ Delete
                                        </button>
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
    infoBanner: { background: 'linear-gradient(135deg, #1A0A0A, #3D1A1A)', borderRadius: '12px', padding: '20px 28px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    infoStats: { display: 'flex', gap: '20px' },
    infoStat: { textAlign: 'center', background: 'rgba(255,255,255,0.1)', padding: '12px 20px', borderRadius: '10px' },
    infoStatVal: { fontFamily: "'Georgia', serif", fontSize: '28px', fontWeight: '700', color: '#C9A84C' },
    infoStatLabel: { fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' },
    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    count: { fontSize: '15px', color: '#555', fontWeight: '600' },
    addBtn: { padding: '10px 20px', background: '#1A0A0A', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
    form: { background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    formTitle: { fontSize: '16px', fontWeight: '700', color: '#1A0A0A', marginBottom: '16px' },
    uploadArea: { marginBottom: '20px', padding: '16px', background: '#F8F9FA', borderRadius: '10px', border: '1px solid #E0E0E0' },
    uploadBox: { border: '2px dashed #E0E0E0', borderRadius: '10px', padding: '32px', textAlign: 'center', background: '#fff' },
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
    empty: { gridColumn: '1/-1', textAlign: 'center', padding: '60px' },
};

export default Banners;