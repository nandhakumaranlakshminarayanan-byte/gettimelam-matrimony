const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // ── Common fields ──
    role: {
        type: String,
        enum: ['member', 'service', 'admin'],
        default: 'member'
    },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // ── Member-only fields ──
    name: {
        type: String,
        required: function () { return this.role === 'member'; }
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', null],
        required: function () { return this.role === 'member'; }
    },
    profileFor: {
        type: String,
        enum: ['Myself', 'Son', 'Daughter', 'Brother', 'Sister', 'Relative', 'Friend'],
        default: 'Myself'
    },
    dateOfBirth: { type: Date },
    motherTongue: { type: String, default: 'Tamil' },
    isPremium: { type: Boolean, default: false },
    plan: { type: String, default: 'free' },
    isVerified: { type: Boolean, default: false },

    // ── Service Provider-only fields ──
    businessName: {
        type: String,
        required: function () { return this.role === 'service'; }
    },
    ownerName: {
        type: String,
        required: function () { return this.role === 'service'; }
    },
    category: {
        type: String,
        required: function () { return this.role === 'service'; }
    },
    city: { type: String },
    district: { type: String },
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);