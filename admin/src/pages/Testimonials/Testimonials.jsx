import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const Testimonials = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        groomName: '', brideName: '', marriageDate: '',
        message: '', city: '', religion: 'Hindu'
    });

    useEffect(() => { fetchTestimonials(); }, []);

    const fetchTestimonials = async () => {
        try {
            const res = await API.get('/admin/testimonials');
            setTestimonials(res.data.testimonials);
        } catch (err) {
            toast.error('Failed to load');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/admin/testimonials', form);
            toast.success('Success story added! 🎊');
            setShowForm(false);
            setForm({ groomName: '', brideName: '', marriageDate: '', message: '', city: '', religion: 'Hindu' });
            fetchTestimonials();
        } catch (err) {
            toast.error('Failed!');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this success story?')) return;
        try {
            await API.delete(`/admin/testimonials/${id}`);
            toast.success('Deleted!');
            fetchTestimonials();
        } catch (err) {
            toast.error('Failed!');
        }
    };

    return (
        <div style={styles.layout}>
            <Sidebar />
            <div style={styles.content}>
                <Navbar title="💍 Success Stories" />
                <div style={styles.inner}>

                    <div style={styles.topRow}>
                        <h3 style={styles.count}>{testimonials.length} success stories</h3>
                        <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
                            {showForm ? '✕ Cancel' : '➕ Add Success Story'}
                        </button>
                    </div>

                    {/* Add Form */}
                    {showForm && (
                        <form onSubmit={handleSubmit} style={styles.form}>
                            <h3 style={styles.formTitle}>Add New Success Story</h3>
                            <div style={styles.formGrid}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Groom Name</label>
                                    <input style={styles.input} placeholder="Groom's name" value={form.groomName}
                                        onChange={e => setForm({ ...form, groomName: e.target.value })} required />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Bride Name</label>
                                    <input style={styles.input} placeholder="Bride's name" value={form.brideName}
                                        onChange={e => setForm({ ...form, brideName: e.target.value })} required />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Marriage Date</label>
                                    <input type="date" style={styles.input} value={form.marriageDate}
                                        onChange={e => setForm({ ...form, marriageDate: e.target.value })} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>City</label>
                                    <input style={styles.input} placeholder="City" value={form.city}
                                        onChange={e => setForm({ ...form, city: e.target.value })} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Religion</label>
                                    <select style={styles.input} value={form.religion}
                                        onChange={e => setForm({ ...form, religion: e.target.value })}>
                                        {['Hindu', 'Muslim', 'Christian'].map(r => <option key={r}>{r}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Their Message</label>
                                <textarea style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                                    placeholder="Their success story message..."
                                    value={form.message}
                                    onChange={e => setForm({ ...form, message: e.target.value })}
                                />
                            </div>
                            <button type="submit" style={styles.submitBtn}>💍 Add Success Story</button>
                        </form>
                    )}

                    {/* Testimonials Grid */}
                    <div style={styles.grid}>
                        {testimonials.map(t => (
                            <div key={t._id} style={styles.card}>
                                <div style={styles.cardHeader}>
                                    <div style={styles.couple}>
                                        <span style={styles.coupleEmoji}>👨</span>
                                        <span style={styles.coupleHeart}>❤️</span>
                                        <span style={styles.coupleEmoji}>👩</span>
                                    </div>
                                    <button style={styles.deleteBtn} onClick={() => handleDelete(t._id)}>🗑️</button>
                                </div>
                                <div style={styles.coupleNames}>{t.groomName} & {t.brideName}</div>
                                <div style={styles.cardMeta}>{t.religion} • {t.city}</div>
                                {t.marriageDate && (
                                    <div style={styles.cardMeta}>💍 {new Date(t.marriageDate).toLocaleDateString('en-IN')}</div>
                                )}
                                {t.message && <p style={styles.cardMsg}>"{t.message}"</p>}
                            </div>
                        ))}
                        {testimonials.length === 0 && !showForm && (
                            <div style={styles.empty}>
                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>💍</div>
                                <p style={{ color: '#999' }}>No success stories yet. Add one!</p>
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
    addBtn: {
        padding: '10px 20px', background: '#1A0A0A', color: '#fff',
        border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
    },
    form: {
        background: '#fff', borderRadius: '12px', padding: '24px',
        marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    },
    formTitle: { fontSize: '16px', fontWeight: '700', color: '#1A0A0A', marginBottom: '16px' },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' },
    formGroup: { marginBottom: '0' },
    label: { display: 'block', fontSize: '11px', fontWeight: '700', color: '#555', marginBottom: '5px', textTransform: 'uppercase' },
    input: {
        width: '100%', padding: '10px 14px', border: '1.5px solid #E0E0E0',
        borderRadius: '8px', fontSize: '14px', outline: 'none', fontFamily: 'sans-serif', boxSizing: 'border-box'
    },
    submitBtn: {
        padding: '12px 28px', background: 'linear-gradient(135deg, #1A0A0A, #3D1A1A)',
        color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
    },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
    card: {
        background: '#fff', borderRadius: '12px', padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #E0E0E0'
    },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
    couple: { display: 'flex', alignItems: 'center', gap: '4px' },
    coupleEmoji: { fontSize: '28px' },
    coupleHeart: { fontSize: '18px' },
    deleteBtn: { background: '#FFEBEE', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontSize: '14px' },
    coupleNames: { fontFamily: "'Georgia', serif", fontSize: '16px', fontWeight: '700', color: '#1A0A0A', marginBottom: '4px' },
    cardMeta: { fontSize: '12px', color: '#999', marginBottom: '2px' },
    cardMsg: { fontSize: '13px', color: '#555', fontStyle: 'italic', marginTop: '8px', lineHeight: 1.5 },
    empty: { gridColumn: '1/-1', textAlign: 'center', padding: '60px' }
};

export default Testimonials;