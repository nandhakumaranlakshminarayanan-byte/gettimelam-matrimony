import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import axios from 'axios';
import toast from 'react-hot-toast';

const VendorDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [services, setServices] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddService, setShowAddService] = useState(false);
    const [serviceForm, setServiceForm] = useState({
        businessName: user?.businessName || '',
        ownerName: user?.ownerName || '',
        mobile: user?.mobile || '',
        email: user?.email || '',
        category: user?.category || 'Photography',
        description: '',
        city: user?.city || '',
        district: user?.district || '',
        address: '',
        price: '',
        priceMin: '',
        priceMax: '',
        capacity: '',
    });

    useEffect(() => {
        if (!user) { navigate('/'); return; }
        if (user.role !== 'vendor') { navigate('/dashboard'); return; }
        fetchMyServices();
        fetchMyBookings();
    }, [user]);

    const fetchMyServices = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/services/vendor/my', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setServices(res.data.services || []);
        } catch (err) {
            console.log('No services yet');
        }
    };

    const fetchMyBookings = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/bookings/my', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(res.data.bookings || []);
        } catch (err) {
            console.log('No bookings yet');
        }
    };

    const handleAddService = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/services', serviceForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Service listed successfully!');
            setShowAddService(false);
            fetchMyServices();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add service');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'overview', label: '🏠 Overview' },
        { id: 'services', label: '🏪 My Services' },
        { id: 'bookings', label: '📅 Bookings' },
        { id: 'calendar', label: '🗓️ Availability' },
        { id: 'settings', label: '⚙️ Settings' },
    ];

    const categories = [
        'Wedding Hall/Venue', 'Event Decoration', 'Catering', 'Wedding Rentals',
        'Stationery & Cards', 'Photography', 'Videography', 'DJ & Entertainment',
        'Choreography', 'Bridal Makeup & Hair', 'Mehndi Artist', 'Bridal Styling',
        'Wedding Planner', 'Travel & Accommodation', 'Officiant/Priest',
        'Security & Valet', 'Wedding Cake', 'Favors & Gifts', 'Other'
    ];

    return (
        <div style={{ background: '#FFFDF9', minHeight: '100vh' }}>
            <Navbar onLoginClick={() => { }} onRegisterClick={() => { }} />

            <div style={styles.container}>

                {/* SIDEBAR */}
                <div style={styles.sidebar}>
                    <div style={styles.vendorCard}>
                        <div style={styles.vendorIcon}>🏪</div>
                        <div style={styles.vendorName}>{user?.businessName}</div>
                        <div style={styles.vendorSub}>{user?.category}</div>
                        <div style={styles.vendorCity}>{user?.city}, {user?.district}</div>
                        <div style={{
                            ...styles.statusBadge,
                            background: user?.isApproved ? '#E8F5E9' : '#FFF8E1',
                            color: user?.isApproved ? '#2E7D32' : '#F57F17'
                        }}>
                            {user?.isApproved ? '✅ Approved' : '⏳ Pending Approval'}
                        </div>
                    </div>

                    <div style={styles.tabs}>
                        {tabs.map(tab => (
                            <div
                                key={tab.id}
                                style={{ ...styles.tab, ...(activeTab === tab.id ? styles.tabActive : {}) }}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </div>
                        ))}
                        <div
                            style={{ ...styles.tab, color: '#C0392B' }}
                            onClick={() => { logout(); navigate('/'); }}
                        >
                            🚪 Logout
                        </div>
                    </div>
                </div>

                {/* MAIN */}
                <div style={styles.main}>

                    {/* OVERVIEW */}
                    {activeTab === 'overview' && (
                        <div>
                            <h2 style={styles.pageTitle}>Welcome, {user?.ownerName}! 👋</h2>

                            {!user?.isApproved && (
                                <div style={styles.pendingAlert}>
                                    <strong>⏳ Your account is pending admin approval.</strong>
                                    <p style={{ fontSize: '13px', marginTop: '4px', color: '#7A6055' }}>
                                        Our team will review and approve your listing within 24 hours.
                                        You'll be notified once approved.
                                    </p>
                                </div>
                            )}

                            <div style={styles.statsGrid}>
                                {[
                                    { icon: '🏪', label: 'My Services', value: services.length, color: '#FDF0F0' },
                                    { icon: '📅', label: 'Total Bookings', value: bookings.length, color: '#F0F4FF' },
                                    { icon: '⏳', label: 'Pending', value: bookings.filter(b => b.status === 'Pending').length, color: '#FFF8E1' },
                                    { icon: '✅', label: 'Confirmed', value: bookings.filter(b => b.status === 'Confirmed').length, color: '#E8F5E9' },
                                ].map(s => (
                                    <div key={s.label} style={{ ...styles.statCard, background: s.color }}>
                                        <div style={styles.statIcon}>{s.icon}</div>
                                        <div style={styles.statValue}>{s.value}</div>
                                        <div style={styles.statLabel}>{s.label}</div>
                                    </div>
                                ))}
                            </div>

                            <div style={styles.quickActions}>
                                <h3 style={styles.sectionTitle}>Quick Actions</h3>
                                <div style={styles.actionGrid}>
                                    {[
                                        { icon: '➕', label: 'Add New Service', action: () => { setActiveTab('services'); setShowAddService(true); } },
                                        { icon: '🗓️', label: 'Set Availability', action: () => setActiveTab('calendar') },
                                        { icon: '📅', label: 'View Bookings', action: () => setActiveTab('bookings') },
                                        { icon: '⚙️', label: 'Account Settings', action: () => setActiveTab('settings') },
                                    ].map(a => (
                                        <div key={a.label} style={styles.actionCard} onClick={a.action}>
                                            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{a.icon}</div>
                                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#2C1810' }}>{a.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MY SERVICES */}
                    {activeTab === 'services' && (
                        <div>
                            <div style={styles.tabHeader}>
                                <h2 style={styles.pageTitle}>🏪 My Services</h2>
                                <button style={styles.addBtn} onClick={() => setShowAddService(!showAddService)}>
                                    {showAddService ? '✕ Cancel' : '➕ Add Service'}
                                </button>
                            </div>

                            {showAddService && (
                                <div style={styles.formBox}>
                                    <h3 style={styles.formTitle}>Add New Service Listing</h3>
                                    <form onSubmit={handleAddService}>
                                        <div style={styles.formGrid}>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Business Name *</label>
                                                <input style={styles.input} value={serviceForm.businessName}
                                                    onChange={e => setServiceForm({ ...serviceForm, businessName: e.target.value })} required />
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Category *</label>
                                                <select style={styles.input} value={serviceForm.category}
                                                    onChange={e => setServiceForm({ ...serviceForm, category: e.target.value })}>
                                                    {categories.map(c => <option key={c}>{c}</option>)}
                                                </select>
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>City *</label>
                                                <input style={styles.input} value={serviceForm.city} placeholder="e.g. Chennai"
                                                    onChange={e => setServiceForm({ ...serviceForm, city: e.target.value })} required />
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>District</label>
                                                <input style={styles.input} value={serviceForm.district}
                                                    onChange={e => setServiceForm({ ...serviceForm, district: e.target.value })} />
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Min Price (INR)</label>
                                                <input type="number" style={styles.input} value={serviceForm.priceMin} placeholder="e.g. 10000"
                                                    onChange={e => setServiceForm({ ...serviceForm, priceMin: e.target.value })} />
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Max Price (INR)</label>
                                                <input type="number" style={styles.input} value={serviceForm.priceMax} placeholder="e.g. 50000"
                                                    onChange={e => setServiceForm({ ...serviceForm, priceMax: e.target.value })} />
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Capacity</label>
                                                <input style={styles.input} value={serviceForm.capacity} placeholder="e.g. 500 guests"
                                                    onChange={e => setServiceForm({ ...serviceForm, capacity: e.target.value })} />
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Mobile *</label>
                                                <input style={styles.input} value={serviceForm.mobile}
                                                    onChange={e => setServiceForm({ ...serviceForm, mobile: e.target.value })} required />
                                            </div>
                                        </div>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Description</label>
                                            <textarea style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                                                value={serviceForm.description} placeholder="Describe your service..."
                                                onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })} />
                                        </div>
                                        <button type="submit" style={{ ...styles.addBtn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
                                            {loading ? '⏳ Saving...' : '💾 Save Service'}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {services.length === 0 ? (
                                <div style={styles.empty}>
                                    <div style={{ fontSize: '52px', marginBottom: '12px' }}>🏪</div>
                                    <h3>No Services Listed Yet</h3>
                                    <p style={{ color: '#7A6055' }}>Add your first service to start getting bookings</p>
                                </div>
                            ) : (
                                <div style={styles.servicesList}>
                                    {services.map(s => (
                                        <div key={s._id} style={styles.serviceRow}>
                                            <div style={styles.serviceRowInfo}>
                                                <div style={styles.serviceRowName}>{s.businessName}</div>
                                                <div style={styles.serviceRowMeta}>{s.category} • {s.city}</div>
                                                <div style={styles.serviceRowMeta}>₹{s.priceMin} – ₹{s.priceMax}</div>
                                            </div>
                                            <div style={styles.serviceRowActions}>
                                                <span style={{ ...styles.statusPill, background: s.isVerified ? '#E8F5E9' : '#FFF8E1', color: s.isVerified ? '#2E7D32' : '#F57F17' }}>
                                                    {s.isVerified ? '✅ Verified' : '⏳ Pending'}
                                                </span>
                                                <span style={{ ...styles.statusPill, background: s.isActive ? '#E3F2FD' : '#FFEBEE', color: s.isActive ? '#1565C0' : '#C62828' }}>
                                                    {s.isActive ? '🟢 Active' : '🔴 Inactive'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* BOOKINGS */}
                    {activeTab === 'bookings' && (
                        <div>
                            <h2 style={styles.pageTitle}>📅 Bookings</h2>
                            {bookings.length === 0 ? (
                                <div style={styles.empty}>
                                    <div style={{ fontSize: '52px', marginBottom: '12px' }}>📅</div>
                                    <h3>No Bookings Yet</h3>
                                    <p style={{ color: '#7A6055' }}>Bookings from customers will appear here</p>
                                </div>
                            ) : (
                                <div style={styles.servicesList}>
                                    {bookings.map(b => (
                                        <div key={b._id} style={styles.serviceRow}>
                                            <div style={styles.serviceRowInfo}>
                                                <div style={styles.serviceRowName}>{b.service?.businessName || 'Service'}</div>
                                                <div style={styles.serviceRowMeta}>
                                                    📅 {new Date(b.eventDate).toLocaleDateString('en-IN')} • {b.eventType}
                                                </div>
                                                <div style={styles.serviceRowMeta}>👥 {b.guestCount} guests</div>
                                            </div>
                                            <span style={{
                                                ...styles.statusPill,
                                                background: b.status === 'Confirmed' ? '#E8F5E9' : b.status === 'Cancelled' ? '#FFEBEE' : '#FFF8E1',
                                                color: b.status === 'Confirmed' ? '#2E7D32' : b.status === 'Cancelled' ? '#C62828' : '#F57F17'
                                            }}>
                                                {b.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* CALENDAR */}
                    {activeTab === 'calendar' && (
                        <div>
                            <h2 style={styles.pageTitle}>🗓️ Availability Calendar</h2>
                            <div style={styles.calendarInfo}>
                                <p style={{ color: '#7A6055', fontSize: '14px', marginBottom: '16px' }}>
                                    Mark your available and blocked dates so customers can check before booking.
                                </p>
                                {services.length === 0 ? (
                                    <div style={styles.empty}>
                                        <div style={{ fontSize: '52px', marginBottom: '12px' }}>🗓️</div>
                                        <h3>Add a service first</h3>
                                        <p style={{ color: '#7A6055' }}>You need to list a service before setting availability</p>
                                        <button style={styles.addBtn} onClick={() => setActiveTab('services')}>
                                            Add Service
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <p style={{ color: '#8B1A1A', fontWeight: '600', marginBottom: '12px' }}>
                                            Select your service to manage its calendar:
                                        </p>
                                        {services.map(s => (
                                            <div key={s._id} style={styles.serviceRow}>
                                                <div style={styles.serviceRowInfo}>
                                                    <div style={styles.serviceRowName}>{s.businessName}</div>
                                                    <div style={styles.serviceRowMeta}>{s.category} • {s.city}</div>
                                                </div>
                                                <button style={styles.addBtn} onClick={() => toast.success('Calendar editor coming in next update!')}>
                                                    🗓️ Manage Calendar
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* SETTINGS */}
                    {activeTab === 'settings' && (
                        <div>
                            <h2 style={styles.pageTitle}>⚙️ Account Settings</h2>
                            <div style={styles.formBox}>
                                <h3 style={styles.formTitle}>Business Details</h3>
                                <div style={styles.profileView}>
                                    {[
                                        { label: 'Business Name', value: user?.businessName },
                                        { label: 'Owner Name', value: user?.ownerName },
                                        { label: 'Mobile', value: user?.mobile },
                                        { label: 'Email', value: user?.email },
                                        { label: 'Category', value: user?.category },
                                        { label: 'City', value: user?.city },
                                        { label: 'District', value: user?.district },
                                        { label: 'Status', value: user?.isApproved ? '✅ Approved' : '⏳ Pending' },
                                    ].map(item => (
                                        <div key={item.label} style={styles.profileField}>
                                            <span style={styles.fieldLabel}>{item.label}</span>
                                            <span style={styles.fieldValue}>{item.value || '—'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button
                                style={{ ...styles.addBtn, background: '#C0392B', marginTop: '16px' }}
                                onClick={() => { logout(); navigate('/'); }}
                            >
                                🚪 Logout
                            </button>
                        </div>
                    )}

                </div>
            </div>

            <Footer />
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1200px', margin: '0 auto', padding: '32px 24px',
        display: 'grid', gridTemplateColumns: '260px 1fr',
        gap: '24px', alignItems: 'start'
    },
    sidebar: {},
    vendorCard: {
        background: '#fff', borderRadius: '16px', padding: '24px',
        textAlign: 'center', boxShadow: '0 4px 24px rgba(139,26,26,0.08)', marginBottom: '16px'
    },
    vendorIcon: { fontSize: '52px', marginBottom: '8px' },
    vendorName: { fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: '700', color: '#1A0A0A', marginBottom: '4px' },
    vendorSub: { fontSize: '12px', color: '#8B1A1A', fontWeight: '600', marginBottom: '4px' },
    vendorCity: { fontSize: '12px', color: '#7A6055', marginBottom: '12px' },
    statusBadge: { display: 'inline-block', padding: '5px 14px', borderRadius: '50px', fontSize: '12px', fontWeight: '600' },
    tabs: { background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(139,26,26,0.08)' },
    tab: { padding: '14px 20px', fontSize: '14px', fontWeight: '500', color: '#7A6055', cursor: 'pointer', borderBottom: '1px solid #F5EAE0' },
    tabActive: { background: '#FDF0F0', color: '#8B1A1A', fontWeight: '700', borderLeft: '3px solid #8B1A1A' },
    main: { background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 24px rgba(139,26,26,0.08)', minHeight: '600px' },
    pageTitle: { fontFamily: "'Playfair Display', serif", fontSize: '26px', color: '#1A0A0A', marginBottom: '24px' },
    pendingAlert: { background: '#FFF8E1', border: '1px solid #FFE082', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
    statCard: { borderRadius: '12px', padding: '20px', textAlign: 'center' },
    statIcon: { fontSize: '28px', marginBottom: '8px' },
    statValue: { fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: '700', color: '#8B1A1A', marginBottom: '4px' },
    statLabel: { fontSize: '12px', color: '#7A6055' },
    sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: '20px', color: '#1A0A0A', marginBottom: '16px' },
    quickActions: { marginTop: '8px' },
    actionGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' },
    actionCard: {
        background: '#FDF5EE', borderRadius: '12px', padding: '20px',
        textAlign: 'center', cursor: 'pointer', border: '1px solid #E8D5C4',
        transition: 'all 0.2s'
    },
    tabHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    addBtn: {
        padding: '10px 20px', background: '#8B1A1A', color: '#fff',
        border: 'none', borderRadius: '8px', fontSize: '13px',
        fontWeight: '600', cursor: 'pointer'
    },
    formBox: { background: '#FFFDF9', border: '1px solid #E8D5C4', borderRadius: '12px', padding: '24px', marginBottom: '24px' },
    formTitle: { fontSize: '16px', fontWeight: '700', color: '#8B1A1A', marginBottom: '16px' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    formGroup: { marginBottom: '16px' },
    label: { display: 'block', fontSize: '11px', fontWeight: '600', color: '#7A6055', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    input: {
        width: '100%', padding: '11px 14px', border: '1.5px solid #E8D5C4',
        borderRadius: '8px', fontSize: '14px', color: '#2C1810',
        background: '#fff', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box'
    },
    servicesList: { display: 'flex', flexDirection: 'column', gap: '12px' },
    serviceRow: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 20px', background: '#FDF5EE', borderRadius: '12px', border: '1px solid #E8D5C4'
    },
    serviceRowInfo: {},
    serviceRowName: { fontWeight: '700', color: '#1A0A0A', fontSize: '15px', marginBottom: '4px' },
    serviceRowMeta: { fontSize: '12px', color: '#7A6055' },
    serviceRowActions: { display: 'flex', gap: '8px' },
    statusPill: { padding: '5px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: '600' },
    empty: { textAlign: 'center', padding: '60px 20px' },
    calendarInfo: {},
    profileView: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' },
    profileField: { display: 'flex', flexDirection: 'column', padding: '12px 16px', borderBottom: '1px solid #F5EAE0' },
    fieldLabel: { fontSize: '11px', fontWeight: '600', color: '#7A6055', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' },
    fieldValue: { fontSize: '14px', color: '#2C1810', fontWeight: '500' },
};

export default VendorDashboard;