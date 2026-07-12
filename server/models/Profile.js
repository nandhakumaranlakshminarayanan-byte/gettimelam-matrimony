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
    isActive: { type: Boolean, default: true },
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
    prefCountry: { type: String },
    prefState: { type: String },
    prefCity: { type: String },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Profile', profileSchema);