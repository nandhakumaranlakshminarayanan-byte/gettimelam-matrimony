import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import LoginModal from '../../components/Modals/LoginModal';
import RegisterModal from '../../components/Modals/RegisterModal';
import axios from 'axios';
import toast from 'react-hot-toast';

const Browse = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        gender: '', religion: '', caste: '',
        district: '', maritalStatus: '', minAge: '', maxAge: ''
    });
    const [allProfiles, setAllProfiles] = useState([]);
    const [displayProfiles, setDisplayProfiles] = useState([]);

    useEffect(() => { fetchProfiles(); }, [user]);

    const fetchProfiles = async () => {
        setLoading(true);
        try {
            // ✅ Send token so server can exclude own profile
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await axios.get('http://localhost:5000/api/profiles', { headers });
            const profiles = res.data.profiles || [];
            setAllProfiles(profiles);
            setDisplayProfiles(profiles);
        } catch (err) {
            setAllProfiles([]);
            setDisplayProfiles([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

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

    const handleSendInterest = async (profile) => {
        if (!user) { setShowLogin(true); return; }
        toast.success(`Interest sent to ${getName(profile)}! 💌`);
    };

    const handleViewProfile = (profile) => {
        navigate(`/profile/${profile._id}`);
    };

    const getName = (p) => p.name || p.user?.name || 'Unknown';

    return (
        <div style={{ background: '#FFFDF9', minHeight: '100vh' }}>
            <Navbar onLoginClick={() => setShowLogin(true)} onRegisterClick={() => setShowRegister(true)} />

            <div style={styles.header}>
                <div style={styles.headerInner}>
                    <h1 style={styles.headerTitle}>Browse Profiles</h1>
                    <p style={styles.headerDesc}>
                        Find your perfect match from {allProfiles.length}+ verified profiles
                    </p>
                </div>
            </div>

            <div style={styles.container}>

                {/* FILTERS SIDEBAR */}
                <div style={styles.filterSidebar}>
                    <div style={styles.filterCard}>
                        <h3 style={styles.filterTitle}>Filter Profiles</h3>

                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Looking For</label>
                            <select name="gender" value={filters.gender} onChange={handleFilterChange} style={styles.filterInput}>
                                <option value="">All</option>
                                <option value="Female">Bride (Female)</option>
                                <option value="Male">Groom (Male)</option>
                            </select>
                        </div>

                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Religion</label>
                            <select name="religion" value={filters.religion} onChange={handleFilterChange} style={styles.filterInput}>
                                <option value="">All Religions</option>
                                <option value="Hindu">Hindu</option>
                                <option value="Muslim">Muslim</option>
                                <option value="Christian">Christian</option>
                            </select>
                        </div>

                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Caste</label>
                            <input name="caste" type="text" placeholder="Enter caste"
                                value={filters.caste} onChange={handleFilterChange} style={styles.filterInput} />
                        </div>

                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>District</label>
                            <select name="district" value={filters.district} onChange={handleFilterChange} style={styles.filterInput}>
                                <option value="">All Districts</option>
                                {['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Erode',
                                    'Tirunelveli', 'Vellore', 'Puducherry', 'Thoothukudi'].map(d => (
                                        <option key={d}>{d}</option>
                                    ))}
                            </select>
                        </div>

                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Marital Status</label>
                            <select name="maritalStatus" value={filters.maritalStatus} onChange={handleFilterChange} style={styles.filterInput}>
                                <option value="">Any</option>
                                <option value="Never Married">Never Married</option>
                                <option value="Divorced">Divorced</option>
                                <option value="Widowed">Widowed</option>
                            </select>
                        </div>

                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Age Range</label>
                            <div style={styles.ageRow}>
                                <input name="minAge" type="number" placeholder="Min" value={filters.minAge}
                                    onChange={handleFilterChange} style={{ ...styles.filterInput, width: '48%' }} />
                                <input name="maxAge" type="number" placeholder="Max" value={filters.maxAge}
                                    onChange={handleFilterChange} style={{ ...styles.filterInput, width: '48%' }} />
                            </div>
                        </div>

                        <button style={styles.applyBtn} onClick={applyFilters}>Apply Filters</button>
                        <button style={styles.resetBtn} onClick={resetFilters}>Reset</button>
                    </div>

                    {/* Quick Filters */}
                    <div style={styles.quickFilters}>
                        <h4 style={styles.quickTitle}>Quick Filters</h4>
                        {[
                            { label: 'Brides', filter: { gender: 'Female' } },
                            { label: 'Grooms', filter: { gender: 'Male' } },
                            { label: 'Hindu', filter: { religion: 'Hindu' } },
                            { label: 'Muslim', filter: { religion: 'Muslim' } },
                            { label: 'Christian', filter: { religion: 'Christian' } },
                            { label: 'Chennai', filter: { district: 'Chennai' } },
                            { label: 'Coimbatore', filter: { district: 'Coimbatore' } },
                            { label: 'Puducherry', filter: { district: 'Puducherry' } },
                        ].map(q => (
                            <span key={q.label} style={styles.quickTag}
                                onClick={() => setFilters({ ...filters, ...q.filter })}>
                                {q.label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* PROFILES AREA */}
                <div style={styles.profilesArea}>
                    <div style={styles.resultsHeader}>
                        <span style={styles.resultsCount}>
                            Showing <strong>{displayProfiles.length}</strong> profiles
                        </span>
                        <select style={styles.sortSelect}>
                            <option>Sort by: Latest</option>
                            <option>Sort by: Age</option>
                            <option>Sort by: Location</option>
                        </select>
                    </div>

                    {!user && (
                        <div style={styles.loginAlert}>
                            <span>🔒 Login to send interests and connect with profiles</span>
                            <button style={styles.loginAlertBtn} onClick={() => setShowLogin(true)}>
                                Login Now
                            </button>
                        </div>
                    )}

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                            <p style={{ color: '#7A6055' }}>Loading profiles...</p>
                        </div>
                    ) : displayProfiles.length === 0 ? (
                        <div style={styles.noResults}>
                            <div style={{ fontSize: '60px' }}>💍</div>
                            <h3>No profiles found!</h3>
                            <p style={{ color: '#7A6055' }}>
                                {allProfiles.length === 0
                                    ? 'No profiles registered yet. Be the first!'
                                    : 'Try adjusting your filters'}
                            </p>
                            {allProfiles.length > 0 && (
                                <button style={styles.resetBtn2} onClick={resetFilters}>
                                    Reset Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div style={styles.profilesGrid}>
                            {displayProfiles.map((profile) => (
                                <div key={profile._id} style={styles.profileCard}>
                                    <div style={{
                                        ...styles.photoSection,
                                        background: profile.gender === 'Female'
                                            ? 'linear-gradient(135deg, #FDEEF5, #F5D5E8)'
                                            : 'linear-gradient(135deg, #EEF2FD, #D5DEF5)'
                                    }}>
                                        {profile.photo ? (
                                            <img src={`http://localhost:5000${profile.photo}`}
                                                alt={getName(profile)}
                                                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #8B1A1A' }} />
                                        ) : (
                                            <span style={styles.profileEmoji}>
                                                {profile.gender === 'Female' ? '👩' : '👨'}
                                            </span>
                                        )}
                                        <span style={styles.verifiedBadge}>✓ Verified</span>
                                        <span style={styles.genderBadge}>
                                            {profile.gender === 'Female' ? 'Bride' : 'Groom'}
                                        </span>
                                        {/* ✅ Show lock icon if number protected */}
                                        {profile.numberProtected && (
                                            <span style={styles.privacyBadge}>🔒</span>
                                        )}
                                    </div>

                                    <div style={styles.cardInfo}>
                                        <div style={styles.cardName}>{getName(profile)}</div>
                                        <div style={styles.cardMeta}>{profile.occupation} • {profile.city}</div>
                                        <div style={styles.cardMeta}>{profile.religion} • {profile.caste}</div>

                                        <div style={styles.detailsRow}>
                                            {[
                                                { icon: '📏', value: profile.height },
                                                { icon: '🎓', value: profile.education },
                                                { icon: '💰', value: profile.annualIncome },
                                                { icon: '⭐', value: profile.rasi },
                                            ].filter(d => d.value).map(d => (
                                                <div key={d.icon} style={styles.detailTag}>
                                                    {d.icon} {d.value}
                                                </div>
                                            ))}
                                        </div>

                                        {profile.about && (
                                            <p style={styles.cardAbout}>
                                                {profile.about.substring(0, 80)}...
                                            </p>
                                        )}

                                        <div style={styles.cardActions}>
                                            <button style={styles.interestBtn}
                                                onClick={() => handleSendInterest(profile)}>
                                                💌 Send Interest
                                            </button>
                                            <button style={styles.viewBtn}
                                                onClick={() => handleViewProfile(profile)}>
                                                View Profile
                                            </button>
                                            <button style={styles.shortlistBtn}>⭐</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
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
    header: { background: 'linear-gradient(135deg, #1A0A0A, #3D1A1A)', padding: '40px 24px' },
    headerInner: { maxWidth: '1200px', margin: '0 auto' },
    headerTitle: { fontFamily: "'Playfair Display', serif", fontSize: '36px', color: '#fff', marginBottom: '8px' },
    headerDesc: { color: 'rgba(255,255,255,0.6)', fontSize: '15px' },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: '28px', alignItems: 'start' },
    filterSidebar: {},
    filterCard: { background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 24px rgba(139,26,26,0.08)', marginBottom: '16px' },
    filterTitle: { fontFamily: "'Playfair Display', serif", fontSize: '18px', color: '#1A0A0A', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #E8D5C4' },
    filterGroup: { marginBottom: '14px' },
    filterLabel: { display: 'block', fontSize: '11px', fontWeight: '700', color: '#7A6055', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    filterInput: { width: '100%', padding: '9px 12px', border: '1.5px solid #E8D5C4', borderRadius: '8px', fontSize: '13px', color: '#2C1810', background: '#FFFDF9', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' },
    ageRow: { display: 'flex', gap: '8px' },
    applyBtn: { width: '100%', padding: '11px', background: 'linear-gradient(135deg, #8B1A1A, #C0392B)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginBottom: '8px' },
    resetBtn: { width: '100%', padding: '9px', background: 'transparent', color: '#7A6055', border: '1.5px solid #E8D5C4', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
    quickFilters: { background: '#fff', borderRadius: '16px', padding: '16px', boxShadow: '0 4px 24px rgba(139,26,26,0.08)' },
    quickTitle: { fontSize: '13px', fontWeight: '700', color: '#7A6055', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    quickTag: { display: 'inline-block', padding: '5px 12px', background: '#FDF0F0', border: '1px solid #E8C4C4', borderRadius: '20px', fontSize: '12px', fontWeight: '500', color: '#8B1A1A', cursor: 'pointer', margin: '3px' },
    profilesArea: {},
    resultsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    resultsCount: { fontSize: '14px', color: '#7A6055' },
    sortSelect: { padding: '7px 12px', border: '1.5px solid #E8D5C4', borderRadius: '8px', fontSize: '13px', color: '#2C1810', background: '#fff', cursor: 'pointer' },
    loginAlert: { background: '#FFF9E6', border: '1px solid #F5E6C0', borderRadius: '10px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', fontSize: '14px', color: '#7A6055' },
    loginAlertBtn: { padding: '7px 16px', background: '#8B1A1A', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    profilesGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
    profileCard: { background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(139,26,26,0.08)' },
    photoSection: { height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
    profileEmoji: { fontSize: '52px' },
    verifiedBadge: { position: 'absolute', top: '10px', right: '10px', background: '#1E6B3C', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px' },
    genderBadge: { position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(255,255,255,0.9)', color: '#2C1810', fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px' },
    privacyBadge: { position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(139,26,26,0.8)', color: '#fff', fontSize: '10px', padding: '3px 6px', borderRadius: '20px' },
    cardInfo: { padding: '14px' },
    cardName: { fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: '700', color: '#1A0A0A', marginBottom: '3px' },
    cardMeta: { fontSize: '12px', color: '#7A6055', marginBottom: '2px', lineHeight: 1.5 },
    detailsRow: { display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '8px 0' },
    detailTag: { fontSize: '10px', padding: '3px 8px', background: '#FDF0F0', color: '#8B1A1A', borderRadius: '20px', fontWeight: '500' },
    cardAbout: { fontSize: '12px', color: '#7A6055', lineHeight: 1.5, marginBottom: '10px' },
    cardActions: { display: 'flex', gap: '6px' },
    interestBtn: { flex: 1, padding: '8px', background: '#8B1A1A', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
    viewBtn: { flex: 1, padding: '8px', background: 'transparent', color: '#8B1A1A', border: '1.5px solid #8B1A1A', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
    shortlistBtn: { padding: '8px 10px', background: '#FFFBF0', border: '1.5px solid #F5E6C0', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' },
    noResults: { textAlign: 'center', padding: '60px 20px' },
    resetBtn2: { padding: '10px 24px', background: '#8B1A1A', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '16px' },
};

export default Browse;