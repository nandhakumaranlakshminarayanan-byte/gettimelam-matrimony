import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const RegisterModal = ({ onClose, onSwitchToLogin }) => {
    const { register } = useAuth();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        profileFor: 'Myself',
        gender: 'Female',
        name: '',
        mobile: '',
        email: '',
        password: '',
        dateOfBirth: '',
        motherTongue: 'Tamil'
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) {
            toast.error('Password must be at least 6 characters!');
            return;
        }
        setLoading(true);
        try {
            await register(form);
            toast.success('Registration successful! Welcome to Gettimelam! 🎊');
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={styles.modal}>

                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <h2 style={styles.title}>Register Free 🎊</h2>
                        <p style={styles.subtitle}>Find your perfect life partner today</p>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                {/* Tabs */}
                <div style={styles.tabs}>
                    <div style={{ ...styles.tab, ...styles.tabActive }}>I'm Looking for a Match</div>
                    <div style={styles.tab}>Service Provider</div>
                </div>

                <form onSubmit={handleSubmit}>

                    {/* Profile For + Gender */}
                    <div style={styles.grid2}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Profile For</label>
                            <select
                                name="profileFor"
                                value={form.profileFor}
                                onChange={handleChange}
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
                                value={form.gender}
                                onChange={handleChange}
                                style={styles.input}
                            >
                                <option>Male</option>
                                <option>Female</option>
                            </select>
                        </div>
                    </div>

                    {/* Name */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Full Name *</label>
                        <input
                            name="name"
                            type="text"
                            placeholder="Enter full name"
                            value={form.name}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />
                    </div>

                    {/* DOB + Mother Tongue */}
                    <div style={styles.grid2}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Date of Birth *</label>
                            <input
                                name="dateOfBirth"
                                type="date"
                                value={form.dateOfBirth}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Mother Tongue</label>
                            <select
                                name="motherTongue"
                                value={form.motherTongue}
                                onChange={handleChange}
                                style={styles.input}
                            >
                                {['Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Hindi', 'English'].map(o => (
                                    <option key={o}>{o}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Mobile */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Mobile Number *</label>
                        <input
                            name="mobile"
                            type="tel"
                            placeholder="+91 99999 99999"
                            value={form.mobile}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />
                    </div>

                    {/* Email */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email Address *</label>
                        <input
                            name="email"
                            type="email"
                            placeholder="your@email.com"
                            value={form.email}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />
                    </div>

                    {/* Password */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Password *</label>
                        <input
                            name="password"
                            type="password"
                            placeholder="Create a strong password (min 6 chars)"
                            value={form.password}
                            onChange={handleChange}
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
        background: '#fff'
    },
    tabActive: {
        background: '#8B1A1A',
        color: '#fff'
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