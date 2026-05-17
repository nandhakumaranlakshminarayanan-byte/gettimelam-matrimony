import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const RegisterModal = ({ onClose, onSwitchToLogin }) => {
    const { register } = useAuth();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('member'); // ✅ Tab state

    // Member form state
    const [memberForm, setMemberForm] = useState({
        profileFor: 'Myself',
        gender: 'Female',
        name: '',
        mobile: '',
        email: '',
        password: '',
        dateOfBirth: '',
        motherTongue: 'Tamil'
    });

    // Service Provider form state
    const [vendorForm, setVendorForm] = useState({
        businessName: '',
        ownerName: '',
        mobile: '',
        email: '',
        password: '',
        category: 'Wedding Hall/Venue',
        city: '',
        district: '',
    });

    const handleMemberChange = (e) => {
        setMemberForm({ ...memberForm, [e.target.name]: e.target.value });
    };

    const handleVendorChange = (e) => {
        setVendorForm({ ...vendorForm, [e.target.name]: e.target.value });
    };

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
            } else {
                if (vendorForm.password.length < 6) {
                    toast.error('Password must be at least 6 characters!');
                    setLoading(false);
                    return;
                }
                await register({ ...vendorForm, role: 'vendor' });
                toast.success('Service Provider registered! 🎊');
            }
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed!');
        } finally {
            setLoading(false);
        }
    };

    const serviceCategories = [
        'Wedding Hall/Venue',
        'Event Decoration',
        'Catering',
        'Wedding Rentals',
        'Photography',
        'Videography',
        'DJ & Entertainment',
        'Choreography',
        'Bridal Makeup & Hair',
        'Mehndi Artist',
        'Bridal Styling',
        'Wedding Planner',
        'Travel & Accommodation',
        'Officiant/Priest',
        'Security & Valet',
        'Wedding Cake',
        'Favors & Gifts',
        'Stationery & Cards',
    ];

    return (
        <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={styles.modal}>

                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <h2 style={styles.title}>Register Free 🎊</h2>
                        <p style={styles.subtitle}>
                            {activeTab === 'member'
                                ? 'Find your perfect life partner today'
                                : 'List your wedding services on Gettimelam'}
                        </p>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                {/* ✅ Tabs - now clickable */}
                <div style={styles.tabs}>
                    <div
                        style={{
                            ...styles.tab,
                            ...(activeTab === 'member' ? styles.tabActive : {})
                        }}
                        onClick={() => setActiveTab('member')}
                    >
                        I'm Looking for a Match
                    </div>
                    <div
                        style={{
                            ...styles.tab,
                            ...(activeTab === 'vendor' ? styles.tabActive : {})
                        }}
                        onClick={() => setActiveTab('vendor')}
                    >
                        Service Provider
                    </div>
                </div>

                {/* ✅ MEMBER FORM */}
                {activeTab === 'member' && (
                    <form onSubmit={handleSubmit}>
                        <div style={styles.grid2}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Profile For</label>
                                <select
                                    name="profileFor"
                                    value={memberForm.profileFor}
                                    onChange={handleMemberChange}
                                    style={styles.input}
                                >
                                    {['Myself', 'Son', 'Daughter', 'Brother', 'Sister', 'Relative', 'Friend'].map(o => (
                                        <option key={o}>{o}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Gender</label>
                                <select
                                    name="gender"
                                    value={memberForm.gender}
                                    onChange={handleMemberChange}
                                    style={styles.input}
                                >
                                    <option>Male</option>
                                    <option>Female</option>
                                </select>
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Full Name *</label>
                            <input
                                name="name"
                                type="text"
                                placeholder="Enter full name"
                                value={memberForm.name}
                                onChange={handleMemberChange}
                                style={styles.input}
                                required
                            />
                        </div>

                        <div style={styles.grid2}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Date of Birth *</label>
                                <input
                                    name="dateOfBirth"
                                    type="date"
                                    value={memberForm.dateOfBirth}
                                    onChange={handleMemberChange}
                                    style={styles.input}
                                    required
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Mother Tongue</label>
                                <select
                                    name="motherTongue"
                                    value={memberForm.motherTongue}
                                    onChange={handleMemberChange}
                                    style={styles.input}
                                >
                                    {['Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Hindi', 'English'].map(o => (
                                        <option key={o}>{o}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Mobile Number *</label>
                            <input
                                name="mobile"
                                type="tel"
                                placeholder="+91 99999 99999"
                                value={memberForm.mobile}
                                onChange={handleMemberChange}
                                style={styles.input}
                                required
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Email Address *</label>
                            <input
                                name="email"
                                type="email"
                                placeholder="your@email.com"
                                value={memberForm.email}
                                onChange={handleMemberChange}
                                style={styles.input}
                                required
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Password *</label>
                            <input
                                name="password"
                                type="password"
                                placeholder="Min 6 characters"
                                value={memberForm.password}
                                onChange={handleMemberChange}
                                style={styles.input}
                                required
                            />
                        </div>

                        <p style={styles.terms}>
                            By registering you agree to our{' '}
                            <a href="/terms" style={styles.termsLink}>Terms & Conditions</a>
                            {' '}and{' '}
                            <a href="/privacy" style={styles.termsLink}>Privacy Policy</a>
                        </p>

                        <button
                            type="submit"
                            style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
                            disabled={loading}
                        >
                            {loading ? '⏳ Registering...' : '🎊 Register & Get Started'}
                        </button>
                    </form>
                )}

                {/* ✅ VENDOR / SERVICE PROVIDER FORM */}
                {activeTab === 'vendor' && (
                    <form onSubmit={handleSubmit}>

                        <div style={styles.vendorNotice}>
                            🏪 Register your wedding business and get discovered by thousands of families!
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Business Name *</label>
                            <input
                                name="businessName"
                                type="text"
                                placeholder="e.g. Sri Murugan Photography"
                                value={vendorForm.businessName}
                                onChange={handleVendorChange}
                                style={styles.input}
                                required
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Owner / Contact Person Name *</label>
                            <input
                                name="ownerName"
                                type="text"
                                placeholder="Enter your full name"
                                value={vendorForm.ownerName}
                                onChange={handleVendorChange}
                                style={styles.input}
                                required
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Service Category *</label>
                            <select
                                name="category"
                                value={vendorForm.category}
                                onChange={handleVendorChange}
                                style={styles.input}
                            >
                                {serviceCategories.map(cat => (
                                    <option key={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div style={styles.grid2}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>City *</label>
                                <input
                                    name="city"
                                    type="text"
                                    placeholder="e.g. Chennai"
                                    value={vendorForm.city}
                                    onChange={handleVendorChange}
                                    style={styles.input}
                                    required
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>District *</label>
                                <input
                                    name="district"
                                    type="text"
                                    placeholder="e.g. Coimbatore"
                                    value={vendorForm.district}
                                    onChange={handleVendorChange}
                                    style={styles.input}
                                    required
                                />
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Mobile Number *</label>
                            <input
                                name="mobile"
                                type="tel"
                                placeholder="+91 99999 99999"
                                value={vendorForm.mobile}
                                onChange={handleVendorChange}
                                style={styles.input}
                                required
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Email Address *</label>
                            <input
                                name="email"
                                type="email"
                                placeholder="business@email.com"
                                value={vendorForm.email}
                                onChange={handleVendorChange}
                                style={styles.input}
                                required
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Password *</label>
                            <input
                                name="password"
                                type="password"
                                placeholder="Min 6 characters"
                                value={vendorForm.password}
                                onChange={handleVendorChange}
                                style={styles.input}
                                required
                            />
                        </div>

                        <p style={styles.terms}>
                            By registering you agree to our{' '}
                            <a href="/terms" style={styles.termsLink}>Terms & Conditions</a>
                            {' '}and{' '}
                            <a href="/privacy" style={styles.termsLink}>Privacy Policy</a>
                        </p>

                        <button
                            type="submit"
                            style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
                            disabled={loading}
                        >
                            {loading ? '⏳ Registering...' : '🏪 Register My Business'}
                        </button>
                    </form>
                )}

                <p style={styles.switchText}>
                    Already a member?{' '}
                    <span style={styles.switchLink} onClick={onSwitchToLogin}>Login here</span>
                </p>

            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
    },
    modal: {
        background: '#fff',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '520px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '32px 28px'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px'
    },
    title: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '26px',
        color: '#1A0A0A',
        marginBottom: '4px'
    },
    subtitle: {
        fontSize: '14px',
        color: '#7A6055'
    },
    closeBtn: {
        background: '#FDF0F0',
        border: 'none',
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        fontSize: '16px',
        cursor: 'pointer',
        color: '#8B1A1A'
    },
    tabs: {
        display: 'flex',
        border: '1.5px solid #E8D5C4',
        borderRadius: '10px',
        marginBottom: '24px',
        overflow: 'hidden'
    },
    tab: {
        flex: 1,
        padding: '10px',
        textAlign: 'center',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
        color: '#7A6055',
        background: '#fff',
        transition: 'all 0.2s ease',
        userSelect: 'none'
    },
    tabActive: {
        background: '#8B1A1A',
        color: '#fff'
    },
    vendorNotice: {
        background: '#FFF8F0',
        border: '1px solid #E8D5C4',
        borderRadius: '8px',
        padding: '12px 14px',
        fontSize: '13px',
        color: '#7A6055',
        marginBottom: '20px',
        textAlign: 'center',
        lineHeight: 1.5
    },
    grid2: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px'
    },
    formGroup: {
        marginBottom: '16px'
    },
    label: {
        display: 'block',
        fontSize: '11px',
        fontWeight: '600',
        color: '#7A6055',
        marginBottom: '5px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    input: {
        width: '100%',
        padding: '12px 14px',
        border: '1.5px solid #E8D5C4',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#2C1810',
        background: '#FFFDF9',
        outline: 'none',
        fontFamily: "'DM Sans', sans-serif",
        boxSizing: 'border-box'
    },
    terms: {
        fontSize: '12px',
        color: '#7A6055',
        marginBottom: '16px',
        lineHeight: 1.6
    },
    termsLink: {
        color: '#8B1A1A',
        textDecoration: 'underline'
    },
    submitBtn: {
        width: '100%',
        padding: '14px',
        background: 'linear-gradient(135deg, #8B1A1A, #C0392B)',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        marginBottom: '16px',
        fontFamily: "'DM Sans', sans-serif"
    },
    switchText: {
        textAlign: 'center',
        fontSize: '14px',
        color: '#7A6055'
    },
    switchLink: {
        color: '#8B1A1A',
        fontWeight: '600',
        cursor: 'pointer'
    }
};

export default RegisterModal;