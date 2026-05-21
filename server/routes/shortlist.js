const express = require('express');
const router = express.Router();
const Shortlist = require('../models/Shortlist');
const Profile = require('../models/Profile');
const { protect } = require('../middleware/authMiddleware');

// ── Add to shortlist ──
router.post('/add', protect, async (req, res) => {
    try {
        const { profileId } = req.body;

        // ✅ Can't shortlist own profile
        const profile = await Profile.findById(profileId);
        if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });
        if (profile.user.toString() === req.user.id) {
            return res.status(400).json({ success: false, message: "Can't shortlist your own profile!" });
        }

        // ✅ Check if already shortlisted
        const existing = await Shortlist.findOne({ user: req.user.id, profile: profileId });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Already shortlisted!', shortlisted: true });
        }

        await Shortlist.create({ user: req.user.id, profile: profileId });
        res.status(201).json({ success: true, message: 'Profile shortlisted! ⭐' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Remove from shortlist ──
router.delete('/remove/:profileId', protect, async (req, res) => {
    try {
        await Shortlist.findOneAndDelete({ user: req.user.id, profile: req.params.profileId });
        res.json({ success: true, message: 'Removed from shortlist!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Get my shortlisted profiles ──
router.get('/my', protect, async (req, res) => {
    try {
        const shortlists = await Shortlist.find({ user: req.user.id })
            .populate({
                path: 'profile',
                populate: { path: 'user', select: 'name mobile email' }
            })
            .sort({ createdAt: -1 });
        const profiles = shortlists.map(s => s.profile).filter(Boolean);
        res.json({ success: true, profiles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Check if profile is shortlisted ──
router.get('/check/:profileId', protect, async (req, res) => {
    try {
        const existing = await Shortlist.findOne({
            user: req.user.id,
            profile: req.params.profileId
        });
        res.json({ success: true, shortlisted: !!existing });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;