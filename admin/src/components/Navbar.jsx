import React from 'react';

const Navbar = ({ title }) => {
    return (
        <div style={styles.navbar}>
            <h1 style={styles.title}>{title}</h1>
            <div style={styles.right}>
                <span style={styles.time}>
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
        background: '#fff',
        padding: '0 28px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #E8D5C4',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    },
    title: {
        fontFamily: "'Georgia', serif",
        fontSize: '20px',
        color: '#1A0A0A',
        fontWeight: '700'
    },
    right: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
    },
    time: {
        fontSize: '13px',
        color: '#7A6055'
    }
};

export default Navbar;