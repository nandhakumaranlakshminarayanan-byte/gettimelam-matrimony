import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = 'http://localhost:5000';

const ProfilesSection = ({ onLoginClick }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shortlistedIds, setShortlistedIds] = useState([]);
    const [likedIds, setLikedIds] = useState([]);
    const [sentInterestIds, setSentInterestIds] = useState([]);

    useEffect(() => { fetchProfiles(); }, [user]);
    useEffect(() => { if (user) { fetchShortlistedIds(); fetchLikedIds(); fetchSentInterestIds(); } }, [user]);

    const fetchProfiles = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            // /suggested already filters to opposite-gender profiles server-side,
            // so this teaser never shows same-gender matches.
            const res = await axios.get(`${API}/api/profiles/suggested`, { headers });
            setProfiles((res.data.profiles || []).slice(0, 6));
        } catch (err) {
            setProfiles([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchShortlistedIds = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/shortlist/my`, { headers: { Authorization: `Bearer ${token}` } });
            setShortlistedIds((res.data.profiles || []).map(p => p._id));
        } catch (err) { }
    };

    const fetchLikedIds = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/likes/my-likes`, { headers: { Authorization: `Bearer ${token}` } });
            setLikedIds((res.data.profiles || []).map(p => p._id));
        } catch (err) { }
    };

    const fetchSentInterestIds = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/interests/sent`, { headers: { Authorization: `Bearer ${token}` } });
            setSentInterestIds((res.data.interests || []).map(i => i.profile?._id).filter(Boolean));
        } catch (err) { }
    };

    const handleSendInterest = async (p) => {
        if (!user) { onLoginClick(); return; }
        const token = localStorage.getItem('token');

        // Already sent — clicking again withdraws it
        if (sentInterestIds.includes(p._id)) {
            try {
                await axios.delete(`${API}/api/interests/${p._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSentInterestIds(prev => prev.filter(id => id !== p._id));
                toast('Interest withdrawn', { icon: '↩️' });
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to withdraw interest');
            }
            return;
        }

        try {
            await axios.post(`${API}/api/interests/send`,
                { profileId: p._id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSentInterestIds(prev => [...prev, p._id]);
            toast.success(`Interest sent to ${getName(p)}! 💌`);
        } catch (err) {
            if (err.response?.data?.alreadySent) {
                setSentInterestIds(prev => [...prev, p._id]);
                toast('Interest already sent!', { icon: '💌' });
            } else {
                toast.error(err.response?.data?.message || 'Failed to send interest');
            }
        }
    };

    const handleShortlist = async (p) => {
        if (!user) { onLoginClick(); return; }
        const isShortlisted = shortlistedIds.includes(p._id);
        try {
            const token = localStorage.getItem('token');
            if (isShortlisted) {
                await axios.delete(`${API}/api/shortlist/remove/${p._id}`, { headers: { Authorization: `Bearer ${token}` } });
                setShortlistedIds(prev => prev.filter(id => id !== p._id));
                toast.success('Removed from shortlist!');
            } else {
                await axios.post(`${API}/api/shortlist/add`, { profileId: p._id }, { headers: { Authorization: `Bearer ${token}` } });
                setShortlistedIds(prev => [...prev, p._id]);
                toast.success('Shortlisted! ⭐');
            }
        } catch (err) { toast.error(err.response?.data?.message || 'Failed!'); }
    };

    const handleLike = async (p) => {
        if (!user) { onLoginClick(); return; }
        const isLiked = likedIds.includes(p._id);
        try {
            const token = localStorage.getItem('token');
            if (isLiked) {
                await axios.delete(`${API}/api/likes/remove/${p._id}`, { headers: { Authorization: `Bearer ${token}` } });
                setLikedIds(prev => prev.filter(id => id !== p._id));
                toast.success('Like removed!');
            } else {
                await axios.post(`${API}/api/likes/add`, { profileId: p._id }, { headers: { Authorization: `Bearer ${token}` } });
                setLikedIds(prev => [...prev, p._id]);
                toast.success('Liked! 👍');
            }
        } catch (err) { toast.error(err.response?.data?.message || 'Failed!'); }
    };

    const handleViewNumber = (p) => {
        if (!user) { onLoginClick(); return; }
        if (!user?.isPremium) { toast.error('Upgrade to Premium! ⭐'); return; }
        const mobile = p.user?.mobile;
        if (mobile) window.open(`tel:+91${mobile}`);
        else toast.error('Number not available');
    };

    const handleWhatsApp = (p) => {
        if (!user) { onLoginClick(); return; }
        if (!user?.isPremium) { toast.error('Upgrade to Premium! ⭐'); return; }
        const mobile = p.user?.mobile;
        if (mobile) window.open(`https://wa.me/91${mobile}`, '_blank');
    };

    const handleChat = (p) => {
        if (!user) { onLoginClick(); return; }
        const profileUserId = p.user?._id || p.user;
        if (profileUserId) navigate(`/messages?with=${profileUserId}`);
    };

    const getName = (p) => p.name || p.user?.name || 'Unknown';
    const getAge = (dob) => {
        if (!dob) return null;
        const age = Math.floor((new Date() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000));
        return age > 0 ? age : null;
    };

    // ✅ Check if user is unverified member
    const isUnverified = user && user.role === 'member' && !user.isVerified;

    // ✅ Block service accounts from seeing member profiles
    if (user && user.role === 'service') return (
        <section style={styles.section}>
            <div style={styles.inner}>
                <div style={styles.header}>
                    <p style={styles.label}>✨ Browse Profiles</p>
                    <h2 style={styles.title}>Find Your Perfect Match</h2>
                </div>
                <div style={{ textAlign: 'center', padding: '40px', background: '#FFF8E1', borderRadius: '16px', border: '1px solid #F5BE17' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏪</div>
                    <h3 style={{ color: '#B71C1C', marginBottom: '8px' }}>Service Provider Account</h3>
                    <p style={{ color: '#7A6055', fontSize: '14px' }}>
                        You are logged in as a service provider. Member profiles are only visible to matrimony members.
                    </p>
                </div>
            </div>
        </section>
    );

    if (loading) return (
        <section style={styles.section}>
            <div style={{ textAlign: 'center', padding: '60px' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>⏳</div>
                <p style={{ color: '#7A6055' }}>Loading profiles...</p>
            </div>
        </section>
    );

    return (
        <section style={styles.section}>
            <div style={styles.inner}>
                <div style={styles.header}>
                    <p style={styles.label}>✨ Browse Profiles</p>
                    <h2 style={styles.title}>Find Your Perfect Match</h2>
                    <p style={styles.desc}>Thousands of verified profiles waiting for you</p>
                </div>

                {/* ✅ Verification Banner */}
                {isUnverified && (
                    <div style={styles.verifyBanner}>
                        <div style={styles.verifyBannerLeft}>
                            <div style={{ fontSize: '28px', marginRight: '14px' }}>🔒</div>
                            <div>
                                <div style={styles.verifyBannerTitle}>Account Pending Verification</div>
                                <div style={styles.verifyBannerDesc}>
                                    Our team will call you within 24 hours to verify your account.
                                    Profile cards will be unlocked after verification.
                                </div>
                            </div>
                        </div>
                        <a href="tel:7339682802" style={styles.verifyBannerBtn}>
                            📞 Contact Support: 7339682802
                        </a>
                    </div>
                )}

                <div style={styles.grid}>
                    {profiles.map((p, i) => {
                        const isShortlisted = shortlistedIds.includes(p._id);
                        const isSent = sentInterestIds.includes(p._id);
                        const age = getAge(p.dateOfBirth);

                        return (
                            <div key={p._id || i} style={{ ...styles.card, position: 'relative', overflow: 'hidden' }}>

                                {/* Blur overlay for unverified users */}
                                {isUnverified && (
                                    <div style={styles.blurOverlay}>
                                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔒</div>
                                        <div style={styles.blurTitle}>Account Not Verified</div>
                                        <div style={styles.blurDesc}>
                                            Our team will verify your account via call within 24 hours
                                        </div>
                                        <a href="tel:7339682802" style={styles.blurBtn}>
                                            📞 7339682802
                                        </a>
                                    </div>
                                )}

                                {/* Photo — dominant, name & key facts overlaid */}
                                <div style={{
                                    ...styles.photo,
                                    background: p.gender === 'Female'
                                        ? 'linear-gradient(160deg, #4A2030, #2A0C1C)'
                                        : 'linear-gradient(160deg, #1F2A3D, #0C121F)',
                                    filter: isUnverified ? 'blur(4px)' : 'none'
                                }}>
                                    {p.photo ? (
                                        <img src={`${API}${p.photo}`} alt={getName(p)}
                                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                            onClick={() => !isUnverified && navigate(`/profile/${p._id}`)} />
                                    ) : (
                                        <span style={styles.avatar} onClick={() => !isUnverified && navigate(`/profile/${p._id}`)}>
                                            {p.gender === 'Female' ? '👩' : '👨'}
                                        </span>
                                    )}
                                    <div style={styles.photoGradient} />
                                    <span style={styles.verified}>✓ Verified</span>
                                    <button style={styles.heartBtn} onClick={() => handleShortlist(p)} title="Shortlist">
                                        {isShortlisted ? '❤️' : '🤍'}
                                    </button>
                                    <div style={styles.nameOverlay} onClick={() => !isUnverified && navigate(`/profile/${p._id}`)}>
                                        <div style={styles.overlayName}>{getName(p)}</div>
                                        <div style={styles.overlayMeta}>
                                            {[age && `${age} yrs`, p.height, p.maritalStatus].filter(Boolean).join(' • ')}
                                        </div>
                                        <div style={styles.overlayMeta}>
                                            {[p.city, p.education].filter(Boolean).join(' • ')}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions — Send Interest + View Profile (Shortlist is the heart above) */}
                                <div style={{ ...styles.body3, filter: isUnverified ? 'blur(4px)' : 'none' }}>
                                    <button
                                        style={{
                                            ...styles.btnInterest,
                                            background: isSent ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #8B1A1A, #B71C1C)',
                                            border: isSent ? '1.5px solid rgba(245,217,139,0.5)' : 'none',
                                            color: isSent ? '#F5D98B' : '#fff',
                                            boxShadow: 'none',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.boxShadow = isSent ? '0 0 16px rgba(245,217,139,0.5)' : '0 0 18px rgba(183,28,28,0.65)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
                                        onClick={() => handleSendInterest(p)}>
                                        {isSent ? '✓ Sent — tap to cancel' : '💌 Send Interest'}
                                    </button>
                                    <button
                                        style={{ ...styles.btnViewProfile, boxShadow: 'none' }}
                                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 16px rgba(245,217,139,0.45)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
                                        onClick={() => !isUnverified && navigate(`/profile/${p._id}`)}>
                                        View Profile
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {profiles.length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#7A6055' }}>
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>💍</div>
                            <p>No profiles yet. Be the first to register!</p>
                        </div>
                    )}
                </div>

                <div style={styles.center}>
                    <button style={styles.viewAll} onClick={() => navigate('/browse')}>
                        View All Profiles →
                    </button>
                </div>
            </div>
        </section>
    );
};

const styles = {
    section: { padding: '72px 24px', background: '#FDF5EE' },
    inner: { maxWidth: '1200px', margin: '0 auto' },
    header: { textAlign: 'center', marginBottom: '48px' },
    label: { fontSize: '12px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '10px' },
    title: { fontFamily: "'Playfair Display', serif", fontSize: '38px', color: '#1A0A0A', marginBottom: '12px' },
    desc: { fontSize: '16px', color: '#7A6055' },

    // ✅ Verification Banner
    verifyBanner: { background: 'linear-gradient(135deg, #B71C1C, #D32F2F)', borderRadius: '16px', padding: '20px 24px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' },
    verifyBannerLeft: { display: 'flex', alignItems: 'center', flex: 1 },
    verifyBannerTitle: { fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '4px' },
    verifyBannerDesc: { fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 },
    verifyBannerBtn: { padding: '10px 20px', background: '#F5BE17', color: '#5F0909', borderRadius: '8px', fontSize: '13px', fontWeight: '700', textDecoration: 'none', whiteSpace: 'nowrap' },

    // ✅ Blur overlay
    blurOverlay: { position: 'absolute', inset: 0, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', background: 'rgba(255,255,255,0.94)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', padding: '20px', textAlign: 'center' },
    blurTitle: { fontSize: '14px', fontWeight: '700', color: '#B71C1C', marginBottom: '6px' },
    blurDesc: { fontSize: '11px', color: '#5F0909', marginBottom: '12px', lineHeight: 1.5 },
    blurBtn: { padding: '8px 16px', background: '#B71C1C', color: '#fff', borderRadius: '8px', fontSize: '12px', fontWeight: '700', textDecoration: 'none' },

    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 240px))', gap: '18px', justifyContent: 'center' },
    card: {
        background: 'linear-gradient(160deg, #3A1020 0%, #22060E 100%)',
        borderRadius: '14px', overflow: 'hidden',
        boxShadow: '0 8px 26px rgba(0,0,0,0.35)',
        border: '1px solid rgba(245,217,139,0.18)',
        width: '100%',
    },
    photo: { height: '290px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer', overflow: 'hidden' },
    avatar: { fontSize: '56px', cursor: 'pointer' },
    photoGradient: { position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, transparent 35%, transparent 55%, rgba(0,0,0,0.85) 100%)', pointerEvents: 'none' },
    verified: { position: 'absolute', top: '10px', left: '10px', background: 'rgba(30,107,60,0.92)', color: '#fff', fontSize: '10.5px', fontWeight: '700', padding: '3px 9px', borderRadius: '20px' },
    heartBtn: { position: 'absolute', top: '9px', right: '9px', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' },
    nameOverlay: { position: 'absolute', bottom: '10px', left: '14px', right: '14px', cursor: 'pointer' },
    overlayName: { fontFamily: "'Playfair Display', serif", fontSize: '19px', fontWeight: '700', color: '#fff', textShadow: '0 2px 6px rgba(0,0,0,0.6)', marginBottom: '4px' },
    overlayMeta: { fontSize: '11px', color: '#E4D0C8', lineHeight: 1.4, textShadow: '0 1px 4px rgba(0,0,0,0.5)' },
    body3: { padding: '10px 12px 12px' },
    btnInterest: { width: '100%', padding: '10px', border: 'none', borderRadius: '9px', color: '#fff', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', marginBottom: '7px', transition: 'box-shadow 0.2s ease' },
    btnViewProfile: { width: '100%', padding: '9px', borderRadius: '9px', background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(245,217,139,0.5)', color: '#F5D98B', fontSize: '11.5px', fontWeight: '600', cursor: 'pointer', transition: 'box-shadow 0.2s ease' },
    info: { padding: '14px 16px' },
    nameRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' },
    name: { fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: '600', color: '#FFF8E1', cursor: 'pointer', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    contactIcons: { display: 'flex', gap: '6px' },
    phoneIcon: { width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #4CAF50', background: '#fff', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    waIcon: { width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #25D366', background: '#25D366', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    meta: { fontSize: '12.5px', color: '#C9A876', marginBottom: '2px', lineHeight: 1.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    tags: { display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '8px 0' },
    tag: { fontSize: '10.5px', fontWeight: '600', padding: '3px 9px', borderRadius: '20px', background: 'rgba(245,217,139,0.1)', border: '1px solid rgba(245,217,139,0.35)', color: '#F5D98B', whiteSpace: 'nowrap' },
    actions: { display: 'flex', gap: '6px', marginTop: '8px', marginBottom: '7px' },
    btnPrimary: { flex: 1, padding: '9px', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
    btnOutline: { flex: 1, padding: '9px', background: 'rgba(255,255,255,0.06)', color: '#F5D98B', border: '1.5px solid rgba(245,217,139,0.5)', borderRadius: '8px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
    btnLike: { padding: '9px 12px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontWeight: '600' },
    chatBtn: { width: '100%', padding: '9px', background: 'linear-gradient(135deg, #1565C0, #1976D2)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
    center: { textAlign: 'center', marginTop: '36px' },
    viewAll: { padding: '12px 32px', background: 'transparent', border: '1.5px solid #8B1A1A', color: '#8B1A1A', borderRadius: '8px', fontSize: '15px', fontWeight: '500', cursor: 'pointer' },
};

export default ProfilesSection;