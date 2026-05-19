const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// @route POST /api/auth/register
const registerUser = async (req, res) => {
    try {
        const { role = 'member' } = req.body;

        const userExists = await User.findOne({
            $or: [{ email: req.body.email }, { mobile: req.body.mobile }]
        });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'Account already exists with this email or mobile number'
            });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        let userData = { role, password: hashedPassword };

        if (role === 'member') {
            const { name, email, mobile, gender, profileFor, dateOfBirth, motherTongue } = req.body;
            if (!name || !email || !mobile || !gender) {
                return res.status(400).json({
                    success: false,
                    message: 'Name, email, mobile and gender are required for member registration'
                });
            }
            userData = { ...userData, name, email, mobile, gender, profileFor, dateOfBirth, motherTongue };
        } else if (role === 'service') {
            const { businessName, ownerName, email, mobile, category, city, district } = req.body;
            if (!businessName || !ownerName || !email || !mobile || !category) {
                return res.status(400).json({
                    success: false,
                    message: 'Business name, owner name, email, mobile and category are required'
                });
            }
            userData = { ...userData, businessName, ownerName, email, mobile, category, city, district };
        } else {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        const user = await User.create(userData);

        const responseUser = {
            id: user._id, role: user.role,
            email: user.email, mobile: user.mobile,
        };

        if (role === 'member') {
            responseUser.name = user.name;
            responseUser.gender = user.gender;
            responseUser.isPremium = user.isPremium;
            responseUser.plan = user.plan;
        } else {
            responseUser.businessName = user.businessName;
            responseUser.ownerName = user.ownerName;
            responseUser.category = user.category;
            responseUser.isApproved = user.isApproved;
            responseUser.city = user.city;
            responseUser.district = user.district;
        }

        res.status(201).json({
            success: true,
            message: role === 'member'
                ? 'Registration successful! Welcome to Gettimelam!'
                : 'Service Provider registered! Our team will verify and approve your listing shortly.',
            token: generateToken(user._id),
            user: responseUser
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route POST /api/auth/login
const loginUser = async (req, res) => {
    try {
        const { mobile, password, role } = req.body;
        const user = await User.findOne({ mobile });

        if (!user) {
            return res.status(401).json({ success: false, message: 'No account found with this mobile number' });
        }

        // ── Auto-fix old roles ──
        if (user.role === 'user') {
            await User.findByIdAndUpdate(user._id, { role: 'member' });
            user.role = 'member';
        }
        if (user.role === 'vendor') {
            await User.findByIdAndUpdate(user._id, { role: 'service' });
            user.role = 'service';
        }

        if (role && role !== 'any' && user.role !== 'admin') {
            if (user.role !== role) {
                const correctTab = user.role === 'service' ? 'Service Provider' : 'Member Login';
                return res.status(401).json({
                    success: false,
                    message: `Please use the "${correctTab}" tab to login.`
                });
            }
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
        }

        const responseUser = {
            id: user._id, role: user.role,
            email: user.email, mobile: user.mobile,
        };

        if (user.role === 'member') {
            responseUser.name = user.name;
            responseUser.gender = user.gender;
            responseUser.isPremium = user.isPremium;
            responseUser.plan = user.plan;
        } else if (user.role === 'service') {
            responseUser.businessName = user.businessName;
            responseUser.ownerName = user.ownerName;
            responseUser.category = user.category;
            responseUser.isApproved = user.isApproved;
            responseUser.city = user.city;
            responseUser.district = user.district;
        } else if (user.role === 'admin') {
            responseUser.name = user.name;
        }

        res.json({
            success: true,
            message: 'Login successful!',
            token: generateToken(user._id),
            user: responseUser
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ @route GET /api/auth/me — same format as login
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const responseUser = {
            id: user._id, role: user.role,
            email: user.email, mobile: user.mobile,
        };

        if (user.role === 'member') {
            responseUser.name = user.name;
            responseUser.gender = user.gender;
            responseUser.isPremium = user.isPremium; // ✅ always latest from DB
            responseUser.plan = user.plan;
        } else if (user.role === 'service') {
            responseUser.businessName = user.businessName;
            responseUser.ownerName = user.ownerName;
            responseUser.category = user.category;
            responseUser.isApproved = user.isApproved;
            responseUser.city = user.city;
            responseUser.district = user.district;
        } else if (user.role === 'admin') {
            responseUser.name = user.name;
        }

        res.json({ success: true, user: responseUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { registerUser, loginUser, getMe };