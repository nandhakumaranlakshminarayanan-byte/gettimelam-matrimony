import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import LoginModal from '../../components/Modals/LoginModal';
import RegisterModal from '../../components/Modals/RegisterModal';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = 'http://localhost:5000';

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

const AvailabilityCalendar = ({ serviceId, onDateSelect, selectedDate }) => {
    const [calMonth, setCalMonth] = useState(new Date());
    const [availability, setAvailability] = useState([]);

    useEffect(() => { if (serviceId) loadAvailability(); }, [serviceId]);

    const loadAvailability = async () => {
        try {
            const res = await axios.get(`${API}/api/services/${serviceId}/availability`);
            setAvailability(res.data.availability || []);
        } catch { setAvailability([]); }
    };

    const toLocalStr = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const getStatus = (date) => {
        const dStr = toLocalStr(date);
        const found = availability.find(a => {
            const aDate = new Date(a.date);
            return `${aDate.getUTCFullYear()}-${aDate.getUTCMonth()}-${aDate.getUTCDate()}` === dStr;
        });
        return found ? found.status : 'available';
    };

    const year = calMonth.getFullYear();
    const month = calMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cellColors = {
        available: { bg: '#E8F5E9', border: '#A5D6A7', text: '#2E7D32' },
        blocked: { bg: '#FFEBEE', border: '#EF9A9A', text: '#C62828' },
        booked: { bg: '#FFF8E1', border: '#FFE082', text: '#F57F17' },
    };

    return (
        <div style={{ background: '#F8F9FA', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                {[
                    { color: '#E8F5E9', border: '#A5D6A7', label: 'Available' },
                    { color: '#FFEBEE', border: '#EF9A9A', label: 'Blocked' },
                    { color: '#FFF8E1', border: '#FFE082', label: 'Booked' },
                ].map(l => (
                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: l.color, border: `1px solid ${l.border}` }} />
                        <span style={{ fontSize: '11px', color: '#7A6055' }}>{l.label}</span>
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <button style={{ padding: '4px 12px', background: '#fff', border: '1px solid #E8D5C4', borderRadius: '6px', cursor: 'pointer', color: '#8B1A1A', fontWeight: '700' }}
                    onClick={() => setCalMonth(new Date(year, month - 1))}>←</button>
                <span style={{ fontWeight: '700', color: '#1A0A0A' }}>{monthNames[month]} {year}</span>
                <button style={{ padding: '4px 12px', background: '#fff', border: '1px solid #E8D5C4', borderRadius: '6px', cursor: 'pointer', color: '#8B1A1A', fontWeight: '700' }}
                    onClick={() => setCalMonth(new Date(year, month + 1))}>→</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: '10px', fontWeight: '700', color: '#7A6055', padding: '4px 0' }}>{d}</div>
                ))}
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const date = new Date(year, month, i + 1);
                    const status = getStatus(date);
                    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isSel = selectedDate && new Date(selectedDate).toDateString() === date.toDateString();
                    const colors = isPast ? { bg: '#F5F5F5', border: '#E0E0E0', text: '#BDBDBD' } : cellColors[status];
                    return (
                        <div key={i} style={{
                            height: '36px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'center', borderRadius: '6px', fontSize: '12px', userSelect: 'none',
                            background: isSel ? '#8B1A1A' : colors.bg,
                            border: isSel ? '2px solid #8B1A1A' : `1px solid ${colors.border}`,
                            color: isSel ? '#fff' : colors.text,
                            cursor: isPast || status !== 'available' ? 'not-allowed' : 'pointer',
                            fontWeight: isToday || isSel ? '800' : '500',
                            opacity: isPast ? 0.5 : 1,
                        }}
                            onClick={() => {
                                if (isPast || status !== 'available') {
                                    if (status === 'blocked') toast.error('This date is blocked');
                                    if (status === 'booked') toast.error('This date is already booked');
                                    return;
                                }
                                const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                                onDateSelect(localDate.toISOString().split('T')[0]);
                            }}>
                            {i + 1}
                            {isToday && <div style={{ fontSize: '6px' }}>◉</div>}
                        </div>
                    );
                })}
            </div>
            {selectedDate && (
                <div style={{ marginTop: '10px', fontSize: '13px', color: '#2E7D32', background: '#E8F5E9', padding: '8px 12px', borderRadius: '8px', border: '1px solid #A5D6A7' }}>
                    Selected: <strong>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                </div>
            )}
        </div>
    );
};

const ServiceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [service, setService] = useState(null);
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [showBooking, setShowBooking] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [booking, setBooking] = useState({
        eventDate: '', eventType: 'Wedding', guestCount: '', specialRequirements: ''
    });
    const [activePhoto, setActivePhoto] = useState(0);

    useEffect(() => {
        fetchService();
        fetchPackages();
    }, [id]);

    const fetchService = async () => {
        try {
            const res = await axios.get(`${API}/api/services/${id}`);
            setService(res.data.service);
        } catch (err) {
            toast.error('Service not found!');
            navigate('/services');
        } finally { setLoading(false); }
    };

    const fetchPackages = async () => {
        try {
            const res = await axios.get(`${API}/api/service-menu/${id}`);
            setPackages(res.data.menus || []);
        } catch (err) { setPackages([]); }
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        if (!booking.eventDate) { toast.error('Please select a date!'); return; }
        if (!user) { setShowLogin(true); return; }
        setBookingLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API}/api/bookings`, {
                service: id,
                eventDate: booking.eventDate,
                eventType: booking.eventType,
                guestCount: booking.guestCount,
                specialRequirements: booking.specialRequirements,
                selectedPackage: selectedPackage ? selectedPackage.name : null,
            }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success(`Booking request sent! 🎉`);
            setShowBooking(false);
            setSelectedPackage(null);
            setSelectedDate('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Booking failed!');
        } finally { setBookingLoading(false); }
    };

    const getPrice = (s) => {
        if (!s) return '';
        if (s.priceMin && s.priceMax) return `₹${s.priceMin.toLocaleString()} - ₹${s.priceMax.toLocaleString()}`;
        if (s.price) return s.price;
        return 'Contact for price';
    };

    if (loading) return (
        <div style={{ background: '#FFFDF9', minHeight: '100vh' }}>
            <Navbar onLoginClick={() => setShowLogin(true)} onRegisterClick={() => setShowRegister(true)} />
            <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                <p style={{ color: '#7A6055' }}>Loading service...</p>
            </div>
        </div>
    );

    if (!service) return null;

    return (
        <div style={{ background: '#F2F2F2', minHeight: '100vh' }}>
            <Navbar onLoginClick={() => setShowLogin(true)} onRegisterClick={() => setShowRegister(true)} />

            {/* ✅ Header */}
            <div style={styles.header}>
                <div style={styles.headerInner}>
                    <button style={styles.backBtn} onClick={() => navigate('/services')}>
                        ← Back to Services
                    </button>
                    <h1 style={styles.headerTitle}>{service.businessName}</h1>
                    <p style={styles.headerMeta}>
                        {service.category} • 📍 {service.city}, {service.district}
                        {service.isVerified && <span style={styles.verifiedBadge}>✓ Verified</span>}
                    </p>
                </div>
            </div>

            <div style={styles.container}>

                {/* ✅ LEFT — Service Info + Packages */}
                <div style={styles.left}>

                    {/* Service Photos */}
                    {service.photos && service.photos.length > 0 && (
                        <div style={styles.photoSection}>
                            <img src={`${API}${service.photos[activePhoto]}`} alt={service.businessName}
                                style={styles.mainPhoto} />
                            {service.photos.length > 1 && (
                                <div style={styles.photoThumbs}>
                                    {service.photos.map((photo, i) => (
                                        <img key={i} src={`${API}${photo}`} alt=""
                                            style={{ ...styles.thumb, border: activePhoto === i ? '2px solid #8B1A1A' : '2px solid transparent' }}
                                            onClick={() => setActivePhoto(i)} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Service Details */}
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>📋 Service Details</h2>
                        <div style={styles.detailGrid}>
                            {[
                                { label: 'Owner', value: service.ownerName },
                                { label: 'Category', value: service.category },
                                { label: 'Location', value: `${service.city}, ${service.district}` },
                                { label: 'Capacity', value: service.capacity || 'N/A' },
                                { label: 'Price', value: getPrice(service) },
                                { label: 'Mobile', value: user ? service.mobile : '🔒 Login to view' },
                                { label: 'Rating', value: service.rating > 0 ? `⭐ ${service.rating}` : 'New Listing' },
                                { label: 'Status', value: service.isVerified ? '✅ Verified' : '⏳ Pending' },
                            ].map(item => (
                                <div key={item.label} style={styles.detailField}>
                                    <span style={styles.detailLabel}>{item.label}</span>
                                    <span style={styles.detailValue}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                        {service.description && (
                            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E8D5C4' }}>
                                <h4 style={styles.detailLabel}>About</h4>
                                <p style={{ fontSize: '14px', color: '#2C1810', lineHeight: 1.7, marginTop: '6px' }}>
                                    {service.description}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ✅ Packages / Menu Cards */}
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>📦 Packages & Themes</h2>
                        {packages.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '32px', color: '#7A6055' }}>
                                <div style={{ fontSize: '40px', marginBottom: '8px' }}>📦</div>
                                <p>No packages added yet</p>
                            </div>
                        ) : (
                            <div style={styles.packagesGrid}>
                                {packages.map(pkg => (
                                    <div key={pkg._id} style={{
                                        ...styles.pkgCard,
                                        border: selectedPackage?._id === pkg._id
                                            ? '2px solid #8B1A1A'
                                            : '1.5px solid #E8D5C4',
                                        background: selectedPackage?._id === pkg._id ? '#FDF0F0' : '#fff'
                                    }}
                                        onClick={() => setSelectedPackage(
                                            selectedPackage?._id === pkg._id ? null : pkg
                                        )}>
                                        {/* Package photos */}
                                        {pkg.photos && pkg.photos.length > 0 && (
                                            <div style={styles.pkgPhotoRow}>
                                                {pkg.photos.map((photo, i) => (
                                                    <img key={i} src={`${API}${photo}`} alt=""
                                                        style={styles.pkgPhoto} />
                                                ))}
                                            </div>
                                        )}
                                        <div style={styles.pkgBody}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                <span style={styles.pkgName}>{pkg.name}</span>
                                                <span style={styles.pkgPrice}>₹{pkg.price}</span>
                                            </div>
                                            {pkg.description && (
                                                <p style={styles.pkgDesc}>{pkg.description}</p>
                                            )}
                                            {pkg.features && pkg.features.length > 0 && (
                                                <div style={styles.featuresRow}>
                                                    {pkg.features.map((f, i) => (
                                                        <span key={i} style={styles.featureTag}>✓ {f}</span>
                                                    ))}
                                                </div>
                                            )}
                                            {selectedPackage?._id === pkg._id && (
                                                <div style={{ marginTop: '8px', fontSize: '12px', fontWeight: '700', color: '#8B1A1A' }}>
                                                    ✅ Selected
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {selectedPackage && (
                            <div style={{ marginTop: '12px', padding: '12px', background: '#FDF0F0', borderRadius: '8px', fontSize: '14px', color: '#8B1A1A', fontWeight: '600' }}>
                                Selected Package: {selectedPackage.name} — ₹{selectedPackage.price}
                            </div>
                        )}
                    </div>
                </div>

                {/* ✅ RIGHT — Booking Panel */}
                <div style={styles.right}>
                    <div style={styles.bookingCard}>
                        <h3 style={styles.bookingTitle}>📅 Book This Service</h3>
                        <div style={styles.priceDisplay}>{getPrice(service)}</div>

                        {selectedPackage && (
                            <div style={{ padding: '10px 14px', background: '#FDF0F0', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', color: '#8B1A1A', fontWeight: '600' }}>
                                📦 {selectedPackage.name} — ₹{selectedPackage.price}
                            </div>
                        )}

                        <form onSubmit={handleBookingSubmit}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Select Date *</label>
                                <AvailabilityCalendar
                                    serviceId={id}
                                    selectedDate={booking.eventDate}
                                    onDateSelect={(date) => setBooking(b => ({ ...b, eventDate: date }))}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Event Type *</label>
                                <select style={styles.input} value={booking.eventType}
                                    onChange={e => setBooking({ ...booking, eventType: e.target.value })}>
                                    {['Wedding', 'Engagement', 'Reception', 'Other'].map(t => (
                                        <option key={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Expected Guests</label>
                                <input type="number" placeholder="Number of guests"
                                    style={styles.input} value={booking.guestCount}
                                    onChange={e => setBooking({ ...booking, guestCount: e.target.value })} />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Special Requirements</label>
                                <textarea placeholder="Any special requirements..."
                                    style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                                    value={booking.specialRequirements}
                                    onChange={e => setBooking({ ...booking, specialRequirements: e.target.value })} />
                            </div>

                            <button type="submit"
                                style={{ ...styles.bookBtn, opacity: bookingLoading || !booking.eventDate ? 0.6 : 1 }}
                                disabled={bookingLoading || !booking.eventDate}>
                                {bookingLoading ? '⏳ Sending...' : `Book Now${selectedPackage ? ` — ${selectedPackage.name}` : ''}`}
                            </button>
                        </form>

                        <button style={styles.waBtn} onClick={() => {
                            if (!user) { setShowLogin(true); return; }
                            window.open(`https://wa.me/91${service.mobile}`, '_blank');
                        }}>
                            💬 WhatsApp
                        </button>
                    </div>
                </div>
            </div>

            <Footer />

            {showLogin && (
                <LoginModal onClose={() => setShowLogin(false)}
                    onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }} />
            )}
            {showRegister && (
                <RegisterModal onClose={() => setShowRegister(false)}
                    onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }} />
            )}
        </div>
    );
};

const styles = {
    header: { background: 'linear-gradient(135deg, #1A0A0A, #3D1A1A)', padding: '32px 24px' },
    headerInner: { maxWidth: '1200px', margin: '0 auto' },
    backBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', marginBottom: '12px' },
    headerTitle: { fontFamily: "'Playfair Display', serif", fontSize: '32px', color: '#fff', marginBottom: '8px' },
    headerMeta: { fontSize: '14px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '10px' },
    verifiedBadge: { background: '#1E6B3C', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px' },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' },
    left: { display: 'flex', flexDirection: 'column', gap: '20px' },
    right: { position: 'sticky', top: '20px' },

    photoSection: { background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
    mainPhoto: { width: '100%', height: '320px', objectFit: 'cover' },
    photoThumbs: { display: 'flex', gap: '8px', padding: '12px', overflowX: 'auto' },
    thumb: { width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' },

    card: { background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
    cardTitle: { fontFamily: "'Playfair Display', serif", fontSize: '20px', color: '#1A0A0A', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #E8D5C4' },
    detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' },
    detailField: { display: 'flex', flexDirection: 'column', padding: '10px 14px', borderBottom: '1px solid #F5EAE0' },
    detailLabel: { fontSize: '10px', fontWeight: '700', color: '#7A6055', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' },
    detailValue: { fontSize: '14px', fontWeight: '600', color: '#1A0A0A' },

    packagesGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' },
    pkgCard: { borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    pkgPhotoRow: { display: 'flex', height: '140px', overflow: 'hidden' },
    pkgPhoto: { flex: 1, objectFit: 'cover', height: '100%' },
    pkgBody: { padding: '12px' },
    pkgName: { fontFamily: "'Playfair Display', serif", fontSize: '15px', fontWeight: '700', color: '#1A0A0A' },
    pkgPrice: { fontSize: '15px', fontWeight: '700', color: '#8B1A1A' },
    pkgDesc: { fontSize: '12px', color: '#7A6055', lineHeight: 1.5, marginBottom: '8px', marginTop: '4px' },
    featuresRow: { display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' },
    featureTag: { fontSize: '11px', padding: '2px 7px', background: '#F0FFF4', color: '#2E7D32', borderRadius: '20px', border: '1px solid #C8E6C9' },

    bookingCard: { background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 24px rgba(139,26,26,0.12)' },
    bookingTitle: { fontFamily: "'Playfair Display', serif", fontSize: '20px', color: '#1A0A0A', marginBottom: '8px' },
    priceDisplay: { fontSize: '22px', fontWeight: '700', color: '#8B1A1A', marginBottom: '16px' },
    formGroup: { marginBottom: '14px' },
    label: { display: 'block', fontSize: '11px', fontWeight: '700', color: '#7A6055', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    input: { width: '100%', padding: '10px 14px', border: '1.5px solid #E8D5C4', borderRadius: '8px', fontSize: '14px', color: '#2C1810', background: '#FFFDF9', outline: 'none', boxSizing: 'border-box' },
    bookBtn: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #8B1A1A, #C0392B)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginBottom: '10px' },
    waBtn: { width: '100%', padding: '12px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
};

export default ServiceDetail;