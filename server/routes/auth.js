const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const NodeCache = require('node-cache');

// OTP cache — expires in 5 minutes
const otpCache = new NodeCache({ stdTTL: 300 });

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

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
        res.json({ success: true, message: 'Mobile verified successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
