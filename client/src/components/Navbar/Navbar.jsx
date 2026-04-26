import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onLoginClick, onRegisterClick }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [browseOpen, setBrowseOpen] = useState(false);

    return (
        <nav style={styles.nav}>
            <div style={styles.inner}>

                {/* LOGO */}
                <div style={styles.logo} onClick={() => navigate('/')}>
                    <img
                        src="/logo.png"
                        alt="Gettimelam Matrimony"
                        style={styles.logoImg}
                    />
                </div>

                {/* NAV LINKS */}
                <div style={styles.links}>
                    <span style={styles.link} onClick={() => navigate('/')}>Home</span>

                    {/* Browse Dropdown */}
                    <div
                        style={styles.dropdown}
                        onMouseEnter={() => setBrowseOpen(true)}
                        onMouseLeave={() => setBrowseOpen(false)}
                    >
                        <span style={styles.link} onClick={() => navigate('/browse')}>
                            Browse Profiles ▾
                        </span>
                        {browseOpen && (
                            <div style={styles.dropMenu}>
                                {['Hindu', 'Christian', 'Muslim'].map(r => (
                                    <span
                                        key={r}
                                        style={styles.dropItem}
                                        onClick={() => { navigate(`/browse?religion=${r}`); setBrowseOpen(false); }}
                                    >
                                        {r} Matrimony
                                    </span>
                                ))}
                                <div style={styles.dropDivider} />
                                {[
                                    { label: 'By Location', query: '' },
                                    { label: 'By Profession', query: '' },
                                    { label: 'By Education', query: '' },
                                    { label: 'Divorced', query: '?maritalStatus=Divorced' },
                                    { label: 'Second Marriage', query: '?maritalStatus=Divorced' },
                                ].map(item => (
                                    <span
                                        key={item.label}
                                        style={styles.dropItem}
                                        onClick={() => { navigate(`/browse${item.query}`); setBrowseOpen(false); }}
                                    >
                                        {item.label}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <span style={styles.link} onClick={() => navigate('/services')}>Wedding Services</span>
                    <span style={styles.link} onClick={() => navigate('/horoscope')}>Horoscope</span>
                    <span style={styles.link} onClick={() => navigate('/plans')}>Plans</span>
                    <span style={styles.link} onClick={() => navigate('/blog')}>Blog</span>
                    <span style={styles.link} onClick={() => navigate('/contact')}>Contact</span>
                </div>

                {/* ACTIONS */}
                <div style={styles.actions}>
                    <select style={styles.langSelect}>
                        <option value="en">English</option>
                        <option value="ta">தமிழ்</option>
                    </select>

                    {user ? (
                        <div style={styles.userMenu}>
                            <span style={styles.userName}>👤 {user.name}</span>
                            <button
                                style={styles.btnOutline}
                                onClick={() => navigate('/dashboard')}
                            >
                                Dashboard
                            </button>
                            <button
                                style={styles.btnPrimary}
                                onClick={() => { logout(); navigate('/'); }}
                            >
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
    nav: {
        background: '#fff',
        borderBottom: '1px solid #E8D5C4',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 12px rgba(139,26,26,0.06)'
    },
    inner: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '80px'
    },
    logo: {
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center'
    },
    logoImg: {
        height: '80px',
        objectFit: 'contain'
    },
    links: {
        display: 'flex',
        gap: '2px',
        alignItems: 'center'
    },
    link: {
        fontSize: '13px',
        fontWeight: '500',
        color: '#7A6055',
        textDecoration: 'none',
        padding: '8px 10px',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    dropdown: {
        position: 'relative'
    },
    dropMenu: {
        position: 'absolute',
        top: '100%',
        left: 0,
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(139,26,26,0.15)',
        border: '1px solid #E8D5C4',
        padding: '8px',
        minWidth: '200px',
        zIndex: 200
    },
    dropItem: {
        display: 'block',
        padding: '9px 14px',
        fontSize: '13px',
        color: '#2C1810',
        textDecoration: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background 0.2s'
    },
    dropDivider: {
        height: '1px',
        background: '#E8D5C4',
        margin: '6px 0'
    },
    actions: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    langSelect: {
        padding: '6px 10px',
        border: '1.5px solid #E8D5C4',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#7A6055',
        background: '#FFFDF9',
        cursor: 'pointer'
    },
    btnOutline: {
        padding: '8px 14px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '500',
        background: 'transparent',
        border: '1.5px solid #8B1A1A',
        color: '#8B1A1A',
        cursor: 'pointer'
    },
    btnPrimary: {
        padding: '8px 14px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '500',
        background: '#8B1A1A',
        border: 'none',
        color: '#fff',
        cursor: 'pointer'
    },
    userMenu: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    userName: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#8B1A1A'
    }
};

export default Navbar;