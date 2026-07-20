import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { IconTrash, IconCheck, IconX } from '../../components/AdminIcons';
import API from '../../utils/api';
import toast from 'react-hot-toast';

// Backs the Category dropdown on business registration, the Add/Edit
// Service form, the Wedding Services browse filter, and the "Links To
// Category" selector on Service Cards — renaming or removing a category
// here takes effect in all of those immediately, the same way Profile
// Options works for matrimony fields.
const CATEGORY = 'servicecategory';

const ServiceCategories = () => {
    const [options, setOptions] = useState([]);
    const [newValue, setNewValue] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingValue, setEditingValue] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchOptions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await API.get('/admin/options', { params: { category: CATEGORY, status: 'active' } });
            setOptions(res.data.options || []);
        } catch (err) {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchOptions(); }, [fetchOptions]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newValue.trim()) return;
        try {
            await API.post('/admin/options', { category: CATEGORY, value: newValue.trim() });
            toast.success(`Added "${newValue.trim()}"`);
            setNewValue('');
            fetchOptions();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add');
        }
    };

    const handleDelete = async (id, value) => {
        if (!window.confirm(`Remove "${value}"? Listings that already use this category keep it — this only removes it from dropdowns going forward.`)) return;
        try {
            await API.delete(`/admin/options/${id}`);
            toast.success('Removed');
            fetchOptions();
        } catch (err) {
            toast.error('Failed to remove');
        }
    };

    const startEdit = (o) => { setEditingId(o._id); setEditingValue(o.value); };
    const cancelEdit = () => { setEditingId(null); setEditingValue(''); };

    const handleSaveRename = async (id) => {
        if (!editingValue.trim()) return;
        try {
            await API.put(`/admin/options/${id}`, { value: editingValue.trim() });
            toast.success('Renamed — this takes effect everywhere immediately');
            setEditingId(null);
            setEditingValue('');
            fetchOptions();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to rename');
        }
    };

    return (
        <div style={styles.layout}>
            <Sidebar />
            <div style={styles.content}>
                <Navbar title="Service Categories" />
                <div style={styles.inner}>
                    <div style={styles.panel}>
                        <p style={styles.hint}>
                            Manage the categories vendors pick from when listing a service, and that appear in
                            the Wedding Services filter. Renaming a category here updates it everywhere at once —
                            merging two categories (e.g. Photography and Videography) is just renaming one to
                            match the other's exact name, then removing the now-empty duplicate.
                        </p>

                        <form onSubmit={handleAdd} style={styles.addRow}>
                            <input style={styles.addInput} placeholder="Add a new category..."
                                value={newValue} onChange={e => setNewValue(e.target.value)} />
                            <button type="submit" style={styles.addBtn}>+ Add</button>
                        </form>

                        {loading ? (
                            <p style={styles.hint}>Loading...</p>
                        ) : options.length === 0 ? (
                            <p style={styles.hint}>No categories yet — add the first one above.</p>
                        ) : (
                            <div style={styles.optionsGrid}>
                                {options.map(o => (
                                    <div key={o._id} style={styles.optionChip}>
                                        {editingId === o._id ? (
                                            <>
                                                <input
                                                    autoFocus
                                                    style={styles.chipEditInput}
                                                    value={editingValue}
                                                    onChange={e => setEditingValue(e.target.value)}
                                                    onKeyDown={e => { if (e.key === 'Enter') handleSaveRename(o._id); if (e.key === 'Escape') cancelEdit(); }}
                                                />
                                                <button style={styles.chipSave} onClick={() => handleSaveRename(o._id)} title="Save">
                                                    <IconCheck size={14} />
                                                </button>
                                                <button style={styles.chipDelete} onClick={cancelEdit} title="Cancel">
                                                    <IconX size={14} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <span>{o.value}</span>
                                                <button style={styles.chipEdit} onClick={() => startEdit(o)} title="Rename">✎</button>
                                                <button style={styles.chipDelete} onClick={() => handleDelete(o._id, o.value)} title="Remove">
                                                    <IconTrash size={14} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
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
    panel: { background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    hint: { fontSize: '13px', color: '#999', padding: '4px 0 18px', lineHeight: 1.6, maxWidth: '640px' },
    addRow: { display: 'flex', gap: '10px', marginBottom: '18px' },
    addInput: { flex: 1, padding: '10px 14px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', outline: 'none' },
    addBtn: { padding: '10px 20px', background: '#1A0A0A', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' },
    optionsGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
    optionChip: { display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 8px 7px 14px', background: '#F5F5F5', borderRadius: '20px', fontSize: '13px', color: '#333' },
    chipDelete: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', border: 'none', borderRadius: '50%', background: '#fff', color: '#B71C1C', cursor: 'pointer' },
    chipEdit: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', border: 'none', borderRadius: '50%', background: '#fff', color: '#7A5C00', cursor: 'pointer', fontSize: '12px' },
    chipSave: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', border: 'none', borderRadius: '50%', background: '#fff', color: '#2E7D32', cursor: 'pointer' },
    chipEditInput: { border: '1.5px solid #F5BE17', borderRadius: '14px', padding: '4px 10px', fontSize: '13px', width: '160px', outline: 'none' },
};

export default ServiceCategories;
