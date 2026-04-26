import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

const Plans = () => {
    const [plans] = useState([
        { id: 1, name: 'Popular Plan', price: 1800, originalPrice: 3000, discount: 40, contacts: 50, duration: 'Unlimited', color: '#E3F2FD', border: '#1565C0' },
        { id: 2, name: 'Diamond Plan', price: 2200, originalPrice: 5000, discount: 56, contacts: 80, duration: 'Unlimited', color: '#F3E5F5', border: '#6A1B9A' },
        { id: 3, name: 'Platinum Plan', price: 2800, originalPrice: 8000, discount: 65, contacts: 130, duration: 'Unlimited', color: '#FFF8E1', border: '#F57F17' },
        { id: 4, name: 'Highly Recommended', price: 3500, originalPrice: 10000, discount: 65, contacts: 200, duration: 'Unlimited', color: '#E8F5E9', border: '#2E7D32' },
        { id: 5, name: 'Assisted Services', price: 5000, originalPrice: 20000, discount: 75, contacts: 999, duration: 'Unlimited', color: '#FCE4EC', border: '#880E4F' },
    ]);

    const [subscribers] = useState([
        { name: 'Priya S.', mobile: '9999999999', plan: 'Diamond Plan', amount: 2200, date: '2024-01-15', status: 'Active' },
        { name: 'Arun K.', mobile: '8888888888', plan: 'Platinum Plan', amount: 2800, date: '2024-01-14', status: 'Active' },
        { name: 'Kavitha R.', mobile: '7777777777', plan: 'Popular Plan', amount: 1800, date: '2024-01-13', status: 'Active' },
        { name: 'Vijay M.', mobile: '6666666666', plan: 'Assisted Services', amount: 5000, date: '2024-01-12', status: 'Expired' },
    ]);

    return (
        <div style={styles.layout}>
            <Sidebar />
            <div style={styles.content}>
                <Navbar title="💳 Plans & Subscriptions" />
                <div style={styles.inner}>

                    {/* Revenue Summary */}
                    <div style={styles.revenueBanner}>
                        <div style={styles.revenueItem}>
                            <div style={styles.revenueValue}>₹{subscribers.filter(s => s.status === 'Active').reduce((a, b) => a + b.amount, 0).toLocaleString('en-IN')}</div>
                            <div style={styles.revenueLabel}>Total Revenue</div>
                        </div>
                        <div style={styles.revenueItem}>
                            <div style={styles.revenueValue}>{subscribers.filter(s => s.status === 'Active').length}</div>
                            <div style={styles.revenueLabel}>Active Subscribers</div>
                        </div>
                        <div style={styles.revenueItem}>
                            <div style={styles.revenueValue}>{subscribers.filter(s => s.status === 'Expired').length}</div>
                            <div style={styles.revenueLabel}>Expired Plans</div>
                        </div>
                        <div style={styles.revenueItem}>
                            <div style={styles.revenueValue}>₹{Math.round(subscribers.reduce((a, b) => a + b.amount, 0) / subscribers.length).toLocaleString('en-IN')}</div>
                            <div style={styles.revenueLabel}>Avg. Plan Value</div>
                        </div>
                    </div>

                    {/* Plans Grid */}
                    <h3 style={styles.sectionTitle}>📋 Available Plans</h3>
                    <div style={styles.plansGrid}>
                        {plans.map(plan => (
                            <div key={plan.id} style={{ ...styles.planCard, background: plan.color, borderTop: `4px solid ${plan.border}` }}>
                                <div style={styles.planName}>{plan.name}</div>
                                <div style={styles.planPrice}>₹{plan.price.toLocaleString('en-IN')}</div>
                                <div style={styles.planOriginal}>₹{plan.originalPrice.toLocaleString('en-IN')}</div>
                                <div style={{ ...styles.planDiscount, color: plan.border }}>{plan.discount}% OFF</div>
                                <div style={styles.planFeatures}>
                                    <div style={styles.planFeature}>👥 {plan.contacts === 999 ? 'Unlimited' : plan.contacts} Contacts</div>
                                    <div style={styles.planFeature}>⏰ {plan.duration} Validity</div>
                                    <div style={styles.planFeature}>✅ WhatsApp Support</div>
                                    <div style={styles.planFeature}>✅ Horoscope View</div>
                                </div>
                                <div style={styles.planStats}>
                                    <span>{subscribers.filter(s => s.plan === plan.name).length} subscribers</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Subscribers Table */}
                    <h3 style={styles.sectionTitle}>👥 Recent Subscribers</h3>
                    <div style={styles.tableWrapper}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.head}>
                                    <th style={styles.th}>#</th>
                                    <th style={styles.th}>Name</th>
                                    <th style={styles.th}>Mobile</th>
                                    <th style={styles.th}>Plan</th>
                                    <th style={styles.th}>Amount</th>
                                    <th style={styles.th}>Date</th>
                                    <th style={styles.th}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscribers.map((s, i) => (
                                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                                        <td style={styles.td}>{i + 1}</td>
                                        <td style={styles.td}><strong>{s.name}</strong></td>
                                        <td style={styles.td}>{s.mobile}</td>
                                        <td style={styles.td}>{s.plan}</td>
                                        <td style={styles.td}>₹{s.amount.toLocaleString('en-IN')}</td>
                                        <td style={styles.td}>{s.date}</td>
                                        <td style={styles.td}>
                                            <span style={{
                                                padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                                                background: s.status === 'Active' ? '#E8F5E9' : '#FFEBEE',
                                                color: s.status === 'Active' ? '#2E7D32' : '#C62828'
                                            }}>
                                                {s.status === 'Active' ? '✅ Active' : '❌ Expired'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    layout: { display: 'flex', minHeight: '100vh', background: '#F5F5F5' },
    content: { marginLeft: '240px', flex: 1 },
    inner: { padding: '28px' },
    revenueBanner: {
        background: 'linear-gradient(135deg, #1A0A0A, #3D1A1A)',
        borderRadius: '16px', padding: '28px',
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px', marginBottom: '28px'
    },
    revenueItem: { textAlign: 'center' },
    revenueValue: {
        fontFamily: "'Georgia', serif", fontSize: '28px',
        fontWeight: '700', color: '#C9A84C', marginBottom: '4px'
    },
    revenueLabel: { fontSize: '12px', color: 'rgba(255,255,255,0.5)' },
    sectionTitle: { fontSize: '18px', fontWeight: '700', color: '#1A0A0A', marginBottom: '16px' },
    plansGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '16px', marginBottom: '28px'
    },
    planCard: {
        borderRadius: '12px', padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    },
    planName: { fontSize: '14px', fontWeight: '700', color: '#1A0A0A', marginBottom: '8px' },
    planPrice: { fontFamily: "'Georgia', serif", fontSize: '26px', fontWeight: '700', color: '#1A0A0A' },
    planOriginal: { fontSize: '12px', color: '#999', textDecoration: 'line-through', marginBottom: '4px' },
    planDiscount: { fontSize: '13px', fontWeight: '700', marginBottom: '12px' },
    planFeatures: { marginBottom: '12px' },
    planFeature: { fontSize: '11px', color: '#555', marginBottom: '4px' },
    planStats: { fontSize: '12px', color: '#888', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '8px' },
    tableWrapper: {
        background: '#fff', borderRadius: '12px', overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #E0E0E0'
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    head: { background: '#F5F5F5' },
    th: {
        padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#555',
        textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.5px',
        borderBottom: '1px solid #E0E0E0'
    },
    td: { padding: '12px 16px', fontSize: '13px', color: '#333', borderBottom: '1px solid #F0F0F0' }
};

export default Plans;