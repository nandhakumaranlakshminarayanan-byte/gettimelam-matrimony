import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import LoginModal from '../../components/Modals/LoginModal';
import RegisterModal from '../../components/Modals/RegisterModal';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = 'http://localhost:5000';

const ProfileDetail = () => {
    const { id } = useParams();
    const { user, refreshUser } = useAuth(); // ✅ added refreshUser
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [interestSent, setInterestSent] = useState(false);
    const [numberRequest, setNumberRequest] = useState(null);
    const [requesting, setRequesting] = useState(false);

    useEffect(() => {
        fetchProfile();
        if (refreshUser) refreshUser(); // ✅ always get latest premium status
    }, [id]);

    useEffect(() => { if (user && profile) checkNumberRequest(); }, [user, profile]);

    const fetchProfile = async () => {
        try {
            const res = await axios.get(`${API}/api/profiles/${id}`);
            setProfile(res.data.profile);
        } catch (err) {
            toast.error('Profile not found');
            navigate('/browse');
        } finally {
            setLoading(false);
        }
    };

    const checkNumberRequest = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/privacy/check/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNumberRequest(res.data.request);
        } catch (err) { }
    };

    const handleSendInterest = async () => {
        if (!user) { setShowLogin(true); return; }
        setInterestSent(true);
        toast.success('Interest sent! 💌');
    };

    const handleSendNumberRequest = async () => {
        if (!user) { setShowLogin(true); return; }
        setRequesting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API}/api/privacy/request`,
                { profileId: id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Number request sent! 📬');
            checkNumberRequest();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed!');
        } finally {
            setRequesting(false);
        }
    };

    const handleStartChat = () => {
        if (!user) { setShowLogin(true); return; }
        const profileUserId = profile?.user?._id || profile?.user;
        if (profileUserId) {
            navigate(`/messages?with=${profileUserId}`);
        } else {
            toast.error('Cannot start chat with this profile');
        }
    };

    const getNumberStatus = () => {
        if (!user) return 'login';
        if (!profile?.numberProtected) {
            return user?.isPremium ? 'show' : 'upgrade';
        }
        if (!numberRequest) return 'request';
        if (numberRequest.status === 'pending') return 'pending';
        if (numberRequest.status === 'approved') return 'show';
        if (numberRequest.status === 'rejected') return 'rejected';
    };

    if (loading) return (
        <div style={{ background: '#FFFDF9', minHeight: '100vh' }}>
            <Navbar onLoginClick={() => setShowLogin(true)} onRegisterClick={() => setShowRegister(true)} />
            <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                <p style={{ color: '#7A6055' }}>Loading profile...</p>
            </div>
        </div>
    );

    if (!profile) return null;

    const isFemale = profile.gender === 'Female';
    const numberStatus = getNumberStatus();

    return (
        <div style={{ background: '#FFFDF9', minHeight: '100vh' }}>
            <Navbar onLoginClick={() => setShowLogin(true)} onRegisterClick={() => setShowRegister(true)} />

            <div style={styles.container}>
                <button style={styles.backBtn} onClick={() => navigate('/browse')}>
                    ← Back to Browse
                </button>

                <div style={styles.grid}>

                    {/* LEFT — Photo & Actions */}
                    <div style={styles.leftCol}>
                        <div style={{
                            ...styles.photoCard,
                            background: isFemale
                                ? 'linear-gradient(135deg, #FDEEF5, #F5D5E8)'
                                : 'linear-gradient(135deg, #EEF2FD, #D5DEF5)'
                        }}>
                            {profile.photo ? (
                                <img src={`${API}${profile.photo}`} alt={profile.name}
                                    style={styles.profilePhoto} />
                            ) : (
                                <div style={styles.profileEmoji}>
                                    {isFemale ? '👩' : '👨'}
                                </div>
                            )}
                            <div style={styles.verifiedBadge}>✓ Verified Profile</div>
                            {profile.numberProtected && (
                                <div style={styles.protectedBadge}>🔒 Number Protected</div>
                            )}
                        </div>

                        {/* Actions Card */}
                        <div style={styles.actionsCard}>
                            <button
                                style={{ ...styles.interestBtn, opacity: interestSent ? 0.7 : 1 }}
                                onClick={handleSendInterest}
                                disabled={interestSent}>
                                {interestSent ? '✅ Interest Sent' : '💌 Send Interest'}
                            </button>

                            <button style={styles.chatBtn} onClick={handleStartChat}>
                                💬 Send Message
                            </button>

                            {/* ✅ Number Privacy Section */}
                            <div style={styles.numberSection}>
                                <div style={styles.numberTitle}>
                                    {profile.numberProtected ? '🔒 Protected Number' : '📞 Contact Number'}
                                </div>

                                {numberStatus === 'show' && (
                                    <div style={styles.contactBox}>
                                        <div style={styles.contactValue}>
                                            +91 {profile.user?.mobile || '—'}
                                        </div>
                                        <button style={styles.whatsappBtn}
                                            onClick={() => window.open(`https://wa.me/91${profile.user?.mobile}`, '_blank')}>
                                            💬 WhatsApp
                                        </button>
                                    </div>
                                )}

                                {numberStatus === 'upgrade' && (
                                    <div style={styles.lockBox}>
                                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔒</div>
                                        <p style={{ fontSize: '12px', color: '#7A6055', marginBottom: '10px' }}>
                                            Upgrade to Premium to view contact
                                        </p>
                                        <button style={styles.upgradeBtn} onClick={() => navigate('/plans')}>
                                            ⭐ Upgrade Now
                                        </button>
                                    </div>
                                )}

                                {numberStatus === 'request' && (
                                    <div style={styles.lockBox}>
                                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔒</div>
                                        <p style={{ fontSize: '12px', color: '#7A6055', marginBottom: '10px' }}>
                                            This number is protected. Send a request to view it.
                                        </p>
                                        <button style={styles.requestBtn}
                                            onClick={handleSendNumberRequest}
                                            disabled={requesting}>
                                            {requesting ? '⏳ Sending...' : '📬 Request Number'}
                                        </button>
                                    </div>
                                )}

                                {numberStatus === 'pending' && (
                                    <div style={{ ...styles.lockBox, background: '#FFF8E1', border: '1px solid #FFE082' }}>
                                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
                                        <p style={{ fontSize: '12px', color: '#F57F17', fontWeight: '600' }}>
                                            Request pending approval
                                        </p>
                                    </div>
                                )}

                                {numberStatus === 'rejected' && (
                                    <div style={{ ...styles.lockBox, background: '#FFEBEE', border: '1px solid #FFCDD2' }}>
                                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>❌</div>
                                        <p style={{ fontSize: '12px', color: '#C62828', fontWeight: '600' }}>
                                            Request was rejected
                                        </p>
                                    </div>
                                )}

                                {numberStatus === 'login' && (
                                    <div style={styles.lockBox}>
                                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔐</div>
                                        <p style={{ fontSize: '12px', color: '#7A6055', marginBottom: '10px' }}>
                                            Login to view contact details
                                        </p>
                                        <button style={styles.upgradeBtn} onClick={() => setShowLogin(true)}>
                                            Login Now
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button style={styles.shortlistBtn}>⭐ Shortlist Profile</button>
                        </div>
                    </div>

                    {/* RIGHT — Profile Details */}
                    <div style={styles.rightCol}>
                        <div style={styles.nameCard}>
                            <h1 style={styles.profileName}>{profile.name || profile.user?.name}</h1>
                            <p style={styles.profileSub}>
                                {profile.occupation} • {profile.city}, {profile.district}
                            </p>
                            <div style={styles.tagRow}>
                                {[profile.religion, profile.caste, profile.maritalStatus, profile.height]
                                    .filter(Boolean).map((tag, i) => (
                                        <span key={i} style={styles.tag}>{tag}</span>
                                    ))}
                            </div>
                        </div>

                        {profile.about && (
                            <div style={styles.section}>
                                <h3 style={styles.sectionTitle}>About Me</h3>
                                <p style={styles.aboutText}>{profile.about}</p>
                            </div>
                        )}

                        <div style={styles.section}>
                            <h3 style={styles.sectionTitle}>Personal Details</h3>
                            <div style={styles.detailGrid}>
                                {[
                                    { label: 'Date of Birth', value: profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-IN') : '—' },
                                    { label: 'Height', value: profile.height },
                                    { label: 'Complexion', value: profile.complexion },
                                    { label: 'Marital Status', value: profile.maritalStatus },
                                    { label: 'Mother Tongue', value: profile.motherTongue },
                                    { label: 'Family Type', value: profile.familyType },
                                ].map(item => (
                                    <div key={item.label} style={styles.detailItem}>
                                        <span style={styles.detailLabel}>{item.label}</span>
                                        <span style={styles.detailValue}>{item.value || '—'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={styles.section}>
                            <h3 style={styles.sectionTitle}>Religious Details</h3>
                            <div style={styles.detailGrid}>
                                {[
                                    { label: 'Religion', value: profile.religion },
                                    { label: 'Caste', value: profile.caste },
                                    { label: 'Sub Caste', value: profile.subCaste },
                                    { label: 'Rasi', value: profile.rasi },
                                    { label: 'Nakshatra', value: profile.nakshatra },
                                    { label: 'Dosham', value: profile.dosham },
                                ].map(item => (
                                    <div key={item.label} style={styles.detailItem}>
                                        <span style={styles.detailLabel}>{item.label}</span>
                                        <span style={styles.detailValue}>{item.value || '—'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={styles.section}>
                            <h3 style={styles.sectionTitle}>Education & Career</h3>
                            <div style={styles.detailGrid}>
                                {[
                                    { label: 'Education', value: profile.education },
                                    { label: 'Occupation', value: profile.occupation },
                                    { label: 'Annual Income', value: profile.annualIncome },
                                ].map(item => (
                                    <div key={item.label} style={styles.detailItem}>
                                        <span style={styles.detailLabel}>{item.label}</span>
                                        <span style={styles.detailValue}>{item.value || '—'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={styles.section}>
                            <h3 style={styles.sectionTitle}>Location</h3>
                            <div style={styles.detailGrid}>
                                {[
                                    { label: 'City', value: profile.city },
                                    { label: 'District', value: profile.district },
                                    { label: 'State', value: profile.state || 'Tamil Nadu' },
                                ].map(item => (
                                    <div key={item.label} style={styles.detailItem}>
                                        <span style={styles.detailLabel}>{item.label}</span>
                                        <span style={styles.detailValue}>{item.value || '—'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={styles.section}>
                            <h3 style={styles.sectionTitle}>Family Details</h3>
                            <div style={styles.detailGrid}>
                                {[
                                    { label: "Father's Occupation", value: profile.fatherOccupation },
                                    { label: "Mother's Occupation", value: profile.motherOccupation },
                                    { label: 'Siblings', value: profile.siblings },
                                    { label: 'Family Type', value: profile.familyType },
                                ].map(item => (
                                    <div key={item.label} style={styles.detailItem}>
                                        <span style={styles.detailLabel}>{item.label}</span>
                                        <span style={styles.detailValue}>{item.value || '—'}</span>
                                    </div>
                                ))}
                            </div>
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
    container: { maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' },
    backBtn: { padding: '8px 16px', background: 'transparent', border: '1.5px solid #8B1A1A', color: '#8B1A1A', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginBottom: '24px' },
    grid: { display: 'grid', gridTemplateColumns: '300px 1fr', gap: '28px', alignItems: 'start' },
    leftCol: {},
    photoCard: { borderRadius: '16px', padding: '32px 20px', textAlign: 'center', marginBottom: '16px', boxShadow: '0 4px 24px rgba(139,26,26,0.08)' },
    profilePhoto: { width: '140px', height: '140px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #8B1A1A', marginBottom: '12px' },
    profileEmoji: { fontSize: '80px', marginBottom: '12px' },
    verifiedBadge: { display: 'inline-block', background: '#1E6B3C', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px', marginBottom: '6px' },
    protectedBadge: { display: 'inline-block', background: '#8B1A1A', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px', marginLeft: '6px' },
    actionsCard: { background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 24px rgba(139,26,26,0.08)' },
    interestBtn: { width: '100%', padding: '12px', background: 'linear-gradient(135deg, #8B1A1A, #C0392B)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginBottom: '10px' },
    chatBtn: { width: '100%', padding: '12px', background: 'linear-gradient(135deg, #1565C0, #1976D2)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginBottom: '12px' },
    numberSection: { background: '#F8F9FA', borderRadius: '10px', padding: '14px', marginBottom: '12px' },
    numberTitle: { fontSize: '12px', fontWeight: '700', color: '#7A6055', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' },
    contactBox: { background: '#F0FFF4', border: '1px solid #C3E6CB', borderRadius: '10px', padding: '14px', textAlign: 'center' },
    contactValue: { fontSize: '18px', fontWeight: '700', color: '#1A0A0A', marginBottom: '10px' },
    whatsappBtn: { width: '100%', padding: '10px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    lockBox: { background: '#FFF9E6', border: '1px solid #F5E6C0', borderRadius: '10px', padding: '16px', textAlign: 'center' },
    upgradeBtn: { padding: '9px 20px', background: '#C9A84C', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    requestBtn: { width: '100%', padding: '10px', background: '#8B1A1A', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    shortlistBtn: { width: '100%', padding: '10px', background: '#FFFBF0', border: '1.5px solid #F5E6C0', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#7A6055' },
    rightCol: {},
    nameCard: { background: '#fff', borderRadius: '16px', padding: '24px', marginBottom: '16px', boxShadow: '0 4px 24px rgba(139,26,26,0.08)' },
    profileName: { fontFamily: "'Playfair Display', serif", fontSize: '28px', color: '#1A0A0A', marginBottom: '6px' },
    profileSub: { fontSize: '15px', color: '#7A6055', marginBottom: '14px' },
    tagRow: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
    tag: { padding: '4px 12px', background: '#FDF0F0', color: '#8B1A1A', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
    section: { background: '#fff', borderRadius: '16px', padding: '20px 24px', marginBottom: '16px', boxShadow: '0 4px 24px rgba(139,26,26,0.08)' },
    sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: '18px', color: '#8B1A1A', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #E8D5C4' },
    aboutText: { fontSize: '14px', color: '#2C1810', lineHeight: 1.8 },
    detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' },
    detailItem: { display: 'flex', flexDirection: 'column', padding: '10px 12px', borderBottom: '1px solid #F5EAE0' },
    detailLabel: { fontSize: '10px', fontWeight: '700', color: '#7A6055', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' },
    detailValue: { fontSize: '14px', fontWeight: '500', color: '#2C1810' },
};

export default ProfileDetail;