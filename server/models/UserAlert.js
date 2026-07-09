const mongoose = require('mongoose');

// Personal, per-user notification feed — powers the bell icon.
// Distinct from models/Notification.js, which is admin broadcast announcements.
const userAlertSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // who receives this
    type: { type: String, enum: ['interest', 'message', 'like', 'system'], default: 'system' },
    title: { type: String, required: true },
    message: { type: String, default: '' },
    link: { type: String, default: '' },       // where clicking the alert should navigate to
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // who triggered it, if applicable
    isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('UserAlert', userAlertSchema);
