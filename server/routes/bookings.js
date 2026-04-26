const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { protect } = require('../middleware/authMiddleware');

// Create booking
router.post('/', protect, async (req, res) => {
    try {
        const booking = await Booking.create({
            user: req.user.id,
            ...req.body
        });
        res.status(201).json({ success: true, message: 'Booking confirmed!', booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get my bookings
router.get('/my', protect, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate('service', 'businessName category city')
            .sort({ createdAt: -1 });
        res.json({ success: true, count: bookings.length, bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single booking
router.get('/:id', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('service');
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        res.json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update booking status
router.put('/:id', protect, async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        res.json({ success: true, message: 'Booking updated!', booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;