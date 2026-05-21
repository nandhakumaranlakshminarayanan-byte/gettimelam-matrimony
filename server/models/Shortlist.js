const mongoose = require('mongoose');

const shortlistSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    profile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
}, { timestamps: true });

shortlistSchema.index({ user: 1, profile: 1 }, { unique: true });

module.exports = mongoose.model('Shortlist', shortlistSchema);