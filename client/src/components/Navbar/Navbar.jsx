import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NotificationBell from './NotificationBell';

const Navbar = ({ onLoginClick, onRegisterClick }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [browseOpen, setBrowseOpen] = useState(false);
    const { t, i18n } = useTranslation();

    const handleLanguageChange = (e) => {
        i18n.changeLanguage(e.target.value);
        localStorage.setItem('gettimelam_language', e.target.value);
    };

    return (
        <nav style={styles.nav}>
            <div style={styles.inner}>

                {/* LOGO */}
                <div style={styles.logo} onClick={() => navigate('/')}>
                    <img src="/logo.png" alt="Gettimelam Matrimony" style={styles.logoImg} />
                </div>

                {/* NAV LINKS */}
                <div style={styles.links}>
                    <span style={styles.link} onClick={() => navigate('/')}>{t('nav.home')}</span>

                    {/* Browse Dropdown */}
                    <div style={styles.dropdown}
                        onMouseEnter={() => setBrowseOpen(true)}
                        onMouseLeave={() => setBrowseOpen(false)}>
                        <span style={styles.link} onClick={() => navigate('/browse')}>
                            {t('nav.browseProfiles')} ▾
                        </span>
                        {browseOpen && (
                            <div style={styles.dropMenu}>
                                {['Hindu', 'Christian', 'Muslim'].map(r => (
                                    <span key={r} style={styles.dropItem}
                                        onClick={() => { navigate(`/browse?religion=${r}`); setBrowseOpen(false); }}>
                                        {r} Matrimony
                                    </span>
                                ))}
                                <div style={styles.dropDivider} />
                                {[
                                    { label: 'By Location', query: '' },
                                    { label: 'By Profession', query: '' },
                                    { label: 'Divorced', query: '?maritalStatus=Divorced' },
                                ].map(item => (
                                    <span key={item.label} style={styles.dropItem}
                                        onClick={() => { navigate(`/browse${item.query}`); setBrowseOpen(false); }}>
                                        {item.label}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <span style={styles.link} onClick={() => navigate('/services')}>{t('nav.weddingServices')}</span>
                    <span style={styles.link} onClick={() => navigate('/horoscope')}>{t('nav.horoscope')}</span>
                    <span style={styles.link} onClick={() => navigate('/plans')}>{t('nav.plans')}</span>
                    <span style={styles.link} onClick={() => navigate('/contact')}>{t('nav.contact')}</span>

                    {user && (
                        <span style={styles.link} onClick={() => navigate('/messages')}>
                            {t('nav.messages')}
                        </span>
                    )}
                </div>

                {/* ACTIONS */}
                <div style={styles.actions}>
                    {user && <NotificationBell />}

                    <select style={styles.langSelect} value={i18n.language} onChange={handleLanguageChange}>
                        <option value="en">English</option>
                        <option value="ta">தமிழ்</option>
                    </select>

                    {user ? (
                        <div style={styles.userMenu}>
                            <span style={styles.userName}>
                                {user.name || user.businessName}
                            </span>

                            {user?.role === 'admin' && (
                                <button style={styles.btnAdmin} onClick={() => navigate('/admin')}>
                                    Admin Panel
                                </button>
                            )}
                            {user?.role === 'member' && (
                                <button style={styles.btnOutline} onClick={() => navigate('/dashboard')}>
                                    Dashboard
                                </button>
                            )}
                            {user?.role === 'service' && (
                                <button style={styles.btnOutline} onClick={() => navigate('/service-provider')}>
                                    My Business
                                </button>
                            )}

                            <button style={styles.btnPrimary} onClick={() => { logout(); navigate('/'); }}>
                                Logout
                            </button>
                        </div>
                    ) : (
                        <>
                            <button style={styles.btnOutline} onClick={onLoginClick}>Login</button>
                            <button style={styles.btnPrimary} onClick={onRegisterClick}>Free Register</button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

const styles = {
    nav: { background: 'linear-gradient(180deg, #241021 0%, #1C0812 100%)', borderBottom: '1px solid rgba(240,180,41,0.45)', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 4px 24px rgba(0,0,0,0.45)' },
    inner: { maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '92px' },
    logo: { cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 },
    logoImg: { height: '130px', maxWidth: '240px', objectFit: 'contain', display: 'block' },
    links: { display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'nowrap' },
    link: { fontSize: '13px', fontWeight: '500', color: '#EDE6F2', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', lineHeight: 1 },
    dropdown: { position: 'relative' },
    dropMenu: { position: 'absolute', top: '100%', left: 0, background: 'rgba(28,8,18,0.96)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderRadius: '12px', boxShadow: '0 14px 40px rgba(0,0,0,0.55)', border: '1px solid rgba(240,180,41,0.4)', padding: '8px', minWidth: '200px', zIndex: 200 },
    dropItem: { display: 'block', padding: '9px 14px', fontSize: '13px', color: '#EDE6F2', borderRadius: '8px', cursor: 'pointer' },
    dropDivider: { height: '1px', background: 'rgba(240,180,41,0.35)', margin: '6px 0' },
    actions: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 },
    langSelect: { padding: '6px 10px', border: '1px solid rgba(240,180,41,0.5)', borderRadius: '8px', fontSize: '13px', color: '#F5D98B', background: 'rgba(255,255,255,0.06)', cursor: 'pointer' },
    btnOutline: { padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(245,217,139,0.55)', color: '#F5D98B', cursor: 'pointer', whiteSpace: 'nowrap' },
    btnPrimary: { padding: '9px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', background: 'linear-gradient(180deg, #F7DE8F 0%, #E3AC2A 45%, #C98F12 55%, #E8BC4A 100%)', border: '1px solid rgba(255,255,255,0.5)', color: '#3D2202', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 6px 18px rgba(223,155,8,0.35), inset 0 1px 0 rgba(255,255,255,0.7)' },
    btnAdmin: { padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(245,217,139,0.55)', color: '#F5D98B', cursor: 'pointer', whiteSpace: 'nowrap' },
    userMenu: { display: 'flex', alignItems: 'center', gap: '8px' },
    userName: { fontSize: '13px', fontWeight: '600', color: '#F5D98B', whiteSpace: 'nowrap', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis' },
};

export default Navbar;