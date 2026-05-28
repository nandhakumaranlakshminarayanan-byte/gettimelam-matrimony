import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const LoginModal = ({ onClose, onSwitchToRegister }) => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('member');
    const [form, setForm] = useState({ mobile: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await login({ ...form, role: activeTab });
            toast.success('Welcome back! 🎊');
            onClose();
            // ✅ Redirect to language selection after login
            if (result?.user?.role === 'admin') {
                navigate('/admin');
            } else if (result?.user?.role === 'service') {
                navigate('/language');
            } else {
                navigate('/language');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={styles.modal}>

                {/* ── Left Panel ── */}
                <div style={styles.leftPanel}>
                    <img src="/logo.png" alt="Gettimelam" style={styles.logo} />
                    <h2 style={styles.leftTitle}>Find Your Perfect Life Partner</h2>
                    <p style={styles.leftSubtitle}>Tamil Nadu's Most Trusted Matrimony</p>
                    <div style={styles.features}>
                        {[
                            '✅ Free Registration',
                            '✅ Verified Profiles',
                            '✅ All Communities',
                            '✅ Privacy Protected',
                            '✅ Hindu, Muslim & Christian',
                            '✅ Safe & Secure',
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

                    <h3 style={styles.rightTitle}>Sign In</h3>
                    <p style={styles.rightSubtitle}>Welcome back to Gettimelam</p>

                    {/* Tabs */}
                    <div style={styles.tabs}>
                        <button
                            style={{ ...styles.tab, ...(activeTab === 'member' ? styles.tabActive : {}) }}
                            onClick={() => { setActiveTab('member'); setForm({ mobile: '', password: '' }); }}>
                            👤 Member Login
                        </button>
                        <button
                            style={{ ...styles.tab, ...(activeTab === 'service' ? styles.tabActive : {}) }}
                            onClick={() => { setActiveTab('service'); setForm({ mobile: '', password: '' }); }}>
                            🏪 Service Provider
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>📱 Mobile Number</label>
                            <div style={styles.inputWrapper}>
                                <span style={styles.inputPrefix}>+91</span>
                                <input
                                    name="mobile"
                                    type="tel"
                                    placeholder="Enter mobile number"
                                    value={form.mobile}
                                    onChange={handleChange}
                                    style={styles.inputWithPrefix}
                                    required
                                />
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>🔒 Password</label>
                            <div style={styles.inputWrapper}>
                                <input
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={form.password}
                                    onChange={handleChange}
                                    style={{ ...styles.inputWithPrefix, paddingLeft: '14px' }}
                                    required
                                />
                                <button type="button" style={styles.eyeBtn}
                                    onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <div style={styles.forgotRow}>
                            <span style={styles.forgot}>Forgot Password?</span>
                        </div>

                        <button type="submit"
                            style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
                            disabled={loading}>
                            {loading ? '⏳ Signing in...' : 'SIGN IN'}
                        </button>

                        <div style={styles.dividerRow}>
                            <div style={styles.dividerLine} />
                            <span style={styles.dividerText}>or</span>
                            <div style={styles.dividerLine} />
                        </div>

                        <button type="button" style={styles.otpBtn}>
                            📱 Login with OTP
                        </button>
                    </form>

                    <p style={styles.switchText}>
                        New to Gettimelam?{' '}
                        <span style={styles.switchLink} onClick={onSwitchToRegister}>
                            FREE REGISTER
                        </span>
                    </p>

                    <p style={styles.terms}>
                        I hereby authorize to send notification via SMS, email, RCS and others as per{' '}
                        <a href="/terms" style={styles.termsLink}>T&C</a> and{' '}
                        <a href="/privacy" style={styles.termsLink}>Privacy Policy</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
    modal: { background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '860px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' },
    leftPanel: { background: 'linear-gradient(160deg, #B71C1C, #7B0000)', width: '320px', flexShrink: 0, padding: '36px 28px', display: 'flex', flexDirection: 'column', borderRadius: '20px 0 0 20px' },
    logo: { height: '60px', objectFit: 'contain', marginBottom: '20px', filter: 'brightness(0) invert(1)' },
    leftTitle: { fontFamily: "'Playfair Display', serif", fontSize: '22px', color: '#fff', marginBottom: '8px', lineHeight: 1.3 },
    leftSubtitle: { fontSize: '13px', color: 'rgba(255,255,255,0.75)', marginBottom: '24px' },
    features: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' },
    feature: { fontSize: '13px', color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
    leftContact: { fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '16px' },
    rightPanel: { flex: 1, padding: '36px 32px', position: 'relative', overflowY: 'auto' },
    closeBtn: { position: 'absolute', top: '16px', right: '16px', background: '#FFF8E1', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontSize: '14px', cursor: 'pointer', color: '#B71C1C', fontWeight: '700' },
    rightTitle: { fontFamily: "'Playfair Display', serif", fontSize: '28px', color: '#1A0A0A', marginBottom: '4px' },
    rightSubtitle: { fontSize: '14px', color: '#7A5C00', marginBottom: '24px' },
    tabs: { display: 'flex', gap: '8px', marginBottom: '24px' },
    tab: { flex: 1, padding: '10px', textAlign: 'center', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#7A5C00', background: '#FFF8E1', border: '1.5px solid #F5BE17', borderRadius: '8px', transition: 'all 0.2s' },
    tabActive: { background: '#B71C1C', color: '#fff', border: '1.5px solid #B71C1C' },
    formGroup: { marginBottom: '16px' },
    label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#5F0909', marginBottom: '6px' },
    inputWrapper: { display: 'flex', alignItems: 'center', border: '1.5px solid #F5BE17', borderRadius: '8px', overflow: 'hidden', background: '#fff' },
    inputPrefix: { padding: '12px 12px', fontSize: '14px', color: '#5F0909', background: '#FFF8E1', fontWeight: '600', borderRight: '1px solid #F5BE17', whiteSpace: 'nowrap' },
    inputWithPrefix: { flex: 1, padding: '12px 14px', border: 'none', outline: 'none', fontSize: '14px', color: '#2C1810', background: '#fff', fontFamily: "'DM Sans', sans-serif" },
    eyeBtn: { padding: '0 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' },
    forgotRow: { textAlign: 'right', marginBottom: '20px' },
    forgot: { fontSize: '13px', color: '#B71C1C', cursor: 'pointer', fontWeight: '600' },
    submitBtn: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #B71C1C, #D32F2F)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginBottom: '16px', letterSpacing: '1px', fontFamily: "'DM Sans', sans-serif" },
    dividerRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
    dividerLine: { flex: 1, height: '1px', background: '#F5BE17' },
    dividerText: { fontSize: '13px', color: '#7A5C00', fontWeight: '600' },
    otpBtn: { width: '100%', padding: '12px', background: '#fff', border: '1.5px solid #F5BE17', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#5F0909', fontFamily: "'DM Sans', sans-serif", marginBottom: '20px' },
    switchText: { textAlign: 'center', fontSize: '14px', color: '#7A5C00', marginBottom: '12px' },
    switchLink: { color: '#B71C1C', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' },
    terms: { fontSize: '11px', color: '#9E9E9E', textAlign: 'center', lineHeight: 1.6 },
    termsLink: { color: '#B71C1C', textDecoration: 'underline' },
};

export default LoginModal;