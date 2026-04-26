import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const Profiles = () => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => { fetchProfiles(); }, []);

    const fetchProfiles = async () => {
        setLoading(true);
        try {
            const res = await API.get('/admin/profiles');
            setProfiles(res.data.profiles);
        } catch (err) {
            toast.error('Failed to load profiles');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id) => {
        try {
            await API.put(`/admin/profiles/${id}/verify`);
            toast.success('Profile verified! ✅');
            fetchProfiles();
        } catch (err) {
            toast.error('Failed!');
        }
    };

    return (
        <div style={styles.layout}>
            <Sidebar />
            <div style={styles.content}>
                <Navbar title="👤 Manage Profiles" />
                <div style={styles.inner}>
                    <div style={styles.topRow}>
                        <h3 style={styles.count}>{profiles.length} profiles registered</h3>
                    </div>

                    {loading ? (
                        <div style={styles.loading}>Loading...</div>
                    ) : (
                        <div style={styles.grid}>
                            {profiles.map(p => (
                                <div key={p._id} style={styles.card}>
                                    <div style={{
                                        ...styles.photo,
                                        background: p.gender === 'Female'
                                            ? 'linear-gradient(135deg, #FDEEF5, #F5D5E8)'
                                            : 'linear-gradient(135deg, #EEF2FD, #D5DEF5)'
                                    }}>
                                        <span style={{ fontSize: '40px' }}>
                                            {p.photo
                                                ? <img src={p.photo} alt="" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                                                : p.gender === 'Female' ? '👩' : '👨'
                                            }
                                        </span>
                                        {p.isVerified && (
                                            <span style={styles.verifiedBadge}>✓ Verified</span>
                                        )}
                                    </div>
                                    <div style={styles.info}>
                                        <div style={styles.name}>{p.user?.name || p.name}</div>
                                        <div style={styles.meta}>📞 {p.user?.mobile}</div>
                                        <div style={styles.meta}>{p.religion} • {p.caste}</div>
                                        <div style={styles.meta}>{p.occupation} • {p.city}</div>
                                        <div style={styles.meta}>📧 {p.user?.email}</div>
                                        <div style={styles.actions}>
                                            {!p.isVerified ? (
                                                <button style={styles.verifyBtn} onClick={() => handleVerify(p._id)}>
                                                    ✅ Verify Profile
                                                </button>
                                            ) : (
                                                <span style={styles.verifiedText}>✓ Verified</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {profiles.length === 0 && (
                                <div style={styles.empty}>
                                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>👤</div>
                                    <p style={{ color: '#999' }}>No profiles yet</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    layout: { display: 'flex', minHeight: '100vh', background: '#F5F5F5' },
    content: { marginLeft: '240px', flex: 1 },
    inner: { padding: '28px' },
    topRow: { marginBottom: '20px' },
    count: { fontSize: '15px', color: '#555', fontWeight: '600' },
    loading: { textAlign: 'center', padding: '40px', color: '#757575' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
    card: {
        background: '#fff', borderRadius: '12px', overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #E0E0E0'
    },
    photo: {
        height: '130px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', position: 'relative'
    },
    verifiedBadge: {
        position: 'absolute', top: '8px', right: '8px',
        background: '#2E7D32', color: '#fff', fontSize: '10px',
        fontWeight: '700', padding: '2px 8px', borderRadius: '20px'
    },
    info: { padding: '16px' },
    name: { fontWeight: '700', fontSize: '15px', color: '#1A0A0A', marginBottom: '6px' },
    meta: { fontSize: '12px', color: '#757575', marginBottom: '3px' },
    actions: { marginTop: '12px' },
    verifyBtn: {
        padding: '7px 16px', background: '#E8F5E9', color: '#2E7D32',
        border: 'none', borderRadius: '8px', fontSize: '13px',
        fontWeight: '600', cursor: 'pointer', width: '100%'
    },
    verifiedText: { fontSize: '13px', color: '#2E7D32', fontWeight: '600' },
    empty: { gridColumn: '1/-1', textAlign: 'center', padding: '60px' }
};

export default Profiles;