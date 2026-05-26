import React, { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Hero from '../../components/Hero/Hero';
import ProfilesSection from '../../components/Profiles/ProfilesSection';
import ServicesSection from '../../components/Services/ServicesSection';
import Footer from '../../components/Footer/Footer';
import LoginModal from '../../components/Modals/LoginModal';
import RegisterModal from '../../components/Modals/RegisterModal';
import BannerSlider from '../../components/BannerSlider/BannerSlider';
import { useAuth } from '../../context/AuthContext';

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
                    <div style={styles.teaserInner}>
                        <p style={styles.teaserLabel}>✨ Thousands of Verified Profiles</p>
                        <h2 style={styles.teaserTitle}>Register Free to View All Profiles</h2>
                        <p style={styles.teaserDesc}>
                            Join Gettimelam Matrimony and find your perfect match from
                            thousands of verified profiles across Tamil Nadu.
                        </p>
                        <div style={styles.teaserCards}>
                            {['👩', '👨', '👩', '👨', '👩', '👨'].map((emoji, i) => (
                                <div key={i} style={styles.blurCard}>
                                    <div style={styles.blurPhoto}>{emoji}</div>
                                    <div style={styles.blurLine} />
                                    <div style={styles.blurLineShort} />
                                    <div style={styles.blurLock}>🔒</div>
                                </div>
                            ))}
                        </div>
                        <button style={styles.teaserBtn} onClick={() => setShowRegister(true)}>
                            🎊 Register Free to View Profiles
                        </button>
                        <p style={styles.teaserSub}>
                            Already a member?{' '}
                            <span style={styles.loginLink} onClick={() => setShowLogin(true)}>
                                Login here
                            </span>
                        </p>
                    </div>
                </section>
            )}

            <ServicesSection />
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
    teaser: { padding: '72px 24px', background: '#FFF8E1' },
    teaserInner: { maxWidth: '1200px', margin: '0 auto', textAlign: 'center' },
    teaserLabel: { fontSize: '12px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#DF9B08', marginBottom: '10px' },
    teaserTitle: { fontFamily: "'Playfair Display', serif", fontSize: '38px', color: '#5F0909', marginBottom: '12px' },
    teaserDesc: { fontSize: '16px', color: '#7A5C00', marginBottom: '40px', maxWidth: '500px', margin: '0 auto 40px' },
    teaserCards: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px', marginBottom: '40px', position: 'relative' },
    blurCard: { background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(223,155,8,0.15)', position: 'relative', filter: 'blur(4px)', userSelect: 'none' },
    blurPhoto: { height: '100px', background: 'linear-gradient(135deg, #FFF8E1, #F5BE17)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' },
    blurLine: { height: '10px', background: '#F5BE17', margin: '10px 12px 6px', borderRadius: '4px' },
    blurLineShort: { height: '8px', background: '#FFF8E1', margin: '0 12px 12px', borderRadius: '4px', width: '60%' },
    blurLock: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '24px', filter: 'none' },
    teaserBtn: { padding: '16px 40px', background: 'linear-gradient(135deg, #B71C1C, #D32F2F)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginBottom: '16px', fontFamily: "'DM Sans', sans-serif" },
    teaserSub: { fontSize: '14px', color: '#7A5C00' },
    loginLink: { color: '#B71C1C', fontWeight: '600', cursor: 'pointer' },
};

export default Home;