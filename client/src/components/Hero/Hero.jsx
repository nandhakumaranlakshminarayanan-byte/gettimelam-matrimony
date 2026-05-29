import React from 'react';
import { useTranslation } from 'react-i18next';

const Hero = ({ onRegisterClick, onLoginClick }) => {
    const { t } = useTranslation();
    return (
        <section style={styles.hero}>
            <div style={styles.pattern} />
            <div style={styles.inner}>

                {/* LEFT — Text */}
                <div style={styles.left}>
                    <div style={styles.badge}>🎊 {t('home.hero_subtitle')}</div>
                    <h1 style={styles.h1}>
                        {t('home.hero_title')}
                    </h1>
                    <p style={styles.desc}>
                        {t('home.hero_desc')}
                    </p>

                    {/* Stats */}
                    <div style={styles.stats}>
                        {[
                            { num: '50,000+', label: t('home.stats_profiles') },
                            { num: '10,000+', label: t('home.stats_matches') },
                            { num: '5,000+', label: t('home.stats_couples') },
                            { num: '100%', label: t('home.register_btn') }
                        ].map(s => (
                            <div key={s.label} style={styles.stat}>
                                <strong style={styles.statNum}>{s.num}</strong>
                                <span style={styles.statLabel}>{s.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Trust badges */}
                    <div style={styles.badges}>
                        {['✓ Free Registration', '✓ Verified Profiles', '✓ All Communities', '✓ Safe & Secure'].map(b => (
                            <span key={b} style={styles.trustBadge}>{b}</span>
                        ))}
                    </div>
                </div>

                {/* RIGHT — CTA Card */}
                <div style={styles.right}>
                    <div style={styles.formCard}>
                        <h3 style={styles.formTitle}>🎊 Find Your Match — Free!</h3>
                        <p style={styles.formSub}>Join thousands of Tamil families</p>

                        {/* Quick stats */}
                        <div style={styles.quickStats}>
                            {[
                                { emoji: '👩', label: 'Brides', count: '25,000+' },
                                { emoji: '👨', label: 'Grooms', count: '25,000+' },
                                { emoji: '💍', label: 'Married', count: '5,000+' },
                            ].map(s => (
                                <div key={s.label} style={styles.quickStat}>
                                    <span style={styles.quickEmoji}>{s.emoji}</span>
                                    <strong style={styles.quickCount}>{s.count}</strong>
                                    <span style={styles.quickLabel}>{s.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Features */}
                        <div style={styles.features}>
                            {[
                                '✅ 100% Free Registration',
                                '✅ Verified Profiles Only',
                                '✅ All Communities Welcome',
                                '✅ Hindu, Muslim & Christian',
                                '✅ Privacy Protected',
                                '✅ No Charges After Marriage',
                            ].map(f => (
                                <div key={f} style={styles.feature}>{f}</div>
                            ))}
                        </div>

                        <button style={styles.registerBtn} onClick={onRegisterClick}>
                            🎊 {t('home.register_btn')}
                        </button>

                        <p style={styles.loginText}>
                            Already a member?{' '}
                            <span style={styles.loginLink} onClick={onLoginClick}>
                                Login here
                            </span>
                        </p>
                    </div>
                </div>

            </div>
        </section>
    );
};

const styles = {
    hero: {
        background: 'linear-gradient(135deg, #F5BE17 0%, #DF9B08 60%, #B8860B 100%)',
        minHeight: '620px',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
    },
    pattern: {
        position: 'absolute',
        inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%235F0909' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
    },
    inner: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '60px 24px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '60px',
        alignItems: 'center',
        position: 'relative',
        width: '100%'
    },
    left: {},
    badge: {
        display: 'inline-block',
        background: 'rgba(95,9,9,0.12)',
        border: '1px solid rgba(95,9,9,0.25)',
        color: '#5F0909',
        padding: '6px 16px',
        borderRadius: '50px',
        fontSize: '13px',
        fontWeight: '600',
        marginBottom: '20px'
    },
    h1: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '52px',
        color: '#5F0909',
        lineHeight: 1.15,
        marginBottom: '16px'
    },
    em: {
        color: '#fff',
        fontStyle: 'italic'
    },
    desc: {
        color: 'rgba(95,9,9,0.75)',
        fontSize: '16px',
        lineHeight: 1.7,
        marginBottom: '32px',
        maxWidth: '440px'
    },
    stats: {
        display: 'flex',
        gap: '28px',
        marginBottom: '28px'
    },
    stat: { textAlign: 'center' },
    statNum: {
        display: 'block',
        fontSize: '26px',
        fontWeight: '700',
        color: '#5F0909',
        fontFamily: "'Playfair Display', serif"
    },
    statLabel: {
        fontSize: '11px',
        color: 'rgba(95,9,9,0.65)'
    },
    badges: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px'
    },
    trustBadge: {
        background: 'rgba(95,9,9,0.10)',
        border: '1px solid rgba(95,9,9,0.20)',
        color: '#5F0909',
        padding: '6px 14px',
        borderRadius: '50px',
        fontSize: '12px',
        fontWeight: '600'
    },
    right: {},
    formCard: {
        background: 'rgba(255,253,244,0.92)',
        borderRadius: '20px',
        padding: '32px 28px',
        boxShadow: '0 24px 64px rgba(95,9,9,0.2)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(245,190,23,0.3)'
    },
    formTitle: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '22px',
        color: '#B71C1C',
        marginBottom: '4px',
        textAlign: 'center'
    },
    formSub: {
        fontSize: '13px',
        color: '#7A5C00',
        textAlign: 'center',
        marginBottom: '20px'
    },
    quickStats: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '20px',
        padding: '16px',
        background: '#FFF8E1',
        borderRadius: '12px',
        border: '1px solid #F5BE17'
    },
    quickStat: {
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2px'
    },
    quickEmoji: { fontSize: '24px' },
    quickCount: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#B71C1C',
        fontFamily: "'Playfair Display', serif"
    },
    quickLabel: {
        fontSize: '11px',
        color: '#7A5C00'
    },
    features: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        marginBottom: '24px'
    },
    feature: {
        fontSize: '12px',
        color: '#5F0909',
        fontWeight: '500'
    },
    registerBtn: {
        width: '100%',
        padding: '14px',
        background: 'linear-gradient(135deg, #B71C1C, #D32F2F)',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        marginBottom: '12px',
        fontFamily: "'DM Sans', sans-serif"
    },
    loginText: {
        textAlign: 'center',
        fontSize: '13px',
        color: '#7A5C00'
    },
    loginLink: {
        color: '#B71C1C',
        fontWeight: '600',
        cursor: 'pointer'
    }
};

export default Hero;