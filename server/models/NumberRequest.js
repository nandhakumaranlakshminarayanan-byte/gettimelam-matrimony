const mongoose = require('mongoose');

const numberRequestSchema = new mongoose.Schema({
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    profile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    message: { type: String, default: 'I would like to connect with you.' },
}, { timestamps: true });

// ✅ Prevent duplicate requests
numberRequestSchema.index({ requester: 1, profile: 1 }, { unique: true });

module.exports = mongoose.model('NumberRequest', numberRequestSchema);