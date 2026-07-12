import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import LoginModal from '../../components/Modals/LoginModal';
import RegisterModal from '../../components/Modals/RegisterModal';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = 'http://localhost:5000';

const Plans = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [plans, setPlans] = useState([]);
    const [plansLoading, setPlansLoading] = useState(true);

    // Plans depend on account type — a member and a service provider see
    // completely different pricing, so nothing is fetched until we know
    // who's asking.
    useEffect(() => {
        if (!user) { setPlansLoading(false); return; }
        const type = user.role === 'service' ? 'service' : 'member';
        axios.get(`${API}/api/plans?type=${type}`)
            .then(res => setPlans(res.data.plans || []))
            .catch(() => setPlans([]))
            .finally(() => setPlansLoading(false));
    }, [user]);

    const handleSelectPlan = (plan) => {
        if (!user) {
            setShowLogin(true);
            return;
        }
        setSelectedPlan(plan);
    };

    const handlePayment = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // Step 1 — ask the server to create a real Razorpay order.
            // The price comes from the server's Plan document, never from
            // anything the browser sends, so it can't be tampered with.
            const orderRes = await axios.post(`${API}/api/payments/create-order`,
                { planId: selectedPlan._id },
                { headers }
            );
            const { orderId, amount, currency, keyId } = orderRes.data;

            if (!window.Razorpay) {
                toast.error('Payment window failed to load. Please refresh and try again.');
                setLoading(false);
                return;
            }

            const options = {
                key: keyId,
                amount,
                currency,
                order_id: orderId,
                name: 'Gettimelam Matrimony',
                description: selectedPlan.name,
                image: '/logo.png',
                handler: async function (response) {
                    // Step 2 — hand Razorpay's response to the server so it
                    // can verify the signature. Only a verified payment
                    // actually creates the subscription.
                    try {
                        await axios.post(`${API}/api/payments/verify`, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            planId: selectedPlan._id,
                        }, { headers });

                        toast.success(`Payment Successful! 🎊 Welcome to ${selectedPlan.name}!`);
                        setSelectedPlan(null);
                        navigate('/dashboard');
                    } catch (verifyErr) {
                        toast.error(verifyErr.response?.data?.message || 'Payment verification failed — contact support if money was deducted');
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: user?.mobile
                },
                theme: { color: '#C9A84C' },
                modal: {
                    ondismiss: () => setLoading(false),
                },
            };
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                toast.error('Payment failed: ' + (response.error?.description || 'please try again'));
            });
            rzp.open();
        } catch (err) {
            console.error('Payment start failed:', err);
            const serverMsg = err.response?.data?.message;
            const statusInfo = err.response?.status ? ` (HTTP ${err.response.status})` : ' (no response from server)';
            toast.error(serverMsg ? `${serverMsg}` : `Could not start payment${statusInfo}. Check console for details.`);
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
                        Unlimited contacts, unlimited connections — valid for 1 full year!
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

                {/* Plan Cards — gated behind login, since which plans apply depends on account type */}
                {!user ? (
                    <div style={styles.loginGate}>
                        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.6" strokeLinecap="round" style={{ margin: '0 auto 16px', display: 'block' }}>
                            <rect x="5" y="10" width="14" height="10" rx="2.5" />
                            <path d="M8 10V7.5C8 5 9.8 3 12 3s4 2 4 4.5V10" />
                            <circle cx="12" cy="14.6" r="1.7" fill="#C9A84C" stroke="none" />
                        </svg>
                        <h3 style={styles.loginGateTitle}>Login to View Plans</h3>
                        <p style={styles.loginGateDesc}>
                            Member and Service Provider plans are priced differently —
                            log in so we can show the right plan for your account.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
                            <button style={styles.loginGateBtn} onClick={() => setShowLogin(true)}>Login</button>
                            <button style={styles.loginGateBtnOutline} onClick={() => setShowRegister(true)}>Free Register</button>
                        </div>
                    </div>
                ) : plansLoading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>Loading plans...</div>
                ) : plans.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
                        No plans available right now — check back soon!
                    </div>
                ) : (
                    <div style={styles.planWrapper}>
                        {plans.map(p => {
                            const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : null;
                            const alreadyThisPlan = user?.isPremium && user?.plan === p.name;
                            return (
                                <div key={p._id} style={styles.planCard}>
                                    <div style={styles.badge}>⭐ Best Value</div>
                                    <div style={styles.planIcon}>{user.role === 'service' ? '🏪' : '💍'}</div>
                                    <h2 style={styles.planName}>{p.name}</h2>

                                    <div style={styles.priceSection}>
                                        <div style={styles.price}>₹{p.price.toLocaleString('en-IN')}</div>
                                        {p.originalPrice && (
                                            <div style={styles.priceMeta}>
                                                <span style={styles.originalPrice}>₹{p.originalPrice.toLocaleString('en-IN')}</span>
                                                <span style={styles.discount}>🎉 {discount}% OFF</span>
                                            </div>
                                        )}
                                        <div style={styles.perYear}>per year • Just ₹{Math.round(p.price / 12)}/month</div>
                                    </div>

                                    <div style={styles.contactsBox}>
                                        <span style={styles.contactsIcon}>∞</span>
                                        <div>
                                            <div style={styles.contactsTitle}>Unlimited Contact Views</div>
                                            <div style={styles.contactsSub}>View all contacts without any limit</div>
                                        </div>
                                    </div>

                                    <div style={styles.featuresList}>
                                        {(p.features || []).map(f => (
                                            <div key={f} style={styles.featureItem}>
                                                <span style={styles.featureCheck}>✓</span>
                                                <span>{f}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button style={styles.selectBtn} onClick={() => handleSelectPlan(p)} disabled={alreadyThisPlan}>
                                        {alreadyThisPlan ? '⭐ You are on this Plan!' : `🚀 Get This Plan — ₹${p.price.toLocaleString('en-IN')}`}
                                    </button>

                                    <p style={styles.noCard}>🔒 Secure Payment via Razorpay • UPI, Cards, Net Banking</p>
                                </div>
                            );
                        })}
                    </div>
                )}

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
                                <div style={styles.modalPlanName}>{selectedPlan.name}</div>
                                <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>1 Year Validity • Unlimited Contacts</div>
                            </div>
                            <div style={styles.modalPlanPrice}>₹{selectedPlan.price.toLocaleString('en-IN')}</div>
                        </div>

                        <div style={styles.modalFeatures}>
                            {(selectedPlan.features || []).slice(0, 5).map(f => (
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
                            {loading ? '⏳ Processing...' : `💳 Pay ₹${selectedPlan.price.toLocaleString('en-IN')} Now`}
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
    loginGate: {
        maxWidth: '480px', margin: '40px auto 60px', textAlign: 'center', padding: '44px 36px',
        background: '#fff', borderRadius: '18px', border: '1px solid #EFE3C0',
        boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
    },
    loginGateTitle: { fontFamily: "'Playfair Display', serif", fontSize: '24px', color: '#1A0A0A', marginBottom: '10px' },
    loginGateDesc: { fontSize: '14px', color: '#7A6055', lineHeight: 1.7 },
    loginGateBtn: { padding: '13px 30px', background: 'linear-gradient(135deg, #8B1A1A, #B71C1C)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' },
    loginGateBtnOutline: { padding: '13px 30px', background: '#fff', color: '#8B1A1A', border: '1.5px solid #8B1A1A', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' },
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
        flexWrap: 'wrap',
        gap: '24px',
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