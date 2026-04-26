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
        const { name, email, mobile, password, gender, profileFor, dateOfBirth } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ $or: [{ email }, { mobile }] });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email or mobile'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name,
            email,
            mobile,
            password: hashedPassword,
            gender,
            profileFor,
            dateOfBirth
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            token: generateToken(user._id),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                gender: user.gender,
                isPremium: user.isPremium
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route POST /api/auth/login
const loginUser = async (req, res) => {
    try {
        const { mobile, password } = req.body;

        const user = await User.findOne({ mobile });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid mobile or password'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid mobile or password'
            });
        }

        res.json({
            success: true,
            message: 'Login successful!',
            token: generateToken(user._id),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                gender: user.gender,
                isPremium: user.isPremium,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route GET /api/auth/me
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { registerUser, loginUser, getMe };