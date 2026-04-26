import React from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

const Services = () => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F5' }}>
            <Sidebar />
            <div style={{ marginLeft: '240px', flex: 1 }}>
                <Navbar title="💍 Manage Services" />
                <div style={{ padding: '28px', textAlign: 'center' }}>
                    <div style={{ fontSize: '60px', marginBottom: '16px' }}>💍</div>
                    <h2>Services Management</h2>
                    <p style={{ color: '#757575', marginTop: '8px' }}>Coming Soon!</p>
                </div>
            </div>
        </div>
    );
};

export default Services;