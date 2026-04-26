import React from 'react';

const Footer = () => {
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
                        {['About Us', 'Contact Us', 'Plans & Pricing', 'Blog', 'Privacy Policy', 'Terms & Conditions'].map(l => (
                            <a key={l} href="/" style={styles.link}>{l}</a>
                        ))}
                    </div>
                </div>

                <div style={styles.bottom}>
                    <p>© 2024 Gettimelam Matrimony. All rights reserved.</p>
                    <p style={styles.madeWith}>Made with ❤️ for Tamil families</p>
                </div>
            </div>
        </footer>
    );
};

const styles = {
    footer: { background: '#1A0A0A', color: 'rgba(255,255,255,0.6)' },
    inner: { maxWidth: '1200px', margin: '0 auto', padding: '56px 24px 32px' },
    grid: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '48px', marginBottom: '48px' },
    logo: { height: '50px', marginBottom: '12px' },
    desc: { fontSize: '13px', lineHeight: 1.7, marginBottom: '16px' },
    contact: { fontSize: '13px', lineHeight: 2 },
    colTitle: { color: '#fff', fontSize: '14px', fontWeight: '600', marginBottom: '16px' },
    link: { display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', marginBottom: '8px' },
    bottom: { borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' },
    madeWith: { color: '#C9A84C' }
};

export default Footer;