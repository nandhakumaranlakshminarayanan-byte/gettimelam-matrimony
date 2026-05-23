const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Profile = require('../models/Profile');
const {
    createProfile, getProfiles, getProfileById,
    updateProfile, getMyProfile, getSuggestedMatches
} = require('../controllers/profileController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

// ── Storage config ──
const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, 'uploads/'); },
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

// ── Profile routes ──
router.get('/', optionalProtect, getProfiles);
router.post('/', protect, createProfile);
router.get('/my', protect, getMyProfile);
router.get('/suggested', protect, getSuggestedMatches);
router.get('/:id', getProfileById);
router.put('/:id', protect, updateProfile);

// ── Upload single profile photo ──
router.post('/upload-photo', protect, upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        const photoUrl = `/uploads/${req.file.filename}`;
        await Profile.findOneAndUpdate(
            { user: req.user.id },
            { photo: photoUrl },
            { new: true }
        );
        res.json({
            success: true,
            photoUrl,
            fullUrl: `http://localhost:5000${photoUrl}`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ Upload multiple photos (up to 15) ──
router.post('/upload-photos', protect, upload.array('photos', 15), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }

        const photoUrls = req.files.map(f => `/uploads/${f.filename}`);

        // ✅ Add new photos to existing photos array
        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile) {
            return res.status(404).json({ success: false, message: 'Create your profile first!' });
        }

        // ✅ Max 15 photos total
        const existingPhotos = profile.photos || [];
        const totalPhotos = existingPhotos.length + photoUrls.length;

        if (totalPhotos > 15) {
            return res.status(400).json({
                success: false,
                message: `You can only have 15 photos maximum. You have ${existingPhotos.length} photos. You can add ${15 - existingPhotos.length} more.`
            });
        }

        const updatedProfile = await Profile.findOneAndUpdate(
            { user: req.user.id },
            { $push: { photos: { $each: photoUrls } } },
            { new: true }
        );

        res.json({
            success: true,
            message: `${photoUrls.length} photo(s) uploaded! ✅`,
            photos: updatedProfile.photos,
            fullUrls: photoUrls.map(url => `http://localhost:5000${url}`)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ Delete a photo from gallery ──
router.delete('/photos/:filename', protect, async (req, res) => {
    try {
        const photoUrl = `/uploads/${req.params.filename}`;
        await Profile.findOneAndUpdate(
            { user: req.user.id },
            { $pull: { photos: photoUrl } },
            { new: true }
        );
        res.json({ success: true, message: 'Photo deleted!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;