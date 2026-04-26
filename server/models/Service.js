const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    businessName: { type: String, required: true },
    ownerName: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String },
    category: {
        type: String,
        enum: ['Wedding Hall', 'Photography', 'Catering', 'Transport', 'Event Organizer', 'Decoration', 'DJ & Band', 'Other'],
        required: true
    },
    description: { type: String },
    city: { type: String, required: true },
    district: { type: String },
    address: { type: String },
    price: { type: String },
    capacity: { type: String },
    photos: [{ type: String }],
    rating: { type: Number, default: 0 },
    reviews: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        comment: { type: String },
        rating: { type: Number },
        date: { type: Date, default: Date.now }
    }],
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Service', serviceSchema);