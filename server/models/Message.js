const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String },
    subject: { type: String },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    isReplied: { type: Boolean, default: false },
    reply: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);