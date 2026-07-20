import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { STATES_AND_UTS, getDistrictsForState } from '../../utils/indiaLocationData';
import { useOptions } from '../../hooks/useOptions';

const RegisterModal = ({ onClose, onSwitchToLogin }) => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showServiceForm, setShowServiceForm] = useState(false);

    const [form, setForm] = useState({
        businessName: '', ownerName: '', mobile: '', email: '',
        password: '', category: 'Wedding Hall/Venue', city: '', state: '', district: '',
    });

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleMemberClick = () => {
        onClose();
        navigate('/register');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.mobile.length !== 10) {
            toast.error('Enter a valid 10-digit mobile number');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) {
            toast.error('Enter a valid email address');
            return;
        }
        if (form.password.length < 6) {
            toast.error('Password must be at least 6 characters!');
            return;
        }
        setLoading(true);
        try {
            await register({ ...form, role: 'service' });
            toast.success('Service Provider registered! Our team will verify your listing shortly. 🎊');
            onClose();
            navigate('/service-provider');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed!');
        } finally {
            setLoading(false);
        }
    };

    const { options: serviceCategories } = useOptions('servicecategory');

    return (
        <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={styles.modal}>

                {/* ── Left Panel ── */}
                <div style={styles.leftPanel}>
                    <img src="/logo.png" alt="Gettimelam" style={styles.logo} />
                    <h2 style={styles.leftTitle}>Join Gettimelam Matrimony</h2>
                    <p style={styles.leftSubtitle}>Tamil Nadu's trusted wedding platform</p>

                    <div style={styles.stats}>
                        {[
                            { num: '50,000+', label: 'Profiles' },
                            { num: '10,000+', label: 'Matches' },
                            { num: '5,000+', label: 'Couples' },
                        ].map(s => (
                            <div key={s.label} style={styles.stat}>
                                <div style={styles.statNum}>{s.num}</div>
                                <div style={styles.statLabel}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    <div style={styles.features}>
                        {[
                            '✅ 100% Free Registration',
                            '✅ Verified Profiles Only',
                            '✅ All Communities Welcome',
                            '✅ Privacy Protected',
                            '✅ No Extra Charges',
                        ].map(f => (
                            <div key={f} style={styles.feature}>{f}</div>
                        ))}
                    </div>

                    <div style={styles.leftContact}>
                        <div>📞 7339682802</div>
                        <div>📍 No:157, Thendral Street,</div>
                        <div style={{ paddingLeft: '20px' }}>Nainarmandapam, Pondy - 4</div>
                        <div style={{ marginTop: '8px', fontSize: '11px', opacity: 0.7 }}>Iyyanalli Groups</div>
                    </div>
                </div>

                {/* ── Right Panel ── */}
                <div style={styles.rightPanel}>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>

                    <h3 style={styles.rightTitle}>Register</h3>
                    <p style={styles.rightSubtitle}>Choose how you want to join</p>

                    {/* ── Member CTA ── */}
                    <div style={styles.memberCta} onClick={handleMemberClick}>
                        <img src="/images/match.png" alt="Find a match" style={styles.serviceCtaIcon} />
                        <div style={styles.memberCtaTitle}>Looking for a Match?</div>
                        <div style={styles.memberCtaDesc}>Create your matrimony profile in 4 easy steps</div>
                        <div style={styles.memberCtaBtn}>Free Register →</div>
                    </div>

                    <div style={styles.divider}>
                        <div style={styles.dividerLine} />
                        <span style={styles.dividerText}>or</span>
                        <div style={styles.dividerLine} />
                    </div>

                    {/* ── Service Provider CTA (collapsed) ── */}
                    {!showServiceForm && (
                        <div style={styles.memberCta} onClick={() => setShowServiceForm(true)}>
                            <img src="/images/service.png" alt="Register your business" style={styles.serviceCtaIcon} />
                            <div style={styles.memberCtaTitle}>Register as Service Provider</div>
                            <div style={styles.memberCtaDesc}>
                                List your wedding business and get discovered by thousands of families across India
                            </div>
                            <div style={styles.memberCtaBtn}>Register as Service Provider →</div>
                        </div>
                    )}

                    {/* ── Service Provider Form (revealed) ── */}
                    {showServiceForm && (
                        <>
                            <div style={styles.serviceTitle}>🏪 Register as Service Provider</div>
                            <p style={styles.serviceDesc}>
                                List your wedding business and get discovered by thousands of families across India
                            </p>
                            <span style={styles.backToOptions} onClick={() => setShowServiceForm(false)}>
                                ← Back
                            </span>

                            <form onSubmit={handleSubmit} autoComplete="off">
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Business Name *</label>
                                    <input name="businessName" type="text" placeholder="e.g. Sri Murugan Photography" autoComplete="off"
                                        value={form.businessName} onChange={handleChange}
                                        style={styles.input} required />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Owner / Contact Person Name *</label>
                                    <input name="ownerName" type="text" placeholder="Enter your full name" autoComplete="off"
                                        value={form.ownerName} onChange={handleChange}
                                        style={styles.input} required />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Service Category *</label>
                                    <select name="category" value={form.category}
                                        onChange={handleChange} style={styles.input}>
                                        {serviceCategories.map(cat => <option key={cat}>{cat}</option>)}
                                    </select>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>State *</label>
                                    <select name="state" value={form.state}
                                        onChange={(e) => setForm({ ...form, state: e.target.value, district: '' })}
                                        style={styles.input} required>
                                        <option value="">Select State</option>
                                        {STATES_AND_UTS.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>

                                <div style={styles.grid2}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>District *</label>
                                        <select name="district" value={form.district} onChange={handleChange}
                                            style={styles.input} required disabled={!form.state}>
                                            <option value="">{form.state ? 'Select District' : 'Select state first'}</option>
                                            {getDistrictsForState(form.state).map(d => <option key={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>City *</label>
                                        <input name="city" type="text" placeholder="e.g. Puducherry" autoComplete="off"
                                            value={form.city} onChange={handleChange}
                                            style={styles.input} required />
                                    </div>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>📱 Mobile Number *</label>
                                    <div style={styles.inputWrapper}>
                                        <span style={styles.inputPrefix}>+91</span>
                                        <input name="mobile" type="tel" placeholder="Enter mobile number" autoComplete="off" maxLength={10}
                                            value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                            style={styles.inputWithPrefix} required />
                                    </div>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>📧 Email Address *</label>
                                    <input name="email" type="email" placeholder="business@email.com" autoComplete="off"
                                        value={form.email} onChange={handleChange}
                                        style={styles.input} required />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>🔒 Password *</label>
                                    <input name="password" type="password" placeholder="Min 6 characters" autoComplete="new-password"
                                        value={form.password} onChange={handleChange}
                                        style={styles.input} required />
                                </div>

                                <p style={styles.terms}>
                                    By registering, you agree to our{' '}
                                    <a href="/terms" style={styles.termsLink}>Terms & Conditions</a> and{' '}
                                    <a href="/privacy" style={styles.termsLink}>Privacy Policy</a>
                                </p>

                                <button type="submit"
                                    style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
                                    disabled={loading}>
                                    {loading ? '⏳ Registering...' : 'REGISTER MY BUSINESS'}
                                </button>
                            </form>
                        </>
                    )}

                    <p style={styles.switchText}>
                        Already a member?{' '}
                        <span style={styles.switchLink} onClick={onSwitchToLogin}>SIGN IN</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

const ACCENT = '#B71C1C';
const GOLD = '#F5BE17';
const BG = '#FFF8E1';

const styles = {
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
    modal: { background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '860px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' },
    leftPanel: { background: 'linear-gradient(160deg, #B71C1C, #7B0000)', width: '280px', flexShrink: 0, padding: '32px 24px', display: 'flex', flexDirection: 'column', borderRadius: '20px 0 0 20px' },
    logo: { height: '55px', objectFit: 'contain', marginBottom: '20px', filter: 'brightness(0) invert(1)' },
    leftTitle: { fontFamily: "'Playfair Display', serif", fontSize: '20px', color: '#fff', marginBottom: '8px', lineHeight: 1.3 },
    leftSubtitle: { fontSize: '13px', color: 'rgba(255,255,255,0.75)', marginBottom: '20px' },
    stats: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px' },
    stat: { textAlign: 'center' },
    statNum: { fontSize: '16px', fontWeight: '700', color: GOLD },
    statLabel: { fontSize: '10px', color: 'rgba(255,255,255,0.7)' },
    features: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' },
    feature: { fontSize: '12px', color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
    leftContact: { fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '16px' },
    rightPanel: { flex: 1, padding: '28px 24px', position: 'relative', overflowY: 'auto' },
    closeBtn: { position: 'absolute', top: '16px', right: '16px', background: BG, border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontSize: '14px', cursor: 'pointer', color: ACCENT, fontWeight: '700' },
    rightTitle: { fontFamily: "'Playfair Display', serif", fontSize: '24px', color: '#1A0A0A', marginBottom: '4px' },
    rightSubtitle: { fontSize: '14px', color: '#7A5C00', marginBottom: '20px' },

    // Member CTA box
    memberCta: { background: `linear-gradient(135deg, ${BG}, #FFF3CD)`, border: `2px solid ${GOLD}`, borderRadius: '14px', padding: '20px', textAlign: 'center', cursor: 'pointer', marginBottom: '20px', transition: 'all 0.2s' },
    serviceCtaIcon: { display: 'block', margin: '0 auto 10px', height: '100px', width: 'auto', maxWidth: '100%', objectFit: 'contain' },
    memberCtaTitle: { fontSize: '17px', fontWeight: '700', color: ACCENT, marginBottom: '6px' },
    memberCtaDesc: { fontSize: '13px', color: '#7A5C00', marginBottom: '12px' },
    memberCtaBtn: { display: 'inline-block', background: ACCENT, color: '#fff', padding: '10px 28px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', letterSpacing: '0.5px' },

    divider: { display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0 16px' },
    dividerLine: { flex: 1, height: '1px', background: '#eee' },
    dividerText: { fontSize: '12px', color: '#bbb', fontWeight: '600' },

    serviceTitle: { fontSize: '15px', fontWeight: '700', color: ACCENT, marginBottom: '6px' },
    serviceDesc: { fontSize: '12px', color: '#7A5C00', marginBottom: '16px', lineHeight: 1.6, background: BG, padding: '10px 14px', borderRadius: '8px', border: `1px solid ${GOLD}` },
    backToOptions: { display: 'inline-block', fontSize: '12px', color: '#8B1A1A', fontWeight: '600', cursor: 'pointer', marginBottom: '16px', textDecoration: 'underline' },

    formGroup: { marginBottom: '12px' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
    label: { display: 'block', fontSize: '11px', fontWeight: '700', color: '#5F0909', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' },
    input: { width: '100%', padding: '10px 14px', border: `1.5px solid ${GOLD}`, borderRadius: '8px', fontSize: '13px', color: '#2C1810', background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
    inputWrapper: { display: 'flex', alignItems: 'center', border: `1.5px solid ${GOLD}`, borderRadius: '8px', overflow: 'hidden', background: '#fff' },
    inputPrefix: { padding: '10px 12px', fontSize: '13px', color: '#5F0909', background: BG, fontWeight: '700', borderRight: `1px solid ${GOLD}`, whiteSpace: 'nowrap' },
    inputWithPrefix: { flex: 1, padding: '10px 14px', border: 'none', outline: 'none', fontSize: '13px', color: '#2C1810', background: '#fff', fontFamily: 'inherit' },
    terms: { fontSize: '11px', color: '#9E9E9E', marginBottom: '12px', lineHeight: 1.6 },
    termsLink: { color: ACCENT, textDecoration: 'underline' },
    submitBtn: { width: '100%', padding: '13px', background: `linear-gradient(135deg, ${ACCENT}, #D32F2F)`, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginBottom: '14px', letterSpacing: '0.5px', fontFamily: 'inherit' },
    switchText: { textAlign: 'center', fontSize: '13px', color: '#7A5C00' },
    switchLink: { color: ACCENT, fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' },
};

export default RegisterModal;
