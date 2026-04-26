const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String, enum: ['Male', 'Female'], required: true },
    profileFor: {
        type: String,
        enum: ['Myself', 'Son', 'Daughter', 'Brother', 'Sister', 'Relative', 'Friend'],
        default: 'Myself'
    },
    dateOfBirth: { type: Date },
    isVerified: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    plan: { type: String, default: 'free' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);