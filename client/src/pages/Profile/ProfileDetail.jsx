import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import LoginModal from '../../components/Modals/LoginModal';
import RegisterModal from '../../components/Modals/RegisterModal';
import axios from 'axios';
import toast from 'react-hot-toast';
import AvatarPlaceholder from '../../components/AvatarPlaceholder';
import { getLocalizedNakshatra } from '../../utils/nakshatraData';
import { getLocalizedRasi } from '../../utils/rasiData';

const API = 'http://localhost:5000';

// ── Small line icons for section headings (replaces emoji) ──
const iconProps = (size) => ({
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: '#8B1A1A', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round',
});
const PersonIcon = ({ size = 16 }) => (<svg {...iconProps(size)}><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" /></svg>);
const BookIcon = ({ size = 16 }) => (<svg {...iconProps(size)}><path d="M4 5.5C4 4.7 4.7 4 5.5 4H12v16H5.5C4.7 20 4 19.3 4 18.5z" /><path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H12v16h6.5c.8 0 1.5-.7 1.5-1.5z" /></svg>);
const PhoneIcon = ({ size = 16 }) => (<svg {...iconProps(size)}><path d="M6 3h3l1.5 4.5-2 1.5a12 12 0 006 6l1.5-2L20 15v3a1.5 1.5 0 01-1.6 1.5A16 16 0 014.5 4.6 1.5 1.5 0 016 3z" /></svg>);
const MapIcon = ({ size = 16 }) => (<svg {...iconProps(size)}><path d="M12 21s-7-6.2-7-11a7 7 0 1114 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>);
const BriefcaseIcon = ({ size = 16 }) => (<svg {...iconProps(size)}><rect x="3" y="8" width="18" height="12" rx="2" /><path d="M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>);
const StarIcon = ({ size = 16 }) => (<svg {...iconProps(size)}><path d="M12 3l2.6 5.7 6.2.6-4.7 4.1 1.4 6.1L12 16.7 6.5 19.5l1.4-6.1L3.2 9.3l6.2-.6z" /></svg>);

const SubHeading = ({ icon, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        {icon}
        <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: '15.5px', color: '#8B1A1A', margin: 0 }}>
            {children}
        </h4>
    </div>
);

const DetailPairs = ({ items }) => {
    const filled = items.filter(it => it.value);
    if (filled.length === 0) {
        return <p style={{ fontSize: '12.5px', color: '#B0987A', margin: 0 }}>Not specified</p>;
    }
    return (
        <div>
            {filled.map(it => (
                <div key={it.label} style={{ display: 'flex', gap: '8px', fontSize: '13px', padding: '5px 0', borderBottom: '1px solid #F5EAE0' }}>
                    <span style={{ fontWeight: '700', color: '#5A4632', minWidth: '150px', flexShrink: 0 }}>{it.label}:</span>
                    <span style={{ color: '#2C1810' }}>{it.value}</span>
                </div>
            ))}
        </div>
    );
};

const ProfileDetail = () => {
    const { id } = useParams();
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [interestSent, setInterestSent] = useState(false);
    const [numberRequest, setNumberRequest] = useState(null);
    const [numberRevealed, setNumberRevealed] = useState(false);
    const [requesting, setRequesting] = useState(false);
    const [shortlisted, setShortlisted] = useState(false);
    const [shortlistLoading, setShortlistLoading] = useState(false);
    const [activePhoto, setActivePhoto] = useState(0); // ✅ gallery
    const [showHoroscope, setShowHoroscope] = useState(false);

    useEffect(() => {
        fetchProfile();
        if (refreshUser) refreshUser();
    }, [id]);

    useEffect(() => {
        if (user && profile) {
            checkNumberRequest();
            checkShortlist();
            checkInterest();
        }
    }, [user, profile]);

    const checkInterest = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/interests/check/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.sent) setInterestSent(true);
        } catch (err) { }
    };

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await axios.get(`${API}/api/profiles/${id}`, { headers });
            setProfile(res.data.profile);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Profile not found');
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

    const checkShortlist = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/shortlist/check/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShortlisted(res.data.shortlisted);
        } catch (err) { }
    };

    const handleSendInterest = async () => {
        if (!user) { setShowLogin(true); return; }
        if (interestSent) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API}/api/interests/send`,
                { profileId: id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setInterestSent(true);
            toast.success('Interest sent! 💌');
        } catch (err) {
            if (err.response?.data?.alreadySent) {
                setInterestSent(true);
                toast('Interest already sent!', { icon: '💌' });
            } else {
                toast.error(err.response?.data?.message || 'Failed to send interest');
            }
        }
    };

    const handleRevealNumber = async () => {
        setNumberRevealed(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API}/api/number-views/log`,
                { profileId: id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (err) {
            // Non-critical — number is already shown either way
        }
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

    // Draws a simple horoscope certificate onto an offscreen canvas and
    // triggers a PNG download — no backend or extra library needed for this.
    const getAge = (dob) => {
        if (!dob) return null;
        const age = Math.floor((new Date() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000));
        return age > 0 ? age : null;
    };

    const handleDownloadHoroscope = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '#FFFDF4';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#F5BE17';
        ctx.lineWidth = 6;
        ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);

        // Title
        ctx.fillStyle = '#5F0909';
        ctx.textAlign = 'center';
        ctx.font = 'bold 30px Georgia, serif';
        ctx.fillText('Horoscope Details', canvas.width / 2, 90);
        ctx.font = '16px Georgia, serif';
        ctx.fillStyle = '#B71C1C';
        ctx.fillText('Gettimelam Matrimony', canvas.width / 2, 120);

        // Divider
        ctx.strokeStyle = '#F5BE17';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(80, 145);
        ctx.lineTo(canvas.width - 80, 145);
        ctx.stroke();

        const age = getAge(profile.dateOfBirth);
        const dobFormatted = profile.dateOfBirth
            ? new Date(profile.dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
            : 'Not specified';

        const rows = [
            ['Name', profile.name || 'Not specified'],
            ['Date of Birth', dobFormatted],
            ['Age', age ? `${age} years` : 'Not specified'],
            ['Gender', profile.gender || 'Not specified'],
            ['Rasi (Zodiac)', getLocalizedRasi(profile.rasi, profile.motherTongue) || 'Not specified'],
            ['Nakshatra (Star)', getLocalizedNakshatra(profile.nakshatra, profile.motherTongue) || 'Not specified'],
            ['Dosham', profile.dosham || 'Not specified'],
        ];

        ctx.textAlign = 'left';
        let y = 200;
        rows.forEach(([label, value]) => {
            ctx.font = 'bold 17px Georgia, serif';
            ctx.fillStyle = '#7A5C00';
            ctx.fillText(label, 100, y);
            ctx.font = '17px Georgia, serif';
            ctx.fillStyle = '#2C1810';
            ctx.fillText(String(value), 340, y);
            y += 48;
        });

        // Footer note
        ctx.textAlign = 'center';
        ctx.font = 'italic 12px Georgia, serif';
        ctx.fillStyle = '#9C8060';
        ctx.fillText('Generated on ' + new Date().toLocaleDateString('en-IN'), canvas.width / 2, canvas.height - 40);

        const link = document.createElement('a');
        link.download = `${(profile.name || 'horoscope').replace(/\s+/g, '_')}_Horoscope.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const handleShortlist = async () => {
        if (!user) { setShowLogin(true); return; }
        setShortlistLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (shortlisted) {
                await axios.delete(`${API}/api/shortlist/remove/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setShortlisted(false);
                toast.success('Removed from shortlist!');
            } else {
                await axios.post(`${API}/api/shortlist/add`,
                    { profileId: id },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setShortlisted(true);
                toast.success('Profile shortlisted! ⭐');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed!');
        } finally {
            setShortlistLoading(false);
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
    const age = profile.dateOfBirth
        ? Math.floor((new Date() - new Date(profile.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
        : null;
    const hasPrefs = [
        profile.prefAgeMin, profile.prefAgeMax, profile.prefHeightMin, profile.prefMaritalStatus,
        profile.prefMotherTongue, profile.prefEatingHabits, profile.prefEducation,
        profile.prefOccupation, profile.prefReligion, profile.prefCaste,
        profile.prefCountry, profile.prefState, profile.prefCity,
    ].some(Boolean);

    // ✅ "Profile created by Groom's Brother - Nandhu"
    const getCreatedByLabel = () => {
        const { profileFor, createdByName, gender } = profile;
        if (!profileFor || profileFor === 'Myself') return null;
        const groomOrBride = gender === 'Male' ? "Groom's" : "Bride's";
        const map = {
            Son: `${groomOrBride} Father/Mother`,
            Daughter: `${groomOrBride} Father/Mother`,
            Brother: `${groomOrBride} Brother`,
            Sister: `${groomOrBride} Sister`,
            Friend: `${groomOrBride} Friend`,
            Relative: `${groomOrBride} Relative`,
        };
        const relation = map[profileFor] || profileFor;
        return createdByName ? `${relation} - ${createdByName}` : relation;
    };
    const createdByLabel = getCreatedByLabel();
    const numberStatus = getNumberStatus();

    // ✅ All photos — main photo + gallery photos
    const allPhotos = [
        ...(profile.photo ? [profile.photo] : []),
        ...(profile.photos || [])
    ];

    return (
        <div style={{ background: '#FFFDF9', minHeight: '100vh' }}>
            <Navbar onLoginClick={() => setShowLogin(true)} onRegisterClick={() => setShowRegister(true)} />

            <div style={styles.container}>
                <button style={styles.backBtn} onClick={() => navigate('/browse')}>
                    {t('profile.back_to_browse')}
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
                            {/* Main photo fills the card; badges overlay the photo */}
                            {allPhotos.length > 0 ? (
                                <div style={{ position: 'relative' }}>
                                    <img src={`${API}${allPhotos[activePhoto]}`} alt={profile.name}
                                        style={styles.profilePhoto} />
                                    {allPhotos.length > 1 && (
                                        <>
                                            <button style={{ ...styles.photoArrow, left: '10px' }}
                                                aria-label="Previous photo"
                                                onClick={() => setActivePhoto((activePhoto - 1 + allPhotos.length) % allPhotos.length)}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M15 5l-7 7 7 7" />
                                                </svg>
                                            </button>
                                            <button style={{ ...styles.photoArrow, right: '10px' }}
                                                aria-label="Next photo"
                                                onClick={() => setActivePhoto((activePhoto + 1) % allPhotos.length)}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                            <div style={styles.photoCounter}>
                                                {activePhoto + 1} / {allPhotos.length}
                                            </div>
                                        </>
                                    )}
                                    <div style={styles.badgeOverlay}>
                                        <div style={styles.verifiedBadge}>{t('profile.verified_profile')}</div>
                                        {profile.numberProtected && (
                                            <div style={styles.protectedBadge}>Number Protected</div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ padding: '32px 20px' }}>
                                    <div style={{ ...styles.profileEmoji, textAlign: 'center' }}>
                                        <AvatarPlaceholder gender={profile.gender} size={90} style={{ margin: '0 auto' }} />
                                    </div>
                                    <div style={styles.verifiedBadge}>{t('profile.verified_profile')}</div>
                                    {profile.numberProtected && (
                                        <div style={styles.protectedBadge}>Number Protected</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ✅ Photo Gallery Thumbnails */}
                        {allPhotos.length > 1 && (
                            <div style={styles.thumbsCard}>
                                <p style={styles.thumbsTitle}>📸 Photos ({allPhotos.length})</p>
                                <div style={styles.thumbsGrid}>
                                    {allPhotos.map((photo, i) => (
                                        <img key={i}
                                            src={`${API}${photo}`}
                                            alt={`Photo ${i + 1}`}
                                            style={{
                                                ...styles.thumb,
                                                border: activePhoto === i
                                                    ? '2px solid #8B1A1A'
                                                    : '2px solid transparent'
                                            }}
                                            onClick={() => setActivePhoto(i)} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Premium-locked gallery */}
                        {profile.photosLocked && profile.photosCount > 0 && (
                            <div style={styles.thumbsCard}>
                                <p style={styles.thumbsTitle}>Photos ({profile.photosCount + (profile.photo ? 1 : 0)})</p>
                                <div style={styles.photoLockBox}>
                                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#B8860B" strokeWidth="1.7" strokeLinecap="round" style={{ margin: '0 auto 8px', display: 'block' }}>
                                        <rect x="5" y="10" width="14" height="10" rx="2.5" />
                                        <path d="M8 10V7.5C8 5 9.8 3 12 3s4 2 4 4.5V10" />
                                        <circle cx="12" cy="14.6" r="1.6" fill="#B8860B" stroke="none" />
                                    </svg>
                                    <p style={{ fontSize: '12.5px', color: '#8B6914', margin: '0 0 12px', lineHeight: 1.5 }}>
                                        {profile.photosCount} more photo{profile.photosCount > 1 ? 's' : ''} — visible to Premium members only
                                    </p>
                                    <button style={styles.photoUpgradeBtn} onClick={() => navigate('/plans')}>
                                        Upgrade Now
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Actions Card */}
                        <div style={styles.actionsCard}>
                            <button
                                style={{ ...styles.interestBtn, opacity: interestSent ? 0.7 : 1 }}
                                onClick={handleSendInterest}
                                disabled={interestSent}>
                                {interestSent ? t('profile.interest_sent') : t('profile.send_interest')}
                            </button>

                            <button style={styles.chatBtn} onClick={handleStartChat}>
                                {t('profile.send_message')}
                            </button>

                            {/* Number Privacy Section */}
                            <div style={styles.numberSection}>
                                <div style={styles.numberTitle}>
                                    {profile.numberProtected ? '🔒 Protected Number' : '📞 Contact Number'}
                                </div>

                                {numberStatus === 'show' && (
                                    numberRevealed ? (
                                        <div style={styles.contactBox}>
                                            <div style={styles.contactValue}>
                                                +91 {profile.user?.mobile || '—'}
                                            </div>
                                            <button style={styles.whatsappBtn}
                                                onClick={() => window.open(`https://wa.me/91${profile.user?.mobile}`, '_blank')}>
                                                💬 WhatsApp
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={styles.contactBox}>
                                            <button style={styles.revealBtn} onClick={handleRevealNumber}>
                                                👁️ View Contact Number
                                            </button>
                                            <p style={{ fontSize: '11.5px', color: '#9C8060', marginTop: '8px', textAlign: 'center' }}>
                                                They'll be able to see that you viewed their number
                                            </p>
                                        </div>
                                    )
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

                            {/* ✅ Shortlist Button */}
                            <button style={{
                                ...styles.shortlistBtn,
                                background: shortlisted ? '#FFF8E1' : '#FFFBF0',
                                border: shortlisted ? '1.5px solid #F5C518' : '1.5px solid #F5E6C0',
                                color: shortlisted ? '#F57F17' : '#7A6055'
                            }}
                                onClick={handleShortlist}
                                disabled={shortlistLoading}>
                                {shortlistLoading ? '⏳' : shortlisted ? t('profile.shortlisted') : t('profile.shortlist')}
                            </button>
                        </div>
                    </div>

                    {/* RIGHT — Profile Details */}
                    <div style={styles.rightCol}>
                        <div style={styles.nameCard}>
                            <h1 style={styles.profileName}>{profile.name || profile.user?.name}</h1>
                            {/* ✅ Show "Profile created by Groom's Brother - Nandhu" */}
                            {createdByLabel && (
                                <div style={styles.createdByBadge}>
                                    👤 Profile created by {createdByLabel}
                                </div>
                            )}
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

                        {/* ══ Personal Information ══ */}
                        <div style={styles.groupCard}>
                            <h2 style={styles.groupTitle}>Personal Information</h2>
                            <div style={styles.groupRule} />

                            {profile.about && (
                                <div style={styles.subSection}>
                                    <SubHeading icon={<PersonIcon />}>
                                        About {isFemale ? 'Her' : 'Him'}
                                    </SubHeading>
                                    <p style={styles.aboutText}>{profile.about}</p>
                                </div>
                            )}

                            <div style={styles.pairRow}>
                                <div style={styles.subSection}>
                                    <SubHeading icon={<PersonIcon />}>Basic Details</SubHeading>
                                    <DetailPairs items={[
                                        { label: 'Name', value: profile.name },
                                        { label: 'Age', value: age ? `${age} Yrs` : null },
                                        { label: 'Height', value: profile.height },
                                        { label: 'Weight', value: profile.weight },
                                        { label: 'Mother Tongue', value: profile.motherTongue },
                                        { label: 'Known Languages', value: (profile.knownLanguages || []).join(', ') },
                                        { label: 'Marital Status', value: profile.maritalStatus },
                                        { label: 'Complexion', value: profile.complexion },
                                        { label: 'Family Type', value: profile.familyType },
                                    ]} />
                                </div>
                                <div style={styles.subSection}>
                                    <SubHeading icon={<BookIcon />}>Religion Information</SubHeading>
                                    <DetailPairs items={[
                                        { label: 'Religion', value: profile.religion },
                                        { label: 'Caste / Sub Caste', value: [profile.caste, profile.subCaste].filter(Boolean).join(' / ') },
                                        { label: 'Gothra', value: profile.gothra },
                                        { label: 'Rasi', value: getLocalizedRasi(profile.rasi, profile.motherTongue) },
                                        { label: 'Nakshatra', value: getLocalizedNakshatra(profile.nakshatra, profile.motherTongue) },
                                        { label: 'Dosham', value: profile.dosham },
                                    ]} />
                                </div>
                            </div>

                            <div style={styles.pairRow}>
                                <div style={styles.subSection}>
                                    <SubHeading icon={<PhoneIcon />}>Contact Details</SubHeading>
                                    <DetailPairs items={[
                                        { label: 'Contact Number', value: (numberStatus === 'show' && numberRevealed) ? `+91 ${profile.user?.mobile || ''}` : 'Protected' },
                                        { label: 'Chat Status', value: 'Available on Gettimelam' },
                                    ]} />
                                </div>
                                <div style={styles.subSection}>
                                    <SubHeading icon={<MapIcon />}>
                                        {isFemale ? "Bride's" : "Groom's"} Location
                                    </SubHeading>
                                    <DetailPairs items={[
                                        { label: 'Country', value: profile.country || 'India' },
                                        { label: 'State', value: profile.state || 'Tamil Nadu' },
                                        { label: 'District', value: profile.district },
                                        { label: 'City', value: profile.city },
                                    ]} />
                                </div>
                            </div>

                            <div style={styles.pairRow}>
                                <div style={styles.subSection}>
                                    <SubHeading icon={<BriefcaseIcon />}>Professional Information</SubHeading>
                                    <DetailPairs items={[
                                        { label: 'Education', value: profile.education },
                                        { label: 'Employed In', value: profile.employed },
                                        { label: 'Occupation', value: profile.occupation },
                                        { label: 'Occupation Detail', value: profile.occupationRemark },
                                        { label: 'Annual Income', value: profile.annualIncome },
                                    ]} />
                                </div>
                                <div style={styles.subSection}>
                                    <SubHeading icon={<StarIcon />}>Family Details</SubHeading>
                                    <DetailPairs items={[
                                        { label: "Father's Occupation", value: profile.fatherOccupation },
                                        { label: "Mother's Occupation", value: profile.motherOccupation },
                                        { label: 'Siblings', value: profile.siblings },
                                        { label: 'Working Location', value: [profile.workingCity, profile.workingState].filter(Boolean).join(', ') },
                                    ]} />
                                </div>
                            </div>
                        </div>

                        {/* ══ Partner Preferences ══ */}
                        <div style={styles.groupCard}>
                            <h2 style={styles.groupTitle}>
                                {isFemale ? 'Her' : 'His'} Partner Preferences
                            </h2>
                            <div style={styles.groupRule} />

                            {hasPrefs ? (
                                <>
                                    {profile.prefAbout && (
                                        <div style={styles.subSection}>
                                            <SubHeading icon={<PersonIcon />}>About Partner</SubHeading>
                                            <p style={styles.aboutText}>{profile.prefAbout}</p>
                                        </div>
                                    )}
                                    <div style={styles.pairRow}>
                                        <div style={styles.subSection}>
                                            <SubHeading icon={<PersonIcon />}>Basic Preferences</SubHeading>
                                            <DetailPairs items={[
                                                { label: 'Age Range', value: (profile.prefAgeMin || profile.prefAgeMax) ? `${profile.prefAgeMin || 'Any'} - ${profile.prefAgeMax || 'Any'} Yrs` : null },
                                                { label: 'Height Range', value: (profile.prefHeightMin || profile.prefHeightMax) ? `${profile.prefHeightMin || 'Any'} - ${profile.prefHeightMax || 'Any'}` : null },
                                                { label: 'Marital Status', value: profile.prefMaritalStatus },
                                                { label: 'Mother Tongue', value: profile.prefMotherTongue },
                                                { label: 'Eating Habits', value: profile.prefEatingHabits },
                                                { label: 'Drinking Habits', value: profile.prefDrinkingHabits },
                                                { label: 'Smoking Habits', value: profile.prefSmokingHabits },
                                            ]} />
                                        </div>
                                        <div style={styles.subSection}>
                                            <SubHeading icon={<BookIcon />}>Religious Preferences</SubHeading>
                                            <DetailPairs items={[
                                                { label: 'Religion', value: profile.prefReligion },
                                                { label: 'Caste', value: profile.prefCaste },
                                                { label: 'Sub Caste', value: profile.prefSubCaste },
                                            ]} />
                                        </div>
                                    </div>
                                    <div style={styles.pairRow}>
                                        <div style={styles.subSection}>
                                            <SubHeading icon={<BriefcaseIcon />}>Professional</SubHeading>
                                            <DetailPairs items={[
                                                { label: 'Education', value: profile.prefEducation },
                                                { label: 'Occupation', value: profile.prefOccupation },
                                                { label: 'Annual Income', value: profile.prefAnnualIncome },
                                            ]} />
                                        </div>
                                        <div style={styles.subSection}>
                                            <SubHeading icon={<MapIcon />}>Location Preferences</SubHeading>
                                            <DetailPairs items={[
                                                { label: 'Country', value: profile.prefCountry },
                                                { label: 'State', value: profile.prefState },
                                                { label: 'City', value: profile.prefCity },
                                            ]} />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div style={styles.prefPlaceholder}>
                                    <StarIcon size={26} />
                                    <p style={{ margin: '10px 0 0', fontSize: '13px', color: '#9C8060' }}>
                                        Partner preferences haven't been added to this profile yet.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* ══ Horoscope ══ */}
                        <div style={styles.groupCard}>
                            <h2 style={styles.groupTitle}>Horoscope</h2>
                            <div style={styles.groupRule} />

                            {!showHoroscope ? (
                                <div style={styles.prefPlaceholder}>
                                    <StarIcon size={26} />
                                    <p style={{ margin: '10px 0 16px', fontSize: '13px', color: '#9C8060' }}>
                                        Horoscope details are hidden by default.
                                    </p>
                                    <button style={styles.viewHoroscopeBtn} onClick={() => setShowHoroscope(true)}>
                                        👁 View Horoscope
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <DetailPairs items={[
                                        { label: 'Date of Birth', value: profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : null },
                                        { label: 'Rasi (Zodiac)', value: getLocalizedRasi(profile.rasi, profile.motherTongue) },
                                        { label: 'Nakshatra (Star)', value: getLocalizedNakshatra(profile.nakshatra, profile.motherTongue) },
                                        { label: 'Dosham', value: profile.dosham },
                                    ]} />
                                    <button style={{ ...styles.viewHoroscopeBtn, marginTop: '16px' }} onClick={handleDownloadHoroscope}>
                                        ⬇ Download Horoscope
                                    </button>
                                </>
                            )}
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
    groupCard: { background: '#fff', borderRadius: '16px', padding: '28px 30px', marginBottom: '20px', boxShadow: '0 4px 24px rgba(139,26,26,0.08)' },
    groupTitle: { fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '24px', color: '#2C1810', margin: 0 },
    groupRule: { width: '70px', height: '2px', background: '#DF9B08', margin: '10px 0 22px' },
    subSection: { marginBottom: '22px' },
    pairRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', marginBottom: '4px' },
    prefPlaceholder: { textAlign: 'center', padding: '30px 20px' },
    viewHoroscopeBtn: { padding: '11px 26px', background: 'linear-gradient(135deg, #B71C1C, #D32F2F)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13.5px', fontWeight: '700', cursor: 'pointer' },

    container: { maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' },
    backBtn: { padding: '8px 16px', background: 'transparent', border: '1.5px solid #8B1A1A', color: '#8B1A1A', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginBottom: '24px' },
    grid: { display: 'grid', gridTemplateColumns: '300px 1fr', gap: '28px', alignItems: 'start' },
    leftCol: {},
    photoCard: { borderRadius: '16px', padding: 0, overflow: 'hidden', textAlign: 'center', marginBottom: '16px', boxShadow: '0 4px 24px rgba(139,26,26,0.08)' },
    profilePhoto: { width: '100%', height: '340px', objectFit: 'cover', display: 'block' },
    badgeOverlay: {
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '28px 12px 12px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)',
        display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap',
    },
    photoArrow: {
        position: 'absolute', top: '50%', transform: 'translateY(-50%)',
        width: '36px', height: '36px', borderRadius: '50%',
        background: 'rgba(0,0,0,0.45)',
        border: '1px solid rgba(255,255,255,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', padding: 0,
    },
    photoCounter: {
        position: 'absolute', top: '10px', right: '10px',
        background: 'rgba(0,0,0,0.55)', color: '#fff',
        fontSize: '11.5px', fontWeight: '600',
        padding: '4px 10px', borderRadius: '999px',
        letterSpacing: '0.5px',
    },
    photoLockBox: { background: '#FFF9E6', border: '1px solid #F5E6C0', borderRadius: '10px', padding: '16px', textAlign: 'center' },
    photoUpgradeBtn: { padding: '9px 22px', background: 'linear-gradient(135deg, #E3AC2A, #C98F12)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' },
    profileEmoji: { fontSize: '80px', marginBottom: '12px' },
    verifiedBadge: { display: 'inline-block', background: '#1E6B3C', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px', marginBottom: '6px' },
    protectedBadge: { display: 'inline-block', background: '#8B1A1A', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px', marginLeft: '6px' },

    // ✅ Gallery thumbnails
    thumbsCard: { background: '#fff', borderRadius: '12px', padding: '14px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    thumbsTitle: { fontSize: '12px', fontWeight: '700', color: '#7A6055', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    thumbsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' },
    thumb: { width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' },

    actionsCard: { background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 24px rgba(139,26,26,0.08)' },
    interestBtn: { width: '100%', padding: '12px', background: 'linear-gradient(135deg, #8B1A1A, #C0392B)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginBottom: '10px' },
    chatBtn: { width: '100%', padding: '12px', background: 'linear-gradient(135deg, #1565C0, #1976D2)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginBottom: '12px' },
    numberSection: { background: '#F8F9FA', borderRadius: '10px', padding: '14px', marginBottom: '12px' },
    numberTitle: { fontSize: '12px', fontWeight: '700', color: '#7A6055', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' },
    contactBox: { background: '#F0FFF4', border: '1px solid #C3E6CB', borderRadius: '10px', padding: '14px', textAlign: 'center' },
    contactValue: { fontSize: '18px', fontWeight: '700', color: '#1A0A0A', marginBottom: '10px' },
    whatsappBtn: { width: '100%', padding: '10px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    revealBtn: { width: '100%', padding: '12px', background: 'linear-gradient(135deg, #E3AC2A, #C98F12)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13.5px', fontWeight: '700', cursor: 'pointer' },
    lockBox: { background: '#FFF9E6', border: '1px solid #F5E6C0', borderRadius: '10px', padding: '16px', textAlign: 'center' },
    upgradeBtn: { padding: '9px 20px', background: '#C9A84C', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    requestBtn: { width: '100%', padding: '10px', background: '#8B1A1A', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    shortlistBtn: { width: '100%', padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    rightCol: {},
    nameCard: { background: '#fff', borderRadius: '16px', padding: '24px', marginBottom: '16px', boxShadow: '0 4px 24px rgba(139,26,26,0.08)' },
    profileName: { fontFamily: "'Playfair Display', serif", fontSize: '28px', color: '#1A0A0A', marginBottom: '6px' },
    createdByBadge: { display: 'inline-block', fontSize: '12px', fontWeight: '600', color: '#7A5C00', background: '#FFF8E1', border: '1px solid #F5BE17', borderRadius: '20px', padding: '4px 14px', marginBottom: '10px' },
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