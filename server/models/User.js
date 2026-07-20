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
    profileName: { type: String }, // ✅ Name of the person the profile is for (e.g. Gopi)
    dateOfBirth: { type: Date },
    motherTongue: { type: String, default: 'Tamil' },
    isPremium: { type: Boolean, default: false },
    // Admin-only: when this admin last opened the Users page — the
    // new-signups sidebar badge counts users created after this, so it
    // actually clears on visit instead of always showing a rolling 24h count.
    lastSeenUsersAt: { type: Date, default: null },
    plan: { type: String, default: 'free' },
    isVerified: { type: Boolean, default: false },
    canHandleSupport: { type: Boolean, default: false }, // for admin accounts — can be assigned support chats

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
    state: { type: String },
    district: { type: String },
    description: { type: String, default: '' },
    // Business logo/profile photo shown on the dashboard and (once verified)
    // the public listing — separate from a Service document's own `photos`,
    // which are per-listing gallery images.
    logo: { type: String, default: null },
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);