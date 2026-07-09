import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import LoginModal from '../../components/Modals/LoginModal';
import RegisterModal from '../../components/Modals/RegisterModal';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = 'http://localhost:5000';

const CATEGORY_ICONS = {
    'Wedding Hall/Venue': '🏛️',
    'Photography': '📸',
    'Videography': '🎥',
    'Catering': '🍽️',
    'Event Decoration': '🌸',
    'Wedding Rentals': '🪑',
    'DJ & Entertainment': '🎵',
    'Choreography': '💃',
    'Bridal Makeup & Hair': '💄',
    'Mehndi Artist': '🌿',
    'Bridal Styling': '👗',
    'Wedding Planner': '📋',
    'Travel & Accommodation': '🚌',
    'Officiant/Priest': '🙏',
    'Security & Valet': '🔒',
    'Wedding Cake': '🎂',
    'Favors & Gifts': '🎁',
    'Stationery & Cards': '💌',
    'Other': '🌟',
};

const getCategoryIcon = (category) => CATEGORY_ICONS[category] || '✨';

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

const AvailabilityCalendar = ({ serviceId, onDateSelect, selectedDate }) => {
    const [calMonth, setCalMonth] = useState(new Date());
    const [availability, setAvailability] = useState([]);
    const [loadingCal, setLoadingCal] = useState(false);

    useEffect(() => { if (serviceId) loadAvailability(); }, [serviceId]);

    const loadAvailability = async () => {
        setLoadingCal(true);
        try {
            const res = await axios.get(`${API}/api/services/${serviceId}/availability`);
            setAvailability(res.data.availability || []);
        } catch { setAvailability([]); }
        finally { setLoadingCal(false); }
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
    const isSelectedDate = (date) => selectedDate && new Date(selectedDate).toDateString() === date.toDateString();

    return (
        <div style={calStyles.wrap}>
            <div style={calStyles.legend}>
                {[
                    { color: '#E8F5E9', border: '#A5D6A7', label: 'Available' },
                    { color: '#FFEBEE', border: '#EF9A9A', label: 'Blocked' },
                    { color: '#FFF8E1', border: '#FFE082', label: 'Booked' },
                ].map(l => (
                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: l.color, border: `1px solid ${l.border}` }} />
                        <span style={{ fontSize: '11px', color: '#7A5C00' }}>{l.label}</span>
                    </div>
                ))}
            </div>
            <div style={calStyles.nav}>
                <button style={calStyles.navBtn} onClick={() => setCalMonth(new Date(year, month - 1))}>←</button>
                <span style={calStyles.monthLabel}>{monthNames[month]} {year}</span>
                <button style={calStyles.navBtn} onClick={() => setCalMonth(new Date(year, month + 1))}>→</button>
            </div>
            {loadingCal ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#7A5C00' }}>Loading calendar...</div>
            ) : (
                <div style={calStyles.grid}>
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                        <div key={d} style={calStyles.dayHeader}>{d}</div>
                    ))}
                    {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const date = new Date(year, month, i + 1);
                        const status = getStatus(date);
                        const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                        const isToday = date.toDateString() === new Date().toDateString();
                        const isSel = isSelectedDate(date);
                        const colors = isPast ? { bg: '#F5F5F5', border: '#E0E0E0', text: '#BDBDBD' } : cellColors[status];
                        return (
                            <div key={i} style={{
                                ...calStyles.dayCell,
                                background: isSel ? '#B71C1C' : colors.bg,
                                border: isSel ? '2px solid #B71C1C' : `1px solid ${colors.border}`,
                                color: isSel ? '#fff' : colors.text,
                                cursor: isPast || status !== 'available' ? 'not-allowed' : 'pointer',
                                fontWeight: isToday || isSel ? '800' : '500',
                                opacity: isPast ? 0.5 : 1,
                            }}
                                onClick={() => {
                                    if (isPast || status !== 'available') {
                                        if (status === 'blocked') toast.error('This date is blocked by the provider');
                                        if (status === 'booked') toast.error('This date is already booked');
                                        return;
                                    }
                                    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                                    onDateSelect(localDate.toISOString().split('T')[0]);
                                }}>
                                {i + 1}
                                {isToday && <div style={{ fontSize: '6px', marginTop: '1px' }}>◉</div>}
                            </div>
                        );
                    })}
                </div>
            )}
            {selectedDate && (
                <div style={calStyles.selectedInfo}>
                    Selected: <strong>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                </div>
            )}
        </div>
    );
};

const calStyles = {
    wrap: { background: '#FFF8E1', borderRadius: '12px', padding: '14px', marginBottom: '16px', border: '1px solid #F5BE17' },
    legend: { display: 'flex', gap: '12px', marginBottom: '10px', flexWrap: 'wrap' },
    nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' },
    navBtn: { padding: '4px 12px', background: '#fff', border: '1px solid #F5BE17', borderRadius: '6px', cursor: 'pointer', color: '#B71C1C', fontWeight: '700', fontSize: '14px' },
    monthLabel: { fontWeight: '700', color: '#5F0909', fontSize: '14px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' },
    dayHeader: { textAlign: 'center', fontSize: '10px', fontWeight: '700', color: '#7A5C00', padding: '4px 0' },
    dayCell: { height: '36px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', fontSize: '12px', userSelect: 'none', transition: 'all 0.1s' },
    selectedInfo: { marginTop: '10px', fontSize: '13px', color: '#2E7D32', background: '#E8F5E9', padding: '8px 12px', borderRadius: '8px', border: '1px solid #A5D6A7' },
};

const Services = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useTranslation();

    const ALL_CATEGORIES = [
        { id: 'all', label: t('services.categories.all'), icon: '✨' },
        { id: 'Wedding Hall/Venue', label: t('services.categories.wedding_hall'), icon: '🏛️' },
        { id: 'Photography', label: t('services.categories.photography'), icon: '📸' },
        { id: 'Videography', label: t('services.categories.videography'), icon: '🎥' },
        { id: 'Catering', label: t('services.categories.catering'), icon: '🍽️' },
        { id: 'Event Decoration', label: t('services.categories.event_decoration'), icon: '🌸' },
        { id: 'Wedding Rentals', label: t('services.categories.wedding_rentals'), icon: '🪑' },
        { id: 'DJ & Entertainment', label: t('services.categories.dj_entertainment'), icon: '🎵' },
        { id: 'Choreography', label: t('services.categories.choreography'), icon: '💃' },
        { id: 'Bridal Makeup & Hair', label: t('services.categories.bridal_makeup'), icon: '💄' },
        { id: 'Mehndi Artist', label: t('services.categories.mehndi'), icon: '🌿' },
        { id: 'Bridal Styling', label: t('services.categories.bridal_styling'), icon: '👗' },
        { id: 'Wedding Planner', label: t('services.categories.wedding_planner'), icon: '📋' },
        { id: 'Travel & Accommodation', label: t('services.categories.travel'), icon: '🚌' },
        { id: 'Officiant/Priest', label: t('services.categories.priest'), icon: '🙏' },
        { id: 'Security & Valet', label: t('services.categories.security'), icon: '🔒' },
        { id: 'Wedding Cake', label: t('services.categories.wedding_cake'), icon: '🎂' },
        { id: 'Favors & Gifts', label: t('services.categories.favors'), icon: '🎁' },
        { id: 'Stationery & Cards', label: t('services.categories.stationery'), icon: '💌' },
        { id: 'Other', label: t('services.categories.other'), icon: '🌟' },
    ];
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    // Categories that actually have a Service Card created in admin.
    // Only these are shown as filter pills; null = not yet loaded.
    const [cardCategories, setCardCategories] = useState(null);

    useEffect(() => {
        axios.get(`${API}/api/service-cards`)
            .then(res => {
                const cats = (res.data.cards || [])
                    .map(c => c.category)
                    .filter(Boolean);
                setCardCategories([...new Set(cats)]);
            })
            .catch(() => setCardCategories([]));
    }, []);

    // 'All Services' always shows; other pills only appear if a service
    // card with that category actually exists — no fallback to the full
    // list, so this strictly reflects what's been created in admin.
    const visibleCategories = [
        ALL_CATEGORIES[0],
        ...ALL_CATEGORIES.slice(1).filter(c => (cardCategories || []).includes(c.id)),
    ];
    const [activeCategory, setActiveCategory] = useState(
        () => new URLSearchParams(window.location.search).get('category') || 'all'
    );
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
        eventDate: '', eventType: 'Wedding', guestCount: '', specialRequirements: ''
    });
    const [servicePackages, setServicePackages] = useState([]);
    const [loadingPackages, setLoadingPackages] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [showPackages, setShowPackages] = useState(false);

    useEffect(() => { fetchServices(); }, [activeCategory, searchCity, searchDate]);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const params = {};
            if (activeCategory !== 'all') params.category = activeCategory;
            if (searchCity) params.city = searchCity;
            if (searchDate) params.date = searchDate;
            const res = await axios.get(`${API}/api/services`, { params });
            setServices(res.data.services || []);
        } catch (err) { toast.error('Failed to load services'); }
        finally { setLoading(false); }
    };

    const fetchPackages = async (serviceId) => {
        setLoadingPackages(true);
        try {
            const res = await axios.get(`${API}/api/service-menu/${serviceId}`);
            setServicePackages(res.data.menus || []);
        } catch (err) { setServicePackages([]); }
        finally { setLoadingPackages(false); }
    };

    const checkAvailability = async (serviceId, date) => {
        if (!date) return;
        try {
            const res = await axios.post(`${API}/api/services/${serviceId}/check-availability`, { date });
            setAvailability(res.data);
        } catch { toast.error('Could not check availability'); }
    };

    const handleBook = (service) => {
        if (!user) { setShowLogin(true); return; }
        setSelectedService(service);
        setAvailability(null);
        setSelectedPackage(null);
        setBooking({ eventDate: '', eventType: 'Wedding', guestCount: '', specialRequirements: '' });
        fetchPackages(service._id);
        setShowBooking(true);
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        if (!booking.eventDate) { toast.error('Please select a date from the calendar'); return; }
        setBookingLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API}/api/bookings`, {
                service: selectedService._id,
                eventDate: booking.eventDate,
                eventType: booking.eventType,
                guestCount: booking.guestCount,
                specialRequirements: booking.specialRequirements,
                selectedPackage: selectedPackage ? selectedPackage.name : null,
            }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success(`Booking request sent to ${selectedService.businessName}! 🎉`);
            setShowBooking(false);
            setSelectedService(null);
            setSelectedPackage(null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Booking failed');
        } finally { setBookingLoading(false); }
    };

    const handleViewDetail = (service) => {
        setSelectedService(service);
        setAvailability(null);
        setCheckingDate('');
        setShowBooking(false);
        setShowPackages(false);
        setSelectedPackage(null);
        fetchPackages(service._id);
    };

    const getPrice = (s) => {
        if (s.priceMin && s.priceMax) return `₹${s.priceMin.toLocaleString()} - ₹${s.priceMax.toLocaleString()}`;
        if (s.price) return s.price;
        return 'Contact for price';
    };

    return (
        <div style={{ background: '#FFF8E1', minHeight: '100vh' }}>
            <Navbar onLoginClick={() => setShowLogin(true)} onRegisterClick={() => setShowRegister(true)} />

            <div style={styles.header}>
                <div style={styles.headerInner}>
                    <div style={styles.headerBadge}>{t('services.label')}</div>
                    <h1 style={styles.headerTitle}>{t('services.title')}</h1>
                    <p style={styles.headerDesc}>{t('services.desc')}</p>
                    <div style={styles.searchBar}>
                        <div style={styles.searchField}>
                            <span style={styles.searchIcon}>📍</span>
                            <input style={styles.searchInput} placeholder="Search by city..."
                                value={searchCity} onChange={e => setSearchCity(e.target.value)} />
                        </div>
                        <div style={styles.searchDivider} />
                        <div style={styles.searchField}>
                            <span style={styles.searchIcon}>📅</span>
                            <input type="date" style={styles.searchInput} value={searchDate}
                                onChange={e => setSearchDate(e.target.value)} />
                        </div>
                        <button style={styles.searchBtn} onClick={fetchServices}>{t('services.search')}</button>
                    </div>
                </div>
            </div>

            <div style={styles.container}>
                <div style={styles.categoryRow}>
                    {visibleCategories.map(cat => (
                        <button key={cat.id}
                            style={{ ...styles.catBtn, ...(activeCategory === cat.id ? styles.catBtnActive : {}) }}
                            onClick={() => setActiveCategory(cat.id)}>
                            {cat.icon} {cat.label}
                        </button>
                    ))}
                </div>

                <div style={styles.resultsRow}>
                    <span style={styles.resultsCount}>
                        {loading ? t('services.loading') : <><strong>{services.length}</strong> {t('services.services_found')}</>}
                    </span>
                    {(searchCity || searchDate) && (
                        <button style={styles.clearBtn} onClick={() => { setSearchCity(''); setSearchDate(''); }}>
                            {t('services.clear_filters')}
                        </button>
                    )}
                </div>

                {loading ? (
                    <div style={styles.loadingBox}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                        <p style={{ color: '#7A5C00' }}>Loading services...</p>
                    </div>
                ) : services.length === 0 ? (
                    <div style={styles.emptyBox}>
                        <div style={{ fontSize: '52px', marginBottom: '16px' }}>🔍</div>
                        <h3 style={{ color: '#5F0909', marginBottom: '8px' }}>No Services Found</h3>
                        <p style={{ color: '#7A5C00', marginBottom: '20px' }}>
                            {activeCategory !== 'all'
                                ? `No "${activeCategory}" services are listed yet. Please check back soon!`
                                : 'No services match your filters. Try adjusting your search.'}
                        </p>
                        <button style={styles.clearBtn2} onClick={() => { setActiveCategory('all'); setSearchCity(''); setSearchDate(''); }}>
                            Show All Services
                        </button>
                    </div>
                ) : (
                    <div style={styles.servicesGrid}>
                        {services.map(service => (
                            <div key={service._id} style={styles.serviceCard}>
                                <div style={styles.servicePhoto}>
                                    {service.photos && service.photos.length > 0 ? (
                                        <img src={`${API}${service.photos[0]}`} alt={service.businessName} style={styles.serviceImg} />
                                    ) : (
                                        <div style={styles.serviceEmoji}>{getCategoryIcon(service.category)}</div>
                                    )}
                                    {service.isVerified && <span style={styles.verifiedBadge}>Verified</span>}
                                    {service.isFeatured && <span style={styles.featuredBadge}>Featured</span>}
                                    <span style={styles.categoryBadge}>{service.category}</span>
                                    <div style={styles.ratingBadge}>⭐ {service.rating > 0 ? service.rating : 'New'}</div>
                                </div>
                                <div style={styles.serviceInfo}>
                                    <div style={styles.serviceName}>{service.businessName}</div>
                                    <div style={styles.serviceMeta}>👤 {service.ownerName}</div>
                                    <div style={styles.serviceMeta}>📍 {service.city}{service.district ? `, ${service.district}` : ''}</div>
                                    {service.capacity && <div style={styles.serviceMeta}>👥 {service.capacity}</div>}
                                    <div style={styles.servicePrice}>{getPrice(service)}</div>
                                    {service.description && (
                                        <p style={styles.serviceDesc}>{service.description.substring(0, 80)}...</p>
                                    )}
                                    <div style={styles.serviceActions}>
                                        <button style={styles.bookBtn} onClick={() => handleBook(service)}>{t('services.book_now')}</button>
                                        <button style={styles.viewBtn} onClick={() => window.open(`/services/${service._id}`, '_blank')}>View</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div style={styles.listCta}>
                    <div>
                        <h3 style={styles.listCtaTitle}>{t('services.are_you_provider')}</h3>
                        <p style={styles.listCtaDesc}>{t('services.provider_desc')}</p>
                    </div>
                    <button style={styles.listCtaBtn}
                        onClick={() => user?.role === 'service' ? navigate('/service-provider') : setShowRegister(true)}>
                        {t('services.list_your_service')}
                    </button>
                </div>
            </div>

            {/* Service Detail Modal */}
            {selectedService && !showBooking && (
                <div style={styles.overlay} onClick={() => setSelectedService(null)}>
                    <div style={styles.modal} onClick={e => e.stopPropagation()}>
                        <button style={styles.closeBtn} onClick={() => setSelectedService(null)}>✕</button>
                        <div style={styles.modalPhoto}>
                            {selectedService.photos && selectedService.photos.length > 0 ? (
                                <img src={`${API}${selectedService.photos[0]}`} alt={selectedService.businessName}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ fontSize: '60px' }}>{getCategoryIcon(selectedService.category)}</div>
                            )}
                            {selectedService.isVerified && <span style={styles.verifiedBadge}>Verified</span>}
                        </div>
                        <div style={styles.modalBody}>
                            <h2 style={styles.modalName}>{selectedService.businessName}</h2>
                            <div style={styles.modalRating}>
                                ⭐ {selectedService.rating > 0 ? `${selectedService.rating} Rating` : 'New Listing'}
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

                            {servicePackages.length > 0 && (
                                <div style={styles.packagesSection}>
                                    <h4 style={styles.packagesSectionTitle}>📦 Available Packages</h4>
                                    <div style={styles.packagesList}>
                                        {servicePackages.map(pkg => (
                                            <div key={pkg._id} style={{
                                                ...styles.pkgCard,
                                                border: selectedPackage?._id === pkg._id ? '2px solid #B71C1C' : '1.5px solid #F5BE17',
                                                background: selectedPackage?._id === pkg._id ? '#FFF8E1' : '#fff'
                                            }} onClick={() => setSelectedPackage(pkg)}>
                                                {pkg.photos && pkg.photos.length > 0 && (
                                                    <div style={styles.pkgPhotoRow}>
                                                        {pkg.photos.slice(0, 3).map((photo, i) => (
                                                            <img key={i} src={`${API}${photo}`} alt="" style={styles.pkgPhoto} />
                                                        ))}
                                                    </div>
                                                )}
                                                <div style={styles.pkgContent}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                        <span style={styles.pkgName}>{pkg.name}</span>
                                                        <span style={styles.pkgPrice}>₹{pkg.price}</span>
                                                    </div>
                                                    {pkg.description && <p style={styles.pkgDesc}>{pkg.description}</p>}
                                                    {pkg.features && pkg.features.length > 0 && (
                                                        <div style={styles.featuresRow}>
                                                            {pkg.features.map((f, i) => (
                                                                <span key={i} style={styles.featureTag}>✓ {f}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {selectedPackage?._id === pkg._id && (
                                                        <div style={styles.selectedPkgBadge}>✅ Selected</div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div style={styles.availSection}>
                                <h4 style={styles.availTitle}>Availability Calendar</h4>
                                <AvailabilityCalendar
                                    serviceId={selectedService._id}
                                    selectedDate={checkingDate}
                                    onDateSelect={(date) => {
                                        setCheckingDate(date);
                                        checkAvailability(selectedService._id, date);
                                    }}
                                />
                                {availability && checkingDate && (
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
                                    setBooking(b => ({ ...b, eventDate: checkingDate }));
                                    fetchPackages(selectedService._id);
                                    setShowBooking(true);
                                }}>Book This Service</button>
                                <button style={styles.whatsappBtn} onClick={() => {
                                    if (!user) { setShowLogin(true); return; }
                                    window.open(`https://wa.me/91${selectedService.mobile}`, '_blank');
                                }}>WhatsApp</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Booking Modal */}
            {showBooking && selectedService && (
                <div style={styles.overlay} onClick={() => setShowBooking(false)}>
                    <div style={{ ...styles.modal, maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                        <button style={styles.closeBtn} onClick={() => setShowBooking(false)}>✕</button>
                        <div style={styles.modalBody}>
                            <h2 style={styles.modalName}>Book {selectedService.businessName}</h2>
                            <p style={styles.modalDesc}>{selectedService.city} • {getPrice(selectedService)}</p>
                            <form onSubmit={handleBookingSubmit}>
                                {servicePackages.length > 0 && (
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>📦 Select Package (Optional)</label>
                                        <div style={styles.packagesList}>
                                            {servicePackages.map(pkg => (
                                                <div key={pkg._id} style={{
                                                    ...styles.pkgCard,
                                                    border: selectedPackage?._id === pkg._id ? '2px solid #B71C1C' : '1.5px solid #F5BE17',
                                                    background: selectedPackage?._id === pkg._id ? '#FFF8E1' : '#fff',
                                                    cursor: 'pointer'
                                                }} onClick={() => setSelectedPackage(selectedPackage?._id === pkg._id ? null : pkg)}>
                                                    {pkg.photos && pkg.photos.length > 0 && (
                                                        <div style={styles.pkgPhotoRow}>
                                                            {pkg.photos.slice(0, 3).map((photo, i) => (
                                                                <img key={i} src={`${API}${photo}`} alt="" style={styles.pkgPhoto} />
                                                            ))}
                                                        </div>
                                                    )}
                                                    <div style={styles.pkgContent}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                            <span style={styles.pkgName}>{pkg.name}</span>
                                                            <span style={styles.pkgPrice}>₹{pkg.price}</span>
                                                        </div>
                                                        {pkg.features && pkg.features.length > 0 && (
                                                            <div style={styles.featuresRow}>
                                                                {pkg.features.map((f, i) => (
                                                                    <span key={i} style={styles.featureTag}>✓ {f}</span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {selectedPackage?._id === pkg._id && (
                                                            <div style={styles.selectedPkgBadge}>✅ Selected</div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {selectedPackage && (
                                            <div style={{ fontSize: '13px', color: '#2E7D32', marginTop: '8px', fontWeight: '600' }}>
                                                Selected: {selectedPackage.name} — ₹{selectedPackage.price}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Select Event Date *</label>
                                    <AvailabilityCalendar
                                        serviceId={selectedService._id}
                                        selectedDate={booking.eventDate}
                                        onDateSelect={(date) => setBooking(b => ({ ...b, eventDate: date }))}
                                    />
                                    {!booking.eventDate && (
                                        <p style={{ fontSize: '12px', color: '#C62828', marginTop: '4px' }}>
                                            Please click an available (green) date
                                        </p>
                                    )}
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
                                    style={{ ...styles.bookBtn, width: '100%', padding: '14px', fontSize: '15px', opacity: bookingLoading || !booking.eventDate ? 0.6 : 1 }}
                                    disabled={bookingLoading || !booking.eventDate}>
                                    {bookingLoading ? 'Sending...' : `Confirm Booking Request${selectedPackage ? ` — ${selectedPackage.name}` : ''}`}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <Footer />

            {showLogin && <LoginModal onClose={() => setShowLogin(false)} onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }} />}
            {showRegister && <RegisterModal onClose={() => setShowRegister(false)} onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }} />}
        </div>
    );
};

const styles = {
    header: { background: 'linear-gradient(135deg, #F5BE17, #DF9B08)', padding: '48px 24px', textAlign: 'center' },
    headerInner: { maxWidth: '800px', margin: '0 auto' },
    headerBadge: { display: 'inline-block', background: 'rgba(95,9,9,0.12)', border: '1px solid rgba(95,9,9,0.25)', color: '#5F0909', padding: '6px 16px', borderRadius: '50px', fontSize: '13px', fontWeight: '600', marginBottom: '16px' },
    headerTitle: { fontFamily: "'Playfair Display', serif", fontSize: '38px', color: '#5F0909', marginBottom: '12px' },
    headerDesc: { color: 'rgba(95,9,9,0.7)', fontSize: '15px', marginBottom: '24px' },
    searchBar: { display: 'flex', background: '#fff', borderRadius: '12px', overflow: 'hidden', maxWidth: '600px', margin: '0 auto', boxShadow: '0 4px 20px rgba(95,9,9,0.15)' },
    searchField: { display: 'flex', alignItems: 'center', flex: 1, padding: '0 14px' },
    searchIcon: { fontSize: '16px', marginRight: '8px', flexShrink: 0 },
    searchInput: { border: 'none', outline: 'none', fontSize: '14px', color: '#5F0909', background: 'transparent', width: '100%', padding: '14px 0' },
    searchDivider: { width: '1px', background: '#F5BE17', margin: '10px 0' },
    searchBtn: { padding: '0 24px', background: '#B71C1C', color: '#fff', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '36px 24px' },
    categoryRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' },
    catBtn: { padding: '7px 14px', border: '1.5px solid #F5BE17', borderRadius: '50px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', background: '#fff', color: '#7A5C00', whiteSpace: 'nowrap' },
    catBtnActive: { background: '#B71C1C', color: '#fff', border: '1.5px solid #B71C1C' },
    resultsRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    resultsCount: { fontSize: '14px', color: '#7A5C00' },
    clearBtn: { padding: '6px 14px', background: 'transparent', border: '1.5px solid #B71C1C', color: '#B71C1C', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
    loadingBox: { textAlign: 'center', padding: '80px 20px' },
    emptyBox: { textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: '16px' },
    clearBtn2: { padding: '10px 24px', background: '#B71C1C', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    servicesGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '48px' },
    serviceCard: { background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(223,155,8,0.12)', border: '1px solid #F5E6A0' },
    servicePhoto: { height: '160px', background: 'linear-gradient(135deg, #FFF8E1, #F5BE17)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
    serviceImg: { width: '100%', height: '100%', objectFit: 'cover' },
    serviceEmoji: { fontSize: '52px' },
    verifiedBadge: { position: 'absolute', top: '10px', right: '10px', background: '#1E6B3C', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px' },
    featuredBadge: { position: 'absolute', top: '10px', left: '10px', background: '#DF9B08', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px' },
    categoryBadge: { position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(255,255,255,0.92)', color: '#5F0909', fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px' },
    ratingBadge: { position: 'absolute', bottom: '10px', right: '10px', background: '#fff', color: '#5F0909', fontSize: '12px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    serviceInfo: { padding: '16px' },
    serviceName: { fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '700', color: '#5F0909', marginBottom: '4px' },
    serviceMeta: { fontSize: '12px', color: '#7A5C00', marginBottom: '2px' },
    servicePrice: { fontSize: '13px', fontWeight: '700', color: '#B71C1C', margin: '6px 0' },
    serviceDesc: { fontSize: '12px', color: '#7A5C00', lineHeight: 1.5, marginBottom: '12px' },
    serviceActions: { display: 'flex', gap: '8px' },
    bookBtn: { flex: 1, padding: '10px', background: '#B71C1C', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    viewBtn: { flex: 1, padding: '10px', background: 'transparent', color: '#B71C1C', border: '1.5px solid #B71C1C', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    listCta: { background: 'linear-gradient(135deg, #5F0909, #B71C1C)', borderRadius: '16px', padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' },
    listCtaTitle: { fontFamily: "'Playfair Display', serif", fontSize: '22px', color: '#fff', marginBottom: '8px' },
    listCtaDesc: { fontSize: '14px', color: 'rgba(255,255,255,0.7)', maxWidth: '500px' },
    listCtaBtn: { padding: '12px 28px', background: '#F5BE17', color: '#5F0909', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' },
    overlay: { position: 'fixed', inset: 0, background: 'rgba(95,9,9,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
    modal: { background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' },
    closeBtn: { position: 'absolute', top: '16px', right: '16px', background: 'rgba(95,9,9,0.7)', color: '#fff', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontSize: '14px', cursor: 'pointer', zIndex: 10 },
    modalPhoto: { height: '180px', background: 'linear-gradient(135deg, #FFF8E1, #F5BE17)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', borderRadius: '20px 20px 0 0', overflow: 'hidden' },
    modalBody: { padding: '24px' },
    modalName: { fontFamily: "'Playfair Display', serif", fontSize: '22px', color: '#5F0909', marginBottom: '4px' },
    modalRating: { fontSize: '14px', color: '#DF9B08', fontWeight: '600', marginBottom: '12px' },
    modalDesc: { fontSize: '14px', color: '#7A5C00', lineHeight: 1.7, marginBottom: '16px' },
    modalGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid #F5BE17', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' },
    modalField: { padding: '10px 14px', borderBottom: '1px solid #FFF8E1', borderRight: '1px solid #F5BE17' },
    modalFieldLabel: { display: 'block', fontSize: '10px', fontWeight: '700', color: '#7A5C00', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' },
    modalFieldValue: { fontSize: '13px', fontWeight: '600', color: '#5F0909' },
    availSection: { background: '#FFF8E1', borderRadius: '10px', padding: '16px', marginBottom: '16px', border: '1px solid #F5BE17' },
    availTitle: { fontSize: '14px', fontWeight: '700', color: '#5F0909', marginBottom: '10px' },
    availResult: { padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', marginTop: '8px' },
    modalActions: { display: 'flex', gap: '10px' },
    whatsappBtn: { flex: 1, padding: '12px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
    formGroup: { marginBottom: '16px' },
    label: { display: 'block', fontSize: '11px', fontWeight: '700', color: '#7A5C00', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    input: { width: '100%', padding: '11px 14px', border: '1.5px solid #F5BE17', borderRadius: '8px', fontSize: '14px', color: '#5F0909', background: '#FFFDF4', outline: 'none', boxSizing: 'border-box' },
    packagesSection: { marginBottom: '16px' },
    packagesSectionTitle: { fontSize: '15px', fontWeight: '700', color: '#5F0909', marginBottom: '12px' },
    packagesList: { display: 'flex', flexDirection: 'column', gap: '10px' },
    pkgCard: { borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', border: '1.5px solid #F5BE17' },
    pkgPhotoRow: { display: 'flex', height: '80px', overflow: 'hidden' },
    pkgPhoto: { flex: 1, objectFit: 'cover', height: '100%' },
    pkgContent: { padding: '10px 12px' },
    pkgName: { fontFamily: "'Playfair Display', serif", fontSize: '15px', fontWeight: '700', color: '#5F0909' },
    pkgPrice: { fontSize: '14px', fontWeight: '700', color: '#B71C1C' },
    pkgDesc: { fontSize: '12px', color: '#7A5C00', lineHeight: 1.5, marginBottom: '8px' },
    featuresRow: { display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' },
    featureTag: { fontSize: '11px', padding: '2px 7px', background: '#F1F8E9', color: '#2E7D32', borderRadius: '20px', border: '1px solid #C8E6C9' },
    selectedPkgBadge: { marginTop: '8px', fontSize: '12px', fontWeight: '700', color: '#B71C1C' },
};

export default Services;