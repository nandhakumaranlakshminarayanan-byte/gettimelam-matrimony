const express = require('express');
const router = express.Router();
const Testimonial = require('../models/Testimonial');

// ── Public route — no auth required ──
router.get('/', async (req, res) => {
    try {
        const testimonials = await Testimonial.find({ isActive: true })
            .sort({ createdAt: -1 });
        res.json({ success: true, testimonials });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;