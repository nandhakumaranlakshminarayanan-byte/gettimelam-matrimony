const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Profile = require('../models/Profile');
const {
    createProfile,
    getProfiles,
    getProfileById,
    updateProfile,
    getMyProfile
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

// Storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `photo_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        const types = /jpeg|jpg|png|webp/;
        const valid = types.test(path.extname(file.originalname).toLowerCase());
        if (valid) cb(null, true);
        else cb(new Error('Only image files allowed!'));
    }
});

// Profile routes
router.get('/', getProfiles);
router.post('/', protect, createProfile);
router.get('/my', protect, getMyProfile);
router.get('/:id', getProfileById);
router.put('/:id', protect, updateProfile);

// Upload photo
router.post('/upload-photo', protect, upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const photoUrl = `http://localhost:5000/uploads/${req.file.filename}`;

        await Profile.findOneAndUpdate(
            { user: req.user.id },
            { photo: photoUrl },
            { new: true }
        );

        res.json({ success: true, photoUrl });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;