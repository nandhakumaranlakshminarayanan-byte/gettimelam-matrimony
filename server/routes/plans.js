const express = require('express');
const router = express.Router();
const Plan = require('../models/Plan');
const { protect } = require('../middleware/authMiddleware');

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') next();
    else res.status(403).json({ success: false, message: 'Admin access only!' });
};

// Public — active plans only, for the site's Plans page (?type=member|service)
router.get('/', async (req, res) => {
    try {
        const filter = { isActive: true };
        if (req.query.type) filter.targetType = req.query.type;
        const plans = await Plan.find(filter).sort({ price: 1 });
        res.json({ success: true, plans });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Admin — every plan, including inactive ones
router.get('/admin/all', protect, adminOnly, async (req, res) => {
    try {
        const plans = await Plan.find().sort({ targetType: 1, price: 1 });
        res.json({ success: true, plans });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const { name, targetType, price, originalPrice, features } = req.body;
        if (!name || !targetType || !price) {
            return res.status(400).json({ success: false, message: 'Name, target type, and price are required' });
        }
        const plan = await Plan.create({
            name, targetType, price,
            originalPrice: originalPrice || undefined,
            features: (features || []).filter(Boolean),
        });
        res.status(201).json({ success: true, message: 'Plan created!', plan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Editing a plan only ever changes what NEW subscribers get — existing
// Subscription documents keep their own frozen snapshot regardless.
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const { name, price, originalPrice, features, isActive } = req.body;
        const plan = await Plan.findById(req.params.id);
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

        if (name !== undefined) plan.name = name;
        if (price !== undefined) plan.price = price;
        if (originalPrice !== undefined) plan.originalPrice = originalPrice;
        if (features !== undefined) plan.features = features.filter(Boolean);
        if (isActive !== undefined) plan.isActive = isActive;
        await plan.save();

        res.json({ success: true, message: 'Plan updated — existing subscribers are unaffected', plan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        await Plan.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Plan deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
