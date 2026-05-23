const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const ServiceMenu = require('../models/ServiceMenu');
const Service = require('../models/Service');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `menu_${Date.now()}${path.extname(file.originalname)}`)
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const valid = /jpeg|jpg|png|webp/.test(path.extname(file.originalname).toLowerCase());
        valid ? cb(null, true) : cb(new Error('Images only!'));
    }
});

// ── Get all packages for a service ──
router.get('/:serviceId', async (req, res) => {
    try {
        const menus = await ServiceMenu.find({
            service: req.params.serviceId,
            isActive: true
        }).sort({ createdAt: -1 });
        res.json({ success: true, menus });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Create a package ──
router.post('/', protect, upload.array('photos', 10), async (req, res) => {
    try {
        const { serviceId, name, description, price, features } = req.body;

        // ✅ Fixed: use vendor instead of user
        const service = await Service.findOne({ _id: serviceId, vendor: req.user.id });
        if (!service) return res.status(403).json({ success: false, message: 'Not authorized!' });

        const photos = (req.files || []).map(f => `/uploads/${f.filename}`);
        const featuresArr = features
            ? (Array.isArray(features) ? features : features.split(',').map(f => f.trim()))
            : [];

        const menu = await ServiceMenu.create({
            service: serviceId,
            owner: req.user.id,
            name,
            description,
            price,
            features: featuresArr,
            photos,
        });

        res.status(201).json({ success: true, message: 'Package created! ✅', menu });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Update a package ──
router.put('/:id', protect, async (req, res) => {
    try {
        const menu = await ServiceMenu.findById(req.params.id);
        if (!menu) return res.status(404).json({ success: false, message: 'Package not found' });
        if (menu.owner.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized!' });
        }

        const { name, description, price, features } = req.body;
        const featuresArr = features
            ? (Array.isArray(features) ? features : features.split(',').map(f => f.trim()))
            : menu.features;

        menu.name = name || menu.name;
        menu.description = description || menu.description;
        menu.price = price || menu.price;
        menu.features = featuresArr;
        await menu.save();

        res.json({ success: true, message: 'Package updated! ✅', menu });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Delete a package ──
router.delete('/:id', protect, async (req, res) => {
    try {
        const menu = await ServiceMenu.findById(req.params.id);
        if (!menu) return res.status(404).json({ success: false, message: 'Package not found' });
        if (menu.owner.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized!' });
        }
        await menu.deleteOne();
        res.json({ success: true, message: 'Package deleted!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Toggle active/inactive ──
router.put('/:id/toggle', protect, async (req, res) => {
    try {
        const menu = await ServiceMenu.findById(req.params.id);
        if (!menu) return res.status(404).json({ success: false, message: 'Package not found' });
        if (menu.owner.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized!' });
        }
        menu.isActive = !menu.isActive;
        await menu.save();
        res.json({ success: true, message: `Package ${menu.isActive ? 'activated' : 'deactivated'}!`, menu });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;