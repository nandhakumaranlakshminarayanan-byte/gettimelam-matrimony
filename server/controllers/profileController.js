const Profile = require('../models/Profile');
const User = require('../models/User');

// @route   POST /api/profiles
const createProfile = async (req, res) => {
    try {
        const profileExists = await Profile.findOne({ user: req.user.id });
        if (profileExists) {
            return res.status(400).json({ success: false, message: 'Profile already exists' });
        }
        const profile = await Profile.create({ user: req.user.id, ...req.body });
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

        // ✅ Exclude own profile if logged in
        if (req.user) {
            filter.user = { $ne: req.user.id };
        }

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

// ✅ Get opposite gender profiles for suggestions
const getSuggestedMatches = async (req, res) => {
    try {
        const myProfile = await Profile.findOne({ user: req.user.id });

        // ✅ Fallback to User model gender if profile not found yet
        const me = await User.findById(req.user.id);
        const myGender = myProfile?.gender || me?.gender;

        let filter = {
            isActive: true,
            user: { $ne: req.user.id }
        };

        // ✅ Always show ONLY opposite gender
        if (myGender === 'Female') {
            filter.gender = 'Male';
        } else if (myGender === 'Male') {
            filter.gender = 'Female';
        }

        // ✅ Match same religion if available
        if (myProfile?.religion) {
            filter.religion = myProfile.religion;
        }

        let profiles = await Profile.find(filter)
            .populate('user', 'name email mobile')
            .sort({ createdAt: -1 })
            .limit(6);

        // Religion narrowing is a soft preference, not a hard requirement —
        // if it leaves zero results, fall back to gender-only matching so
        // the section isn't empty just because nobody shares the religion yet.
        if (profiles.length === 0 && filter.religion) {
            const { religion, ...genderOnlyFilter } = filter;
            profiles = await Profile.find(genderOnlyFilter)
                .populate('user', 'name email mobile')
                .sort({ createdAt: -1 })
                .limit(6);
        }

        res.json({ success: true, profiles });
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

        // Count a view only when someone other than the owner looks at the
        // profile, so people don't inflate their own view count.
        const isOwner = profile.user && profile.user._id?.toString() === req.user.id;
        if (!isOwner) {
            profile.views = (profile.views || 0) + 1;
            await profile.save();
        }

        // Gallery photos are Premium-only (like contact numbers).
        // The main photo stays visible; extra photos are stripped for
        // non-premium viewers (owner and admin always see everything).
        const data = profile.toObject();
        const viewer = await User.findById(req.user.id).select('isPremium role');
        const canSeeGallery = isOwner || (viewer && (viewer.isPremium || viewer.role === 'admin'));
        if (!canSeeGallery) {
            data.photosCount = (data.photos || []).length;
            data.photos = [];
            data.photosLocked = true;
        }

        res.json({ success: true, profile: data });
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

// @route   PUT /api/profiles/aadhar
// Member submits (or resubmits after a rejection) their Aadhar number.
// Loose 12-digit check only — this isn't meant to validate the number is
// real, just to catch obvious typos before it goes to admin.
const submitAadhar = async (req, res) => {
    try {
        const { aadharNumber } = req.body;
        const digitsOnly = (aadharNumber || '').replace(/\s/g, '');
        if (!/^\d{12}$/.test(digitsOnly)) {
            return res.status(400).json({ success: false, message: 'Aadhar number must be exactly 12 digits' });
        }
        const profile = await Profile.findOneAndUpdate(
            { user: req.user.id },
            {
                aadharNumber: digitsOnly,
                aadharStatus: 'pending',
                aadharSubmittedAt: new Date(),
                aadharReviewedAt: null,
                aadharRejectReason: null,
            },
            { new: true }
        );
        if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });
        res.json({ success: true, message: 'Aadhar submitted — pending admin review', profile });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createProfile, getProfiles, getProfileById,
    updateProfile, getMyProfile, getSuggestedMatches, submitAadhar,
};