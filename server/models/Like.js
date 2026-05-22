const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    liker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    profile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// ✅ Prevent duplicate likes
likeSchema.index({ liker: 1, profile: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema);