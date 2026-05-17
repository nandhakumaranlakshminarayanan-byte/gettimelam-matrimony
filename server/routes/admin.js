const express = require('express');
const router = express.Router();
const User = require('../models/User');
const {
    getStats, getAllUsers, getAllProfiles, togglePremium, deleteUser, verifyProfile,
    getAllBookings, updateBookingStatus,
    getTestimonials, createTestimonial, deleteTestimonial,
    getBanners, createBanner, toggleBanner, deleteBanner,
    getMessages, replyMessage, markMessageRead, deleteMessage,
    getNotifications, createNotification, deleteNotification,
    getAnalytics
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

// ── Admin guard middleware ──
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Admin access only!' });
    }
};

// ── Stats & Analytics ──
router.get('/stats', protect, adminOnly, getStats);
router.get('/analytics', protect, adminOnly, getAnalytics);

// ── Users (members only) ──
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/:id/toggle-premium', protect, adminOnly, togglePremium);
router.delete('/users/:id', protect, adminOnly, deleteUser);

// ── Vendors ──
router.get('/vendors', protect, adminOnly, async (req, res) => {
    try {
        const vendors = await User.find({ role: 'vendor' })
            .select('-password')
            .sort({ createdAt: -1 });
        res.json({ success: true, count: vendors.length, vendors });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/vendors/:id/approve', protect, adminOnly, async (req, res) => {
    try {
        const vendor = await User.findByIdAndUpdate(
            req.params.id,
            { isApproved: true, isActive: true },
            { new: true }
        ).select('-password');
        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }
        res.json({ success: true, message: '✅ Vendor approved!', vendor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/vendors/:id/reject', protect, adminOnly, async (req, res) => {
    try {
        const vendor = await User.findByIdAndUpdate(
            req.params.id,
            { isApproved: false, isActive: false },
            { new: true }
        ).select('-password');
        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }
        res.json({ success: true, message: '❌ Vendor rejected!', vendor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/vendors/:id', protect, adminOnly, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Vendor deleted!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Matrimony Profiles ──
router.get('/profiles', protect, adminOnly, getAllProfiles);
router.put('/profiles/:id/verify', protect, adminOnly, verifyProfile);

// ── Bookings ──
router.get('/bookings', protect, adminOnly, getAllBookings);
router.put('/bookings/:id/status', protect, adminOnly, updateBookingStatus);

// ── Testimonials ──
router.get('/testimonials', protect, adminOnly, getTestimonials);
router.post('/testimonials', protect, adminOnly, createTestimonial);
router.delete('/testimonials/:id', protect, adminOnly, deleteTestimonial);

// ── Banners ──
router.get('/banners', protect, adminOnly, getBanners);
router.post('/banners', protect, adminOnly, createBanner);
router.put('/banners/:id/toggle', protect, adminOnly, toggleBanner);
router.delete('/banners/:id', protect, adminOnly, deleteBanner);

// ── Messages ──
router.get('/messages', protect, adminOnly, getMessages);
router.put('/messages/:id/reply', protect, adminOnly, replyMessage);
router.put('/messages/:id/read', protect, adminOnly, markMessageRead);
router.delete('/messages/:id', protect, adminOnly, deleteMessage);

// ── Notifications ──
router.get('/notifications', protect, adminOnly, getNotifications);
router.post('/notifications', protect, adminOnly, createNotification);
router.delete('/notifications/:id', protect, adminOnly, deleteNotification);

module.exports = router;