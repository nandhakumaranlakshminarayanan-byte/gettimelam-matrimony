const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Testimonial = require('../models/Testimonial');
const { protect } = require('../middleware/authMiddleware');

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Admin access only!' });
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `testimonial_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB — phone camera photos can be large
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only image files are allowed'));
    }
});

// Public — no auth required. Homepage reads this.
router.get('/', async (req, res) => {
    try {
        const testimonials = await Testimonial.find({ isActive: true })
            .sort({ createdAt: -1 });
        res.json({ success: true, testimonials });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Admin — full list including inactive
router.get('/admin/all', protect, adminOnly, async (req, res) => {
    try {
        const testimonials = await Testimonial.find().sort({ createdAt: -1 });
        res.json({ success: true, testimonials });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Wraps multer so oversized/invalid files return a clean JSON error
// instead of a broken response the frontend can't parse.
const uploadCouplePhoto = (req, res, next) => {
    upload.single('couplePhoto')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ success: false, message: 'Photo is too large — please use an image under 15MB' });
            }
            return res.status(400).json({ success: false, message: err.message });
        } else if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        next();
    });
};

// Create, with optional couple photo
router.post('/', protect, adminOnly, uploadCouplePhoto, async (req, res) => {
    try {
        const { groomName, brideName, marriageDate, message, city, religion } = req.body;
        if (!groomName || !brideName) {
            return res.status(400).json({ success: false, message: 'Groom and bride names are required' });
        }
        const testimonial = await Testimonial.create({
            groomName, brideName, marriageDate, message, city, religion,
            couplePhoto: req.file ? `/uploads/${req.file.filename}` : '',
        });
        res.status(201).json({ success: true, message: 'Success story added!', testimonial });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        await Testimonial.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Success story deleted!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;