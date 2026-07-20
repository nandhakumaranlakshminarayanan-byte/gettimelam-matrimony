import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import SupportChatWidget from '../../components/Support/SupportChatWidget';
import BusinessPlaceholder from '../../components/BusinessPlaceholder';
import Icon from '../../components/Icon';
import axios from 'axios';
import toast from 'react-hot-toast';
import { STATES_AND_UTS, getDistrictsForState } from '../../utils/indiaLocationData';
import { useOptions } from '../../hooks/useOptions';

const API = 'http://localhost:5000';

// ── Settings Form Component ────────────────────────────────────────────────
// Edits the service provider's own account (business identity: name, owner,
// location, description, logo). This is separate from a specific service
// listing's own details/photos, which are edited from My Services — a
// business can have more than one listing, so there's no single "the"
// service to attach these fields to.
const SettingsForm = ({ user, API, onSuccess }) => {
    const [form, setForm] = useState({
        businessName: user?.businessName || '',
        ownerName: user?.ownerName || '',
        city: user?.city || '',
        state: user?.state || '',
        district: user?.district || '',
        description: user?.description || '',
    });
    const [logo, setLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState(user?.logo ? `${API}${user.logo}` : null);
    const [logoRemoved, setLogoRemoved] = useState(false);
    const [saving, setSaving] = useState(false);

    // This is the account's login number — every service listing under it
    // mirrors this automatically (see updateBusinessProfile), so changing
    // it here is the one place that actually matters. Locked by default;
    // changing it requires clearing the field and verifying the new
    // number with OTP before Save will accept it.
    const [mobile, setMobile] = useState(user?.mobile || '');
    const [mobileChanging, setMobileChanging] = useState(false);
    const [mobileOtpSent, setMobileOtpSent] = useState(false);
    const [mobileOtp, setMobileOtp] = useState('');
    const [mobileVerified, setMobileVerified] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);

    const handleStartMobileChange = () => {
        setMobileChanging(true);
        setMobile('');
        setMobileOtpSent(false);
        setMobileVerified(false);
    };

    const handleSendMobileOtp = async () => {
        if (mobile.length !== 10) { toast.error('Enter a valid 10-digit mobile number'); return; }
        setSendingOtp(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API}/api/auth/send-listing-otp`, { mobile },
                { headers: { Authorization: `Bearer ${token}` } });
            setMobileOtpSent(true);
            toast.success(`OTP sent to +91 ${mobile}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP');
        } finally { setSendingOtp(false); }
    };

    const handleVerifyMobileOtp = async () => {
        if (mobileOtp.length !== 6) { toast.error('Enter the 6-digit OTP'); return; }
        try {
            await axios.post(`${API}/api/auth/verify-otp`, { mobile, otp: mobileOtp });
            setMobileVerified(true);
            toast.success('Mobile number verified!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid or expired OTP');
        }
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setLogo(file);
        setLogoPreview(URL.createObjectURL(file));
        setLogoRemoved(false);
    };

    const handleRemoveLogo = () => {
        setLogo(null);
        setLogoPreview(null);
        setLogoRemoved(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (mobileChanging && !mobileVerified) {
            toast.error('Please verify the new mobile number with OTP before saving');
            return;
        }
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            Object.keys(form).forEach(k => formData.append(k, form[k]));
            if (mobileChanging && mobileVerified) formData.append('mobile', mobile);
            if (logo) formData.append('logo', logo);
            else if (logoRemoved) formData.append('removeLogo', 'true');
            await axios.put(`${API}/api/auth/business-profile`, formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            setMobileChanging(false); setMobileOtpSent(false); setMobileOtp(''); setMobileVerified(false);
            onSuccess();
            setLogo(null);
            setLogoRemoved(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update');
        } finally { setSaving(false); }
    };

    const inp = {
        width: '100%', padding: '10px 14px', border: '1.5px solid #F5BE17',
        borderRadius: '8px', fontSize: '14px', color: '#5F0909',
        background: '#FFFDF4', outline: 'none', boxSizing: 'border-box',
    };
    const lbl = {
        display: 'block', fontSize: '11px', fontWeight: '700',
        color: '#7A5C00', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px'
    };

    return (
        <form onSubmit={handleSave}>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #F5BE17', marginBottom: '16px' }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', color: '#5F0909', marginBottom: '20px' }}>
                    Edit business details
                </h3>

                {/* Current info readonly */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', background: '#FFF8E1', padding: '16px', borderRadius: '10px' }}>
                    {[
                        { label: 'Email', value: user?.email },
                        { label: 'Category', value: user?.category },
                        { label: 'Status', value: user?.isApproved ? 'Approved' : 'Pending' },
                    ].map(item => (
                        <div key={item.label}>
                            <div style={{ fontSize: '10px', fontWeight: '700', color: '#7A5C00', textTransform: 'uppercase' }}>{item.label}</div>
                            <div style={{ fontSize: '14px', color: '#5F0909', fontWeight: '600' }}>{item.value || '—'}</div>
                        </div>
                    ))}
                </div>

                {/* Mobile Number — locked by default; every service listing under
                    this account mirrors whatever number is saved here. */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={lbl}>Mobile Number</label>
                    {!mobileChanging ? (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input style={{ ...inp, background: '#F5F5F5', color: '#999' }} value={mobile} disabled />
                            <button type="button" style={{ padding: '10px 16px', background: '#5F0909', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                onClick={handleStartMobileChange}>
                                Change Number
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input style={inp} type="text" maxLength={10} placeholder="Enter new 10-digit number"
                                    value={mobile} disabled={mobileVerified}
                                    onChange={e => {
                                        setMobile(e.target.value.replace(/\D/g, '').slice(0, 10));
                                        setMobileOtpSent(false); setMobileVerified(false);
                                    }} />
                                {!mobileVerified && (
                                    <button type="button" style={{ padding: '10px 16px', background: '#5F0909', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap', opacity: sendingOtp ? 0.7 : 1 }}
                                        disabled={mobile.length !== 10 || sendingOtp}
                                        onClick={handleSendMobileOtp}>
                                        {sendingOtp ? 'Sending...' : mobileOtpSent ? 'Resend OTP' : 'Send OTP'}
                                    </button>
                                )}
                            </div>
                            {mobileOtpSent && !mobileVerified && (
                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                    <input style={inp} type="text" maxLength={6} placeholder="Enter 6-digit OTP"
                                        value={mobileOtp} onChange={e => setMobileOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} />
                                    <button type="button" style={{ padding: '10px 16px', background: '#5F0909', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                        onClick={handleVerifyMobileOtp}>
                                        Verify
                                    </button>
                                </div>
                            )}
                            {mobileVerified && (
                                <p style={{ fontSize: '12px', color: '#2E7D32', marginTop: '6px', fontWeight: '600' }}>
                                    Verified +91 {mobile} — click Save Changes below to apply it.
                                </p>
                            )}
                        </div>
                    )}
                    <p style={{ fontSize: '11px', color: '#9E9E9E', marginTop: '6px' }}>
                        This is your login number, and what shows as the contact number on every listing you have.
                    </p>
                </div>

                {/* Editable fields */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                    <div>
                        <label style={lbl}>Business Name</label>
                        <input style={inp} value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} placeholder="Business name" />
                    </div>
                    <div>
                        <label style={lbl}>Owner Name</label>
                        <input style={inp} value={form.ownerName} onChange={e => setForm({ ...form, ownerName: e.target.value })} placeholder="Owner name" />
                    </div>
                    <div>
                        <label style={lbl}>State</label>
                        <select style={inp} value={form.state}
                            onChange={e => setForm({ ...form, state: e.target.value, district: '' })}>
                            <option value="">Select State</option>
                            {STATES_AND_UTS.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={lbl}>District</label>
                        <select style={inp} value={form.district} disabled={!form.state}
                            onChange={e => setForm({ ...form, district: e.target.value })}>
                            <option value="">{form.state ? 'Select District' : 'Select state first'}</option>
                            {getDistrictsForState(form.state).map(d => <option key={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={lbl}>City</label>
                        <input style={inp} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="City" />
                    </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={lbl}>Description</label>
                    <textarea style={{ ...inp, height: '80px', resize: 'vertical' }}
                        value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                        placeholder="Describe your business..." />
                </div>

                {/* Logo Upload */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={lbl}>Business Logo</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        {logoPreview && (
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                <img src={logoPreview} alt="Business logo" style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '10px', border: '2px solid #F5BE17', display: 'block' }} />
                                <button type="button" onClick={handleRemoveLogo} title="Remove logo"
                                    style={{
                                        position: 'absolute', top: '-8px', right: '-8px', width: '22px', height: '22px',
                                        borderRadius: '50%', background: '#D8492E', color: '#fff', border: '2px solid #fff',
                                        fontSize: '12px', lineHeight: 1, cursor: 'pointer', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', padding: 0,
                                    }}>
                                    ✕
                                </button>
                            </div>
                        )}
                        <label style={{
                            display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px',
                            border: '2px dashed #F5BE17', borderRadius: '10px', cursor: 'pointer',
                            background: '#FFF8E1', color: '#7A5C00', fontSize: '13px', flex: 1
                        }}>
                            <span style={{ fontSize: '20px' }}>+</span>
                            <span>{logo ? logo.name : 'Click to upload a logo'}</span>
                            <input type="file" accept="image/*" onChange={handleLogoChange}
                                style={{ display: 'none' }} />
                        </label>
                    </div>
                    <p style={{ fontSize: '11px', color: '#9E9E9E', marginTop: '6px' }}>
                        Shown on your dashboard, and on your listing once approved. To add photos to a specific
                        service listing, use the Edit button under My Services instead. Removing the logo (✕)
                        only takes effect once you click Save Changes below.
                    </p>
                </div>

                <button type="submit" disabled={saving} style={{
                    padding: '12px 28px', background: 'linear-gradient(135deg, #B71C1C, #D32F2F)',
                    color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px',
                    fontWeight: '700', cursor: 'pointer', opacity: saving ? 0.7 : 1
                }}>
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
};

// ── Main ServiceProvider Component ────────────────────────────────────────────
const ServiceProvider = () => {
    const { user, logout, refreshUser } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('overview');
    const [showSupportChat, setShowSupportChat] = useState(false);
    const [services, setServices] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddService, setShowAddService] = useState(false);
    const [editingService, setEditingService] = useState(null);
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
        city: user?.city || '', state: user?.state || '', district: user?.district || '',
        address: '', price: '', priceMin: '', priceMax: '', capacity: '',
    });
    const [servicePhotos, setServicePhotos] = useState([]);

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
            const headers = { Authorization: `Bearer ${token}` };

            if (editingService) {
                // Text fields only — PUT /:id takes a plain JSON body, not
                // multipart. New photos (if any) are added in a second
                // request to the dedicated upload-photos endpoint, same as
                // an initial listing's photos go through a separate step
                // from its text fields would if edited later. Mobile isn't
                // sent — it always mirrors the account (see Settings).
                const { businessName, city, state, district, priceMin, priceMax, capacity, category, description } = serviceForm;
                await axios.put(`${API}/api/services/${editingService._id}`,
                    { businessName, city, state, district, priceMin, priceMax, capacity, category, description },
                    { headers }
                );
                if (servicePhotos.length > 0) {
                    const photoData = new FormData();
                    servicePhotos.forEach(photo => photoData.append('photos', photo));
                    await axios.post(`${API}/api/services/${editingService._id}/upload-photos`, photoData, {
                        headers: { ...headers, 'Content-Type': 'multipart/form-data' }
                    });
                }
                toast.success('Service updated!');
            } else {
                const formData = new FormData();
                Object.keys(serviceForm).forEach(key => formData.append(key, serviceForm[key]));
                servicePhotos.forEach(photo => formData.append('photos', photo));
                await axios.post(`${API}/api/services`, formData, {
                    headers: { ...headers, 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Service listed successfully!');
            }
            setShowAddService(false);
            setEditingService(null);
            setServicePhotos([]);
            fetchMyServices();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save service');
        } finally { setLoading(false); }
    };

    const handleEditService = (service) => {
        setServiceForm({
            businessName: service.businessName || '', ownerName: user?.ownerName || '',
            mobile: user?.mobile || '', email: user?.email || '',
            category: service.category || 'Photography', description: service.description || '',
            city: service.city || '', state: service.state || '', district: service.district || '',
            address: service.address || '', price: service.price || '',
            priceMin: service.priceMin || '', priceMax: service.priceMax || '', capacity: service.capacity || '',
        });
        setEditingService(service);
        setServicePhotos([]);
        setShowAddService(true);
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
                toast.success('Package updated!');
            } else {
                await axios.post(`${API}/api/service-menu`, formData, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Package added!');
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
        { id: 'overview', label: t('service_provider.overview'), icon: 'grid' },
        { id: 'services', label: t('service_provider.my_services'), icon: 'briefcase' },
        { id: 'packages', label: 'Packages', icon: 'package' },
        { id: 'bookings', label: t('service_provider.bookings'), icon: 'calendarCheck' },
        { id: 'calendar', label: 'Availability', icon: 'clock' },
        { id: 'settings', label: t('service_provider.settings'), icon: 'settings' },
    ];

    const { options: categories } = useOptions('servicecategory');

    return (
        <div style={{ background: '#FBF7F0', minHeight: '100vh' }}>
            <Navbar onLoginClick={() => { }} onRegisterClick={() => { }} />

            <div style={styles.container}>
                {/* SIDEBAR */}
                <div style={styles.sidebar}>
                    <div style={styles.vendorCard}>
                        {user?.logo ? (
                            <img src={`${API}${user.logo}`} alt={user?.businessName}
                                style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '16px', margin: '0 auto 12px', display: 'block' }} />
                        ) : (
                            <div style={styles.vendorIcon}><BusinessPlaceholder variant="badge" size={64} style={{ margin: '0 auto' }} /></div>
                        )}
                        <div style={styles.vendorName}>{user?.businessName}</div>
                        <div style={styles.vendorSub}>{user?.category}</div>
                        <div style={styles.vendorCity}>{user?.city}, {user?.district}</div>
                        <div style={{ ...styles.statusBadge, background: user?.isApproved ? '#E3F6E6' : '#FFF1CC', color: user?.isApproved ? '#1E7B34' : '#A66B00' }}>
                            {user?.isApproved ? 'Approved' : 'Pending approval'}
                        </div>
                    </div>

                    <div style={styles.tabs}>
                        {tabs.map(tab => (
                            <div key={tab.id}
                                style={{ ...styles.tab, ...(activeTab === tab.id ? styles.tabActive : {}) }}
                                onClick={() => setActiveTab(tab.id)}>
                                <Icon name={tab.icon} size={17} /> {tab.label}
                            </div>
                        ))}
                        <div style={styles.tab} onClick={() => setShowSupportChat(true)}>
                            <Icon name="message" size={17} /> Chat with Support
                        </div>
                        <div style={{ ...styles.tab, color: '#D8492E' }} onClick={() => { logout(); navigate('/'); }}>
                            <Icon name="logout" size={17} /> {t('service_provider.logout')}
                        </div>
                    </div>
                </div>

                {/* MAIN */}
                <div style={styles.main}>

                    {/* OVERVIEW */}
                    {activeTab === 'overview' && (
                        <div>
                            <h2 style={styles.pageTitle}>Welcome, {user?.ownerName}</h2>
                            {!user?.isApproved && (
                                <div style={styles.pendingAlert}>
                                    <strong>Your account is pending admin approval.</strong>
                                    <p style={{ fontSize: '13px', marginTop: '4px', color: '#9A7B4F' }}>
                                        Our team will review and approve your listing within 24 hours.
                                    </p>
                                </div>
                            )}
                            <div style={styles.statsGrid}>
                                {[
                                    { icon: 'briefcase', label: t('service_provider.my_services_stat'), value: services.length, gradient: 'linear-gradient(135deg, #42A5F5, #1E88E5)', shadow: 'rgba(30,136,229,0.25)' },
                                    { icon: 'calendarCheck', label: t('service_provider.total_bookings'), value: bookings.length, gradient: 'linear-gradient(135deg, #66BB6A, #43A047)', shadow: 'rgba(67,160,71,0.25)' },
                                    { icon: 'clock', label: 'Pending', value: bookings.filter(b => b.status === 'Pending').length, gradient: 'linear-gradient(135deg, #FFA726, #FB8C00)', shadow: 'rgba(251,140,0,0.25)' },
                                    { icon: 'check', label: 'Confirmed', value: bookings.filter(b => b.status === 'Confirmed').length, gradient: 'linear-gradient(135deg, #EC407A, #D81B60)', shadow: 'rgba(216,27,96,0.25)' },
                                ].map(s => (
                                    <div key={s.label} style={{ ...styles.statCard, background: s.gradient, boxShadow: `0 4px 14px ${s.shadow}` }}>
                                        <Icon name={s.icon} size={19} style={{ color: '#fff' }} />
                                        <div style={styles.statValue}>{s.value}</div>
                                        <div style={styles.statLabel}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                            <h3 style={styles.sectionTitle}>Quick Actions</h3>
                            <div style={styles.actionGrid}>
                                {[
                                    { icon: 'plus', label: 'Add new service', action: () => { setActiveTab('services'); setShowAddService(true); } },
                                    { icon: 'package', label: 'Add package', action: () => setActiveTab('packages') },
                                    { icon: 'calendarCheck', label: 'View bookings', action: () => setActiveTab('bookings') },
                                    { icon: 'settings', label: 'Settings', action: () => setActiveTab('settings') },
                                ].map(a => (
                                    <div key={a.label} style={styles.actionCard} onClick={a.action}>
                                        <Icon name={a.icon} size={22} style={{ color: '#F4511E', margin: '0 auto 8px' }} />
                                        <div style={{ fontSize: '13px', fontWeight: '500', color: '#3A2200' }}>{a.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* MY SERVICES */}
                    {activeTab === 'services' && (
                        <div>
                            <div style={styles.tabHeader}>
                                <h2 style={styles.pageTitle}>My Services</h2>
                                <button style={styles.addBtn} onClick={() => {
                                    if (showAddService) {
                                        setEditingService(null);
                                        setServicePhotos([]);
                                        setServiceForm({
                                            businessName: user?.businessName || '', ownerName: user?.ownerName || '',
                                            mobile: user?.mobile || '', email: user?.email || '',
                                            category: user?.category || 'Photography', description: '',
                                            city: user?.city || '', state: user?.state || '', district: user?.district || '',
                                            address: '', price: '', priceMin: '', priceMax: '', capacity: '',
                                        });
                                    }
                                    setShowAddService(!showAddService);
                                }}>
                                    {showAddService ? (<><Icon name="check" size={14} style={{ color: '#fff' }} /> Cancel</>) : (<><Icon name="plus" size={14} style={{ color: '#fff' }} /> Add service</>)}
                                </button>
                            </div>

                            {showAddService && (
                                <div style={styles.formBox}>
                                    <h3 style={styles.formTitle}>{editingService ? 'Edit Service Listing' : 'Add New Service Listing'}</h3>
                                    <form onSubmit={handleAddService}>
                                        <div style={styles.formGrid}>
                                            {[
                                                { label: 'Business Name *', name: 'businessName', type: 'text', required: true },
                                                { label: 'City *', name: 'city', type: 'text', placeholder: 'e.g. Chennai', required: true },
                                                { label: 'Min Price (INR)', name: 'priceMin', type: 'number', placeholder: 'e.g. 10000' },
                                                { label: 'Max Price (INR)', name: 'priceMax', type: 'number', placeholder: 'e.g. 50000' },
                                                { label: 'Capacity', name: 'capacity', type: 'text', placeholder: 'e.g. 500 guests' },
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
                                                <label style={styles.label}>State</label>
                                                <select style={styles.input} value={serviceForm.state}
                                                    onChange={e => setServiceForm({ ...serviceForm, state: e.target.value, district: '' })}>
                                                    <option value="">Select State</option>
                                                    {STATES_AND_UTS.map(s => <option key={s}>{s}</option>)}
                                                </select>
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>District</label>
                                                <select style={styles.input} value={serviceForm.district} disabled={!serviceForm.state}
                                                    onChange={e => setServiceForm({ ...serviceForm, district: e.target.value })}>
                                                    <option value="">{serviceForm.state ? 'Select District' : 'Select state first'}</option>
                                                    {getDistrictsForState(serviceForm.state).map(d => <option key={d}>{d}</option>)}
                                                </select>
                                            </div>
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
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Mobile</label>
                                            <input style={{ ...styles.input, background: '#F5F5F5', color: '#999' }}
                                                value={user?.mobile || ''} disabled />
                                            <p style={{ fontSize: '11px', color: '#9E9E9E', marginTop: '4px' }}>
                                                Always your account's number — change it from Settings.
                                            </p>
                                        </div>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Photos {editingService ? '(adds to existing)' : '(up to 5)'}</label>
                                            <input type="file" multiple accept="image/*"
                                                style={{ ...styles.input, padding: '8px' }}
                                                onChange={e => setServicePhotos(Array.from(e.target.files))} />
                                            {servicePhotos.length > 0 && (
                                                <p style={{ fontSize: '12px', color: '#7A5C00', marginTop: '4px' }}>
                                                    {servicePhotos.length} photo(s) selected
                                                </p>
                                            )}
                                            {editingService && editingService.photos?.length > 0 && (
                                                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                                                    {editingService.photos.map((p, i) => (
                                                        <img key={i} src={`${API}${p}`} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1.5px solid #F5BE17' }} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <button type="submit" style={{ ...styles.addBtn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
                                            {loading ? 'Saving...' : editingService ? 'Save Changes' : 'Save Service'}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {services.length === 0 ? (
                                <div style={styles.empty}>
                                    <BusinessPlaceholder variant="badge" size={56} style={{ margin: '0 auto 12px' }} />
                                    <h3 style={{ color: '#3A2200' }}>No services listed yet</h3>
                                    <p style={{ color: '#9A7B4F' }}>Add your first service to start getting bookings</p>
                                </div>
                            ) : (
                                <div style={styles.serviceCardGrid}>
                                    {services.map(s => (
                                        <div key={s._id} style={styles.serviceCard}>
                                            <div style={styles.serviceCardPhoto}>
                                                {s.photos?.[0] ? (
                                                    <img src={`${API}${s.photos[0]}`} alt={s.businessName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #FFD873, #F5A623)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Icon name="gift" size={30} style={{ color: '#7A3E00' }} />
                                                    </div>
                                                )}
                                                <span style={{ ...styles.statusPill, position: 'absolute', top: '10px', right: '10px', background: s.isVerified ? 'rgba(227,246,230,0.95)' : 'rgba(255,241,204,0.95)', color: s.isVerified ? '#1E7B34' : '#A66B00' }}>
                                                    {s.isVerified ? 'Verified' : 'Pending'}
                                                </span>
                                            </div>
                                            <div style={styles.serviceCardBody}>
                                                <div style={styles.serviceRowName}>{s.businessName}</div>
                                                <div style={styles.serviceRowMeta}>{s.category} • {s.city}</div>
                                                <div style={{ ...styles.serviceRowMeta, color: '#D8492E', fontWeight: '500', marginBottom: '12px' }}>
                                                    {s.priceMin && s.priceMax ? `₹${s.priceMin} - ₹${s.priceMax}` : s.price || 'Price not set'}
                                                </div>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <button style={styles.cardBtnPrimary} onClick={() => handleEditService(s)}>Edit</button>
                                                    <button style={{ ...styles.cardBtnOutline, color: '#1E88E5', borderColor: '#BBDEFB' }}
                                                        onClick={() => { setActiveTab('packages'); setPackageServiceId(s._id); fetchPackages(s._id); }}>
                                                        Packages
                                                    </button>
                                                    <button style={{ ...styles.cardBtnOutline, color: '#43A047', borderColor: '#C8E6C9' }}
                                                        onClick={() => { setActiveTab('calendar'); loadAvailability(s); }}>
                                                        Calendar
                                                    </button>
                                                </div>
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
                                <h2 style={styles.pageTitle}>Packages and themes</h2>
                                <button style={styles.addBtn} onClick={() => {
                                    setShowAddPackage(!showAddPackage);
                                    setEditingPackage(null);
                                    setPackageForm({ name: '', description: '', price: '', features: '' });
                                }}>
                                    {showAddPackage ? 'Cancel' : 'Add package'}
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
                                    <h3 style={styles.formTitle}>{editingPackage ? 'Edit package' : 'Add new package'}</h3>
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
                                            {loading ? 'Saving...' : editingPackage ? 'Update package' : 'Save package'}
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
                                                    <button style={{ ...styles.pkgBtn, background: '#1E88E5' }} onClick={() => handleEditPackage(pkg)}>Edit</button>
                                                    <button style={{ ...styles.pkgBtn, background: pkg.isActive ? '#F57F17' : '#2E7D32' }} onClick={() => handleTogglePackage(pkg._id)}>
                                                        {pkg.isActive ? '⏸ Hide' : '▶ Show'}
                                                    </button>
                                                    <button style={{ ...styles.pkgBtn, background: '#D8492E' }} onClick={() => handleDeletePackage(pkg._id)}>Delete</button>
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
                            <h2 style={styles.pageTitle}>Bookings ({bookings.length})</h2>
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
                                                    <div style={styles.serviceRowMeta}>{b.user?.name || 'Customer'} • {b.user?.mobile || '—'}</div>
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
                                                    <button style={{ ...styles.addBtn, background: '#43A047', boxShadow: 'none', flex: 1 }} onClick={() => handleConfirmBooking(b._id)}>Confirm booking</button>
                                                    <button style={{ ...styles.addBtn, background: '#D8492E', boxShadow: 'none', flex: 1 }} onClick={() => handleCancelBooking(b._id)}>Cancel booking</button>
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
                            <h2 style={styles.pageTitle}>Availability calendar</h2>
                            {services.length === 0 ? (
                                <div style={styles.empty}>
                                    <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}><Icon name="clock" size={40} style={{ color: '#D8A657' }} /></div>
                                    <h3 style={{ color: '#3A2200' }}>Add a service first</h3>
                                    <p style={{ color: '#9A7B4F' }}>List a service before setting availability</p>
                                    <button style={styles.addBtn} onClick={() => setActiveTab('services')}>Add service</button>
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
                                            <button style={styles.addBtn} onClick={() => loadAvailability(s)}>Manage calendar</button>
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
                            <h2 style={styles.pageTitle}>Account settings</h2>
                            <SettingsForm user={user} API={API} onSuccess={() => { refreshUser(); toast.success('Profile updated!'); }} />
                            <button style={{ ...styles.addBtn, background: '#D8492E', boxShadow: 'none', marginTop: '16px' }}
                                onClick={() => { logout(); navigate('/'); }}>
                                Logout
                            </button>
                        </div>
                    )}

                </div>
            </div>
            <Footer />
            <SupportChatWidget open={showSupportChat} onClose={() => setShowSupportChat(false)} />
        </div>
    );
};

const styles = {
    container: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px', alignItems: 'start' },
    sidebar: {},
    vendorCard: { background: '#fff', borderRadius: '16px', padding: '24px', textAlign: 'center', boxShadow: '0 2px 10px rgba(180,140,20,0.08)', marginBottom: '16px', border: '1px solid #F0E4D0' },
    vendorIcon: { marginBottom: '10px' },
    vendorName: { fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: '700', color: '#3A2200', marginBottom: '4px' },
    vendorSub: { fontSize: '12px', color: '#D8492E', fontWeight: '600', marginBottom: '4px' },
    vendorCity: { fontSize: '12px', color: '#9A7B4F', marginBottom: '12px' },
    statusBadge: { display: 'inline-block', padding: '5px 14px', borderRadius: '50px', fontSize: '12px', fontWeight: '600' },
    tabs: { background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(180,140,20,0.08)', border: '1px solid #F0E4D0', padding: '6px' },
    tab: { display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: '500', color: '#6B5A45', cursor: 'pointer', marginBottom: '2px' },
    tabActive: { background: 'linear-gradient(135deg, #FF8A65, #F4511E)', color: '#fff', fontWeight: '500', boxShadow: '0 3px 10px rgba(244,81,30,0.3)' },
    main: { background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 10px rgba(180,140,20,0.08)', minHeight: '600px', border: '1px solid #F0E4D0' },
    pageTitle: { fontFamily: "'Playfair Display', serif", fontSize: '26px', color: '#3A2200', marginBottom: '24px' },
    pendingAlert: { background: '#FFF8E1', border: '1px solid #F5BE17', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' },
    statCard: { borderRadius: '14px', padding: '18px' },
    statIcon: { fontSize: '28px', marginBottom: '8px' },
    statValue: { fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: '700', color: '#fff', margin: '10px 0 2px' },
    statLabel: { fontSize: '11.5px', color: 'rgba(255,255,255,0.9)' },
    sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: '20px', color: '#3A2200', marginBottom: '16px' },
    actionGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' },
    actionCard: { background: '#FFF8E1', borderRadius: '14px', padding: '20px', textAlign: 'center', cursor: 'pointer', border: '1px solid #F5E6A0' },
    tabHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    addBtn: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'linear-gradient(135deg, #FF8A65, #F4511E)', boxShadow: '0 3px 10px rgba(244,81,30,0.3)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
    pillBtn: { padding: '7px 14px', background: '#fff', border: '1.5px solid', borderRadius: '9px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' },
    formBox: { background: '#FFFDF4', border: '1px solid #F5BE17', borderRadius: '12px', padding: '24px', marginBottom: '24px' },
    formTitle: { fontSize: '16px', fontWeight: '700', color: '#D8492E', marginBottom: '16px' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    formGroup: { marginBottom: '16px' },
    label: { display: 'block', fontSize: '11px', fontWeight: '600', color: '#9A7B4F', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    input: { width: '100%', padding: '11px 14px', border: '1.5px solid #F0E4D0', borderRadius: '8px', fontSize: '14px', color: '#3A2200', background: '#fff', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' },
    servicesList: { display: 'flex', flexDirection: 'column', gap: '12px' },
    serviceCardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' },
    serviceCard: { background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #F0E4D0', boxShadow: '0 4px 16px rgba(180,140,20,0.1)' },
    serviceCardPhoto: { height: '140px', position: 'relative' },
    serviceCardBody: { padding: '14px 16px' },
    cardBtnPrimary: { flex: 1, textAlign: 'center', fontSize: '12px', fontWeight: '500', color: '#fff', background: 'linear-gradient(135deg, #FF8A65, #F4511E)', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' },
    cardBtnOutline: { flex: 1, textAlign: 'center', fontSize: '12px', fontWeight: '500', background: '#fff', border: '1.5px solid', padding: '8px', borderRadius: '8px', cursor: 'pointer' },
    serviceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px', background: '#fff', borderRadius: '14px', border: '1px solid #F0E4D0', boxShadow: '0 2px 10px rgba(180,140,20,0.06)' },
    serviceRowIcon: { width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #FFD873, #F5A623)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    serviceRowInfo: {},
    serviceRowName: { fontWeight: '700', color: '#3A2200', fontSize: '15px', marginBottom: '4px' },
    serviceRowMeta: { fontSize: '12px', color: '#9A7B4F', marginBottom: '2px' },
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