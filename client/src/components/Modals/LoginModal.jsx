import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const LoginModal = ({ onClose, onSwitchToRegister }) => {
    const { login } = useAuth();
    const [form, setForm] = useState({ mobile: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(form);
            toast.success('Welcome back! 🎊');
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed!');
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
                        <h2 style={styles.title}>Welcome Back 👋</h2>
                        <p style={styles.subtitle}>Login to find your perfect match</p>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                {/* Tabs */}
                <div style={styles.tabs}>
                    <div style={{ ...styles.tab, ...styles.tabActive }}>Member Login</div>
                    <div style={styles.tab}>Service Provider</div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={styles.form}>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Mobile Number</label>
                        <input
                            name="mobile"
                            type="tel"
                            placeholder="Enter your mobile number"
                            value={form.mobile}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.forgotRow}>
                        <span style={styles.forgot}>Forgot Password?</span>
                    </div>

                    <button
                        type="submit"
                        style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
                        disabled={loading}
                    >
                        {loading ? '⏳ Logging in...' : '🔐 Login'}
                    </button>

                    <div style={styles.divider}>
                        <span style={styles.dividerText}>or</span>
                    </div>

                    <button type="button" style={styles.otpBtn}>
                        📱 Login with OTP
                    </button>

                </form>

                <p style={styles.switchText}>
                    Don't have an account?{' '}
                    <span style={styles.switchLink} onClick={onSwitchToRegister}>
                        Register Free
                    </span>
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
        maxWidth: '480px',
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
        color: '#8B1A1A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
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
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        color: '#7A6055',
        background: '#fff'
    },
    tabActive: {
        background: '#8B1A1A',
        color: '#fff'
    },
    form: {},
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
    forgotRow: {
        textAlign: 'right',
        marginBottom: '20px'
    },
    forgot: {
        fontSize: '13px',
        color: '#8B1A1A',
        cursor: 'pointer',
        fontWeight: '500'
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
    divider: {
        textAlign: 'center',
        position: 'relative',
        marginBottom: '16px'
    },
    dividerText: {
        background: '#fff',
        padding: '0 12px',
        fontSize: '13px',
        color: '#7A6055',
        position: 'relative',
        zIndex: 1
    },
    otpBtn: {
        width: '100%',
        padding: '12px',
        background: '#fff',
        border: '1.5px solid #E8D5C4',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        color: '#2C1810',
        fontFamily: "'DM Sans', sans-serif",
        marginBottom: '20px'
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

export default LoginModal;