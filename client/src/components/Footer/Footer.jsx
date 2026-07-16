import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import SupportChatWidget from '../Support/SupportChatWidget';
import LoginModal from '../Modals/LoginModal';
import { useSupportUnread } from '../../hooks/useSupportUnread';

const Footer = () => {
    const { user } = useAuth();
    const [showSupportChat, setShowSupportChat] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const { unread: supportUnread, clear: clearSupportUnread } = useSupportUnread();

    const handleSupportClick = (e) => {
        e.preventDefault();
        if (!user) { setShowLogin(true); return; }
        setShowSupportChat(true);
        clearSupportUnread();
    };

    return (
        <footer style={styles.footer}>
            <div style={styles.inner}>
                <div style={styles.grid}>
                    <div>
                        <img src="/logo.png" alt="Gettimelam" style={styles.logo} />
                        <p style={styles.desc}>Tamil Nadu's trusted matrimony platform connecting hearts since 2024.</p>
                        <div style={styles.contact}>
                            <p>📞 +91 99999 99999</p>
                            <p>📧 info@gettimelam.com</p>
                        </div>
                    </div>
                    <div>
                        <h4 style={styles.colTitle}>Browse Profiles</h4>
                        {['Hindu Matrimony', 'Muslim Matrimony', 'Christian Matrimony', 'By Location', 'By Profession', 'Divorced'].map(l => (
                            <a key={l} href="/browse" style={styles.link}>{l}</a>
                        ))}
                    </div>
                    <div>
                        <h4 style={styles.colTitle}>Wedding Services</h4>
                        {['Wedding Hall', 'Photography', 'Catering', 'Transport', 'Decorations', 'DJ & Band'].map(l => (
                            <a key={l} href="/services" style={styles.link}>{l}</a>
                        ))}
                    </div>
                    <div>
                        <h4 style={styles.colTitle}>Company</h4>
                        {['About Us', 'Contact Us'].map(l => (
                            <a key={l} href="/" style={styles.link}>{l}</a>
                        ))}
                        {/* Opens the live support chat instead of navigating */}
                        <a href="/" onClick={handleSupportClick} style={{ ...styles.link, ...styles.supportLink }}>
                            💬 Chat with Support Team
                            {user && supportUnread && <span style={styles.supportDot} />}
                        </a>
                        {['Plans & Pricing', 'Blog', 'Privacy Policy', 'Terms & Conditions'].map(l => (
                            <a key={l} href="/" style={styles.link}>{l}</a>
                        ))}
                    </div>
                </div>
                <div style={styles.bottom}>
                    <p>© 2024 Gettimelam Matrimony. All rights reserved.</p>
                    <p style={styles.madeWith}>Made with ❤️ for Indian families</p>
                </div>
            </div>

            <SupportChatWidget open={showSupportChat} onClose={() => setShowSupportChat(false)} />
            {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
        </footer>
    );
};

const styles = {
    footer: { background: 'linear-gradient(135deg, #5F0909, #3D0606)', color: 'rgba(255,255,255,0.7)' },
    inner: { maxWidth: '1200px', margin: '0 auto', padding: '56px 24px 32px' },
    grid: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '48px', marginBottom: '48px' },
    logo: { height: '95px', marginBottom: '2px', display: 'block' },
    desc: { fontSize: '13px', lineHeight: 1.7, marginBottom: '16px', color: 'rgba(255,255,255,0.6)' },
    contact: { fontSize: '13px', lineHeight: 2, color: 'rgba(255,255,255,0.6)' },
    colTitle: { color: '#F5BE17', fontSize: '14px', fontWeight: '700', marginBottom: '16px' },
    link: { display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', marginBottom: '8px' },
    supportLink: { color: '#F5D98B', fontWeight: '600', cursor: 'pointer' },
    supportDot: { display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: '#FF6B6B', marginLeft: '6px', verticalAlign: 'middle' },
    bottom: { borderTop: '1px solid rgba(245,190,23,0.2)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' },
    madeWith: { color: '#F5BE17', fontWeight: '600' }
};

export default Footer;
