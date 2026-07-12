const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    name: { type: String, required: true },
    targetType: { type: String, enum: ['member', 'service'], required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },              // for showing a strikethrough / discount %
    features: [{ type: String }],
    durationMonths: { type: Number, default: 12 }, // fixed at 1 year for now
    isActive: { type: Boolean, default: true },     // inactive = hidden from new purchases, existing subscribers unaffected
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Plan', planSchema);
