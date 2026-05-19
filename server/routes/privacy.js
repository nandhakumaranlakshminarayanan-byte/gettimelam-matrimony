const express = require('express');
const router = express.Router();
const NumberRequest = require('../models/NumberRequest');
const Profile = require('../models/Profile');
const { protect } = require('../middleware/authMiddleware');

// ── Toggle number protection on/off ──
router.put('/toggle-protection', protect, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile) return res.status(404).json({ success: false, message: 'Create your profile first!' });
        profile.numberProtected = !profile.numberProtected;
        await profile.save();
        res.json({
            success: true,
            message: `Number ${profile.numberProtected ? 'protected 🔒' : 'made public 📞'}`,
            numberProtected: profile.numberProtected
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Send number request ──
router.post('/request', protect, async (req, res) => {
    try {
        const { profileId } = req.body;
        const profile = await Profile.findById(profileId);
        if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

        // ✅ Can't request own number
        if (profile.user.toString() === req.user.id) {
            return res.status(400).json({ success: false, message: "Can't request your own number!" });
        }

        // ✅ Check if already requested
        const existing = await NumberRequest.findOne({
            requester: req.user.id,
            profile: profileId
        });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Request already sent!',
                status: existing.status
            });
        }

        const request = await NumberRequest.create({
            requester: req.user.id,
            profile: profileId,
            owner: profile.user,
            message: req.body.message || 'I would like to connect with you.'
        });

        res.status(201).json({ success: true, message: 'Number request sent! 📬', request });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Get incoming requests (owner sees who wants their number) ──
router.get('/incoming', protect, async (req, res) => {
    try {
        const requests = await NumberRequest.find({ owner: req.user.id })
            .populate('requester', 'name mobile email gender')
            .populate('profile', 'name photo occupation city')
            .sort({ createdAt: -1 });
        res.json({ success: true, requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Get outgoing requests (requester sees status) ──
router.get('/outgoing', protect, async (req, res) => {
    try {
        const requests = await NumberRequest.find({ requester: req.user.id })
            .populate('owner', 'name mobile')
            .populate('profile', 'name photo occupation city numberProtected')
            .sort({ createdAt: -1 });
        res.json({ success: true, requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Approve or Reject a request ──
router.put('/:id/respond', protect, async (req, res) => {
    try {
        const { status } = req.body;
        const request = await NumberRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
        if (request.owner.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        request.status = status;
        await request.save();
        res.json({ success: true, message: `Request ${status}!`, request });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Check request status for a specific profile ──
router.get('/check/:profileId', protect, async (req, res) => {
    try {
        const request = await NumberRequest.findOne({
            requester: req.user.id,
            profile: req.params.profileId
        });
        res.json({ success: true, request: request || null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;