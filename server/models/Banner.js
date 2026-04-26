const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subtitle: { type: String },
    imageUrl: { type: String },
    linkUrl: { type: String },
    position: {
        type: String,
        enum: ['hero', 'top', 'middle', 'bottom', 'popup'],
        default: 'top'
    },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date },
    endDate: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Banner', bannerSchema);