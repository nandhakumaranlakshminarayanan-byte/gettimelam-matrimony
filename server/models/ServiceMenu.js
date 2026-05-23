const mongoose = require('mongoose');

const serviceMenuSchema = new mongoose.Schema({
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: String },
    features: [{ type: String }],
    photos: [{ type: String }],
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('ServiceMenu', serviceMenuSchema);