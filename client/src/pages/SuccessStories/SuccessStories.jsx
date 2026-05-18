import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import LoginModal from '../../components/Modals/LoginModal';
import RegisterModal from '../../components/Modals/RegisterModal';
import axios from 'axios';

const API = 'http://localhost:5000';

const SuccessStories = () => {
    const navigate = useNavigate();
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [filter, setFilter] = useState('All');

    useEffect(() => { fetchStories(); }, []);

    const fetchStories = async () => {
        try {
            const res = await axios.get(`${API}/api/testimonials`);
            setStories(res.data.testimonials || []);
        } catch (err) {
            // Use sample data if API fails
            setStories(sampleStories);
        } finally {
            setLoading(false);
        }
    };

    const sampleStories = [
        { _id: '1', groomName: 'Arjun K.', brideName: 'Priya S.', religion: 'Hindu', city: 'Chennai', marriageDate: '2024-02-14', message: 'We found each other on Gettimelam and it was love at first sight. Our families approved immediately and we had a beautiful wedding. Thank you Gettimelam!' },
        { _id: '2', groomName: 'Mohamed A.', brideName: 'Fathima B.', religion: 'Muslim', city: 'Coimbatore', marriageDate: '2024-03-20', message: 'Gettimelam helped us find the perfect match. The profiles were genuine and the process was very smooth. Highly recommend!' },
        { _id: '3', groomName: 'David R.', brideName: 'Aishwarya T.', religion: 'Christian', city: 'Madurai', marriageDate: '2024-04-10', message: 'We matched on Gettimelam and within 6 months we were married. The platform is trustworthy and the team is very helpful.' },
        { _id: '4', groomName: 'Karthik M.', brideName: 'Deepa N.', religion: 'Hindu', city: 'Salem', marriageDate: '2024-05-15', message: 'Our parents were initially hesitant about online matrimony but Gettimelam proved them wrong. Best decision ever!' },
        { _id: '5', groomName: 'Rajan V.', brideName: 'Kavitha L.', religion: 'Hindu', city: 'Trichy', marriageDate: '2024-06-22', message: 'Simple, trustworthy and effective. Found my soulmate within 3 months. Thank you Gettimelam family!' },
        { _id: '6', groomName: 'Suresh P.', brideName: 'Meena R.', religion: 'Hindu', city: 'Erode', marriageDate: '2024-07-08', message: 'The verified profiles gave us confidence. We spoke for 2 months and then our families met. Perfect match!' },
    ];

    const religions = ['All', 'Hindu', 'Muslim', 'Christian'];
    const filtered = filter === 'All' ? stories : stories.filter(s => s.religion === filter);

    const getReligionIcon = (religion) => {
        if (religion === 'Hindu') return '🕉️';
        if (religion === 'Muslim') return '☪️';
        if (religion === 'Christian') return '✝️';
        return '💍';
    };

    return (
        <div style={{ background: '#FFFDF9', minHeight: '100vh' }}>
            <Navbar onLoginClick={() => setShowLogin(true)} onRegisterClick={() => setShowRegister(true)} />

            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerInner}>
                    <div style={styles.headerBadge}>💍 Success Stories</div>
                    <h1 style={styles.headerTitle}>Couples Who Found Love</h1>
                    <p style={styles.headerDesc}>
                        Over 5,000 happy couples found their perfect match on Gettimelam Matrimony
                    </p>
                    <div style={styles.statsRow}>
                        {[
                            { value: '5,000+', label: 'Happy Couples' },
                            { value: '10,000+', label: 'Matches Made' },
                            { value: '98%', label: 'Success Rate' },
                        ].map(s => (
                            <div key={s.label} style={styles.statItem}>
                                <div style={styles.statValue}>{s.value}</div>
                                <div style={styles.statLabel}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={styles.container}>

                {/* Filter Pills */}
                <div style={styles.filterRow}>
                    {religions.map(r => (
                        <button key={r}
                            style={{ ...styles.filterBtn, ...(filter === r ? styles.filterBtnActive : {}) }}
                            onClick={() => setFilter(r)}>
                            {r === 'All' ? '💍 All' : `${getReligionIcon(r)} ${r}`}
                        </button>
                    ))}
                    <span style={styles.filterCount}>
                        Showing <strong>{filtered.length}</strong> stories
                    </span>
                </div>

                {/* Stories Grid */}
                {loading ? (
                    <div style={styles.loading}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                        <p style={{ color: '#7A6055' }}>Loading success stories...</p>
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {filtered.map((story, i) => (
                            <div key={story._id} style={{
                                ...styles.card,
                                animationDelay: `${i * 0.1}s`
                            }}>
                                {/* Card Header */}
                                <div style={{
                                    ...styles.cardBanner,
                                    background: story.religion === 'Muslim'
                                        ? 'linear-gradient(135deg, #1A3A1A, #2E7D32)'
                                        : story.religion === 'Christian'
                                            ? 'linear-gradient(135deg, #1A1A3A, #1565C0)'
                                            : 'linear-gradient(135deg, #3D1A1A, #8B1A1A)'
                                }}>
                                    <div style={styles.couplePhotos}>
                                        <div style={styles.photoCircle}>
                                            {story.groomPhoto ? (
                                                <img src={`${API}${story.groomPhoto}`} alt={story.groomName}
                                                    style={styles.photo} />
                                            ) : (
                                                <span style={{ fontSize: '32px' }}>👨</span>
                                            )}
                                        </div>
                                        <div style={styles.heartCircle}>💍</div>
                                        <div style={styles.photoCircle}>
                                            {story.bridePhoto ? (
                                                <img src={`${API}${story.bridePhoto}`} alt={story.brideName}
                                                    style={styles.photo} />
                                            ) : (
                                                <span style={{ fontSize: '32px' }}>👩</span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={styles.religiousBadge}>
                                        {getReligionIcon(story.religion)} {story.religion}
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div style={styles.cardBody}>
                                    <h3 style={styles.coupleNames}>
                                        {story.groomName} & {story.brideName}
                                    </h3>
                                    <div style={styles.cardMeta}>
                                        📍 {story.city}
                                        {story.marriageDate && (
                                            <span> • 💍 {new Date(story.marriageDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
                                        )}
                                    </div>
                                    {story.message && (
                                        <p style={styles.cardMsg}>
                                            "{story.message.substring(0, 120)}{story.message.length > 120 ? '...' : ''}"
                                        </p>
                                    )}
                                    <div style={styles.verifiedBadge}>✓ Verified on Gettimelam</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {filtered.length === 0 && !loading && (
                    <div style={styles.loading}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>💍</div>
                        <p style={{ color: '#7A6055' }}>No stories found for this filter</p>
                    </div>
                )}

                {/* CTA Section */}
                <div style={styles.cta}>
                    <div style={styles.ctaInner}>
                        <h2 style={styles.ctaTitle}>Your Love Story Awaits! 💕</h2>
                        <p style={styles.ctaDesc}>
                            Join thousands of Tamil families who found their perfect match on Gettimelam
                        </p>
                        <div style={styles.ctaBtns}>
                            <button style={styles.ctaBtnPrimary} onClick={() => setShowRegister(true)}>
                                Register Free Now →
                            </button>
                            <button style={styles.ctaBtnSecondary} onClick={() => navigate('/browse')}>
                                Browse Profiles
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />

            {showLogin && (
                <LoginModal onClose={() => setShowLogin(false)}
                    onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }} />
            )}
            {showRegister && (
                <RegisterModal onClose={() => setShowRegister(false)}
                    onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }} />
            )}
        </div>
    );
};

const styles = {
    header: { background: 'linear-gradient(135deg, #1A0A0A, #3D1A1A)', padding: '60px 24px', textAlign: 'center' },
    headerInner: { maxWidth: '700px', margin: '0 auto' },
    headerBadge: { display: 'inline-block', background: 'rgba(201,168,76,0.2)', border: '1px solid rgba(201,168,76,0.4)', color: '#C9A84C', padding: '6px 18px', borderRadius: '50px', fontSize: '13px', fontWeight: '600', marginBottom: '16px' },
    headerTitle: { fontFamily: "'Playfair Display', serif", fontSize: '42px', color: '#fff', marginBottom: '12px' },
    headerDesc: { color: 'rgba(255,255,255,0.7)', fontSize: '16px', marginBottom: '32px' },
    statsRow: { display: 'flex', justifyContent: 'center', gap: '48px' },
    statItem: { textAlign: 'center' },
    statValue: { fontFamily: "'Playfair Display', serif", fontSize: '32px', fontWeight: '700', color: '#C9A84C' },
    statLabel: { fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' },
    filterRow: { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap' },
    filterBtn: { padding: '8px 20px', border: '1.5px solid #E8D5C4', borderRadius: '50px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', background: '#fff', color: '#7A6055' },
    filterBtnActive: { background: '#8B1A1A', color: '#fff', border: '1.5px solid #8B1A1A' },
    filterCount: { marginLeft: 'auto', fontSize: '13px', color: '#7A6055' },
    loading: { textAlign: 'center', padding: '80px 20px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '48px' },
    card: { background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(139,26,26,0.08)', transition: 'transform 0.2s' },
    cardBanner: { height: '160px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '20px' },
    couplePhotos: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' },
    photoCircle: { width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)' },
    photo: { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' },
    heartCircle: { fontSize: '20px' },
    religiousBadge: { background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px' },
    cardBody: { padding: '20px' },
    coupleNames: { fontFamily: "'Playfair Display', serif", fontSize: '18px', color: '#1A0A0A', marginBottom: '6px' },
    cardMeta: { fontSize: '12px', color: '#7A6055', marginBottom: '10px' },
    cardMsg: { fontSize: '13px', color: '#555', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '12px' },
    verifiedBadge: { display: 'inline-block', background: '#E8F5E9', color: '#2E7D32', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' },
    cta: { background: 'linear-gradient(135deg, #1A0A0A, #3D1A1A)', borderRadius: '20px', padding: '60px 40px', textAlign: 'center' },
    ctaInner: { maxWidth: '600px', margin: '0 auto' },
    ctaTitle: { fontFamily: "'Playfair Display', serif", fontSize: '36px', color: '#fff', marginBottom: '12px' },
    ctaDesc: { color: 'rgba(255,255,255,0.7)', fontSize: '15px', marginBottom: '28px' },
    ctaBtns: { display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' },
    ctaBtnPrimary: { padding: '14px 32px', background: '#C9A84C', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' },
    ctaBtnSecondary: { padding: '14px 32px', background: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
};

export default SuccessStories;