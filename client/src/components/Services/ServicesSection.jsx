import React from 'react';

const services = [
    { icon: '🏛️', title: 'Wedding Hall', desc: 'Book premium marriage halls with live availability', color: '#FFF8E1' },
    { icon: '📸', title: 'Photography', desc: 'Top-rated wedding photographers & videographers', color: '#FFF3E0' },
    { icon: '🍽️', title: 'Catering', desc: 'Traditional & modern catering for all group sizes', color: '#F1F8E9' },
    { icon: '🚌', title: 'Transport', desc: 'Bridal cars, buses & fleet services', color: '#FFF9E6' },
    { icon: '🎪', title: 'Event Organizer', desc: 'Complete event management & planning', color: '#FFF8E1' },
    { icon: '💐', title: 'Decorations', desc: 'Floral, thematic & traditional decorations', color: '#FFF3E0' },
    { icon: '🎵', title: 'DJ & Band', desc: 'Live music, DJ & nadaswaram services', color: '#F1F8E9' },
    { icon: '✨', title: 'More Services', desc: 'Mehendi, makeup, honeymoon packages & more', color: '#FFF9E6' },
];

const ServicesSection = () => {
    return (
        <section style={styles.section}>
            <div style={styles.inner}>
                <div style={styles.header}>
                    <p style={styles.label}>💍 Wedding Services</p>
                    <h2 style={styles.title}>Everything You Need After Finding Your Match</h2>
                    <p style={styles.desc}>Book trusted local vendors with live availability calendars</p>
                </div>
                <div style={styles.grid}>
                    {services.map((s, i) => (
                        <div key={i} style={styles.card}
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