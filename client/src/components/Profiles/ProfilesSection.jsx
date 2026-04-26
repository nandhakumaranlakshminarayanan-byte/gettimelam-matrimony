import React from 'react';

const ProfilesSection = ({ onLoginClick }) => {
    const profiles = [
        { name: 'Priya S.', age: 25, job: 'Software Engineer', city: 'Chennai', religion: 'Hindu', caste: 'Mudaliar', edu: 'B.Tech', gender: 'female' },
        { name: 'Arun K.', age: 29, job: 'Doctor (MBBS)', city: 'Coimbatore', religion: 'Hindu', caste: 'Mudaliar', edu: 'MBBS', gender: 'male' },
        { name: 'Kavitha R.', age: 24, job: 'Teacher', city: 'Madurai', religion: 'Hindu', caste: 'Nadar', edu: 'B.Ed', gender: 'female' },
        { name: 'Vijay M.', age: 31, job: 'Business', city: 'Salem', religion: 'Hindu', caste: 'Gounder', edu: 'MBA', gender: 'male' },
        { name: 'Deepa N.', age: 26, job: 'Nurse', city: 'Trichy', religion: 'Christian', caste: 'RC', edu: 'B.Sc Nursing', gender: 'female' },
        { name: 'Ramesh T.', age: 28, job: 'Engineer', city: 'Erode', religion: 'Hindu', caste: 'Vanniyar', edu: 'B.E', gender: 'male' },
    ];

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
                        <div key={i} style={styles.card}>
                            <div style={{
                                ...styles.photo,
                                background: p.gender === 'female'
                                    ? 'linear-gradient(135deg, #FDEEF5, #F5D5E8)'
                                    : 'linear-gradient(135deg, #EEF2FD, #D5DEF5)'
                            }}>
                                <span style={styles.avatar}>{p.gender === 'female' ? '👩' : '👨'}</span>
                                <span style={styles.verified}>✓ Verified</span>
                            </div>
                            <div style={styles.info}>
                                <div style={styles.name}>{p.name}</div>
                                <div style={styles.meta}>{p.age} yrs • {p.job} • {p.city}</div>
                                <div style={styles.meta}>{p.religion} • {p.caste} • Tamil</div>
                                <div style={styles.tags}>
                                    <span style={styles.tag}>Never Married</span>
                                    <span style={styles.tag}>{p.edu}</span>
                                    <span style={styles.tag}>{p.city}</span>
                                </div>
                                <div style={styles.actions}>
                                    <button style={styles.btnPrimary} onClick={onLoginClick}>Send Interest</button>
                                    <button style={styles.btnOutline} onClick={onLoginClick}>View Profile</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={styles.center}>
                    <button style={styles.viewAll} onClick={onLoginClick}>View All Profiles →</button>
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
    viewAll: { padding: '12px 32px', background: 'transparent', border: '1.5px solid #8B1A1A', color: '#8B1A1A', borderRadius: '8px', fontSize: '15px', fontWeight: '500', cursor: 'pointer' }
};

export default ProfilesSection;