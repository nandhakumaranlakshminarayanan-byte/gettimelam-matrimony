import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const ServicesSection = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const services = [
        { icon: '🏛️', title: t('services.wedding_hall'), desc: t('services.wedding_hall_desc'), color: '#FFF8E1' },
        { icon: '📸', title: t('services.photography'), desc: t('services.photography_desc'), color: '#FFF3E0' },
        { icon: '🍽️', title: t('services.catering'), desc: t('services.catering_desc'), color: '#F1F8E9' },
        { icon: '🚌', title: t('services.transport'), desc: t('services.transport_desc'), color: '#FFF9E6' },
        { icon: '🎪', title: t('services.event_organizer'), desc: t('services.event_organizer_desc'), color: '#FFF8E1' },
        { icon: '💐', title: t('services.decorations'), desc: t('services.decorations_desc'), color: '#FFF3E0' },
        { icon: '🎵', title: t('services.dj_band'), desc: t('services.dj_band_desc'), color: '#F1F8E9' },
        { icon: '✨', title: t('services.more_services'), desc: t('services.more_services_desc'), color: '#FFF9E6' },
    ];

    return (
        <section style={styles.section}>
            <div style={styles.inner}>
                <div style={styles.header}>
                    <p style={styles.label}>💍 {t('services.label')}</p>
                    <h2 style={styles.title}>{t('services.title')}</h2>
                    <p style={styles.desc}>{t('services.desc')}</p>
                </div>
                <div style={styles.grid}>
                    {services.map((s, i) => (
                        <div key={i} style={styles.card}
                            onClick={() => navigate('/services')}
                            onMouseEnter={e => e.currentTarget.style.border = '2px solid #F5BE17'}
                            onMouseLeave={e => e.currentTarget.style.border = '2px solid transparent'}>
                            <div style={{ ...styles.icon, background: s.color }}>{s.icon}</div>
                            <h3 style={styles.cardTitle}>{s.title}</h3>
                            <p style={styles.cardDesc}>{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const styles = {
    section: { padding: '72px 24px', background: '#FFFDF4' },
    inner: { maxWidth: '1200px', margin: '0 auto' },
    header: { textAlign: 'center', marginBottom: '48px' },
    label: { fontSize: '12px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#DF9B08', marginBottom: '10px' },
    title: { fontFamily: "'Playfair Display', serif", fontSize: '38px', color: '#5F0909', marginBottom: '12px' },
    desc: { fontSize: '16px', color: '#7A5C00' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' },
    card: { background: '#fff', borderRadius: '16px', padding: '24px 20px', textAlign: 'center', boxShadow: '0 4px 24px rgba(223,155,8,0.12)', border: '2px solid transparent', cursor: 'pointer', transition: 'all 0.2s' },
    icon: { width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 14px' },
    cardTitle: { fontSize: '15px', fontWeight: '600', color: '#5F0909', marginBottom: '6px' },
    cardDesc: { fontSize: '13px', color: '#7A5C00', lineHeight: 1.5 },
};

export default ServicesSection;
