const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
    date: { type: Date, required: true },
    status: {
        type: String,
        enum: ['available', 'booked', 'blocked'],
        default: 'available'
    },
    note: { type: String }
}, { _id: false });

const serviceSchema = new mongoose.Schema({
    // ── Linked vendor user ──
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    businessName: { type: String, required: true },
    ownerName: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String },

    category: {
        type: String,
        enum: [
            'Wedding Hall/Venue',
            'Event Decoration',
            'Catering',
            'Wedding Rentals',
            'Stationery & Cards',
            'Photography',
            'Videography',
            'DJ & Entertainment',
            'Choreography',
            'Bridal Makeup & Hair',
            'Mehndi Artist',
            'Bridal Styling',
            'Wedding Planner',
            'Travel & Accommodation',
            'Officiant/Priest',
            'Security & Valet',
            'Wedding Cake',
            'Favors & Gifts',
            'Other'
        ],
        required: true
    },

    description: { type: String },
    city: { type: String, required: true },
    district: { type: String },
    address: { type: String },
    price: { type: String },
    priceMin: { type: Number },
    priceMax: { type: Number },
    capacity: { type: String },
    photos: [{ type: String }],

    // ── Availability Calendar ──
    availability: [availabilitySchema],

    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    reviews: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        comment: { type: String },
        rating: { type: Number },
        date: { type: Date, default: Date.now }
    }],

    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },

}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);