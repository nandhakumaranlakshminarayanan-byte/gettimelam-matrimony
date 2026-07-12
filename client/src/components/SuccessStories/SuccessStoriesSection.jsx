import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000';
const imgUrl = (path) => path ? `${API}${path}` : '';

const HeartIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#DF9B08">
        <path d="M12 20.5C7 16.5 3.5 13.4 3.5 9.7 3.5 7 5.6 5 8.1 5c1.6 0 3 .8 3.9 2.1C12.9 5.8 14.3 5 15.9 5c2.5 0 4.6 2 4.6 4.7 0 3.7-3.5 6.8-8.5 10.8z" />
    </svg>
);

const SuccessStoriesSection = () => {
    const [stories, setStories] = useState([]);

    useEffect(() => {
        axios.get(`${API}/api/testimonials`)
            .then(res => setStories((res.data.testimonials || []).slice(0, 3)))
            .catch(() => setStories([]));
    }, []);

    if (stories.length === 0) return null;

    return (
        <section style={styles.section}>
            <div style={styles.inner}>
                <p style={styles.eyebrow}>
                    <span style={styles.eyebrowLine} /> Real Couples, Real Stories <span style={styles.eyebrowLine} />
                </p>
                <h2 style={styles.title}>Success Stories</h2>
                <p style={styles.subtitle}>Thousands of families have found their perfect match with us</p>

                <div style={styles.grid}>
                    {stories.map(s => (
                        <div key={s._id} style={styles.card}>
                            {s.couplePhoto ? (
                                <img src={imgUrl(s.couplePhoto)} alt={`${s.groomName} & ${s.brideName}`} style={styles.photo} />
                            ) : (
                                <div style={styles.photoFallback}>
                                    <span style={{ fontSize: '30px' }}>👫</span>
                                </div>
                            )}
                            <div style={styles.cardBody}>
                                <div style={styles.names}>
                                    {s.groomName} <HeartIcon /> {s.brideName}
                                </div>
                                <div style={styles.meta}>
                                    {[s.religion, s.city].filter(Boolean).join(' • ')}
                                    {s.marriageDate && ` • ${new Date(s.marriageDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`}
                                </div>
                                {s.message && <p style={styles.message}>"{s.message}"</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const styles = {
    section: {
        background: 'linear-gradient(180deg, #170406 0%, #1C0812 50%, #170406 100%)',
        padding: '70px 24px',
    },
    inner: { maxWidth: '1200px', margin: '0 auto', textAlign: 'center' },
    eyebrow: {
        display: 'inline-flex', alignItems: 'center', gap: '14px',
        fontSize: '12px', fontWeight: '700', letterSpacing: '2.5px', textTransform: 'uppercase',
        color: '#F0B429', marginBottom: '12px',
    },
    eyebrowLine: {
        width: '30px', height: '1px', display: 'inline-block',
        background: 'linear-gradient(90deg, transparent, rgba(240,180,41,0.7), transparent)',
    },
    title: {
        fontFamily: "'Playfair Display', serif", fontStyle: 'italic',
        fontSize: '34px', color: '#FFF8E1', marginBottom: '10px', fontWeight: '500',
    },
    subtitle: { fontSize: '15px', color: '#C9A876', marginBottom: '40px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' },
    card: {
        background: 'rgba(255,255,255,0.045)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(245,217,139,0.2)', borderRadius: '16px',
        overflow: 'hidden', textAlign: 'left',
        boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
    },
    photo: { width: '100%', height: '190px', objectFit: 'cover', display: 'block' },
    photoFallback: {
        width: '100%', height: '190px',
        background: 'linear-gradient(160deg, #3A1020, #22060E)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    cardBody: { padding: '18px 20px 22px' },
    names: {
        display: 'flex', alignItems: 'center', gap: '8px',
        fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: '600',
        color: '#FFF8E1', marginBottom: '6px',
    },
    meta: { fontSize: '12px', color: '#B49BAA', marginBottom: '10px' },
    message: { fontSize: '13px', color: '#CBB6C4', fontStyle: 'italic', lineHeight: 1.6, margin: 0 },
};

export default SuccessStoriesSection;
