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

// ── Members ──
router.get('/users', protect, adminOnly, getAllUsers);

router.put('/users/:id/toggle-premium', protect, adminOnly, togglePremium);

// ✅ Verify user
router.put('/users/:id/verify', protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isVerified: true },
            { new: true }
        ).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, message: 'User verified! ✅', user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ Unverify user
router.put('/users/:id/unverify', protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isVerified: false },
            { new: true }
        ).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, message: 'User unverified!', user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/users/:id', protect, adminOnly, deleteUser);

// ── Service Providers ──
router.get('/vendors', protect, adminOnly, async (req, res) => {
    try {
        const providers = await User.find({ role: 'service' })
            .select('-password').sort({ createdAt: -1 });
        res.json({ success: true, count: providers.length, vendors: providers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/vendors/:id/approve', protect, adminOnly, async (req, res) => {
    try {
        const provider = await User.findByIdAndUpdate(
            req.params.id,
            { isApproved: true, isActive: true },
            { new: true }
        ).select('-password');
        if (!provider) return res.status(404).json({ success: false, message: 'Service provider not found' });
        res.json({ success: true, message: 'Service provider approved!', vendor: provider });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/vendors/:id/reject', protect, adminOnly, async (req, res) => {
    try {
        const provider = await User.findByIdAndUpdate(
            req.params.id,
            { isApproved: false, isActive: false },
            { new: true }
        ).select('-password');
        if (!provider) return res.status(404).json({ success: false, message: 'Service provider not found' });
        res.json({ success: true, message: 'Service provider rejected!', vendor: provider });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/vendors/:id', protect, adminOnly, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Service provider deleted!' });
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

// ── Admin Management ──
router.get('/admins', protect, adminOnly, async (req, res) => {
    try {
        const admins = await User.find({ role: 'admin' })
            .select('-password').sort({ createdAt: -1 });
        res.json({ success: true, admins });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/admins', protect, adminOnly, async (req, res) => {
    try {
        const bcrypt = require('bcryptjs');
        const { name, email, mobile, password } = req.body;
        const exists = await User.findOne({ $or: [{ email }, { mobile }] });
        if (exists) return res.status(400).json({ success: false, message: 'Account already exists!' });
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = await User.create({
            name, email, mobile,
            password: hashedPassword,
            role: 'admin',
            gender: 'Male'
        });
        res.status(201).json({ success: true, message: 'Admin created!', admin });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/admins/:id', protect, adminOnly, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Admin deleted!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;