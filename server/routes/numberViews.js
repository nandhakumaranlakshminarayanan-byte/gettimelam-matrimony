const express = require('express');
const router = express.Router();
const NumberView = require('../models/NumberView');
const Profile = require('../models/Profile');
const { protect } = require('../middleware/authMiddleware');

// Log that I (the viewer) revealed this profile's number.
// Upserts so viewing the same profile again just refreshes the timestamp
// instead of creating duplicate "views" from the same person.
router.post('/log', protect, async (req, res) => {
    try {
        const { profileId } = req.body;
        const profile = await Profile.findById(profileId);
        if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

        // Don't log a view of your own number
        if (profile.user.toString() === req.user.id) {
            return res.json({ success: true, message: 'Own number, not logged' });
        }

        await NumberView.findOneAndUpdate(
            { viewer: req.user.id, profile: profileId },
            { owner: profile.user, viewer: req.user.id, profile: profileId },
            { upsert: true, setDefaultsOnInsert: true }
        );

        res.json({ success: true, message: 'View logged' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// How many unique people have viewed my number — for the dashboard stat card
router.get('/count', protect, async (req, res) => {
    try {
        const count = await NumberView.countDocuments({ owner: req.user.id });
        res.json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Who viewed my number, most recent first — for the "viewed by" list
router.get('/received', protect, async (req, res) => {
    try {
        const views = await NumberView.find({ owner: req.user.id })
            .populate('viewer', 'name gender')
            .sort({ createdAt: -1 });
        res.json({ success: true, views });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
