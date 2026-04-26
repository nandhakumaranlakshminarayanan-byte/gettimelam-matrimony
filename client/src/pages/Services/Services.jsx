import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import LoginModal from '../../components/Modals/LoginModal';
import RegisterModal from '../../components/Modals/RegisterModal';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const categories = [
    { id: 'all', label: '🌟 All Services' },
    { id: 'Wedding Hall', label: '🏛️ Wedding Hall' },
    { id: 'Photography', label: '📸 Photography' },
    { id: 'Catering', label: '🍽️ Catering' },
    { id: 'Transport', label: '🚌 Transport' },
    { id: 'Event Organizer', label: '🎪 Event Organizer' },
    { id: 'Decoration', label: '💐 Decoration' },
    { id: 'DJ & Band', label: '🎵 DJ & Band' },
];

const sampleServices = [
    { _id: '1', businessName: 'Royal Wedding Palace', ownerName: 'Rajan K', category: 'Wedding Hall', city: 'Chennai', district: 'Chennai', price: '₹50,000 - ₹2,00,000', capacity: '500 - 2000 guests', rating: 4.8, description: 'Premium wedding hall with AC facilities, parking, and catering support. Available for all communities.', photos: [], isVerified: true },
    { _id: '2', businessName: 'Pixel Perfect Photography', ownerName: 'Suresh M', category: 'Photography', city: 'Coimbatore', district: 'Coimbatore', price: '₹15,000 - ₹50,000', capacity: 'Full Day Coverage', rating: 4.9, description: 'Professional wedding photography and videography with drone shots. 10+ years experience.', photos: [], isVerified: true },
    { _id: '3', businessName: 'Sree Caterers', ownerName: 'Murugan S', category: 'Catering', city: 'Madurai', district: 'Madurai', price: '₹350 - ₹800 per plate', capacity: '100 - 5000 guests', rating: 4.7, description: 'Traditional South Indian catering for all occasions. Vegetarian and non-vegetarian options available.', photos: [], isVerified: true },
    { _id: '4', businessName: 'Bridal Wheels Transport', ownerName: 'Kumar R', category: 'Transport', city: 'Trichy', district: 'Trichy', price: '₹5,000 - ₹25,000', capacity: 'Fleet of 50+ vehicles', rating: 4.6, description: 'Premium wedding cars, buses and fleet services. Decorated vehicles available for bridal entry.', photos: [], isVerified: false },
    { _id: '5', businessName: 'Dream Events', ownerName: 'Priya N', category: 'Event Organizer', city: 'Salem', district: 'Salem', price: '₹25,000 - ₹1,50,000', capacity: 'Complete Event Management', rating: 4.8, description: 'End-to-end wedding planning and event management. We make your dream wedding come true.', photos: [], isVerified: true },
    { _id: '6', businessName: 'Floral Paradise', ownerName: 'Geetha L', category: 'Decoration', city: 'Erode', district: 'Erode', price: '₹10,000 - ₹75,000', capacity: 'Full Venue Decoration', rating: 4.7, description: 'Beautiful floral and thematic decorations for weddings, receptions and all ceremonies.', photos: [], isVerified: true },
    { _id: '7', businessName: 'Beat Masters DJ', ownerName: 'Vijay T', category: 'DJ & Band', city: 'Vellore', district: 'Vellore', price: '₹8,000 - ₹30,000', capacity: 'DJ + Live Band', rating: 4.5, description: 'Professional DJ and live band services. Nadaswaram, saxophone, and modern music available.', photos: [], isVerified: true },
    { _id: '8', businessName: 'Grand Mahal', ownerName: 'Selvam K', category: 'Wedding Hall', city: 'Puducherry', district: 'Puducherry', price: '₹30,000 - ₹1,50,000', capacity: '300 - 1500 guests', rating: 4.6, description: 'Elegant wedding hall with beautiful ambiance, modern facilities and ample parking space.', photos: [], isVerified: true },
    { _id: '9', businessName: 'Memories Photography', ownerName: 'Anand B', category: 'Photography', city: 'Chennai', district: 'Chennai', price: '₹20,000 - ₹80,000', capacity: 'Full Wedding Coverage', rating: 4.9, description: 'Cinematic wedding films and photography. Candid, traditional and pre-wedding shoots available.', photos: [], isVerified: true },
];

const Services = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');
    const [selectedService, setSelectedService] = useState(null);
    const [showBooking, setShowBooking] = useState(false);
    const [booking, setBooking] = useState({
        eventDate: '',
        eventType: 'Wedding',
        guestCount: '',
        specialRequirements: ''
    });

    const filtered = activeCategory === 'all'
        ? sampleServices
        : sampleServices.filter(s => s.category === activeCategory);

    const handleBook = (service) => {
        if (!user) { setShowLogin(true); return; }
        setSelectedService(service);
        setShowBooking(true);
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        toast.success(`Booking request sent to ${selectedService.businessName}! They will contact you shortly. 🎊`);
        setShowBooking(false);
        setSelectedService(null);
        setBooking({ eventDate: '', eventType: 'Wedding', guestCount: '', specialRequirements: '' });
    };

    const getCategoryIcon = (category) => {
        const icons = {
            'Wedding Hall': '🏛️', 'Photography': '📸', 'Catering': '🍽️',
            'Transport': '🚌', 'Event Organizer': '🎪', 'Decoration': '💐', 'DJ & Band': '🎵'
        };
        return icons[category] || '✨';
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
                    <div style={styles.headerBadge}>💍 Wedding Services</div>
                    <h1 style={styles.headerTitle}>Everything for Your Perfect Wedding</h1>
                    <p style={styles.headerDesc}>
                        Book trusted local vendors — Wedding Halls, Photography, Catering, Transport & more
                    </p>
                </div>
            </div>

            <div style={styles.container}>

                {/* Category Filter */}
                <div style={styles.categoryRow}>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            style={{
                                ...styles.catBtn,
                                ...(activeCategory === cat.id ? styles.catBtnActive : {})
                            }}
                            onClick={() => setActiveCategory(cat.id)}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Results Count */}
                <div style={styles.resultsRow}>
                    <span style={styles.resultsCount}>
                        Showing <strong>{filtered.length}</strong> services
                    </span>
                </div>

                {/* Services Grid */}
                <div style={styles.servicesGrid}>
                    {filtered.map(service => (
                        <div key={service._id} style={styles.serviceCard}>

                            {/* Photo */}
                            <div style={styles.servicePhoto}>
                                <div style={styles.serviceEmoji}>{getCategoryIcon(service.category)}</div>
                                {service.isVerified && (
                                    <span style={styles.verifiedBadge}>✓ Verified</span>
                                )}
                                <span style={styles.categoryBadge}>{service.category}</span>
                                <div style={styles.ratingBadge}>⭐ {service.rating}</div>
                            </div>

                            {/* Info */}
                            <div style={styles.serviceInfo}>
                                <div style={styles.serviceName}>{service.businessName}</div>
                                <div style={styles.serviceMeta}>👤 {service.ownerName}</div>
                                <div style={styles.serviceMeta}>📍 {service.city}, {service.district}</div>
                                <div style={styles.serviceMeta}>👥 {service.capacity}</div>
                                <div style={styles.servicePrice}>💰 {service.price}</div>
                                <p style={styles.serviceDesc}>{service.description.substring(0, 80)}...</p>

                                <div style={styles.serviceActions}>
                                    <button
                                        style={styles.bookBtn}
                                        onClick={() => handleBook(service)}
                                    >
                                        📅 Book Now
                                    </button>
                                    <button
                                        style={styles.viewBtn}
                                        onClick={() => setSelectedService(service)}
                                    >
                                        👁️ View
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* List Your Service CTA */}
                <div style={styles.listCta}>
                    <div style={styles.listCtaLeft}>
                        <h3 style={styles.listCtaTitle}>Are You a Service Provider?</h3>
                        <p style={styles.listCtaDesc}>
                            List your wedding service on Gettimelam and reach thousands of families looking for vendors like you!
                        </p>
                    </div>
                    <button style={styles.listCtaBtn} onClick={() => user ? toast.success('Feature coming soon!') : setShowLogin(true)}>
                        ➕ List Your Service Free
                    </button>
                </div>

            </div>

            {/* Service Detail Modal */}
            {selectedService && !showBooking && (
                <div style={styles.overlay} onClick={() => setSelectedService(null)}>
                    <div style={styles.modal} onClick={e => e.stopPropagation()}>
                        <button style={styles.closeBtn} onClick={() => setSelectedService(null)}>✕</button>

                        <div style={styles.modalPhoto}>
                            <div style={{ fontSize: '60px' }}>{getCategoryIcon(selectedService.category)}</div>
                            {selectedService.isVerified && <span style={styles.verifiedBadge}>✓ Verified</span>}
                        </div>

                        <div style={styles.modalBody}>
                            <h2 style={styles.modalName}>{selectedService.businessName}</h2>
                            <div style={styles.modalRating}>⭐ {selectedService.rating} Rating</div>
                            <p style={styles.modalDesc}>{selectedService.description}</p>

                            <div style={styles.modalGrid}>
                                {[
                                    { label: 'Owner', value: selectedService.ownerName },
                                    { label: 'Category', value: selectedService.category },
                                    { label: 'Location', value: `${selectedService.city}, ${selectedService.district}` },
                                    { label: 'Capacity', value: selectedService.capacity },
                                    { label: 'Price Range', value: selectedService.price },
                                ].map(item => (
                                    <div key={item.label} style={styles.modalField}>
                                        <span style={styles.modalFieldLabel}>{item.label}</span>
                                        <span style={styles.modalFieldValue}>{item.value}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={styles.modalActions}>
                                <button style={styles.bookBtn} onClick={() => { setShowBooking(true); }}>
                                    📅 Book This Service
                                </button>
                                <button style={styles.whatsappBtn}>
                                    💬 WhatsApp
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Booking Modal */}
            {showBooking && selectedService && (
                <div style={styles.overlay} onClick={() => setShowBooking(false)}>
                    <div style={styles.modal} onClick={e => e.stopPropagation()}>
                        <button style={styles.closeBtn} onClick={() => setShowBooking(false)}>✕</button>
                        <div style={styles.modalBody}>
                            <h2 style={styles.modalName}>📅 Book {selectedService.businessName}</h2>
                            <p style={styles.modalDesc}>{selectedService.city} • {selectedService.price}</p>

                            <form onSubmit={handleBookingSubmit}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Event Date *</label>
                                    <input
                                        type="date"
                                        style={styles.input}
                                        value={booking.eventDate}
                                        onChange={e => setBooking({ ...booking, eventDate: e.target.value })}
                                        required
                                    />
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
                                <button type="submit" style={styles.bookBtn}>
                                    📅 Confirm Booking Request
                                </button>
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
    header: {
        background: 'linear-gradient(135deg, #1A0A0A, #3D1A1A)',
        padding: '48px 24px',
        textAlign: 'center'
    },
    headerInner: { maxWidth: '700px', margin: '0 auto' },
    headerBadge: {
        display: 'inline-block',
        background: 'rgba(201,168,76,0.15)',
        border: '1px solid rgba(201,168,76,0.3)',
        color: '#C9A84C',
        padding: '6px 16px',
        borderRadius: '50px',
        fontSize: '13px',
        fontWeight: '600',
        marginBottom: '16px'
    },
    headerTitle: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '38px',
        color: '#fff',
        marginBottom: '12px'
    },
    headerDesc: { color: 'rgba(255,255,255,0.6)', fontSize: '15px' },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '36px 24px' },
    categoryRow: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        marginBottom: '24px'
    },
    catBtn: {
        padding: '8px 16px',
        border: '1.5px solid #E8D5C4',
        borderRadius: '50px',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
        background: '#fff',
        color: '#7A6055',
        transition: 'all 0.2s'
    },
    catBtnActive: {
        background: '#8B1A1A',
        color: '#fff',
        border: '1.5px solid #8B1A1A'
    },
    resultsRow: { marginBottom: '20px' },
    resultsCount: { fontSize: '14px', color: '#7A6055' },
    servicesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
        marginBottom: '48px'
    },
    serviceCard: {
        background: '#fff',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(139,26,26,0.08)'
    },
    servicePhoto: {
        height: '160px',
        background: 'linear-gradient(135deg, #FDF5EE, #F5E6D0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
    },
    serviceEmoji: { fontSize: '52px' },
    verifiedBadge: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: '#1E6B3C',
        color: '#fff',
        fontSize: '10px',
        fontWeight: '700',
        padding: '3px 8px',
        borderRadius: '20px'
    },
    categoryBadge: {
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(255,255,255,0.9)',
        color: '#2C1810',
        fontSize: '11px',
        fontWeight: '600',
        padding: '3px 8px',
        borderRadius: '20px'
    },
    ratingBadge: {
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        background: '#fff',
        color: '#2C1810',
        fontSize: '12px',
        fontWeight: '700',
        padding: '3px 8px',
        borderRadius: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    serviceInfo: { padding: '16px' },
    serviceName: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '17px',
        fontWeight: '700',
        color: '#1A0A0A',
        marginBottom: '4px'
    },
    serviceMeta: { fontSize: '12px', color: '#7A6055', marginBottom: '2px' },
    servicePrice: {
        fontSize: '13px',
        fontWeight: '700',
        color: '#8B1A1A',
        margin: '6px 0'
    },
    serviceDesc: { fontSize: '12px', color: '#7A6055', lineHeight: 1.5, marginBottom: '12px' },
    serviceActions: { display: 'flex', gap: '8px' },
    bookBtn: {
        flex: 1,
        padding: '10px',
        background: '#8B1A1A',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif"
    },
    viewBtn: {
        flex: 1,
        padding: '10px',
        background: 'transparent',
        color: '#8B1A1A',
        border: '1.5px solid #8B1A1A',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif"
    },
    listCta: {
        background: 'linear-gradient(135deg, #1A0A0A, #3D1A1A)',
        borderRadius: '16px',
        padding: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px'
    },
    listCtaLeft: {},
    listCtaTitle: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '22px',
        color: '#fff',
        marginBottom: '8px'
    },
    listCtaDesc: { fontSize: '14px', color: 'rgba(255,255,255,0.6)', maxWidth: '500px' },
    listCtaBtn: {
        padding: '12px 28px',
        background: '#C9A84C',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        fontFamily: "'DM Sans', sans-serif"
    },
    overlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
    },
    modal: {
        background: '#fff',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '540px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative'
    },
    closeBtn: {
        position: 'absolute',
        top: '16px',
        right: '16px',
        background: 'rgba(0,0,0,0.2)',
        color: '#fff',
        border: 'none',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        fontSize: '14px',
        cursor: 'pointer',
        zIndex: 10
    },
    modalPhoto: {
        height: '180px',
        background: 'linear-gradient(135deg, #FDF5EE, #F5E6D0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        borderRadius: '20px 20px 0 0'
    },
    modalBody: { padding: '24px' },
    modalName: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '22px',
        color: '#1A0A0A',
        marginBottom: '4px'
    },
    modalRating: { fontSize: '14px', color: '#C9A84C', fontWeight: '600', marginBottom: '12px' },
    modalDesc: { fontSize: '14px', color: '#7A6055', lineHeight: 1.7, marginBottom: '16px' },
    modalGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        border: '1px solid #E8D5C4',
        borderRadius: '10px',
        overflow: 'hidden',
        marginBottom: '16px'
    },
    modalField: {
        padding: '10px 14px',
        borderBottom: '1px solid #E8D5C4',
        borderRight: '1px solid #E8D5C4'
    },
    modalFieldLabel: {
        display: 'block',
        fontSize: '10px',
        fontWeight: '700',
        color: '#7A6055',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '3px'
    },
    modalFieldValue: { fontSize: '13px', fontWeight: '600', color: '#1A0A0A' },
    modalActions: { display: 'flex', gap: '10px' },
    whatsappBtn: {
        flex: 1,
        padding: '12px',
        background: '#25D366',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif"
    },
    formGroup: { marginBottom: '16px' },
    label: {
        display: 'block',
        fontSize: '11px',
        fontWeight: '700',
        color: '#7A6055',
        marginBottom: '5px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    input: {
        width: '100%',
        padding: '11px 14px',
        border: '1.5px solid #E8D5C4',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#2C1810',
        background: '#FFFDF9',
        outline: 'none',
        fontFamily: "'DM Sans', sans-serif",
        boxSizing: 'border-box'
    }
};

export default Services;