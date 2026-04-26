const Profile = require('../models/Profile');

// @route   POST /api/profiles
const createProfile = async (req, res) => {
    try {
        const profileExists = await Profile.findOne({ user: req.user.id });
        if (profileExists) {
            return res.status(400).json({ success: false, message: 'Profile already exists' });
        }

        const profile = await Profile.create({
            user: req.user.id,
            ...req.body
        });

        res.status(201).json({ success: true, message: 'Profile created!', profile });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   GET /api/profiles
const getProfiles = async (req, res) => {
    try {
        const { gender, religion, caste, city, district, maritalStatus, minAge, maxAge } = req.query;

        let filter = { isActive: true };

        if (gender) filter.gender = gender;
        if (religion) filter.religion = religion;
        if (caste) filter.caste = new RegExp(caste, 'i');
        if (city) filter.city = new RegExp(city, 'i');
        if (district) filter.district = new RegExp(district, 'i');
        if (maritalStatus) filter.maritalStatus = maritalStatus;

        if (minAge || maxAge) {
            filter.dateOfBirth = {};
            if (minAge) filter.dateOfBirth.$lte = new Date(new Date().setFullYear(new Date().getFullYear() - minAge));
            if (maxAge) filter.dateOfBirth.$gte = new Date(new Date().setFullYear(new Date().getFullYear() - maxAge));
        }

        const profiles = await Profile.find(filter)
            .populate('user', 'name email mobile')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: profiles.length, profiles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   GET /api/profiles/:id
const getProfileById = async (req, res) => {
    try {
        const profile = await Profile.findById(req.params.id)
            .populate('user', 'name email mobile');

        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }

        res.json({ success: true, profile });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   PUT /api/profiles/:id
const updateProfile = async (req, res) => {
    try {
        const profile = await Profile.findOneAndUpdate(
            { user: req.user.id },
            { ...req.body },
            { new: true, runValidators: true }
        );

        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }

        res.json({ success: true, message: 'Profile updated!', profile });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   GET /api/profiles/my
const getMyProfile = async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }

        res.json({ success: true, profile });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createProfile, getProfiles, getProfileById, updateProfile, getMyProfile };