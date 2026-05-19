import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:5000';

const BannerSlider = () => {
    const navigate = useNavigate();
    const [banners, setBanners] = useState([]);
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBanners();
    }, []);

    useEffect(() => {
        if (banners.length <= 1) return;
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % banners.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [banners]);

    const fetchBanners = async () => {
        try {
            const res = await axios.get(`${API}/api/banners`);
            setBanners(res.data.banners || []);
        } catch (err) {
            setBanners([]);
        } finally {
            setLoading(false);
        }
    };

    const prev = () => setCurrent(p => (p - 1 + banners.length) % banners.length);
    const next = () => setCurrent(p => (p + 1) % banners.length);

    if (loading || banners.length === 0) return null;

    const banner = banners[current];

    return (
        <div style={styles.sliderWrap}>
            {/* Banner Slide */}
            <div
                style={{
                    ...styles.slide,
                    background: banner.imageUrl
                        ? `url(${banner.imageUrl}) center/cover no-repeat`
                        : 'linear-gradient(135deg, #1A0A0A, #3D1A1A)',
                    cursor: banner.linkUrl ? 'pointer' : 'default'
                }}
                onClick={() => {
                    if (banner.linkUrl) {
                        if (banner.linkUrl.startsWith('http')) {
                            window.open(banner.linkUrl, '_blank');
                        } else {
                            navigate(banner.linkUrl);
                        }
                    }
                }}
            >
                {/* Text Overlay */}
                {(banner.title || banner.subtitle) && (
                    <div style={styles.overlay}>
                        {banner.title && (
                            <h2 style={styles.bannerTitle}>{banner.title}</h2>
                        )}
                        {banner.subtitle && (
                            <p style={styles.bannerSubtitle}>{banner.subtitle}</p>
                        )}
                    </div>
                )}

                {/* Prev Arrow */}
                {banners.length > 1 && (
                    <button style={{ ...styles.arrow, left: '16px' }}
                        onClick={(e) => { e.stopPropagation(); prev(); }}>
                        ‹
                    </button>
                )}

                {/* Next Arrow */}
                {banners.length > 1 && (
                    <button style={{ ...styles.arrow, right: '16px' }}
                        onClick={(e) => { e.stopPropagation(); next(); }}>
                        ›
                    </button>
                )}
            </div>

            {/* Dot Indicators */}
            {banners.length > 1 && (
                <div style={styles.dots}>
                    {banners.map((_, i) => (
                        <div key={i}
                            style={{
                                ...styles.dot,
                                background: i === current ? '#8B1A1A' : 'rgba(139,26,26,0.3)',
                                width: i === current ? '24px' : '8px',
                            }}
                            onClick={() => setCurrent(i)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const styles = {
    sliderWrap: { width: '100%', position: 'relative', background: '#1A0A0A' },
    slide: { width: '100%', height: '450px', position: 'relative', display: 'flex', alignItems: 'flex-end', transition: 'all 0.5s ease' },
    overlay: { position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)', padding: '40px 48px 32px' },
    bannerTitle: { fontFamily: "'Playfair Display', serif", fontSize: '32px', color: '#fff', marginBottom: '8px', textShadow: '0 2px 8px rgba(0,0,0,0.5)' },
    bannerSubtitle: { fontSize: '16px', color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 4px rgba(0,0,0,0.5)' },
    arrow: { position: 'absolute', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', width: '44px', height: '44px', borderRadius: '50%', fontSize: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, lineHeight: 1, transition: 'all 0.2s' },
    dots: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', padding: '12px 0', background: '#fff' },
    dot: { height: '8px', borderRadius: '50px', cursor: 'pointer', transition: 'all 0.3s ease' },
};

export default BannerSlider;