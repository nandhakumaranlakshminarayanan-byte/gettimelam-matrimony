import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API = 'http://localhost:5000';

const ProfilesSection = ({ onLoginClick }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchProfiles(); }, [user]);

    const fetchProfiles = async () => {
        try {
            // ✅ Send token to exclude own profile
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await axios.get(`${API}/api/profiles`, { headers });
            const real = res.data.profiles || [];
            // ✅ Show max 6 profiles
            setProfiles(real.slice(0, 6));
        } catch (err) {
            setProfiles([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSendInterest = () => {
        if (!user) { onLoginClick(); return; }
    };

    const getName = (p) => p.name || p.user?.name || 'Unknown';

    if (loading) return (
        <section style={styles.section}>
            <div style={{ textAlign: 'center', padding: '60px' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>⏳</div>
                <p style={{ color: '#7A6055' }}>Loading profiles...</p>
            </div>
        </section>
    );

    return (
        <section style={styles.section}>
            <div style={styles.inner}>
                <div style={styles.header}>
                    <p style={styles.label}>✨ Browse Profiles</p>
                    <h2 style={styles.title}>Find Your Perfect Match</h2>
                    <p style={styles.desc}>Thousands of verified profiles waiting for you</p>
                </div>

                <div style={styles.grid}>
                    {profiles.map((p, i) => (
                        <div key={p._id || i} style={styles.card}>
                            <div style={{
                                ...styles.photo,
                                background: p.gender === 'Female'
                                    ? 'linear-gradient(135deg, #FDEEF5, #F5D5E8)'
                                    : 'linear-gradient(135deg, #EEF2FD, #D5DEF5)'
                            }}>
                                {p.photo ? (
                                    <img src={`${API}${p.photo}`} alt={getName(p)}
                                        style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #8B1A1A' }} />
                                ) : (
                                    <span style={styles.avatar}>
                                        {p.gender === 'Female' ? '👩' : '👨'}
                                    </span>
                                )}
                                <span style={styles.verified}>✓ Verified</span>
                            </div>
                            <div style={styles.info}>
                                <div style={styles.name}>{getName(p)}</div>
                                <div style={styles.meta}>{p.occupation} • {p.city}</div>
                                <div style={styles.meta}>{p.religion} • {p.caste}</div>
                                <div style={styles.tags}>
                                    {p.maritalStatus && <span style={styles.tag}>{p.maritalStatus}</span>}
                                    {p.education && <span style={styles.tag}>{p.education}</span>}
                                    {p.district && <span style={styles.tag}>{p.district}</span>}
                                </div>
                                <div style={styles.actions}>
                                    <button style={styles.btnPrimary} onClick={handleSendInterest}>
                                        💌 Send Interest
                                    </button>
                                    <button style={styles.btnOutline}
                                        onClick={() => navigate(`/profile/${p._id}`)}>
                                        View Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {profiles.length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#7A6055' }}>
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>💍</div>
                            <p>No profiles yet. Be the first to register!</p>
                        </div>
                    )}
                </div>

                <div style={styles.center}>
                    <button style={styles.viewAll} onClick={() => navigate('/browse')}>
                        View All Profiles →
                    </button>
                </div>
            </div>
        </section>
    );
};

const styles = {
    section: { padding: '72px 24px', background: '#FDF5EE' },
    inner: { maxWidth: '1200px', margin: '0 auto' },
    header: { textAlign: 'center', marginBottom: '48px' },
    label: { fontSize: '12px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '10px' },
    title: { fontFamily: "'Playfair Display', serif", fontSize: '38px', color: '#1A0A0A', marginBottom: '12px' },
    desc: { fontSize: '16px', color: '#7A6055' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' },
    card: { background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(139,26,26,0.08)', cursor: 'pointer' },
    photo: { height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
    avatar: { fontSize: '56px' },
    verified: { position: 'absolute', top: '12px', right: '12px', background: '#1E6B3C', color: '#fff', fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px' },
    info: { padding: '18px' },
    name: { fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: '600', color: '#1A0A0A', marginBottom: '4px' },
    meta: { fontSize: '13px', color: '#7A6055', marginBottom: '2px', lineHeight: 1.6 },
    tags: { display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '10px 0' },
    tag: { fontSize: '11px', fontWeight: '500', padding: '4px 10px', borderRadius: '20px', background: '#FDF0F0', color: '#8B1A1A' },
    actions: { display: 'flex', gap: '8px', marginTop: '10px' },
    btnPrimary: { flex: 1, padding: '9px', background: '#8B1A1A', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
    btnOutline: { flex: 1, padding: '9px', background: 'transparent', color: '#8B1A1A', border: '1.5px solid #8B1A1A', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
    center: { textAlign: 'center', marginTop: '36px' },
    viewAll: { padding: '12px 32px', background: 'transparent', border: '1.5px solid #8B1A1A', color: '#8B1A1A', borderRadius: '8px', fontSize: '15px', fontWeight: '500', cursor: 'pointer' },
};

export default ProfilesSection;