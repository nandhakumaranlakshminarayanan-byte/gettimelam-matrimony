const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    gender: { type: String, enum: ['Male', 'Female'] },
    dateOfBirth: { type: Date },
    height: { type: String },
    weight: { type: String },
    complexion: { type: String },
    maritalStatus: {
        type: String,
        enum: ['Never Married', 'Divorced', 'Widowed', 'Separated'],
        default: 'Never Married'
    },
    religion: { type: String, enum: ['Hindu', 'Muslim', 'Christian'] },
    caste: { type: String },
    subCaste: { type: String },
    rasi: { type: String },
    nakshatra: { type: String },
    dosham: { type: String, enum: ['Yes', 'No', 'Doesn\'t Matter'] },
    education: { type: String },
    occupation: { type: String },
    annualIncome: { type: String },
    city: { type: String },
    district: { type: String },
    state: { type: String, default: 'Tamil Nadu' },
    motherTongue: { type: String, default: 'Tamil' },
    photo: { type: String },
    about: { type: String },
    fatherOccupation: { type: String },
    motherOccupation: { type: String },
    siblings: { type: String },
    familyType: { type: String, enum: ['Joint', 'Nuclear'] },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Profile', profileSchema);