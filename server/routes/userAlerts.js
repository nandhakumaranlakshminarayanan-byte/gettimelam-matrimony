const express = require('express');
const router = express.Router();
const UserAlert = require('../models/UserAlert');
const { protect } = require('../middleware/authMiddleware');

// ── My notifications (most recent first, capped at 50) ──
router.get('/', protect, async (req, res) => {
    try {
        const alerts = await UserAlert.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json({ success: true, alerts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Unread count, for the bell badge ──
router.get('/unread-count', protect, async (req, res) => {
    try {
        const count = await UserAlert.countDocuments({ user: req.user.id, isRead: false });
        res.json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Mark one notification as read ──
router.put('/:id/read', protect, async (req, res) => {
    try {
        await UserAlert.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { isRead: true }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Mark all as read ──
router.put('/mark-all-read', protect, async (req, res) => {
    try {
        await UserAlert.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
