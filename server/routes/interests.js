const express = require('express');
const router = express.Router();
const Interest = require('../models/Interest');
const Profile = require('../models/Profile');
const UserAlert = require('../models/UserAlert');
const { protect } = require('../middleware/authMiddleware');

// ── Send interest to a profile ──
router.post('/send', protect, async (req, res) => {
    try {
        const { profileId } = req.body;
        const profile = await Profile.findById(profileId);
        if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

        if (profile.user.toString() === req.user.id) {
            return res.status(400).json({ success: false, message: "Can't send interest to your own profile!" });
        }

        const existing = await Interest.findOne({ sender: req.user.id, profile: profileId });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Interest already sent!', alreadySent: true });
        }

        await Interest.create({
            sender: req.user.id,
            profile: profileId,
            owner: profile.user,
        });

        // Notify the profile owner
        await UserAlert.create({
            user: profile.user,
            type: 'interest',
            title: 'New Interest Received',
            message: `${req.user.name || 'Someone'} sent interest in your profile.`,
            link: `/dashboard?tab=interests`,
            fromUser: req.user.id,
        });

        res.status(201).json({ success: true, message: 'Interest sent! 💌' });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Interest already sent!', alreadySent: true });
        }
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Check if I already sent interest to a profile ──
router.get('/check/:profileId', protect, async (req, res) => {
    try {
        const interest = await Interest.findOne({ sender: req.user.id, profile: req.params.profileId });
        res.json({ success: true, sent: !!interest, status: interest?.status || null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Interests I've sent ──
router.get('/sent', protect, async (req, res) => {
    try {
        const interests = await Interest.find({ sender: req.user.id })
            .populate({ path: 'profile', populate: { path: 'user', select: 'name mobile' } })
            .sort({ createdAt: -1 });
        res.json({ success: true, interests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Interests I've received ──
router.get('/received', protect, async (req, res) => {
    try {
        const Profile = require('../models/Profile');
        const interests = await Interest.find({ owner: req.user.id })
            .populate({ path: 'sender', select: 'name mobile gender' })
            .sort({ createdAt: -1 })
            .lean();

        // Attach each sender's own profile (photo, name, etc.) — `interest.profile`
        // only points at the target profile (the receiver's own), not the sender's.
        const senderIds = interests.map(i => i.sender?._id).filter(Boolean);
        const senderProfiles = await Profile.find({ user: { $in: senderIds } }).lean();
        const profileByUser = Object.fromEntries(senderProfiles.map(p => [p.user.toString(), p]));

        const enriched = interests.map(i => ({
            ...i,
            senderProfile: i.sender ? profileByUser[i.sender._id.toString()] || null : null,
        }));

        res.json({ success: true, interests: enriched });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Accept / decline a received interest ──
router.put('/:id/respond', protect, async (req, res) => {
    try {
        const { status } = req.body; // 'accepted' | 'declined'
        if (!['accepted', 'declined'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }
        const interest = await Interest.findOne({ _id: req.params.id, owner: req.user.id });
        if (!interest) return res.status(404).json({ success: false, message: 'Interest not found' });

        interest.status = status;
        await interest.save();

        await UserAlert.create({
            user: interest.sender,
            type: 'interest',
            title: status === 'accepted' ? 'Interest Accepted! 🎉' : 'Interest Declined',
            message: status === 'accepted'
                ? `${req.user.name || 'They'} accepted your interest!`
                : `${req.user.name || 'They'} declined your interest.`,
            link: `/profile/${interest.profile}`,
            fromUser: req.user.id,
        });

        res.json({ success: true, message: `Interest ${status}!` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
