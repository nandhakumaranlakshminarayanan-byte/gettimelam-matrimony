import React, { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import LoginModal from '../../components/Modals/LoginModal';
import RegisterModal from '../../components/Modals/RegisterModal';
import toast from 'react-hot-toast';

const Contact = () => {
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', mobile: '', subject: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            toast.success('Message sent! We will get back to you within 24 hours.');
            setForm({ name: '', email: '', mobile: '', subject: '', message: '' });
            setLoading(false);
        }, 1000);
    };

    return (
        <div style={{ background: '#FFFDF9', minHeight: '100vh' }}>
            <Navbar
                onLoginClick={() => setShowLogin(true)}
                onRegisterClick={() => setShowRegister(true)}
            />

            <div style={styles.header}>
                <h1 style={styles.headerTitle}>Contact Us</h1>
                <p style={styles.headerDesc}>We are here to help. Reach out to us anytime!</p>
            </div>

            <div style={styles.container}>
                <div style={styles.grid}>

                    {/* Info */}
                    <div style={styles.infoCol}>
                        <h2 style={styles.infoTitle}>Get In Touch</h2>
                        <p style={styles.infoDesc}>
                            Have questions about matchmaking or wedding services? Our team is happy to help.
                        </p>

                        {[
                            { icon: '📞', label: 'Phone', value: '+91 98765 43210' },
                            { icon: '📧', label: 'Email', value: 'support@gettimelam.com' },
                            { icon: '📍', label: 'Address', value: 'Puducherry, Tamil Nadu, India' },
                            { icon: '🕐', label: 'Working Hours', value: 'Mon-Sat: 9 AM - 6 PM' },
                        ].map(item => (
                            <div key={item.label} style={styles.infoItem}>
                                <div style={styles.infoIcon}>{item.icon}</div>
                                <div>
                                    <div style={styles.infoLabel}>{item.label}</div>
                                    <div style={styles.infoValue}>{item.value}</div>
                                </div>
                            </div>
                        ))}

                        <button
                            style={styles.whatsappBtn}
                            onClick={() => window.open('https://wa.me/919876543210', '_blank')}
                        >
                            Chat on WhatsApp
                        </button>

                        <div style={styles.social}>
                            {['Facebook', 'Instagram', 'YouTube'].map(s => (
                                <div key={s} style={styles.socialBtn}>{s}</div>
                            ))}
                        </div>
                    </div>

                    {/* Form */}
                    <div style={styles.formCol}>
                        <h2 style={styles.formTitle}>Send Us a Message</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={styles.grid2}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Your Name *</label>
                                    <input type="text" placeholder="Full name" style={styles.input}
                                        value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Mobile Number</label>
                                    <input type="tel" placeholder="+91 99999 99999" style={styles.input}
                                        value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} />
                                </div>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Email Address *</label>
                                <input type="email" placeholder="your@email.com" style={styles.input}
                                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Subject *</label>
                                <select style={styles.input} value={form.subject}
                                    onChange={e => setForm({ ...form, subject: e.target.value })} required>
                                    <option value="">Select a subject</option>
                                    {['Matchmaking Help', 'Wedding Services Query', 'List My Service', 'Premium Membership', 'Profile Issue', 'Payment Issue', 'Other'].map(s => (
                                        <option key={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Message *</label>
                                <textarea placeholder="Write your message here..." rows={5}
                                    style={{ ...styles.input, resize: 'vertical' }}
                                    value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
                            </div>
                            <button type="submit" style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
                                {loading ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>

                </div>
            </div>

            <Footer />

            {showLogin && (
                <LoginModal onClose={() => setShowLogin(false)}
                    onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }} />
            )}
            {showRegister && (
                <RegisterModal onClose={() => setShowRegister(false)}
                    onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }} />
            )}
        </div>
    );
};

const styles = {
    header: { background: 'linear-gradient(135deg, #1A0A0A, #3D1A1A)', padding: '48px 24px', textAlign: 'center' },
    headerTitle: { fontFamily: "'Playfair Display', serif", fontSize: '38px', color: '#fff', marginBottom: '12px' },
    headerDesc: { color: 'rgba(255,255,255,0.6)', fontSize: '15px' },
    container: { maxWidth: '1100px', margin: '0 auto', padding: '48px 24px' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '40px', alignItems: 'start' },
    infoCol: { background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 24px rgba(139,26,26,0.08)' },
    infoTitle: { fontFamily: "'Playfair Display', serif", fontSize: '22px', color: '#1A0A0A', marginBottom: '12px' },
    infoDesc: { fontSize: '14px', color: '#7A6055', lineHeight: 1.7, marginBottom: '24px' },
    infoItem: { display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '20px' },
    infoIcon: { fontSize: '20px', width: '44px', height: '44px', background: '#FDF0F0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    infoLabel: { fontSize: '11px', fontWeight: '700', color: '#7A6055', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' },
    infoValue: { fontSize: '14px', fontWeight: '500', color: '#2C1810' },
    whatsappBtn: { display: 'block', width: '100%', padding: '12px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginBottom: '16px' },
    social: { display: 'flex', gap: '8px' },
    socialBtn: { flex: 1, padding: '8px', textAlign: 'center', border: '1.5px solid #E8D5C4', borderRadius: '8px', fontSize: '12px', fontWeight: '600', color: '#7A6055', cursor: 'pointer' },
    formCol: { background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 24px rgba(139,26,26,0.08)' },
    formTitle: { fontFamily: "'Playfair Display', serif", fontSize: '22px', color: '#1A0A0A', marginBottom: '24px' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    formGroup: { marginBottom: '16px' },
    label: { display: 'block', fontSize: '11px', fontWeight: '600', color: '#7A6055', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    input: { width: '100%', padding: '11px 14px', border: '1.5px solid #E8D5C4', borderRadius: '8px', fontSize: '14px', color: '#2C1810', background: '#FFFDF9', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' },
    submitBtn: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #8B1A1A, #C0392B)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }
};

export default Contact;