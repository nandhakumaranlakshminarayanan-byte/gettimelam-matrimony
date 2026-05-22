import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import LoginModal from '../../components/Modals/LoginModal';
import RegisterModal from '../../components/Modals/RegisterModal';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = 'http://localhost:5000';

// ✅ Incoming Number Requests Component
const IncomingRequests = () => {
    const [requests, setRequests] = useState([]);

    useEffect(() => { fetchRequests(); }, []);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/privacy/incoming`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(res.data.requests || []);
        } catch (err) { }
    };

    const respond = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API}/api/privacy/${id}/respond`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`Request ${status}!`);
            fetchRequests();
        } catch (err) {
            toast.error('Failed!');
        }
    };

    if (requests.length === 0) return (
        <p style={{ fontSize: '13px', color: '#7A6055', textAlign: 'center', padding: '12px' }}>
            No number requests yet
        </p>
    );

    return (
        <div>
            {requests.map(req => (
                <div key={req._id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 16px', background: '#fff', borderRadius: '10px',
                    border: '1px solid #E8D5C4', marginBottom: '8px'
                }}>
                    <div>
                        <div style={{ fontWeight: '600', color: '#1A0A0A', fontSize: '14px' }}>
                            {req.requester?.name || 'Unknown'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#7A6055' }}>
                            {req.requester?.gender} • {new Date(req.createdAt).toLocaleDateString('en-IN')}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {req.status === 'pending' ? (
                            <>
                                <button style={{ padding: '6px 14px', background: '#E8F5E9', color: '#2E7D32', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                                    onClick={() => respond(req._id, 'approved')}>
                                    ✅ Approve
                                </button>
                                <button style={{ padding: '6px 14px', background: '#FFEBEE', color: '#C62828', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                                    onClick={() => respond(req._id, 'rejected')}>
                                    ❌ Reject
                                </button>
                            </>
                        ) : (
                            <span style={{
                                padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                                background: req.status === 'approved' ? '#E8F5E9' : '#FFEBEE',
                                color: req.status === 'approved' ? '#2E7D32' : '#C62828'
                            }}>
                                {req.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [shortlistSubTab, setShortlistSubTab] = useState('shortlisted'); // ✅ new
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [photoUrl, setPhotoUrl] = useState(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [suggestedMatches, setSuggestedMatches] = useState([]);
    const [shortlistedProfiles, setShortlistedProfiles] = useState([]);
    const [likedProfiles, setLikedProfiles] = useState([]); // ✅ new
    const [likedMeProfiles, setLikedMeProfiles] = useState([]); // ✅ new

    const [form, setForm] = useState({
        name: '', dateOfBirth: '', height: '', weight: '',
        complexion: '', maritalStatus: 'Never Married',
        religion: 'Hindu', caste: '', subCaste: '',
        rasi: '', nakshatra: '', dosham: 'No',
        education: '', occupation: '', annualIncome: '',
        city: '', district: '', state: 'Tamil Nadu',
        about: '', fatherOccupation: '', motherOccupation: '',
        siblings: '', familyType: 'Nuclear'
    });

    useEffect(() => {
        if (!user) { navigate('/'); return; }
        fetchProfile();
        fetchSuggestedMatches();
        fetchShortlist();
        fetchLikedProfiles();  // ✅ new
        fetchLikedMe();        // ✅ new
    }, [user]);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/profiles/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(res.data.profile);
            setForm(res.data.profile);
            if (res.data.profile.photo) {
                const photo = res.data.profile.photo;
                setPhotoUrl(photo.startsWith('http') ? photo : `${API}${photo}`);
            }
        } catch (err) { }
    };

    const fetchSuggestedMatches = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/profiles/suggested`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuggestedMatches(res.data.profiles || []);
        } catch (err) { setSuggestedMatches([]); }
    };

    const fetchShortlist = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/shortlist/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShortlistedProfiles(res.data.profiles || []);
        } catch (err) { setShortlistedProfiles([]); }
    };

    // ✅ Fetch profiles I liked
    const fetchLikedProfiles = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/likes/my-likes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLikedProfiles(res.data.profiles || []);
        } catch (err) { setLikedProfiles([]); }
    };

    // ✅ Fetch profiles who liked me
    const fetchLikedMe = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/likes/liked-me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
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
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (profile) {
                await axios.put(`${API}/api/profiles/${profile._id}`, form, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Profile updated! ✅');
            } else {
                await axios.post(`${API}/api/profiles`, {
                    ...form, name: user.name, gender: user.gender
                }, { headers: { Authorization: `Bearer ${token}` } });
                toast.success('Profile created! 🎊');
            }
            setEditing(false);
            fetchProfile();
            fetchSuggestedMatches();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save profile');
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePrivacy = async () => {
        if (!profile) { toast.error('Create your profile first!'); return; }
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${API}/api/privacy/toggle-protection`, {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(res.data.message);
            fetchProfile();
        } catch (err) {
            toast.error('Failed to update privacy!');
        }
    };

    const tabs = [
        { id: 'overview', label: '🏠 Overview' },
        { id: 'profile', label: '👤 My Profile' },
        { id: 'interests', label: '💌 Interests' },
        { id: 'matches', label: '💍 Matches' },
        { id: 'shortlist', label: '⭐ Shortlist' },
        { id: 'settings', label: '⚙️ Settings' },
    ];

    const completionPct = photoUrl && profile ? '80%' : profile ? '60%' : '20%';

    // ✅ Reusable profile card
    const ProfileCard = ({ p, showLikerName = false, likerName = '' }) => (
        <div style={styles.matchCard}>
            <div style={styles.matchPhoto}>
                {p?.photo ? (
                    <img src={`${API}${p.photo}`} alt={p.name}
                        style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                    p?.gender === 'Female' ? '👩' : '👨'
                )}
            </div>
            <div style={styles.matchInfo}>
                <div style={styles.matchName}>{showLikerName ? likerName : p?.name}</div>
                <div style={styles.matchMeta}>{p?.occupation} • {p?.city}</div>
                <div style={styles.matchMeta}>{p?.religion} • {p?.caste}</div>
            </div>
            <div style={styles.matchActions}>
                <button style={styles.viewBtn}
                    onClick={() => navigate(`/profile/${p?._id}`)}>
                    View
                </button>
            </div>
        </div>
    );

    return (
        <div style={{ background: '#FFFDF9', minHeight: '100vh' }}>
            <Navbar onLoginClick={() => setShowLogin(true)} onRegisterClick={() => setShowRegister(true)} />

            <div style={styles.container}>

                {/* SIDEBAR */}
                <div style={styles.sidebar}>
                    <div style={styles.userCard}>
                        <div style={styles.avatarContainer}>
                            {photoUrl ? (
                                <img src={photoUrl} alt="Profile" style={styles.avatarImg} />
                            ) : (
                                <div style={styles.avatarEmoji}>
                                    {user?.gender === 'Female' ? '👩' : '👨'}
                                </div>
                            )}
                            <label style={{ ...styles.uploadLabel, opacity: uploadingPhoto ? 0.6 : 1 }}
                                htmlFor="photoUpload">
                                {uploadingPhoto ? '⏳ Uploading...' : photoUrl ? '📷 Change Photo' : '📷 Upload Photo'}
                            </label>
                            <input id="photoUpload" type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={handlePhotoUpload}
                                style={{ display: 'none' }}
                                disabled={uploadingPhoto} />
                        </div>
                        <div style={styles.userName}>{user?.name}</div>
                        <div style={styles.userMobile}>{user?.mobile}</div>
                        <div style={{
                            ...styles.planBadge,
                            background: user?.isPremium ? '#C9A84C' : '#E8D5C4',
                            color: user?.isPremium ? '#fff' : '#7A6055'
                        }}>
                            {user?.isPremium ? '⭐ Premium Member' : '🆓 Free Member'}
                        </div>
                        <div style={styles.completion}>
                            <div style={styles.completionLabel}>
                                <span>Profile Completion</span>
                                <span style={{ color: '#8B1A1A', fontWeight: '700' }}>{completionPct}</span>
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
                        <div style={{ ...styles.tab, color: '#C0392B' }}
                            onClick={() => { logout(); navigate('/'); }}>
                            🚪 Logout
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div style={styles.main}>

                    {/* OVERVIEW */}
                    {activeTab === 'overview' && (
                        <div>
                            <h2 style={styles.pageTitle}>Welcome back, {user?.name}! 👋</h2>
                            <div style={styles.statsGrid}>
                                {[
                                    { icon: '👁️', label: 'Profile Views', value: '24', color: '#FDF0F0' },
                                    { icon: '💌', label: 'Interests Received', value: '8', color: '#F0F4FF' },
                                    { icon: '💍', label: 'Matches Found', value: suggestedMatches.length.toString(), color: '#F0FFF4' },
                                    { icon: '⭐', label: 'Shortlisted', value: shortlistedProfiles.length.toString(), color: '#FFFBF0' },
                                ].map(s => (
                                    <div key={s.label} style={{ ...styles.statCard, background: s.color }}>
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
                                        <p style={{ fontSize: '13px', marginTop: '4px', color: '#7A6055' }}>
                                            Add your details to get better matches.
                                        </p>
                                    </div>
                                    <button style={styles.alertBtn} onClick={() => setActiveTab('profile')}>
                                        Complete Now →
                                    </button>
                                </div>
                            )}

                            {!photoUrl && (
                                <div style={{ ...styles.alert, background: '#F0F4FF', border: '1px solid #C7D7F5' }}>
                                    <div>
                                        <strong>📷 Upload Your Photo!</strong>
                                        <p style={{ fontSize: '13px', marginTop: '4px', color: '#7A6055' }}>
                                            Profiles with photos get 3x more responses.
                                            {!profile && ' (Create profile first)'}
                                        </p>
                                    </div>
                                    <label htmlFor="photoUpload"
                                        style={{ ...styles.alertBtn, cursor: profile ? 'pointer' : 'not-allowed', opacity: profile ? 1 : 0.5 }}>
                                        Upload Now →
                                    </label>
                                </div>
                            )}

                            {!user?.isPremium && (
                                <div style={styles.upgradeBanner}>
                                    <div>
                                        <h3 style={{ color: '#fff', marginBottom: '4px', fontSize: '18px' }}>⭐ Upgrade to Premium</h3>
                                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>
                                            View contact numbers, horoscopes & connect on WhatsApp
                                        </p>
                                    </div>
                                    <button style={styles.upgradeBtn} onClick={() => navigate('/plans')}>
                                        View Plans →
                                    </button>
                                </div>
                            )}

                            <h3 style={styles.sectionTitle}>💍 Suggested Matches</h3>
                            <div style={styles.matchesGrid}>
                                {suggestedMatches.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '32px', color: '#7A6055', background: '#FDF5EE', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '40px', marginBottom: '8px' }}>💍</div>
                                        <p style={{ fontWeight: '600', marginBottom: '4px' }}>No matches yet!</p>
                                        <p style={{ fontSize: '13px' }}>Complete your profile to get matched</p>
                                        <button style={{ ...styles.interestBtn, marginTop: '12px' }}
                                            onClick={() => setActiveTab('profile')}>
                                            Complete Profile →
                                        </button>
                                    </div>
                                ) : (
                                    suggestedMatches.map((m, i) => (
                                        <div key={m._id || i} style={styles.matchCard}>
                                            <div style={styles.matchPhoto}>
                                                {m.photo ? (
                                                    <img src={`${API}${m.photo}`} alt={m.name}
                                                        style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover' }} />
                                                ) : (
                                                    m.gender === 'Female' ? '👩' : '👨'
                                                )}
                                            </div>
                                            <div style={styles.matchInfo}>
                                                <div style={styles.matchName}>{m.name}</div>
                                                <div style={styles.matchMeta}>{m.occupation} • {m.city}</div>
                                                <div style={styles.matchMeta}>{m.religion} • {m.caste}</div>
                                            </div>
                                            <div style={styles.matchActions}>
                                                <button style={styles.interestBtn}>💌 Interest</button>
                                                <button style={styles.viewBtn}
                                                    onClick={() => navigate(`/profile/${m._id}`)}>
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
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

                            {editing ? (
                                <form onSubmit={handleSaveProfile}>
                                    <div style={styles.formSection}>
                                        <h3 style={styles.formSectionTitle}>Personal Details</h3>
                                        <div style={styles.formGrid}>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Height</label>
                                                <select name="height" value={form.height} onChange={handleChange} style={styles.input}>
                                                    <option value="">Select</option>
                                                    {["4'6\"", "4'8\"", "4'10\"", "5'0\"", "5'2\"", "5'4\"", "5'6\"", "5'8\"", "5'10\"", "6'0\"", "6'2\""].map(h => (
                                                        <option key={h}>{h}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Complexion</label>
                                                <select name="complexion" value={form.complexion} onChange={handleChange} style={styles.input}>
                                                    <option value="">Select</option>
                                                    {['Fair', 'Very Fair', 'Wheatish', 'Dark'].map(c => <option key={c}>{c}</option>)}
                                                </select>
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Marital Status</label>
                                                <select name="maritalStatus" value={form.maritalStatus} onChange={handleChange} style={styles.input}>
                                                    {['Never Married', 'Divorced', 'Widowed', 'Separated'].map(m => <option key={m}>{m}</option>)}
                                                </select>
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Family Type</label>
                                                <select name="familyType" value={form.familyType} onChange={handleChange} style={styles.input}>
                                                    {['Nuclear', 'Joint'].map(f => <option key={f}>{f}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={styles.formSection}>
                                        <h3 style={styles.formSectionTitle}>Religious Details</h3>
                                        <div style={styles.formGrid}>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Religion</label>
                                                <select name="religion" value={form.religion} onChange={handleChange} style={styles.input}>
                                                    {['Hindu', 'Muslim', 'Christian'].map(r => <option key={r}>{r}</option>)}
                                                </select>
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Caste</label>
                                                <input name="caste" type="text" placeholder="Enter caste"
                                                    value={form.caste} onChange={handleChange} style={styles.input} />
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Rasi</label>
                                                <select name="rasi" value={form.rasi} onChange={handleChange} style={styles.input}>
                                                    <option value="">Select Rasi</option>
                                                    {['Mesham', 'Rishabam', 'Mithunam', 'Kadagam', 'Simmam', 'Kanni', 'Thulam', 'Viruchigam', 'Dhanusu', 'Magaram', 'Kumbam', 'Meenam'].map(r => <option key={r}>{r}</option>)}
                                                </select>
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Nakshatra</label>
                                                <select name="nakshatra" value={form.nakshatra} onChange={handleChange} style={styles.input}>
                                                    <option value="">Select Nakshatra</option>
                                                    {['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'].map(n => <option key={n}>{n}</option>)}
                                                </select>
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Dosham</label>
                                                <select name="dosham" value={form.dosham} onChange={handleChange} style={styles.input}>
                                                    {['No', 'Yes', "Doesn't Matter"].map(d => <option key={d}>{d}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={styles.formSection}>
                                        <h3 style={styles.formSectionTitle}>Education & Career</h3>
                                        <div style={styles.formGrid}>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Education</label>
                                                <input name="education" type="text" placeholder="e.g. B.Tech, MBA"
                                                    value={form.education} onChange={handleChange} style={styles.input} />
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Occupation</label>
                                                <input name="occupation" type="text" placeholder="e.g. Software Engineer"
                                                    value={form.occupation} onChange={handleChange} style={styles.input} />
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Annual Income</label>
                                                <select name="annualIncome" value={form.annualIncome} onChange={handleChange} style={styles.input}>
                                                    <option value="">Select</option>
                                                    {['Below 1 Lakh', '1-2 Lakhs', '2-5 Lakhs', '5-10 Lakhs', '10-20 Lakhs', '20+ Lakhs'].map(i => <option key={i}>{i}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={styles.formSection}>
                                        <h3 style={styles.formSectionTitle}>Location</h3>
                                        <div style={styles.formGrid}>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>City</label>
                                                <input name="city" type="text" placeholder="Enter city"
                                                    value={form.city} onChange={handleChange} style={styles.input} />
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>District</label>
                                                <select name="district" value={form.district} onChange={handleChange} style={styles.input}>
                                                    <option value="">Select District</option>
                                                    {['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Erode', 'Tirunelveli', 'Vellore', 'Thoothukudi', 'Puducherry'].map(d => <option key={d}>{d}</option>)}
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

                                    <div style={styles.formSection}>
                                        <h3 style={styles.formSectionTitle}>Family Details</h3>
                                        <div style={styles.formGrid}>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Father's Occupation</label>
                                                <input name="fatherOccupation" type="text" placeholder="Father's occupation"
                                                    value={form.fatherOccupation} onChange={handleChange} style={styles.input} />
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Mother's Occupation</label>
                                                <input name="motherOccupation" type="text" placeholder="Mother's occupation"
                                                    value={form.motherOccupation} onChange={handleChange} style={styles.input} />
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Siblings</label>
                                                <input name="siblings" type="text" placeholder="e.g. 1 Brother, 1 Sister"
                                                    value={form.siblings} onChange={handleChange} style={styles.input} />
                                            </div>
                                        </div>
                                    </div>

                                    <button type="submit"
                                        style={{ ...styles.saveBtn, opacity: loading ? 0.7 : 1 }}
                                        disabled={loading}>
                                        {loading ? '⏳ Saving...' : '💾 Save Profile'}
                                    </button>
                                </form>
                            ) : (
                                <div>
                                    {profile ? (
                                        <div style={styles.profileView}>
                                            {[
                                                { label: 'Height', value: profile.height },
                                                { label: 'Complexion', value: profile.complexion },
                                                { label: 'Marital Status', value: profile.maritalStatus },
                                                { label: 'Religion', value: profile.religion },
                                                { label: 'Caste', value: profile.caste },
                                                { label: 'Rasi', value: profile.rasi },
                                                { label: 'Nakshatra', value: profile.nakshatra },
                                                { label: 'Dosham', value: profile.dosham },
                                                { label: 'Education', value: profile.education },
                                                { label: 'Occupation', value: profile.occupation },
                                                { label: 'Annual Income', value: profile.annualIncome },
                                                { label: 'City', value: profile.city },
                                                { label: 'District', value: profile.district },
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
                                    ) : (
                                        <div style={styles.emptyProfile}>
                                            <div style={{ fontSize: '60px', marginBottom: '16px' }}>👤</div>
                                            <h3>No Profile Yet!</h3>
                                            <p style={{ color: '#7A6055', marginBottom: '20px' }}>
                                                Complete your profile to get better matches
                                            </p>
                                            <button style={styles.saveBtn} onClick={() => setEditing(true)}>
                                                ✏️ Create Profile Now
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* INTERESTS TAB */}
                    {activeTab === 'interests' && (
                        <div>
                            <h2 style={styles.pageTitle}>💌 Interests</h2>
                            <div style={styles.emptyProfile}>
                                <div style={{ fontSize: '60px', marginBottom: '16px' }}>💌</div>
                                <h3>No Interests Yet!</h3>
                                <p style={{ color: '#7A6055', marginBottom: '20px' }}>
                                    Browse profiles and send interests to connect
                                </p>
                                <button style={styles.saveBtn} onClick={() => navigate('/browse')}>
                                    Browse Profiles →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* MATCHES TAB */}
                    {activeTab === 'matches' && (
                        <div>
                            <h2 style={styles.pageTitle}>💍 Your Matches</h2>
                            {suggestedMatches.length === 0 ? (
                                <div style={styles.emptyProfile}>
                                    <div style={{ fontSize: '60px', marginBottom: '16px' }}>💍</div>
                                    <h3>Complete your profile to see matches!</h3>
                                    <p style={{ color: '#7A6055', marginBottom: '20px' }}>
                                        The more details you add, the better your matches
                                    </p>
                                    <button style={styles.saveBtn} onClick={() => setActiveTab('profile')}>
                                        Complete Profile →
                                    </button>
                                </div>
                            ) : (
                                <div style={styles.matchesGrid}>
                                    {suggestedMatches.map((m, i) => (
                                        <div key={m._id || i} style={styles.matchCard}>
                                            <div style={styles.matchPhoto}>
                                                {m.photo ? (
                                                    <img src={`${API}${m.photo}`} alt={m.name}
                                                        style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover' }} />
                                                ) : (
                                                    m.gender === 'Female' ? '👩' : '👨'
                                                )}
                                            </div>
                                            <div style={styles.matchInfo}>
                                                <div style={styles.matchName}>{m.name}</div>
                                                <div style={styles.matchMeta}>{m.occupation} • {m.city}</div>
                                                <div style={styles.matchMeta}>{m.religion} • {m.caste}</div>
                                            </div>
                                            <div style={styles.matchActions}>
                                                <button style={styles.interestBtn}>💌 Interest</button>
                                                <button style={styles.viewBtn}
                                                    onClick={() => navigate(`/profile/${m._id}`)}>
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ✅ SHORTLIST TAB — 3 sub-tabs */}
                    {activeTab === 'shortlist' && (
                        <div>
                            <h2 style={styles.pageTitle}>⭐ Shortlist & Likes</h2>

                            {/* ✅ Sub-tab buttons */}
                            <div style={styles.subTabRow}>
                                {[
                                    { id: 'shortlisted', label: `⭐ Shortlisted (${shortlistedProfiles.length})` },
                                    { id: 'liked', label: `👍 Profiles I Liked (${likedProfiles.length})` },
                                    { id: 'liked-me', label: `💝 Liked Me (${likedMeProfiles.length})` },
                                ].map(sub => (
                                    <button key={sub.id}
                                        style={{
                                            ...styles.subTabBtn,
                                            ...(shortlistSubTab === sub.id ? styles.subTabActive : {})
                                        }}
                                        onClick={() => setShortlistSubTab(sub.id)}>
                                        {sub.label}
                                    </button>
                                ))}
                            </div>

                            {/* ✅ Shortlisted profiles */}
                            {shortlistSubTab === 'shortlisted' && (
                                <div>
                                    {shortlistedProfiles.length === 0 ? (
                                        <div style={styles.emptyProfile}>
                                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⭐</div>
                                            <h3>No Shortlisted Profiles!</h3>
                                            <p style={{ color: '#7A6055', marginBottom: '16px' }}>
                                                Browse profiles and click ❤️ to shortlist
                                            </p>
                                            <button style={styles.saveBtn} onClick={() => navigate('/browse')}>
                                                Browse Profiles →
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={styles.matchesGrid}>
                                            {shortlistedProfiles.map((p, i) => (
                                                <ProfileCard key={p._id || i} p={p} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ✅ Profiles I liked */}
                            {shortlistSubTab === 'liked' && (
                                <div>
                                    {likedProfiles.length === 0 ? (
                                        <div style={styles.emptyProfile}>
                                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>👍</div>
                                            <h3>No Liked Profiles!</h3>
                                            <p style={{ color: '#7A6055', marginBottom: '16px' }}>
                                                Browse profiles and click 👍 Like to save them here
                                            </p>
                                            <button style={styles.saveBtn} onClick={() => navigate('/browse')}>
                                                Browse Profiles →
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={styles.matchesGrid}>
                                            {likedProfiles.map((p, i) => (
                                                <ProfileCard key={p._id || i} p={p} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ✅ Profiles that liked me */}
                            {shortlistSubTab === 'liked-me' && (
                                <div>
                                    {likedMeProfiles.length === 0 ? (
                                        <div style={styles.emptyProfile}>
                                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>💝</div>
                                            <h3>No one liked your profile yet!</h3>
                                            <p style={{ color: '#7A6055', marginBottom: '16px' }}>
                                                Complete your profile to attract more likes
                                            </p>
                                            <button style={styles.saveBtn} onClick={() => setActiveTab('profile')}>
                                                Complete Profile →
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={styles.matchesGrid}>
                                            {likedMeProfiles.map((like, i) => (
                                                <ProfileCard
                                                    key={like._id || i}
                                                    p={like.profile}
                                                    showLikerName={true}
                                                    likerName={like.liker?.name || 'Unknown'}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* SETTINGS TAB */}
                    {activeTab === 'settings' && (
                        <div>
                            <h2 style={styles.pageTitle}>⚙️ Settings</h2>

                            <div style={styles.formSection}>
                                <h3 style={styles.formSectionTitle}>🔒 Number Privacy</h3>
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '16px', borderRadius: '10px',
                                    background: profile?.numberProtected ? '#FFF0F0' : '#F0FFF4',
                                    border: `1px solid ${profile?.numberProtected ? '#FFCDD2' : '#C8E6C9'}`
                                }}>
                                    <div>
                                        <div style={{ fontWeight: '700', color: '#1A0A0A', marginBottom: '4px', fontSize: '15px' }}>
                                            {profile?.numberProtected ? '🔒 Number Protected' : '📞 Number Public'}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#7A6055' }}>
                                            {profile?.numberProtected
                                                ? 'Only approved users can see your number'
                                                : 'Premium users can see your number directly'}
                                        </div>
                                    </div>
                                    <button style={{
                                        padding: '10px 20px', border: 'none', borderRadius: '8px',
                                        fontSize: '13px', fontWeight: '700',
                                        cursor: profile ? 'pointer' : 'not-allowed',
                                        background: profile ? (profile?.numberProtected ? '#2E7D32' : '#8B1A1A') : '#ccc',
                                        color: '#fff', opacity: profile ? 1 : 0.5
                                    }}
                                        onClick={handleTogglePrivacy}>
                                        {profile?.numberProtected ? '🔓 Make Public' : '🔒 Protect Number'}
                                    </button>
                                </div>

                                <div style={{ marginTop: '20px' }}>
                                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#1A0A0A', marginBottom: '12px' }}>
                                        📬 Number Requests
                                    </h4>
                                    <IncomingRequests />
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
                                <button style={{ ...styles.saveBtn, background: '#C0392B' }}
                                    onClick={() => { logout(); navigate('/'); }}>
                                    🚪 Logout
                                </button>
                            </div>
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
    container: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '28px', alignItems: 'start' },
    sidebar: {},
    userCard: { background: '#fff', borderRadius: '16px', padding: '24px', textAlign: 'center', boxShadow: '0 4px 24px rgba(139,26,26,0.08)', marginBottom: '16px' },
    avatarContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '12px' },
    avatarImg: { width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #8B1A1A', marginBottom: '8px' },
    avatarEmoji: { fontSize: '64px', marginBottom: '8px', lineHeight: 1 },
    uploadLabel: { fontSize: '12px', fontWeight: '600', color: '#8B1A1A', cursor: 'pointer', padding: '5px 14px', border: '1.5px solid #8B1A1A', borderRadius: '20px', background: '#FDF0F0', display: 'inline-block' },
    userName: { fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: '700', color: '#1A0A0A', marginBottom: '4px' },
    userMobile: { fontSize: '13px', color: '#7A6055', marginBottom: '12px' },
    planBadge: { display: 'inline-block', padding: '5px 14px', borderRadius: '50px', fontSize: '12px', fontWeight: '600', marginBottom: '16px' },
    completion: { textAlign: 'left' },
    completionLabel: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#7A6055', marginBottom: '6px' },
    progressBar: { height: '6px', background: '#E8D5C4', borderRadius: '50px', overflow: 'hidden' },
    progressFill: { height: '100%', background: 'linear-gradient(90deg, #8B1A1A, #C0392B)', borderRadius: '50px', transition: 'width 0.5s' },
    tabs: { background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(139,26,26,0.08)' },
    tab: { padding: '14px 20px', fontSize: '14px', fontWeight: '500', color: '#7A6055', cursor: 'pointer', borderBottom: '1px solid #F5EAE0', transition: 'all 0.2s' },
    tabActive: { background: '#FDF0F0', color: '#8B1A1A', fontWeight: '700', borderLeft: '3px solid #8B1A1A' },
    main: { background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 24px rgba(139,26,26,0.08)', minHeight: '600px' },
    pageTitle: { fontFamily: "'Playfair Display', serif", fontSize: '26px', color: '#1A0A0A', marginBottom: '24px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
    statCard: { borderRadius: '12px', padding: '20px', textAlign: 'center' },
    statIcon: { fontSize: '28px', marginBottom: '8px' },
    statValue: { fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: '700', color: '#8B1A1A', marginBottom: '4px' },
    statLabel: { fontSize: '12px', color: '#7A6055' },
    alert: { background: '#FFF9E6', border: '1px solid #F5E6C0', borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    alertBtn: { padding: '8px 16px', background: '#C9A84C', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' },
    upgradeBanner: { background: 'linear-gradient(135deg, #1A0A0A, #3D1A1A)', borderRadius: '12px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    upgradeBtn: { padding: '10px 20px', background: '#C9A84C', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' },
    sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: '20px', color: '#1A0A0A', marginBottom: '16px' },
    matchesGrid: { display: 'flex', flexDirection: 'column', gap: '12px' },
    matchCard: { display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 16px', background: '#FDF5EE', borderRadius: '12px', border: '1px solid #E8D5C4' },
    matchPhoto: { fontSize: '36px', width: '52px', height: '52px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 },
    matchInfo: { flex: 1 },
    matchName: { fontWeight: '700', color: '#1A0A0A', fontSize: '15px', marginBottom: '2px' },
    matchMeta: { fontSize: '12px', color: '#7A6055' },
    matchActions: { display: 'flex', gap: '8px' },
    interestBtn: { padding: '7px 14px', background: '#8B1A1A', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
    viewBtn: { padding: '7px 14px', background: 'transparent', color: '#8B1A1A', border: '1.5px solid #8B1A1A', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
    profileHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    editBtn: { padding: '9px 18px', background: '#FDF0F0', color: '#8B1A1A', border: '1.5px solid #8B1A1A', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
    formSection: { background: '#FFFDF9', border: '1px solid #E8D5C4', borderRadius: '12px', padding: '20px', marginBottom: '20px' },
    formSectionTitle: { fontSize: '16px', fontWeight: '700', color: '#8B1A1A', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #E8D5C4' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    formGroup: { marginBottom: '0' },
    label: { display: 'block', fontSize: '11px', fontWeight: '600', color: '#7A6055', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    input: { width: '100%', padding: '11px 14px', border: '1.5px solid #E8D5C4', borderRadius: '8px', fontSize: '14px', color: '#2C1810', background: '#fff', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' },
    saveBtn: { padding: '12px 28px', background: 'linear-gradient(135deg, #8B1A1A, #C0392B)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
    profileView: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' },
    profileField: { display: 'flex', flexDirection: 'column', padding: '12px 16px', borderBottom: '1px solid #F5EAE0' },
    fieldLabel: { fontSize: '11px', fontWeight: '600', color: '#7A6055', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' },
    fieldValue: { fontSize: '14px', color: '#2C1810', fontWeight: '500' },
    aboutSection: { gridColumn: '1 / -1', padding: '12px 16px' },
    aboutText: { fontSize: '14px', color: '#2C1810', lineHeight: 1.7, marginTop: '4px' },
    emptyProfile: { textAlign: 'center', padding: '60px 20px' },

    // ✅ Sub-tab styles
    subTabRow: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
    subTabBtn: { padding: '9px 16px', background: '#F5F5F5', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#555', cursor: 'pointer' },
    subTabActive: { background: '#FDF0F0', border: '1.5px solid #8B1A1A', color: '#8B1A1A' },
};

export default Dashboard;