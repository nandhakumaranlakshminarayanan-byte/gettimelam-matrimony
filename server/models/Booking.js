const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    eventDate: { type: Date, required: true },
    eventType: {
        type: String,
        enum: ['Wedding', 'Engagement', 'Reception', 'Other'],
        required: true
    },
    guestCount: { type: Number },
    specialRequirements: { type: String },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Cancelled'],
        default: 'Pending'
    },
    totalAmount: { type: Number },
    paymentStatus: {
        type: String,
        enum: ['Unpaid', 'Paid', 'Refunded'],
        default: 'Unpaid'
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);