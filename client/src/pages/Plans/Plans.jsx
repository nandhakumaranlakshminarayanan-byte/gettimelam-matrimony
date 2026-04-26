import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import LoginModal from '../../components/Modals/LoginModal';
import RegisterModal from '../../components/Modals/RegisterModal';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const plan = {
    id: 1,
    name: '1 Year Premium Plan',
    price: 2600,
    originalPrice: 5000,
    discount: 48,
    contacts: 999,
    color: '#FFF8E1',
    border: '#C9A84C',
    badge: 'Best Value',
    features: [
        'Unlimited Contact Views',
        'View All Horoscopes',
        'WhatsApp Direct Contact',
        'Premium Tag on Profile',
        'Unlimited Profile Browsing',
        'Top Search Listing',
        'Profile Highlighted',
        'Dedicated Support',
        'No Charges After Marriage',
        '1 Year Validity'
    ]
};

const Plans = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSelectPlan = () => {
        if (!user) {
            setShowLogin(true);
            return;
        }
        setSelectedPlan(plan);
    };

    const handlePayment = async () => {
        setLoading(true);
        try {
            const options = {
                key: 'YOUR_RAZORPAY_KEY',
                amount: plan.price * 100,
                currency: 'INR',
                name: 'Gettimelam Matrimony',
                description: plan.name,
                image: '/logo.png',
                handler: function (response) {
                    toast.success('Payment Successful! 🎊 Welcome to Premium!');
                    setSelectedPlan(null);
                    navigate('/dashboard');
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: user?.mobile
                },
                theme: { color: '#C9A84C' }
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            toast.error('Payment failed. Please try again!');
        } finally {
            setLoading(false);
        }
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
                    <div style={styles.headerBadge}>💍 Membership Plan</div>
                    <h1 style={styles.headerTitle}>Simple. Affordable. Unlimited.</h1>
                    <p style={styles.headerDesc}>
                        One plan — View unlimited contacts for just ₹2,600 for 1 full year!
                    </p>
                    <div style={styles.featuresRow}>
                        {[
                            '✅ No Charges After Marriage',
                            '✅ 1 Year Validity',
                            '✅ Unlimited Contacts',
                            '✅ WhatsApp Support'
                        ].map(f => (
                            <span key={f} style={styles.featurePill}>{f}</span>
                        ))}
                    </div>
                </div>
            </div>

            <div style={styles.container}>

                {/* Plan Card — Centered */}
                <div style={styles.planWrapper}>
                    <div style={styles.planCard}>

                        {/* Badge */}
                        <div style={styles.badge}>⭐ {plan.badge}</div>

                        {/* Icon */}
                        <div style={styles.planIcon}>💍</div>

                        {/* Name */}
                        <h2 style={styles.planName}>{plan.name}</h2>

                        {/* Price */}
                        <div style={styles.priceSection}>
                            <div style={styles.price}>₹{plan.price.toLocaleString('en-IN')}</div>
                            <div style={styles.priceMeta}>
                                <span style={styles.originalPrice}>₹{plan.originalPrice.toLocaleString('en-IN')}</span>
                                <span style={styles.discount}>🎉 {plan.discount}% OFF</span>
                            </div>
                            <div style={styles.perYear}>per year • Just ₹{Math.round(plan.price / 12)}/month</div>
                        </div>

                        {/* Contacts Box */}
                        <div style={styles.contactsBox}>
                            <span style={styles.contactsIcon}>∞</span>
                            <div>
                                <div style={styles.contactsTitle}>Unlimited Contact Views</div>
                                <div style={styles.contactsSub}>View all contacts without any limit</div>
                            </div>
                        </div>

                        {/* Features */}
                        <div style={styles.featuresList}>
                            {plan.features.map(f => (
                                <div key={f} style={styles.featureItem}>
                                    <span style={styles.featureCheck}>✓</span>
                                    <span>{f}</span>
                                </div>
                            ))}
                        </div>

                        {/* Button */}
                        <button style={styles.selectBtn} onClick={handleSelectPlan}>
                            {user?.isPremium ? '⭐ You are Premium!' : '🚀 Get Premium Now — ₹2,600'}
                        </button>

                        <p style={styles.noCard}>🔒 Secure Payment via Razorpay • UPI, Cards, Net Banking</p>
                    </div>
                </div>

                {/* Why Premium Section */}
                <div style={styles.whySection}>
                    <h2 style={styles.whyTitle}>Why Go Premium?</h2>
                    <div style={styles.whyGrid}>
                        {[
                            { icon: '📞', title: 'Unlimited Contacts', desc: 'View phone numbers of all profiles you are interested in — no limits!' },
                            { icon: '💬', title: 'WhatsApp Direct', desc: 'Contact matches directly on WhatsApp for faster and easier communication.' },
                            { icon: '⭐', title: 'Premium Profile', desc: 'Get a premium tag on your profile and appear higher in search results.' },
                            { icon: '🔮', title: 'Horoscope Access', desc: 'View detailed horoscope and Rasi details of all profiles.' },
                            { icon: '💰', title: 'No Hidden Charges', desc: 'One simple price. No charges after marriage. No renewal surprises.' },
                            { icon: '🛡️', title: '1 Year Validity', desc: 'Your plan is valid for a full year. Take your time to find the right match.' },
                        ].map(w => (
                            <div key={w.title} style={styles.whyCard}>
                                <div style={styles.whyIcon}>{w.icon}</div>
                                <h4 style={styles.whyCardTitle}>{w.title}</h4>
                                <p style={styles.whyCardDesc}>{w.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQ Section */}
                <div style={styles.faqSection}>
                    <h2 style={styles.faqTitle}>❓ Frequently Asked Questions</h2>
                    <div style={styles.faqGrid}>
                        {[
                            { q: 'Is registration free?', a: 'Yes! Registration on Gettimelam Matrimony is completely free. You only pay when you want to view contact details.' },
                            { q: 'What is included in the plan?', a: 'You get unlimited contact views, horoscope access, WhatsApp contact, premium tag and top search listing for 1 full year.' },
                            { q: 'Are there any charges after marriage?', a: 'Absolutely not! We never charge you after you find your match. Our happiness is your happiness.' },
                            { q: 'How do I pay?', a: 'We accept all major payment methods including Credit/Debit Cards, UPI, Net Banking, and Wallets via Razorpay.' },
                            { q: 'What happens after 1 year?', a: 'You can renew your plan at the same price. Your profile and data will remain safe.' },
                            { q: 'Is my data safe?', a: 'Yes! We use industry-standard encryption. Your contact details are only shared with members you choose to connect with.' },
                        ].map((faq, i) => (
                            <div key={i} style={styles.faqCard}>
                                <div style={styles.faqQ}>❓ {faq.q}</div>
                                <div style={styles.faqA}>{faq.a}</div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Payment Modal */}
            {selectedPlan && (
                <div style={styles.modalOverlay} onClick={() => setSelectedPlan(null)}>
                    <div style={styles.paymentModal} onClick={e => e.stopPropagation()}>
                        <button style={styles.closeBtn} onClick={() => setSelectedPlan(null)}>✕</button>
                        <h2 style={styles.modalTitle}>💳 Complete Payment</h2>

                        <div style={styles.modalPlan}>
                            <div>
                                <div style={styles.modalPlanName}>{plan.name}</div>
                                <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>1 Year Validity • Unlimited Contacts</div>
                            </div>
                            <div style={styles.modalPlanPrice}>₹2,600</div>
                        </div>

                        <div style={styles.modalFeatures}>
                            {plan.features.slice(0, 5).map(f => (
                                <div key={f} style={styles.modalFeature}>
                                    <span style={{ color: '#C9A84C' }}>✓</span> {f}
                                </div>
                            ))}
                        </div>

                        <div style={styles.modalUser}>
                            {[
                                { label: 'Name', value: user?.name },
                                { label: 'Mobile', value: user?.mobile },
                                { label: 'Email', value: user?.email },
                            ].map(item => (
                                <div key={item.label} style={styles.modalUserRow}>
                                    <span style={styles.modalUserLabel}>{item.label}</span>
                                    <span style={styles.modalUserValue}>{item.value}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            style={{ ...styles.payBtn, opacity: loading ? 0.7 : 1 }}
                            onClick={handlePayment}
                            disabled={loading}
                        >
                            {loading ? '⏳ Processing...' : '💳 Pay ₹2,600 Now'}
                        </button>
                        <p style={styles.secureText}>🔒 100% Secure Payment via Razorpay</p>
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
        padding: '56px 24px',
        textAlign: 'center'
    },
    headerInner: { maxWidth: '800px', margin: '0 auto' },
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
        fontSize: '42px',
        color: '#fff',
        marginBottom: '12px'
    },
    headerDesc: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: '16px',
        marginBottom: '24px'
    },
    featuresRow: {
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '10px'
    },
    featurePill: {
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.15)',
        color: 'rgba(255,255,255,0.8)',
        padding: '6px 14px',
        borderRadius: '50px',
        fontSize: '13px',
        fontWeight: '500'
    },
    container: {
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '56px 24px'
    },
    planWrapper: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '64px'
    },
    planCard: {
        background: '#fff',
        borderRadius: '20px',
        padding: '40px 36px',
        boxShadow: '0 8px 40px rgba(201,168,76,0.2)',
        border: '2px solid #C9A84C',
        width: '100%',
        maxWidth: '480px',
        textAlign: 'center',
        position: 'relative'
    },
    badge: {
        position: 'absolute',
        top: '-16px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#C9A84C',
        color: '#fff',
        fontSize: '13px',
        fontWeight: '700',
        padding: '6px 20px',
        borderRadius: '50px',
        whiteSpace: 'nowrap'
    },
    planIcon: { fontSize: '48px', marginBottom: '12px', marginTop: '8px' },
    planName: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '24px',
        fontWeight: '700',
        color: '#1A0A0A',
        marginBottom: '16px'
    },
    priceSection: { marginBottom: '20px' },
    price: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '52px',
        fontWeight: '700',
        color: '#C9A84C',
        lineHeight: 1
    },
    priceMeta: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px',
        marginTop: '6px',
        marginBottom: '4px'
    },
    originalPrice: {
        fontSize: '16px',
        color: '#999',
        textDecoration: 'line-through'
    },
    discount: {
        fontSize: '14px',
        fontWeight: '700',
        color: '#2E7D32'
    },
    perYear: {
        fontSize: '13px',
        color: '#7A6055'
    },
    contactsBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        background: '#FFF8E1',
        border: '1px solid #C9A84C',
        borderRadius: '12px',
        padding: '14px 20px',
        marginBottom: '20px',
        textAlign: 'left'
    },
    contactsIcon: {
        fontSize: '32px',
        fontWeight: '700',
        color: '#C9A84C',
        fontFamily: "'Playfair Display', serif"
    },
    contactsTitle: {
        fontSize: '15px',
        fontWeight: '700',
        color: '#1A0A0A'
    },
    contactsSub: {
        fontSize: '12px',
        color: '#7A6055'
    },
    featuresList: {
        marginBottom: '24px',
        textAlign: 'left'
    },
    featureItem: {
        display: 'flex',
        gap: '10px',
        fontSize: '14px',
        color: '#555',
        marginBottom: '8px',
        alignItems: 'center'
    },
    featureCheck: {
        color: '#C9A84C',
        fontWeight: '700',
        fontSize: '16px'
    },
    selectBtn: {
        width: '100%',
        padding: '16px',
        background: 'linear-gradient(135deg, #C9A84C, #A07830)',
        color: '#fff',
        border: 'none',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer',
        marginBottom: '10px',
        fontFamily: "'DM Sans', sans-serif",
        boxShadow: '0 4px 16px rgba(201,168,76,0.4)'
    },
    noCard: {
        fontSize: '12px',
        color: '#999'
    },
    whySection: { marginBottom: '64px' },
    whyTitle: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '32px',
        color: '#1A0A0A',
        textAlign: 'center',
        marginBottom: '32px'
    },
    whyGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px'
    },
    whyCard: {
        background: '#fff',
        borderRadius: '14px',
        padding: '24px',
        boxShadow: '0 4px 16px rgba(139,26,26,0.06)',
        textAlign: 'center'
    },
    whyIcon: { fontSize: '36px', marginBottom: '12px' },
    whyCardTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#1A0A0A',
        marginBottom: '8px'
    },
    whyCardDesc: {
        fontSize: '13px',
        color: '#7A6055',
        lineHeight: 1.6
    },
    faqSection: { marginBottom: '48px' },
    faqTitle: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '32px',
        color: '#1A0A0A',
        textAlign: 'center',
        marginBottom: '32px'
    },
    faqGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px'
    },
    faqCard: {
        background: '#fff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 16px rgba(139,26,26,0.06)'
    },
    faqQ: {
        fontSize: '14px',
        fontWeight: '700',
        color: '#1A0A0A',
        marginBottom: '8px'
    },
    faqA: {
        fontSize: '13px',
        color: '#7A6055',
        lineHeight: 1.6
    },
    modalOverlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
    },
    paymentModal: {
        background: '#fff',
        borderRadius: '20px',
        padding: '32px 28px',
        width: '100%',
        maxWidth: '460px',
        position: 'relative'
    },
    closeBtn: {
        position: 'absolute',
        top: '16px',
        right: '16px',
        background: '#FDF0F0',
        border: 'none',
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        fontSize: '14px',
        cursor: 'pointer',
        color: '#8B1A1A'
    },
    modalTitle: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '24px',
        color: '#1A0A0A',
        marginBottom: '20px',
        textAlign: 'center'
    },
    modalPlan: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 16px',
        background: '#FFF8E1',
        borderRadius: '10px',
        marginBottom: '16px',
        border: '1px solid #C9A84C'
    },
    modalPlanName: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#1A0A0A'
    },
    modalPlanPrice: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '24px',
        fontWeight: '700',
        color: '#C9A84C'
    },
    modalFeatures: { marginBottom: '16px' },
    modalFeature: {
        fontSize: '13px',
        color: '#555',
        marginBottom: '6px'
    },
    modalUser: {
        background: '#F5F5F5',
        borderRadius: '10px',
        padding: '14px 16px',
        marginBottom: '20px'
    },
    modalUserRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '6px'
    },
    modalUserLabel: {
        fontSize: '12px',
        color: '#999',
        fontWeight: '600'
    },
    modalUserValue: {
        fontSize: '13px',
        color: '#1A0A0A',
        fontWeight: '600'
    },
    payBtn: {
        width: '100%',
        padding: '14px',
        background: 'linear-gradient(135deg, #C9A84C, #A07830)',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer',
        marginBottom: '10px',
        fontFamily: "'DM Sans', sans-serif"
    },
    secureText: {
        textAlign: 'center',
        fontSize: '12px',
        color: '#999'
    }
};

export default Plans;