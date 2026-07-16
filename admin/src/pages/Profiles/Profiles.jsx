import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { useOptions } from '../../hooks/useOptions';

const Profiles = () => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingProfile, setEditingProfile] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [viewingProfile, setViewingProfile] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [aadharActionLoading, setAadharActionLoading] = useState(false);

    // Live options for the Edit modal — so admin can only pick valid
    // taxonomy values instead of free-typing something that won't match
    // member-facing filters (e.g. "Naicker/Vanniya Kula Kshatriyar" typed
    // instead of the real "Vanniyar" option).
    const { options: religionOptions } = useOptions('religion');
    const { options: casteOptions } = useOptions('caste', { parent: editForm?.religion, allowAllWhenNoParent: true });
    const { options: subCasteOptions } = useOptions('subcaste', {
        parent: editForm?.religion && editForm?.caste ? `${editForm.religion}|${editForm.caste}` : '',
        requireParent: true,
    });
    const { options: stateOptions } = useOptions('state');
    const { options: districtOptions } = useOptions('district', { parent: editForm?.state, requireParent: true });
    const { options: rasiOptions } = useOptions('rasi');
    const { options: nakshatraOptions } = useOptions('nakshatra');
    const { options: jobOptions } = useOptions('job');

    useEffect(() => { fetchProfiles(); }, []);

    const fetchProfiles = async () => {
        setLoading(true);
        try {
            const res = await API.get('/admin/profiles');
            setProfiles(res.data.profiles);
        } catch (err) {
            toast.error('Failed to load profiles');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id) => {
        try {
            await API.put(`/admin/profiles/${id}/verify`);
            toast.success('Profile verified! ✅');
            fetchProfiles();
            if (viewingProfile) setViewingProfile(v => ({ ...v, isVerified: true }));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to verify');
        }
    };

    const handleApproveAadhar = async (id) => {
        setAadharActionLoading(true);
        try {
            const res = await API.put(`/admin/profiles/${id}/aadhar/approve`);
            toast.success('Aadhar approved');
            fetchProfiles();
            setViewingProfile(res.data.profile);
        } catch (err) {
            toast.error('Failed to approve Aadhar');
        } finally {
            setAadharActionLoading(false);
        }
    };

    const handleRejectAadhar = async (id) => {
        setAadharActionLoading(true);
        try {
            const res = await API.put(`/admin/profiles/${id}/aadhar/reject`, { reason: rejectReason || undefined });
            toast.success('Aadhar rejected');
            setRejectReason('');
            fetchProfiles();
            setViewingProfile(res.data.profile);
        } catch (err) {
            toast.error('Failed to reject Aadhar');
        } finally {
            setAadharActionLoading(false);
        }
    };

    // Used when a phone verification call reveals something was entered
    // wrong — lets admin correct it directly instead of asking the member
    // to go re-edit it themselves.
    const openEdit = (p) => {
        setEditingProfile(p);
        setEditForm({
            name: p.name || '', height: p.height || '', complexion: p.complexion || '',
            maritalStatus: p.maritalStatus || '', religion: p.religion || '', caste: p.caste || '',
            subCaste: p.subCaste || '', rasi: p.rasi || '', nakshatra: p.nakshatra || '', dosham: p.dosham || '',
            education: p.education || '', occupation: p.occupation || '', city: p.city || '',
            district: p.district || '', state: p.state || '', familyType: p.familyType || '',
            annualIncome: p.annualIncome || '',
        });
    };

    const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await API.put(`/admin/profiles/${editingProfile._id}`, editForm);
            toast.success('Profile updated! ✅');
            setEditingProfile(null);
            fetchProfiles();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={styles.layout}>
            <Sidebar />
            <div style={styles.content}>
                <Navbar title="👤 Manage Profiles" />
                <div style={styles.inner}>
                    <div style={styles.topRow}>
                        <h3 style={styles.count}>{profiles.length} profiles registered</h3>
                    </div>

                    {loading ? (
                        <div style={styles.loading}>Loading...</div>
                    ) : (
                        <div style={styles.grid}>
                            {profiles.map(p => (
                                <div key={p._id} style={styles.card}>
                                    <div style={{
                                        ...styles.photo,
                                        background: p.gender === 'Female'
                                            ? 'linear-gradient(135deg, #FDEEF5, #F5D5E8)'
                                            : 'linear-gradient(135deg, #EEF2FD, #D5DEF5)'
                                    }}>
                                        <span style={{ fontSize: '40px' }}>
                                            {p.photo
                                                ? <img src={`http://localhost:5000${p.photo}`} alt="" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                                                : p.gender === 'Female' ? '👩' : '👨'
                                            }
                                        </span>
                                        {p.isVerified && (
                                            <span style={styles.verifiedBadge}>✓ Verified</span>
                                        )}
                                    </div>
                                    <div style={styles.info}>
                                        <div style={styles.name}>{p.name || p.user?.name}</div>
                                        {/* If someone registered this profile on behalf of a relative, surface that clearly */}
                                        {p.profileFor && p.profileFor !== 'Myself' && (
                                            <div style={styles.registeredBy}>
                                                👤 Registered by {p.user?.name || 'account holder'} ({p.profileFor})
                                            </div>
                                        )}
                                        <div style={styles.meta}>📞 {p.user?.mobile}</div>
                                        <div style={styles.meta}>
                                            {p.religion} • {p.caste}
                                            {p.customFields?.includes('religion') && (
                                                <span style={styles.customBadge} title="Member typed this in via 'Other' rather than picking from the list">✎ custom religion</span>
                                            )}
                                        </div>
                                        <div style={styles.meta}>
                                            {p.occupation} • {p.city}
                                            {p.customFields?.includes('district') && (
                                                <span style={styles.customBadge} title="Member typed this in via 'Other' rather than picking from the list">✎ custom district</span>
                                            )}
                                        </div>
                                        <div style={styles.meta}>📧 {p.user?.email}</div>
                                        <div style={styles.meta}>
                                            🪪 Aadhar: {' '}
                                            <span style={{
                                                fontWeight: '700',
                                                color: p.aadharStatus === 'approved' ? '#2E7D32'
                                                    : p.aadharStatus === 'pending' ? '#7A5C00'
                                                        : p.aadharStatus === 'rejected' ? '#B71C1C' : '#999',
                                            }}>
                                                {p.aadharStatus === 'approved' ? 'Approved'
                                                    : p.aadharStatus === 'pending' ? 'Pending review'
                                                        : p.aadharStatus === 'rejected' ? 'Rejected' : 'Not submitted'}
                                            </span>
                                        </div>
                                        <div style={styles.actions}>
                                            {!p.isVerified ? (
                                                p.aadharStatus === 'approved' ? (
                                                    <button style={styles.verifyBtn} onClick={() => handleVerify(p._id)}>
                                                        ✅ Verify Profile
                                                    </button>
                                                ) : (
                                                    <button style={styles.verifyBtnDisabled} disabled title="Aadhar must be submitted and approved first">
                                                        🔒 Verify (needs Aadhar)
                                                    </button>
                                                )
                                            ) : (
                                                <span style={styles.verifiedText}>✓ Verified</span>
                                            )}
                                            <button style={styles.viewBtn} onClick={() => setViewingProfile(p)}>👁 View</button>
                                            <button style={styles.editBtn} onClick={() => openEdit(p)}>✎ Edit</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {profiles.length === 0 && (
                                <div style={styles.empty}>
                                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>👤</div>
                                    <p style={{ color: '#999' }}>No profiles yet</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {editingProfile && editForm && (
                <div style={styles.modalOverlay} onClick={() => setEditingProfile(null)}>
                    <div style={styles.modal} onClick={e => e.stopPropagation()}>
                        <h3 style={styles.modalTitle}>Edit {editingProfile.name || editingProfile.user?.name}'s Profile</h3>
                        <form onSubmit={handleSaveEdit}>
                            <div style={styles.modalGrid}>
                                <div>
                                    <label style={styles.modalLabel}>Name</label>
                                    <input style={styles.modalInput} name="name" value={editForm.name} onChange={handleEditChange} />
                                </div>
                                <div>
                                    <label style={styles.modalLabel}>Height</label>
                                    <input style={styles.modalInput} name="height" value={editForm.height} onChange={handleEditChange} />
                                </div>
                                <div>
                                    <label style={styles.modalLabel}>Complexion</label>
                                    <input style={styles.modalInput} name="complexion" value={editForm.complexion} onChange={handleEditChange} />
                                </div>
                                <div>
                                    <label style={styles.modalLabel}>Marital Status</label>
                                    <select style={styles.modalInput} name="maritalStatus" value={editForm.maritalStatus} onChange={handleEditChange}>
                                        <option value="">Select</option>
                                        <option>Never Married</option><option>Divorced</option><option>Widowed</option><option>Separated</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={styles.modalLabel}>Religion</label>
                                    <select style={styles.modalInput} name="religion" value={editForm.religion}
                                        onChange={e => setEditForm({ ...editForm, religion: e.target.value, caste: '', subCaste: '' })}>
                                        <option value="">Select</option>
                                        {religionOptions.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={styles.modalLabel}>Caste</label>
                                    <select style={styles.modalInput} name="caste" value={editForm.caste}
                                        onChange={e => setEditForm({ ...editForm, caste: e.target.value, subCaste: '' })}>
                                        <option value="">Select</option>
                                        {casteOptions.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={styles.modalLabel}>Sub Caste</label>
                                    <select style={styles.modalInput} name="subCaste" value={editForm.subCaste} onChange={handleEditChange}>
                                        <option value="">Select</option>
                                        {subCasteOptions.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={styles.modalLabel}>Rasi</label>
                                    <select style={styles.modalInput} name="rasi" value={editForm.rasi} onChange={handleEditChange}>
                                        <option value="">Select</option>
                                        {rasiOptions.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={styles.modalLabel}>Nakshatra</label>
                                    <select style={styles.modalInput} name="nakshatra" value={editForm.nakshatra} onChange={handleEditChange}>
                                        <option value="">Select</option>
                                        {nakshatraOptions.map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={styles.modalLabel}>Dosham</label>
                                    <select style={styles.modalInput} name="dosham" value={editForm.dosham} onChange={handleEditChange}>
                                        <option value="">Select</option>
                                        <option>No</option><option>Yes</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={styles.modalLabel}>Education</label>
                                    <input style={styles.modalInput} name="education" value={editForm.education} onChange={handleEditChange} />
                                </div>
                                <div>
                                    <label style={styles.modalLabel}>Occupation</label>
                                    <select style={styles.modalInput} name="occupation" value={editForm.occupation} onChange={handleEditChange}>
                                        <option value="">Select</option>
                                        {jobOptions.map(j => <option key={j} value={j}>{j}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={styles.modalLabel}>City</label>
                                    <input style={styles.modalInput} name="city" value={editForm.city} onChange={handleEditChange} />
                                </div>
                                <div>
                                    <label style={styles.modalLabel}>State</label>
                                    <select style={styles.modalInput} name="state" value={editForm.state}
                                        onChange={e => setEditForm({ ...editForm, state: e.target.value, district: '' })}>
                                        <option value="">Select</option>
                                        {stateOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={styles.modalLabel}>District</label>
                                    <select style={styles.modalInput} name="district" value={editForm.district} onChange={handleEditChange} disabled={!editForm.state}>
                                        <option value="">{editForm.state ? 'Select' : 'Select state first'}</option>
                                        {districtOptions.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={styles.modalLabel}>Family Type</label>
                                    <select style={styles.modalInput} name="familyType" value={editForm.familyType} onChange={handleEditChange}>
                                        <option value="">Select</option>
                                        <option>Nuclear</option><option>Joint</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={styles.modalLabel}>Annual Income</label>
                                    <input style={styles.modalInput} name="annualIncome" value={editForm.annualIncome} onChange={handleEditChange} />
                                </div>
                            </div>
                            <div style={styles.modalActions}>
                                <button type="button" style={styles.modalCancelBtn} onClick={() => setEditingProfile(null)}>Cancel</button>
                                <button type="submit" style={{ ...styles.modalSaveBtn, opacity: saving ? 0.7 : 1 }} disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {viewingProfile && (
                <div style={styles.modalOverlay} onClick={() => setViewingProfile(null)}>
                    <div style={styles.modal} onClick={e => e.stopPropagation()}>
                        <h3 style={styles.modalTitle}>{viewingProfile.name || viewingProfile.user?.name}'s Full Profile</h3>

                        {/* Photo gallery — every photo uploaded, not just the main one */}
                        {(viewingProfile.photos?.length > 0 || viewingProfile.photo) && (
                            <div style={styles.viewSection}>
                                <div style={styles.viewSectionTitle}>Photos ({(viewingProfile.photos?.length || (viewingProfile.photo ? 1 : 0))})</div>
                                <div style={styles.photoGrid}>
                                    {(viewingProfile.photos?.length > 0 ? viewingProfile.photos : [viewingProfile.photo]).filter(Boolean).map((p, i) => (
                                        <img key={i} src={`http://localhost:5000${p}`} alt="" style={styles.photoThumb} />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={styles.viewSection}>
                            <div style={styles.viewSectionTitle}>Contact</div>
                            <div style={styles.viewRow}><span>Mobile</span><b>{viewingProfile.user?.mobile}</b></div>
                            <div style={styles.viewRow}><span>Email</span><b>{viewingProfile.user?.email}</b></div>
                            {viewingProfile.createdByName && (
                                <div style={styles.viewRow}><span>Registered By</span><b>{viewingProfile.createdByName} ({viewingProfile.profileFor})</b></div>
                            )}
                        </div>

                        <div style={styles.viewSection}>
                            <div style={styles.viewSectionTitle}>Personal</div>
                            <div style={styles.viewRow}><span>Gender</span><b>{viewingProfile.gender || '—'}</b></div>
                            <div style={styles.viewRow}><span>Date of Birth</span><b>{viewingProfile.dateOfBirth ? new Date(viewingProfile.dateOfBirth).toLocaleDateString('en-IN') : '—'}</b></div>
                            <div style={styles.viewRow}><span>Height / Weight</span><b>{[viewingProfile.height, viewingProfile.weight].filter(Boolean).join(' / ') || '—'}</b></div>
                            <div style={styles.viewRow}><span>Complexion</span><b>{viewingProfile.complexion || '—'}</b></div>
                            <div style={styles.viewRow}><span>Marital Status</span><b>{viewingProfile.maritalStatus || '—'}</b></div>
                            <div style={styles.viewRow}><span>Family Type</span><b>{viewingProfile.familyType || '—'}</b></div>
                            <div style={styles.viewRow}><span>Mother Tongue</span><b>{viewingProfile.motherTongue || '—'}</b></div>
                            <div style={styles.viewRow}><span>Known Languages</span><b>{viewingProfile.knownLanguages?.join(', ') || '—'}</b></div>
                        </div>

                        <div style={styles.viewSection}>
                            <div style={styles.viewSectionTitle}>Religion</div>
                            <div style={styles.viewRow}><span>Religion / Caste / Sub Caste</span><b>{[viewingProfile.religion, viewingProfile.caste, viewingProfile.subCaste].filter(Boolean).join(' / ') || '—'}</b></div>
                            <div style={styles.viewRow}><span>Gothra</span><b>{viewingProfile.gothra || '—'}</b></div>
                        </div>

                        {/* Horoscope — its own clearly-labeled section, not mixed into Religion */}
                        <div style={styles.viewSection}>
                            <div style={styles.viewSectionTitle}>🌙 Horoscope</div>
                            <div style={styles.viewRow}><span>Rasi (Zodiac)</span><b>{viewingProfile.rasi || '—'}</b></div>
                            <div style={styles.viewRow}><span>Nakshatra (Star)</span><b>{viewingProfile.nakshatra || '—'}</b></div>
                            <div style={styles.viewRow}><span>Dosham</span><b>{viewingProfile.dosham || '—'}</b></div>
                            {viewingProfile.horoscopeDocuments?.length > 0 && (
                                <div style={{ ...styles.photoGrid, marginTop: '8px' }}>
                                    {viewingProfile.horoscopeDocuments.map((d, i) => (
                                        <a key={i} href={`http://localhost:5000${d}`} target="_blank" rel="noopener noreferrer">
                                            {d.endsWith('.pdf')
                                                ? <div style={{ ...styles.photoThumb, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#B71C1C' }}>📄 PDF</div>
                                                : <img src={`http://localhost:5000${d}`} alt="" style={styles.photoThumb} />}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={styles.viewSection}>
                            <div style={styles.viewSectionTitle}>Education & Career</div>
                            <div style={styles.viewRow}><span>Education</span><b>{viewingProfile.education || '—'}</b></div>
                            <div style={styles.viewRow}><span>Employed</span><b>{viewingProfile.employed || '—'}</b></div>
                            <div style={styles.viewRow}><span>Occupation</span><b>{viewingProfile.occupation || '—'}</b></div>
                            {viewingProfile.occupationRemark && (
                                <div style={styles.viewRow}><span>Occupation Remark</span><b>{viewingProfile.occupationRemark}</b></div>
                            )}
                            <div style={styles.viewRow}><span>Annual Income</span><b>{viewingProfile.annualIncome || '—'}</b></div>
                        </div>

                        <div style={styles.viewSection}>
                            <div style={styles.viewSectionTitle}>Location</div>
                            <div style={styles.viewRow}><span>City / District / State</span><b>{[viewingProfile.city, viewingProfile.district, viewingProfile.state].filter(Boolean).join(' / ') || '—'}</b></div>
                            <div style={styles.viewRow}><span>Country</span><b>{viewingProfile.country || '—'}</b></div>
                            {(viewingProfile.workingCity || viewingProfile.workingDistrict || viewingProfile.workingState) && (
                                <div style={styles.viewRow}><span>Working Location</span><b>{[viewingProfile.workingCity, viewingProfile.workingDistrict, viewingProfile.workingState, viewingProfile.workingCountry].filter(Boolean).join(' / ')}</b></div>
                            )}
                        </div>

                        {(viewingProfile.fatherOccupation || viewingProfile.motherOccupation || viewingProfile.siblings) && (
                            <div style={styles.viewSection}>
                                <div style={styles.viewSectionTitle}>Family Details</div>
                                {viewingProfile.fatherOccupation && <div style={styles.viewRow}><span>Father's Occupation</span><b>{viewingProfile.fatherOccupation}</b></div>}
                                {viewingProfile.motherOccupation && <div style={styles.viewRow}><span>Mother's Occupation</span><b>{viewingProfile.motherOccupation}</b></div>}
                                {viewingProfile.siblings && <div style={styles.viewRow}><span>Siblings</span><b>{viewingProfile.siblings}</b></div>}
                            </div>
                        )}

                        {viewingProfile.about && (
                            <div style={styles.viewSection}>
                                <div style={styles.viewSectionTitle}>About</div>
                                <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.6, margin: 0 }}>{viewingProfile.about}</p>
                            </div>
                        )}

                        {viewingProfile.customFields?.length > 0 && (
                            <div style={styles.viewSection}>
                                <div style={styles.viewSectionTitle}>✎ Entered via "Other"</div>
                                <p style={{ fontSize: '12.5px', color: '#B71C1C', margin: 0 }}>
                                    {viewingProfile.customFields.join(', ')} — worth checking Profile Options → Pending Suggestions
                                </p>
                            </div>
                        )}

                        {/* Aadhar review — the gate that unlocks Verify Profile */}
                        <div style={{ ...styles.viewSection, background: '#FFF8E1', border: '1px solid #F5BE17', borderRadius: '10px', padding: '14px' }}>
                            <div style={styles.viewSectionTitle}>🪪 Aadhar Verification (ID Proof)</div>
                            <div style={styles.viewRow}><span>Number</span><b>{viewingProfile.aadharNumber || 'Not submitted'}</b></div>
                            {viewingProfile.aadharDocuments?.length > 0 && (
                                <div style={{ margin: '8px 0' }}>
                                    <div style={styles.photoGrid}>
                                        {viewingProfile.aadharDocuments.map((d, i) => (
                                            <a key={i} href={`http://localhost:5000${d}`} target="_blank" rel="noopener noreferrer">
                                                {d.endsWith('.pdf')
                                                    ? <div style={{ ...styles.photoThumb, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#B71C1C' }}>📄 PDF</div>
                                                    : <img src={`http://localhost:5000${d}`} alt="" style={styles.photoThumb} />}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div style={styles.viewRow}>
                                <span>Status</span>
                                <b style={{
                                    color: viewingProfile.aadharStatus === 'approved' ? '#2E7D32'
                                        : viewingProfile.aadharStatus === 'pending' ? '#7A5C00'
                                            : viewingProfile.aadharStatus === 'rejected' ? '#B71C1C' : '#999',
                                }}>
                                    {viewingProfile.aadharStatus === 'approved' ? 'Approved'
                                        : viewingProfile.aadharStatus === 'pending' ? 'Pending review'
                                            : viewingProfile.aadharStatus === 'rejected' ? 'Rejected' : 'Not submitted'}
                                </b>
                            </div>
                            {(viewingProfile.aadharStatus === 'pending' || viewingProfile.aadharStatus === 'rejected') && (
                                <div style={{ marginTop: '10px' }}>
                                    <input
                                        style={{ ...styles.modalInput, marginBottom: '8px' }}
                                        placeholder="Rejection reason (optional, shown to member)"
                                        value={rejectReason}
                                        onChange={e => setRejectReason(e.target.value)}
                                    />
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button type="button" disabled={aadharActionLoading} style={styles.aadharApproveBtn}
                                            onClick={() => handleApproveAadhar(viewingProfile._id)}>
                                            ✅ Approve
                                        </button>
                                        <button type="button" disabled={aadharActionLoading} style={styles.aadharRejectBtn}
                                            onClick={() => handleRejectAadhar(viewingProfile._id)}>
                                            ❌ Reject
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={styles.modalActions}>
                            <button type="button" style={styles.modalCancelBtn} onClick={() => setViewingProfile(null)}>Close</button>
                            {!viewingProfile.isVerified && viewingProfile.aadharStatus === 'approved' && (
                                <button type="button" style={styles.modalSaveBtn} onClick={() => handleVerify(viewingProfile._id)}>
                                    ✅ Verify Profile
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    layout: { display: 'flex', minHeight: '100vh', background: '#F5F5F5' },
    content: { marginLeft: '240px', flex: 1 },
    inner: { padding: '28px' },
    topRow: { marginBottom: '20px' },
    count: { fontSize: '15px', color: '#555', fontWeight: '600' },
    loading: { textAlign: 'center', padding: '40px', color: '#757575' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
    card: {
        background: '#fff', borderRadius: '12px', overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #E0E0E0'
    },
    photo: {
        height: '130px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', position: 'relative'
    },
    verifiedBadge: {
        position: 'absolute', top: '8px', right: '8px',
        background: '#2E7D32', color: '#fff', fontSize: '10px',
        fontWeight: '700', padding: '2px 8px', borderRadius: '20px'
    },
    info: { padding: '16px' },
    name: { fontWeight: '700', fontSize: '15px', color: '#1A0A0A', marginBottom: '6px' },
    registeredBy: { fontSize: '11px', color: '#8B1A1A', fontWeight: '600', marginBottom: '6px' },
    meta: { fontSize: '12px', color: '#757575', marginBottom: '3px' },
    customBadge: { display: 'inline-block', marginLeft: '8px', padding: '1px 8px', fontSize: '10px', fontWeight: '600', color: '#B71C1C', background: '#FDECEC', borderRadius: '10px', cursor: 'help' },
    actions: { marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
    verifyBtn: {
        padding: '7px 14px', background: '#E8F5E9', color: '#2E7D32',
        border: 'none', borderRadius: '8px', fontSize: '12.5px',
        fontWeight: '600', cursor: 'pointer',
    },
    verifyBtnDisabled: {
        padding: '7px 14px', background: '#F5F5F5', color: '#999',
        border: 'none', borderRadius: '8px', fontSize: '12.5px',
        fontWeight: '600', cursor: 'not-allowed',
    },
    viewBtn: {
        padding: '7px 14px', background: '#EEF2FD', color: '#2C3E9E',
        border: 'none', borderRadius: '8px', fontSize: '12.5px',
        fontWeight: '600', cursor: 'pointer',
    },
    editBtn: {
        padding: '7px 14px', background: '#FFF8E1', color: '#7A5C00',
        border: '1px solid #F5BE17', borderRadius: '8px', fontSize: '12.5px',
        fontWeight: '600', cursor: 'pointer',
    },
    verifiedText: { fontSize: '13px', color: '#2E7D32', fontWeight: '600' },
    empty: { gridColumn: '1/-1', textAlign: 'center', padding: '60px' },
    modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
    modal: { background: '#fff', borderRadius: '14px', padding: '28px', width: '100%', maxWidth: '640px', maxHeight: '85vh', overflowY: 'auto' },
    modalTitle: { fontSize: '18px', fontWeight: '700', color: '#1A0A0A', marginBottom: '18px' },
    modalGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' },
    modalLabel: { display: 'block', fontSize: '11px', fontWeight: '700', color: '#555', marginBottom: '5px', textTransform: 'uppercase' },
    modalInput: { width: '100%', padding: '9px 12px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
    modalActions: { display: 'flex', gap: '10px', justifyContent: 'flex-end' },
    modalCancelBtn: { padding: '10px 20px', background: '#fff', color: '#555', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
    modalSaveBtn: { padding: '10px 24px', background: '#1A0A0A', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
    viewSection: { marginBottom: '18px' },
    viewSectionTitle: { fontSize: '11px', fontWeight: '700', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '6px' },
    viewRow: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#333', padding: '4px 0' },
    photoGrid: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
    photoThumb: { width: '90px', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #E0E0E0' },
    aadharApproveBtn: { flex: 1, padding: '9px', background: '#2E7D32', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    aadharRejectBtn: { flex: 1, padding: '9px', background: '#fff', color: '#B71C1C', border: '1.5px solid #B71C1C', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
};

export default Profiles;