import React from 'react';

const Navbar = ({ title }) => {
    return (
        <div style={styles.navbar}>
            <div style={styles.titleWrap}>
                <span style={styles.titleAccent} />
                <h1 style={styles.title}>{title}</h1>
            </div>
            <div style={styles.right}>
                <span style={styles.dateChip}>
                    {new Date().toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </span>
            </div>
        </div>
    );
};

const styles = {
    navbar: {
        background: 'rgba(14,9,18,0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        padding: '0 28px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(232,184,75,0.16)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
    },
    titleWrap: { display: 'flex', alignItems: 'center', gap: '12px' },
    titleAccent: {
        width: '4px', height: '22px', borderRadius: '3px',
        background: 'linear-gradient(180deg, #F5D98B, #C9941A)',
        boxShadow: '0 0 12px rgba(232,184,75,0.5)',
    },
    title: {
        fontSize: '17px',
        color: '#F3EDF7',
        fontWeight: '650',
        letterSpacing: '0.3px',
        margin: 0,
    },
    right: { display: 'flex', alignItems: 'center', gap: '10px' },
    dateChip: {
        fontSize: '12px',
        color: '#9C8FA6',
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.04)',
        padding: '7px 14px',
        borderRadius: '999px',
        whiteSpace: 'nowrap',
    },
};

export default Navbar;
