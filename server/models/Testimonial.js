const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    groomName: { type: String, required: true },
    brideName: { type: String, required: true },
    groomPhoto: { type: String },
    bridePhoto: { type: String },
    marriageDate: { type: Date },
    message: { type: String },
    city: { type: String },
    religion: { type: String },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Testimonial', testimonialSchema);