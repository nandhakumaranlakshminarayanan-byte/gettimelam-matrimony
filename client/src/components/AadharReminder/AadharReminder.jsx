import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = 'http://localhost:5000';
const REMIND_EVERY_MS = 5 * 60 * 1000; // 5 minutes

// Mounted once at the app root (see App.js) so it persists across every
// page a logged-in member visits — not tied to Dashboard specifically.
// Checks the member's own aadharStatus on login and repeats the check
// (and the popup, if still not submitted) every 5 minutes.
const AadharReminder = () => {
    const { user } = useAuth();
    const [aadharStatus, setAadharStatus] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [aadharInput, setAadharInput] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const intervalRef = useRef(null);

    const checkStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await axios.get(`${API}/api/profiles/my`, { headers: { Authorization: `Bearer ${token}` } });
            const status = res.data.profile?.aadharStatus || 'not_submitted';
            setAadharStatus(status);
            if (status === 'not_submitted') setShowPopup(true);
        } catch (err) {
            // Profile might not exist yet (mid-registration) — nothing to
            // remind about until there's a profile at all.
        }
    };

    useEffect(() => {
        if (!user || user.role !== 'member') {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }
        checkStatus();
        intervalRef.current = setInterval(checkStatus, REMIND_EVERY_MS);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const digitsOnly = aadharInput.replace(/\s/g, '');
        if (!/^\d{12}$/.test(digitsOnly)) {
            toast.error('Aadhar number must be exactly 12 digits');
            return;
        }
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API}/api/profiles/aadhar`, { aadharNumber: digitsOnly }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Aadhar submitted — pending admin review');
            setAadharStatus('pending');
            setShowPopup(false);
            setAadharInput('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit Aadhar');
        } finally {
            setSubmitting(false);
        }
    };

    if (!showPopup || aadharStatus !== 'not_submitted') return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.icon}>🪪</div>
                <h3 style={styles.title}>Complete Your Aadhar Verification</h3>
                <p style={styles.desc}>
                    Submitting your Aadhar number helps us verify your profile so other
                    members can view it. This is required to unlock full access.
                </p>
                <form onSubmit={handleSubmit}>
                    <input
                        style={styles.input}
                        placeholder="12-digit Aadhar number"
                        value={aadharInput}
                        maxLength={12}
                        onChange={e => setAadharInput(e.target.value)}
                    />
                    <div style={styles.actions}>
                        <button type="button" style={styles.laterBtn} onClick={() => setShowPopup(false)}>
                            Remind me later
                        </button>
                        <button type="submit" style={{ ...styles.submitBtn, opacity: submitting ? 0.7 : 1 }} disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 2000, padding: '20px',
    },
    modal: {
        background: '#FFFDF4', borderRadius: '16px', padding: '32px',
        width: '100%', maxWidth: '400px', textAlign: 'center',
        border: '1px solid #F5BE17',
    },
    icon: { fontSize: '40px', marginBottom: '10px' },
    title: { fontSize: '18px', fontWeight: '700', color: '#5F0909', marginBottom: '10px', fontFamily: "'Playfair Display', serif" },
    desc: { fontSize: '13px', color: '#7A5C00', lineHeight: 1.6, marginBottom: '20px' },
    input: {
        width: '100%', padding: '12px 14px', border: '1.5px solid #F5BE17',
        borderRadius: '8px', fontSize: '15px', textAlign: 'center', letterSpacing: '1px',
        outline: 'none', boxSizing: 'border-box', marginBottom: '16px', fontFamily: 'inherit',
    },
    actions: { display: 'flex', gap: '10px' },
    laterBtn: {
        flex: 1, padding: '11px', background: '#fff', color: '#7A5C00',
        border: '1.5px solid #F5BE17', borderRadius: '8px', fontSize: '13.5px',
        fontWeight: '600', cursor: 'pointer',
    },
    submitBtn: {
        flex: 1, padding: '11px', background: 'linear-gradient(135deg, #B71C1C, #D32F2F)',
        color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13.5px',
        fontWeight: '700', cursor: 'pointer',
    },
};

export default AadharReminder;
