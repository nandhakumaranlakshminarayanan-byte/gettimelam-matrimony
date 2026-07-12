const mongoose = require('mongoose');

// One thread per user. Messages accumulate inside it, similar to a
// lightweight support ticket. `assignedTo` lets a super-admin route the
// conversation to a specific support-enabled admin; unassigned threads
// are visible to any admin so nothing gets missed.
const supportChatSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    messages: [{
        from: { type: String, enum: ['user', 'admin'], required: true },
        text: { type: String, required: true },
        sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // which admin sent it, if from='admin'
        at: { type: Date, default: Date.now },
    }],
    unreadByUser: { type: Boolean, default: false },   // new admin reply the user hasn't seen
    unreadByAdmin: { type: Boolean, default: false },  // new user message admin hasn't seen
    lastMessageAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('SupportChat', supportChatSchema);
