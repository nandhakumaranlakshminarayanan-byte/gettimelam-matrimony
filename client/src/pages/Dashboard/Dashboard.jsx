import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import SupportChatWidget from '../../components/Support/SupportChatWidget';
import LoginModal from '../../components/Modals/LoginModal';
import RegisterModal from '../../components/Modals/RegisterModal';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CASTES, getSubCastes, RELIGIONS } from '../../utils/casteData';
import { NAKSHATRA_NAMES, getNakshatraDropdownLabel, getLocalizedNakshatra } from '../../utils/nakshatraData';
import { getLocalizedRasi, RASI_NAMES } from '../../utils/rasiData';
import { STATES_AND_UTS, getDistrictsForState } from '../../utils/indiaLocationData';

const LANGUAGES = ['Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Hindi', 'English', 'Urdu', 'Bengali', 'Marathi'];

const API = 'http://localhost:5000';

const IncomingRequests = () => {
    const [requests, setRequests] = useState([]);
    useEffect(() => { fetchRequests(); }, []);
    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/privacy/incoming`, { headers: { Authorization: `Bearer ${token}` } });
            setRequests(res.data.requests || []);
        } catch (err) { }
    };
    const respond = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API}/api/privacy/${id}/respond`, { status }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success(`Request ${status}!`);
            fetchRequests();
        } catch (err) { toast.error('Failed!'); }
    };
    if (requests.length === 0) return (
        <p style={{ fontSize: '13px', color: '#7A5C00', textAlign: 'center', padding: '12px' }}>No number requests yet</p>
    );
    return (
        <div>
            {requests.map(req => (
                <div key={req._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#fff', borderRadius: '10px', border: '1px solid #F5BE17', marginBottom: '8px' }}>
                    <div>
                        <div style={{ fontWeight: '600', color: '#5F0909', fontSize: '14px' }}>{req.requester?.name || 'Unknown'}</div>
                        <div style={{ fontSize: '12px', color: '#7A5C00' }}>{req.requester?.gender} • {new Date(req.createdAt).toLocaleDateString('en-IN')}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {req.status === 'pending' ? (
                            <>
                                <button style={{ padding: '6px 14px', background: '#E8F5E9', color: '#2E7D32', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }} onClick={() => respond(req._id, 'approved')}>✅ Approve</button>
                                <button style={{ padding: '6px 14px', background: '#FFEBEE', color: '#C62828', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }} onClick={() => respond(req._id, 'rejected')}>❌ Reject</button>
                            </>
                        ) : (
                            <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', background: req.status === 'approved' ? '#E8F5E9' : '#FFEBEE', color: req.status === 'approved' ? '#2E7D32' : '#C62828' }}>
                                {req.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

const NumberViewsList = () => {
    const [views, setViews] = useState([]);
    useEffect(() => { fetchViews(); }, []);
    const fetchViews = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/number-views/received`, { headers: { Authorization: `Bearer ${token}` } });
            setViews(res.data.views || []);
        } catch (err) { }
    };
    if (views.length === 0) return (
        <p style={{ fontSize: '13px', color: '#7A5C00', textAlign: 'center', padding: '12px' }}>No one has viewed your number yet</p>
    );
    return (
        <div>
            {views.map(v => (
                <div key={v._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#fff', borderRadius: '10px', border: '1px solid #F5BE17', marginBottom: '8px' }}>
                    <div>
                        <div style={{ fontWeight: '600', color: '#5F0909', fontSize: '14px' }}>{v.viewer?.name || 'Unknown'}</div>
                        <div style={{ fontSize: '12px', color: '#7A5C00' }}>{v.viewer?.gender}</div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#7A5C00' }}>
                        {new Date(v.createdAt).toLocaleDateString('en-IN')}
                    </div>
                </div>
            ))}
        </div>
    );
};

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState(
        () => new URLSearchParams(window.location.search).get('tab') || 'overview'
    );
    const [shortlistSubTab, setShortlistSubTab] = useState('shortlisted');
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [aadharInput, setAadharInput] = useState('');
    const [aadharSubmitting, setAadharSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [photoUrl, setPhotoUrl] = useState(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [galleryPhotos, setGalleryPhotos] = useState([]);
    const [uploadingGallery, setUploadingGallery] = useState(false);
    const [suggestedMatches, setSuggestedMatches] = useState([]);
    const [shortlistedProfiles, setShortlistedProfiles] = useState([]);
    const [receivedInterests, setReceivedInterests] = useState([]);
    const [numberViewCount, setNumberViewCount] = useState(0);
    const [showSupportChat, setShowSupportChat] = useState(false);
    const [sentInterestIds, setSentInterestIds] = useState([]);
    const [respondingId, setRespondingId] = useState(null);
    const [editingInterestId, setEditingInterestId] = useState(null);
    // Greet with "Welcome" the very first time someone opens their dashboard,
    // then "Welcome back" on every visit after that.
    const [isFirstVisit] = useState(() => {
        if (!user?.id) return false;
        const key = `gettimelam_dashboard_visited_${user.id}`;
        const seen = localStorage.getItem(key);
        if (!seen) {
            localStorage.setItem(key, 'true');
            return true;
        }
        return false;
    });
    const [likedProfiles, setLikedProfiles] = useState([]);
    const [likedMeProfiles, setLikedMeProfiles] = useState([]);

    const [form, setForm] = useState({
        name: '', dateOfBirth: '', height: '', weight: '',
        complexion: '', maritalStatus: 'Never Married',
        religion: 'Hindu', religionOther: '', caste: '', casteOther: '', subCaste: '', subCasteOther: '',
        motherTongue: '', knownLanguages: [],
        rasi: '', nakshatra: '', dosham: 'No',
        education: '', occupation: '', annualIncome: '',
        city: '', district: '', districtOther: '', state: 'Tamil Nadu',
        about: '', fatherOccupation: '', motherOccupation: '',
        siblings: '', familyType: 'Nuclear',
        prefAgeMin: '', prefAgeMax: '', prefHeightMin: '', prefHeightMax: '',
        prefMaritalStatus: '', prefMotherTongue: '', prefEatingHabits: '',
        prefDrinkingHabits: '', prefSmokingHabits: '', prefEducation: '',
        prefOccupation: '', prefAnnualIncome: '', prefReligion: '', prefCaste: '', prefSubCaste: '',
        prefRasi: '', prefNakshatra: '', prefDosham: '',
        prefCountry: 'India', prefState: '', prefCity: '',
    });

    useEffect(() => {
        if (!user) { navigate('/'); return; }
        fetchProfile();
        fetchSuggestedMatches();
        fetchShortlist();
        fetchLikedProfiles();
        fetchLikedMe();
        fetchReceivedInterests();
        fetchSentInterestIds();
        fetchNumberViewCount();
    }, [user]);

    const fetchNumberViewCount = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/number-views/count`, { headers: { Authorization: `Bearer ${token}` } });
            setNumberViewCount(res.data.count || 0);
        } catch (err) { }
    };

    const fetchReceivedInterests = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/interests/received`, { headers: { Authorization: `Bearer ${token}` } });
            setReceivedInterests(res.data.interests || []);
        } catch (err) { setReceivedInterests([]); }
    };

    const fetchSentInterestIds = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/interests/sent`, { headers: { Authorization: `Bearer ${token}` } });
            setSentInterestIds((res.data.interests || []).map(i => i.profile?._id).filter(Boolean));
        } catch (err) { }
    };

    const handleSendInterest = async (profileId, name) => {
        if (sentInterestIds.includes(profileId)) { toast('Interest already sent!', { icon: '💌' }); return; }
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API}/api/interests/send`, { profileId }, { headers: { Authorization: `Bearer ${token}` } });
            setSentInterestIds(prev => [...prev, profileId]);
            toast.success(`Interest sent to ${name}! 💌`);
        } catch (err) {
            if (err.response?.data?.alreadySent) {
                setSentInterestIds(prev => [...prev, profileId]);
                toast('Interest already sent!', { icon: '💌' });
            } else {
                toast.error(err.response?.data?.message || 'Failed to send interest');
            }
        }
    };

    const handleRespondInterest = async (interestId, status) => {
        setRespondingId(interestId);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API}/api/interests/${interestId}/respond`, { status }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success(status === 'accepted' ? 'Interest accepted! 🎉' : 'Interest declined');
            setEditingInterestId(null);
            fetchReceivedInterests();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to respond');
        } finally {
            setRespondingId(null);
        }
    };

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/profiles/my`, { headers: { Authorization: `Bearer ${token}` } });
            setProfile(res.data.profile);
            const fetched = res.data.profile;
            // If a saved Religion/District isn't one of the dropdown's
            // canonical options, it was entered via "Other" — show the
            // select as "Other" with the real value prefilled in the text
            // box, instead of it just not matching any option.
            const religionIsCustom = fetched.religion && !RELIGIONS.includes(fetched.religion);
            const casteIsCustom = fetched.caste && !(CASTES[fetched.religion] || []).includes(fetched.caste);
            const subCasteIsCustom = fetched.subCaste && !getSubCastes(fetched.religion, fetched.caste).includes(fetched.subCaste);
            const districtIsCustom = fetched.district && !getDistrictsForState(fetched.state).includes(fetched.district);
            // First time viewing Partner Preferences, default Religion/Caste/Sub
            // Caste to the member's own values so the form isn't blank — but
            // only ever as a starting point; once they've saved a preference
            // (even an explicit "Doesn't Matter"/"Any"), never overwrite it.
            setForm({
                ...fetched,
                religion: religionIsCustom ? 'Other' : fetched.religion,
                religionOther: religionIsCustom ? fetched.religion : '',
                caste: casteIsCustom ? 'Other' : fetched.caste,
                casteOther: casteIsCustom ? fetched.caste : '',
                subCaste: subCasteIsCustom ? 'Other' : fetched.subCaste,
                subCasteOther: subCasteIsCustom ? fetched.subCaste : '',
                district: districtIsCustom ? 'Other' : fetched.district,
                districtOther: districtIsCustom ? fetched.district : '',
                prefReligion: fetched.prefReligion || fetched.religion || '',
                prefCaste: fetched.prefCaste || fetched.caste || '',
                prefSubCaste: fetched.prefSubCaste || fetched.subCaste || '',
            });
            if (res.data.profile.photo) {
                const photo = res.data.profile.photo;
                setPhotoUrl(photo.startsWith('http') ? photo : `${API}${photo}`);
            }
            setGalleryPhotos(res.data.profile.photos || []);
        } catch (err) { }
    };

    const fetchSuggestedMatches = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/profiles/suggested`, { headers: { Authorization: `Bearer ${token}` } });
            setSuggestedMatches(res.data.profiles || []);
        } catch (err) { setSuggestedMatches([]); }
    };

    const fetchShortlist = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/shortlist/my`, { headers: { Authorization: `Bearer ${token}` } });
            setShortlistedProfiles(res.data.profiles || []);
        } catch (err) { setShortlistedProfiles([]); }
    };

    const fetchLikedProfiles = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/likes/my-likes`, { headers: { Authorization: `Bearer ${token}` } });
            setLikedProfiles(res.data.profiles || []);
        } catch (err) { setLikedProfiles([]); }
    };

    const fetchLikedMe = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/likes/liked-me`, { headers: { Authorization: `Bearer ${token}` } });
            setLikedMeProfiles(res.data.likes || []);
        } catch (err) { setLikedMeProfiles([]); }
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { toast.error('File too large! Max 5MB allowed.'); return; }
        if (!profile) { toast.error('Please create your profile first!'); return; }
        setUploadingPhoto(true);
        const formData = new FormData();
        formData.append('photo', file);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API}/api/profiles/upload-photo`, formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            setPhotoUrl(res.data.fullUrl || `${API}${res.data.photoUrl}`);
            toast.success('Photo uploaded! ✅');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed!');
        } finally { setUploadingPhoto(false); }
    };

    const handleGalleryUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        if (!profile) { toast.error('Create your profile first!'); return; }
        if (galleryPhotos.length + files.length > 15) { toast.error(`You can only upload ${15 - galleryPhotos.length} more photos!`); return; }
        setUploadingGallery(true);
        const formData = new FormData();
        files.forEach(f => formData.append('photos', f));
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API}/api/profiles/upload-photos`, formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            setGalleryPhotos(res.data.photos || []);
            toast.success(`${files.length} photo(s) uploaded! ✅`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed!');
        } finally { setUploadingGallery(false); }
    };

    const handleDeleteGalleryPhoto = async (filename) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API}/api/profiles/photos/${filename}`, { headers: { Authorization: `Bearer ${token}` } });
            setGalleryPhotos(prev => prev.filter(p => !p.includes(filename)));
            toast.success('Photo deleted!');
        } catch (err) { toast.error('Failed to delete!'); }
    };

    const handleSubmitAadhar = async (e) => {
        e.preventDefault();
        const digitsOnly = aadharInput.replace(/\D/g, '');
        if (digitsOnly.length !== 12) { toast.error('Aadhar number must be exactly 12 digits'); return; }
        setAadharSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API}/api/profiles/aadhar`, { aadharNumber: digitsOnly }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Aadhar submitted — pending admin review');
            setAadharInput('');
            fetchProfile();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit Aadhar');
        } finally {
            setAadharSubmitting(false);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!form.caste) { toast.error('Select caste / division'); return; }
        if (form.caste === 'Other' && !form.casteOther?.trim()) { toast.error('Please specify your caste'); return; }
        if (!form.subCaste) { toast.error('Select sub caste'); return; }
        if (form.subCaste === 'Other' && !form.subCasteOther?.trim()) { toast.error('Please specify your sub caste'); return; }
        if (form.religion === 'Other' && !form.religionOther?.trim()) { toast.error('Please specify your religion'); return; }
        if (form.district === 'Other' && !form.districtOther?.trim()) { toast.error('Please specify your district'); return; }
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Where Religion/Caste/Sub Caste/District is "Other", submit the
            // typed text as the real value (not the literal word "Other"),
            // and note which fields were custom-entered so admin can spot
            // them on the Users page.
            const customFields = [
                form.religion === 'Other' && 'religion',
                form.caste === 'Other' && 'caste',
                form.subCaste === 'Other' && 'subCaste',
                form.district === 'Other' && 'district',
            ].filter(Boolean);
            const payload = {
                ...form,
                religion: form.religion === 'Other' ? form.religionOther.trim() : form.religion,
                caste: form.caste === 'Other' ? form.casteOther.trim() : form.caste,
                subCaste: form.subCaste === 'Other' ? form.subCasteOther.trim() : form.subCaste,
                district: form.district === 'Other' ? form.districtOther.trim() : form.district,
                customFields,
            };
            if (profile) {
                await axios.put(`${API}/api/profiles/${profile._id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
                toast.success('Profile updated! ✅');
            } else {
                await axios.post(`${API}/api/profiles`, payload, { headers: { Authorization: `Bearer ${token}` } });
                toast.success('Profile created! 🎊');
            }

            // Let admin know about any "Other" values entered, so they can
            // review and add real options for them (Profile Options page →
            // Pending Suggestions).
            const suggestions = [
                form.religion === 'Other' && { category: 'religion', value: payload.religion, parent: null },
                form.caste === 'Other' && { category: 'caste', value: payload.caste, parent: payload.religion },
                form.subCaste === 'Other' && { category: 'subcaste', value: payload.subCaste, parent: `${payload.religion}|${payload.caste}` },
                form.district === 'Other' && { category: 'district', value: payload.district, parent: form.state },
            ].filter(Boolean);
            for (const s of suggestions) {
                axios.post(`${API}/api/options/suggest`, { ...s, suggestedByName: form.name }, { headers: { Authorization: `Bearer ${token}` } }).catch(() => { });
            }

            setEditing(false);
            fetchProfile();
            fetchSuggestedMatches();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save profile');
        } finally { setLoading(false); }
    };

    const handleTogglePrivacy = async () => {
        if (!profile) { toast.error('Create your profile first!'); return; }
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${API}/api/privacy/toggle-protection`, {}, { headers: { Authorization: `Bearer ${token}` } });
            toast.success(res.data.message);
            fetchProfile();
        } catch (err) { toast.error('Failed to update privacy!'); }
    };

    const tabs = [
        { id: 'overview', label: t('dashboard.overview') },
        { id: 'profile', label: t('dashboard.my_profile') },
        { id: 'interests', label: t('dashboard.interests') },
        { id: 'matches', label: t('dashboard.matches') },
        { id: 'shortlist', label: t('dashboard.shortlist') },
        { id: 'settings', label: t('dashboard.settings') },
    ];

    const completionPct = photoUrl && profile ? '80%' : profile ? '60%' : '20%';

    const ProfileCard = ({ p, showLikerName = false, likerName = '' }) => (
        <div style={styles.matchCard}>
            <div style={styles.matchPhoto}>
                {p?.photo ? (
                    <img src={`${API}${p.photo}`} alt={p.name} style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (p?.gender === 'Female' ? '👩' : '👨')}
            </div>
            <div style={styles.matchInfo}>
                <div style={styles.matchName}>{showLikerName ? likerName : p?.name}</div>
                <div style={styles.matchMeta}>{p?.occupation} • {p?.city}</div>
                <div style={styles.matchMeta}>{p?.religion} • {p?.caste}</div>
            </div>
            <div style={styles.matchActions}>
                <button style={styles.viewBtn} onClick={() => navigate(`/profile/${p?._id}`)}>View</button>
            </div>
        </div>
    );

    return (
        <div style={{ background: '#FFF8E1', minHeight: '100vh' }}>
            <Navbar onLoginClick={() => setShowLogin(true)} onRegisterClick={() => setShowRegister(true)} />

            <div style={styles.container}>
                {/* SIDEBAR */}
                <div style={styles.sidebar}>
                    <div style={styles.userCard}>
                        <div style={styles.avatarContainer}>
                            {photoUrl ? (
                                <img src={photoUrl} alt="Profile" style={styles.avatarImg} />
                            ) : (
                                <div style={styles.avatarEmoji}>{user?.gender === 'Female' ? '👩' : '👨'}</div>
                            )}
                            <label style={{ ...styles.uploadLabel, opacity: uploadingPhoto ? 0.6 : 1 }} htmlFor="photoUpload">
                                {uploadingPhoto ? '⏳ Uploading...' : photoUrl ? '📷 Change Photo' : '📷 Upload Photo'}
                            </label>
                            <input id="photoUpload" type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={handlePhotoUpload} style={{ display: 'none' }} disabled={uploadingPhoto} />
                        </div>
                        <div style={styles.userName}>{profile?.name || user?.name}</div>
                        <div style={styles.userMobile}>{user?.mobile}</div>
                        <div style={{ ...styles.planBadge, background: user?.isPremium ? '#DF9B08' : '#FFF8E1', color: user?.isPremium ? '#fff' : '#7A5C00', border: user?.isPremium ? 'none' : '1px solid #F5BE17' }}>
                            {user?.isPremium ? t('dashboard.premium_member') : t('dashboard.free_member')}
                        </div>
                        <div style={styles.completion}>
                            <div style={styles.completionLabel}>
                                <span>Profile Completion</span>
                                <span style={{ color: '#B71C1C', fontWeight: '700' }}>{completionPct}</span>
                            </div>
                            <div style={styles.progressBar}>
                                <div style={{ ...styles.progressFill, width: completionPct }} />
                            </div>
                        </div>
                    </div>

                    <div style={styles.tabs}>
                        {tabs.map(tab => (
                            <div key={tab.id}
                                style={{ ...styles.tab, ...(activeTab === tab.id ? styles.tabActive : {}) }}
                                onClick={() => setActiveTab(tab.id)}>
                                {tab.label}
                            </div>
                        ))}
                        <div style={{ ...styles.tab, color: '#1565C0' }} onClick={() => setShowSupportChat(true)}>
                            💬 Chat with Support
                        </div>
                        <div style={{ ...styles.tab, color: '#B71C1C' }} onClick={() => { logout(); navigate('/'); }}>
                            🚪 Logout
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div style={styles.main}>

                    {/* OVERVIEW */}
                    {activeTab === 'overview' && (
                        <div>
                            <h2 style={styles.pageTitle}>
                                {t(isFirstVisit ? 'dashboard.welcome_first' : 'dashboard.welcome')}, {profile?.name || user?.name}! 👋
                            </h2>
                            <div style={styles.statsGrid}>
                                {[
                                    { icon: '👁️', label: t('dashboard.profile_views'), value: (profile?.views || 0).toString(), color: '#FFF8E1' },
                                    { icon: '💌', label: t('dashboard.interests_received'), value: receivedInterests.length.toString(), color: '#FFF3E0' },
                                    { icon: '💍', label: t('dashboard.matches_found'), value: suggestedMatches.length.toString(), color: '#F1F8E9' },
                                    { icon: '⭐', label: t('dashboard.shortlisted'), value: shortlistedProfiles.length.toString(), color: '#FFF9E6' },
                                    { icon: '📞', label: 'Number Viewed', value: numberViewCount.toString(), color: '#F3F0FF' },
                                ].map(s => (
                                    <div key={s.label}
                                        style={{ ...styles.statCard, background: s.color, cursor: s.label === 'Number Viewed' ? 'pointer' : 'default' }}
                                        onClick={() => { if (s.label === 'Number Viewed') setActiveTab('settings'); }}>
                                        <div style={styles.statIcon}>{s.icon}</div>
                                        <div style={styles.statValue}>{s.value}</div>
                                        <div style={styles.statLabel}>{s.label}</div>
                                    </div>
                                ))}
                            </div>

                            {!profile && (
                                <div style={styles.alert}>
                                    <div>
                                        <strong>⚠️ Complete Your Profile!</strong>
                                        <p style={{ fontSize: '13px', marginTop: '4px', color: '#7A5C00' }}>Add your details to get better matches.</p>
                                    </div>
                                    <button style={styles.alertBtn} onClick={() => setActiveTab('profile')}>Complete Now →</button>
                                </div>
                            )}

                            {!photoUrl && (
                                <div style={{ ...styles.alert, background: '#FFF3E0', border: '1px solid #F5BE17' }}>
                                    <div>
                                        <strong>📷 Upload Your Photo!</strong>
                                        <p style={{ fontSize: '13px', marginTop: '4px', color: '#7A5C00' }}>
                                            Profiles with photos get 3x more responses.{!profile && ' (Create profile first)'}
                                        </p>
                                    </div>
                                    <label htmlFor="photoUpload" style={{ ...styles.alertBtn, cursor: profile ? 'pointer' : 'not-allowed', opacity: profile ? 1 : 0.5 }}>
                                        Upload Now →
                                    </label>
                                </div>
                            )}

                            {!user?.isPremium && (
                                <div style={styles.upgradeBanner}>
                                    <div>
                                        <h3 style={{ color: '#fff', marginBottom: '4px', fontSize: '18px' }}>⭐ Upgrade to Premium</h3>
                                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>View contact numbers, horoscopes & connect on WhatsApp</p>
                                    </div>
                                    <button style={styles.upgradeBtn} onClick={() => navigate('/plans')}>View Plans →</button>
                                </div>
                            )}

                            <h3 style={styles.sectionTitle}>💍 Suggested Matches</h3>
                            {user?.role === 'member' && !user?.isVerified ? (
                                <div style={styles.verifyLockBox}>
                                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔒</div>
                                    <p style={{ fontWeight: '700', color: '#8B1A1A', marginBottom: '4px' }}>Account Pending Verification</p>
                                    <p style={{ fontSize: '13px', color: '#7A5C00' }}>
                                        Matches unlock once our team verifies your account. We'll call you within 24 hours.
                                    </p>
                                </div>
                            ) : (
                                <div style={styles.matchesGrid}>
                                    {suggestedMatches.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '32px', color: '#7A5C00', background: '#FFF8E1', borderRadius: '12px', border: '1px solid #F5BE17' }}>
                                            <div style={{ fontSize: '40px', marginBottom: '8px' }}>💍</div>
                                            <p style={{ fontWeight: '600', marginBottom: '4px' }}>No matches yet!</p>
                                            <p style={{ fontSize: '13px' }}>Complete your profile to get matched</p>
                                            <button style={{ ...styles.interestBtn, marginTop: '12px' }} onClick={() => setActiveTab('profile')}>Complete Profile →</button>
                                        </div>
                                    ) : (
                                        suggestedMatches.map((m, i) => (
                                            <div key={m._id || i} style={styles.matchCard}>
                                                <div style={styles.matchPhoto}>
                                                    {m.photo ? (
                                                        <img src={`${API}${m.photo}`} alt={m.name} style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover' }} />
                                                    ) : (m.gender === 'Female' ? '👩' : '👨')}
                                                </div>
                                                <div style={styles.matchInfo}>
                                                    <div style={styles.matchName}>{m.name}</div>
                                                    <div style={styles.matchMeta}>{m.occupation} • {m.city}</div>
                                                    <div style={styles.matchMeta}>{m.religion} • {m.caste}</div>
                                                </div>
                                                <div style={styles.matchActions}>
                                                    <button
                                                        style={{ ...styles.interestBtn, opacity: sentInterestIds.includes(m._id) ? 0.6 : 1 }}
                                                        onClick={() => handleSendInterest(m._id, m.name)}
                                                        disabled={sentInterestIds.includes(m._id)}>
                                                        {sentInterestIds.includes(m._id) ? '✅ Sent' : '💌 Interest'}
                                                    </button>
                                                    <button style={styles.viewBtn} onClick={() => navigate(`/profile/${m._id}`)}>View</button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div>
                            <div style={styles.profileHeader}>
                                <h2 style={styles.pageTitle}>👤 My Profile</h2>
                                <button style={styles.editBtn} onClick={() => setEditing(!editing)}>
                                    {editing ? '✕ Cancel' : '✏️ Edit Profile'}
                                </button>
                            </div>

                            {/* Aadhar verification status — same gate that unlocks admin
                                verifying the whole profile, so it's surfaced right up top. */}
                            <div style={styles.aadharBox}>
                                {(!profile?.aadharStatus || profile.aadharStatus === 'not_submitted') && (
                                    <>
                                        <div style={styles.aadharTitle}>🪪 Aadhar Verification Needed</div>
                                        <p style={styles.aadharDesc}>Submit your Aadhar number so admin can verify your profile — this unlocks full visibility to other members.</p>
                                        <form onSubmit={handleSubmitAadhar} style={styles.aadharForm}>
                                            <input style={styles.aadharInput} placeholder="12-digit Aadhar number" maxLength={12}
                                                value={aadharInput} onChange={e => setAadharInput(e.target.value.replace(/\D/g, ''))} />
                                            <button type="submit" style={styles.aadharBtn} disabled={aadharSubmitting}>
                                                {aadharSubmitting ? 'Submitting...' : 'Submit'}
                                            </button>
                                        </form>
                                    </>
                                )}
                                {profile?.aadharStatus === 'pending' && (
                                    <div style={{ ...styles.aadharTitle, color: '#7A5C00' }}>⏳ Aadhar submitted — pending admin review</div>
                                )}
                                {profile?.aadharStatus === 'approved' && (
                                    <div style={{ ...styles.aadharTitle, color: '#2E7D32' }}>✅ Aadhar verified</div>
                                )}
                                {profile?.aadharStatus === 'rejected' && (
                                    <>
                                        <div style={{ ...styles.aadharTitle, color: '#B71C1C' }}>❌ Aadhar rejected{profile.aadharRejectReason ? ` — ${profile.aadharRejectReason}` : ''}</div>
                                        <p style={styles.aadharDesc}>Please double-check the number and resubmit.</p>
                                        <form onSubmit={handleSubmitAadhar} style={styles.aadharForm}>
                                            <input style={styles.aadharInput} placeholder="12-digit Aadhar number" maxLength={12}
                                                value={aadharInput} onChange={e => setAadharInput(e.target.value.replace(/\D/g, ''))} />
                                            <button type="submit" style={styles.aadharBtn} disabled={aadharSubmitting}>
                                                {aadharSubmitting ? 'Submitting...' : 'Resubmit'}
                                            </button>
                                        </form>
                                    </>
                                )}
                            </div>

                            {editing ? (
                                <form onSubmit={handleSaveProfile}>
                                    {[
                                        {
                                            title: 'Personal Details', fields: [
                                                { name: 'height', label: 'Height', type: 'select', options: ["4'6\"", "4'8\"", "4'10\"", "5'0\"", "5'2\"", "5'4\"", "5'6\"", "5'8\"", "5'10\"", "6'0\"", "6'2\""] },
                                                { name: 'complexion', label: 'Complexion', type: 'select', options: ['Fair', 'Very Fair', 'Wheatish', 'Dark'] },
                                                { name: 'maritalStatus', label: 'Marital Status', type: 'select', options: ['Never Married', 'Divorced', 'Widowed', 'Separated'] },
                                                { name: 'familyType', label: 'Family Type', type: 'select', options: ['Nuclear', 'Joint'] },
                                            ]
                                        },
                                    ].map(section => (
                                        <div key={section.title} style={styles.formSection}>
                                            <h3 style={styles.formSectionTitle}>{section.title}</h3>
                                            <div style={styles.formGrid}>
                                                {section.fields.map(f => (
                                                    <div key={f.name} style={styles.formGroup}>
                                                        <label style={styles.label}>{f.label}</label>
                                                        {f.type === 'select' ? (
                                                            <select name={f.name} value={form[f.name]} onChange={handleChange} style={styles.input}>
                                                                <option value="">Select</option>
                                                                {f.options.map(o => <option key={o} value={o}>{f.getLabel ? f.getLabel(o) : o}</option>)}
                                                            </select>
                                                        ) : (
                                                            <input name={f.name} type="text" placeholder={f.placeholder}
                                                                value={form[f.name]} onChange={handleChange} style={styles.input} />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Hand-coded so Caste and Sub Caste can cascade off Religion -- moved
                                        up next to Personal Details (was previously buried below every
                                        Partner Preference section, which made it look missing) so members
                                        can find and correct their own Religion/Caste/Sub Caste easily. */}
                                    <div style={styles.formSection}>
                                        <h3 style={styles.formSectionTitle}>Religious Details</h3>
                                        <div style={styles.formGrid}>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Religion</label>
                                                <select name="religion" value={form.religion}
                                                    onChange={e => setForm({ ...form, religion: e.target.value, religionOther: '', caste: '', subCaste: '' })}
                                                    style={styles.input}>
                                                    <option value="">Select</option>
                                                    {Object.keys(CASTES).map(r => <option key={r}>{r}</option>)}
                                                </select>
                                                {form.religion === 'Other' && (
                                                    <input name="religionOther" value={form.religionOther} onChange={handleChange}
                                                        placeholder="Please specify your religion" style={{ ...styles.input, marginTop: '8px' }} />
                                                )}
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Caste / Division</label>
                                                <select name="caste" value={form.caste}
                                                    onChange={e => setForm({ ...form, caste: e.target.value, casteOther: '', subCaste: '', subCasteOther: '' })}
                                                    style={styles.input} disabled={!form.religion}>
                                                    <option value="">{form.religion ? 'Select Caste' : 'Select religion first'}</option>
                                                    {(CASTES[form.religion] || []).map(c => <option key={c}>{c}</option>)}
                                                </select>
                                                {form.caste === 'Other' && (
                                                    <input name="casteOther" value={form.casteOther} onChange={handleChange}
                                                        placeholder="Please specify your caste" style={{ ...styles.input, marginTop: '8px' }} />
                                                )}
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Sub Caste</label>
                                                <select name="subCaste" value={form.subCaste}
                                                    onChange={e => setForm({ ...form, subCaste: e.target.value, subCasteOther: '' })}
                                                    style={styles.input} disabled={!form.caste}>
                                                    <option value="">{form.caste ? 'Select Sub Caste' : 'Select caste first'}</option>
                                                    {getSubCastes(form.religion, form.caste).map(sc => <option key={sc}>{sc}</option>)}
                                                </select>
                                                {form.subCaste === 'Other' && (
                                                    <input name="subCasteOther" value={form.subCasteOther} onChange={handleChange}
                                                        placeholder="Please specify your sub caste" style={{ ...styles.input, marginTop: '8px' }} />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hand-coded (not the generic field renderer) because Known
                                        Languages is a multi-select checkbox group, not a plain select. */}
                                    <div style={styles.formSection}>
                                        <h3 style={styles.formSectionTitle}>Language Details</h3>
                                        <div style={styles.formGrid}>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Mother Tongue</label>
                                                <select name="motherTongue" value={form.motherTongue} onChange={handleChange} style={styles.input}>
                                                    <option value="">Select</option>
                                                    {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                                                </select>
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Known Languages</label>
                                                <div style={styles.langPillRow}>
                                                    {LANGUAGES.map(l => {
                                                        const active = (form.knownLanguages || []).includes(l);
                                                        return (
                                                            <button type="button" key={l}
                                                                onClick={() => {
                                                                    const current = form.knownLanguages || [];
                                                                    setForm({
                                                                        ...form,
                                                                        knownLanguages: active ? current.filter(x => x !== l) : [...current, l],
                                                                    });
                                                                }}
                                                                style={active ? styles.langPillActive : styles.langPill}>
                                                                {l}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {[
                                        {
                                            title: 'Astro Details', fields: [
                                                { name: 'rasi', label: 'Rasi', type: 'select', options: ['Mesham', 'Rishabam', 'Mithunam', 'Kadagam', 'Simmam', 'Kanni', 'Thulam', 'Viruchigam', 'Dhanusu', 'Magaram', 'Kumbam', 'Meenam'] },
                                                { name: 'nakshatra', label: 'Nakshatra', type: 'select', options: NAKSHATRA_NAMES, getLabel: getNakshatraDropdownLabel },
                                                { name: 'dosham', label: 'Dosham', type: 'select', options: ['No', 'Yes', "Doesn't Matter"] },
                                            ]
                                        },
                                        {
                                            title: 'Education & Career', fields: [
                                                { name: 'education', label: 'Education', type: 'text', placeholder: 'e.g. B.Tech, MBA' },
                                                { name: 'occupation', label: 'Occupation', type: 'text', placeholder: 'e.g. Software Engineer' },
                                                { name: 'annualIncome', label: 'Annual Income', type: 'select', options: ['Below 1 Lakh', '1-2 Lakhs', '2-5 Lakhs', '5-10 Lakhs', '10-20 Lakhs', '20+ Lakhs'] },
                                            ]
                                        },
                                    ].map(section => (
                                        <div key={section.title} style={styles.formSection}>
                                            <h3 style={styles.formSectionTitle}>{section.title}</h3>
                                            <div style={styles.formGrid}>
                                                {section.fields.map(f => (
                                                    <div key={f.name} style={styles.formGroup}>
                                                        <label style={styles.label}>{f.label}</label>
                                                        {f.type === 'select' ? (
                                                            <select name={f.name} value={form[f.name]} onChange={handleChange} style={styles.input}>
                                                                <option value="">Select</option>
                                                                {f.options.map(o => <option key={o} value={o}>{f.getLabel ? f.getLabel(o) : o}</option>)}
                                                            </select>
                                                        ) : (
                                                            <input name={f.name} type="text" placeholder={f.placeholder}
                                                                value={form[f.name]} onChange={handleChange} style={styles.input} />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Hand-coded so District can show an "Other" text box, same
                                        pattern as Religion above. */}
                                    <div style={styles.formSection}>
                                        <h3 style={styles.formSectionTitle}>Location</h3>
                                        <div style={styles.formGrid}>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>City</label>
                                                <input name="city" type="text" placeholder="Enter city"
                                                    value={form.city} onChange={handleChange} style={styles.input} />
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>State / UT</label>
                                                <select name="state" value={form.state}
                                                    onChange={e => setForm({ ...form, state: e.target.value, district: '', districtOther: '' })}
                                                    style={styles.input}>
                                                    <option value="">Select State</option>
                                                    {STATES_AND_UTS.map(s => <option key={s}>{s}</option>)}
                                                </select>
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>District</label>
                                                <select name="district" value={form.district}
                                                    onChange={e => setForm({ ...form, district: e.target.value, districtOther: '' })}
                                                    style={styles.input} disabled={!form.state}>
                                                    <option value="">{form.state ? 'Select District' : 'Select state first'}</option>
                                                    {[...getDistrictsForState(form.state), 'Other'].map(d => <option key={d}>{d}</option>)}
                                                </select>
                                                {form.district === 'Other' && (
                                                    <input name="districtOther" value={form.districtOther} onChange={handleChange}
                                                        placeholder="Please specify your district" style={{ ...styles.input, marginTop: '8px' }} />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {[
                                        {
                                            title: 'Family Details', fields: [
                                                { name: 'fatherOccupation', label: "Father's Occupation", type: 'text', placeholder: "Father's occupation" },
                                                { name: 'motherOccupation', label: "Mother's Occupation", type: 'text', placeholder: "Mother's occupation" },
                                                { name: 'siblings', label: 'Siblings', type: 'text', placeholder: 'e.g. 1 Brother, 1 Sister' },
                                            ]
                                        },
                                        {
                                            title: '💕 Partner Preferences — Basic', fields: [
                                                { name: 'prefAgeMin', label: 'Min Age', type: 'text', placeholder: 'e.g. 25' },
                                                { name: 'prefAgeMax', label: 'Max Age', type: 'text', placeholder: 'e.g. 32' },
                                                { name: 'prefHeightMin', label: 'Min Height', type: 'select', options: ["4'6\"", "4'8\"", "4'10\"", "5'0\"", "5'2\"", "5'4\"", "5'6\"", "5'8\"", "5'10\"", "6'0\"", "6'2\""] },
                                                { name: 'prefHeightMax', label: 'Max Height', type: 'select', options: ["4'6\"", "4'8\"", "4'10\"", "5'0\"", "5'2\"", "5'4\"", "5'6\"", "5'8\"", "5'10\"", "6'0\"", "6'2\""] },
                                                { name: 'prefMaritalStatus', label: 'Marital Status', type: 'select', options: ['Never Married', 'Divorced', 'Widowed', "Doesn't Matter"] },
                                                { name: 'prefMotherTongue', label: 'Mother Tongue', type: 'text', placeholder: 'e.g. Tamil' },
                                                { name: 'prefEatingHabits', label: 'Eating Habits', type: 'select', options: ['Vegetarian', 'Non-Vegetarian', 'Eggetarian', "Doesn't Matter"] },
                                                { name: 'prefDrinkingHabits', label: 'Drinking Habits', type: 'select', options: ['Never Drinks', 'Occasionally', "Doesn't Matter"] },
                                                { name: 'prefSmokingHabits', label: 'Smoking Habits', type: 'select', options: ['Never Smokes', 'Occasionally', "Doesn't Matter"] },
                                            ]
                                        },
                                        {
                                            title: '💼 Partner Preferences — Professional', fields: [
                                                { name: 'prefEducation', label: 'Education', type: 'text', placeholder: 'e.g. Any Engineering' },
                                                { name: 'prefOccupation', label: 'Occupation', type: 'text', placeholder: 'Any occupation' },
                                                { name: 'prefAnnualIncome', label: 'Annual Income', type: 'select', options: ['Any', 'Below 1 Lakh', '1-2 Lakhs', '2-5 Lakhs', '5-10 Lakhs', '10-20 Lakhs', '20+ Lakhs'] },
                                            ]
                                        },
                                        {
                                            title: '📍 Partner Preferences — Location', fields: [
                                                { name: 'prefCountry', label: 'Country', type: 'text', placeholder: 'India' },
                                                { name: 'prefState', label: 'State', type: 'text', placeholder: 'e.g. Tamil Nadu' },
                                                { name: 'prefCity', label: 'City', type: 'text', placeholder: 'Any, or specific city' },
                                            ]
                                        },
                                    ].map(section => (
                                        <div key={section.title} style={styles.formSection}>
                                            <h3 style={styles.formSectionTitle}>{section.title}</h3>
                                            <div style={styles.formGrid}>
                                                {section.fields.map(f => (
                                                    <div key={f.name} style={styles.formGroup}>
                                                        <label style={styles.label}>{f.label}</label>
                                                        {f.type === 'select' ? (
                                                            <select name={f.name} value={form[f.name]} onChange={handleChange} style={styles.input}>
                                                                <option value="">Select</option>
                                                                {f.options.map(o => <option key={o} value={o}>{f.getLabel ? f.getLabel(o) : o}</option>)}
                                                            </select>
                                                        ) : (
                                                            <input name={f.name} type="text" placeholder={f.placeholder}
                                                                value={form[f.name]} onChange={handleChange} style={styles.input} />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Hand-coded so Caste and Sub Caste can cascade off Religion — same
                                        pattern as the member's own Religious Details near the top of the
                                        form, but with "Doesn't Matter" / "Any" fallbacks since this is a
                                        preference, not a fact about the member. */}
                                    <div style={styles.formSection}>
                                        <h3 style={styles.formSectionTitle}>🕉️ Partner Preferences — Religious</h3>
                                        <div style={styles.formGrid}>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Religion</label>
                                                <select name="prefReligion" value={form.prefReligion}
                                                    onChange={e => setForm({ ...form, prefReligion: e.target.value, prefCaste: '', prefSubCaste: '' })}
                                                    style={styles.input}>
                                                    <option value="">Select</option>
                                                    <option value="Doesn't Matter">Doesn't Matter</option>
                                                    {Object.keys(CASTES).map(r => <option key={r}>{r}</option>)}
                                                </select>
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Caste / Division</label>
                                                <select name="prefCaste" value={form.prefCaste}
                                                    onChange={e => setForm({ ...form, prefCaste: e.target.value, prefSubCaste: '' })}
                                                    style={styles.input} disabled={!form.prefReligion || form.prefReligion === "Doesn't Matter"}>
                                                    <option value="">{!form.prefReligion ? 'Select religion first' : form.prefReligion === "Doesn't Matter" ? 'Any' : 'Select Caste'}</option>
                                                    <option value="Any">Any</option>
                                                    {(CASTES[form.prefReligion] || []).map(c => <option key={c}>{c}</option>)}
                                                </select>
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Sub Caste</label>
                                                <select name="prefSubCaste" value={form.prefSubCaste} onChange={handleChange}
                                                    style={styles.input} disabled={!form.prefCaste || form.prefCaste === 'Any'}>
                                                    <option value="">{!form.prefCaste ? 'Select caste first' : form.prefCaste === 'Any' ? 'Any' : 'Select Sub Caste'}</option>
                                                    <option value="Any">Any</option>
                                                    {getSubCastes(form.prefReligion, form.prefCaste).map(sc => <option key={sc}>{sc}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Star/Zodiac/Dosham matching is a standard part of Indian
                                        matrimony matching, same idea as the Religious block above —
                                        "Doesn't Matter" fallback since it's a preference. */}
                                    <div style={styles.formSection}>
                                        <h3 style={styles.formSectionTitle}>✨ Partner Preferences — Astro</h3>
                                        <div style={styles.formGrid}>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Rasi (Zodiac)</label>
                                                <select name="prefRasi" value={form.prefRasi} onChange={handleChange} style={styles.input}>
                                                    <option value="">Select</option>
                                                    <option value="Doesn't Matter">Doesn't Matter</option>
                                                    {RASI_NAMES.map(r => <option key={r} value={r}>{r}</option>)}
                                                </select>
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Nakshatra (Star)</label>
                                                <select name="prefNakshatra" value={form.prefNakshatra} onChange={handleChange} style={styles.input}>
                                                    <option value="">Select</option>
                                                    <option value="Doesn't Matter">Doesn't Matter</option>
                                                    {NAKSHATRA_NAMES.map(n => <option key={n} value={n}>{getNakshatraDropdownLabel(n)}</option>)}
                                                </select>
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Dosham</label>
                                                <select name="prefDosham" value={form.prefDosham} onChange={handleChange} style={styles.input}>
                                                    <option value="">Select</option>
                                                    <option value="No">No</option>
                                                    <option value="Yes">Yes</option>
                                                    <option value="Doesn't Matter">Doesn't Matter</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                                                        <div style={styles.formSection}>
                                        <h3 style={styles.formSectionTitle}>About Me</h3>
                                        <textarea name="about" placeholder="Write something about yourself..."
                                            value={form.about} onChange={handleChange} rows={4}
                                            style={{ ...styles.input, resize: 'vertical' }} />
                                    </div>

                                    <button type="submit" style={{ ...styles.saveBtn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
                                        {loading ? '⏳ Saving...' : '💾 Save Profile'}
                                    </button>
                                </form>
                            ) : (
                                <div>
                                    {profile ? (
                                        <>
                                            <div style={styles.profileView}>
                                                {[
                                                    { label: 'Height', value: profile.height },
                                                    { label: 'Complexion', value: profile.complexion },
                                                    { label: 'Marital Status', value: profile.maritalStatus },
                                                    { label: 'Mother Tongue', value: profile.motherTongue },
                                                    { label: 'Known Languages', value: (profile.knownLanguages || []).join(', ') },
                                                    { label: 'Religion', value: profile.religion },
                                                    { label: 'Caste', value: profile.caste },
                                                    { label: 'Sub Caste', value: profile.subCaste },
                                                    { label: 'Rasi', value: getLocalizedRasi(profile.rasi, profile.motherTongue) },
                                                    { label: 'Nakshatra', value: getLocalizedNakshatra(profile.nakshatra, profile.motherTongue) },
                                                    { label: 'Dosham', value: profile.dosham },
                                                    { label: 'Education', value: profile.education },
                                                    { label: 'Occupation', value: profile.occupation },
                                                    { label: 'Annual Income', value: profile.annualIncome },
                                                    { label: 'City', value: profile.city },
                                                    { label: 'District', value: profile.district },
                                                    { label: 'State', value: profile.state },
                                                    { label: 'Family Type', value: profile.familyType },
                                                ].filter(i => i.value).map(item => (
                                                    <div key={item.label} style={styles.profileField}>
                                                        <span style={styles.fieldLabel}>{item.label}</span>
                                                        <span style={styles.fieldValue}>{item.value}</span>
                                                    </div>
                                                ))}
                                                {profile.about && (
                                                    <div style={styles.aboutSection}>
                                                        <h4 style={styles.fieldLabel}>About Me</h4>
                                                        <p style={styles.aboutText}>{profile.about}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Partner Preferences — read-only summary */}
                                            {[
                                                profile.prefAgeMin, profile.prefHeightMin, profile.prefMaritalStatus,
                                                profile.prefEducation, profile.prefReligion, profile.prefCity,
                                            ].some(Boolean) && (
                                                <div style={styles.profileView}>
                                                    <h3 style={{ ...styles.fieldLabel, fontSize: '15px', marginBottom: '10px', gridColumn: '1/-1' }}>
                                                        💕 Partner Preferences
                                                    </h3>
                                                    {[
                                                        { label: 'Age Range', value: (profile.prefAgeMin || profile.prefAgeMax) ? `${profile.prefAgeMin || 'Any'} - ${profile.prefAgeMax || 'Any'} Yrs` : null },
                                                        { label: 'Height Range', value: (profile.prefHeightMin || profile.prefHeightMax) ? `${profile.prefHeightMin || 'Any'} - ${profile.prefHeightMax || 'Any'}` : null },
                                                        { label: 'Marital Status', value: profile.prefMaritalStatus },
                                                        { label: 'Mother Tongue', value: profile.prefMotherTongue },
                                                        { label: 'Eating Habits', value: profile.prefEatingHabits },
                                                        { label: 'Drinking Habits', value: profile.prefDrinkingHabits },
                                                        { label: 'Smoking Habits', value: profile.prefSmokingHabits },
                                                        { label: 'Education', value: profile.prefEducation },
                                                        { label: 'Occupation', value: profile.prefOccupation },
                                                        { label: 'Annual Income', value: profile.prefAnnualIncome },
                                                        { label: 'Religion', value: profile.prefReligion },
                                                        { label: 'Caste', value: profile.prefCaste },
                                                        { label: 'Sub Caste', value: profile.prefSubCaste },
                                                        { label: 'Rasi', value: profile.prefRasi },
                                                        { label: 'Nakshatra', value: profile.prefNakshatra },
                                                        { label: 'Dosham', value: profile.prefDosham },
                                                        { label: 'Location', value: [profile.prefCity, profile.prefState, profile.prefCountry].filter(Boolean).join(', ') },
                                                    ].filter(i => i.value).map(item => (
                                                        <div key={item.label} style={styles.profileField}>
                                                            <span style={styles.fieldLabel}>{item.label}</span>
                                                            <span style={styles.fieldValue}>{item.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Gallery Section */}
                                            <div style={styles.gallerySection}>
                                                <div style={styles.galleryHeader}>
                                                    <h3 style={styles.galleryTitle}>📸 My Photos ({galleryPhotos.length}/15)</h3>
                                                    {galleryPhotos.length < 15 && (
                                                        <label style={styles.editBtn} htmlFor="galleryUpload">
                                                            {uploadingGallery ? '⏳ Uploading...' : '➕ Add Photos'}
                                                        </label>
                                                    )}
                                                    <input id="galleryUpload" type="file" multiple accept="image/*"
                                                        style={{ display: 'none' }} onChange={handleGalleryUpload} disabled={uploadingGallery} />
                                                </div>
                                                {galleryPhotos.length === 0 ? (
                                                    <div style={styles.galleryEmpty}>
                                                        <div style={{ fontSize: '40px', marginBottom: '8px' }}>📷</div>
                                                        <p style={{ color: '#7A5C00', fontSize: '14px', marginBottom: '12px' }}>No photos yet. Add up to 15 photos!</p>
                                                        <label htmlFor="galleryUpload" style={{ ...styles.saveBtn, cursor: 'pointer', fontSize: '13px', padding: '10px 20px' }}>
                                                            Upload Photos
                                                        </label>
                                                    </div>
                                                ) : (
                                                    <div style={styles.galleryGrid}>
                                                        {galleryPhotos.map((photo, i) => {
                                                            const filename = photo.split('/').pop();
                                                            return (
                                                                <div key={i} style={styles.galleryItem}>
                                                                    <img src={`${API}${photo}`} alt={`Photo ${i + 1}`} style={styles.galleryImg} />
                                                                    <button onClick={() => handleDeleteGalleryPhoto(filename)} style={styles.galleryDeleteBtn}>✕</button>
                                                                </div>
                                                            );
                                                        })}
                                                        {galleryPhotos.length < 15 && (
                                                            <label htmlFor="galleryUpload" style={styles.galleryAddMore}>
                                                                <span style={{ fontSize: '28px' }}>➕</span>
                                                                <span style={{ fontSize: '11px', color: '#7A5C00', marginTop: '4px' }}>Add More</span>
                                                            </label>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div style={styles.emptyProfile}>
                                            <div style={{ fontSize: '60px', marginBottom: '16px' }}>👤</div>
                                            <h3>No Profile Yet!</h3>
                                            <p style={{ color: '#7A5C00', marginBottom: '20px' }}>Complete your profile to get better matches</p>
                                            <button style={styles.saveBtn} onClick={() => setEditing(true)}>✏️ Create Profile Now</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* INTERESTS TAB */}
                    {activeTab === 'interests' && (
                        <div>
                            <h2 style={styles.pageTitle}>💌 Interests Received ({receivedInterests.length})</h2>
                            {receivedInterests.length === 0 ? (
                                <div style={styles.emptyProfile}>
                                    <div style={{ fontSize: '60px', marginBottom: '16px' }}>💌</div>
                                    <h3>No Interests Yet!</h3>
                                    <p style={{ color: '#7A5C00', marginBottom: '20px' }}>When someone sends you interest, it'll show up here</p>
                                    <button style={styles.saveBtn} onClick={() => navigate('/browse')}>Browse Profiles →</button>
                                </div>
                            ) : (
                                <div style={styles.matchesGrid}>
                                    {receivedInterests.map(intr => {
                                        const senderProfile = intr.senderProfile;
                                        const senderName = intr.sender?.name || senderProfile?.name || 'A member';
                                        return (
                                            <div key={intr._id} style={styles.matchCard}>
                                                <div style={styles.matchPhoto}>
                                                    {senderProfile?.photo ? (
                                                        <img src={`${API}${senderProfile.photo}`} alt={senderName}
                                                            style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover' }} />
                                                    ) : (intr.sender?.gender === 'Female' ? '👩' : '👨')}
                                                </div>
                                                <div style={styles.matchInfo}>
                                                    <div style={styles.matchName}>{senderName}</div>
                                                    <div style={styles.matchMeta}>
                                                        {new Date(intr.createdAt).toLocaleDateString('en-IN')}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                                        <span style={{
                                                            display: 'inline-block', fontSize: '11px', fontWeight: '700',
                                                            padding: '2px 10px', borderRadius: '999px',
                                                            background: intr.status === 'accepted' ? '#E8F5E9' : intr.status === 'declined' ? '#FFEBEE' : '#FFF8E1',
                                                            color: intr.status === 'accepted' ? '#2E7D32' : intr.status === 'declined' ? '#C62828' : '#8B6914',
                                                        }}>
                                                            {intr.status === 'accepted' ? '✅ Accepted' : intr.status === 'declined' ? '❌ Declined' : '⏳ Pending'}
                                                        </span>
                                                        {intr.status !== 'pending' && editingInterestId !== intr._id && (
                                                            <span style={styles.changeDecisionLink}
                                                                onClick={() => setEditingInterestId(intr._id)}>
                                                                ✎ Change decision
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div style={styles.matchActions}>
                                                    {(intr.status === 'pending' || editingInterestId === intr._id) ? (
                                                        <>
                                                            {intr.status !== 'accepted' && (
                                                                <button
                                                                    style={{ ...styles.interestBtn, background: '#2E7D32' }}
                                                                    disabled={respondingId === intr._id}
                                                                    onClick={() => handleRespondInterest(intr._id, 'accepted')}>
                                                                    {respondingId === intr._id ? '⏳' : '✓ Accept'}
                                                                </button>
                                                            )}
                                                            {intr.status !== 'declined' && (
                                                                <button
                                                                    style={{ ...styles.viewBtn, color: '#C62828', borderColor: '#C62828' }}
                                                                    disabled={respondingId === intr._id}
                                                                    onClick={() => handleRespondInterest(intr._id, 'declined')}>
                                                                    Decline
                                                                </button>
                                                            )}
                                                            {editingInterestId === intr._id && (
                                                                <button
                                                                    style={{ ...styles.viewBtn, color: '#7A5C00', borderColor: '#E0D0B0' }}
                                                                    onClick={() => setEditingInterestId(null)}>
                                                                    Cancel
                                                                </button>
                                                            )}
                                                        </>
                                                    ) : (
                                                        senderProfile?._id && (
                                                            <button style={styles.viewBtn} onClick={() => navigate(`/profile/${senderProfile._id}`)}>
                                                                View Profile
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* MATCHES TAB */}
                    {activeTab === 'matches' && (
                        <div>
                            <h2 style={styles.pageTitle}>💍 Your Matches</h2>
                            {user?.role === 'member' && !user?.isVerified ? (
                                <div style={styles.verifyLockBox}>
                                    <div style={{ fontSize: '46px', marginBottom: '12px' }}>🔒</div>
                                    <h3 style={{ color: '#8B1A1A', marginBottom: '6px' }}>Account Pending Verification</h3>
                                    <p style={{ fontSize: '13px', color: '#7A5C00' }}>
                                        Our team will call you within 24 hours to verify your account.<br />
                                        Matches unlock right after that.
                                    </p>
                                </div>
                            ) : suggestedMatches.length === 0 ? (
                                <div style={styles.emptyProfile}>
                                    <div style={{ fontSize: '60px', marginBottom: '16px' }}>💍</div>
                                    <h3>Complete your profile to see matches!</h3>
                                    <p style={{ color: '#7A5C00', marginBottom: '20px' }}>The more details you add, the better your matches</p>
                                    <button style={styles.saveBtn} onClick={() => setActiveTab('profile')}>Complete Profile →</button>
                                </div>
                            ) : (
                                <div style={styles.matchesGrid}>
                                    {suggestedMatches.map((m, i) => (
                                        <div key={m._id || i} style={styles.matchCard}>
                                            <div style={styles.matchPhoto}>
                                                {m.photo ? (
                                                    <img src={`${API}${m.photo}`} alt={m.name} style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover' }} />
                                                ) : (m.gender === 'Female' ? '👩' : '👨')}
                                            </div>
                                            <div style={styles.matchInfo}>
                                                <div style={styles.matchName}>{m.name}</div>
                                                <div style={styles.matchMeta}>{m.occupation} • {m.city}</div>
                                                <div style={styles.matchMeta}>{m.religion} • {m.caste}</div>
                                            </div>
                                            <div style={styles.matchActions}>
                                                <button
                                                    style={{ ...styles.interestBtn, opacity: sentInterestIds.includes(m._id) ? 0.6 : 1 }}
                                                    onClick={() => handleSendInterest(m._id, m.name)}
                                                    disabled={sentInterestIds.includes(m._id)}>
                                                    {sentInterestIds.includes(m._id) ? '✅ Sent' : '💌 Interest'}
                                                </button>
                                                <button style={styles.viewBtn} onClick={() => navigate(`/profile/${m._id}`)}>View</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* SHORTLIST TAB */}
                    {activeTab === 'shortlist' && (
                        <div>
                            <h2 style={styles.pageTitle}>⭐ Shortlist & Likes</h2>
                            <div style={styles.subTabRow}>
                                {[
                                    { id: 'shortlisted', label: `⭐ Shortlisted (${shortlistedProfiles.length})` },
                                    { id: 'liked', label: `👍 Profiles I Liked (${likedProfiles.length})` },
                                    { id: 'liked-me', label: `👍 Liked Me (${likedMeProfiles.length})` },
                                ].map(sub => (
                                    <button key={sub.id}
                                        style={{ ...styles.subTabBtn, ...(shortlistSubTab === sub.id ? styles.subTabActive : {}) }}
                                        onClick={() => setShortlistSubTab(sub.id)}>
                                        {sub.label}
                                    </button>
                                ))}
                            </div>

                            {shortlistSubTab === 'shortlisted' && (
                                shortlistedProfiles.length === 0 ? (
                                    <div style={styles.emptyProfile}>
                                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>⭐</div>
                                        <h3>No Shortlisted Profiles!</h3>
                                        <p style={{ color: '#7A5C00', marginBottom: '16px' }}>Browse profiles and click ❤️ to shortlist</p>
                                        <button style={styles.saveBtn} onClick={() => navigate('/browse')}>Browse Profiles →</button>
                                    </div>
                                ) : (
                                    <div style={styles.matchesGrid}>
                                        {shortlistedProfiles.map((p, i) => <ProfileCard key={p._id || i} p={p} />)}
                                    </div>
                                )
                            )}

                            {shortlistSubTab === 'liked' && (
                                likedProfiles.length === 0 ? (
                                    <div style={styles.emptyProfile}>
                                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>👍</div>
                                        <h3>No Liked Profiles!</h3>
                                        <p style={{ color: '#7A5C00', marginBottom: '16px' }}>Browse profiles and click 👍 Like to save them here</p>
                                        <button style={styles.saveBtn} onClick={() => navigate('/browse')}>Browse Profiles →</button>
                                    </div>
                                ) : (
                                    <div style={styles.matchesGrid}>
                                        {likedProfiles.map((p, i) => <ProfileCard key={p._id || i} p={p} />)}
                                    </div>
                                )
                            )}

                            {shortlistSubTab === 'liked-me' && (
                                likedMeProfiles.length === 0 ? (
                                    <div style={styles.emptyProfile}>
                                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>👍</div>
                                        <h3>No one liked your profile yet!</h3>
                                        <p style={{ color: '#7A5C00', marginBottom: '16px' }}>Complete your profile to attract more likes</p>
                                        <button style={styles.saveBtn} onClick={() => setActiveTab('profile')}>Complete Profile →</button>
                                    </div>
                                ) : (
                                    <div style={styles.matchesGrid}>
                                        {likedMeProfiles.map((like, i) => (
                                            <ProfileCard key={like._id || i} p={like.profile} showLikerName={true} likerName={like.liker?.name || 'Unknown'} />
                                        ))}
                                    </div>
                                )
                            )}
                        </div>
                    )}

                    {/* SETTINGS TAB */}
                    {activeTab === 'settings' && (
                        <div>
                            <h2 style={styles.pageTitle}>⚙️ Settings</h2>
                            <div style={styles.formSection}>
                                <h3 style={styles.formSectionTitle}>🔒 Number Privacy</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '10px', background: profile?.numberProtected ? '#FFF0F0' : '#F0FFF4', border: `1px solid ${profile?.numberProtected ? '#FFCDD2' : '#C8E6C9'}` }}>
                                    <div>
                                        <div style={{ fontWeight: '700', color: '#5F0909', marginBottom: '4px', fontSize: '15px' }}>
                                            {profile?.numberProtected ? '🔒 Number Protected' : '📞 Number Public'}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#7A5C00' }}>
                                            {profile?.numberProtected ? 'Only approved users can see your number' : 'Premium users can see your number directly'}
                                        </div>
                                    </div>
                                    <button style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: profile ? 'pointer' : 'not-allowed', background: profile ? (profile?.numberProtected ? '#2E7D32' : '#B71C1C') : '#ccc', color: '#fff', opacity: profile ? 1 : 0.5 }}
                                        onClick={handleTogglePrivacy}>
                                        {profile?.numberProtected ? '🔓 Make Public' : '🔒 Protect Number'}
                                    </button>
                                </div>
                                <div style={{ marginTop: '20px' }}>
                                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#5F0909', marginBottom: '12px' }}>📬 Number Requests</h4>
                                    <IncomingRequests />
                                </div>
                                <div style={{ marginTop: '20px' }}>
                                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#5F0909', marginBottom: '12px' }}>👁️ Number Viewed By ({numberViewCount})</h4>
                                    <NumberViewsList />
                                </div>
                            </div>

                            <div style={styles.formSection}>
                                <h3 style={styles.formSectionTitle}>Account Details</h3>
                                <div style={styles.profileView}>
                                    {[
                                        { label: 'Name', value: user?.name },
                                        { label: 'Mobile', value: user?.mobile },
                                        { label: 'Email', value: user?.email },
                                        { label: 'Gender', value: user?.gender },
                                        { label: 'Plan', value: user?.isPremium ? '⭐ Premium' : '🆓 Free' },
                                    ].map(item => (
                                        <div key={item.label} style={styles.profileField}>
                                            <span style={styles.fieldLabel}>{item.label}</span>
                                            <span style={styles.fieldValue}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={styles.formSection}>
                                <h3 style={styles.formSectionTitle}>Danger Zone</h3>
                                <button style={{ ...styles.saveBtn, background: '#B71C1C' }} onClick={() => { logout(); navigate('/'); }}>
                                    🚪 Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Footer />

            {showLogin && <LoginModal onClose={() => setShowLogin(false)} onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }} />}
            {showRegister && <RegisterModal onClose={() => setShowRegister(false)} onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }} />}
            <SupportChatWidget open={showSupportChat} onClose={() => setShowSupportChat(false)} />
        </div>
    );
};

const styles = {
    verifyLockBox: { textAlign: 'center', padding: '36px 24px', background: '#FFF3E0', border: '1px solid #F5C99B', borderRadius: '12px' },
    changeDecisionLink: { fontSize: '11px', color: '#B8860B', cursor: 'pointer', textDecoration: 'underline', fontWeight: '600' },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '28px', alignItems: 'start' },
    sidebar: {},
    userCard: { background: '#fff', borderRadius: '16px', padding: '24px', textAlign: 'center', boxShadow: '0 4px 24px rgba(223,155,8,0.12)', marginBottom: '16px', border: '1px solid #F5BE17' },
    avatarContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '12px' },
    avatarImg: { width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #DF9B08', marginBottom: '8px' },
    avatarEmoji: { fontSize: '64px', marginBottom: '8px', lineHeight: 1 },
    uploadLabel: { fontSize: '12px', fontWeight: '600', color: '#B71C1C', cursor: 'pointer', padding: '5px 14px', border: '1.5px solid #B71C1C', borderRadius: '20px', background: '#FFF8E1', display: 'inline-block' },
    userName: { fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: '700', color: '#5F0909', marginBottom: '4px' },
    userMobile: { fontSize: '13px', color: '#7A5C00', marginBottom: '12px' },
    planBadge: { display: 'inline-block', padding: '5px 14px', borderRadius: '50px', fontSize: '12px', fontWeight: '600', marginBottom: '16px' },
    completion: { textAlign: 'left' },
    completionLabel: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#7A5C00', marginBottom: '6px' },
    progressBar: { height: '6px', background: '#F5E6A0', borderRadius: '50px', overflow: 'hidden' },
    progressFill: { height: '100%', background: 'linear-gradient(90deg, #B71C1C, #DF9B08)', borderRadius: '50px', transition: 'width 0.5s' },
    tabs: { background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(223,155,8,0.12)', border: '1px solid #F5BE17' },
    tab: { padding: '14px 20px', fontSize: '14px', fontWeight: '500', color: '#7A5C00', cursor: 'pointer', borderBottom: '1px solid #FFF8E1', transition: 'all 0.2s' },
    tabActive: { background: '#FFF8E1', color: '#B71C1C', fontWeight: '700', borderLeft: '3px solid #B71C1C' },
    main: { background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 24px rgba(223,155,8,0.12)', minHeight: '600px', border: '1px solid #F5E6A0' },
    pageTitle: { fontFamily: "'Playfair Display', serif", fontSize: '26px', color: '#5F0909', marginBottom: '24px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '24px' },
    statCard: { borderRadius: '12px', padding: '20px', textAlign: 'center', border: '1px solid #F5BE17' },
    statIcon: { fontSize: '28px', marginBottom: '8px' },
    statValue: { fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: '700', color: '#B71C1C', marginBottom: '4px' },
    statLabel: { fontSize: '12px', color: '#7A5C00' },
    alert: { background: '#FFF8E1', border: '1px solid #F5BE17', borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    alertBtn: { padding: '8px 16px', background: '#DF9B08', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' },
    upgradeBanner: { background: 'linear-gradient(135deg, #5F0909, #B71C1C)', borderRadius: '12px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    upgradeBtn: { padding: '10px 20px', background: '#F5BE17', color: '#5F0909', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' },
    sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: '20px', color: '#5F0909', marginBottom: '16px' },
    matchesGrid: { display: 'flex', flexDirection: 'column', gap: '12px' },
    matchCard: { display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 16px', background: '#FFF8E1', borderRadius: '12px', border: '1px solid #F5BE17' },
    matchPhoto: { fontSize: '36px', width: '52px', height: '52px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 },
    matchInfo: { flex: 1 },
    matchName: { fontWeight: '700', color: '#5F0909', fontSize: '15px', marginBottom: '2px' },
    matchMeta: { fontSize: '12px', color: '#7A5C00' },
    matchActions: { display: 'flex', gap: '8px' },
    interestBtn: { padding: '7px 14px', background: '#B71C1C', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
    viewBtn: { padding: '7px 14px', background: 'transparent', color: '#B71C1C', border: '1.5px solid #B71C1C', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
    profileHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    aadharBox: { background: '#FFFDF4', border: '1px solid #F5BE17', borderRadius: '12px', padding: '18px 20px', marginBottom: '24px' },
    aadharTitle: { fontSize: '14px', fontWeight: '700', color: '#5F0909', marginBottom: '6px' },
    aadharDesc: { fontSize: '12.5px', color: '#7A6055', lineHeight: 1.5, marginBottom: '12px' },
    aadharForm: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
    aadharInput: { flex: 1, minWidth: '200px', padding: '10px 14px', border: '1.5px solid #F5BE17', borderRadius: '8px', fontSize: '14px', outline: 'none', fontFamily: 'inherit' },
    aadharBtn: { padding: '10px 22px', background: 'linear-gradient(135deg, #B71C1C, #D32F2F)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13.5px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' },
    editBtn: { padding: '9px 18px', background: '#FFF8E1', color: '#B71C1C', border: '1.5px solid #B71C1C', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
    formSection: { background: '#FFFDF4', border: '1px solid #F5BE17', borderRadius: '12px', padding: '20px', marginBottom: '20px' },
    formSectionTitle: { fontSize: '16px', fontWeight: '700', color: '#B71C1C', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #F5BE17' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    formGroup: { marginBottom: '0' },
    label: { display: 'block', fontSize: '11px', fontWeight: '600', color: '#7A5C00', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    input: { width: '100%', padding: '11px 14px', border: '1.5px solid #F5BE17', borderRadius: '8px', fontSize: '14px', color: '#5F0909', background: '#fff', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' },
    langPillRow: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
    langPill: { padding: '8px 14px', border: '1.5px solid #F5BE17', borderRadius: '20px', fontSize: '13px', fontWeight: '600', color: '#7A5C00', background: '#fff', cursor: 'pointer' },
    langPillActive: { padding: '8px 14px', border: '1.5px solid #B71C1C', borderRadius: '20px', fontSize: '13px', fontWeight: '600', color: '#fff', background: 'linear-gradient(135deg, #B71C1C, #D32F2F)', cursor: 'pointer' },
    saveBtn: { padding: '12px 28px', background: 'linear-gradient(135deg, #B71C1C, #D32F2F)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
    profileView: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' },
    profileField: { display: 'flex', flexDirection: 'column', padding: '12px 16px', borderBottom: '1px solid #FFF8E1' },
    fieldLabel: { fontSize: '11px', fontWeight: '600', color: '#7A5C00', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' },
    fieldValue: { fontSize: '14px', color: '#5F0909', fontWeight: '500' },
    aboutSection: { gridColumn: '1 / -1', padding: '12px 16px' },
    aboutText: { fontSize: '14px', color: '#5F0909', lineHeight: 1.7, marginTop: '4px' },
    emptyProfile: { textAlign: 'center', padding: '60px 20px' },
    subTabRow: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
    subTabBtn: { padding: '9px 16px', background: '#FFF8E1', border: '1.5px solid #F5BE17', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#7A5C00', cursor: 'pointer' },
    subTabActive: { background: '#FFF0E0', border: '1.5px solid #B71C1C', color: '#B71C1C' },
    gallerySection: { marginTop: '28px', padding: '20px', background: '#FFFDF4', border: '1px solid #F5BE17', borderRadius: '12px' },
    galleryHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    galleryTitle: { fontFamily: "'Playfair Display', serif", fontSize: '18px', color: '#5F0909', fontWeight: '700' },
    galleryEmpty: { textAlign: 'center', padding: '32px', background: '#FFF8E1', borderRadius: '10px', border: '2px dashed #F5BE17' },
    galleryGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' },
    galleryItem: { position: 'relative', borderRadius: '10px', overflow: 'hidden', aspectRatio: '1' },
    galleryImg: { width: '100%', height: '100%', objectFit: 'cover' },
    galleryDeleteBtn: { position: 'absolute', top: '6px', right: '6px', background: 'rgba(183,28,28,0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' },
    galleryAddMore: { aspectRatio: '1', border: '2px dashed #F5BE17', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#FFFDF4' },
};

export default Dashboard;