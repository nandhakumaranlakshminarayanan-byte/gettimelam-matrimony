const express = require('express');
const router = express.Router();
const Like = require('../models/Like');
const Profile = require('../models/Profile');
const { protect } = require('../middleware/authMiddleware');

// ── Like a profile ──
router.post('/add', protect, async (req, res) => {
    try {
        const { profileId } = req.body;
        const profile = await Profile.findById(profileId);
        if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

        // ✅ Can't like own profile
        if (profile.user.toString() === req.user.id) {
            return res.status(400).json({ success: false, message: "Can't like your own profile!" });
        }

        // ✅ Check already liked
        const existing = await Like.findOne({ liker: req.user.id, profile: profileId });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Already liked!', liked: true });
        }

        await Like.create({
            liker: req.user.id,
            profile: profileId,
            owner: profile.user,
        });

        res.status(201).json({ success: true, message: 'Profile liked! 👍' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Unlike a profile ──
router.delete('/remove/:profileId', protect, async (req, res) => {
    try {
        await Like.findOneAndDelete({ liker: req.user.id, profile: req.params.profileId });
        res.json({ success: true, message: 'Like removed!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Get profiles I liked ──
router.get('/my-likes', protect, async (req, res) => {
    try {
        const likes = await Like.find({ liker: req.user.id })
            .populate({
                path: 'profile',
                populate: { path: 'user', select: 'name mobile' }
            })
            .sort({ createdAt: -1 });
        const profiles = likes.map(l => l.profile).filter(Boolean);
        res.json({ success: true, profiles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Get profiles that liked me ──
router.get('/liked-me', protect, async (req, res) => {
    try {
        const likes = await Like.find({ owner: req.user.id })
            .populate({
                path: 'liker',
                select: 'name mobile gender'
            })
            .populate({
                path: 'profile',
                populate: { path: 'user', select: 'name mobile' }
            })
            .sort({ createdAt: -1 });
        res.json({ success: true, likes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Check if I liked a profile ──
router.get('/check/:profileId', protect, async (req, res) => {
    try {
        const like = await Like.findOne({ liker: req.user.id, profile: req.params.profileId });
        res.json({ success: true, liked: !!like });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;