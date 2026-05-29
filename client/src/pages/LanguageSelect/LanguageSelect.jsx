import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const LanguageSelect = () => {
    const [selected, setSelected] = useState('en');
    const navigate = useNavigate();
    const { user } = useAuth();
    const { i18n } = useTranslation();

    const handleSelect = () => {
        // ✅ Connect to i18n — changes language across all pages
        i18n.changeLanguage(selected);
        localStorage.setItem('gettimelam_language', selected);
        navigate('/');
    };

    return (
        <div style={styles.page}>
            {/* Top banner */}
            <div style={styles.banner}>
                <div style={styles.bannerOverlay} />
                <div style={styles.bannerContent}>
                    <p style={styles.welcome}>We welcome you</p>
                    <div style={styles.coupleEmoji}>👫</div>
                    <h1 style={styles.brandName}>
                        <span style={styles.brandLight}>Gettimelam</span><br />
                        <span style={styles.brandBold}>Matrimony</span>
                    </h1>
                </div>
            </div>

            {/* Language selection */}
            <div style={styles.card}>
                <h2 style={styles.chooseLabel}>Choose Language</h2>
                <div style={styles.langRow}>
                    <button
                        style={{ ...styles.langBtn, ...(selected === 'ta' ? styles.langBtnActive : {}) }}
                        onClick={() => setSelected('ta')}>
                        <span style={styles.langChar}>த</span>
                        <span style={styles.langName}>தமிழ்</span>
                    </button>
                    <button
                        style={{ ...styles.langBtn, ...(selected === 'en' ? styles.langBtnActive : {}) }}
                        onClick={() => setSelected('en')}>
                        <span style={styles.langChar}>E</span>
                        <span style={styles.langName}>English</span>
                    </button>
                </div>
                <button style={styles.selectBtn} onClick={handleSelect}>
                    Select
                </button>
                {user && (
                    <p style={styles.greeting}>
                        Welcome, <strong>{user.name || user.businessName}</strong>! 🎊
                    </p>
                )}
            </div>
        </div>
    );
};

const styles = {
    page: { minHeight: '100vh', background: '#f5f5f5', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    banner: { width: '100%', maxWidth: '480px', background: 'linear-gradient(160deg, #B71C1C, #7B0000)', minHeight: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', borderRadius: '0 0 32px 32px', overflow: 'hidden' },
    bannerOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.15)' },
    bannerContent: { position: 'relative', textAlign: 'center', padding: '40px 20px' },
    welcome: { color: 'rgba(255,255,255,0.8)', fontSize: '16px', marginBottom: '12px', letterSpacing: '1px' },
    coupleEmoji: { fontSize: '80px', marginBottom: '16px' },
    brandName: { textAlign: 'center' },
    brandLight: { fontFamily: "'DM Sans', sans-serif", fontSize: '28px', color: 'rgba(255,255,255,0.85)', fontWeight: '400' },
    brandBold: { fontFamily: "'Playfair Display', serif", fontSize: '42px', color: '#fff', fontWeight: '700' },
    card: { background: '#fff', borderRadius: '20px', padding: '36px 32px', marginTop: '-20px', width: '90%', maxWidth: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', textAlign: 'center' },
    chooseLabel: { fontSize: '18px', fontWeight: '700', color: '#B71C1C', marginBottom: '24px' },
    langRow: { display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '28px' },
    langBtn: { width: '120px', height: '100px', border: '2px solid #E0E0E0', borderRadius: '16px', background: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' },
    langBtnActive: { border: '2px solid #B71C1C', background: '#FFF8E1' },
    langChar: { fontSize: '32px', fontWeight: '700', color: '#1A0A0A' },
    langName: { fontSize: '14px', color: '#5F0909', fontWeight: '600' },
    selectBtn: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #2E7D32, #43A047)', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', letterSpacing: '1px' },
    greeting: { marginTop: '16px', fontSize: '14px', color: '#7A5C00' },
};

export default LanguageSelect;