const mongoose = require('mongoose');

const interestSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    profile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true }, // profile the interest was sent to
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },      // who owns that profile
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
}, { timestamps: true });

// Prevent sending duplicate interests to the same profile
interestSchema.index({ sender: 1, profile: 1 }, { unique: true });

module.exports = mongoose.model('Interest', interestSchema);
