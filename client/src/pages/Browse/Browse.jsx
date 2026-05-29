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
    const { user } = useAuth();
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

    useEffect(() => { fetchProfiles(); }, [user]);
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
                            { label: 'Looking For', name: 'gender', type: 'select', options: [['', 'All'], ['Female', 'Bride (Female)'], ['Male', 'Groom (Male)']] },
                            { label: 'Religion', name: 'religion', type: 'select', options: [['', 'All Religions'], ['Hindu', 'Hindu'], ['Muslim', 'Muslim'], ['Christian', 'Christian']] },
                            { label: 'Marital Status', name: 'maritalStatus', type: 'select', options: [['', 'Any'], ['Never Married', 'Never Married'], ['Divorced', 'Divorced'], ['Widowed', 'Widowed']] },
                        ].map(f => (
                            <div key={f.name} style={styles.filterGroup}>
                                <label style={styles.filterLabel}>{f.label}</label>
                                <select name={f.name} value={filters[f.name]} onChange={handleFilterChange} style={styles.filterInput}>
                                    {f.options.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                                </select>
                            </div>
                        ))}

                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Caste</label>
                            <input name="caste" type="text" placeholder="Enter caste"
                                value={filters.caste} onChange={handleFilterChange} style={styles.filterInput} />
                        </div>

                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>District</label>
                            <select name="district" value={filters.district} onChange={handleFilterChange} style={styles.filterInput}>
                                <option value="">All Districts</option>
                                {['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Erode', 'Tirunelveli', 'Vellore', 'Puducherry', 'Thoothukudi'].map(d => (
                                    <option key={d}>{d}</option>
                                ))}
                            </select>
                        </div>

                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Age Range</label>
                            <div style={styles.ageRow}>
                                <input name="minAge" type="number" placeholder="Min" value={filters.minAge} onChange={handleFilterChange} style={{ ...styles.filterInput, width: '48%' }} />
                                <input name="maxAge" type="number" placeholder="Max" value={filters.maxAge} onChange={handleFilterChange} style={{ ...styles.filterInput, width: '48%' }} />
                            </div>
                        </div>

                        <button style={styles.applyBtn} onClick={applyFilters}>{t('browse.apply_filters')}</button>
                        <button style={styles.resetBtn} onClick={resetFilters}>Reset</button>
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
                                const infoLine = getInfoLine(profile);
                                const isFemale = profile.gender === 'Female';

                                return (
                                    <div key={profile._id} style={styles.card}>
                                        {/* Photo */}
                                        <div style={styles.photoBox}>
                                            {profile.photo ? (
                                                <img src={`${API}${profile.photo}`} alt={name}
                                                    style={styles.photo}
                                                    onClick={() => navigate(`/profile/${profile._id}`)} />
                                            ) : (
                                                <div style={{
                                                    ...styles.photoPlaceholder,
                                                    background: isFemale
                                                        ? 'linear-gradient(135deg, #FFF8E1, #F5BE17)'
                                                        : 'linear-gradient(135deg, #FFF3E0, #DF9B08)'
                                                }}
                                                    onClick={() => navigate(`/profile/${profile._id}`)}>
                                                    <span style={{ fontSize: '52px' }}>
                                                        {isFemale ? '👩' : '👨'}
                                                    </span>
                                                </div>
                                            )}
                                            <div style={styles.verifiedBadge}>✓ Verified</div>
                                            <button style={styles.heartBtn} onClick={() => handleShortlist(profile)}>
                                                {isShortlisted ? '❤️' : '🤍'}
                                            </button>
                                        </div>

                                        {/* Card body */}
                                        <div style={styles.cardBody}>
                                            <div style={styles.nameRow}>
                                                <span style={styles.cardName}>{name}</span>
                                                <div style={styles.contactIcons}>
                                                    <button style={styles.phoneIcon} onClick={() => handleViewNumber(profile)} title="Call">📞</button>
                                                    <button style={styles.waIcon} onClick={() => handleChat(profile)} title="Send Message">💬</button>
                                                </div>
                                            </div>

                                            <p style={styles.infoLine}>
                                                {infoLine || `${profile.religion || ''} • ${profile.city || ''}`}
                                            </p>

                                            <button style={styles.viewFullLink}
                                                onClick={() => navigate(`/profile/${profile._id}`)}>
                                                View full profile ›
                                            </button>

                                            <div style={styles.secondaryRow}>
                                                <button style={styles.dontShowBtn} onClick={() => handleDontShow(profile._id)}>
                                                    {t('browse.dont_show')}
                                                </button>
                                                <button style={styles.viewLaterBtn} onClick={() => handleShortlist(profile)}>
                                                    {isShortlisted ? t('browse.shortlisted') : t('browse.view_later')}
                                                </button>
                                            </div>

                                            <button style={{
                                                ...styles.likeBtn,
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
    profilesGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' },
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