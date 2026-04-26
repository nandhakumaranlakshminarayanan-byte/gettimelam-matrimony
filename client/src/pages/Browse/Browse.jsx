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
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        gender: '',
        religion: '',
        caste: '',
        district: '',
        maritalStatus: '',
        minAge: '',
        maxAge: ''
    });

    // Sample profiles for display
    const sampleProfiles = [
        { _id: '1', name: 'Priya S.', gender: 'Female', religion: 'Hindu', caste: 'Mudaliar', education: 'B.Tech', occupation: 'Software Engineer', city: 'Chennai', district: 'Chennai', maritalStatus: 'Never Married', rasi: 'Mesham', height: "5'4\"", annualIncome: '5-10 Lakhs', about: 'Simple and family oriented girl looking for a genuine life partner.' },
        { _id: '2', name: 'Arun K.', gender: 'Male', religion: 'Hindu', caste: 'Gounder', education: 'MBBS', occupation: 'Doctor', city: 'Coimbatore', district: 'Coimbatore', maritalStatus: 'Never Married', rasi: 'Rishabam', height: "5'10\"", annualIncome: '10-20 Lakhs', about: 'Doctor by profession, fun loving and family oriented.' },
        { _id: '3', name: 'Kavitha R.', gender: 'Female', religion: 'Hindu', caste: 'Nadar', education: 'B.Ed', occupation: 'Teacher', city: 'Madurai', district: 'Madurai', maritalStatus: 'Never Married', rasi: 'Mithunam', height: "5'2\"", annualIncome: '2-5 Lakhs', about: 'Teacher by profession. Looking for a simple and caring life partner.' },
        { _id: '4', name: 'Vijay M.', gender: 'Male', religion: 'Hindu', caste: 'Thevar', education: 'MBA', occupation: 'Business', city: 'Salem', district: 'Salem', maritalStatus: 'Never Married', rasi: 'Simmam', height: "5'8\"", annualIncome: '10-20 Lakhs', about: 'Running a successful business. Looking for a life partner.' },
        { _id: '5', name: 'Deepa N.', gender: 'Female', religion: 'Christian', caste: 'Roman Catholic', education: 'B.Sc Nursing', occupation: 'Nurse', city: 'Trichy', district: 'Trichy', maritalStatus: 'Never Married', rasi: 'Kanni', height: "5'3\"", annualIncome: '2-5 Lakhs', about: 'Working as a nurse. Simple and god fearing.' },
        { _id: '6', name: 'Ramesh T.', gender: 'Male', religion: 'Hindu', caste: 'Vanniyar', education: 'B.E', occupation: 'Engineer', city: 'Erode', district: 'Erode', maritalStatus: 'Never Married', rasi: 'Thulam', height: "5'9\"", annualIncome: '5-10 Lakhs', about: 'Engineer working in a reputed company. Family oriented.' },
        { _id: '7', name: 'Sindhu A.', gender: 'Female', religion: 'Hindu', caste: 'Brahmin', education: 'M.Tech', occupation: 'Software Engineer', city: 'Chennai', district: 'Chennai', maritalStatus: 'Never Married', rasi: 'Kadagam', height: "5'5\"", annualIncome: '5-10 Lakhs', about: 'Software Engineer at a top MNC. Looking for a educated life partner.' },
        { _id: '8', name: 'Karthik P.', gender: 'Male', religion: 'Muslim', caste: 'Lebbai', education: 'B.Com', occupation: 'Business', city: 'Vellore', district: 'Vellore', maritalStatus: 'Never Married', rasi: 'Viruchigam', height: "5'7\"", annualIncome: '5-10 Lakhs', about: 'Running a business. Looking for a simple and religious life partner.' },
        { _id: '9', name: 'Meena L.', gender: 'Female', religion: 'Hindu', caste: 'Yadavar', education: 'BBA', occupation: 'HR Executive', city: 'Coimbatore', district: 'Coimbatore', maritalStatus: 'Never Married', rasi: 'Dhanusu', height: "5'3\"", annualIncome: '2-5 Lakhs', about: 'Working as HR. Family oriented and fun loving.' },
    ];

    const [displayProfiles, setDisplayProfiles] = useState(sampleProfiles);
    const [selectedProfile, setSelectedProfile] = useState(null);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const applyFilters = () => {
        let filtered = sampleProfiles;

        if (filters.gender) filtered = filtered.filter(p => p.gender === filters.gender);
        if (filters.religion) filtered = filtered.filter(p => p.religion === filters.religion);
        if (filters.caste) filtered = filtered.filter(p => p.caste.toLowerCase().includes(filters.caste.toLowerCase()));
        if (filters.district) filtered = filtered.filter(p => p.district === filters.district);
        if (filters.maritalStatus) filtered = filtered.filter(p => p.maritalStatus === filters.maritalStatus);

        setDisplayProfiles(filtered);
        toast.success(`Found ${filtered.length} profiles!`);
    };

    const resetFilters = () => {
        setFilters({ gender: '', religion: '', caste: '', district: '', maritalStatus: '', minAge: '', maxAge: '' });
        setDisplayProfiles(sampleProfiles);
    };

    const handleSendInterest = (profile) => {
        if (!user) {
            setShowLogin(true);
            return;
        }
        toast.success(`Interest sent to ${profile.name}! 💌`);
    };

    const handleViewProfile = (profile) => {
        if (!user) {
            setShowLogin(true);
            return;
        }
        setSelectedProfile(profile);
    };

    return (
        <div style={{ background: '#FFFDF9', minHeight: '100vh' }}>
            <Navbar
                onLoginClick={() => setShowLogin(true)}
                onRegisterClick={() => setShowRegister(true)}
            />

            {/* Page Header */}
            <div style={styles.header}>
                <div style={styles.headerInner}>
                    <h1 style={styles.headerTitle}>Browse Profiles</h1>
                    <p style={styles.headerDesc}>
                        Find your perfect match from {sampleProfiles.length}+ verified profiles
                    </p>
                </div>
            </div>

            <div style={styles.container}>

                {/* FILTERS SIDEBAR */}
                <div style={styles.filterSidebar}>
                    <div style={styles.filterCard}>
                        <h3 style={styles.filterTitle}>🔍 Filter Profiles</h3>

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
                            <input
                                name="caste"
                                type="text"
                                placeholder="Enter caste"
                                value={filters.caste}
                                onChange={handleFilterChange}
                                style={styles.filterInput}
                            />
                        </div>

                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>District</label>
                            <select name="district" value={filters.district} onChange={handleFilterChange} style={styles.filterInput}>
                                <option value="">All Districts</option>
                                {['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Erode', 'Tirunelveli', 'Vellore', 'Puducherry'].map(d => (
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
                                <input
                                    name="minAge"
                                    type="number"
                                    placeholder="Min"
                                    value={filters.minAge}
                                    onChange={handleFilterChange}
                                    style={{ ...styles.filterInput, width: '48%' }}
                                />
                                <input
                                    name="maxAge"
                                    type="number"
                                    placeholder="Max"
                                    value={filters.maxAge}
                                    onChange={handleFilterChange}
                                    style={{ ...styles.filterInput, width: '48%' }}
                                />
                            </div>
                        </div>

                        <button style={styles.applyBtn} onClick={applyFilters}>
                            🔍 Apply Filters
                        </button>
                        <button style={styles.resetBtn} onClick={resetFilters}>
                            ✕ Reset
                        </button>

                    </div>

                    {/* Quick Filter Tags */}
                    <div style={styles.quickFilters}>
                        <h4 style={styles.quickTitle}>Quick Filters</h4>
                        {[
                            { label: '👩 Brides', filter: { gender: 'Female' } },
                            { label: '👨 Grooms', filter: { gender: 'Male' } },
                            { label: '🙏 Hindu', filter: { religion: 'Hindu' } },
                            { label: '☪️ Muslim', filter: { religion: 'Muslim' } },
                            { label: '✝️ Christian', filter: { religion: 'Christian' } },
                            { label: '🏙️ Chennai', filter: { district: 'Chennai' } },
                            { label: '🏙️ Coimbatore', filter: { district: 'Coimbatore' } },
                        ].map(q => (
                            <span
                                key={q.label}
                                style={styles.quickTag}
                                onClick={() => {
                                    setFilters({ ...filters, ...q.filter });
                                }}
                            >
                                {q.label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* PROFILES GRID */}
                <div style={styles.profilesArea}>

                    {/* Results header */}
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

                    {/* Not logged in warning */}
                    {!user && (
                        <div style={styles.loginAlert}>
                            <span>🔒 Login to send interests and view full profiles</span>
                            <button style={styles.loginAlertBtn} onClick={() => setShowLogin(true)}>
                                Login Now
                            </button>
                        </div>
                    )}

                    {/* Profile Cards */}
                    <div style={styles.profilesGrid}>
                        {displayProfiles.map((profile) => (
                            <div key={profile._id} style={styles.profileCard}>

                                {/* Photo */}
                                <div style={{
                                    ...styles.photoSection,
                                    background: profile.gender === 'Female'
                                        ? 'linear-gradient(135deg, #FDEEF5, #F5D5E8)'
                                        : 'linear-gradient(135deg, #EEF2FD, #D5DEF5)'
                                }}>
                                    <span style={styles.profileEmoji}>
                                        {profile.gender === 'Female' ? '👩' : '👨'}
                                    </span>
                                    <span style={styles.verifiedBadge}>✓ Verified</span>
                                    <span style={styles.genderBadge}>
                                        {profile.gender === 'Female' ? '👩 Bride' : '👨 Groom'}
                                    </span>
                                </div>

                                {/* Info */}
                                <div style={styles.cardInfo}>
                                    <div style={styles.cardName}>{profile.name}</div>
                                    <div style={styles.cardMeta}>
                                        {profile.occupation} • {profile.city}
                                    </div>
                                    <div style={styles.cardMeta}>
                                        {profile.religion} • {profile.caste}
                                    </div>

                                    {/* Details */}
                                    <div style={styles.detailsRow}>
                                        {[
                                            { icon: '📏', value: profile.height },
                                            { icon: '🎓', value: profile.education },
                                            { icon: '💰', value: profile.annualIncome },
                                            { icon: '⭐', value: profile.rasi },
                                        ].map(d => d.value && (
                                            <div key={d.icon} style={styles.detailTag}>
                                                {d.icon} {d.value}
                                            </div>
                                        ))}
                                    </div>

                                    {/* About */}
                                    {profile.about && (
                                        <p style={styles.cardAbout}>
                                            {profile.about.substring(0, 80)}...
                                        </p>
                                    )}

                                    {/* Actions */}
                                    <div style={styles.cardActions}>
                                        <button
                                            style={styles.interestBtn}
                                            onClick={() => handleSendInterest(profile)}
                                        >
                                            💌 Send Interest
                                        </button>
                                        <button
                                            style={styles.viewBtn}
                                            onClick={() => handleViewProfile(profile)}
                                        >
                                            👁️ View
                                        </button>
                                        <button style={styles.shortlistBtn}>⭐</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {displayProfiles.length === 0 && (
                        <div style={styles.noResults}>
                            <div style={{ fontSize: '60px' }}>😔</div>
                            <h3>No profiles found!</h3>
                            <p style={{ color: '#7A6055' }}>Try adjusting your filters</p>
                            <button style={styles.resetBtn2} onClick={resetFilters}>Reset Filters</button>
                        </div>
                    )}
                </div>
            </div>

            {/* PROFILE DETAIL MODAL */}
            {selectedProfile && (
                <div style={styles.modalOverlay} onClick={() => setSelectedProfile(null)}>
                    <div style={styles.profileModal} onClick={e => e.stopPropagation()}>
                        <button style={styles.modalClose} onClick={() => setSelectedProfile(null)}>✕</button>

                        {/* Modal Header */}
                        <div style={{
                            ...styles.modalPhoto,
                            background: selectedProfile.gender === 'Female'
                                ? 'linear-gradient(135deg, #FDEEF5, #F5D5E8)'
                                : 'linear-gradient(135deg, #EEF2FD, #D5DEF5)'
                        }}>
                            <span style={{ fontSize: '80px' }}>
                                {selectedProfile.gender === 'Female' ? '👩' : '👨'}
                            </span>
                            <span style={styles.verifiedBadge}>✓ Verified</span>
                        </div>

                        <div style={styles.modalBody}>
                            <h2 style={styles.modalName}>{selectedProfile.name}</h2>
                            <p style={styles.modalSub}>
                                {selectedProfile.occupation} • {selectedProfile.city}
                            </p>

                            <div style={styles.modalGrid}>
                                {[
                                    { label: 'Religion', value: selectedProfile.religion },
                                    { label: 'Caste', value: selectedProfile.caste },
                                    { label: 'Height', value: selectedProfile.height },
                                    { label: 'Education', value: selectedProfile.education },
                                    { label: 'Occupation', value: selectedProfile.occupation },
                                    { label: 'Income', value: selectedProfile.annualIncome },
                                    { label: 'Marital Status', value: selectedProfile.maritalStatus },
                                    { label: 'Rasi', value: selectedProfile.rasi },
                                    { label: 'District', value: selectedProfile.district },
                                ].map(item => (
                                    <div key={item.label} style={styles.modalField}>
                                        <span style={styles.modalFieldLabel}>{item.label}</span>
                                        <span style={styles.modalFieldValue}>{item.value}</span>
                                    </div>
                                ))}
                            </div>

                            {selectedProfile.about && (
                                <div style={styles.modalAbout}>
                                    <h4 style={styles.modalFieldLabel}>About</h4>
                                    <p style={{ fontSize: '14px', color: '#2C1810', lineHeight: 1.7 }}>
                                        {selectedProfile.about}
                                    </p>
                                </div>
                            )}

                            {/* Contact - Only for Premium */}
                            <div style={styles.contactSection}>
                                {user?.isPremium ? (
                                    <div style={styles.contactDetails}>
                                        <h4 style={{ marginBottom: '12px', color: '#1A0A0A' }}>📞 Contact Details</h4>
                                        <p style={{ color: '#8B1A1A', fontWeight: '600' }}>+91 99999 99999</p>
                                    </div>
                                ) : (
                                    <div style={styles.premiumLock}>
                                        <span>🔒 Upgrade to Premium to view contact details</span>
                                        <button style={styles.upgradeBtn}>⭐ Upgrade Now</button>
                                    </div>
                                )}
                            </div>

                            <div style={styles.modalActions}>
                                <button
                                    style={styles.interestBtn}
                                    onClick={() => { handleSendInterest(selectedProfile); setSelectedProfile(null); }}
                                >
                                    💌 Send Interest
                                </button>
                                <button style={styles.whatsappBtn}>
                                    💬 WhatsApp
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
    header: {
        background: 'linear-gradient(135deg, #1A0A0A, #3D1A1A)',
        padding: '40px 24px'
    },
    headerInner: {
        maxWidth: '1200px',
        margin: '0 auto'
    },
    headerTitle: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '36px',
        color: '#fff',
        marginBottom: '8px'
    },
    headerDesc: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: '15px'
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 24px',
        display: 'grid',
        gridTemplateColumns: '260px 1fr',
        gap: '28px',
        alignItems: 'start'
    },
    filterSidebar: {},
    filterCard: {
        background: '#fff',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 4px 24px rgba(139,26,26,0.08)',
        marginBottom: '16px'
    },
    filterTitle: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '18px',
        color: '#1A0A0A',
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid #E8D5C4'
    },
    filterGroup: { marginBottom: '14px' },
    filterLabel: {
        display: 'block',
        fontSize: '11px',
        fontWeight: '700',
        color: '#7A6055',
        marginBottom: '5px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    filterInput: {
        width: '100%',
        padding: '9px 12px',
        border: '1.5px solid #E8D5C4',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#2C1810',
        background: '#FFFDF9',
        outline: 'none',
        fontFamily: "'DM Sans', sans-serif",
        boxSizing: 'border-box'
    },
    ageRow: {
        display: 'flex',
        gap: '8px'
    },
    applyBtn: {
        width: '100%',
        padding: '11px',
        background: 'linear-gradient(135deg, #8B1A1A, #C0392B)',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        marginBottom: '8px',
        fontFamily: "'DM Sans', sans-serif"
    },
    resetBtn: {
        width: '100%',
        padding: '9px',
        background: 'transparent',
        color: '#7A6055',
        border: '1.5px solid #E8D5C4',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif"
    },
    quickFilters: {
        background: '#fff',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 4px 24px rgba(139,26,26,0.08)'
    },
    quickTitle: {
        fontSize: '13px',
        fontWeight: '700',
        color: '#7A6055',
        marginBottom: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    quickTag: {
        display: 'inline-block',
        padding: '5px 12px',
        background: '#FDF0F0',
        border: '1px solid #E8C4C4',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '500',
        color: '#8B1A1A',
        cursor: 'pointer',
        margin: '3px'
    },
    profilesArea: {},
    resultsHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
    },
    resultsCount: {
        fontSize: '14px',
        color: '#7A6055'
    },
    sortSelect: {
        padding: '7px 12px',
        border: '1.5px solid #E8D5C4',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#2C1810',
        background: '#fff',
        cursor: 'pointer'
    },
    loginAlert: {
        background: '#FFF9E6',
        border: '1px solid #F5E6C0',
        borderRadius: '10px',
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        fontSize: '14px',
        color: '#7A6055'
    },
    loginAlertBtn: {
        padding: '7px 16px',
        background: '#8B1A1A',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    profilesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px'
    },
    profileCard: {
        background: '#fff',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(139,26,26,0.08)',
        transition: 'transform 0.2s'
    },
    photoSection: {
        height: '160px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
    },
    profileEmoji: { fontSize: '52px' },
    verifiedBadge: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: '#1E6B3C',
        color: '#fff',
        fontSize: '10px',
        fontWeight: '700',
        padding: '3px 8px',
        borderRadius: '20px'
    },
    genderBadge: {
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        background: 'rgba(255,255,255,0.9)',
        color: '#2C1810',
        fontSize: '11px',
        fontWeight: '600',
        padding: '3px 8px',
        borderRadius: '20px'
    },
    cardInfo: { padding: '14px' },
    cardName: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '17px',
        fontWeight: '700',
        color: '#1A0A0A',
        marginBottom: '3px'
    },
    cardMeta: {
        fontSize: '12px',
        color: '#7A6055',
        marginBottom: '2px',
        lineHeight: 1.5
    },
    detailsRow: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px',
        margin: '8px 0'
    },
    detailTag: {
        fontSize: '10px',
        padding: '3px 8px',
        background: '#FDF0F0',
        color: '#8B1A1A',
        borderRadius: '20px',
        fontWeight: '500'
    },
    cardAbout: {
        fontSize: '12px',
        color: '#7A6055',
        lineHeight: 1.5,
        marginBottom: '10px'
    },
    cardActions: {
        display: 'flex',
        gap: '6px'
    },
    interestBtn: {
        flex: 1,
        padding: '8px',
        background: '#8B1A1A',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif"
    },
    viewBtn: {
        flex: 1,
        padding: '8px',
        background: 'transparent',
        color: '#8B1A1A',
        border: '1.5px solid #8B1A1A',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif"
    },
    shortlistBtn: {
        padding: '8px 10px',
        background: '#FFFBF0',
        border: '1.5px solid #F5E6C0',
        borderRadius: '8px',
        fontSize: '14px',
        cursor: 'pointer'
    },
    noResults: {
        textAlign: 'center',
        padding: '60px 20px'
    },
    resetBtn2: {
        padding: '10px 24px',
        background: '#8B1A1A',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '16px'
    },
    modalOverlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
    },
    profileModal: {
        background: '#fff',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative'
    },
    modalClose: {
        position: 'absolute',
        top: '16px',
        right: '16px',
        background: 'rgba(0,0,0,0.3)',
        color: '#fff',
        border: 'none',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        fontSize: '14px',
        cursor: 'pointer',
        zIndex: 10
    },
    modalPhoto: {
        height: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        borderRadius: '20px 20px 0 0'
    },
    modalBody: { padding: '24px' },
    modalName: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '24px',
        color: '#1A0A0A',
        marginBottom: '4px'
    },
    modalSub: {
        fontSize: '14px',
        color: '#7A6055',
        marginBottom: '20px'
    },
    modalGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0',
        border: '1px solid #E8D5C4',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '16px'
    },
    modalField: {
        padding: '10px 14px',
        borderBottom: '1px solid #E8D5C4',
        borderRight: '1px solid #E8D5C4'
    },
    modalFieldLabel: {
        display: 'block',
        fontSize: '10px',
        fontWeight: '700',
        color: '#7A6055',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '3px'
    },
    modalFieldValue: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#1A0A0A'
    },
    modalAbout: {
        padding: '14px',
        background: '#FFFDF9',
        borderRadius: '10px',
        marginBottom: '16px',
        border: '1px solid #E8D5C4'
    },
    contactSection: {
        marginBottom: '16px'
    },
    contactDetails: {
        background: '#F0FFF4',
        border: '1px solid #C3E6CB',
        borderRadius: '10px',
        padding: '14px'
    },
    premiumLock: {
        background: '#FFF9E6',
        border: '1px solid #F5E6C0',
        borderRadius: '10px',
        padding: '14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '13px',
        color: '#7A6055'
    },
    upgradeBtn: {
        padding: '7px 14px',
        background: '#C9A84C',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    modalActions: {
        display: 'flex',
        gap: '10px'
    },
    whatsappBtn: {
        flex: 1,
        padding: '12px',
        background: '#25D366',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif"
    }
};

export default Browse;