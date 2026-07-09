import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import {
    WeddingHallIcon,
    PhotographyIcon,
    CateringIcon,
    TransportIcon,
    EventOrganizerIcon,
    DecorationsIcon,
    MusicIcon,
    MoreServicesIcon,
} from './ServiceIcons';

// Server origin for admin-uploaded images (stored as relative /uploads/... paths)
const SERVER_URL = (API.defaults?.baseURL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
const imgUrl = (p) => (p && p.startsWith('/') ? `${SERVER_URL}${p}` : p);

// ── Fallback cards (icons, translated) — shown until admin creates cards ──
const fallback_data = [
    { Icon: WeddingHallIcon, key: 'wedding_hall', glow: '#DF9B08', category: 'Wedding Hall/Venue' },
    { Icon: PhotographyIcon, key: 'photography', glow: '#C97B2E', category: 'Photography' },
    { Icon: CateringIcon, key: 'catering', glow: '#8FAE5A', category: 'Catering' },
    { Icon: TransportIcon, key: 'transport', glow: '#DF9B08', category: 'Travel & Accommodation' },
    { Icon: EventOrganizerIcon, key: 'event_organizer', glow: '#B5471B', category: 'Wedding Planner' },
    { Icon: DecorationsIcon, key: 'decorations', glow: '#C9668E', category: 'Event Decoration' },
    { Icon: MusicIcon, key: 'dj_band', glow: '#7B5CC9', category: 'DJ & Entertainment' },
    { Icon: MoreServicesIcon, key: 'more_services', glow: '#DF9B08', category: '' },
];

const HEX_POINTS = '36,2 68,20 68,60 36,78 4,60 4,20';

const ServicesSection = ({ onLoginClick }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [apiCards, setApiCards] = useState([]);

    useEffect(() => {
        API.get('/service-cards')
            .then(res => setApiCards(res.data.cards || []))
            .catch(() => setApiCards([]));
    }, []);

    // Admin cards take over the section when they exist; otherwise fallback
    const services = apiCards.length > 0
        ? apiCards.map(c => ({
            title: c.name,
            desc: c.description,
            glow: c.glow || '#DF9B08',
            image: c.image ? imgUrl(c.image) : '',
            category: c.category || '',
        }))
        : fallback_data.map(s => ({
            ...s,
            title: t(`services.${s.key}`),
            desc: t(`services.${s.key}_desc`),
        }));

    // Redirect to the Services page, pre-filtered to this card's category
    const goToCategory = (category) => {
        if (!user) {
            if (onLoginClick) onLoginClick();
            return;
        }
        navigate(category ? `/services?category=${encodeURIComponent(category)}` : '/services');
    };

    // Show only 2 rows (4 columns × 2 = 8 cards); reveal the rest via Show More
    const VISIBLE_COUNT = 8;
    const [showAll, setShowAll] = useState(false);
    const visibleServices = showAll ? services : services.slice(0, VISIBLE_COUNT);
    const hasMore = services.length > VISIBLE_COUNT;

    return (
        <section style={styles.section}>
            {/* ambient background glow, like the reference's soft light beams */}
            <div style={styles.bgGlowLeft} />
            <div style={styles.bgGlowRight} />

            <div style={styles.inner}>
                <div style={styles.header}>
                    <p style={styles.label}>💍 {t('services.label')}</p>
                    <h2 style={styles.title}>{t('services.title')}</h2>
                    <p style={styles.desc}>{t('services.desc')}</p>
                </div>

                <div style={styles.grid}>
                    {visibleServices.map((s, i) => (
                        <div
                            key={i}
                            style={styles.card}
                            onClick={() => goToCategory(s.category)}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = s.glow;
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = `0 12px 40px ${s.glow}33`;
                                const img = e.currentTarget.querySelector('img');
                                if (img) img.style.transform = 'scale(1.06)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = 'rgba(223,155,8,0.14)';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.35)';
                                const img = e.currentTarget.querySelector('img');
                                if (img) img.style.transform = 'scale(1)';
                            }}
                        >
                            {s.image ? (
                                /* ── Full-width image filling the top of the card ── */
                                <div style={styles.imageWrap}>
                                    <img src={s.image} alt={s.title} style={styles.image} loading="lazy" />
                                    {/* fade into the dark card */}
                                    <div style={styles.imageFade} />
                                    {/* thin accent line in the card's glow color */}
                                    <div style={{ ...styles.imageAccent, background: `linear-gradient(90deg, transparent, ${s.glow}, transparent)` }} />
                                </div>
                            ) : (
                                /* ── Hexagon icon fallback when no image uploaded ── */
                                <div style={styles.hexWrap}>
                                    <div style={{ ...styles.hexGlow, background: s.glow }} />
                                    <svg width="72" height="80" viewBox="0 0 72 80" style={styles.hexSvg}>
                                        <defs>
                                            <linearGradient id={`hexGrad${i}`} x1="0" y1="0" x2="1" y2="1">
                                                <stop offset="0%" stopColor={s.glow} stopOpacity="0.95" />
                                                <stop offset="100%" stopColor="#5F0909" stopOpacity="0.95" />
                                            </linearGradient>
                                        </defs>
                                        <polygon
                                            points={HEX_POINTS}
                                            fill={`url(#hexGrad${i})`}
                                            stroke="rgba(255,255,255,0.25)"
                                            strokeWidth="1"
                                        />
                                    </svg>
                                    {s.Icon && (
                                        <div style={styles.hexIcon}>
                                            <s.Icon color="#FFF8E1" />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div style={styles.cardBody}>
                                <h3 style={styles.cardTitle}>{s.title}</h3>
                                <p style={styles.cardDesc}>{s.desc}</p>

                                <button
                                    style={styles.learnMore}
                                    onClick={e => { e.stopPropagation(); goToCategory(s.category); }}
                                    onMouseEnter={e => { e.currentTarget.style.background = s.glow; e.currentTarget.style.color = '#1A0505'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#F5D98B'; }}
                                >
                                    Learn more
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {hasMore && (
                    <div style={styles.showMoreWrap}>
                        <button
                            style={styles.showMoreBtn}
                            onClick={() => setShowAll(v => !v)}
                            onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#F5D98B,#DF9B08)'; e.currentTarget.style.color = '#1A0505'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#F5D98B'; }}
                        >
                            {showAll
                                ? '− Show Less'
                                : `+ Show More (${services.length - VISIBLE_COUNT})`}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

const styles = {
    section: {
        position: 'relative',
        padding: '80px 24px',
        background: 'radial-gradient(ellipse at top, #2A0C0C 0%, #1A0505 55%, #120303 100%)',
        overflow: 'hidden',
    },
    bgGlowLeft: {
        position: 'absolute', top: '10%', left: '-10%', width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(223,155,8,0.15) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none',
    },
    bgGlowRight: {
        position: 'absolute', bottom: '5%', right: '-10%', width: '450px', height: '450px',
        background: 'radial-gradient(circle, rgba(123,92,201,0.14) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none',
    },
    inner: { position: 'relative', maxWidth: '1200px', margin: '0 auto' },
    header: { textAlign: 'center', marginBottom: '52px' },
    label: { fontSize: '12px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#F0B429', marginBottom: '10px' },
    title: { fontFamily: "'Playfair Display', serif", fontSize: '38px', color: '#FFF8E1', marginBottom: '12px' },
    desc: { fontSize: '16px', color: '#C9A876' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '22px' },
    card: {
        position: 'relative',
        background: 'rgba(255,255,255,0.035)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(223,155,8,0.14)',
        borderRadius: '20px',
        overflow: 'hidden',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
        display: 'flex',
        flexDirection: 'column',
    },
    // ── Full-width image header ──
    imageWrap: {
        position: 'relative',
        width: '100%',
        height: '170px',
        overflow: 'hidden',
        background: '#1A0505',
        flexShrink: 0,
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
        transition: 'transform 0.35s ease',
    },
    imageFade: {
        position: 'absolute', left: 0, right: 0, bottom: 0, height: '60px',
        background: 'linear-gradient(to bottom, transparent, rgba(26,5,5,0.85))',
        pointerEvents: 'none',
    },
    imageAccent: {
        position: 'absolute', left: 0, right: 0, bottom: 0, height: '2px',
        opacity: 0.8,
    },
    // ── Hexagon fallback ──
    hexWrap: {
        position: 'relative', width: '72px', height: '80px', margin: '32px auto 0',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    hexGlow: {
        position: 'absolute', width: '60px', height: '60px', borderRadius: '50%',
        filter: 'blur(22px)', opacity: 0.55, top: '10px',
    },
    hexSvg: { position: 'relative' },
    hexIcon: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-52%)' },
    // ── Card body ──
    cardBody: {
        padding: '20px 20px 26px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flex: 1,
    },
    cardTitle: { fontSize: '16px', fontWeight: '700', color: '#FFF8E1', marginBottom: '8px' },
    cardDesc: { fontSize: '13px', color: '#B8A388', lineHeight: 1.6, marginBottom: '20px', minHeight: '58px', flex: 1 },
    learnMore: {
        border: '1px solid #DF9B08',
        background: 'transparent',
        color: '#F5D98B',
        fontSize: '13px',
        fontWeight: '600',
        padding: '9px 22px',
        borderRadius: '999px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    showMoreWrap: { textAlign: 'center', marginTop: '36px' },
    showMoreBtn: {
        border: '1px solid rgba(245,217,139,0.5)',
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        color: '#F5D98B',
        fontSize: '14px',
        fontWeight: '700',
        letterSpacing: '0.5px',
        padding: '13px 36px',
        borderRadius: '999px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 8px 26px rgba(0,0,0,0.35)',
    },
};

export default ServicesSection;
