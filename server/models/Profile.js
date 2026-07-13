const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },           // ✅ Gopi (the person the profile is for)
    createdByName: { type: String },                  // ✅ Nandhu (the person who created it)
    profileFor: { type: String, default: 'Myself' },  // ✅ Brother / Sister / Son / Daughter etc.
    gender: { type: String, enum: ['Male', 'Female'] },
    dateOfBirth: { type: Date },
    height: { type: String },
    weight: { type: String },
    complexion: { type: String },
    maritalStatus: { type: String, enum: ['Never Married', 'Unmarried', 'Divorced', 'Widowed', 'Awaiting divorce', 'Separated'], default: 'Never Married' }, // ✅ Added Unmarried
    religion: { type: String },
    caste: { type: String },
    subCaste: { type: String },
    gothra: { type: String },
    motherTongue: { type: String, default: 'Tamil' },
    knownLanguages: [{ type: String }],
    rasi: { type: String },
    nakshatra: { type: String },
    dosham: { type: String, default: 'No' },
    education: { type: String },
    employed: { type: String },
    occupation: { type: String },
    occupationRemark: { type: String },
    annualIncome: { type: String },
    city: { type: String },
    district: { type: String },
    state: { type: String, default: 'Tamil Nadu' },
    country: { type: String, default: 'India' },
    workingCity: { type: String },
    workingDistrict: { type: String },
    workingState: { type: String },
    workingCountry: { type: String },
    about: { type: String },
    photo: { type: String },
    photos: [{ type: String }],
    fatherOccupation: { type: String },
    motherOccupation: { type: String },
    siblings: { type: String },
    familyType: { type: String, enum: ['Joint', 'Nuclear'] },
    isVerified: { type: Boolean, default: false },
    // Aadhar verification — a separate, earlier gate than isVerified.
    // Flow: member submits aadharNumber whenever they want (not required at
    // registration) -> status becomes 'pending' -> admin reviews and sets
    // 'approved' or 'rejected' -> only once 'approved' can admin mark the
    // whole profile isVerified. The reminder popup fires every 5 minutes
    // for any member whose status is still 'not_submitted'.
    aadharNumber: { type: String, default: null },
    aadharStatus: { type: String, enum: ['not_submitted', 'pending', 'approved', 'rejected'], default: 'not_submitted' },
    aadharSubmittedAt: { type: Date, default: null },
    aadharReviewedAt: { type: Date, default: null },
    aadharRejectReason: { type: String, default: null },
    // Actual uploaded document/photo of the Aadhar card, and horoscope
    // documents — distinct from aadharNumber (the typed digits above).
    // Previously had UI in Register.jsx that captured these files locally
    // but never uploaded them anywhere ("silently discarded" per handoff
    // notes) — these fields plus the upload routes are what was missing.
    aadharDocuments: [{ type: String }],
    horoscopeDocuments: [{ type: String }],
    isActive: { type: Boolean, default: true },
    // Field names entered via "Other" + free text instead of a canonical
    // dropdown option (e.g. ['religion', 'district']) — surfaced to admin
    // on the Users page so new/unusual values can be reviewed and possibly
    // added as real dropdown options later.
    customFields: [{ type: String }],
    numberProtected: { type: Boolean, default: false },

    // ── Partner Preferences — what this person is looking for ──
    prefAgeMin: { type: String },
    prefAgeMax: { type: String },
    prefHeightMin: { type: String },
    prefHeightMax: { type: String },
    prefMaritalStatus: { type: String },
    prefMotherTongue: { type: String },
    prefEatingHabits: { type: String },
    prefDrinkingHabits: { type: String },
    prefSmokingHabits: { type: String },
    prefEducation: { type: String },
    prefOccupation: { type: String },
    prefAnnualIncome: { type: String },
    prefReligion: { type: String },
    prefCaste: { type: String },
    prefSubCaste: { type: String },
    prefRasi: { type: String },
    prefNakshatra: { type: String },
    prefDosham: { type: String },
    prefCountry: { type: String },
    prefState: { type: String },
    prefCity: { type: String },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Profile', profileSchema);