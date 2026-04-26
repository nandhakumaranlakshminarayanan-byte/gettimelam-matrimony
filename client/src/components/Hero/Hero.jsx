import React from 'react';

const Hero = ({ onRegisterClick, onLoginClick }) => {
    return (
        <section style={styles.hero}>
            <div style={styles.pattern} />
            <div style={styles.inner}>

                {/* LEFT — Text */}
                <div style={styles.left}>
                    <div style={styles.badge}>🎊 Tamil Nadu's Trusted Matrimony</div>
                    <h1 style={styles.h1}>
                        Find Your <em style={styles.em}>Perfect</em><br />
                        Life Partner
                    </h1>
                    <p style={styles.desc}>
                        Join thousands of Tamil families who found their perfect match
                        on Gettimelam Matrimony. Free registration. Verified profiles.
                        Trusted by generations.
                    </p>

                    {/* Stats */}
                    <div style={styles.stats}>
                        {[
                            { num: '50,000+', label: 'Profiles' },
                            { num: '10,000+', label: 'Matches Made' },
                            { num: '5,000+', label: 'Happy Couples' },
                            { num: '100%', label: 'Free Register' }
                        ].map(s => (
                            <div key={s.label} style={styles.stat}>
                                <strong style={styles.statNum}>{s.num}</strong>
                                <span style={styles.statLabel}>{s.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Trust badges */}
                    <div style={styles.badges}>
                        {['✔ Free Registration', '✔ Verified Profiles', '✔ All Communities', '✔ Safe & Secure'].map(b => (
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
                            🎊 Register Free Now
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
        background: 'linear-gradient(135deg, #1A0A0A 0%, #3D1A1A 60%, #5C1A1A 100%)',
        minHeight: '620px',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
    },
    pattern: {
        position: 'absolute',
        inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C9A84C' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
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
        background: 'rgba(201,168,76,0.15)',
        border: '1px solid rgba(201,168,76,0.3)',
        color: '#C9A84C',
        padding: '6px 16px',
        borderRadius: '50px',
        fontSize: '13px',
        fontWeight: '600',
        marginBottom: '20px'
    },
    h1: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '52px',
        color: '#fff',
        lineHeight: 1.15,
        marginBottom: '16px'
    },
    em: {
        color: '#C9A84C',
        fontStyle: 'italic'
    },
    desc: {
        color: 'rgba(255,255,255,0.7)',
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
        color: '#C9A84C',
        fontFamily: "'Playfair Display', serif"
    },
    statLabel: {
        fontSize: '11px',
        color: 'rgba(255,255,255,0.55)'
    },
    badges: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px'
    },
    trustBadge: {
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.12)',
        color: 'rgba(255,255,255,0.8)',
        padding: '6px 14px',
        borderRadius: '50px',
        fontSize: '12px',
        fontWeight: '500'
    },
    right: {},
    formCard: {
        background: '#fff',
        borderRadius: '20px',
        padding: '32px 28px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.35)'
    },
    formTitle: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '22px',
        color: '#8B1A1A',
        marginBottom: '4px',
        textAlign: 'center'
    },
    formSub: {
        fontSize: '13px',
        color: '#7A6055',
        textAlign: 'center',
        marginBottom: '20px'
    },
    quickStats: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '20px',
        padding: '16px',
        background: '#FDF5EE',
        borderRadius: '12px'
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
        color: '#8B1A1A',
        fontFamily: "'Playfair Display', serif"
    },
    quickLabel: {
        fontSize: '11px',
        color: '#7A6055'
    },
    features: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        marginBottom: '24px'
    },
    feature: {
        fontSize: '12px',
        color: '#2C1810',
        fontWeight: '500'
    },
    registerBtn: {
        width: '100%',
        padding: '14px',
        background: 'linear-gradient(135deg, #8B1A1A, #C0392B)',
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
        color: '#7A6055'
    },
    loginLink: {
        color: '#8B1A1A',
        fontWeight: '600',
        cursor: 'pointer'
    }
};

export default Hero;