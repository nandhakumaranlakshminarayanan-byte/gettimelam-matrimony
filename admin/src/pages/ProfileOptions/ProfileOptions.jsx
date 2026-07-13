import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { IconTrash, IconCheck, IconX } from '../../components/AdminIcons';
import API from '../../utils/api';
import toast from 'react-hot-toast';

// Which categories cascade off which parent category. 'subcaste' cascades
// off a religion+caste PAIR (parent format "religion|caste" on the
// backend), everything else is either flat or single-parent.
const CATEGORIES = [
    { key: 'religion', label: 'Religion' },
    { key: 'caste', label: 'Caste', parentOf: 'religion' },
    { key: 'subcaste', label: 'Sub Caste', parentOf: 'caste' }, // needs religion AND caste
    { key: 'state', label: 'State / UT' },
    { key: 'district', label: 'District', parentOf: 'state' },
    { key: 'job', label: 'Job / Occupation' },
    { key: 'rasi', label: 'Rasi (Zodiac)' },
    { key: 'nakshatra', label: 'Nakshatra (Star)' },
    { key: 'dosham', label: 'Dosham' },
    { key: 'maritalstatus', label: 'Marital Status' },
];

const ProfileOptions = () => {
    const [activeTab, setActiveTab] = useState('manage'); // 'manage' | 'pending'
    const [category, setCategory] = useState('religion');

    // Cascade selections
    const [religionParent, setReligionParent] = useState(''); // for caste, and subcaste's 1st level
    const [casteParent, setCasteParent] = useState('');       // for subcaste's 2nd level
    const [stateParent, setStateParent] = useState('');       // for district

    // Lists used to populate the cascade selector dropdowns themselves
    const [religionChoices, setReligionChoices] = useState([]);
    const [casteChoices, setCasteChoices] = useState([]);
    const [stateChoices, setStateChoices] = useState([]);

    const [options, setOptions] = useState([]);
    const [newValue, setNewValue] = useState('');
    const [loading, setLoading] = useState(false);

    const [pending, setPending] = useState([]);
    const [pendingLoading, setPendingLoading] = useState(false);

    const categoryConfig = CATEGORIES.find(c => c.key === category);

    // Resolve the actual `parent` value the backend expects for the
    // currently-selected category, or undefined if not applicable/not yet
    // chosen (in which case we don't fetch or show the option list).
    const resolveParent = () => {
        if (category === 'caste') return religionParent || null;
        if (category === 'subcaste') return (religionParent && casteParent) ? `${religionParent}|${casteParent}` : null;
        if (category === 'district') return stateParent || null;
        return null; // flat category
    };

    const cascadeReady = () => {
        if (category === 'caste') return !!religionParent;
        if (category === 'subcaste') return !!religionParent && !!casteParent;
        if (category === 'district') return !!stateParent;
        return true;
    };

    // Load the choices needed for cascade selectors
    useEffect(() => {
        if (category === 'caste' || category === 'subcaste') {
            API.get('/admin/options', { params: { category: 'religion', status: 'active' } })
                .then(res => setReligionChoices(res.data.options.map(o => o.value)))
                .catch(() => { });
        }
        if (category === 'district') {
            API.get('/admin/options', { params: { category: 'state', status: 'active' } })
                .then(res => setStateChoices(res.data.options.map(o => o.value)))
                .catch(() => { });
        }
    }, [category]);

    // Load castes for the subcaste religion selector, whenever it changes
    useEffect(() => {
        if (category === 'subcaste' && religionParent) {
            API.get('/admin/options', { params: { category: 'caste', parent: religionParent, status: 'active' } })
                .then(res => setCasteChoices(res.data.options.map(o => o.value)))
                .catch(() => { });
        } else {
            setCasteChoices([]);
        }
    }, [category, religionParent]);

    const fetchOptions = useCallback(async () => {
        if (!cascadeReady()) { setOptions([]); return; }
        setLoading(true);
        try {
            const parent = resolveParent();
            const params = { category, status: 'active' };
            if (parent !== null || categoryConfig?.parentOf) params.parent = parent;
            const res = await API.get('/admin/options', { params });
            setOptions(res.data.options || []);
        } catch (err) {
            toast.error('Failed to load options');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category, religionParent, casteParent, stateParent]);

    useEffect(() => { fetchOptions(); }, [fetchOptions]);

    const fetchPending = async () => {
        setPendingLoading(true);
        try {
            const results = await Promise.all(
                CATEGORIES.map(c => API.get('/admin/options', { params: { category: c.key, status: 'pending' } }))
            );
            const all = results.flatMap(r => r.data.options || []);
            all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setPending(all);
        } catch (err) {
            toast.error('Failed to load pending suggestions');
        } finally {
            setPendingLoading(false);
        }
    };

    // Fetch on mount regardless of which tab is active — the count needs
    // to be visible the moment the page loads, not only after switching to
    // the Pending Suggestions tab (that was the actual bug: the badge
    // stayed empty until you'd already found your way into the tab it was
    // supposed to be pointing you toward).
    useEffect(() => { fetchPending(); }, []);
    useEffect(() => { if (activeTab === 'pending') fetchPending(); }, [activeTab]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newValue.trim()) return;
        try {
            await API.post('/admin/options', { category, value: newValue.trim(), parent: resolveParent() });
            toast.success(`Added "${newValue.trim()}"`);
            setNewValue('');
            fetchOptions();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add');
        }
    };

    const handleDelete = async (id, value) => {
        if (!window.confirm(`Remove "${value}"? Members who already have this value keep it on their profile — this only removes it from the dropdown going forward.`)) return;
        try {
            await API.delete(`/admin/options/${id}`);
            toast.success('Removed');
            fetchOptions();
        } catch (err) {
            toast.error('Failed to remove');
        }
    };

    const handleApprove = async (item) => {
        try {
            await API.put(`/admin/options/${item._id}/approve`);
            toast.success(`"${item.value}" is now live everywhere`);
            fetchPending();
        } catch (err) {
            toast.error('Failed to approve');
        }
    };

    const handleReject = async (item) => {
        if (!window.confirm(`Reject "${item.value}"? This deletes the suggestion.`)) return;
        try {
            await API.delete(`/admin/options/${item._id}`);
            toast.success('Rejected');
            fetchPending();
        } catch (err) {
            toast.error('Failed to reject');
        }
    };

    return (
        <div style={styles.layout}>
            <Sidebar />
            <div style={styles.content}>
                <Navbar title="⚙️ Profile Options" />
                <div style={styles.inner}>

                    <div style={styles.tabs}>
                        <button style={activeTab === 'manage' ? { ...styles.tabBtn, ...styles.tabBtnActive } : styles.tabBtn}
                            onClick={() => setActiveTab('manage')}>Manage Options</button>
                        <button style={activeTab === 'pending' ? { ...styles.tabBtn, ...styles.tabBtnActive } : styles.tabBtn}
                            onClick={() => setActiveTab('pending')}>
                            Pending Suggestions {pending.length > 0 && `(${pending.length})`}
                        </button>
                    </div>

                    {activeTab === 'manage' ? (
                        <div style={styles.panel}>
                            <div style={styles.categoryRow}>
                                {CATEGORIES.map(c => (
                                    <button key={c.key}
                                        style={category === c.key ? { ...styles.catBtn, ...styles.catBtnActive } : styles.catBtn}
                                        onClick={() => {
                                            setCategory(c.key);
                                            setReligionParent(''); setCasteParent(''); setStateParent('');
                                        }}>
                                        {c.label}
                                    </button>
                                ))}
                            </div>

                            {/* Cascade selectors */}
                            {(category === 'caste' || category === 'subcaste') && (
                                <div style={styles.cascadeRow}>
                                    <label style={styles.cascadeLabel}>Religion:</label>
                                    <select style={styles.select} value={religionParent}
                                        onChange={e => { setReligionParent(e.target.value); setCasteParent(''); }}>
                                        <option value="">Select religion</option>
                                        {religionChoices.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                            )}
                            {category === 'subcaste' && religionParent && (
                                <div style={styles.cascadeRow}>
                                    <label style={styles.cascadeLabel}>Caste:</label>
                                    <select style={styles.select} value={casteParent} onChange={e => setCasteParent(e.target.value)}>
                                        <option value="">Select caste</option>
                                        {casteChoices.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            )}
                            {category === 'district' && (
                                <div style={styles.cascadeRow}>
                                    <label style={styles.cascadeLabel}>State / UT:</label>
                                    <select style={styles.select} value={stateParent} onChange={e => setStateParent(e.target.value)}>
                                        <option value="">Select state</option>
                                        {stateChoices.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            )}

                            {!cascadeReady() ? (
                                <p style={styles.hint}>Select the field(s) above to see and manage its options.</p>
                            ) : (
                                <>
                                    <form onSubmit={handleAdd} style={styles.addRow}>
                                        <input style={styles.addInput} placeholder={`Add a new ${categoryConfig.label.toLowerCase()}...`}
                                            value={newValue} onChange={e => setNewValue(e.target.value)} />
                                        <button type="submit" style={styles.addBtn}>+ Add</button>
                                    </form>

                                    {loading ? (
                                        <p style={styles.hint}>Loading...</p>
                                    ) : options.length === 0 ? (
                                        <p style={styles.hint}>No options yet — add the first one above.</p>
                                    ) : (
                                        <div style={styles.optionsGrid}>
                                            {options.map(o => (
                                                <div key={o._id} style={styles.optionChip}>
                                                    <span>{o.value}</span>
                                                    <button style={styles.chipDelete} onClick={() => handleDelete(o._id, o.value)} title="Remove">
                                                        <IconTrash size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ) : (
                        <div style={styles.panel}>
                            {pendingLoading ? (
                                <p style={styles.hint}>Loading...</p>
                            ) : pending.length === 0 ? (
                                <p style={styles.hint}>No pending suggestions right now — this fills up when a member picks "Other" and types a value that isn't in the list yet.</p>
                            ) : (
                                <div style={styles.pendingList}>
                                    {pending.map(item => (
                                        <div key={item._id} style={styles.pendingRow}>
                                            <div>
                                                <div style={styles.pendingValue}>
                                                    {item.value}
                                                    <span style={styles.pendingCategoryTag}>
                                                        {CATEGORIES.find(c => c.key === item.category)?.label || item.category}
                                                    </span>
                                                </div>
                                                <div style={styles.pendingMeta}>
                                                    {item.parent && `Under: ${item.parent.replace('|', ' → ')} · `}
                                                    {item.suggestedByName ? `Suggested by ${item.suggestedByName}` : 'Suggested by a member'}
                                                    {' · '}{new Date(item.createdAt).toLocaleDateString('en-IN')}
                                                </div>
                                            </div>
                                            <div style={styles.pendingActions}>
                                                <button style={styles.approveBtn} onClick={() => handleApprove(item)} title="Approve — make this a live option">
                                                    <IconCheck size={16} /> Approve
                                                </button>
                                                <button style={styles.rejectBtn} onClick={() => handleReject(item)} title="Reject — delete this suggestion">
                                                    <IconX size={16} /> Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    layout: { display: 'flex', minHeight: '100vh', background: '#F5F5F5' },
    content: { marginLeft: '240px', flex: 1 },
    inner: { padding: '28px' },
    tabs: { display: 'inline-flex', gap: '6px', background: '#fff', padding: '4px', borderRadius: '10px', border: '1px solid #E0E0E0', marginBottom: '20px' },
    tabBtn: { padding: '9px 18px', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', background: 'transparent', color: '#666' },
    tabBtnActive: { background: '#1A0A0A', color: '#fff' },
    panel: { background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    categoryRow: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' },
    catBtn: { padding: '8px 14px', border: '1.5px solid #E0E0E0', borderRadius: '20px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', background: '#fff', color: '#555' },
    catBtnActive: { background: '#1A0A0A', color: '#fff', border: '1.5px solid #1A0A0A' },
    cascadeRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
    cascadeLabel: { fontSize: '13px', fontWeight: '600', color: '#555', minWidth: '80px' },
    select: { padding: '9px 12px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '13px', minWidth: '220px' },
    hint: { fontSize: '13px', color: '#999', padding: '20px 0' },
    addRow: { display: 'flex', gap: '10px', marginBottom: '18px', marginTop: '10px' },
    addInput: { flex: 1, padding: '10px 14px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', outline: 'none' },
    addBtn: { padding: '10px 20px', background: '#1A0A0A', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' },
    optionsGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
    optionChip: { display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 8px 7px 14px', background: '#F5F5F5', borderRadius: '20px', fontSize: '13px', color: '#333' },
    chipDelete: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', border: 'none', borderRadius: '50%', background: '#fff', color: '#B71C1C', cursor: 'pointer' },
    pendingList: { display: 'flex', flexDirection: 'column', gap: '10px' },
    pendingRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#FFF8E1', border: '1px solid #F5BE17', borderRadius: '10px', flexWrap: 'wrap', gap: '10px' },
    pendingValue: { fontSize: '14px', fontWeight: '700', color: '#1A0A0A', display: 'flex', alignItems: 'center', gap: '8px' },
    pendingCategoryTag: { fontSize: '10px', fontWeight: '700', color: '#7A5C00', background: '#FDF0C7', padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase' },
    pendingMeta: { fontSize: '12px', color: '#7A6055', marginTop: '4px' },
    pendingActions: { display: 'flex', gap: '8px' },
    approveBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#2E7D32', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' },
    rejectBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#fff', color: '#B71C1C', border: '1.5px solid #B71C1C', borderRadius: '8px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' },
};

export default ProfileOptions;
