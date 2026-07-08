const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const ServiceCard = require('../models/ServiceCard');
const { protect } = require('../middleware/authMiddleware');

// ── Admin guard (same pattern as routes/admin.js) ──
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Admin access only!' });
    }
};

// ── Image upload (same pattern as routes/serviceMenu.js) ──
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `servicecard_${Date.now()}${path.extname(file.originalname)}`)
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const valid = /jpeg|jpg|png|webp/.test(path.extname(file.originalname).toLowerCase());
        valid ? cb(null, true) : cb(new Error('Images only!'));
    }
});

// ── Public: active cards for the homepage ──
router.get('/', async (req, res) => {
    try {
        const cards = await ServiceCard.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
        res.json({ success: true, cards });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Admin: all cards (including inactive) ──
router.get('/all', protect, adminOnly, async (req, res) => {
    try {
        const cards = await ServiceCard.find().sort({ order: 1, createdAt: 1 });
        res.json({ success: true, cards });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Admin: create a card (multipart, optional image) ──
router.post('/', protect, adminOnly, upload.single('image'), async (req, res) => {
    try {
        const { name, description, glow, order, category } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

        const card = await ServiceCard.create({
            name,
            description: description || '',
            glow: glow || '#DF9B08',
            order: order ? Number(order) : 0,
            category: category || '',
            image: req.file ? `/uploads/${req.file.filename}` : '',
        });
        res.status(201).json({ success: true, message: 'Service card created! ✅', card });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Admin: update a card (multipart, optional new image) ──
router.put('/:id', protect, adminOnly, upload.single('image'), async (req, res) => {
    try {
        const card = await ServiceCard.findById(req.params.id);
        if (!card) return res.status(404).json({ success: false, message: 'Card not found' });

        const { name, description, glow, order, category } = req.body;
        if (name !== undefined) card.name = name;
        if (description !== undefined) card.description = description;
        if (glow !== undefined) card.glow = glow;
        if (order !== undefined) card.order = Number(order);
        if (category !== undefined) card.category = category;
        if (req.file) card.image = `/uploads/${req.file.filename}`;

        await card.save();
        res.json({ success: true, message: 'Service card updated! ✅', card });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Admin: toggle active/inactive ──
router.put('/:id/toggle', protect, adminOnly, async (req, res) => {
    try {
        const card = await ServiceCard.findById(req.params.id);
        if (!card) return res.status(404).json({ success: false, message: 'Card not found' });
        card.isActive = !card.isActive;
        await card.save();
        res.json({ success: true, message: `Card ${card.isActive ? 'activated' : 'deactivated'}!`, card });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Admin: delete a card ──
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const card = await ServiceCard.findById(req.params.id);
        if (!card) return res.status(404).json({ success: false, message: 'Card not found' });
        await card.deleteOne();
        res.json({ success: true, message: 'Service card deleted!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
