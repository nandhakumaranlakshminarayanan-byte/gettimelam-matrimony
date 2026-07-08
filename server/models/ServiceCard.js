const mongoose = require('mongoose');

// Homepage "Wedding Services" cards — fully managed by the admin panel.
// `image` is a relative path like `/uploads/servicecard_123.jpg`.
const serviceCardSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    category: { type: String, default: '' },       // Services page category this card links to (e.g. 'Wedding Hall/Venue')
    glow: { type: String, default: '#DF9B08' },   // accent/glow color for the card
    order: { type: Number, default: 0 },           // display order on homepage
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('ServiceCard', serviceCardSchema);
