import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
    const { login } = useAdmin();
    const navigate = useNavigate();
    const [form, setForm] = useState({ mobile: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(form.mobile, form.password);
            toast.success('Welcome Admin! 🛡️');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Login failed!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.logo}>🛡️</div>
                    <h1 style={styles.title}>Admin Login</h1>
                    <p style={styles.subtitle}>Gettimelam Matrimony — Admin Panel</p>
                </div>

                {/* Warning */}
                <div style={styles.warning}>
                    ⚠️ This area is restricted to authorized administrators only.
                    Unauthorized access is prohibited.
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Admin Mobile Number</label>
                        <input
                            type="tel"
                            placeholder="Enter admin mobile"
                            value={form.mobile}
                            onChange={e => setForm({ ...form, mobile: e.target.value })}
                            style={styles.input}
                            required
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            placeholder="Enter admin password"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            style={styles.input}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
                        disabled={loading}
                    >
                        {loading ? '⏳ Logging in...' : '🛡️ Login to Admin Panel'}
                    </button>
                </form>

                <p style={styles.footer}>
                    © 2024 Gettimelam Matrimony — Admin Portal
                </p>
            </div>
        </div>
    );
};

const styles = {
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0D0D0D, #1A0A0A, #2D1A0A)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
    },
    card: {
        background: '#fff',
        borderRadius: '20px',
        padding: '40px 36px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)'
    },
    header: {
        textAlign: 'center',
        marginBottom: '24px'
    },
    logo: {
        fontSize: '48px',
        marginBottom: '12px'
    },
    title: {
        fontFamily: "'Georgia', serif",
        fontSize: '26px',
        color: '#1A0A0A',
        marginBottom: '6px'
    },
    subtitle: {
        fontSize: '13px',
        color: '#7A6055'
    },
    warning: {
        background: '#FFF3E0',
        border: '1px solid #FFB74D',
        borderRadius: '8px',
        padding: '12px 14px',
        fontSize: '12px',
        color: '#E65100',
        marginBottom: '24px',
        lineHeight: 1.6
    },
    form: {},
    formGroup: { marginBottom: '16px' },
    label: {
        display: 'block',
        fontSize: '11px',
        fontWeight: '700',
        color: '#7A6055',
        marginBottom: '6px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    input: {
        width: '100%',
        padding: '12px 14px',
        border: '1.5px solid #E8D5C4',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#1A0A0A',
        outline: 'none',
        fontFamily: 'sans-serif',
        boxSizing: 'border-box'
    },
    btn: {
        width: '100%',
        padding: '14px',
        background: 'linear-gradient(135deg, #1A0A0A, #3D1A1A)',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        fontSize: '15px',
        fontWeight: '700',
        cursor: 'pointer',
        marginBottom: '20px'
    },
    footer: {
        textAlign: 'center',
        fontSize: '11px',
        color: '#B0B0B0'
    }
};

export default Login;