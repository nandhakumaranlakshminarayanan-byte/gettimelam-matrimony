const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const { protect } = require('../middleware/authMiddleware');

// Get all services
router.get('/', async (req, res) => {
    try {
        const { category, city } = req.query;
        let filter = { isActive: true };
        if (category) filter.category = category;
        if (city) filter.city = new RegExp(city, 'i');

        const services = await Service.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, count: services.length, services });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single service
router.get('/:id', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
        res.json({ success: true, service });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create service
router.post('/', protect, async (req, res) => {
    try {
        const service = await Service.create(req.body);
        res.status(201).json({ success: true, message: 'Service listed!', service });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;