const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
        type: String,
        enum: ['all', 'premium', 'free'],
        default: 'all'
    },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);