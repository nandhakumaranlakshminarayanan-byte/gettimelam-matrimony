const mongoose = require('mongoose');

// Records that `viewer` revealed the contact number on `owner`'s profile.
// Unique on (viewer, profile) so repeat views by the same person don't
// inflate the count — this tracks unique viewers, not raw click events.
const numberViewSchema = new mongoose.Schema({
    viewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    profile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

numberViewSchema.index({ viewer: 1, profile: 1 }, { unique: true });

module.exports = mongoose.model('NumberView', numberViewSchema);
