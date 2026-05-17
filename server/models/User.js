const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // ── Common fields (both member & vendor) ──
    role: {
        type: String,
        enum: ['member', 'vendor', 'admin'],
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

    // ── Vendor-only fields ──
    businessName: {
        type: String,
        required: function () { return this.role === 'vendor'; }
    },
    ownerName: {
        type: String,
        required: function () { return this.role === 'vendor'; }
    },
    category: {
        type: String,
        required: function () { return this.role === 'vendor'; }
    },
    city: { type: String },
    district: { type: String },
    isApproved: { type: Boolean, default: false }, // Admin approves vendor
    isActive: { type: Boolean, default: true },

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);