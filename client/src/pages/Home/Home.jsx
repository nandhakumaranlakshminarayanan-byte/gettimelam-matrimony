import React, { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Hero from '../../components/Hero/Hero';
import ProfilesSection from '../../components/Profiles/ProfilesSection';
import ServicesSection from '../../components/Services/ServicesSection';
import SuccessStoriesSection from '../../components/SuccessStories/SuccessStoriesSection';
import Footer from '../../components/Footer/Footer';
import LoginModal from '../../components/Modals/LoginModal';
import RegisterModal from '../../components/Modals/RegisterModal';
import BannerSlider from '../../components/BannerSlider/BannerSlider';
import { useAuth } from '../../context/AuthContext';

// Gold person silhouette (replaces 👩/👨 emoji)
const Silhouette = ({ tint }) => (
    <svg width="54" height="54" viewBox="0 0 54 54">
        <circle cx="27" cy="18" r="10" fill={tint} />
        <path d="M8 50 C8 36 18 31 27 31 C36 31 46 36 46 50 Z" fill={tint} />
    </svg>
);

// Gold padlock icon (replaces 🔒 emoji)
const LockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24">
        <rect x="5" y="10" width="14" height="10" rx="2.5" fill="#F1D289" />
        <path d="M8 10 V7.5 C8 5 9.8 3 12 3 C14.2 3 16 5 16 7.5 V10"
            stroke="#F1D289" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <circle cx="12" cy="14.6" r="1.7" fill="#5F0909" />
    </svg>
);

const Home = () => {
    const { user } = useAuth();
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    return (
        <div>
            <Navbar
                onLoginClick={() => setShowLogin(true)}
                onRegisterClick={() => setShowRegister(true)}
            />

            <BannerSlider />

            {!user && (
                <Hero
                    onRegisterClick={() => setShowRegister(true)}
                    onLoginClick={() => setShowLogin(true)}
                />
            )}

            {user ? (
                <ProfilesSection onLoginClick={() => setShowLogin(true)} />
            ) : (
                <section style={styles.teaser}>
                    {/* ambient glows to continue the hero atmosphere */}
                    <div style={styles.teaserGlowLeft} />
                    <div style={styles.teaserGlowRight} />

                    <div style={styles.teaserInner}>
                        <p style={styles.teaserLabel}>
                            <span style={styles.labelLine} />
                            Thousands of Verified Profiles
                            <span style={styles.labelLine} />
                        </p>
                        <h2 style={styles.teaserTitle}>Register Free to View All Profiles</h2>
                        <p style={styles.teaserDesc}>
                            Join Gettimelam Matrimony and find your perfect match from
                            thousands of verified profiles across Tamil Nadu.
                        </p>
                        <div style={styles.teaserCards}>
                            {[0, 1, 2, 3, 4, 5].map(i => (
                                <div key={i} style={styles.glassCard}>
                                    {/* profile visual */}
                                    <div style={styles.cardPhoto}>
                                        <div style={styles.photoGlow} />
                                        <Silhouette tint={i % 2 === 0 ? 'rgba(241,210,137,0.75)' : 'rgba(232,184,75,0.6)'} />
                                    </div>
                                    {/* skeleton detail lines */}
                                    <div style={styles.cardBody}>
                                        <div style={styles.line} />
                                        <div style={styles.lineShort} />
                                    </div>
                                    {/* frosted lock overlay */}
                                    <div style={styles.frost}>
                                        <div style={styles.lockChip}>
                                            <LockIcon />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <ServicesSection onLoginClick={() => setShowLogin(true)} />
            {!user && <SuccessStoriesSection />}
            <Footer />

            {showLogin && (
                <LoginModal
                    onClose={() => setShowLogin(false)}
                    onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }}
                />
            )}
            {showRegister && (
                <RegisterModal
                    onClose={() => setShowRegister(false)}
                    onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }}
                />
            )}
        </div>
    );
};

const styles = {
    teaser: {
        position: 'relative',
        padding: '76px 24px',
        background: 'linear-gradient(180deg, #120308 0%, #160408 50%, #170406 100%)',
        overflow: 'hidden',
    },
    teaserGlowLeft: {
        position: 'absolute', top: '-120px', left: '-100px', width: '440px', height: '440px',
        background: 'radial-gradient(circle, rgba(123,92,201,0.14) 0%, transparent 65%)',
        filter: 'blur(36px)', pointerEvents: 'none',
    },
    teaserGlowRight: {
        position: 'absolute', bottom: '-140px', right: '-80px', width: '480px', height: '480px',
        background: 'radial-gradient(circle, rgba(223,155,8,0.13) 0%, transparent 65%)',
        filter: 'blur(36px)', pointerEvents: 'none',
    },
    teaserInner: { position: 'relative', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' },
    teaserLabel: {
        display: 'inline-flex', alignItems: 'center', gap: '14px',
        fontSize: '12px', fontWeight: '700', letterSpacing: '2.5px', textTransform: 'uppercase',
        color: '#F0B429', marginBottom: '14px',
    },
    labelLine: {
        width: '42px', height: '1px', display: 'inline-block',
        background: 'linear-gradient(90deg, transparent, rgba(240,180,41,0.7), transparent)',
    },
    teaserTitle: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '38px', color: '#FFF8E1', marginBottom: '12px', fontWeight: '500',
    },
    teaserDesc: {
        fontSize: '16px', color: '#C9A876', maxWidth: '520px',
        margin: '0 auto 44px', lineHeight: 1.7,
    },
    teaserCards: {
        display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '18px',
    },
    glassCard: {
        position: 'relative',
        background: 'rgba(255,255,255,0.045)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(245,217,139,0.22)',
        borderRadius: '18px',
        overflow: 'hidden',
        boxShadow: '0 12px 34px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12)',
        userSelect: 'none',
    },
    cardPhoto: {
        position: 'relative', height: '110px',
        background: 'linear-gradient(160deg, #3A1020, #22060E)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
    },
    photoGlow: {
        position: 'absolute', width: '90px', height: '90px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(223,155,8,0.3), transparent 70%)',
        filter: 'blur(12px)',
    },
    cardBody: { padding: '14px 14px 18px' },
    line: {
        height: '9px', borderRadius: '5px', marginBottom: '8px',
        background: 'linear-gradient(90deg, rgba(241,210,137,0.4), rgba(241,210,137,0.15))',
    },
    lineShort: {
        height: '8px', borderRadius: '5px', width: '58%', margin: '0 auto',
        background: 'rgba(241,210,137,0.16)',
    },
    frost: {
        position: 'absolute', inset: 0,
        background: 'rgba(18,3,8,0.36)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    lockChip: {
        width: '46px', height: '46px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(245,217,139,0.45)',
        boxShadow: '0 8px 22px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
};

export default Home;
