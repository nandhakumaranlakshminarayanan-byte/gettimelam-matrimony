import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import LoginModal from '../../components/Modals/LoginModal';
import RegisterModal from '../../components/Modals/RegisterModal';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = 'http://localhost:5000';

const Browse = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        gender: '', religion: '', caste: '', district: '', maritalStatus: '', minAge: '', maxAge: ''
    });
    const [allProfiles, setAllProfiles] = useState([]);
    const [displayProfiles, setDisplayProfiles] = useState([]);
    const [shortlistedIds, setShortlistedIds] = useState([]);
    const [hiddenIds, setHiddenIds] = useState([]);
    const [likedIds, setLikedIds] = useState([]);

    useEffect(() => { if (user) fetchProfiles(); else setLoading(false); }, [user]);
    // Guests get the sign-in popup instead of profiles
    useEffect(() => { if (!authLoading && !user) setShowLogin(true); }, [authLoading, user]);
    useEffect(() => { if (user) fetchShortlistedIds(); }, [user]);
    useEffect(() => { if (user) fetchLikedIds(); }, [user]);

    const fetchProfiles = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await axios.get(`${API}/api/profiles`, { headers });
            const profiles = res.data.profiles || [];
            setAllProfiles(profiles);
            setDisplayProfiles(profiles);
        } catch (err) {
            setAllProfiles([]);
            setDisplayProfiles([]);
        } finally { setLoading(false); }
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

    const handleShortlist = async (profile) => {
        if (!user) { setShowLogin(true); return; }
        const isShortlisted = shortlistedIds.includes(profile._id);
        try {
            const token = localStorage.getItem('token');
            if (isShortlisted) {
                await axios.delete(`${API}/api/shortlist/remove/${profile._id}`, { headers: { Authorization: `Bearer ${token}` } });
                setShortlistedIds(prev => prev.filter(id => id !== profile._id));
                toast.success('Removed from shortlist!');
            } else {
                await axios.post(`${API}/api/shortlist/add`, { profileId: profile._id }, { headers: { Authorization: `Bearer ${token}` } });
                setShortlistedIds(prev => [...prev, profile._id]);
                toast.success('Shortlisted! ⭐');
            }
        } catch (err) { toast.error(err.response?.data?.message || 'Failed!'); }
    };

    const handleLike = async (profile) => {
        if (!user) { setShowLogin(true); return; }
        const isLiked = likedIds.includes(profile._id);
        try {
            const token = localStorage.getItem('token');
            if (isLiked) {
                await axios.delete(`${API}/api/likes/remove/${profile._id}`, { headers: { Authorization: `Bearer ${token}` } });
                setLikedIds(prev => prev.filter(id => id !== profile._id));
                toast.success('Like removed!');
            } else {
                await axios.post(`${API}/api/likes/add`, { profileId: profile._id }, { headers: { Authorization: `Bearer ${token}` } });
                setLikedIds(prev => [...prev, profile._id]);
                toast.success('Liked! 👍');
            }
        } catch (err) { toast.error(err.response?.data?.message || 'Failed!'); }
    };

    const handleDontShow = (profileId) => { setHiddenIds(prev => [...prev, profileId]); toast.success('Profile hidden'); };
    const handleViewNumber = (profile) => {
        if (!user) { setShowLogin(true); return; }
        if (!user?.isPremium) { toast.error('Upgrade to Premium! ⭐'); return; }
        const mobile = profile.user?.mobile;
        if (mobile) window.open(`tel:+91${mobile}`);
        else toast.error('Number not available');
    };
    const handleWhatsApp = (profile) => {
        if (!user) { setShowLogin(true); return; }
        if (!user?.isPremium) { toast.error('Upgrade to Premium! ⭐'); return; }
        const mobile = profile.user?.mobile;
        if (mobile) window.open(`https://wa.me/91${mobile}`, '_blank');
    };

    // ✅ Internal chat — navigate to messages page
    const handleChat = (profile) => {
        if (!user) { setShowLogin(true); return; }
        const profileUserId = profile.user?._id || profile.user;
        if (profileUserId) navigate(`/messages?with=${profileUserId}`);
        else toast.error('Cannot start chat');
    };

    const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

    const applyFilters = () => {
        let filtered = allProfiles;
        if (filters.gender) filtered = filtered.filter(p => p.gender === filters.gender);
        if (filters.religion) filtered = filtered.filter(p => p.religion === filters.religion);
        if (filters.caste) filtered = filtered.filter(p => p.caste?.toLowerCase().includes(filters.caste.toLowerCase()));
        if (filters.district) filtered = filtered.filter(p => p.district === filters.district);
        if (filters.maritalStatus) filtered = filtered.filter(p => p.maritalStatus === filters.maritalStatus);
        setDisplayProfiles(filtered);
        toast.success(`Found ${filtered.length} profiles!`);
    };

    const resetFilters = () => {
        setFilters({ gender: '', religion: '', caste: '', district: '', maritalStatus: '', minAge: '', maxAge: '' });
        setDisplayProfiles(allProfiles);
    };

    const getName = (p) => p.name || p.user?.name || 'Unknown';
    const getAge = (dob) => { if (!dob) return null; const age = Math.floor((new Date() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000)); return age > 0 ? age : null; };
    const getInfoLine = (p) => {
        const parts = [];
        const age = getAge(p.dateOfBirth);
        if (age) parts.push(`${age} years`);
        if (p.height) parts.push(p.height);
        if (p.caste) parts.push(p.caste);
        if (p.education) parts.push(p.education);
        if (p.occupation) parts.push(p.occupation);
        if (p.city) parts.push(`${p.city}, ${p.state || 'Tamil Nadu'}`);
        return parts.join(' | ');
    };

    const visibleProfiles = displayProfiles.filter(p => !hiddenIds.includes(p._id));

    // ✅ Block service accounts from seeing member profiles
    // ── Guest view: prompt to sign in / register, no profiles shown ──
    if (!user) return (
        <div style={{ background: 'radial-gradient(ellipse at top, #2A0C1C 0%, #1A0510 60%, #120308 100%)', minHeight: '100vh' }}>
            <Navbar onLoginClick={() => setShowLogin(true)} onRegisterClick={() => setShowRegister(true)} />
            <div style={{
                maxWidth: '520px', margin: '90px auto', textAlign: 'center', padding: '48px 40px',
                background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.22)', borderRadius: '20px',
                boxShadow: '0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}>
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#F1D289" strokeWidth="1.6" strokeLinecap="round" style={{ margin: '0 auto 16px', display: 'block' }}>
                    <rect x="5" y="10" width="14" height="10" rx="2.5" />
                    <path d="M8 10V7.5C8 5 9.8 3 12 3s4 2 4 4.5V10" />
                    <circle cx="12" cy="14.6" r="1.7" fill="#F1D289" stroke="none" />
                </svg>
                <h2 style={{ color: '#FFF8E1', marginBottom: '10px', fontFamily: "'Playfair Display', serif", fontSize: '26px' }}>
                    Members Only
                </h2>
                <p style={{ color: '#C9A876', fontSize: '15px', lineHeight: 1.7, marginBottom: '28px' }}>
                    Profiles are visible only to registered members.<br />
                    Sign in or create a free account to start browsing.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                        style={{ padding: '13px 30px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(245,217,139,0.55)', color: '#F5D98B', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                        onClick={() => setShowLogin(true)}>
                        Login
                    </button>
                    <button
                        style={{ padding: '13px 30px', background: 'linear-gradient(180deg, #F7DE8F 0%, #E3AC2A 45%, #C98F12 55%, #E8BC4A 100%)', border: '1px solid rgba(255,255,255,0.5)', color: '#3D2202', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 22px rgba(223,155,8,0.35)' }}
                        onClick={() => setShowRegister(true)}>
                        Free Register
                    </button>
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

    if (user && user.role === 'service') return (
        <div style={{ background: '#FFF8E1', minHeight: '100vh' }}>
            <Navbar onLoginClick={() => setShowLogin(true)} onRegisterClick={() => setShowRegister(true)} />
            <div style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏪</div>
                <h2 style={{ color: '#B71C1C', marginBottom: '12px', fontFamily: "'Playfair Display', serif" }}>Service Provider Account</h2>
                <p style={{ color: '#7A5C00', fontSize: '15px', lineHeight: 1.7, marginBottom: '24px' }}>
                    You are logged in as a service provider.<br />
                    Member profiles are only visible to matrimony members.
                </p>
                <button style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #B71C1C, #D32F2F)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
                    onClick={() => navigate('/service-provider')}>
                    Go to My Business →
                </button>
            </div>
            <Footer />
        </div>
    );

    return (
        <div style={{ background: '#FFF8E1', minHeight: '100vh' }}>
            <Navbar onLoginClick={() => setShowLogin(true)} onRegisterClick={() => setShowRegister(true)} />

            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerInner}>
                    <h1 style={styles.headerTitle}>Browse Profiles</h1>
                    <p style={styles.headerDesc}>{allProfiles.length}+ {t('browse.verified_profiles')}</p>
                </div>
            </div>

            <div style={styles.container}>

                {/* LEFT SIDEBAR */}
                <div style={styles.filterSidebar}>
                    <div style={styles.filterCard}>
                        <h3 style={styles.filterTitle}>🔍 {t('browse.filter_title')}</h3>

                        {[
                            { label: t('browse.looking_for'), name: 'gender', type: 'select', options: [['', t('browse.all')], ['Female', t('browse.bride')], ['Male', t('browse.groom')]] },
                            { label: t('browse.religion'), name: 'religion', type: 'select', options: [['', t('browse.all_religions')], ['Hindu', 'Hindu'], ['Muslim', 'Muslim'], ['Christian', 'Christian']] },
                            { label: t('browse.marital_status'), name: 'maritalStatus', type: 'select', options: [['', t('browse.any')], ['Never Married', t('browse.never_married')], ['Divorced', t('browse.divorced')], ['Widowed', t('browse.widowed')]] },
                        ].map(f => (
                            <div key={f.name} style={styles.filterGroup}>
                                <label style={styles.filterLabel}>{f.label}</label>
                                <select name={f.name} value={filters[f.name]} onChange={handleFilterChange} style={styles.filterInput}>
                                    {f.options.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                                </select>
                            </div>
                        ))}

                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>{t('browse.caste')}</label>
                            <input name="caste" type="text" placeholder={t('browse.caste')}
                                value={filters.caste} onChange={handleFilterChange} style={styles.filterInput} />
                        </div>

                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>{t('browse.district')}</label>
                            <select name="district" value={filters.district} onChange={handleFilterChange} style={styles.filterInput}>
                                <option value="">{t('browse.all')}</option>
                                {['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Erode', 'Tirunelveli', 'Vellore', 'Puducherry', 'Thoothukudi'].map(d => (
                                    <option key={d}>{d}</option>
                                ))}
                            </select>
                        </div>

                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>{t('browse.age_range')}</label>
                            <div style={styles.ageRow}>
                                <input name="minAge" type="number" placeholder="Min" value={filters.minAge} onChange={handleFilterChange} style={{ ...styles.filterInput, width: '48%' }} />
                                <input name="maxAge" type="number" placeholder="Max" value={filters.maxAge} onChange={handleFilterChange} style={{ ...styles.filterInput, width: '48%' }} />
                            </div>
                        </div>

                        <button style={styles.applyBtn} onClick={applyFilters}>{t('browse.apply_filters')}</button>
                        <button style={styles.resetBtn} onClick={resetFilters}>{t('browse.reset')}</button>
                    </div>

                    <div style={styles.quickFilters}>
                        <h4 style={styles.quickTitle}>{t('browse.quick_filters')}</h4>
                        {[
                            { label: 'Brides', filter: { gender: 'Female' } },
                            { label: 'Grooms', filter: { gender: 'Male' } },
                            { label: 'Hindu', filter: { religion: 'Hindu' } },
                            { label: 'Muslim', filter: { religion: 'Muslim' } },
                            { label: 'Christian', filter: { religion: 'Christian' } },
                            { label: 'Puducherry', filter: { district: 'Puducherry' } },
                        ].map(q => (
                            <span key={q.label} style={styles.quickTag}
                                onClick={() => setFilters({ ...filters, ...q.filter })}>
                                {q.label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* RIGHT — profiles */}
                <div style={styles.profilesArea}>
                    <div style={styles.resultsHeader}>
                        <span style={styles.resultsCount}>
                            {t('browse.showing')} <strong>{visibleProfiles.length}</strong> {t('browse.profiles')}
                        </span>
                        {!user && (
                            <button style={styles.loginBtn} onClick={() => setShowLogin(true)}>
                                {t('browse.login_to_connect')}
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                            <p style={{ color: '#7A5C00' }}>Loading profiles...</p>
                        </div>
                    ) : visibleProfiles.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '12px' }}>
                            <div style={{ fontSize: '48px' }}>💍</div>
                            <h3>{t('browse.no_profiles')}</h3>
                            <button style={styles.applyBtn} onClick={resetFilters}>{t('browse.reset_filters')}</button>
                        </div>
                    ) : (
                        <div style={styles.profilesGrid}>
                            {visibleProfiles.map((profile) => {
                                const isShortlisted = shortlistedIds.includes(profile._id);
                                const isLiked = likedIds.includes(profile._id);
                                const name = getName(profile);
                                const age = getAge(profile.dateOfBirth);
                                const isFemale = profile.gender === 'Female';

                                const details = [
                                    { label: 'Age', value: age ? `${age} Yrs` : null },
                                    { label: 'Height', value: profile.height },
                                    { label: 'Religion', value: [profile.religion, profile.caste].filter(Boolean).join(' - ') },
                                    { label: 'Caste', value: profile.caste },
                                    { label: 'Location', value: [profile.city, profile.state || 'Tamil Nadu'].filter(Boolean).join(' / ') },
                                    { label: 'Education', value: profile.education },
                                    { label: 'Profession', value: profile.occupation },
                                ].filter(d => d.value);

                                return (
                                    <div key={profile._id} style={styles.wideCard}>
                                        {/* Photo — left */}
                                        <div style={styles.wPhotoBox}>
                                            {profile.photo ? (
                                                <img src={`${API}${profile.photo}`} alt={name}
                                                    style={styles.wPhoto}
                                                    onClick={() => navigate(`/profile/${profile._id}`)} />
                                            ) : (
                                                <div style={{
                                                    ...styles.wPhotoPlaceholder,
                                                    background: isFemale
                                                        ? 'linear-gradient(160deg, #3A1A2E, #22091A)'
                                                        : 'linear-gradient(160deg, #1A2A3A, #09131F)'
                                                }}
                                                    onClick={() => navigate(`/profile/${profile._id}`)}>
                                                    <span style={{ fontSize: '46px' }}>{isFemale ? '👩' : '👨'}</span>
                                                </div>
                                            )}
                                            <div style={styles.wVerifiedBadge}>✓ Verified</div>
                                            <button style={styles.wHeartBtn} onClick={() => handleShortlist(profile)}>
                                                {isShortlisted ? '❤️' : '🤍'}
                                            </button>
                                        </div>

                                        {/* Details — middle */}
                                        <div style={styles.wDetails}>
                                            <div
                                                style={styles.wName}
                                                onClick={() => navigate(`/profile/${profile._id}`)}>
                                                {name}
                                            </div>
                                            <div style={styles.wDetailGrid}>
                                                {details.map(d => (
                                                    <div key={d.label} style={styles.wDetailRow}>
                                                        <span style={styles.wDetailLabel}>{d.label}:</span>
                                                        <span style={styles.wDetailValue}>{d.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <button style={styles.wViewFullBtn}
                                                onClick={() => navigate(`/profile/${profile._id}`)}>
                                                View Full Profile
                                            </button>
                                        </div>

                                        {/* Actions — right */}
                                        <div style={styles.wActions}>
                                            <p style={styles.wBlurb}>
                                                {profile.about
                                                    ? profile.about.slice(0, 130) + (profile.about.length > 130 ? '…' : '')
                                                    : 'View this profile to learn more about their background, family, and what they are looking for in a partner.'}
                                            </p>
                                            <div style={styles.wIconRow}>
                                                <button style={styles.wIconBtn} title="Call" onClick={() => handleViewNumber(profile)}>📞</button>
                                                <button style={styles.wIconBtn} title="Message" onClick={() => handleChat(profile)}>💬</button>
                                                <button style={styles.wIconBtn} title={t('browse.dont_show')} onClick={() => handleDontShow(profile._id)}>✕</button>
                                            </div>
                                            <button style={styles.wViewDetailBtn}
                                                onClick={() => navigate(`/profile/${profile._id}`)}>
                                                View Detail
                                            </button>
                                            <button style={{
                                                ...styles.wLikeBtn,
                                                background: isLiked
                                                    ? 'linear-gradient(135deg, #2E7D32, #388E3C)'
                                                    : 'linear-gradient(135deg, #B71C1C, #D32F2F)'
                                            }}
                                                onClick={() => handleLike(profile)}>
                                                {isLiked ? '👍 Liked' : '👍 Like'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
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
    // ── Wide horizontal profile card ──
    wideCard: {
        display: 'grid',
        gridTemplateColumns: '220px 1fr 240px',
        gap: '0',
        background: '#fff',
        border: '1px solid #F0E0B0',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 6px 22px rgba(139,26,26,0.08)',
    },
    wPhotoBox: { position: 'relative', height: '260px' },
    wPhoto: { width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer', display: 'block' },
    wPhotoPlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
    wVerifiedBadge: {
        position: 'absolute', top: '10px', left: '10px',
        background: 'rgba(30,107,60,0.92)', color: '#fff', fontSize: '10.5px', fontWeight: '700',
        padding: '3px 10px', borderRadius: '999px',
    },
    wHeartBtn: {
        position: 'absolute', top: '10px', right: '10px',
        width: '30px', height: '30px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.85)', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    },
    wDetails: { padding: '20px 24px', borderRight: '1px solid #F5E6C0' },
    wName: {
        fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: '600',
        color: '#5F0909', marginBottom: '12px', cursor: 'pointer',
    },
    wDetailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '18px', rowGap: '7px', marginBottom: '16px' },
    wDetailRow: { fontSize: '12.5px', display: 'flex', gap: '5px' },
    wDetailLabel: { color: '#B08D55', fontWeight: '700', flexShrink: 0 },
    wDetailValue: { color: '#5A4632' },
    wViewFullBtn: {
        padding: '9px 20px', background: '#FFF8E1',
        border: '1.5px solid #DF9B08', color: '#8B6914',
        borderRadius: '8px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer',
    },
    wActions: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', background: '#FFFDF6' },
    wBlurb: { fontSize: '11.5px', color: '#8A7050', lineHeight: 1.6, margin: 0, flex: 1 },
    wIconRow: { display: 'flex', gap: '8px' },
    wIconBtn: {
        width: '34px', height: '34px', borderRadius: '9px',
        background: '#fff', border: '1px solid #F0E0B0',
        cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    wViewDetailBtn: {
        padding: '10px', background: 'linear-gradient(135deg, #C98F12, #E3AC2A)',
        border: 'none', color: '#fff', borderRadius: '8px',
        fontSize: '12.5px', fontWeight: '700', cursor: 'pointer',
    },
    wLikeBtn: {
        padding: '10px', border: 'none', color: '#fff', borderRadius: '8px',
        fontSize: '12.5px', fontWeight: '700', cursor: 'pointer',
    },

    header: { background: 'linear-gradient(135deg, #F5BE17, #DF9B08)', padding: '24px' },
    headerInner: { maxWidth: '1200px', margin: '0 auto' },
    headerTitle: { fontFamily: "'Playfair Display', serif", fontSize: '28px', color: '#5F0909', marginBottom: '4px' },
    headerDesc: { fontSize: '14px', color: 'rgba(95,9,9,0.7)' },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: '240px 1fr', gap: '20px', alignItems: 'start' },
    filterSidebar: {},
    filterCard: { background: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 8px rgba(223,155,8,0.1)', marginBottom: '12px', border: '1px solid #F5BE17' },
    filterTitle: { fontSize: '15px', fontWeight: '700', color: '#5F0909', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid #F5BE17' },
    filterGroup: { marginBottom: '12px' },
    filterLabel: { display: 'block', fontSize: '10px', fontWeight: '700', color: '#7A5C00', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    filterInput: { width: '100%', padding: '8px 10px', border: '1.5px solid #F5BE17', borderRadius: '7px', fontSize: '12px', color: '#5F0909', background: '#FFFDF4', outline: 'none', boxSizing: 'border-box' },
    ageRow: { display: 'flex', gap: '6px' },
    applyBtn: { width: '100%', padding: '10px', background: 'linear-gradient(135deg, #B71C1C, #D32F2F)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginBottom: '6px' },
    resetBtn: { width: '100%', padding: '8px', background: 'transparent', color: '#7A5C00', border: '1.5px solid #F5BE17', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' },
    quickFilters: { background: '#fff', borderRadius: '12px', padding: '14px', boxShadow: '0 2px 8px rgba(223,155,8,0.1)', border: '1px solid #F5BE17' },
    quickTitle: { fontSize: '11px', fontWeight: '700', color: '#7A5C00', marginBottom: '8px', textTransform: 'uppercase' },
    quickTag: { display: 'inline-block', padding: '4px 10px', background: '#FFF8E1', border: '1px solid #F5BE17', borderRadius: '20px', fontSize: '11px', color: '#B71C1C', cursor: 'pointer', margin: '2px' },
    profilesArea: {},
    resultsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
    resultsCount: { fontSize: '13px', color: '#7A5C00' },
    loginBtn: { padding: '7px 14px', background: '#B71C1C', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
    profilesGrid: { display: 'flex', flexDirection: 'column', gap: '18px' },
    card: { background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(223,155,8,0.12)', border: '1px solid #F5E6A0' },
    photoBox: { position: 'relative', width: '100%', height: '200px', overflow: 'hidden', cursor: 'pointer' },
    photo: { width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', background: '#FFF8E1' },
    photoPlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
    verifiedBadge: { position: 'absolute', top: '6px', left: '6px', background: '#1E6B3C', color: '#fff', fontSize: '9px', fontWeight: '700', padding: '2px 6px', borderRadius: '20px' },
    heartBtn: { position: 'absolute', top: '6px', right: '6px', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '26px', height: '26px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' },
    cardBody: { padding: '10px 12px 12px' },
    nameRow: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' },
    cardName: { fontFamily: "'Playfair Display', serif", fontSize: '14px', fontWeight: '700', color: '#5F0909', flex: 1 },
    contactIcons: { display: 'flex', gap: '5px' },
    phoneIcon: { width: '26px', height: '26px', borderRadius: '50%', border: '2px solid #4CAF50', background: '#fff', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    waIcon: { width: '26px', height: '26px', borderRadius: '50%', border: '2px solid #25D366', background: '#25D366', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    infoLine: { fontSize: '11px', color: '#7A5C00', lineHeight: 1.4, marginBottom: '6px' },
    viewFullLink: { background: 'none', border: 'none', color: '#B71C1C', fontSize: '11px', fontWeight: '600', cursor: 'pointer', padding: '0', marginBottom: '8px', textDecoration: 'underline', display: 'block' },
    secondaryRow: { display: 'flex', gap: '6px', marginBottom: '6px' },
    dontShowBtn: { flex: 1, padding: '6px', background: '#fff', border: '1.5px solid #F5BE17', borderRadius: '7px', fontSize: '11px', fontWeight: '500', color: '#7A5C00', cursor: 'pointer' },
    viewLaterBtn: { flex: 1, padding: '6px', background: '#fff', border: '1.5px solid #F5BE17', borderRadius: '7px', fontSize: '11px', fontWeight: '500', color: '#7A5C00', cursor: 'pointer' },
    likeBtn: { width: '100%', padding: '8px', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' },
};

export default Browse;