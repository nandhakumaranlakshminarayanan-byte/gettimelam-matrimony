import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import LoginModal from '../../components/Modals/LoginModal';
import RegisterModal from '../../components/Modals/RegisterModal';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const ALL_CATEGORIES = [
    { id: 'all', label: 'All Services', icon: '✨' },
    { id: 'Wedding Hall/Venue', label: 'Wedding Hall/Venue', icon: '🏛️' },
    { id: 'Photography', label: 'Photography', icon: '📸' },
    { id: 'Videography', label: 'Videography', icon: '🎥' },
    { id: 'Catering', label: 'Catering', icon: '🍽️' },
    { id: 'Event Decoration', label: 'Event Decoration', icon: '💐' },
    { id: 'Wedding Rentals', label: 'Wedding Rentals', icon: '🪑' },
    { id: 'DJ & Entertainment', label: 'DJ & Entertainment', icon: '🎵' },
    { id: 'Choreography', label: 'Choreography', icon: '💃' },
    { id: 'Bridal Makeup & Hair', label: 'Bridal Makeup', icon: '💄' },
    { id: 'Mehndi Artist', label: 'Mehndi Artist', icon: '🌿' },
    { id: 'Bridal Styling', label: 'Bridal Styling', icon: '👗' },
    { id: 'Wedding Planner', label: 'Wedding Planner', icon: '📋' },
    { id: 'Travel & Accommodation', label: 'Travel & Stay', icon: '🚌' },
    { id: 'Officiant/Priest', label: 'Priest/Officiant', icon: '🙏' },
    { id: 'Security & Valet', label: 'Security & Valet', icon: '🔒' },
    { id: 'Wedding Cake', label: 'Wedding Cake', icon: '🎂' },
    { id: 'Favors & Gifts', label: 'Favors & Gifts', icon: '🎁' },
    { id: 'Stationery & Cards', label: 'Stationery & Cards', icon: '💌' },
    { id: 'Other', label: 'Other', icon: '🌟' },
];

const getCategoryIcon = (category) => {
    const found = ALL_CATEGORIES.find(c => c.id === category);
    return found ? found.icon : '✨';
};

const Services = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState(null);
    const [showBooking, setShowBooking] = useState(false);
    const [checkingDate, setCheckingDate] = useState('');
    const [availability, setAvailability] = useState(null);
    const [searchCity, setSearchCity] = useState('');
    const [searchDate, setSearchDate] = useState('');
    const [bookingLoading, setBookingLoading] = useState(false);
    const [booking, setBooking] = useState({
        eventDate: '', eventType: 'Wedding',
        guestCount: '', specialRequirements: ''
    });

    useEffect(() => {
        fetchServices();
    }, [activeCategory, searchCity, searchDate]);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const params = {};
            if (activeCategory !== 'all') params.category = activeCategory;
            if (searchCity) params.city = searchCity;
            if (searchDate) params.date = searchDate;

            const res = await axios.get('http://localhost:5000/api/services', { params });
            setServices(res.data.services || []);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load services');
        } finally {
            setLoading(false);
        }
    };

    const checkAvailability = async (serviceId, date) => {
        if (!date) return;
        try {
            const res = await axios.post(
                `http://localhost:5000/api/services/${serviceId}/check-availability`,
                { date }
            );
            setAvailability(res.data);
        } catch (err) {
            toast.error('Could not check availability');
        }
    };

    const handleBook = (service) => {
        if (!user) { setShowLogin(true); return; }
        setSelectedService(service);
        setAvailability(null);
        setBooking({ eventDate: '', eventType: 'Wedding', guestCount: '', specialRequirements: '' });
        setShowBooking(true);
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        if (!booking.eventDate) { toast.error('Please select an event date'); return; }
        if (availability && !availability.isAvailable) {
            toast.error('This date is not available. Please choose another date.');
            return;
        }
        setBookingLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/bookings', {
                service: selectedService._id,
                eventDate: booking.eventDate,
                eventType: booking.eventType,
                guestCount: booking.guestCount,
                specialRequirements: booking.specialRequirements,
            }, { headers: { Authorization: `Bearer ${token}` } });

            toast.success(`Booking request sent to ${selectedService.businessName}!`);
            setShowBooking(false);
            setSelectedService(null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Booking failed');
        } finally {
            setBookingLoading(false);
        }
    };

    const handleViewDetail = async (service) => {
        setSelectedService(service);
        setAvailability(null);
        setCheckingDate('');
        setShowBooking(false);
    };

    const getPrice = (s) => {
        if (s.priceMin && s.priceMax) return `Rs.${s.priceMin.toLocaleString()} - Rs.${s.priceMax.toLocaleString()}`;
        if (s.price) return s.price;
        return 'Contact for price';
    };

    return (
        <div style={{ background: '#FFFDF9', minHeight: '100vh' }}>
            <Navbar
                onLoginClick={() => setShowLogin(true)}
                onRegisterClick={() => setShowRegister(true)}
            />

            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerInner}>
                    <div style={styles.headerBadge}>Wedding Services</div>
                    <h1 style={styles.headerTitle}>Everything for Your Perfect Wedding</h1>
                    <p style={styles.headerDesc}>
                        Book trusted local vendors across all wedding categories
                    </p>

                    {/* Search Bar */}
                    <div style={styles.searchBar}>
                        <div style={styles.searchField}>
                            <span style={styles.searchIcon}>📍</span>
                            <input
                                style={styles.searchInput}
                                placeholder="Search by city..."
                                value={searchCity}
                                onChange={e => setSearchCity(e.target.value)}
                            />
                        </div>
                        <div style={styles.searchDivider} />
                        <div style={styles.searchField}>
                            <span style={styles.searchIcon}>📅</span>
                            <input
                                type="date"
                                style={styles.searchInput}
                                value={searchDate}
                                onChange={e => setSearchDate(e.target.value)}
                                placeholder="Event date"
                            />
                        </div>
                        <button style={styles.searchBtn} onClick={fetchServices}>
                            Search
                        </button>
                    </div>
                </div>
            </div>

            <div style={styles.container}>

                {/* Category Pills */}
                <div style={styles.categoryRow}>
                    {ALL_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            style={{
                                ...styles.catBtn,
                                ...(activeCategory === cat.id ? styles.catBtnActive : {})
                            }}
                            onClick={() => setActiveCategory(cat.id)}
                        >
                            {cat.icon} {cat.label}
                        </button>
                    ))}
                </div>

                {/* Results Info */}
                <div style={styles.resultsRow}>
                    <span style={styles.resultsCount}>
                        {loading ? 'Loading...' : (
                            <>Showing <strong>{services.length}</strong> services
                                {searchDate && ` available on ${new Date(searchDate).toLocaleDateString('en-IN')}`}
                                {searchCity && ` in ${searchCity}`}
                            </>
                        )}
                    </span>
                    {(searchCity || searchDate) && (
                        <button style={styles.clearBtn} onClick={() => { setSearchCity(''); setSearchDate(''); }}>
                            Clear Filters
                        </button>
                    )}
                </div>

                {/* Services Grid */}
                {loading ? (
                    <div style={styles.loadingBox}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                        <p style={{ color: '#7A6055' }}>Loading services...</p>
                    </div>
                ) : services.length === 0 ? (
                    <div style={styles.emptyBox}>
                        <div style={{ fontSize: '52px', marginBottom: '16px' }}>🔍</div>
                        <h3 style={{ color: '#1A0A0A', marginBottom: '8px' }}>No Services Found</h3>
                        <p style={{ color: '#7A6055', marginBottom: '20px' }}>
                            {searchDate ? 'No vendors available on this date.' : 'No services listed in this category yet.'}
                        </p>
                        <button style={styles.clearBtn2} onClick={() => { setActiveCategory('all'); setSearchCity(''); setSearchDate(''); }}>
                            Show All Services
                        </button>
                    </div>
                ) : (
                    <div style={styles.servicesGrid}>
                        {services.map(service => (
                            <div key={service._id} style={styles.serviceCard}>

                                {/* Photo / Banner */}
                                <div style={styles.servicePhoto}>
                                    {service.photos && service.photos.length > 0 ? (
                                        <img
                                            src={`http://localhost:5000${service.photos[0]}`}
                                            alt={service.businessName}
                                            style={styles.serviceImg}
                                        />
                                    ) : (
                                        <div style={styles.serviceEmoji}>
                                            {getCategoryIcon(service.category)}
                                        </div>
                                    )}
                                    {service.isVerified && (
                                        <span style={styles.verifiedBadge}>Verified</span>
                                    )}
                                    {service.isFeatured && (
                                        <span style={styles.featuredBadge}>Featured</span>
                                    )}
                                    <span style={styles.categoryBadge}>{service.category}</span>
                                    <div style={styles.ratingBadge}>
                                        ⭐ {service.rating > 0 ? service.rating : 'New'}
                                    </div>
                                </div>

                                {/* Info */}
                                <div style={styles.serviceInfo}>
                                    <div style={styles.serviceName}>{service.businessName}</div>
                                    <div style={styles.serviceMeta}>👤 {service.ownerName}</div>
                                    <div style={styles.serviceMeta}>📍 {service.city}{service.district ? `, ${service.district}` : ''}</div>
                                    {service.capacity && <div style={styles.serviceMeta}>👥 {service.capacity}</div>}
                                    <div style={styles.servicePrice}>{getPrice(service)}</div>
                                    {service.description && (
                                        <p style={styles.serviceDesc}>
                                            {service.description.substring(0, 80)}...
                                        </p>
                                    )}

                                    <div style={styles.serviceActions}>
                                        <button style={styles.bookBtn} onClick={() => handleBook(service)}>
                                            Book Now
                                        </button>
                                        <button style={styles.viewBtn} onClick={() => handleViewDetail(service)}>
                                            View
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* CTA Banner */}
                <div style={styles.listCta}>
                    <div>
                        <h3 style={styles.listCtaTitle}>Are You a Service Provider?</h3>
                        <p style={styles.listCtaDesc}>
                            List your wedding service and reach thousands of families planning their wedding!
                        </p>
                    </div>
                    <button
                        style={styles.listCtaBtn}
                        onClick={() => user?.role === 'vendor'
                            ? navigate('/vendor-dashboard')
                            : setShowRegister(true)
                        }
                    >
                        List Your Service Free
                    </button>
                </div>

            </div>

            {/* ── Service Detail Modal ── */}
            {selectedService && !showBooking && (
                <div style={styles.overlay} onClick={() => setSelectedService(null)}>
                    <div style={styles.modal} onClick={e => e.stopPropagation()}>
                        <button style={styles.closeBtn} onClick={() => setSelectedService(null)}>✕</button>

                        <div style={styles.modalPhoto}>
                            {selectedService.photos && selectedService.photos.length > 0 ? (
                                <img
                                    src={`http://localhost:5000${selectedService.photos[0]}`}
                                    alt={selectedService.businessName}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <div style={{ fontSize: '60px' }}>
                                    {getCategoryIcon(selectedService.category)}
                                </div>
                            )}
                            {selectedService.isVerified && (
                                <span style={styles.verifiedBadge}>Verified</span>
                            )}
                        </div>

                        <div style={styles.modalBody}>
                            <h2 style={styles.modalName}>{selectedService.businessName}</h2>
                            <div style={styles.modalRating}>
                                ⭐ {selectedService.rating > 0 ? `${selectedService.rating} Rating` : 'New Listing'}
                                {selectedService.totalReviews > 0 && ` (${selectedService.totalReviews} reviews)`}
                            </div>
                            {selectedService.description && (
                                <p style={styles.modalDesc}>{selectedService.description}</p>
                            )}

                            <div style={styles.modalGrid}>
                                {[
                                    { label: 'Owner', value: selectedService.ownerName },
                                    { label: 'Category', value: selectedService.category },
                                    { label: 'Location', value: `${selectedService.city}${selectedService.district ? ', ' + selectedService.district : ''}` },
                                    { label: 'Capacity', value: selectedService.capacity || 'N/A' },
                                    { label: 'Price', value: getPrice(selectedService) },
                                    { label: 'Mobile', value: user ? selectedService.mobile : 'Login to view' },
                                ].map(item => (
                                    <div key={item.label} style={styles.modalField}>
                                        <span style={styles.modalFieldLabel}>{item.label}</span>
                                        <span style={styles.modalFieldValue}>{item.value}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Availability Check */}
                            <div style={styles.availSection}>
                                <h4 style={styles.availTitle}>Check Availability</h4>
                                <div style={styles.availRow}>
                                    <input
                                        type="date"
                                        style={{ ...styles.input, flex: 1 }}
                                        value={checkingDate}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={e => {
                                            setCheckingDate(e.target.value);
                                            setAvailability(null);
                                        }}
                                    />
                                    <button
                                        style={styles.checkBtn}
                                        onClick={() => checkAvailability(selectedService._id, checkingDate)}
                                        disabled={!checkingDate}
                                    >
                                        Check
                                    </button>
                                </div>
                                {availability && (
                                    <div style={{
                                        ...styles.availResult,
                                        background: availability.isAvailable ? '#E8F5E9' : '#FFEBEE',
                                        color: availability.isAvailable ? '#2E7D32' : '#C62828',
                                        border: `1px solid ${availability.isAvailable ? '#A5D6A7' : '#EF9A9A'}`
                                    }}>
                                        {availability.message}
                                    </div>
                                )}
                            </div>

                            <div style={styles.modalActions}>
                                <button style={styles.bookBtn} onClick={() => {
                                    if (!user) { setShowLogin(true); return; }
                                    setShowBooking(true);
                                }}>
                                    Book This Service
                                </button>
                                <button
                                    style={styles.whatsappBtn}
                                    onClick={() => {
                                        if (!user) { setShowLogin(true); return; }
                                        window.open(`https://wa.me/91${selectedService.mobile}`, '_blank');
                                    }}
                                >
                                    WhatsApp
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Booking Modal ── */}
            {showBooking && selectedService && (
                <div style={styles.overlay} onClick={() => setShowBooking(false)}>
                    <div style={styles.modal} onClick={e => e.stopPropagation()}>
                        <button style={styles.closeBtn} onClick={() => setShowBooking(false)}>✕</button>
                        <div style={styles.modalBody}>
                            <h2 style={styles.modalName}>Book {selectedService.businessName}</h2>
                            <p style={styles.modalDesc}>
                                {selectedService.city} • {getPrice(selectedService)}
                            </p>

                            <form onSubmit={handleBookingSubmit}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Event Date *</label>
                                    <input
                                        type="date"
                                        style={styles.input}
                                        value={booking.eventDate}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={e => {
                                            setBooking({ ...booking, eventDate: e.target.value });
                                            setAvailability(null);
                                            if (e.target.value) {
                                                checkAvailability(selectedService._id, e.target.value);
                                            }
                                        }}
                                        required
                                    />
                                    {/* Show availability status */}
                                    {booking.eventDate && availability && (
                                        <div style={{
                                            ...styles.availResult,
                                            marginTop: '8px',
                                            background: availability.isAvailable ? '#E8F5E9' : '#FFEBEE',
                                            color: availability.isAvailable ? '#2E7D32' : '#C62828',
                                            border: `1px solid ${availability.isAvailable ? '#A5D6A7' : '#EF9A9A'}`
                                        }}>
                                            {availability.message}
                                        </div>
                                    )}
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Event Type *</label>
                                    <select
                                        style={styles.input}
                                        value={booking.eventType}
                                        onChange={e => setBooking({ ...booking, eventType: e.target.value })}
                                    >
                                        {['Wedding', 'Engagement', 'Reception', 'Other'].map(t => (
                                            <option key={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Expected Guests</label>
                                    <input
                                        type="number"
                                        placeholder="Number of guests"
                                        style={styles.input}
                                        value={booking.guestCount}
                                        onChange={e => setBooking({ ...booking, guestCount: e.target.value })}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Special Requirements</label>
                                    <textarea
                                        placeholder="Any special requirements..."
                                        style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                                        value={booking.specialRequirements}
                                        onChange={e => setBooking({ ...booking, specialRequirements: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    style={{ ...styles.bookBtn, opacity: bookingLoading ? 0.7 : 1 }}
                                    disabled={bookingLoading || (availability && !availability.isAvailable)}
                                >
                                    {bookingLoading ? 'Sending...' : 'Confirm Booking Request'}
                                </button>

                                {availability && !availability.isAvailable && (
                                    <p style={{ color: '#C62828', fontSize: '13px', marginTop: '8px', textAlign: 'center' }}>
                                        Please select an available date to proceed.
                                    </p>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <Footer />

            {showLogin && (
                <LoginModal
                    onClose={() => setShowLogin(false)}
                    onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }}
                />
            )}
            {showRegister && (
                <RegisterModal
                    onClose={() => setShowRegister(false)}
                    onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }}
                />
            )}
        </div>
    );
};

const styles = {
    header: { background: 'linear-gradient(135deg, #1A0A0A, #3D1A1A)', padding: '48px 24px', textAlign: 'center' },
    headerInner: { maxWidth: '800px', margin: '0 auto' },
    headerBadge: { display: 'inline-block', background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C', padding: '6px 16px', borderRadius: '50px', fontSize: '13px', fontWeight: '600', marginBottom: '16px' },
    headerTitle: { fontFamily: "'Playfair Display', serif", fontSize: '38px', color: '#fff', marginBottom: '12px' },
    headerDesc: { color: 'rgba(255,255,255,0.6)', fontSize: '15px', marginBottom: '24px' },
    searchBar: { display: 'flex', background: '#fff', borderRadius: '12px', overflow: 'hidden', maxWidth: '600px', margin: '0 auto', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
    searchField: { display: 'flex', alignItems: 'center', flex: 1, padding: '0 14px' },
    searchIcon: { fontSize: '16px', marginRight: '8px', flexShrink: 0 },
    searchInput: { border: 'none', outline: 'none', fontSize: '14px', color: '#2C1810', background: 'transparent', width: '100%', padding: '14px 0', fontFamily: "'DM Sans', sans-serif" },
    searchDivider: { width: '1px', background: '#E8D5C4', margin: '10px 0' },
    searchBtn: { padding: '0 24px', background: '#8B1A1A', color: '#fff', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '36px 24px' },
    categoryRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' },
    catBtn: { padding: '7px 14px', border: '1.5px solid #E8D5C4', borderRadius: '50px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', background: '#fff', color: '#7A6055', whiteSpace: 'nowrap' },
    catBtnActive: { background: '#8B1A1A', color: '#fff', border: '1.5px solid #8B1A1A' },
    resultsRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    resultsCount: { fontSize: '14px', color: '#7A6055' },
    clearBtn: { padding: '6px 14px', background: 'transparent', border: '1.5px solid #8B1A1A', color: '#8B1A1A', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
    loadingBox: { textAlign: 'center', padding: '80px 20px' },
    emptyBox: { textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: '16px' },
    clearBtn2: { padding: '10px 24px', background: '#8B1A1A', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    servicesGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '48px' },
    serviceCard: { background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(139,26,26,0.08)' },
    servicePhoto: { height: '160px', background: 'linear-gradient(135deg, #FDF5EE, #F5E6D0)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
    serviceImg: { width: '100%', height: '100%', objectFit: 'cover' },
    serviceEmoji: { fontSize: '52px' },
    verifiedBadge: { position: 'absolute', top: '10px', right: '10px', background: '#1E6B3C', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px' },
    featuredBadge: { position: 'absolute', top: '10px', left: '10px', background: '#C9A84C', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px' },
    categoryBadge: { position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(255,255,255,0.9)', color: '#2C1810', fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px' },
    ratingBadge: { position: 'absolute', bottom: '10px', right: '10px', background: '#fff', color: '#2C1810', fontSize: '12px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    serviceInfo: { padding: '16px' },
    serviceName: { fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '700', color: '#1A0A0A', marginBottom: '4px' },
    serviceMeta: { fontSize: '12px', color: '#7A6055', marginBottom: '2px' },
    servicePrice: { fontSize: '13px', fontWeight: '700', color: '#8B1A1A', margin: '6px 0' },
    serviceDesc: { fontSize: '12px', color: '#7A6055', lineHeight: 1.5, marginBottom: '12px' },
    serviceActions: { display: 'flex', gap: '8px' },
    bookBtn: { flex: 1, padding: '10px', background: '#8B1A1A', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    viewBtn: { flex: 1, padding: '10px', background: 'transparent', color: '#8B1A1A', border: '1.5px solid #8B1A1A', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    listCta: { background: 'linear-gradient(135deg, #1A0A0A, #3D1A1A)', borderRadius: '16px', padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' },
    listCtaTitle: { fontFamily: "'Playfair Display', serif", fontSize: '22px', color: '#fff', marginBottom: '8px' },
    listCtaDesc: { fontSize: '14px', color: 'rgba(255,255,255,0.6)', maxWidth: '500px' },
    listCtaBtn: { padding: '12px 28px', background: '#C9A84C', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' },
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
    modal: { background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' },
    closeBtn: { position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.3)', color: '#fff', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontSize: '14px', cursor: 'pointer', zIndex: 10 },
    modalPhoto: { height: '180px', background: 'linear-gradient(135deg, #FDF5EE, #F5E6D0)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', borderRadius: '20px 20px 0 0', overflow: 'hidden' },
    modalBody: { padding: '24px' },
    modalName: { fontFamily: "'Playfair Display', serif", fontSize: '22px', color: '#1A0A0A', marginBottom: '4px' },
    modalRating: { fontSize: '14px', color: '#C9A84C', fontWeight: '600', marginBottom: '12px' },
    modalDesc: { fontSize: '14px', color: '#7A6055', lineHeight: 1.7, marginBottom: '16px' },
    modalGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid #E8D5C4', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' },
    modalField: { padding: '10px 14px', borderBottom: '1px solid #E8D5C4', borderRight: '1px solid #E8D5C4' },
    modalFieldLabel: { display: 'block', fontSize: '10px', fontWeight: '700', color: '#7A6055', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' },
    modalFieldValue: { fontSize: '13px', fontWeight: '600', color: '#1A0A0A' },
    availSection: { background: '#F8F9FA', borderRadius: '10px', padding: '16px', marginBottom: '16px' },
    availTitle: { fontSize: '14px', fontWeight: '700', color: '#1A0A0A', marginBottom: '10px' },
    availRow: { display: 'flex', gap: '8px' },
    checkBtn: { padding: '0 16px', background: '#8B1A1A', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    availResult: { padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', marginTop: '8px' },
    modalActions: { display: 'flex', gap: '10px' },
    whatsappBtn: { flex: 1, padding: '12px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
    formGroup: { marginBottom: '16px' },
    label: { display: 'block', fontSize: '11px', fontWeight: '700', color: '#7A6055', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    input: { width: '100%', padding: '11px 14px', border: '1.5px solid #E8D5C4', borderRadius: '8px', fontSize: '14px', color: '#2C1810', background: '#FFFDF9', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' },
};

export default Services;