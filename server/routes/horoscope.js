const express = require('express');
const router = express.Router();
const { calculateRasiNakshatra } = require('../utils/astrology');

// No auth required — this is a standalone calculator on the public
// Horoscope page, same as the existing compatibility checker.
router.post('/calculate', (req, res) => {
    try {
        const { dateOfBirth, timeOfBirth, utcOffsetMinutes } = req.body;
        const result = calculateRasiNakshatra(dateOfBirth, timeOfBirth, utcOffsetMinutes);
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

module.exports = router;
