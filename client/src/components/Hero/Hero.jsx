import React from 'react';
import { useTranslation } from 'react-i18next';

// Small gold diamond bullet (replaces emoji checkmarks)
const Dia = () => <span style={{
    width: '7px', height: '7px', background: '#DF9B08',
    transform: 'rotate(45deg)', display: 'inline-block', flexShrink: 0,
}} />;

// Kuthuvilakku (oil lamp) icon — replaces 🎊 on the glass card
const LampIcon = () => (
    <svg width="38" height="44" viewBox="0 0 40 46" style={{ display: 'block', margin: '0 auto 8px' }}>
        <ellipse cx="20" cy="34" rx="14" ry="5" fill="#E8B84B" />
        <path d="M12 34 L15 24 H25 L28 34 Z" fill="#E8B84B" />
        <rect x="18.6" y="18" width="2.8" height="7" fill="#E8B84B" />
        <path d="M20 6 C23 10 23 14 20 17 C17 14 17 10 20 6 Z" fill="#F5D98B" />
    </svg>
);

const Hero = ({ onRegisterClick, onLoginClick }) => {
    const { t } = useTranslation();
    return (
        <section style={styles.hero}>
            {/* soft bokeh glows */}
            <div style={styles.glowGold} />
            <div style={styles.glowViolet} />
            <div style={styles.glowMaroon} />
            <div style={{ ...styles.bokeh, top: '14%', right: '8%', width: '10px', height: '10px', opacity: 0.9 }} />
            <div style={{ ...styles.bokeh, top: '26%', right: '20%', width: '6px', height: '6px', opacity: 0.6 }} />
            <div style={{ ...styles.bokeh, top: '62%', left: '4%', width: '8px', height: '8px', opacity: 0.5 }} />
            <div style={{ ...styles.bokeh, bottom: '12%', right: '34%', width: '5px', height: '5px', opacity: 0.7 }} />

            <div style={styles.inner}>

                {/* LEFT — Text */}
                <div style={styles.left}>
                    <div style={styles.badge}>{t('home.hero_subtitle')}</div>
                    <h1 style={styles.h1}>
                        {t('home.hero_title')}
                    </h1>
                    <div style={styles.goldRule} />
                    <p style={styles.desc}>
                        {t('home.hero_desc')}
                    </p>

                    {/* Stats — glass strip */}
                    <div style={styles.stats}>
                        {[
                            { num: '50,000+', label: t('home.stats_profiles') },
                            { num: '10,000+', label: t('home.stats_matches') },
                            { num: '5,000+', label: t('home.stats_couples') },
                            { num: '100%', label: t('home.register_btn') }
                        ].map((s, i) => (
                            <div key={s.label} style={{
                                ...styles.stat,
                                borderLeft: i > 0 ? '1px solid rgba(245,217,139,0.25)' : 'none',
                            }}>
                                <strong style={styles.statNum}>{s.num}</strong>
                                <span style={styles.statLabel}>{s.label}</span>
                            </div>
                        ))}
                    </div>

                </div>

                {/* RIGHT — Frosted glass CTA card */}
                <div style={styles.right}>
                    <div style={styles.formCard}>
                        {/* glass sheen */}
                        <div style={styles.sheen} />

                        <LampIcon />
                        <h3 style={styles.formTitle}>Find Your Match — Free</h3>
                        <p style={styles.formSub}>Join thousands of Tamil families</p>

                        {/* Quick stats */}
                        <div style={styles.quickStats}>
                            {[
                                { label: 'Brides', count: '25,000+' },
                                { label: 'Grooms', count: '25,000+' },
                                { label: 'Married', count: '5,000+' },
                            ].map((s, i) => (
                                <div key={s.label} style={{
                                    ...styles.quickStat,
                                    borderLeft: i > 0 ? '1px solid rgba(245,217,139,0.25)' : 'none',
                                }}>
                                    <strong style={styles.quickCount}>{s.count}</strong>
                                    <span style={styles.quickLabel}>{s.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Features */}
                        <div style={styles.features}>
                            {[
                                '100% Free Registration',
                                'Verified Profiles Only',
                                'All Communities Welcome',
                                'Horoscope Matching',
                                'Privacy Protected',
                                'No Charges After Marriage',
                            ].map(f => (
                                <div key={f} style={styles.feature}><Dia /> {f}</div>
                            ))}
                        </div>

                        <button style={styles.registerBtn} onClick={onRegisterClick}>
                            {t('home.register_btn').toUpperCase()}
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
        background: 'radial-gradient(ellipse at 20% 0%, #3A1030 0%, #2A0C1C 30%, #1A0510 60%, #120308 100%)',
        minHeight: '640px',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '60px 0',
    },
    glowGold: {
        position: 'absolute', top: '-140px', right: '-60px', width: '480px', height: '480px',
        background: 'radial-gradient(circle, rgba(223,155,8,0.22) 0%, transparent 65%)',
        filter: 'blur(30px)', pointerEvents: 'none',
    },
    glowViolet: {
        position: 'absolute', bottom: '-160px', left: '-100px', width: '540px', height: '540px',
        background: 'radial-gradient(circle, rgba(123,92,201,0.22) 0%, transparent 65%)',
        filter: 'blur(30px)', pointerEvents: 'none',
    },
    glowMaroon: {
        position: 'absolute', top: '30%', left: '35%', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(142,20,20,0.28) 0%, transparent 65%)',
        filter: 'blur(40px)', pointerEvents: 'none',
    },
    bokeh: {
        position: 'absolute', borderRadius: '50%',
        background: '#F0B429', filter: 'blur(2px)', pointerEvents: 'none',
    },
    inner: {
        position: 'relative',
        maxWidth: '1200px', margin: '0 auto', padding: '0 24px',
        display: 'flex', alignItems: 'center', gap: '52px', width: '100%',
    },
    left: { flex: 1.15 },
    badge: {
        display: 'inline-block',
        fontSize: '12px', fontWeight: '700', letterSpacing: '2.5px', textTransform: 'uppercase',
        color: '#F0B429',
        border: '1px solid rgba(240,180,41,0.45)',
        background: 'rgba(240,180,41,0.06)',
        padding: '9px 20px', borderRadius: '3px',
        marginBottom: '26px',
    },
    h1: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '54px', lineHeight: 1.12, fontWeight: '500',
        color: '#EDE6F2',
        marginBottom: '14px',
    },
    goldRule: {
        width: '90px', height: '3px',
        background: 'linear-gradient(90deg, #E8B84B, transparent)',
        marginBottom: '22px',
    },
    desc: {
        fontSize: '16.5px', lineHeight: 1.75, color: '#CBB6C4', maxWidth: '520px',
        marginBottom: '34px',
    },
    stats: {
        display: 'flex',
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(245,217,139,0.35)',
        borderRadius: '10px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
        marginBottom: '32px',
        maxWidth: '640px',
    },
    stat: {
        flex: 1, textAlign: 'center', padding: '18px 10px',
        display: 'flex', flexDirection: 'column', gap: '4px',
    },
    statNum: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '26px', color: '#FFF8E1', fontWeight: '600',
    },
    statLabel: {
        fontSize: '10.5px', letterSpacing: '1.8px', textTransform: 'uppercase', color: '#B49BAA',
    },
    right: { flex: 0.9 },
    formCard: {
        position: 'relative',
        background: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        border: '1px solid rgba(255,255,255,0.28)',
        borderRadius: '18px',
        padding: '34px 32px 28px',
        textAlign: 'center',
        boxShadow: '0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.25)',
        overflow: 'hidden',
    },
    sheen: {
        position: 'absolute', top: '-40%', right: '-30%', width: '90%', height: '90%',
        background: 'linear-gradient(215deg, rgba(255,255,255,0.16), transparent 55%)',
        transform: 'rotate(8deg)', pointerEvents: 'none',
    },
    formTitle: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '26px', color: '#FFFFFF', fontWeight: '600', marginBottom: '4px',
    },
    formSub: { fontSize: '13.5px', color: '#CBB6C4', marginBottom: '22px' },
    quickStats: {
        display: 'flex',
        borderTop: '1px solid rgba(245,217,139,0.3)',
        borderBottom: '1px solid rgba(245,217,139,0.3)',
        padding: '16px 0', marginBottom: '22px',
    },
    quickStat: { flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' },
    quickCount: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '21px', color: '#FFF8E1', fontWeight: '600',
    },
    quickLabel: { fontSize: '10px', letterSpacing: '1.6px', textTransform: 'uppercase', color: '#B49BAA' },
    features: {
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '11px 16px',
        textAlign: 'left', marginBottom: '24px',
    },
    feature: {
        fontSize: '13px', color: '#E4D8E0',
        display: 'flex', alignItems: 'center', gap: '9px',
    },
    registerBtn: {
        width: '100%',
        fontSize: '15px', fontWeight: '700', letterSpacing: '1.2px',
        color: '#3D2202',
        background: 'linear-gradient(180deg, #F7DE8F 0%, #E3AC2A 45%, #C98F12 55%, #E8BC4A 100%)',
        border: '1px solid rgba(255,255,255,0.55)',
        borderRadius: '8px',
        padding: '15px',
        cursor: 'pointer',
        boxShadow: '0 10px 26px rgba(223,155,8,0.4), inset 0 1px 0 rgba(255,255,255,0.7)',
        marginBottom: '14px',
        transition: 'all 0.2s ease',
    },
    loginText: { fontSize: '13px', color: '#CBB6C4' },
    loginLink: { color: '#F5D98B', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' },
};

export default Hero;
