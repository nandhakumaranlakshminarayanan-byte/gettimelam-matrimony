import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = 'http://localhost:5000';

const ServiceProvider = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [services, setServices] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddService, setShowAddService] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [availability, setAvailability] = useState([]);
    const [calendarMonth, setCalendarMonth] = useState(new Date());
    const [packages, setPackages] = useState([]);
    const [showAddPackage, setShowAddPackage] = useState(false);
    const [packageServiceId, setPackageServiceId] = useState('');
    const [editingPackage, setEditingPackage] = useState(null);
    const [packageForm, setPackageForm] = useState({ name: '', description: '', price: '', features: '' });
    const [packagePhotos, setPackagePhotos] = useState([]);

    const [serviceForm, setServiceForm] = useState({
        businessName: user?.businessName || '', ownerName: user?.ownerName || '',
        mobile: user?.mobile || '', email: user?.email || '',
        category: user?.category || 'Photography', description: '',
        city: user?.city || '', district: user?.district || '',
        address: '', price: '', priceMin: '', priceMax: '', capacity: '',
    });

    useEffect(() => {
        if (!user) { navigate('/'); return; }
        if (user.role !== 'service') { navigate('/dashboard'); return; }
        fetchMyServices();
        fetchMyBookings();
    }, [user]);

    const fetchMyServices = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/services/vendor/my`, { headers: { Authorization: `Bearer ${token}` } });
            setServices(res.data.services || []);
        } catch (err) { console.log('No services yet'); }
    };

    const fetchMyBookings = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/bookings/vendor`, { headers: { Authorization: `Bearer ${token}` } });
            setBookings(res.data.bookings || []);
        } catch (err) { console.log('No bookings yet'); }
    };

    const fetchPackages = async (serviceId) => {
        try {
            const res = await axios.get(`${API}/api/service-menu/${serviceId}`);
            setPackages(res.data.menus || []);
        } catch (err) { setPackages([]); }
    };

    const handleAddService = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API}/api/services`, serviceForm, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Service listed successfully!');
            setShowAddService(false);
            fetchMyServices();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add service');
        } finally { setLoading(false); }
    };

    const handleConfirmBooking = async (bookingId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API}/api/bookings/${bookingId}`, { status: 'Confirmed' }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Booking confirmed!');
            fetchMyBookings();
        } catch (err) { toast.error('Failed to confirm booking'); }
    };

    const handleCancelBooking = async (bookingId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API}/api/bookings/${bookingId}`, { status: 'Cancelled' }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Booking cancelled!');
            fetchMyBookings();
        } catch (err) { toast.error('Failed to cancel booking'); }
    };

    const handleSavePackage = async (e) => {
        e.preventDefault();
        if (!packageServiceId) { toast.error('Select a service first!'); return; }
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('serviceId', packageServiceId);
            formData.append('name', packageForm.name);
            formData.append('description', packageForm.description);
            formData.append('price', packageForm.price);
            formData.append('features', packageForm.features);
            packagePhotos.forEach(photo => formData.append('photos', photo));

            if (editingPackage) {
                await axios.put(`${API}/api/service-menu/${editingPackage._id}`,
                    { name: packageForm.name, description: packageForm.description, price: packageForm.price, features: packageForm.features },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success('Package updated! ✅');
            } else {
                await axios.post(`${API}/api/service-menu`, formData, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Package added! ✅');
            }
            setShowAddPackage(false);
            setEditingPackage(null);
            setPackageForm({ name: '', description: '', price: '', features: '' });
            setPackagePhotos([]);
            fetchPackages(packageServiceId);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed!');
        } finally { setLoading(false); }
    };

    const handleDeletePackage = async (packageId) => {
        if (!window.confirm('Delete this package?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API}/api/service-menu/${packageId}`, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Package deleted!');
            fetchPackages(packageServiceId);
        } catch (err) { toast.error('Failed to delete!'); }
    };

    const handleTogglePackage = async (packageId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${API}/api/service-menu/${packageId}/toggle`, {}, { headers: { Authorization: `Bearer ${token}` } });
            toast.success(res.data.message);
            fetchPackages(packageServiceId);
        } catch (err) { toast.error('Failed!'); }
    };

    const handleEditPackage = (pkg) => {
        setEditingPackage(pkg);
        setPackageForm({ name: pkg.name, description: pkg.description || '', price: pkg.price || '', features: (pkg.features || []).join(', ') });
        setShowAddPackage(true);
    };

    const loadAvailability = async (service) => {
        setSelectedService(service);
        try {
            const res = await axios.get(`${API}/api/services/${service._id}/availability`);
            setAvailability(res.data.availability || []);
        } catch (err) { setAvailability([]); }
    };

    const toLocalDateStr = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

    const getDateStatus = (date) => {
        const dStr = toLocalDateStr(date);
        const found = availability.find(a => {
            const aDate = new Date(a.date);
            return `${aDate.getUTCFullYear()}-${aDate.getUTCMonth()}-${aDate.getUTCDate()}` === dStr;
        });
        return found ? found.status : 'available';
    };

    const toggleDateStatus = async (date) => {
        const current = getDateStatus(date);
        const next = current === 'available' ? 'blocked' : current === 'blocked' ? 'booked' : 'available';
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        const dateStr = localDate.toISOString().split('T')[0];
        const dStr = toLocalDateStr(date);
        const exists = availability.find(a => {
            const aDate = new Date(a.date);
            return `${aDate.getUTCFullYear()}-${aDate.getUTCMonth()}-${aDate.getUTCDate()}` === dStr;
        });
        const newAvailability = exists
            ? availability.map(a => {
                const aDate = new Date(a.date);
                return `${aDate.getUTCFullYear()}-${aDate.getUTCMonth()}-${aDate.getUTCDate()}` === dStr ? { ...a, status: next } : a;
            })
            : [...availability, { date: dateStr, status: next }];
        setAvailability(newAvailability);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API}/api/services/${selectedService._id}/availability`, { availability: newAvailability }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success(`Date marked as ${next}!`);
        } catch (err) { toast.error('Failed to update availability'); }
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        return { firstDay, daysInMonth, year, month };
    };

    const { firstDay, daysInMonth, year, month } = getDaysInMonth(calendarMonth);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const tabs = [
        { id: 'overview', label: '🏠 Overview' },
        { id: 'services', label: '🏪 My Services' },
        { id: 'packages', label: '📦 Packages' },
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
        <div style={{ background: '#FFF8E1', minHeight: '100vh' }}>
            <Navbar onLoginClick={() => { }} onRegisterClick={() => { }} />

            <div style={styles.container}>
                {/* SIDEBAR */}
                <div style={styles.sidebar}>
                    <div style={styles.vendorCard}>
                        <div style={styles.vendorIcon}>🏪</div>
                        <div style={styles.vendorName}>{user?.businessName}</div>
                        <div style={styles.vendorSub}>{user?.category}</div>
                        <div style={styles.vendorCity}>{user?.city}, {user?.district}</div>
                        <div style={{ ...styles.statusBadge, background: user?.isApproved ? '#E8F5E9' : '#FFF8E1', color: user?.isApproved ? '#2E7D32' : '#F57F17' }}>
                            {user?.isApproved ? '✅ Approved' : '⏳ Pending Approval'}
                        </div>
                    </div>

                    <div style={styles.tabs}>
                        {tabs.map(tab => (
                            <div key={tab.id}
                                style={{ ...styles.tab, ...(activeTab === tab.id ? styles.tabActive : {}) }}
                                onClick={() => setActiveTab(tab.id)}>
                                {tab.label}
                            </div>
                        ))}
                        <div style={{ ...styles.tab, color: '#B71C1C' }} onClick={() => { logout(); navigate('/'); }}>
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
                                    <p style={{ fontSize: '13px', marginTop: '4px', color: '#7A5C00' }}>
                                        Our team will review and approve your listing within 24 hours.
                                    </p>
                                </div>
                            )}
                            <div style={styles.statsGrid}>
                                {[
                                    { icon: '🏪', label: 'My Services', value: services.length, color: '#FFF8E1' },
                                    { icon: '📅', label: 'Total Bookings', value: bookings.length, color: '#FFF3E0' },
                                    { icon: '⏳', label: 'Pending', value: bookings.filter(b => b.status === 'Pending').length, color: '#FFF9E6' },
                                    { icon: '✅', label: 'Confirmed', value: bookings.filter(b => b.status === 'Confirmed').length, color: '#F1F8E9' },
                                ].map(s => (
                                    <div key={s.label} style={{ ...styles.statCard, background: s.color }}>
                                        <div style={styles.statIcon}>{s.icon}</div>
                                        <div style={styles.statValue}>{s.value}</div>
                                        <div style={styles.statLabel}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                            <h3 style={styles.sectionTitle}>Quick Actions</h3>
                            <div style={styles.actionGrid}>
                                {[
                                    { icon: '➕', label: 'Add New Service', action: () => { setActiveTab('services'); setShowAddService(true); } },
                                    { icon: '📦', label: 'Add Package', action: () => setActiveTab('packages') },
                                    { icon: '📅', label: 'View Bookings', action: () => setActiveTab('bookings') },
                                    { icon: '⚙️', label: 'Settings', action: () => setActiveTab('settings') },
                                ].map(a => (
                                    <div key={a.label} style={styles.actionCard} onClick={a.action}>
                                        <div style={{ fontSize: '28px', marginBottom: '8px' }}>{a.icon}</div>
                                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#5F0909' }}>{a.label}</div>
                                    </div>
                                ))}
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
                                            {[
                                                { label: 'Business Name *', name: 'businessName', type: 'text', required: true },
                                                { label: 'City *', name: 'city', type: 'text', placeholder: 'e.g. Chennai', required: true },
                                                { label: 'District', name: 'district', type: 'text' },
                                                { label: 'Min Price (INR)', name: 'priceMin', type: 'number', placeholder: 'e.g. 10000' },
                                                { label: 'Max Price (INR)', name: 'priceMax', type: 'number', placeholder: 'e.g. 50000' },
                                                { label: 'Capacity', name: 'capacity', type: 'text', placeholder: 'e.g. 500 guests' },
                                                { label: 'Mobile *', name: 'mobile', type: 'text', required: true },
                                            ].map(f => (
                                                <div key={f.name} style={styles.formGroup}>
                                                    <label style={styles.label}>{f.label}</label>
                                                    <input style={styles.input} type={f.type || 'text'}
                                                        value={serviceForm[f.name]} placeholder={f.placeholder}
                                                        required={f.required}
                                                        onChange={e => setServiceForm({ ...serviceForm, [f.name]: e.target.value })} />
                                                </div>
                                            ))}
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Category *</label>
                                                <select style={styles.input} value={serviceForm.category}
                                                    onChange={e => setServiceForm({ ...serviceForm, category: e.target.value })}>
                                                    {categories.map(c => <option key={c}>{c}</option>)}
                                                </select>
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
                                    <p style={{ color: '#7A5C00' }}>Add your first service to start getting bookings</p>
                                </div>
                            ) : (
                                <div style={styles.servicesList}>
                                    {services.map(s => (
                                        <div key={s._id} style={styles.serviceRow}>
                                            <div style={styles.serviceRowInfo}>
                                                <div style={styles.serviceRowName}>{s.businessName}</div>
                                                <div style={styles.serviceRowMeta}>{s.category} • {s.city}</div>
                                                <div style={styles.serviceRowMeta}>
                                                    {s.priceMin && s.priceMax ? `₹${s.priceMin} - ₹${s.priceMax}` : s.price || 'Price not set'}
                                                </div>
                                            </div>
                                            <div style={styles.serviceRowActions}>
                                                <span style={{ ...styles.statusPill, background: s.isVerified ? '#E8F5E9' : '#FFF8E1', color: s.isVerified ? '#2E7D32' : '#F57F17' }}>
                                                    {s.isVerified ? '✅ Verified' : '⏳ Pending'}
                                                </span>
                                                <button style={{ ...styles.addBtn, padding: '6px 14px', fontSize: '12px', background: '#1565C0' }}
                                                    onClick={() => { setActiveTab('packages'); setPackageServiceId(s._id); fetchPackages(s._id); }}>
                                                    📦 Packages
                                                </button>
                                                <button style={{ ...styles.addBtn, padding: '6px 14px', fontSize: '12px' }}
                                                    onClick={() => { setActiveTab('calendar'); loadAvailability(s); }}>
                                                    🗓️ Calendar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* PACKAGES TAB */}
                    {activeTab === 'packages' && (
                        <div>
                            <div style={styles.tabHeader}>
                                <h2 style={styles.pageTitle}>📦 Packages & Themes</h2>
                                <button style={styles.addBtn} onClick={() => {
                                    setShowAddPackage(!showAddPackage);
                                    setEditingPackage(null);
                                    setPackageForm({ name: '', description: '', price: '', features: '' });
                                }}>
                                    {showAddPackage ? '✕ Cancel' : '➕ Add Package'}
                                </button>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={styles.label}>Select Service</label>
                                <select style={styles.input} value={packageServiceId}
                                    onChange={e => { setPackageServiceId(e.target.value); fetchPackages(e.target.value); }}>
                                    <option value="">-- Select a Service --</option>
                                    {services.map(s => (
                                        <option key={s._id} value={s._id}>{s.businessName} — {s.category}</option>
                                    ))}
                                </select>
                            </div>

                            {showAddPackage && (
                                <div style={styles.formBox}>
                                    <h3 style={styles.formTitle}>{editingPackage ? '✏️ Edit Package' : '➕ Add New Package'}</h3>
                                    <form onSubmit={handleSavePackage}>
                                        <div style={styles.formGrid}>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Package Name *</label>
                                                <input style={styles.input} placeholder="e.g. Gold Package, Royal Theme"
                                                    value={packageForm.name} required
                                                    onChange={e => setPackageForm({ ...packageForm, name: e.target.value })} />
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Price *</label>
                                                <input style={styles.input} placeholder="e.g. ₹25,000"
                                                    value={packageForm.price} required
                                                    onChange={e => setPackageForm({ ...packageForm, price: e.target.value })} />
                                            </div>
                                        </div>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Description</label>
                                            <textarea style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                                                placeholder="Describe this package..."
                                                value={packageForm.description}
                                                onChange={e => setPackageForm({ ...packageForm, description: e.target.value })} />
                                        </div>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Features (comma separated)</label>
                                            <input style={styles.input}
                                                placeholder="e.g. 200 guests, DJ, Catering"
                                                value={packageForm.features}
                                                onChange={e => setPackageForm({ ...packageForm, features: e.target.value })} />
                                        </div>
                                        {!editingPackage && (
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Package Photos (up to 10)</label>
                                                <input type="file" multiple accept="image/*"
                                                    style={{ ...styles.input, padding: '8px' }}
                                                    onChange={e => setPackagePhotos(Array.from(e.target.files))} />
                                                {packagePhotos.length > 0 && (
                                                    <p style={{ fontSize: '12px', color: '#7A5C00', marginTop: '4px' }}>
                                                        {packagePhotos.length} photo(s) selected
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        <button type="submit" style={{ ...styles.addBtn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
                                            {loading ? '⏳ Saving...' : editingPackage ? '💾 Update Package' : '💾 Save Package'}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {!packageServiceId ? (
                                <div style={styles.empty}>
                                    <div style={{ fontSize: '52px', marginBottom: '12px' }}>📦</div>
                                    <h3>Select a Service</h3>
                                    <p style={{ color: '#7A5C00' }}>Select a service above to manage its packages</p>
                                </div>
                            ) : packages.length === 0 ? (
                                <div style={styles.empty}>
                                    <div style={{ fontSize: '52px', marginBottom: '12px' }}>📦</div>
                                    <h3>No Packages Yet!</h3>
                                    <p style={{ color: '#7A5C00' }}>Add packages/themes for customers to choose from</p>
                                </div>
                            ) : (
                                <div style={styles.packagesGrid}>
                                    {packages.map(pkg => (
                                        <div key={pkg._id} style={{
                                            ...styles.packageCard,
                                            opacity: pkg.isActive ? 1 : 0.6,
                                            border: pkg.isActive ? '1.5px solid #F5BE17' : '1.5px dashed #ccc'
                                        }}>
                                            {pkg.photos && pkg.photos.length > 0 && (
                                                <div style={styles.pkgPhotoRow}>
                                                    {pkg.photos.slice(0, 3).map((photo, i) => (
                                                        <img key={i} src={`${API}${photo}`} alt="" style={styles.pkgPhoto} />
                                                    ))}
                                                    {pkg.photos.length > 3 && (
                                                        <div style={styles.pkgPhotoMore}>+{pkg.photos.length - 3}</div>
                                                    )}
                                                </div>
                                            )}
                                            <div style={styles.pkgBody}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                    <div style={styles.pkgName}>{pkg.name}</div>
                                                    <div style={styles.pkgPrice}>₹{pkg.price}</div>
                                                </div>
                                                {pkg.description && <p style={styles.pkgDesc}>{pkg.description}</p>}
                                                {pkg.features && pkg.features.length > 0 && (
                                                    <div style={styles.featuresRow}>
                                                        {pkg.features.map((f, i) => (
                                                            <span key={i} style={styles.featureTag}>✓ {f}</span>
                                                        ))}
                                                    </div>
                                                )}
                                                <div style={styles.pkgActions}>
                                                    <button style={{ ...styles.pkgBtn, background: '#1565C0' }} onClick={() => handleEditPackage(pkg)}>✏️ Edit</button>
                                                    <button style={{ ...styles.pkgBtn, background: pkg.isActive ? '#F57F17' : '#2E7D32' }} onClick={() => handleTogglePackage(pkg._id)}>
                                                        {pkg.isActive ? '⏸ Hide' : '▶ Show'}
                                                    </button>
                                                    <button style={{ ...styles.pkgBtn, background: '#C62828' }} onClick={() => handleDeletePackage(pkg._id)}>🗑 Delete</button>
                                                </div>
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
                            <h2 style={styles.pageTitle}>📅 Bookings ({bookings.length})</h2>
                            {bookings.length === 0 ? (
                                <div style={styles.empty}>
                                    <div style={{ fontSize: '52px', marginBottom: '12px' }}>📅</div>
                                    <h3>No Bookings Yet</h3>
                                    <p style={{ color: '#7A5C00' }}>Bookings from customers will appear here</p>
                                </div>
                            ) : (
                                <div style={styles.servicesList}>
                                    {bookings.map(b => (
                                        <div key={b._id} style={{ ...styles.serviceRow, flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div style={styles.serviceRowInfo}>
                                                    <div style={styles.serviceRowName}>{b.service?.businessName || 'Service'}</div>
                                                    <div style={styles.serviceRowMeta}>👤 {b.user?.name || 'Customer'} • 📱 {b.user?.mobile || '—'}</div>
                                                    <div style={styles.serviceRowMeta}>📅 {new Date(b.eventDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                                    <div style={styles.serviceRowMeta}>🎉 {b.eventType} {b.guestCount ? `• 👥 ${b.guestCount} guests` : ''}</div>
                                                    {b.specialRequirements && <div style={styles.serviceRowMeta}>📝 {b.specialRequirements}</div>}
                                                </div>
                                                <span style={{
                                                    ...styles.statusPill,
                                                    background: b.status === 'Confirmed' ? '#E8F5E9' : b.status === 'Cancelled' ? '#FFEBEE' : '#FFF8E1',
                                                    color: b.status === 'Confirmed' ? '#2E7D32' : b.status === 'Cancelled' ? '#C62828' : '#F57F17'
                                                }}>{b.status}</span>
                                            </div>
                                            {b.status === 'Pending' && (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button style={{ ...styles.addBtn, background: '#2E7D32', flex: 1 }} onClick={() => handleConfirmBooking(b._id)}>✅ Confirm Booking</button>
                                                    <button style={{ ...styles.addBtn, background: '#C62828', flex: 1 }} onClick={() => handleCancelBooking(b._id)}>❌ Cancel Booking</button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* AVAILABILITY CALENDAR */}
                    {activeTab === 'calendar' && (
                        <div>
                            <h2 style={styles.pageTitle}>🗓️ Availability Calendar</h2>
                            {services.length === 0 ? (
                                <div style={styles.empty}>
                                    <div style={{ fontSize: '52px', marginBottom: '12px' }}>🗓️</div>
                                    <h3>Add a service first</h3>
                                    <p style={{ color: '#7A5C00' }}>List a service before setting availability</p>
                                    <button style={styles.addBtn} onClick={() => setActiveTab('services')}>Add Service</button>
                                </div>
                            ) : !selectedService ? (
                                <div>
                                    <p style={{ color: '#7A5C00', marginBottom: '16px', fontSize: '14px' }}>Select a service to manage its availability calendar:</p>
                                    {services.map(s => (
                                        <div key={s._id} style={styles.serviceRow}>
                                            <div style={styles.serviceRowInfo}>
                                                <div style={styles.serviceRowName}>{s.businessName}</div>
                                                <div style={styles.serviceRowMeta}>{s.category} • {s.city}</div>
                                            </div>
                                            <button style={styles.addBtn} onClick={() => loadAvailability(s)}>🗓️ Manage Calendar</button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div>
                                    <div style={styles.calendarHeader}>
                                        <button style={styles.backBtn} onClick={() => setSelectedService(null)}>← Back to Services</button>
                                        <div style={styles.calendarServiceName}>{selectedService.businessName}</div>
                                    </div>
                                    <div style={styles.legend}>
                                        {[
                                            { color: '#E8F5E9', border: '#A5D6A7', label: 'Available' },
                                            { color: '#FFEBEE', border: '#EF9A9A', label: 'Blocked' },
                                            { color: '#FFF8E1', border: '#FFE082', label: 'Booked' },
                                        ].map(l => (
                                            <div key={l.label} style={styles.legendItem}>
                                                <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: l.color, border: `1px solid ${l.border}`, marginRight: '6px' }} />
                                                <span style={{ fontSize: '12px', color: '#7A5C00' }}>{l.label}</span>
                                            </div>
                                        ))}
                                        <span style={{ fontSize: '12px', color: '#7A5C00', marginLeft: '8px' }}>(Click a date to toggle status)</span>
                                    </div>
                                    <div style={styles.monthNav}>
                                        <button style={styles.navBtn} onClick={() => setCalendarMonth(new Date(year, month - 1))}>←</button>
                                        <span style={styles.monthLabel}>{monthNames[month]} {year}</span>
                                        <button style={styles.navBtn} onClick={() => setCalendarMonth(new Date(year, month + 1))}>→</button>
                                    </div>
                                    <div style={styles.calendarGrid}>
                                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                            <div key={d} style={styles.dayHeader}>{d}</div>
                                        ))}
                                        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} style={styles.emptyCell} />)}
                                        {Array.from({ length: daysInMonth }).map((_, i) => {
                                            const date = new Date(year, month, i + 1);
                                            const status = getDateStatus(date);
                                            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                                            const isToday = date.toDateString() === new Date().toDateString();
                                            const cellColors = {
                                                available: { bg: '#E8F5E9', border: '#A5D6A7', text: '#2E7D32' },
                                                blocked: { bg: '#FFEBEE', border: '#EF9A9A', text: '#C62828' },
                                                booked: { bg: '#FFF8E1', border: '#FFE082', text: '#F57F17' },
                                            };
                                            const colors = isPast ? { bg: '#F5F5F5', border: '#E0E0E0', text: '#BDBDBD' } : cellColors[status];
                                            return (
                                                <div key={i} style={{
                                                    ...styles.dayCell,
                                                    background: colors.bg,
                                                    border: `1px solid ${colors.border}`,
                                                    color: colors.text,
                                                    cursor: isPast ? 'not-allowed' : 'pointer',
                                                    fontWeight: isToday ? '800' : '500',
                                                    outline: isToday ? '2px solid #B71C1C' : 'none',
                                                }}
                                                    onClick={() => !isPast && toggleDateStatus(date)}>
                                                    {i + 1}
                                                    {isToday && <div style={{ fontSize: '8px', marginTop: '2px' }}>TODAY</div>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div style={styles.calendarSummary}>
                                        <div style={styles.summaryItem}>
                                            <strong style={{ color: '#C62828' }}>{availability.filter(a => a.status === 'blocked').length}</strong>
                                            <span> Blocked dates</span>
                                        </div>
                                        <div style={styles.summaryItem}>
                                            <strong style={{ color: '#F57F17' }}>{availability.filter(a => a.status === 'booked').length}</strong>
                                            <span> Booked dates</span>
                                        </div>
                                    </div>
                                </div>
                            )}
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
                                        { label: 'Status', value: user?.isApproved ? '✅ Approved' : '⏳ Pending Approval' },
                                    ].map(item => (
                                        <div key={item.label} style={styles.profileField}>
                                            <span style={styles.fieldLabel}>{item.label}</span>
                                            <span style={styles.fieldValue}>{item.value || '—'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button style={{ ...styles.addBtn, background: '#B71C1C', marginTop: '16px' }}
                                onClick={() => { logout(); navigate('/'); }}>
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
    container: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', alignItems: 'start' },
    sidebar: {},
    vendorCard: { background: '#fff', borderRadius: '16px', padding: '24px', textAlign: 'center', boxShadow: '0 4px 24px rgba(223,155,8,0.12)', marginBottom: '16px', border: '1px solid #F5BE17' },
    vendorIcon: { fontSize: '52px', marginBottom: '8px' },
    vendorName: { fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: '700', color: '#5F0909', marginBottom: '4px' },
    vendorSub: { fontSize: '12px', color: '#B71C1C', fontWeight: '600', marginBottom: '4px' },
    vendorCity: { fontSize: '12px', color: '#7A5C00', marginBottom: '12px' },
    statusBadge: { display: 'inline-block', padding: '5px 14px', borderRadius: '50px', fontSize: '12px', fontWeight: '600' },
    tabs: { background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(223,155,8,0.12)', border: '1px solid #F5BE17' },
    tab: { padding: '14px 20px', fontSize: '14px', fontWeight: '500', color: '#7A5C00', cursor: 'pointer', borderBottom: '1px solid #FFF8E1' },
    tabActive: { background: '#FFF8E1', color: '#B71C1C', fontWeight: '700', borderLeft: '3px solid #B71C1C' },
    main: { background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 24px rgba(223,155,8,0.12)', minHeight: '600px', border: '1px solid #F5E6A0' },
    pageTitle: { fontFamily: "'Playfair Display', serif", fontSize: '26px', color: '#5F0909', marginBottom: '24px' },
    pendingAlert: { background: '#FFF8E1', border: '1px solid #F5BE17', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
    statCard: { borderRadius: '12px', padding: '20px', textAlign: 'center', border: '1px solid #F5BE17' },
    statIcon: { fontSize: '28px', marginBottom: '8px' },
    statValue: { fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: '700', color: '#B71C1C', marginBottom: '4px' },
    statLabel: { fontSize: '12px', color: '#7A5C00' },
    sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: '20px', color: '#5F0909', marginBottom: '16px' },
    actionGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
    actionCard: { background: '#FFF8E1', borderRadius: '12px', padding: '20px', textAlign: 'center', cursor: 'pointer', border: '1px solid #F5BE17' },
    tabHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    addBtn: { padding: '10px 20px', background: '#B71C1C', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    formBox: { background: '#FFFDF4', border: '1px solid #F5BE17', borderRadius: '12px', padding: '24px', marginBottom: '24px' },
    formTitle: { fontSize: '16px', fontWeight: '700', color: '#B71C1C', marginBottom: '16px' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    formGroup: { marginBottom: '16px' },
    label: { display: 'block', fontSize: '11px', fontWeight: '600', color: '#7A5C00', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    input: { width: '100%', padding: '11px 14px', border: '1.5px solid #F5BE17', borderRadius: '8px', fontSize: '14px', color: '#5F0909', background: '#fff', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' },
    servicesList: { display: 'flex', flexDirection: 'column', gap: '12px' },
    serviceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#FFF8E1', borderRadius: '12px', border: '1px solid #F5BE17' },
    serviceRowInfo: {},
    serviceRowName: { fontWeight: '700', color: '#5F0909', fontSize: '15px', marginBottom: '4px' },
    serviceRowMeta: { fontSize: '12px', color: '#7A5C00', marginBottom: '2px' },
    serviceRowActions: { display: 'flex', gap: '8px', alignItems: 'center' },
    statusPill: { padding: '5px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap' },
    empty: { textAlign: 'center', padding: '60px 20px' },
    calendarHeader: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' },
    backBtn: { padding: '8px 16px', background: 'transparent', border: '1.5px solid #B71C1C', color: '#B71C1C', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    calendarServiceName: { fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: '700', color: '#5F0909' },
    legend: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' },
    legendItem: { display: 'flex', alignItems: 'center' },
    monthNav: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', marginBottom: '16px' },
    navBtn: { padding: '8px 16px', background: '#FFF8E1', border: '1px solid #F5BE17', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', color: '#B71C1C', fontWeight: '700' },
    monthLabel: { fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: '700', color: '#5F0909', minWidth: '180px', textAlign: 'center' },
    calendarGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '16px' },
    dayHeader: { textAlign: 'center', fontSize: '11px', fontWeight: '700', color: '#7A5C00', padding: '8px 0', textTransform: 'uppercase' },
    emptyCell: { height: '48px' },
    dayCell: { height: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontSize: '14px', transition: 'all 0.15s', userSelect: 'none' },
    calendarSummary: { display: 'flex', gap: '24px', padding: '16px', background: '#FFF8E1', borderRadius: '10px', fontSize: '14px', color: '#7A5C00', border: '1px solid #F5BE17' },
    summaryItem: { display: 'flex', gap: '4px', alignItems: 'center' },
    profileView: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' },
    profileField: { display: 'flex', flexDirection: 'column', padding: '12px 16px', borderBottom: '1px solid #FFF8E1' },
    fieldLabel: { fontSize: '11px', fontWeight: '600', color: '#7A5C00', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' },
    fieldValue: { fontSize: '14px', color: '#5F0909', fontWeight: '500' },
    packagesGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' },
    packageCard: { background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(223,155,8,0.1)', border: '1px solid #F5E6A0' },
    pkgPhotoRow: { display: 'flex', gap: '4px', height: '120px', overflow: 'hidden' },
    pkgPhoto: { flex: 1, objectFit: 'cover', height: '100%' },
    pkgPhotoMore: { flex: '0 0 60px', background: 'rgba(0,0,0,0.5)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700' },
    pkgBody: { padding: '14px' },
    pkgName: { fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '700', color: '#5F0909' },
    pkgPrice: { fontSize: '15px', fontWeight: '700', color: '#B71C1C' },
    pkgDesc: { fontSize: '13px', color: '#7A5C00', marginBottom: '10px', lineHeight: 1.5 },
    featuresRow: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' },
    featureTag: { fontSize: '11px', padding: '3px 8px', background: '#F1F8E9', color: '#2E7D32', borderRadius: '20px', border: '1px solid #C8E6C9' },
    pkgActions: { display: 'flex', gap: '6px' },
    pkgBtn: { flex: 1, padding: '7px', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
};

export default ServiceProvider;