import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const ACCENT = '#B71C1C';
const GOLD = '#F5BE17';
const BG = '#FFF8E1';

import { RELIGIONS, CASTES, getSubCastes } from '../../utils/casteData';
import { STATES_AND_UTS, getDistrictsForState } from '../../utils/indiaLocationData';
import { RASI_NAMES } from '../../utils/rasiData';
import { NAKSHATRA_NAMES, getNakshatraDropdownLabel } from '../../utils/nakshatraData';

// STATES previously lived here as a short 11-item list (missing 25 states/
// UTs) — now imported above as the full 36 states/UTs, each cascading to
// its real district list instead of everyone sharing Tamil Nadu's.

// ZODIACS/STARS/TN_DISTRICTS previously lived here as local arrays using a
// different vocabulary than the rest of the app (e.g. "Pisces/Meena" and
// "Moola"/"Avittam 1st part" instead of the canonical "Meenam" and
// "Mula"/"Dhanishtha" used by the horoscope calculator, Dashboard, and
// Browse) — now imported above from the shared data files everyone else
// already uses, so registration can't drift out of sync again.

const EDUCATION = ['10th', '12th', 'Diploma', 'Advance Diploma', 'B.A', 'B.Sc', 'B.Com', 'B.E/B.Tech', 'BCA', 'BBA', 'M.A', 'M.Sc', 'M.Com', 'M.E/M.Tech', 'MCA', 'MBA', 'Ph.D', 'Other'];

const EMPLOYMENT = ['Government', 'Private', 'Business/Self Employed', 'Defence', 'Not Working', 'Other'];

const OCCUPATIONS = ['Software Engineer', 'Doctor', 'Teacher', 'Engineer', 'Lawyer', 'Accountant', 'Businessman', 'Farmer', 'Hardware Profession', 'Driver', 'Police/Defence', 'Other'];

const INCOMES = ['Below 1 Lakh', '1-2 Lakhs', '2-3 Lakhs', '3-4 Lakhs', '4-5 Lakhs', '5-6 Lakhs', '6-8 Lakhs', '8-10 Lakhs', '10-15 Lakhs', '15-20 Lakhs', '20+ Lakhs'];

const LANGUAGES = ['Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Hindi', 'English', 'Urdu', 'Bengali', 'Marathi'];

const PROFILE_FOR_OPTIONS = ['Myself', 'Son', 'Daughter', 'Brother', 'Sister', 'Friend', 'Relative'];

const getProfileForLabel = (profileFor) => {
    const map = {
        Myself: 'Your Name', Son: "Your son's name", Daughter: "Your daughter's name",
        Brother: "Your brother's name", Sister: "Your sister's name",
        Friend: "Your friend's name", Relative: "Your relative's name"
    };
    return map[profileFor] || 'Name';
};

const StepBar = ({ current }) => (
    <div style={{ background: ACCENT, padding: '20px 24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '500px', margin: '0 auto' }}>
            {[1, 2, 3, 4].map((s, i) => (
                <React.Fragment key={s}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: s <= current ? GOLD : 'rgba(255,255,255,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '14px', fontWeight: '700',
                            color: s <= current ? ACCENT : 'rgba(255,255,255,0.7)',
                            border: s === current ? '3px solid #fff' : 'none',
                        }}>
                            {s < current ? '✓' : s}
                        </div>
                        <span style={{ fontSize: '11px', color: s === current ? '#fff' : 'rgba(255,255,255,0.6)', fontWeight: s === current ? '700' : '400' }}>
                            Step {s}
                        </span>
                    </div>
                    {i < 3 && (
                        <div style={{ flex: 1, height: '2px', background: s < current ? GOLD : 'rgba(255,255,255,0.3)', margin: '0 4px', marginBottom: '16px' }} />
                    )}
                </React.Fragment>
            ))}
        </div>
    </div>
);

const PhotoBox = ({ label, preview, onChange, small, multiple }) => (
    <label style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        border: '2px dashed ' + GOLD, borderRadius: '12px', cursor: 'pointer',
        background: preview ? 'transparent' : BG,
        width: small ? '100px' : '120px', height: small ? '100px' : '120px',
        overflow: 'hidden', position: 'relative', flexShrink: 0,
    }}>
        <input type="file" accept="image/*" multiple={multiple} onChange={onChange} style={{ display: 'none' }} />
        {preview ? (
            <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
            <>
                <div style={{ fontSize: '28px', color: '#ccc', marginBottom: '4px' }}>+</div>
                <div style={{ fontSize: '10px', color: '#999', textAlign: 'center', padding: '0 6px' }}>{label}</div>
            </>
        )}
    </label>
);

const PillSelect = ({ options, value, onChange }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
        {options.map(o => (
            <button key={o} type="button" onClick={() => onChange(o)} style={{
                padding: '8px 18px', borderRadius: '24px', fontSize: '13px', fontWeight: '500',
                cursor: 'pointer', border: '1.5px solid ' + (value === o ? ACCENT : '#ddd'),
                background: value === o ? ACCENT : '#fff', color: value === o ? '#fff' : '#555',
            }}>{o}</button>
        ))}
    </div>
);

const MultiPill = ({ options, values, onChange }) => {
    const toggle = (o) => {
        if (values.includes(o)) onChange(values.filter(v => v !== o));
        else onChange([...values, o]);
    };
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
            {options.map(o => (
                <button key={o} type="button" onClick={() => toggle(o)} style={{
                    padding: '7px 16px', borderRadius: '24px', fontSize: '13px', fontWeight: '500',
                    cursor: 'pointer', border: '1.5px solid ' + (values.includes(o) ? ACCENT : '#ddd'),
                    background: values.includes(o) ? ACCENT : '#fff',
                    color: values.includes(o) ? '#fff' : '#555',
                }}>{o}</button>
            ))}
        </div>
    );
};

const inp = {
    width: '100%', padding: '12px 14px', border: '1.5px solid ' + GOLD,
    borderRadius: '10px', fontSize: '14px', color: '#2C1810',
    background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
};

const Label = ({ children, required }) => (
    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: ACCENT, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
        {children}{required && <span style={{ color: ACCENT }}> *</span>}
    </label>
);

const SectionTitle = ({ children }) => (
    <div style={{ fontSize: '15px', fontWeight: '700', color: ACCENT, marginBottom: '16px', marginTop: '24px', paddingBottom: '6px', borderBottom: '2px solid ' + GOLD }}>
        {children}
    </div>
);

const FG = ({ children, half }) => (
    <div style={{ marginBottom: '16px', width: half ? 'calc(50% - 6px)' : '100%' }}>{children}</div>
);

const Row = ({ children }) => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>{children}</div>
);

// Password field with show/hide eye toggle
const PasswordInput = ({ value, onChange, placeholder, autoComplete = 'new-password' }) => {
    const [show, setShow] = React.useState(false);
    return (
        <div style={{ position: 'relative' }}>
            <input
                type={show ? 'text' : 'password'}
                autoComplete={autoComplete}
                style={{ ...inp, paddingRight: '46px' }}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
            <button
                type="button"
                onClick={() => setShow(v => !v)}
                title={show ? 'Hide password' : 'Show password'}
                style={{
                    position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    padding: '10px', display: 'flex', alignItems: 'center',
                }}>
                {show ? (
                    /* eye-off */
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B6914" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 3l18 18" />
                        <path d="M10.6 5.1A9.8 9.8 0 0112 5c5 0 8.7 3.6 10 7-0.5 1.3-1.3 2.5-2.3 3.5M6.2 6.2C4.3 7.5 2.8 9.2 2 12c1.3 3.4 5 7 10 7 1.5 0 2.9-.3 4.2-.9" />
                        <path d="M9.9 9.9a3 3 0 004.2 4.2" />
                    </svg>
                ) : (
                    /* eye */
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B6914" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12c1.3-3.4 5-7 10-7s8.7 3.6 10 7c-1.3 3.4-5 7-10 7S3.3 15.4 2 12z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                )}
            </button>
        </div>
    );
};

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);

    const [s2, setS2] = useState({
        name: '', altMobile: '', aadharNumber: '', profileFor: 'Myself', profileName: '',
        gender: '', motherTongue: 'Tamil', motherTongueOther: '', knownLanguages: ['Tamil'], knownLanguagesOther: '',
        religion: 'Hindu', religionOther: '', caste: '', casteOther: '', subCaste: '', subCasteOther: '', gothra: '',
        maritalStatus: 'Never Married', dateOfBirth: '', email: '', password: '', confirmPassword: '',
    });

    const [s3, setS3] = useState({
        zodiac: '', star: '', dosham: 'No',
        height: '', complexion: '', familyType: '',
        country: 'India', countryOther: '', state: 'Tamil Nadu', stateOther: '', district: '', districtOther: '', city: '',
        workingCountry: 'India', workingCountryOther: '', workingState: 'Tamil Nadu', workingDistrict: '', workingCity: '',
        education: '', educationOther: '', employed: '', employedOther: '', occupation: '', occupationOther: '', occupationRemark: '', annualIncome: '',
        aboutMe: '',
    });

    const [profilePhotos, setProfilePhotos] = useState([null, null, null]);
    const [mainPhotoIndex, setMainPhotoIndex] = useState(0);
    const [idProofs, setIdProofs] = useState([null, null]);
    const [photoPreviews, setPhotoPreviews] = useState([null, null, null]);
    const [horoscopeImages, setHoroscopeImages] = useState([null, null]);
    const [horoscopePreviews, setHoroscopePreviews] = useState([null, null]);
    const [idPreviews, setIdPreviews] = useState([null, null]);

    const update2 = (k, v) => setS2(p => ({ ...p, [k]: v }));
    const update3 = (k, v) => setS3(p => ({ ...p, [k]: v }));

    // ✅ Simulated OTP — checks duplicate mobile, any 6-digit code works
    const handleSendOtp = async () => {
        if (!mobile || mobile.length !== 10) { toast.error('Enter a valid 10-digit mobile number'); return; }
        setSendingOtp(true);
        try {
            const res = await axios.post('http://localhost:5000/api/auth/check-mobile', { mobile });
            if (res.data.exists) {
                if (res.data.role === 'service') {
                    toast.error('This number is registered as a Service Provider. Please use a different number.');
                } else {
                    toast.error('This number is already registered. Please login instead.');
                }
                return;
            }
            setOtpSent(true);
            toast.success('OTP sent to +91 ' + mobile + ' ✅');
        } catch (err) {
            setOtpSent(true);
            toast.success('OTP sent to +91 ' + mobile + ' ✅');
        } finally {
            setSendingOtp(false);
        }
    };

    // ✅ Any 6-digit OTP works in development mode
    const handleVerifyOtp = () => {
        if (!otp || otp.length !== 6) { toast.error('Enter the 6-digit OTP'); return; }
        setOtpVerified(true);
        toast.success('Mobile verified! ✅');
    };

    // Distribute selected files into slots: clicked slot first, then remaining
    // empty slots in order. Returns how many files didn't fit.
    const fillSlots = (files, current, previews, startIndex) => {
        const updated = [...current];
        const newPreviews = [...previews];
        const order = [startIndex, ...updated.map((_, idx) => idx).filter(idx => idx !== startIndex)];
        let fi = 0;
        for (const idx of order) {
            if (fi >= files.length) break;
            if (idx === startIndex || !updated[idx]) {
                updated[idx] = files[fi];
                newPreviews[idx] = URL.createObjectURL(files[fi]);
                fi++;
            }
        }
        return { updated, newPreviews, leftover: files.length - fi };
    };

    const handlePhotoChange = (index, e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        const { updated, newPreviews, leftover } = fillSlots(files, profilePhotos, photoPreviews, index);
        setProfilePhotos(updated); setPhotoPreviews(newPreviews);
        if (leftover > 0) toast.error(`Only ${profilePhotos.length} photos allowed — ${leftover} skipped`);
        e.target.value = '';
    };

    const handleHoroscopeChange = (index, e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        const { updated, newPreviews, leftover } = fillSlots(files, horoscopeImages, horoscopePreviews, index);
        setHoroscopeImages(updated); setHoroscopePreviews(newPreviews);
        if (leftover > 0) toast.error(`Only ${horoscopeImages.length} images allowed — ${leftover} skipped`);
        e.target.value = '';
    };

    const handleIdChange = (index, e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        const { updated, newPreviews, leftover } = fillSlots(files, idProofs, idPreviews, index);
        setIdProofs(updated); setIdPreviews(newPreviews);
        if (leftover > 0) toast.error(`Only ${idProofs.length} documents allowed — ${leftover} skipped`);
        e.target.value = '';
    };

    const validateStep2 = () => {
        if (!s2.name) { toast.error('Enter your name'); return false; }
        if (s2.aadharNumber && s2.aadharNumber.length !== 12) { toast.error('Aadhar number must be exactly 12 digits (or leave it blank)'); return false; }
        if (!s2.gender) { toast.error('Select gender'); return false; }
        if (s2.profileFor !== 'Myself' && !s2.profileName) { toast.error('Enter ' + getProfileForLabel(s2.profileFor)); return false; }
        if (!s2.dateOfBirth) { toast.error('Select date of birth'); return false; }
        if (!s2.email) { toast.error('Enter email address'); return false; }
        if (!s2.password || s2.password.length < 6) { toast.error('Password must be at least 6 characters'); return false; }
        if (s2.password !== s2.confirmPassword) { toast.error('Passwords do not match'); return false; }
        if (!s2.religion) { toast.error('Select religion'); return false; }
        if (s2.religion === 'Other' && !s2.religionOther.trim()) { toast.error('Please specify your religion'); return false; }
        if (!s2.caste) { toast.error('Select caste / division'); return false; }
        if (s2.caste === 'Other' && !s2.casteOther.trim()) { toast.error('Please specify your caste'); return false; }
        if (!s2.subCaste) { toast.error('Select sub caste'); return false; }
        if (s2.subCaste === 'Other' && !s2.subCasteOther.trim()) { toast.error('Please specify your sub caste'); return false; }
        if (!s2.maritalStatus) { toast.error('Select marital status'); return false; }
        return true;
    };

    const validateStep3 = () => {
        if (!s3.district) { toast.error('Select your district'); return false; }
        if (s3.district === 'Other' && !s3.districtOther.trim()) { toast.error('Please specify your district'); return false; }
        if (!s3.city) { toast.error('Enter your city'); return false; }
        if (!s3.education) { toast.error('Select education'); return false; }
        if (s3.education === 'Other' && !s3.educationOther.trim()) { toast.error('Please specify your education'); return false; }
        if (s3.state === 'Other' && !s3.stateOther.trim()) { toast.error('Please specify your state'); return false; }
        if (!profilePhotos[0]) { toast.error('Add at least 1 profile photo'); return false; }
        return true;
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Where the member picked "Other" and typed a value, submit the
            // typed text as the real field value (not the literal word
            // "Other") — and note which fields were custom-entered so admin
            // can spot them later (Profile.customFields).
            const resolvedReligion = s2.religion === 'Other' ? s2.religionOther.trim() : s2.religion;
            const resolvedCaste = s2.caste === 'Other' ? s2.casteOther.trim() : s2.caste;
            const resolvedSubCaste = s2.subCaste === 'Other' ? s2.subCasteOther.trim() : s2.subCaste;
            const resolvedState = s3.state === 'Other' ? s3.stateOther.trim() : s3.state;
            const resolvedDistrict = s3.district === 'Other' ? s3.districtOther.trim() : s3.district;
            const resolvedEducation = s3.education === 'Other' ? s3.educationOther.trim() : s3.education;
            const resolvedCountry = s3.country === 'Other' ? s3.countryOther.trim() : s3.country;
            const resolvedWorkingCountry = s3.workingCountry === 'Other' ? s3.workingCountryOther.trim() : s3.workingCountry;
            const resolvedEmployed = s3.employed === 'Other' ? s3.employedOther.trim() : s3.employed;
            const resolvedOccupation = s3.occupation === 'Other' ? s3.occupationOther.trim() : s3.occupation;
            const resolvedMotherTongue = s2.motherTongue === 'Other' ? s2.motherTongueOther.trim() : s2.motherTongue;
            // Known Languages is a multi-select — replace the literal
            // "Other" entry with whatever they typed (comma-separated for
            // more than one), keep every other pill they picked as-is.
            const resolvedKnownLanguages = s2.knownLanguages.includes('Other')
                ? [
                    ...s2.knownLanguages.filter(l => l !== 'Other'),
                    ...s2.knownLanguagesOther.split(',').map(l => l.trim()).filter(Boolean),
                ]
                : s2.knownLanguages;
            const customFields = [
                s2.religion === 'Other' && 'religion',
                s2.caste === 'Other' && 'caste',
                s2.subCaste === 'Other' && 'subCaste',
                s3.state === 'Other' && 'state',
                s3.district === 'Other' && 'district',
                s3.education === 'Other' && 'education',
                s3.country === 'Other' && 'country',
                s3.workingCountry === 'Other' && 'workingCountry',
                s3.employed === 'Other' && 'employed',
                s3.occupation === 'Other' && 'occupation',
            ].filter(Boolean);

            const payload = {
                role: 'member', mobile,
                name: s2.name, altMobile: s2.altMobile, aadharNumber: s2.aadharNumber || undefined,
                profileFor: s2.profileFor, profileName: s2.profileFor === 'Myself' ? s2.name : s2.profileName,
                gender: s2.gender, dateOfBirth: s2.dateOfBirth,
                email: s2.email, password: s2.password,
                motherTongue: resolvedMotherTongue, knownLanguages: resolvedKnownLanguages,
                religion: resolvedReligion, caste: resolvedCaste,
                subCaste: resolvedSubCaste, gothra: s2.gothra,
                maritalStatus: s2.maritalStatus,
                rasi: s3.zodiac, nakshatra: s3.star, dosham: s3.dosham,
                height: s3.height, complexion: s3.complexion, familyType: s3.familyType,
                country: resolvedCountry, state: resolvedState, district: resolvedDistrict, city: s3.city,
                workingCountry: resolvedWorkingCountry, workingState: s3.workingState,
                workingDistrict: s3.workingDistrict, workingCity: s3.workingCity,
                education: resolvedEducation, employed: resolvedEmployed,
                occupation: resolvedOccupation, occupationRemark: s3.occupationRemark,
                annualIncome: s3.annualIncome, aboutMe: s3.aboutMe,
                customFields,
            };
            await register(payload);

            // Let admin know about any "Other" values entered, so they can
            // review and add real options for them (Profile Options page →
            // Pending Suggestions). Only for the 6 categories that system
            // covers (Religion/Caste/Sub Caste/State/District/Job) —
            // Education/Employed/Country aren't part of that system, so
            // they're just saved as free text with no admin notification.
            const suggestions = [
                s2.religion === 'Other' && { category: 'religion', value: resolvedReligion, parent: null },
                s2.caste === 'Other' && { category: 'caste', value: resolvedCaste, parent: resolvedReligion },
                s2.subCaste === 'Other' && { category: 'subcaste', value: resolvedSubCaste, parent: `${resolvedReligion}|${resolvedCaste}` },
                s3.state === 'Other' && { category: 'state', value: resolvedState, parent: null },
                s3.district === 'Other' && { category: 'district', value: resolvedDistrict, parent: resolvedState },
                s3.occupation === 'Other' && { category: 'job', value: resolvedOccupation, parent: null },
            ].filter(Boolean);
            for (const s of suggestions) {
                API.post('/options/suggest', { ...s, suggestedByName: s2.name }).catch(() => { });
            }

            // Upload the profile photos selected in step 3.
            // register() stores the auth token, so these calls are authorized.
            const selectedPhotos = profilePhotos.filter(Boolean);
            if (selectedPhotos.length > 0) {
                try {
                    // The photo the user marked as "Profile Pic" becomes the avatar
                    // (falls back to the first selected photo)
                    const mainPhoto = profilePhotos[mainPhotoIndex] || selectedPhotos[0];
                    const avatarData = new FormData();
                    avatarData.append('photo', mainPhoto);
                    await API.post('/profiles/upload-photo', avatarData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    // All photos go into the profile gallery
                    const galleryData = new FormData();
                    selectedPhotos.forEach(f => galleryData.append('photos', f));
                    await API.post('/profiles/upload-photos', galleryData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                } catch (photoErr) {
                    const msg = photoErr.response?.data?.message || photoErr.message;
                    toast.error(`Account created, but photo upload failed: ${msg}. Add photos from your Dashboard.`, { duration: 6000 });
                }
            }

            // Upload Aadhar card document(s), if provided — these were
            // previously captured in local state but never actually sent
            // anywhere ("silently discarded" per handoff notes).
            const selectedAadharDocs = idProofs.filter(Boolean);
            if (selectedAadharDocs.length > 0) {
                try {
                    const aadharData = new FormData();
                    selectedAadharDocs.forEach(f => aadharData.append('documents', f));
                    await API.post('/profiles/upload-aadhar-docs', aadharData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                } catch (docErr) {
                    const msg = docErr.response?.data?.message || docErr.message;
                    toast.error(`Account created, but Aadhar document upload failed: ${msg}. Add it from your Dashboard.`, { duration: 6000 });
                }
            }

            // Upload Horoscope document(s), if provided
            const selectedHoroscopeDocs = horoscopeImages.filter(Boolean);
            if (selectedHoroscopeDocs.length > 0) {
                try {
                    const horoscopeData = new FormData();
                    selectedHoroscopeDocs.forEach(f => horoscopeData.append('documents', f));
                    await API.post('/profiles/upload-horoscope-docs', horoscopeData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                } catch (docErr) {
                    const msg = docErr.response?.data?.message || docErr.message;
                    toast.error(`Account created, but Horoscope document upload failed: ${msg}. Add it from your Dashboard.`, { duration: 6000 });
                }
            }

            toast.success('Welcome to Gettimelam! 🎊');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: "'DM Sans', sans-serif" }}>
            <div style={{ background: '#fff', borderBottom: '2px solid ' + GOLD, padding: '0 24px', display: 'flex', alignItems: 'center', height: '64px', gap: '16px' }}>
                <img src="/logo.png" alt="Gettimelam" style={{ height: '48px', objectFit: 'contain' }} />
                <span style={{ fontSize: '18px', fontWeight: '700', color: ACCENT }}>Gettimelam Matrimony</span>
                <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#666' }}>
                    Already a member? <span style={{ color: ACCENT, fontWeight: '700', cursor: 'pointer' }} onClick={() => navigate('/')}>Sign In</span>
                </span>
            </div>

            <StepBar current={step} />

            <div style={{ maxWidth: '640px', margin: '32px auto', padding: '0 16px 60px' }}>

                {/* STEP 1 */}
                {step === 1 && (
                    <div style={card}>
                        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                            <div style={{ fontSize: '40px', marginBottom: '8px' }}>📱</div>
                            <h2 style={{ fontSize: '22px', fontWeight: '700', color: ACCENT, margin: '0 0 6px' }}>Verify Your Mobile</h2>
                            <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>We'll send a 6-digit OTP to confirm your number</p>
                        </div>

                        <FG>
                            <Label required>Mobile Number</Label>
                            <div style={{ display: 'flex', border: '1.5px solid ' + GOLD, borderRadius: '10px', overflow: 'hidden' }}>
                                <span style={{ padding: '12px 14px', background: BG, fontWeight: '700', color: ACCENT, borderRight: '1px solid ' + GOLD, fontSize: '14px' }}>+91</span>
                                <input type="tel" maxLength={10} placeholder="Enter 10-digit mobile number" autoComplete="off"
                                    value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
                                    style={{ flex: 1, padding: '12px 14px', border: 'none', outline: 'none', fontSize: '15px', fontFamily: 'inherit' }}
                                    disabled={otpVerified} />
                            </div>
                        </FG>

                        {!otpVerified && (
                            <button onClick={handleSendOtp} disabled={sendingOtp || otpSent}
                                style={{ ...btnPrimary, opacity: sendingOtp ? 0.7 : 1, marginBottom: '16px' }}>
                                {sendingOtp ? '⏳ Checking...' : otpSent ? '✅ OTP Sent' : 'Send OTP'}
                            </button>
                        )}

                        {otpSent && !otpVerified && (
                            <>
                                <FG>
                                    <Label required>Enter OTP</Label>
                                    <input type="tel" maxLength={6} placeholder="Enter 6-digit OTP" autoComplete="off"
                                        value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                        style={{ ...inp, textAlign: 'center', fontSize: '22px', letterSpacing: '8px', fontWeight: '700' }} />
                                    <p style={{ fontSize: '12px', color: '#999', marginTop: '8px', textAlign: 'center' }}>
                                        Didn't receive?{' '}
                                        <span style={{ color: ACCENT, cursor: 'pointer', fontWeight: '600' }} onClick={handleSendOtp}>Resend OTP</span>
                                    </p>
                                </FG>
                                <button onClick={handleVerifyOtp} style={btnPrimary}>Verify OTP</button>
                            </>
                        )}

                        {otpVerified && (
                            <>
                                <div style={{ background: '#E8F5E9', border: '1px solid #4CAF50', borderRadius: '10px', padding: '14px', textAlign: 'center', marginBottom: '20px' }}>
                                    <span style={{ color: '#2E7D32', fontWeight: '700', fontSize: '15px' }}>✅ +91 {mobile} Verified!</span>
                                </div>
                                <button onClick={() => setStep(2)} style={btnPrimary}>Continue →</button>
                            </>
                        )}
                    </div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                    <div style={card}>
                        <SectionTitle>👤 Basic Details</SectionTitle>
                        <FG>
                            <Label required>Your Name</Label>
                            <input style={inp} placeholder="Enter your name" value={s2.name} onChange={e => update2('name', e.target.value)} />
                        </FG>
                        <FG>
                            <Label required>Mobile Number</Label>
                            <div style={{ ...inp, background: '#f5f5f5', color: '#999', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: '700', color: ACCENT }}>+91</span> {mobile}
                                <span style={{ marginLeft: 'auto', fontSize: '11px', background: '#E8F5E9', color: '#2E7D32', padding: '2px 8px', borderRadius: '20px' }}>✓ Verified</span>
                            </div>
                        </FG>
                        <FG>
                            <Label>Alternative Mobile Number</Label>
                            <div style={{ display: 'flex', border: '1.5px solid ' + GOLD, borderRadius: '10px', overflow: 'hidden' }}>
                                <span style={{ padding: '12px 14px', background: BG, fontWeight: '700', color: ACCENT, borderRight: '1px solid ' + GOLD, fontSize: '14px' }}>+91</span>
                                <input type="tel" maxLength={10} placeholder="Alternative number (optional)" autoComplete="off"
                                    value={s2.altMobile} onChange={e => update2('altMobile', e.target.value.replace(/\D/g, ''))}
                                    style={{ flex: 1, padding: '12px 14px', border: 'none', outline: 'none', fontSize: '14px', fontFamily: 'inherit' }} />
                            </div>
                        </FG>
                        <FG>
                            <Label>Aadhar Number <span style={{ fontWeight: '400', color: '#999', fontSize: '12px' }}>(optional — you can also add this after registering)</span></Label>
                            <input type="text" maxLength={12} placeholder="12-digit Aadhar number" autoComplete="off"
                                value={s2.aadharNumber} onChange={e => update2('aadharNumber', e.target.value.replace(/\D/g, ''))}
                                style={inp} />
                        </FG>
                        <FG>
                            <Label required>Profile Created For</Label>
                            <select style={inp} value={s2.profileFor} onChange={e => update2('profileFor', e.target.value)}>
                                {PROFILE_FOR_OPTIONS.map(o => <option key={o}>{o}</option>)}
                            </select>
                        </FG>
                        {s2.profileFor !== 'Myself' && (
                            <FG>
                                <Label required>{getProfileForLabel(s2.profileFor)}</Label>
                                <input style={inp} placeholder={'Enter ' + getProfileForLabel(s2.profileFor)}
                                    value={s2.profileName} onChange={e => update2('profileName', e.target.value)} />
                            </FG>
                        )}
                        <FG>
                            <Label required>Gender</Label>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                                {['Male', 'Female'].map(g => (
                                    <button key={g} type="button" onClick={() => update2('gender', g)} style={{
                                        flex: 1, padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                                        border: '1.5px solid ' + (s2.gender === g ? ACCENT : GOLD),
                                        background: s2.gender === g ? ACCENT : BG,
                                        color: s2.gender === g ? '#fff' : '#5F0909',
                                    }}>{g === 'Male' ? '👨 Male' : '👩 Female'}</button>
                                ))}
                            </div>
                        </FG>
                        <Row>
                            <FG half>
                                <Label required>Date of Birth</Label>
                                <input type="date" style={inp} value={s2.dateOfBirth} onChange={e => update2('dateOfBirth', e.target.value)} />
                            </FG>
                            <FG half>
                                <Label>Mother Tongue</Label>
                                <select style={inp} value={s2.motherTongue} onChange={e => { update2('motherTongue', e.target.value); update2('motherTongueOther', ''); }}>
                                    {[...LANGUAGES, 'Other'].map(l => <option key={l}>{l}</option>)}
                                </select>
                                {s2.motherTongue === 'Other' && (
                                    <input style={{ ...inp, marginTop: '8px' }} placeholder="Please specify your mother tongue"
                                        value={s2.motherTongueOther} onChange={e => update2('motherTongueOther', e.target.value)} />
                                )}
                            </FG>
                        </Row>
                        <FG>
                            <Label>Known Languages</Label>
                            <MultiPill options={[...LANGUAGES, 'Other']} values={s2.knownLanguages} onChange={v => update2('knownLanguages', v)} />
                            {s2.knownLanguages.includes('Other') && (
                                <input style={{ ...inp, marginTop: '8px' }} placeholder="Please specify — separate multiple with commas"
                                    value={s2.knownLanguagesOther} onChange={e => update2('knownLanguagesOther', e.target.value)} />
                            )}
                        </FG>
                        <FG>
                            <Label required>Email Address</Label>
                            <input type="email" style={inp} placeholder="your@email.com" autoComplete="off" value={s2.email} onChange={e => update2('email', e.target.value)} />
                        </FG>
                        <FG>
                            <Label required>Password</Label>
                            <PasswordInput placeholder="Min 6 characters" autoComplete="new-password" value={s2.password} onChange={e => update2('password', e.target.value)} />
                        </FG>
                        <FG>
                            <Label required>Re-enter Password</Label>
                            <PasswordInput placeholder="Type the same password again" autoComplete="new-password" value={s2.confirmPassword} onChange={e => update2('confirmPassword', e.target.value)} />
                            {s2.confirmPassword && s2.password !== s2.confirmPassword && (
                                <div style={{ fontSize: '12px', color: '#C62828', marginTop: '6px' }}>
                                    Passwords do not match
                                </div>
                            )}
                            {s2.confirmPassword && s2.password === s2.confirmPassword && (
                                <div style={{ fontSize: '12px', color: '#2E7D32', marginTop: '6px' }}>
                                    Passwords match
                                </div>
                            )}
                        </FG>
                        <SectionTitle>🕉️ Community Details</SectionTitle>
                        <Row>
                            <FG half>
                                <Label required>Religion</Label>
                                <select style={inp} value={s2.religion} onChange={e => { update2('religion', e.target.value); update2('caste', ''); update2('religionOther', ''); }}>
                                    {RELIGIONS.map(r => <option key={r}>{r}</option>)}
                                </select>
                                {s2.religion === 'Other' && (
                                    <input style={{ ...inp, marginTop: '8px' }} placeholder="Please specify your religion"
                                        value={s2.religionOther} onChange={e => update2('religionOther', e.target.value)} />
                                )}
                            </FG>
                            <FG half>
                                <Label required>Caste / Division</Label>
                                <select style={inp} value={s2.caste} onChange={e => { update2('caste', e.target.value); update2('casteOther', ''); update2('subCaste', ''); update2('subCasteOther', ''); }}>
                                    <option value="">Select Caste</option>
                                    {(CASTES[s2.religion] || []).map(c => <option key={c}>{c}</option>)}
                                </select>
                                {s2.caste === 'Other' && (
                                    <input style={{ ...inp, marginTop: '8px' }} placeholder="Please specify your caste"
                                        value={s2.casteOther} onChange={e => update2('casteOther', e.target.value)} />
                                )}
                            </FG>
                        </Row>
                        <Row>
                            <FG half>
                                <Label required>Sub Caste</Label>
                                <select style={inp} value={s2.subCaste} onChange={e => { update2('subCaste', e.target.value); update2('subCasteOther', ''); }} disabled={!s2.caste}>
                                    <option value="">{s2.caste ? 'Select Sub Caste' : 'Select Caste first'}</option>
                                    {getSubCastes(s2.religion, s2.caste).map(sc => <option key={sc}>{sc}</option>)}
                                </select>
                                {s2.subCaste === 'Other' && (
                                    <input style={{ ...inp, marginTop: '8px' }} placeholder="Please specify your sub caste"
                                        value={s2.subCasteOther} onChange={e => update2('subCasteOther', e.target.value)} />
                                )}
                            </FG>
                            <FG half>
                                <Label>Gothra</Label>
                                <input style={inp} placeholder="Gothra" value={s2.gothra} onChange={e => update2('gothra', e.target.value)} />
                            </FG>
                        </Row>
                        <FG>
                            <Label required>Marital Status</Label>
                            <PillSelect options={['Never Married', 'Widowed', 'Divorced', 'Separated']}
                                value={s2.maritalStatus} onChange={v => update2('maritalStatus', v)} />
                        </FG>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            <button onClick={() => setStep(1)} style={btnOutline}>← Previous</button>
                            <button onClick={() => { if (validateStep2()) setStep(3); }} style={btnPrimary}>Next →</button>
                        </div>
                    </div>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                    <div style={card}>
                        <SectionTitle>👤 Personal Details</SectionTitle>
                        <Row>
                            <FG half>
                                <Label>Height</Label>
                                <select style={inp} value={s3.height} onChange={e => update3('height', e.target.value)}>
                                    <option value="">Select Height</option>
                                    {["4'6\"", "4'8\"", "4'10\"", "5'0\"", "5'1\"", "5'2\"", "5'3\"", "5'4\"", "5'5\"", "5'6\"", "5'7\"", "5'8\"", "5'9\"", "5'10\"", "5'11\"", "6'0\"", "6'1\"", "6'2\""].map(h => <option key={h}>{h}</option>)}
                                </select>
                            </FG>
                            <FG half>
                                <Label>Complexion</Label>
                                <select style={inp} value={s3.complexion} onChange={e => update3('complexion', e.target.value)}>
                                    <option value="">Select</option>
                                    {['Very Fair', 'Fair', 'Wheatish', 'Dark'].map(c => <option key={c}>{c}</option>)}
                                </select>
                            </FG>
                        </Row>
                        <FG>
                            <Label>Family Type</Label>
                            <PillSelect options={['Nuclear', 'Joint']} value={s3.familyType} onChange={v => update3('familyType', v)} />
                        </FG>
                        <SectionTitle>🔮 Horoscope Details</SectionTitle>
                        <Row>
                            <FG half>
                                <Label>Zodiac (Rasi)</Label>
                                <select style={inp} value={s3.zodiac} onChange={e => update3('zodiac', e.target.value)}>
                                    <option value="">Select Zodiac</option>
                                    {RASI_NAMES.map(z => <option key={z}>{z}</option>)}
                                </select>
                            </FG>
                            <FG half>
                                <Label>Star (Nakshatra)</Label>
                                <select style={inp} value={s3.star} onChange={e => update3('star', e.target.value)}>
                                    <option value="">Select Star</option>
                                    {NAKSHATRA_NAMES.map(s => <option key={s} value={s}>{getNakshatraDropdownLabel(s)}</option>)}
                                </select>
                            </FG>
                        </Row>
                        <FG>
                            <Label>Having Dosham</Label>
                            <PillSelect options={['Yes', 'No', "Don't Know"]} value={s3.dosham} onChange={v => update3('dosham', v)} />
                        </FG>
                        <FG>
                            <Label>Add Horoscope Image</Label>
                            <p style={{ fontSize: '12px', color: '#999', margin: '0 0 10px' }}>Upload horoscope chart images (optional)</p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {[0, 1].map(i => <PhotoBox key={i} multiple label="Add Horoscope" preview={horoscopePreviews[i]} onChange={e => handleHoroscopeChange(i, e)} />)}
                            </div>
                        </FG>
                        <SectionTitle>📍 Location Information</SectionTitle>
                        <Row>
                            <FG half>
                                <Label>Country</Label>
                                <select style={inp} value={s3.country} onChange={e => { update3('country', e.target.value); update3('countryOther', ''); }}>
                                    <option>India</option><option>Other</option>
                                </select>
                                {s3.country === 'Other' && (
                                    <input style={{ ...inp, marginTop: '8px' }} placeholder="Please specify your country"
                                        value={s3.countryOther} onChange={e => update3('countryOther', e.target.value)} />
                                )}
                            </FG>
                            <FG half>
                                <Label>State</Label>
                                <select style={inp} value={s3.state}
                                    onChange={e => { update3('state', e.target.value); update3('stateOther', ''); update3('district', ''); update3('districtOther', ''); }}>
                                    <option value="">Select State</option>
                                    {[...STATES_AND_UTS, 'Other'].map(s => <option key={s}>{s}</option>)}
                                </select>
                                {s3.state === 'Other' && (
                                    <input style={{ ...inp, marginTop: '8px' }} placeholder="Please specify your state"
                                        value={s3.stateOther} onChange={e => update3('stateOther', e.target.value)} />
                                )}
                            </FG>
                        </Row>
                        <Row>
                            <FG half>
                                <Label required>District</Label>
                                <select style={inp} value={s3.district} onChange={e => { update3('district', e.target.value); update3('districtOther', ''); }}
                                    disabled={!s3.state}>
                                    <option value="">{s3.state ? 'Select District' : 'Select state first'}</option>
                                    {[...getDistrictsForState(s3.state), 'Other'].map(d => <option key={d}>{d}</option>)}
                                </select>
                                {s3.district === 'Other' && (
                                    <input style={{ ...inp, marginTop: '8px' }} placeholder="Please specify your district"
                                        value={s3.districtOther} onChange={e => update3('districtOther', e.target.value)} />
                                )}
                            </FG>
                            <FG half>
                                <Label required>City</Label>
                                <input style={inp} placeholder="City" value={s3.city} onChange={e => update3('city', e.target.value)} />
                            </FG>
                        </Row>
                        <SectionTitle>💼 Education & Career</SectionTitle>
                        <FG>
                            <Label required>Education</Label>
                            <select style={inp} value={s3.education} onChange={e => { update3('education', e.target.value); update3('educationOther', ''); }}>
                                <option value="">Select Education</option>
                                {EDUCATION.map(e => <option key={e}>{e}</option>)}
                            </select>
                            {s3.education === 'Other' && (
                                <input style={{ ...inp, marginTop: '8px' }} placeholder="Please specify your education"
                                    value={s3.educationOther} onChange={e => update3('educationOther', e.target.value)} />
                            )}
                        </FG>
                        <Row>
                            <FG half>
                                <Label>Employed</Label>
                                <select style={inp} value={s3.employed} onChange={e => { update3('employed', e.target.value); update3('employedOther', ''); }}>
                                    <option value="">Select</option>
                                    {EMPLOYMENT.map(e => <option key={e}>{e}</option>)}
                                </select>
                                {s3.employed === 'Other' && (
                                    <input style={{ ...inp, marginTop: '8px' }} placeholder="Please specify"
                                        value={s3.employedOther} onChange={e => update3('employedOther', e.target.value)} />
                                )}
                            </FG>
                            <FG half>
                                <Label>Occupation</Label>
                                <select style={inp} value={s3.occupation} onChange={e => { update3('occupation', e.target.value); update3('occupationOther', ''); }}>
                                    <option value="">Select</option>
                                    {OCCUPATIONS.map(o => <option key={o}>{o}</option>)}
                                </select>
                                {s3.occupation === 'Other' && (
                                    <input style={{ ...inp, marginTop: '8px' }} placeholder="Please specify your occupation"
                                        value={s3.occupationOther} onChange={e => update3('occupationOther', e.target.value)} />
                                )}
                            </FG>
                        </Row>
                        <FG>
                            <Label>Occupation Remark</Label>
                            <input style={inp} placeholder="Additional occupation details (optional)" value={s3.occupationRemark} onChange={e => update3('occupationRemark', e.target.value)} />
                        </FG>
                        <FG>
                            <Label>Annual Income</Label>
                            <select style={inp} value={s3.annualIncome} onChange={e => update3('annualIncome', e.target.value)}>
                                <option value="">Select Income Range</option>
                                {INCOMES.map(i => <option key={i}>{i}</option>)}
                            </select>
                        </FG>
                        <SectionTitle>🏢 Work Location</SectionTitle>
                        <Row>
                            <FG half>
                                <Label>Working Country</Label>
                                <select style={inp} value={s3.workingCountry} onChange={e => { update3('workingCountry', e.target.value); update3('workingCountryOther', ''); }}>
                                    <option>India</option><option>Other</option>
                                </select>
                                {s3.workingCountry === 'Other' && (
                                    <input style={{ ...inp, marginTop: '8px' }} placeholder="Please specify"
                                        value={s3.workingCountryOther} onChange={e => update3('workingCountryOther', e.target.value)} />
                                )}
                            </FG>
                            <FG half>
                                <Label>Working State</Label>
                                <select style={inp} value={s3.workingState}
                                    onChange={e => { update3('workingState', e.target.value); update3('workingDistrict', ''); }}>
                                    <option value="">Select State</option>
                                    {STATES_AND_UTS.map(s => <option key={s}>{s}</option>)}
                                </select>
                            </FG>
                        </Row>
                        <Row>
                            <FG half>
                                <Label>Working District</Label>
                                <select style={inp} value={s3.workingDistrict} onChange={e => update3('workingDistrict', e.target.value)}
                                    disabled={!s3.workingState}>
                                    <option value="">{s3.workingState ? 'Select District' : 'Select state first'}</option>
                                    {getDistrictsForState(s3.workingState).map(d => <option key={d}>{d}</option>)}
                                </select>
                            </FG>
                            <FG half>
                                <Label>Working City</Label>
                                <input style={inp} placeholder="Working city" value={s3.workingCity} onChange={e => update3('workingCity', e.target.value)} />
                            </FG>
                        </Row>
                        <SectionTitle>📸 Photos</SectionTitle>
                        <FG>
                            <Label required>Profile Photos</Label>
                            <p style={{ fontSize: '12px', color: '#999', margin: '0 0 10px' }}>Add at least 1 photo — profiles with photos get more matches</p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {[0, 1, 2].map(i => (
                                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                        <PhotoBox multiple label="Add Photos" preview={photoPreviews[i]} onChange={e => handlePhotoChange(i, e)} />
                                        {photoPreviews[i] && (
                                            <button type="button"
                                                onClick={() => setMainPhotoIndex(i)}
                                                style={{
                                                    fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                                                    padding: '5px 10px', borderRadius: '999px',
                                                    border: mainPhotoIndex === i ? 'none' : '1px solid ' + GOLD,
                                                    background: mainPhotoIndex === i ? 'linear-gradient(135deg, #E3AC2A, #C98F12)' : 'transparent',
                                                    color: mainPhotoIndex === i ? '#fff' : '#8B6914',
                                                    whiteSpace: 'nowrap',
                                                }}>
                                                {mainPhotoIndex === i ? '✓ Profile Pic' : 'Set as Profile Pic'}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {photoPreviews.some(Boolean) && (
                                <p style={{ fontSize: '12px', color: '#8B6914', margin: '8px 0 0' }}>
                                    The photo marked "Profile Pic" is shown as your main photo. Others appear in your profile gallery.
                                </p>
                            )}
                        </FG>
                        <FG>
                            <Label>Aadhar Card {' '}<span style={{ fontWeight: '400', color: '#999', fontSize: '12px' }}>(optional — front &amp; back)</span></Label>
                            <p style={{ fontSize: '12px', color: '#999', margin: '0 0 10px' }}>Upload a photo or scan of your Aadhar card — this helps admin verify your profile faster.</p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {[0, 1].map(i => <PhotoBox key={i} multiple label="Click to Add" preview={idPreviews[i]} onChange={e => handleIdChange(i, e)} small />)}
                            </div>
                        </FG>
                        <SectionTitle>📝 About Yourself</SectionTitle>
                        <FG>
                            <textarea rows={4} style={{ ...inp, resize: 'vertical' }}
                                placeholder="Write a few lines about yourself, your family, and what you're looking for..."
                                value={s3.aboutMe} onChange={e => update3('aboutMe', e.target.value)} />
                        </FG>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            <button onClick={() => setStep(2)} style={btnOutline}>← Previous</button>
                            <button onClick={() => { if (validateStep3()) setStep(4); }} style={btnPrimary}>Next →</button>
                        </div>
                    </div>
                )}

                {/* STEP 4 */}
                {step === 4 && (
                    <div style={card}>
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <div style={{ fontSize: '40px', marginBottom: '8px' }}>🎉</div>
                            <h2 style={{ fontSize: '22px', fontWeight: '700', color: ACCENT, margin: '0 0 6px' }}>Review Your Profile</h2>
                            <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Confirm your details before submitting</p>
                        </div>
                        {photoPreviews[0] && (
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <img src={photoPreviews[0]} alt="profile"
                                    style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid ' + ACCENT }} />
                            </div>
                        )}
                        <PreviewSection title="📱 Contact">
                            <PreviewRow label="Mobile" value={'+91 ' + mobile} />
                            {s2.altMobile && <PreviewRow label="Alt Mobile" value={'+91 ' + s2.altMobile} />}
                            {s2.aadharNumber && <PreviewRow label="Aadhar Number" value={s2.aadharNumber} />}
                            <PreviewRow label="Email" value={s2.email} />
                        </PreviewSection>
                        <PreviewSection title="👤 Personal Details">
                            <PreviewRow label="Your Name" value={s2.name} />
                            <PreviewRow label="Profile For" value={s2.profileFor} />
                            {s2.profileFor !== 'Myself' && (
                                <PreviewRow label={getProfileForLabel(s2.profileFor)} value={s2.profileName} />
                            )}
                            <PreviewRow label="Gender" value={s2.gender} />
                            <PreviewRow label="Date of Birth" value={s2.dateOfBirth} />
                            <PreviewRow label="Mother Tongue" value={s2.motherTongue === 'Other' ? s2.motherTongueOther : s2.motherTongue} />
                            <PreviewRow label="Known Languages" value={(s2.knownLanguages.includes('Other')
                                ? [...s2.knownLanguages.filter(l => l !== 'Other'), ...s2.knownLanguagesOther.split(',').map(l => l.trim()).filter(Boolean)]
                                : s2.knownLanguages).join(', ')} />
                            <PreviewRow label="Marital Status" value={s2.maritalStatus} />
                            <PreviewRow label="Height" value={s3.height} />
                            <PreviewRow label="Complexion" value={s3.complexion} />
                            <PreviewRow label="Family Type" value={s3.familyType} />
                        </PreviewSection>
                        <PreviewSection title="🕉️ Community">
                            <PreviewRow label="Religion" value={s2.religion} />
                            <PreviewRow label="Caste" value={s2.caste === 'Other' ? s2.casteOther : s2.caste} />
                            {s2.subCaste && <PreviewRow label="Sub Caste" value={s2.subCaste === 'Other' ? s2.subCasteOther : s2.subCaste} />}
                            {s2.gothra && <PreviewRow label="Gothra" value={s2.gothra} />}
                        </PreviewSection>
                        <PreviewSection title="🔮 Horoscope">
                            <PreviewRow label="Zodiac" value={s3.zodiac || 'Not specified'} />
                            <PreviewRow label="Star" value={s3.star || 'Not specified'} />
                            <PreviewRow label="Dosham" value={s3.dosham} />
                        </PreviewSection>
                        <PreviewSection title="📍 Location">
                            <PreviewRow label="Living In" value={s3.city + ', ' + s3.district + ', ' + s3.state} />
                            {s3.workingCity && <PreviewRow label="Working In" value={s3.workingCity + ', ' + s3.workingDistrict + ', ' + s3.workingState} />}
                        </PreviewSection>
                        <PreviewSection title="💼 Career">
                            <PreviewRow label="Education" value={s3.education} />
                            {s3.employed && <PreviewRow label="Employed" value={s3.employed === 'Other' ? s3.employedOther : s3.employed} />}
                            {s3.occupation && <PreviewRow label="Occupation" value={s3.occupation === 'Other' ? s3.occupationOther : s3.occupation} />}
                            {s3.annualIncome && <PreviewRow label="Annual Income" value={s3.annualIncome} />}
                        </PreviewSection>
                        {s3.aboutMe && (
                            <PreviewSection title="📝 About">
                                <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.6, margin: 0 }}>{s3.aboutMe}</p>
                            </PreviewSection>
                        )}
                        <p style={{ fontSize: '12px', color: '#999', textAlign: 'center', margin: '20px 0', lineHeight: 1.6 }}>
                            By submitting, you agree to our <a href="/terms" style={{ color: ACCENT }}>Terms & Conditions</a> and <a href="/privacy" style={{ color: ACCENT }}>Privacy Policy</a>
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setStep(3)} style={btnOutline}>← Edit</button>
                            <button onClick={handleSubmit} disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.7 : 1 }}>
                                {loading ? '⏳ Submitting...' : '🎊 Submit & Join'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const PreviewSection = ({ title, children }) => (
    <div style={{ marginBottom: '16px', background: BG, borderRadius: '12px', padding: '16px', border: '1px solid ' + GOLD }}>
        <div style={{ fontSize: '13px', fontWeight: '700', color: ACCENT, marginBottom: '12px' }}>{title}</div>
        {children}
    </div>
);

const PreviewRow = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(245,190,23,0.3)' }}>
        <span style={{ fontSize: '12px', color: '#888', fontWeight: '500' }}>{label}</span>
        <span style={{ fontSize: '13px', color: '#2C1810', fontWeight: '600', textAlign: 'right', maxWidth: '60%' }}>{value || '—'}</span>
    </div>
);

const btnPrimary = {
    flex: 1, padding: '14px', background: 'linear-gradient(135deg, ' + ACCENT + ', #D32F2F)',
    color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px',
    fontWeight: '700', cursor: 'pointer', letterSpacing: '0.5px', fontFamily: 'inherit',
};

const btnOutline = {
    flex: 1, padding: '14px', background: '#fff', color: ACCENT,
    border: '1.5px solid ' + ACCENT, borderRadius: '10px', fontSize: '15px',
    fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
};

const card = {
    background: '#fff', borderRadius: '16px', padding: '28px 24px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
};

export default Register;
