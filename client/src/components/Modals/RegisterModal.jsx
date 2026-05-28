import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const RegisterModal = ({ onClose, onSwitchToLogin }) => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('member');

    const [memberForm, setMemberForm] = useState({
        profileFor: 'Myself', gender: 'Female', name: '',
        mobile: '', email: '', password: '', dateOfBirth: '', motherTongue: 'Tamil'
    });

    const [vendorForm, setVendorForm] = useState({
        businessName: '', ownerName: '', mobile: '', email: '',
        password: '', category: 'Wedding Hall/Venue', city: '', district: '',
    });

    const handleMemberChange = (e) => setMemberForm({ ...memberForm, [e.target.name]: e.target.value });
    const handleVendorChange = (e) => setVendorForm({ ...vendorForm, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (activeTab === 'member') {
                if (memberForm.password.length < 6) {
                    toast.error('Password must be at least 6 characters!');
                    setLoading(false);
                    return;
                }
                await register({ ...memberForm, role: 'member' });
                toast.success('Welcome to Gettimelam! 🎊');
                onClose();
                navigate('/language');
            } else {
                if (vendorForm.password.length < 6) {
                    toast.error('Password must be at least 6 characters!');
                    setLoading(false);
                    return;
                }
                await register({ ...vendorForm, role: 'service' });
                toast.success('Service Provider registered! 🎊');
                onClose();
                navigate('/language');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed!');
        } finally {
            setLoading(false);
        }
    };

    const serviceCategories = [
        'Wedding Hall/Venue', 'Event Decoration', 'Catering', 'Wedding Rentals',
        'Photography', 'Videography', 'DJ & Entertainment', 'Choreography',
        'Bridal Makeup & Hair', 'Mehndi Artist', 'Bridal Styling', 'Wedding Planner',
        'Travel & Accommodation', 'Officiant/Priest', 'Security & Valet',
        'Wedding Cake', 'Favors & Gifts', 'Stationery & Cards',
    ];

    return (
        <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={styles.modal}>

                {/* ── Left Panel ── */}
                <div style={styles.leftPanel}>
                    <img src="/logo.png" alt="Gettimelam" style={styles.logo} />
                    <h2 style={styles.leftTitle}>Start Your Journey to Find Your Life Partner</h2>
                    <p style={styles.leftSubtitle}>Join thousands of Tamil families</p>

                    <div style={styles.stats}>
                        {[
                            { num: '50,000+', label: 'Profiles' },
                            { num: '10,000+', label: 'Matches Made' },
                            { num: '5,000+', label: 'Happy Couples' },
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
                            '✅ No Charges After Marriage',
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

                    <h3 style={styles.rightTitle}>Free Register</h3>
                    <p style={styles.rightSubtitle}>Create your account in minutes</p>

                    {/* Tabs */}
                    <div style={styles.tabs}>
                        <button
                            style={{ ...styles.tab, ...(activeTab === 'member' ? styles.tabActive : {}) }}
                            onClick={() => setActiveTab('member')}>
                            💍 I'm Looking for a Match
                        </button>
                        <button
                            style={{ ...styles.tab, ...(activeTab === 'vendor' ? styles.tabActive : {}) }}
                            onClick={() => setActiveTab('vendor')}>
                            🏪 Service Provider
                        </button>
                    </div>

                    {/* MEMBER FORM */}
                    {activeTab === 'member' && (
                        <form onSubmit={handleSubmit}>
                            <div style={styles.radioGroup}>
                                <label style={styles.label}>Profile For</label>
                                <div style={styles.radioRow}>
                                    {['Myself', 'Son', 'Daughter', 'Brother', 'Sister', 'Relative'].map(o => (
                                        <label key={o} style={styles.radioLabel}>
                                            <input type="radio" name="profileFor" value={o}
                                                checked={memberForm.profileFor === o}
                                                onChange={handleMemberChange}
                                                style={{ marginRight: '4px' }} />
                                            {o}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div style={styles.radioGroup}>
                                <label style={styles.label}>Gender</label>
                                <div style={styles.genderRow}>
                                    {['Male', 'Female'].map(g => (
                                        <button key={g} type="button"
                                            style={{ ...styles.genderBtn, ...(memberForm.gender === g ? styles.genderBtnActive : {}) }}
                                            onClick={() => setMemberForm({ ...memberForm, gender: g })}>
                                            {g === 'Male' ? '👨 Groom' : '👩 Bride'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Full Name *</label>
                                <input name="name" type="text" placeholder="Enter full name"
                                    value={memberForm.name} onChange={handleMemberChange}
                                    style={styles.input} required />
                            </div>

                            <div style={styles.grid2}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Date of Birth *</label>
                                    <input name="dateOfBirth" type="date"
                                        value={memberForm.dateOfBirth} onChange={handleMemberChange}
                                        style={styles.input} required />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Mother Tongue</label>
                                    <select name="motherTongue" value={memberForm.motherTongue}
                                        onChange={handleMemberChange} style={styles.input}>
                                        {['Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Hindi', 'English'].map(o => (
                                            <option key={o}>{o}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>📱 Mobile Number *</label>
                                <div style={styles.inputWrapper}>
                                    <span style={styles.inputPrefix}>+91</span>
                                    <input name="mobile" type="tel" placeholder="Enter mobile number"
                                        value={memberForm.mobile} onChange={handleMemberChange}
                                        style={styles.inputWithPrefix} required />
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>📧 Email Address *</label>
                                <input name="email" type="email" placeholder="your@email.com"
                                    value={memberForm.email} onChange={handleMemberChange}
                                    style={styles.input} required />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>🔒 Password *</label>
                                <input name="password" type="password" placeholder="Min 6 characters"
                                    value={memberForm.password} onChange={handleMemberChange}
                                    style={styles.input} required />
                            </div>

                            <p style={styles.terms}>
                                I hereby authorize to send notification via SMS, email, RCS and others as per{' '}
                                <a href="/terms" style={styles.termsLink}>T&C</a> and{' '}
                                <a href="/privacy" style={styles.termsLink}>Privacy Policy</a>
                            </p>

                            <button type="submit"
                                style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
                                disabled={loading}>
                                {loading ? '⏳ Registering...' : 'FREE REGISTER'}
                            </button>
                        </form>
                    )}

                    {/* VENDOR FORM */}
                    {activeTab === 'vendor' && (
                        <form onSubmit={handleSubmit}>
                            <div style={styles.vendorNotice}>
                                🏪 Register your wedding business and get discovered by thousands of families across Tamil Nadu!
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Business Name *</label>
                                <input name="businessName" type="text" placeholder="e.g. Sri Murugan Photography"
                                    value={vendorForm.businessName} onChange={handleVendorChange}
                                    style={styles.input} required />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Owner / Contact Person Name *</label>
                                <input name="ownerName" type="text" placeholder="Enter your full name"
                                    value={vendorForm.ownerName} onChange={handleVendorChange}
                                    style={styles.input} required />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Service Category *</label>
                                <select name="category" value={vendorForm.category}
                                    onChange={handleVendorChange} style={styles.input}>
                                    {serviceCategories.map(cat => <option key={cat}>{cat}</option>)}
                                </select>
                            </div>

                            <div style={styles.grid2}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>City *</label>
                                    <input name="city" type="text" placeholder="e.g. Puducherry"
                                        value={vendorForm.city} onChange={handleVendorChange}
                                        style={styles.input} required />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>District *</label>
                                    <input name="district" type="text" placeholder="e.g. Puducherry"
                                        value={vendorForm.district} onChange={handleVendorChange}
                                        style={styles.input} required />
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>📱 Mobile Number *</label>
                                <div style={styles.inputWrapper}>
                                    <span style={styles.inputPrefix}>+91</span>
                                    <input name="mobile" type="tel" placeholder="Enter mobile number"
                                        value={vendorForm.mobile} onChange={handleVendorChange}
                                        style={styles.inputWithPrefix} required />
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>📧 Email Address *</label>
                                <input name="email" type="email" placeholder="business@email.com"
                                    value={vendorForm.email} onChange={handleVendorChange}
                                    style={styles.input} required />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>🔒 Password *</label>
                                <input name="password" type="password" placeholder="Min 6 characters"
                                    value={vendorForm.password} onChange={handleVendorChange}
                                    style={styles.input} required />
                            </div>

                            <p style={styles.terms}>
                                I hereby authorize to send notification via SMS, email, RCS and others as per{' '}
                                <a href="/terms" style={styles.termsLink}>T&C</a> and{' '}
                                <a href="/privacy" style={styles.termsLink}>Privacy Policy</a>
                            </p>

                            <button type="submit"
                                style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
                                disabled={loading}>
                                {loading ? '⏳ Registering...' : 'REGISTER MY BUSINESS'}
                            </button>
                        </form>
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

const styles = {
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
    modal: { background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' },
    leftPanel: { background: 'linear-gradient(160deg, #B71C1C, #7B0000)', width: '300px', flexShrink: 0, padding: '32px 24px', display: 'flex', flexDirection: 'column', borderRadius: '20px 0 0 20px' },
    logo: { height: '55px', objectFit: 'contain', marginBottom: '20px', filter: 'brightness(0) invert(1)' },
    leftTitle: { fontFamily: "'Playfair Display', serif", fontSize: '20px', color: '#fff', marginBottom: '8px', lineHeight: 1.3 },
    leftSubtitle: { fontSize: '13px', color: 'rgba(255,255,255,0.75)', marginBottom: '20px' },
    stats: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px' },
    stat: { textAlign: 'center' },
    statNum: { fontSize: '16px', fontWeight: '700', color: '#F5BE17' },
    statLabel: { fontSize: '10px', color: 'rgba(255,255,255,0.7)' },
    features: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' },
    feature: { fontSize: '12px', color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
    leftContact: { fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '16px' },
    rightPanel: { flex: 1, padding: '32px 28px', position: 'relative', overflowY: 'auto' },
    closeBtn: { position: 'absolute', top: '16px', right: '16px', background: '#FFF8E1', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontSize: '14px', cursor: 'pointer', color: '#B71C1C', fontWeight: '700' },
    rightTitle: { fontFamily: "'Playfair Display', serif", fontSize: '26px', color: '#1A0A0A', marginBottom: '4px' },
    rightSubtitle: { fontSize: '14px', color: '#7A5C00', marginBottom: '20px' },
    tabs: { display: 'flex', gap: '8px', marginBottom: '20px' },
    tab: { flex: 1, padding: '10px 6px', textAlign: 'center', fontSize: '12px', fontWeight: '600', cursor: 'pointer', color: '#7A5C00', background: '#FFF8E1', border: '1.5px solid #F5BE17', borderRadius: '8px', transition: 'all 0.2s' },
    tabActive: { background: '#B71C1C', color: '#fff', border: '1.5px solid #B71C1C' },
    genderRow: { display: 'flex', gap: '10px', marginTop: '6px' },
    genderBtn: { flex: 1, padding: '10px', border: '1.5px solid #F5BE17', borderRadius: '8px', background: '#FFF8E1', color: '#7A5C00', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
    genderBtnActive: { background: '#B71C1C', color: '#fff', border: '1.5px solid #B71C1C' },
    radioGroup: { marginBottom: '14px' },
    radioRow: { display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '6px' },
    radioLabel: { fontSize: '13px', color: '#5F0909', fontWeight: '500', display: 'flex', alignItems: 'center', cursor: 'pointer' },
    formGroup: { marginBottom: '14px' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
    label: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#5F0909', marginBottom: '5px' },
    input: { width: '100%', padding: '11px 14px', border: '1.5px solid #F5BE17', borderRadius: '8px', fontSize: '14px', color: '#2C1810', background: '#fff', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' },
    inputWrapper: { display: 'flex', alignItems: 'center', border: '1.5px solid #F5BE17', borderRadius: '8px', overflow: 'hidden', background: '#fff' },
    inputPrefix: { padding: '11px 12px', fontSize: '14px', color: '#5F0909', background: '#FFF8E1', fontWeight: '600', borderRight: '1px solid #F5BE17', whiteSpace: 'nowrap' },
    inputWithPrefix: { flex: 1, padding: '11px 14px', border: 'none', outline: 'none', fontSize: '14px', color: '#2C1810', background: '#fff', fontFamily: "'DM Sans', sans-serif" },
    vendorNotice: { background: '#FFF8E1', border: '1px solid #F5BE17', borderRadius: '10px', padding: '12px 14px', fontSize: '13px', color: '#5F0909', marginBottom: '16px', textAlign: 'center', lineHeight: 1.5 },
    terms: { fontSize: '11px', color: '#9E9E9E', marginBottom: '14px', lineHeight: 1.6 },
    termsLink: { color: '#B71C1C', textDecoration: 'underline' },
    submitBtn: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #B71C1C, #D32F2F)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginBottom: '16px', letterSpacing: '1px', fontFamily: "'DM Sans', sans-serif" },
    switchText: { textAlign: 'center', fontSize: '14px', color: '#7A5C00' },
    switchLink: { color: '#B71C1C', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' },
};

export default RegisterModal;