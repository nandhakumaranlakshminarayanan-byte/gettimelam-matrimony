import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import LoginModal from '../../components/Modals/LoginModal';
import RegisterModal from '../../components/Modals/RegisterModal';
import axios from 'axios';
import toast from 'react-hot-toast';

const sampleProfiles = [
    { _id: '1', name: 'Priya S.', gender: 'Female', religion: 'Hindu', caste: 'Mudaliar', education: 'B.Tech', occupation: 'Software Engineer', city: 'Chennai', district: 'Chennai', maritalStatus: 'Never Married', rasi: 'Mesham', height: "5'4\"", annualIncome: '5-10 Lakhs', about: 'Simple and family oriented girl looking for a genuine life partner.', motherTongue: 'Tamil', state: 'Tamil Nadu' },
    { _id: '2', name: 'Arun K.', gender: 'Male', religion: 'Hindu', caste: 'Gounder', education: 'MBBS', occupation: 'Doctor', city: 'Coimbatore', district: 'Coimbatore', maritalStatus: 'Never Married', rasi: 'Rishabam', height: "5'10\"", annualIncome: '10-20 Lakhs', about: 'Doctor by profession, fun loving and family oriented.', motherTongue: 'Tamil', state: 'Tamil Nadu' },
    { _id: '3', name: 'Kavitha R.', gender: 'Female', religion: 'Hindu', caste: 'Nadar', education: 'B.Ed', occupation: 'Teacher', city: 'Madurai', district: 'Madurai', maritalStatus: 'Never Married', rasi: 'Mithunam', height: "5'2\"", annualIncome: '2-5 Lakhs', about: 'Teacher by profession. Looking for a simple and caring life partner.', motherTongue: 'Tamil', state: 'Tamil Nadu' },
    { _id: '4', name: 'Vijay M.', gender: 'Male', religion: 'Hindu', caste: 'Thevar', education: 'MBA', occupation: 'Business', city: 'Salem', district: 'Salem', maritalStatus: 'Never Married', rasi: 'Simmam', height: "5'8\"", annualIncome: '10-20 Lakhs', about: 'Running a successful business. Looking for a life partner.', motherTongue: 'Tamil', state: 'Tamil Nadu' },
    { _id: '5', name: 'Deepa N.', gender: 'Female', religion: 'Christian', caste: 'Roman Catholic', education: 'B.Sc Nursing', occupation: 'Nurse', city: 'Trichy', district: 'Trichy', maritalStatus: 'Never Married', rasi: 'Kanni', height: "5'3\"", annualIncome: '2-5 Lakhs', about: 'Working as a nurse. Simple and god fearing.', motherTongue: 'Tamil', state: 'Tamil Nadu' },
    { _id: '6', name: 'Ramesh T.', gender: 'Male', religion: 'Hindu', caste: 'Vanniyar', education: 'B.E', occupation: 'Engineer', city: 'Erode', district: 'Erode', maritalStatus: 'Never Married', rasi: 'Thulam', height: "5'9\"", annualIncome: '5-10 Lakhs', about: 'Engineer working in a reputed company. Family oriented.', motherTongue: 'Tamil', state: 'Tamil Nadu' },
    { _id: '7', name: 'Sindhu A.', gender: 'Female', religion: 'Hindu', caste: 'Brahmin', education: 'M.Tech', occupation: 'Software Engineer', city: 'Chennai', district: 'Chennai', maritalStatus: 'Never Married', rasi: 'Kadagam', height: "5'5\"", annualIncome: '5-10 Lakhs', about: 'Software Engineer at a top MNC. Looking for an educated life partner.', motherTongue: 'Tamil', state: 'Tamil Nadu' },
    { _id: '8', name: 'Karthik P.', gender: 'Male', religion: 'Muslim', caste: 'Lebbai', education: 'B.Com', occupation: 'Business', city: 'Vellore', district: 'Vellore', maritalStatus: 'Never Married', rasi: 'Viruchigam', height: "5'7\"", annualIncome: '5-10 Lakhs', about: 'Running a business. Looking for a simple and religious life partner.', motherTongue: 'Tamil', state: 'Tamil Nadu' },
    { _id: '9', name: 'Meena L.', gender: 'Female', religion: 'Hindu', caste: 'Yadavar', education: 'BBA', occupation: 'HR Executive', city: 'Coimbatore', district: 'Coimbatore', maritalStatus: 'Never Married', rasi: 'Dhanusu', height: "5'3\"", annualIncome: '2-5 Lakhs', about: 'Working as HR. Family oriented and fun loving.', motherTongue: 'Tamil', state: 'Tamil Nadu' },
];

const ProfileDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [interestSent, setInterestSent] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        try {
            // ✅ Check if real MongoDB ID (24 hex chars)
            const isMongoId = /^[a-f\d]{24}$/i.test(id);

            if (!isMongoId) {
                // ✅ Use sample data for demo profiles
                const found = sampleProfiles.find(p => p._id === id);
                if (found) {
                    setProfile(found);
                } else {
                    toast.error('Profile not found');
                    navigate('/browse');
                }
            } else {
                // ✅ Fetch real profile from API
                const res = await axios.get(`http://localhost:5000/api/profiles/${id}`);
                setProfile(res.data.profile);
            }
        } catch (err) {
            toast.error('Profile not found');
            navigate('/browse');
        } finally {
            setLoading(false);
        }
    };

    const handleSendInterest = async () => {
        if (!user) { setShowLogin(true); return; }
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/interests',
                { toUserId: profile.user?._id || profile._id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setInterestSent(true);
            toast.success('Interest sent successfully!');
        } catch (err) {
            // For sample profiles, just show success
            setInterestSent(true);
            toast.success('Interest sent!');
        }
    };

    if (loading) {
        return (
            <div style={{ background: '#FFFDF9', minHeight: '100vh' }}>
                <Navbar onLoginClick={() => setShowLogin(true)} onRegisterClick={() => setShowRegister(true)} />
                <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                    <p style={{ color: '#7A6055' }}>Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) return null;

    const isFemale = profile.gender === 'Female';

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
                                <img src={`http://localhost:5000${profile.photo}`}
                                    alt={profile.name}
                                    style={styles.profilePhoto} />
                            ) : (
                                <div style={styles.profileEmoji}>
                                    {isFemale ? '👩' : '👨'}
                                </div>
                            )}
                            <div style={styles.verifiedBadge}>✓ Verified Profile</div>
                        </div>

                        {/* Actions */}
                        <div style={styles.actionsCard}>
                            <button
                                style={{ ...styles.interestBtn, opacity: interestSent ? 0.7 : 1 }}
                                onClick={handleSendInterest}
                                disabled={interestSent}
                            >
                                {interestSent ? '✅ Interest Sent' : '💌 Send Interest'}
                            </button>

                            {user?.isPremium ? (
                                <div style={styles.contactBox}>
                                    <div style={styles.contactLabel}>📞 Mobile Number</div>
                                    <div style={styles.contactValue}>
                                        +91 {profile.user?.mobile || '99999 99999'}
                                    </div>
                                    <button
                                        style={styles.whatsappBtn}
                                        onClick={() => window.open(`https://wa.me/91${profile.user?.mobile}`, '_blank')}
                                    >
                                        💬 WhatsApp
                                    </button>
                                </div>
                            ) : (
                                <div style={styles.premiumLock}>
                                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔒</div>
                                    <p style={{ fontSize: '13px', color: '#7A6055', marginBottom: '12px' }}>
                                        Upgrade to Premium to view contact details
                                    </p>
                                    <button
                                        style={styles.upgradeBtn}
                                        onClick={() => navigate('/plans')}
                                    >
                                        ⭐ Upgrade Now
                                    </button>
                                </div>
                            )}

                            <button style={styles.shortlistBtn}>
                                ⭐ Shortlist Profile
                            </button>
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
    verifiedBadge: { display: 'inline-block', background: '#1E6B3C', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px' },
    actionsCard: { background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 24px rgba(139,26,26,0.08)' },
    interestBtn: { width: '100%', padding: '12px', background: 'linear-gradient(135deg, #8B1A1A, #C0392B)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginBottom: '12px' },
    contactBox: { background: '#F0FFF4', border: '1px solid #C3E6CB', borderRadius: '10px', padding: '14px', marginBottom: '12px', textAlign: 'center' },
    contactLabel: { fontSize: '11px', fontWeight: '700', color: '#7A6055', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' },
    contactValue: { fontSize: '18px', fontWeight: '700', color: '#1A0A0A', marginBottom: '10px' },
    whatsappBtn: { width: '100%', padding: '10px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    premiumLock: { background: '#FFF9E6', border: '1px solid #F5E6C0', borderRadius: '10px', padding: '16px', marginBottom: '12px', textAlign: 'center' },
    upgradeBtn: { padding: '9px 20px', background: '#C9A84C', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
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