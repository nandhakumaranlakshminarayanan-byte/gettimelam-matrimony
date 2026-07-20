const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { registerUser, loginUser, getMe, updateBusinessProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const otpCache = require('../utils/otpCache');

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ── Business logo upload config ──
const logoStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `logo_${Date.now()}${path.extname(file.originalname)}`)
});
const uploadLogo = multer({
    storage: logoStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only images allowed!'));
    }
});

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/business-profile', protect, uploadLogo.single('logo'), updateBusinessProfile);

// ✅ Check if mobile number is already registered
router.post('/check-mobile', async (req, res) => {
    try {
        const { mobile } = req.body;
        const User = require('../models/User');
        const user = await User.findOne({ mobile });
        if (user) {
            return res.json({ exists: true, role: user.role });
        }
        res.json({ exists: false });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ Send OTP — Simulated for development
router.post('/send-otp', async (req, res) => {
    try {
        const { mobile } = req.body;
        if (!mobile || mobile.length !== 10) {
            return res.status(400).json({ success: false, message: 'Invalid mobile number' });
        }

        const User = require('../models/User');
        const user = await User.findOne({ mobile });
        if (user) {
            return res.json({
                success: false,
                exists: true,
                role: user.role,
                message: user.role === 'service'
                    ? 'This number is registered as a Service Provider. Please use a different number.'
                    : 'This number is already registered. Please login instead.'
            });
        }

        const otp = generateOTP();
        otpCache.set(mobile, otp);

        // Development mode — log OTP to terminal
        console.log(`📱 OTP for ${mobile}: ${otp}`);

        res.json({ success: true, message: `OTP sent to +91 ${mobile}` });
    } catch (error) {
        console.error('Send OTP error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to send OTP. Try again.' });
    }
});

// ✅ Verify OTP
router.post('/verify-otp', (req, res) => {
    try {
        const { mobile, otp } = req.body;
        const cachedOtp = otpCache.get(mobile);

        if (!cachedOtp) {
            return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
        }

        if (cachedOtp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
        }

        otpCache.del(mobile);
        // Leaves a short-lived "this number was just verified" marker —
        // used by the account mobile-change flow (see updateBusinessProfile)
        // to confirm the new number was actually OTP-verified, without
        // having to pass the OTP code itself through that later request.
        otpCache.set('verified:' + mobile, true);
        res.json({ success: true, message: 'Mobile verified successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ Send OTP for changing a service listing's contact number. Unlike
// /send-otp (used at registration, where the number must NOT already
// belong to a User), this does not check that — a listing's contact
// number is just a phone number for that listing, not a login
// credential, so it can legitimately match an existing account's mobile
// (including the vendor's own).
router.post('/send-listing-otp', protect, async (req, res) => {
    try {
        const { mobile } = req.body;
        if (!mobile || mobile.length !== 10) {
            return res.status(400).json({ success: false, message: 'Invalid mobile number' });
        }
        const otp = generateOTP();
        otpCache.set(mobile, otp);
        console.log(`📱 Listing mobile-change OTP for ${mobile}: ${otp}`);
        res.json({ success: true, message: `OTP sent to +91 ${mobile}` });
    } catch (error) {
        console.error('Send listing OTP error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to send OTP. Try again.' });
    }
});

module.exports = router;
