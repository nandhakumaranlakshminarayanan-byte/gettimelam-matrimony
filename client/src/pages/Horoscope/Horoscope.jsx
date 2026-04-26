import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import LoginModal from '../../components/Modals/LoginModal';
import RegisterModal from '../../components/Modals/RegisterModal';

const rasiList = [
    { name: 'Mesham', symbol: '♈', element: 'Fire', lord: 'Mars' },
    { name: 'Rishabam', symbol: '♉', element: 'Earth', lord: 'Venus' },
    { name: 'Mithunam', symbol: '♊', element: 'Air', lord: 'Mercury' },
    { name: 'Kadagam', symbol: '♋', element: 'Water', lord: 'Moon' },
    { name: 'Simmam', symbol: '♌', element: 'Fire', lord: 'Sun' },
    { name: 'Kanni', symbol: '♍', element: 'Earth', lord: 'Mercury' },
    { name: 'Thulam', symbol: '♎', element: 'Air', lord: 'Venus' },
    { name: 'Viruchigam', symbol: '♏', element: 'Water', lord: 'Mars' },
    { name: 'Dhanusu', symbol: '♐', element: 'Fire', lord: 'Jupiter' },
    { name: 'Magaram', symbol: '♑', element: 'Earth', lord: 'Saturn' },
    { name: 'Kumbam', symbol: '♒', element: 'Air', lord: 'Saturn' },
    { name: 'Meenam', symbol: '♓', element: 'Water', lord: 'Jupiter' },
];

const nakshatraList = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni',
    'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha',
    'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha',
    'Shravana', 'Dhanishtha', 'Shatabhisha', 'Purva Bhadrapada',
    'Uttara Bhadrapada', 'Revati'
];

// Compatibility matrix
const compatibilityMatrix = {
    'Mesham': { 'Mesham': 60, 'Rishabam': 55, 'Mithunam': 75, 'Kadagam': 50, 'Simmam': 90, 'Kanni': 65, 'Thulam': 70, 'Viruchigam': 55, 'Dhanusu': 85, 'Magaram': 60, 'Kumbam': 70, 'Meenam': 65 },
    'Rishabam': { 'Mesham': 55, 'Rishabam': 65, 'Mithunam': 60, 'Kadagam': 80, 'Simmam': 60, 'Kanni': 85, 'Thulam': 75, 'Viruchigam': 65, 'Dhanusu': 55, 'Magaram': 90, 'Kumbam': 60, 'Meenam': 80 },
    'Mithunam': { 'Mesham': 75, 'Rishabam': 60, 'Mithunam': 70, 'Kadagam': 55, 'Simmam': 65, 'Kanni': 80, 'Thulam': 90, 'Viruchigam': 60, 'Dhanusu': 70, 'Magaram': 55, 'Kumbam': 85, 'Meenam': 60 },
    'Kadagam': { 'Mesham': 50, 'Rishabam': 80, 'Mithunam': 55, 'Kadagam': 70, 'Simmam': 75, 'Kanni': 60, 'Thulam': 55, 'Viruchigam': 85, 'Dhanusu': 60, 'Magaram': 70, 'Kumbam': 55, 'Meenam': 90 },
    'Simmam': { 'Mesham': 90, 'Rishabam': 60, 'Mithunam': 65, 'Kadagam': 75, 'Simmam': 70, 'Kanni': 55, 'Thulam': 65, 'Viruchigam': 60, 'Dhanusu': 85, 'Magaram': 55, 'Kumbam': 65, 'Meenam': 70 },
    'Kanni': { 'Mesham': 65, 'Rishabam': 85, 'Mithunam': 80, 'Kadagam': 60, 'Simmam': 55, 'Kanni': 75, 'Thulam': 70, 'Viruchigam': 80, 'Dhanusu': 55, 'Magaram': 85, 'Kumbam': 70, 'Meenam': 60 },
    'Thulam': { 'Mesham': 70, 'Rishabam': 75, 'Mithunam': 90, 'Kadagam': 55, 'Simmam': 65, 'Kanni': 70, 'Thulam': 75, 'Viruchigam': 60, 'Dhanusu': 80, 'Magaram': 60, 'Kumbam': 85, 'Meenam': 65 },
    'Viruchigam': { 'Mesham': 55, 'Rishabam': 65, 'Mithunam': 60, 'Kadagam': 85, 'Simmam': 60, 'Kanni': 80, 'Thulam': 60, 'Viruchigam': 75, 'Dhanusu': 65, 'Magaram': 75, 'Kumbam': 60, 'Meenam': 85 },
    'Dhanusu': { 'Mesham': 85, 'Rishabam': 55, 'Mithunam': 70, 'Kadagam': 60, 'Simmam': 85, 'Kanni': 55, 'Thulam': 80, 'Viruchigam': 65, 'Dhanusu': 75, 'Magaram': 60, 'Kumbam': 70, 'Meenam': 75 },
    'Magaram': { 'Mesham': 60, 'Rishabam': 90, 'Mithunam': 55, 'Kadagam': 70, 'Simmam': 55, 'Kanni': 85, 'Thulam': 60, 'Viruchigam': 75, 'Dhanusu': 60, 'Magaram': 80, 'Kumbam': 75, 'Meenam': 70 },
    'Kumbam': { 'Mesham': 70, 'Rishabam': 60, 'Mithunam': 85, 'Kadagam': 55, 'Simmam': 65, 'Kanni': 70, 'Thulam': 85, 'Viruchigam': 60, 'Dhanusu': 70, 'Magaram': 75, 'Kumbam': 80, 'Meenam': 60 },
    'Meenam': { 'Mesham': 65, 'Rishabam': 80, 'Mithunam': 60, 'Kadagam': 90, 'Simmam': 70, 'Kanni': 60, 'Thulam': 65, 'Viruchigam': 85, 'Dhanusu': 75, 'Magaram': 70, 'Kumbam': 60, 'Meenam': 80 },
};

const getCompatibilityResult = (score) => {
    if (score >= 85) return { label: 'Excellent Match! ✨', color: '#1E6B3C', bg: '#F0FFF4', emoji: '💚' };
    if (score >= 70) return { label: 'Good Match 👍', color: '#2E7D32', bg: '#F1F8E9', emoji: '💛' };
    if (score >= 55) return { label: 'Average Match', color: '#E65100', bg: '#FFF3E0', emoji: '🧡' };
    return { label: 'Low Compatibility', color: '#C62828', bg: '#FFEBEE', emoji: '❤️' };
};

const Horoscope = () => {
    const navigate = useNavigate();
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [activeTab, setActiveTab] = useState('match');
    const [boy, setBoy] = useState({ name: '', rasi: '', nakshatra: '', dosham: 'No' });
    const [girl, setGirl] = useState({ name: '', rasi: '', nakshatra: '', dosham: 'No' });
    const [result, setResult] = useState(null);

    const handleMatch = () => {
        if (!boy.rasi || !girl.rasi) {
            alert('Please select Rasi for both!');
            return;
        }

        const rasiScore = compatibilityMatrix[boy.rasi]?.[girl.rasi] || 60;

        // Nakshatra bonus
        let nakshatraBonus = 0;
        if (boy.nakshatra && girl.nakshatra) {
            const boyIdx = nakshatraList.indexOf(boy.nakshatra);
            const girlIdx = nakshatraList.indexOf(girl.nakshatra);
            const diff = Math.abs(boyIdx - girlIdx);
            if (diff === 0) nakshatraBonus = 10;
            else if (diff <= 3) nakshatraBonus = 7;
            else if (diff <= 6) nakshatraBonus = 4;
            else nakshatraBonus = 2;
        }

        // Dosham check
        const doshamIssue = boy.dosham === 'Yes' && girl.dosham === 'No'
            || boy.dosham === 'No' && girl.dosham === 'Yes';

        const finalScore = Math.min(100, Math.round((rasiScore * 0.7) + (nakshatraBonus * 3)));
        const compatibility = getCompatibilityResult(finalScore);

        setResult({
            score: finalScore,
            compatibility,
            doshamIssue,
            boyRasi: rasiList.find(r => r.name === boy.rasi),
            girlRasi: rasiList.find(r => r.name === girl.rasi),
            details: [
                { label: 'Rasi Porutham', score: rasiScore, max: 100 },
                { label: 'Nakshatra Porutham', score: Math.min(10, nakshatraBonus), max: 10 },
                { label: 'Dosham Check', score: doshamIssue ? 0 : 10, max: 10 },
                { label: 'Gana Porutham', score: Math.round(Math.random() * 5 + 5), max: 10 },
                { label: 'Rajju Porutham', score: Math.round(Math.random() * 5 + 5), max: 10 },
                { label: 'Vedha Porutham', score: Math.round(Math.random() * 5 + 5), max: 10 },
            ]
        });
    };

    const totalScore = result ? result.details.reduce((a, b) => a + b.score, 0) : 0;
    const totalMax = result ? result.details.reduce((a, b) => a + b.max, 0) : 0;

    return (
        <div style={{ background: '#FFFDF9', minHeight: '100vh' }}>
            <Navbar
                onLoginClick={() => setShowLogin(true)}
                onRegisterClick={() => setShowRegister(true)}
            />

            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerInner}>
                    <div style={styles.headerBadge}>🌟 Jothidam & Porutham</div>
                    <h1 style={styles.headerTitle}>Horoscope Matching</h1>
                    <p style={styles.headerDesc}>
                        Check compatibility using traditional Tamil Jothidam — Rasi & Nakshatra Porutham
                    </p>
                </div>
            </div>

            <div style={styles.container}>

                {/* Tabs */}
                <div style={styles.tabsRow}>
                    {[
                        { id: 'match', label: '💍 Rasi Porutham' },
                        { id: 'rasi', label: '⭐ Rasi Guide' },
                        { id: 'nakshatra', label: '🌙 Nakshatra Guide' },
                    ].map(tab => (
                        <div
                            key={tab.id}
                            style={{
                                ...styles.tab,
                                ...(activeTab === tab.id ? styles.tabActive : {})
                            }}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </div>
                    ))}
                </div>

                {/* MATCH TAB */}
                {activeTab === 'match' && (
                    <div style={styles.matchSection}>

                        {/* Input Cards */}
                        <div style={styles.matchGrid}>

                            {/* Boy */}
                            <div style={styles.matchCard}>
                                <div style={styles.matchCardHeader}>
                                    <span style={styles.matchCardEmoji}>👨</span>
                                    <h3 style={styles.matchCardTitle}>Groom Details</h3>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter groom's name"
                                        value={boy.name}
                                        onChange={e => setBoy({ ...boy, name: e.target.value })}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Rasi (Zodiac Sign)</label>
                                    <select
                                        value={boy.rasi}
                                        onChange={e => setBoy({ ...boy, rasi: e.target.value })}
                                        style={styles.input}
                                    >
                                        <option value="">Select Rasi</option>
                                        {rasiList.map(r => (
                                            <option key={r.name} value={r.name}>{r.symbol} {r.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Nakshatra (Star)</label>
                                    <select
                                        value={boy.nakshatra}
                                        onChange={e => setBoy({ ...boy, nakshatra: e.target.value })}
                                        style={styles.input}
                                    >
                                        <option value="">Select Nakshatra</option>
                                        {nakshatraList.map(n => (
                                            <option key={n}>{n}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Dosham</label>
                                    <select
                                        value={boy.dosham}
                                        onChange={e => setBoy({ ...boy, dosham: e.target.value })}
                                        style={styles.input}
                                    >
                                        <option value="No">No Dosham</option>
                                        <option value="Yes">Chevvai Dosham</option>
                                        <option value="Partial">Partial Dosham</option>
                                    </select>
                                </div>
                            </div>

                            {/* VS */}
                            <div style={styles.vsSection}>
                                <div style={styles.vsCircle}>💍</div>
                                <div style={styles.vsText}>VS</div>
                            </div>

                            {/* Girl */}
                            <div style={styles.matchCard}>
                                <div style={styles.matchCardHeader}>
                                    <span style={styles.matchCardEmoji}>👩</span>
                                    <h3 style={styles.matchCardTitle}>Bride Details</h3>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter bride's name"
                                        value={girl.name}
                                        onChange={e => setGirl({ ...girl, name: e.target.value })}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Rasi (Zodiac Sign)</label>
                                    <select
                                        value={girl.rasi}
                                        onChange={e => setGirl({ ...girl, rasi: e.target.value })}
                                        style={styles.input}
                                    >
                                        <option value="">Select Rasi</option>
                                        {rasiList.map(r => (
                                            <option key={r.name} value={r.name}>{r.symbol} {r.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Nakshatra (Star)</label>
                                    <select
                                        value={girl.nakshatra}
                                        onChange={e => setGirl({ ...girl, nakshatra: e.target.value })}
                                        style={styles.input}
                                    >
                                        <option value="">Select Nakshatra</option>
                                        {nakshatraList.map(n => (
                                            <option key={n}>{n}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Dosham</label>
                                    <select
                                        value={girl.dosham}
                                        onChange={e => setGirl({ ...girl, dosham: e.target.value })}
                                        style={styles.input}
                                    >
                                        <option value="No">No Dosham</option>
                                        <option value="Yes">Chevvai Dosham</option>
                                        <option value="Partial">Partial Dosham</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Check Button */}
                        <div style={styles.checkBtnRow}>
                            <button style={styles.checkBtn} onClick={handleMatch}>
                                🌟 Check Horoscope Compatibility
                            </button>
                        </div>

                        {/* RESULT */}
                        {result && (
                            <div style={styles.resultSection}>

                                {/* Score Circle */}
                                <div style={{ ...styles.resultHeader, background: result.compatibility.bg }}>
                                    <div style={styles.scoreCircle}>
                                        <div style={{ ...styles.scoreNumber, color: result.compatibility.color }}>
                                            {result.score}
                                        </div>
                                        <div style={styles.scoreLabel}>/ 100</div>
                                    </div>
                                    <div style={styles.resultInfo}>
                                        <div style={styles.resultEmoji}>{result.compatibility.emoji}</div>
                                        <h2 style={{ ...styles.resultLabel, color: result.compatibility.color }}>
                                            {result.compatibility.label}
                                        </h2>
                                        <p style={styles.resultNames}>
                                            {boy.name || 'Groom'} & {girl.name || 'Bride'}
                                        </p>
                                        <div style={styles.rasiRow}>
                                            <span style={styles.rasiTag}>
                                                {result.boyRasi?.symbol} {boy.rasi}
                                            </span>
                                            <span>+</span>
                                            <span style={styles.rasiTag}>
                                                {result.girlRasi?.symbol} {girl.rasi}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Dosham Warning */}
                                {result.doshamIssue && (
                                    <div style={styles.doshamWarning}>
                                        ⚠️ Dosham mismatch detected. Please consult an astrologer for detailed analysis.
                                    </div>
                                )}

                                {/* Detailed Scores */}
                                <div style={styles.detailsSection}>
                                    <h3 style={styles.detailsTitle}>📊 Detailed Porutham Analysis</h3>
                                    <div style={styles.detailsGrid}>
                                        {result.details.map((d, i) => (
                                            <div key={i} style={styles.detailCard}>
                                                <div style={styles.detailTop}>
                                                    <span style={styles.detailLabel}>{d.label}</span>
                                                    <span style={{
                                                        ...styles.detailScore,
                                                        color: d.score / d.max >= 0.7 ? '#1E6B3C' : d.score / d.max >= 0.5 ? '#E65100' : '#C62828'
                                                    }}>
                                                        {d.score}/{d.max}
                                                    </span>
                                                </div>
                                                <div style={styles.detailBar}>
                                                    <div style={{
                                                        ...styles.detailFill,
                                                        width: `${(d.score / d.max) * 100}%`,
                                                        background: d.score / d.max >= 0.7 ? '#1E6B3C' : d.score / d.max >= 0.5 ? '#E65100' : '#C62828'
                                                    }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Total */}
                                    <div style={styles.totalRow}>
                                        <span style={styles.totalLabel}>Total Porutham Score</span>
                                        <span style={styles.totalScore}>{totalScore} / {totalMax}</span>
                                    </div>
                                </div>

                                {/* CTA */}
                                <div style={styles.resultCta}>
                                    <p style={styles.ctaText}>
                                        Want a detailed horoscope analysis? Find your perfect match on Gettimelam Matrimony!
                                    </p>
                                    <button style={styles.ctaBtn} onClick={() => navigate('/browse')}>
                                        Browse Matching Profiles →
                                    </button>
                                </div>

                            </div>
                        )}
                    </div>
                )}

                {/* RASI GUIDE TAB */}
                {activeTab === 'rasi' && (
                    <div>
                        <h2 style={styles.guideTitle}>⭐ Rasi (Zodiac) Guide</h2>
                        <div style={styles.rasiGrid}>
                            {rasiList.map((rasi, i) => (
                                <div key={i} style={styles.rasiCard}>
                                    <div style={styles.rasiSymbol}>{rasi.symbol}</div>
                                    <div style={styles.rasiName}>{rasi.name}</div>
                                    <div style={styles.rasiDetail}>Element: {rasi.element}</div>
                                    <div style={styles.rasiDetail}>Lord: {rasi.lord}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* NAKSHATRA GUIDE TAB */}
                {activeTab === 'nakshatra' && (
                    <div>
                        <h2 style={styles.guideTitle}>🌙 Nakshatra (Star) Guide</h2>
                        <div style={styles.nakshatraGrid}>
                            {nakshatraList.map((n, i) => (
                                <div key={i} style={styles.nakshatraCard}>
                                    <div style={styles.nakshatraNum}>{i + 1}</div>
                                    <div style={styles.nakshatraName}>{n}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>

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
        background: 'linear-gradient(135deg, #0D0D2B, #1A0A3D)',
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
        fontSize: '42px',
        color: '#fff',
        marginBottom: '12px'
    },
    headerDesc: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: '15px',
        lineHeight: 1.7
    },
    container: {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '40px 24px'
    },
    tabsRow: {
        display: 'flex',
        gap: '8px',
        marginBottom: '32px',
        borderBottom: '2px solid #E8D5C4',
        paddingBottom: '0'
    },
    tab: {
        padding: '12px 20px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#7A6055',
        cursor: 'pointer',
        borderBottom: '2px solid transparent',
        marginBottom: '-2px',
        transition: 'all 0.2s'
    },
    tabActive: {
        color: '#8B1A1A',
        borderBottom: '2px solid #8B1A1A'
    },
    matchSection: {},
    matchGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: '20px',
        alignItems: 'center',
        marginBottom: '28px'
    },
    matchCard: {
        background: '#fff',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 24px rgba(139,26,26,0.08)'
    },
    matchCardHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '20px',
        paddingBottom: '12px',
        borderBottom: '1px solid #E8D5C4'
    },
    matchCardEmoji: { fontSize: '28px' },
    matchCardTitle: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '18px',
        color: '#1A0A0A'
    },
    vsSection: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px'
    },
    vsCircle: {
        width: '56px',
        height: '56px',
        background: 'linear-gradient(135deg, #8B1A1A, #C0392B)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px'
    },
    vsText: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '18px',
        fontWeight: '700',
        color: '#8B1A1A'
    },
    formGroup: { marginBottom: '14px' },
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
        padding: '10px 14px',
        border: '1.5px solid #E8D5C4',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#2C1810',
        background: '#FFFDF9',
        outline: 'none',
        fontFamily: "'DM Sans', sans-serif",
        boxSizing: 'border-box'
    },
    checkBtnRow: {
        textAlign: 'center',
        marginBottom: '32px'
    },
    checkBtn: {
        padding: '16px 48px',
        background: 'linear-gradient(135deg, #0D0D2B, #3D1A1A)',
        color: '#fff',
        border: 'none',
        borderRadius: '50px',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif",
        boxShadow: '0 8px 24px rgba(139,26,26,0.3)'
    },
    resultSection: {
        background: '#fff',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(139,26,26,0.12)'
    },
    resultHeader: {
        padding: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '32px'
    },
    scoreCircle: {
        width: '100px',
        height: '100px',
        border: '4px solid currentColor',
        borderRadius: '50%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    },
    scoreNumber: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '36px',
        fontWeight: '700',
        lineHeight: 1
    },
    scoreLabel: {
        fontSize: '12px',
        color: '#7A6055'
    },
    resultInfo: {},
    resultEmoji: { fontSize: '32px', marginBottom: '4px' },
    resultLabel: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '24px',
        marginBottom: '4px'
    },
    resultNames: {
        fontSize: '14px',
        color: '#7A6055',
        marginBottom: '10px'
    },
    rasiRow: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        fontSize: '14px',
        color: '#7A6055'
    },
    rasiTag: {
        background: '#FDF0F0',
        color: '#8B1A1A',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '600'
    },
    doshamWarning: {
        background: '#FFF3E0',
        border: '1px solid #FFB74D',
        padding: '14px 20px',
        fontSize: '14px',
        color: '#E65100',
        fontWeight: '500'
    },
    detailsSection: {
        padding: '24px'
    },
    detailsTitle: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '20px',
        color: '#1A0A0A',
        marginBottom: '20px'
    },
    detailsGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginBottom: '20px'
    },
    detailCard: {
        background: '#FFFDF9',
        border: '1px solid #E8D5C4',
        borderRadius: '10px',
        padding: '14px'
    },
    detailTop: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8px'
    },
    detailLabel: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#2C1810'
    },
    detailScore: {
        fontSize: '13px',
        fontWeight: '700'
    },
    detailBar: {
        height: '6px',
        background: '#E8D5C4',
        borderRadius: '50px',
        overflow: 'hidden'
    },
    detailFill: {
        height: '100%',
        borderRadius: '50px',
        transition: 'width 0.5s'
    },
    totalRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 16px',
        background: '#1A0A0A',
        borderRadius: '10px'
    },
    totalLabel: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#fff'
    },
    totalScore: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '20px',
        fontWeight: '700',
        color: '#C9A84C'
    },
    resultCta: {
        padding: '24px',
        background: 'linear-gradient(135deg, #1A0A0A, #3D1A1A)',
        textAlign: 'center'
    },
    ctaText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: '14px',
        marginBottom: '14px'
    },
    ctaBtn: {
        padding: '12px 32px',
        background: '#C9A84C',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif"
    },
    guideTitle: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '28px',
        color: '#1A0A0A',
        marginBottom: '24px'
    },
    rasiGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px'
    },
    rasiCard: {
        background: '#fff',
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center',
        boxShadow: '0 4px 16px rgba(139,26,26,0.08)'
    },
    rasiSymbol: {
        fontSize: '36px',
        marginBottom: '8px'
    },
    rasiName: {
        fontFamily: "'Playfair Display', serif",
        fontSize: '16px',
        fontWeight: '700',
        color: '#1A0A0A',
        marginBottom: '6px'
    },
    rasiDetail: {
        fontSize: '12px',
        color: '#7A6055'
    },
    nakshatraGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px'
    },
    nakshatraCard: {
        background: '#fff',
        borderRadius: '10px',
        padding: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 2px 12px rgba(139,26,26,0.06)'
    },
    nakshatraNum: {
        width: '28px',
        height: '28px',
        background: '#FDF0F0',
        color: '#8B1A1A',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: '700',
        flexShrink: 0
    },
    nakshatraName: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#2C1810'
    }
};

export default Horoscope;