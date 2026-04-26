import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import LoginModal from '../../components/Modals/LoginModal';
import RegisterModal from '../../components/Modals/RegisterModal';
import axios from 'axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [photoUrl, setPhotoUrl] = useState(null);
    const [form, setForm] = useState({
        name: '',
        dateOfBirth: '',
        height: '',
        weight: '',
        complexion: '',
        maritalStatus: 'Never Married',
        religion: 'Hindu',
        caste: '',
        subCaste: '',
        rasi: '',
        nakshatra: '',
        dosham: 'No',
        education: '',
        occupation: '',
        annualIncome: '',
        city: '',
        district: '',
        state: 'Tamil Nadu',
        about: '',
        fatherOccupation: '',
        motherOccupation: '',
        siblings: '',
        familyType: 'Nuclear'
    });

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }
        fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/profiles/my', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(res.data.profile);
            setForm(res.data.profile);
            if (res.data.profile.photo) {
                setPhotoUrl(res.data.profile.photo);
            }
        } catch (err) {
            // No profile yet
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('photo', file);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                'http://localhost:5000/api/profiles/upload-photo',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            setPhotoUrl(res.data.photoUrl);
            toast.success('Photo uploaded! ✅');
        } catch (err) {
            toast.error('Please create your profile first before uploading photo!');
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (profile) {
                await axios.put(`http://localhost:5000/api/profiles/${profile._id}`, form, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Profile updated! ✅');
            } else {
                await axios.post('http://localhost:5000/api/profiles', {
                    ...form,
                    name: user.name,
                    gender: user.gender
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Profile created! 🎊');
            }
            setEditing(false);
            fetchProfile();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save profile');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'overview', label: '🏠 Overview' },
        { id: 'profile', label: '👤 My Profile' },
        { id: 'interests', label: '💌 Interests' },
        { id: 'matches', label: '💍 Matches' },
        { id: 'settings', label: '⚙️ Settings' },
    ];

    return (
        <div style={{ background: '#FFFDF9', minHeight: '100vh' }}>
            <Navbar
                onLoginClick={() => setShowLogin(true)}
                onRegisterClick={() => setShowRegister(true)}
            />

            <div style={styles.container}>

                {/* SIDEBAR */}
                <div style={styles.sidebar}>

                    {/* User Card */}
                    <div style={styles.userCard}>

                        {/* Photo Upload */}
                        <div style={styles.avatarContainer}>
                            {photoUrl ? (
                                <img src={photoUrl} alt="Profile" style={styles.avatarImg} />
                            ) : (
                                <div style={styles.avatarEmoji}>
                                    {user?.gender === 'Female' ? '👩' : '👨'}
                                </div>
                            )}
                            <label style={styles.uploadLabel} htmlFor="photoUpload">
                                📷 {photoUrl ? 'Change Photo' : 'Upload Photo'}
                            </label>
                            <input
                                id="photoUpload"
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                style={{ display: 'none' }}
                            />
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

                        {/* Profile Completion */}
                        <div style={styles.completion}>
                            <div style={styles.completionLabel}>
                                <span>Profile Completion</span>
                                <span style={{ color: '#8B1A1A', fontWeight: '700' }}>
                                    {photoUrl && profile ? '80%' : profile ? '60%' : '20%'}
                                </span>
                            </div>
                            <div style={styles.progressBar}>
                                <div style={{
                                    ...styles.progressFill,
                                    width: photoUrl && profile ? '80%' : profile ? '60%' : '20%'
                                }} />
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div style={styles.tabs}>
                        {tabs.map(tab => (
                            <div
                                key={tab.id}
                                style={{
                                    ...styles.tab,
                                    ...(activeTab === tab.id ? styles.tabActive : {})
                                }}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </div>
                        ))}
                        <div
                            style={{ ...styles.tab, color: '#C0392B' }}
                            onClick={() => { logout(); navigate('/'); }}
                        >
                            🚪 Logout
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div style={styles.main}>

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div>
                            <h2 style={styles.pageTitle}>Welcome back, {user?.name}! 👋</h2>

                            {/* Stats */}
                            <div style={styles.statsGrid}>
                                {[
                                    { icon: '👁️', label: 'Profile Views', value: '24', color: '#FDF0F0' },
                                    { icon: '💌', label: 'Interests Received', value: '8', color: '#F0F4FF' },
                                    { icon: '💍', label: 'Matches Found', value: '142', color: '#F0FFF4' },
                                    { icon: '⭐', label: 'Shortlisted', value: '5', color: '#FFFBF0' },
                                ].map(s => (
                                    <div key={s.label} style={{ ...styles.statCard, background: s.color }}>
                                        <div style={styles.statIcon}>{s.icon}</div>
                                        <div style={styles.statValue}>{s.value}</div>
                                        <div style={styles.statLabel}>{s.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Alert — Complete Profile */}
                            {!profile && (
                                <div style={styles.alert}>
                                    <div>
                                        <strong>⚠️ Complete Your Profile!</strong>
                                        <p style={{ fontSize: '13px', marginTop: '4px', color: '#7A6055' }}>
                                            Add your details to get better matches and more visibility.
                                        </p>
                                    </div>
                                    <button
                                        style={styles.alertBtn}
                                        onClick={() => setActiveTab('profile')}
                                    >
                                        Complete Now →
                                    </button>
                                </div>
                            )}

                            {/* Upload Photo Alert */}
                            {!photoUrl && (
                                <div style={{ ...styles.alert, background: '#F0F4FF', border: '1px solid #C7D7F5' }}>
                                    <div>
                                        <strong>📷 Upload Your Photo!</strong>
                                        <p style={{ fontSize: '13px', marginTop: '4px', color: '#7A6055' }}>
                                            Profiles with photos get 3x more responses.
                                        </p>
                                    </div>
                                    <label htmlFor="photoUpload" style={{ ...styles.alertBtn, cursor: 'pointer' }}>
                                        Upload Now →
                                    </label>
                                </div>
                            )}

                            {/* Upgrade Banner */}
                            {!user?.isPremium && (
                                <div style={styles.upgradeBanner}>
                                    <div>
                                        <h3 style={{ color: '#fff', marginBottom: '4px', fontSize: '18px' }}>
                                            ⭐ Upgrade to Premium
                                        </h3>
                                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>
                                            View contact numbers, horoscopes & connect directly on WhatsApp
                                        </p>
                                    </div>
                                    <button style={styles.upgradeBtn}>
                                        View Plans →
                                    </button>
                                </div>
                            )}

                            {/* Recent Matches */}
                            <h3 style={styles.sectionTitle}>💍 Suggested Matches</h3>
                            <div style={styles.matchesGrid}>
                                {[
                                    { name: 'Priya S.', age: 25, job: 'Engineer', city: 'Chennai', gender: 'female' },
                                    { name: 'Kavitha R.', age: 24, job: 'Teacher', city: 'Madurai', gender: 'female' },
                                    { name: 'Deepa N.', age: 26, job: 'Nurse', city: 'Trichy', gender: 'female' },
                                ].map((m, i) => (
                                    <div key={i} style={styles.matchCard}>
                                        <div style={styles.matchPhoto}>
                                            {m.gender === 'female' ? '👩' : '👨'}
                                        </div>
                                        <div style={styles.matchInfo}>
                                            <div style={styles.matchName}>{m.name}</div>
                                            <div style={styles.matchMeta}>{m.age} yrs • {m.job}</div>
                                            <div style={styles.matchMeta}>{m.city}</div>
                                        </div>
                                        <div style={styles.matchActions}>
                                            <button style={styles.interestBtn}>💌 Interest</button>
                                            <button style={styles.viewBtn}>View</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div>
                            <div style={styles.profileHeader}>
                                <h2 style={styles.pageTitle}>👤 My Profile</h2>
                                <button
                                    style={styles.editBtn}
                                    onClick={() => setEditing(!editing)}
                                >
                                    {editing ? '✕ Cancel' : '✏️ Edit Profile'}
                                </button>
                            </div>

                            {editing ? (
                                <form onSubmit={handleSaveProfile}>

                                    {/* Personal Details */}
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

                                    {/* Religious Details */}
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
                                                <input name="caste" type="text" placeholder="Enter caste" value={form.caste} onChange={handleChange} style={styles.input} />
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

                                    {/* Education & Career */}
                                    <div style={styles.formSection}>
                                        <h3 style={styles.formSectionTitle}>Education & Career</h3>
                                        <div style={styles.formGrid}>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Education</label>
                                                <input name="education" type="text" placeholder="e.g. B.Tech, MBA" value={form.education} onChange={handleChange} style={styles.input} />
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Occupation</label>
                                                <input name="occupation" type="text" placeholder="e.g. Software Engineer" value={form.occupation} onChange={handleChange} style={styles.input} />
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

                                    {/* Location */}
                                    <div style={styles.formSection}>
                                        <h3 style={styles.formSectionTitle}>Location</h3>
                                        <div style={styles.formGrid}>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>City</label>
                                                <input name="city" type="text" placeholder="Enter city" value={form.city} onChange={handleChange} style={styles.input} />
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

                                    {/* About */}
                                    <div style={styles.formSection}>
                                        <h3 style={styles.formSectionTitle}>About Me</h3>
                                        <textarea
                                            name="about"
                                            placeholder="Write something about yourself..."
                                            value={form.about}
                                            onChange={handleChange}
                                            rows={4}
                                            style={{ ...styles.input, resize: 'vertical' }}
                                        />
                                    </div>

                                    {/* Family Details */}
                                    <div style={styles.formSection}>
                                        <h3 style={styles.formSectionTitle}>Family Details</h3>
                                        <div style={styles.formGrid}>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Father's Occupation</label>
                                                <input name="fatherOccupation" type="text" placeholder="Father's occupation" value={form.fatherOccupation} onChange={handleChange} style={styles.input} />
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Mother's Occupation</label>
                                                <input name="motherOccupation" type="text" placeholder="Mother's occupation" value={form.motherOccupation} onChange={handleChange} style={styles.input} />
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Siblings</label>
                                                <input name="siblings" type="text" placeholder="e.g. 1 Brother, 1 Sister" value={form.siblings} onChange={handleChange} style={styles.input} />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        style={{ ...styles.saveBtn, opacity: loading ? 0.7 : 1 }}
                                        disabled={loading}
                                    >
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
                                            ].map(item => item.value && (
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
                        </div>
                    )}

                    {/* SETTINGS TAB */}
                    {activeTab === 'settings' && (
                        <div>
                            <h2 style={styles.pageTitle}>⚙️ Settings</h2>
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
                                <button
                                    style={{ ...styles.saveBtn, background: '#C0392B' }}
                                    onClick={() => { logout(); navigate('/'); }}
                                >
                                    🚪 Logout
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>

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
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 24px',
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        gap: '28px',
        alignItems: 'start'
    },
    sidebar: {},
    userCard: {
        background: '#fff',
        borderRadius: '16px',
        padding: '24px',
        textAlign: 'center',
        boxShadow: '0 4px 24px rgba(139,26,26,0.08)',
        marginBottom: '16px'
    },
    avatarContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '12px'
    },
    avatarImg: {
        width: '90px',
        height: '90px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: '3px solid #8B1A1A',
        marginBottom: '8px'
    },
    avatarEmoji: {
        fontSize: '64px',
        marginBottom: '8px',
        lineHeight: 1
    },
    uploadLabel: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#8B1A1A',
        cursor: 'pointer',
        padding: '5px 14px',
        border: '1.5px solid #8B1A1A',
        borderRadius: '20px',
        background: '#FDF0F0',
        display: 'inline-block'
    },
    userName: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '18px',
        fontWeight: '700',
        color: '#1A0A0A',
        marginBottom: '4px'
    },
    userMobile: {
        fontSize: '13px',
        color: '#7A6055',
        marginBottom: '12px'
    },
    planBadge: {
        display: 'inline-block',
        padding: '5px 14px',
        borderRadius: '50px',
        fontSize: '12px',
        fontWeight: '600',
        marginBottom: '16px'
    },
    completion: { textAlign: 'left' },
    completionLabel: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: '#7A6055',
        marginBottom: '6px'
    },
    progressBar: {
        height: '6px',
        background: '#E8D5C4',
        borderRadius: '50px',
        overflow: 'hidden'
    },
    progressFill: {
        height: '100%',
        background: 'linear-gradient(90deg, #8B1A1A, #C0392B)',
        borderRadius: '50px',
        transition: 'width 0.5s'
    },
    tabs: {
        background: '#fff',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(139,26,26,0.08)'
    },
    tab: {
        padding: '14px 20px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#7A6055',
        cursor: 'pointer',
        borderBottom: '1px solid #F5EAE0',
        transition: 'all 0.2s'
    },
    tabActive: {
        background: '#FDF0F0',
        color: '#8B1A1A',
        fontWeight: '700',
        borderLeft: '3px solid #8B1A1A'
    },
    main: {
        background: '#fff',
        borderRadius: '16px',
        padding: '28px',
        boxShadow: '0 4px 24px rgba(139,26,26,0.08)',
        minHeight: '600px'
    },
    pageTitle: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '26px',
        color: '#1A0A0A',
        marginBottom: '24px'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px'
    },
    statCard: {
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center'
    },
    statIcon: { fontSize: '28px', marginBottom: '8px' },
    statValue: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '28px',
        fontWeight: '700',
        color: '#8B1A1A',
        marginBottom: '4px'
    },
    statLabel: { fontSize: '12px', color: '#7A6055' },
    alert: {
        background: '#FFF9E6',
        border: '1px solid #F5E6C0',
        borderRadius: '12px',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
    },
    alertBtn: {
        padding: '8px 16px',
        background: '#C9A84C',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        whiteSpace: 'nowrap'
    },
    upgradeBanner: {
        background: 'linear-gradient(135deg, #1A0A0A, #3D1A1A)',
        borderRadius: '12px',
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
    },
    upgradeBtn: {
        padding: '10px 20px',
        background: '#C9A84C',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        whiteSpace: 'nowrap'
    },
    sectionTitle: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '20px',
        color: '#1A0A0A',
        marginBottom: '16px'
    },
    matchesGrid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    matchCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '14px 16px',
        background: '#FDF5EE',
        borderRadius: '12px',
        border: '1px solid #E8D5C4'
    },
    matchPhoto: {
        fontSize: '36px',
        width: '52px',
        height: '52px',
        background: '#fff',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    matchInfo: { flex: 1 },
    matchName: {
        fontWeight: '700',
        color: '#1A0A0A',
        fontSize: '15px',
        marginBottom: '2px'
    },
    matchMeta: { fontSize: '12px', color: '#7A6055' },
    matchActions: { display: 'flex', gap: '8px' },
    interestBtn: {
        padding: '7px 14px',
        background: '#8B1A1A',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    viewBtn: {
        padding: '7px 14px',
        background: 'transparent',
        color: '#8B1A1A',
        border: '1.5px solid #8B1A1A',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    profileHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
    },
    editBtn: {
        padding: '9px 18px',
        background: '#FDF0F0',
        color: '#8B1A1A',
        border: '1.5px solid #8B1A1A',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    formSection: {
        background: '#FFFDF9',
        border: '1px solid #E8D5C4',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px'
    },
    formSectionTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#8B1A1A',
        marginBottom: '16px',
        paddingBottom: '8px',
        borderBottom: '1px solid #E8D5C4'
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px'
    },
    formGroup: { marginBottom: '0' },
    label: {
        display: 'block',
        fontSize: '11px',
        fontWeight: '600',
        color: '#7A6055',
        marginBottom: '5px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    input: {
        width: '100%',
        padding: '11px 14px',
        border: '1.5px solid #E8D5C4',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#2C1810',
        background: '#fff',
        outline: 'none',
        fontFamily: "'DM Sans', sans-serif",
        boxSizing: 'border-box'
    },
    saveBtn: {
        padding: '12px 28px',
        background: 'linear-gradient(135deg, #8B1A1A, #C0392B)',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif"
    },
    profileView: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0'
    },
    profileField: {
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 16px',
        borderBottom: '1px solid #F5EAE0'
    },
    fieldLabel: {
        fontSize: '11px',
        fontWeight: '600',
        color: '#7A6055',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '4px'
    },
    fieldValue: {
        fontSize: '14px',
        color: '#2C1810',
        fontWeight: '500'
    },
    aboutSection: {
        gridColumn: '1 / -1',
        padding: '12px 16px'
    },
    aboutText: {
        fontSize: '14px',
        color: '#2C1810',
        lineHeight: 1.7,
        marginTop: '4px'
    },
    emptyProfile: {
        textAlign: 'center',
        padding: '60px 20px'
    }
};

export default Dashboard;