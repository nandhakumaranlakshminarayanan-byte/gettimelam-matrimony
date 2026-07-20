import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const SERVER_URL = (API.defaults?.baseURL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
const imgUrl = (p) => (p && p.startsWith('/') ? `${SERVER_URL}${p}` : p);

const GLOW_COLORS = ['#DF9B08', '#C97B2E', '#8FAE5A', '#B5471B', '#C9668E', '#7B5CC9'];

const emptyForm = { name: '', description: '', glow: '#DF9B08', order: 0, category: '' };

const ServiceCards = () => {
    const [cards, setCards] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [saving, setSaving] = useState(false);
    const usedCategories = new Set(cards.map(c => c.category).filter(Boolean));
    const [serviceCategories, setServiceCategories] = useState([]);

    useEffect(() => {
        API.get('/admin/options', { params: { category: 'servicecategory', status: 'active' } })
            .then(res => setServiceCategories((res.data.options || []).map(o => o.value)))
            .catch(() => setServiceCategories([]));
    }, []);

    useEffect(() => { fetchCards(); }, []);

    const fetchCards = async () => {
        try {
            const res = await API.get('/service-cards/all');
            setCards(res.data.cards || []);
        } catch (err) {
            toast.error('Failed to load service cards');
        }
    };

    const resetForm = () => {
        setForm(emptyForm);
        setImageFile(null);
        setImagePreview('');
        setEditingId(null);
        setShowForm(false);
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File too large! Max 5MB');
            return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const startEdit = (card) => {
        setForm({
            name: card.name,
            description: card.description || '',
            glow: card.glow || '#DF9B08',
            order: card.order || 0,
            category: card.category || '',
        });
        setImageFile(null);
        setImagePreview(card.image ? imgUrl(card.image) : '');
        setEditingId(card._id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const data = new FormData();
            data.append('name', form.name);
            data.append('description', form.description);
            data.append('glow', form.glow);
            data.append('order', form.order);
            data.append('category', form.category);
            if (imageFile) data.append('image', imageFile);

            if (editingId) {
                await API.put(`/service-cards/${editingId}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Service card updated! ✅');
            } else {
                await API.post('/service-cards', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Service card created! ✅');
            }
            resetForm();
            fetchCards();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed!');
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (id) => {
        try {
            const res = await API.put(`/service-cards/${id}/toggle`);
            toast.success(res.data.message);
            fetchCards();
        } catch (err) {
            toast.error('Failed!');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this service card?')) return;
        try {
            await API.delete(`/service-cards/${id}`);
            toast.success('Service card deleted!');
            fetchCards();
        } catch (err) {
            toast.error('Failed!');
        }
    };

    return (
        <div style={styles.layout}>
            <Sidebar />
            <div style={styles.content}>
                <Navbar title="🃏 Homepage Service Cards" />
                <div style={styles.inner}>

                    {/* Info Banner */}
                    <div style={styles.infoBanner}>
                        <div>
                            <h3 style={{ color: '#fff', marginBottom: '4px' }}>
                                💍 Wedding Services Section
                            </h3>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                                These cards appear on the homepage. Recommended image: <strong style={{ color: '#C9A84C' }}>square, at least 300×300px</strong> — JPG or PNG, max 5MB. The image is shown inside the card's hexagon badge.
                            </p>
                        </div>
                        <div style={styles.infoStats}>
                            <div style={styles.infoStat}>
                                <div style={styles.infoStatVal}>{cards.length}</div>
                                <div style={styles.infoStatLabel}>Total</div>
                            </div>
                            <div style={styles.infoStat}>
                                <div style={styles.infoStatVal}>{cards.filter(c => c.isActive).length}</div>
                                <div style={styles.infoStatLabel}>Active</div>
                            </div>
                        </div>
                    </div>

                    <div style={styles.topRow}>
                        <h3 style={styles.count}>{cards.length} cards</h3>
                        <button style={styles.addBtn} onClick={() => showForm ? resetForm() : setShowForm(true)}>
                            {showForm ? '✕ Cancel' : '➕ Add Service Card'}
                        </button>
                    </div>

                    {showForm && (
                        <form onSubmit={handleSubmit} style={styles.form}>
                            <h3 style={styles.formTitle}>
                                {editingId ? '✏️ Edit Service Card' : 'Create New Service Card'}
                            </h3>

                            {/* Image Upload */}
                            <div style={styles.uploadArea}>
                                <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#555', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Card Image (shown in hexagon)
                                </h4>
                                {imagePreview ? (
                                    <div style={{ position: 'relative', width: '160px' }}>
                                        <img src={imagePreview} alt="Preview"
                                            style={{ width: '160px', height: '160px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #E0E0E0' }} />
                                        <button type="button"
                                            style={{ position: 'absolute', top: '8px', right: '8px', background: '#C62828', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px' }}
                                            onClick={() => { setImageFile(null); setImagePreview(''); }}>
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <label style={{ cursor: 'pointer', display: 'block' }}>
                                        <input type="file" accept="image/*"
                                            onChange={handleImageSelect}
                                            style={{ display: 'none' }} />
                                        <div style={styles.uploadBox}>
                                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🖼️</div>
                                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#555', marginBottom: '4px' }}>
                                                Click to upload card image
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#999' }}>
                                                Square works best • JPG or PNG • Max 5MB
                                            </div>
                                        </div>
                                    </label>
                                )}
                            </div>

                            <div style={styles.formGrid}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Name *</label>
                                    <input style={styles.input} placeholder="e.g. Wedding Hall"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        required />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Display Order</label>
                                    <input style={styles.input} type="number" placeholder="0"
                                        value={form.order}
                                        onChange={e => setForm({ ...form, order: e.target.value })} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Links To Category (Learn more)</label>
                                    <select style={styles.input}
                                        value={form.category}
                                        onChange={e => setForm({ ...form, category: e.target.value })}>
                                        <option value="">All services (no filter)</option>
                                        {serviceCategories.map(c => (
                                            <option key={c} value={c}>{usedCategories.has(c) ? `🔴 ${c}` : c}</option>
                                        ))}
                                    </select>
                                    <p style={{ fontSize: '11px', color: '#9E9E9E', marginTop: '4px' }}>
                                        🔴 = a card already links to this category
                                    </p>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Glow Color</label>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        {GLOW_COLORS.map(c => (
                                            <div key={c}
                                                onClick={() => setForm({ ...form, glow: c })}
                                                style={{
                                                    width: '28px', height: '28px', borderRadius: '50%', background: c, cursor: 'pointer',
                                                    border: form.glow === c ? '3px solid #1A0A0A' : '2px solid #E0E0E0',
                                                }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={styles.label}>Description</label>
                                <textarea style={{ ...styles.input, minHeight: '70px', resize: 'vertical' }}
                                    placeholder="Short description shown on the card"
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <button type="submit" style={styles.submitBtn} disabled={saving}>
                                {saving ? '⏳ Saving...' : editingId ? '💾 Save Changes' : '➕ Create Card'}
                            </button>
                        </form>
                    )}

                    {/* Cards Grid */}
                    <div style={styles.grid}>
                        {cards.map(c => (
                            <div key={c._id} style={{ ...styles.card, opacity: c.isActive ? 1 : 0.6 }}>
                                {c.image ? (
                                    <img src={imgUrl(c.image)} alt={c.name} style={styles.cardImg} />
                                ) : (
                                    <div style={styles.cardPlaceholder}>🖼️ No Image</div>
                                )}
                                <div style={styles.cardBody}>
                                    <div style={styles.cardTitleRow}>
                                        <div style={styles.cardTitle}>{c.name}</div>
                                        <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: c.glow, display: 'inline-block', border: '1px solid #E0E0E0' }} title={`Glow: ${c.glow}`} />
                                    </div>
                                    {c.description && <div style={styles.cardSub}>{c.description}</div>}
                                    <div style={styles.cardMeta}>
                                        <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: '#E3F2FD', color: '#1565C0' }}>
                                            #️⃣ Order: {c.order}
                                        </span>
                                        {c.category && (
                                            <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: '#F3E5F5', color: '#6A1B9A' }}>
                                                🔗 {c.category}
                                            </span>
                                        )}
                                        <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: c.isActive ? '#E8F5E9' : '#FFEBEE', color: c.isActive ? '#2E7D32' : '#C62828' }}>
                                            {c.isActive ? '✅ Active' : '❌ Inactive'}
                                        </span>
                                    </div>
                                    <div style={styles.cardActions}>
                                        <button style={{ ...styles.actionBtn, background: '#FFF8E1', color: '#8B6914' }}
                                            onClick={() => startEdit(c)}>
                                            ✏️ Edit
                                        </button>
                                        <button style={{ ...styles.actionBtn, background: c.isActive ? '#FFEBEE' : '#E8F5E9', color: c.isActive ? '#C62828' : '#2E7D32' }}
                                            onClick={() => handleToggle(c._id)}>
                                            {c.isActive ? '⏸️ Hide' : '▶️ Show'}
                                        </button>
                                        <button style={{ ...styles.actionBtn, background: '#FFEBEE', color: '#C62828' }}
                                            onClick={() => handleDelete(c._id)}>
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {cards.length === 0 && !showForm && (
                            <div style={styles.empty}>
                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🃏</div>
                                <p style={{ color: '#999' }}>No service cards yet. Create one — until then, the homepage shows the built-in default cards.</p>
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
    infoBanner: { background: 'linear-gradient(135deg, #1A0A0A, #3D1A1A)', borderRadius: '12px', padding: '20px 28px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' },
    infoStats: { display: 'flex', gap: '20px', flexShrink: 0 },
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
    cardImg: { width: '100%', height: '140px', objectFit: 'cover' },
    cardPlaceholder: { height: '140px', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#999' },
    cardBody: { padding: '16px' },
    cardTitleRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' },
    cardTitle: { fontSize: '15px', fontWeight: '700', color: '#1A0A0A' },
    cardSub: { fontSize: '13px', color: '#555', marginBottom: '8px' },
    cardMeta: { display: 'flex', gap: '6px', marginBottom: '12px' },
    cardActions: { display: 'flex', gap: '8px' },
    actionBtn: { flex: 1, padding: '7px', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
    empty: { gridColumn: '1/-1', textAlign: 'center', padding: '60px' },
};

export default ServiceCards;
