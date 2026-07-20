const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Service = require('../models/Service');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// ── Photo upload config ──
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `service_${Date.now()}${path.extname(file.originalname)}`)
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only images allowed!'));
    }
});

// ── GET all services with filters ──
router.get('/', async (req, res) => {
    try {
        const { category, city, district, date, featured } = req.query;
        let filter = { isActive: true };

        if (category) filter.category = category;
        if (city) filter.city = new RegExp(city, 'i');
        if (district) filter.district = new RegExp(district, 'i');
        if (featured) filter.isFeatured = true;

        if (date) {
            const searchDate = new Date(date);
            filter.$or = [
                { availability: { $size: 0 } },
                {
                    availability: {
                        $not: {
                            $elemMatch: {
                                date: {
                                    $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
                                    $lte: new Date(searchDate.setHours(23, 59, 59, 999))
                                },
                                status: { $in: ['booked', 'blocked'] }
                            }
                        }
                    }
                }
            ];
        }

        const services = await Service.find(filter).sort({ isFeatured: -1, createdAt: -1 });
        res.json({ success: true, count: services.length, services });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── GET vendor's own services ── (must be before /:id)
router.get('/vendor/my', protect, async (req, res) => {
    try {
        const services = await Service.find({ vendor: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, count: services.length, services });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── GET single service ──
router.get('/:id', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id).populate('vendor', 'name email mobile');
        if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
        res.json({ success: true, service });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── CREATE service ──
router.post('/', protect, upload.array('photos', 5), async (req, res) => {
    try {
        const photoUrls = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
        const vendorUser = await User.findById(req.user.id);
        const service = await Service.create({
            ...req.body, vendor: req.user.id, photos: photoUrls,
            mobile: vendorUser?.mobile, // always the account's number, never client-supplied
        });
        res.status(201).json({ success: true, message: 'Service listed successfully!', service });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── UPDATE my service (settings page) ──
router.put('/my/update', protect, upload.array('photos', 5), async (req, res) => {
    try {
        const service = await Service.findOne({ vendor: req.user.id });
        if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
        const updates = { ...req.body };
        if (req.files && req.files.length > 0) {
            const newPhotos = req.files.map(f => `/uploads/${f.filename}`);
            updates.photos = [...(service.photos || []), ...newPhotos];
        }
        const updated = await Service.findByIdAndUpdate(service._id, updates, { new: true });
        res.json({ success: true, message: 'Service updated!', service: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── UPDATE service ──
router.put('/:id', protect, async (req, res) => {
    try {
        const { mobile, ...updates } = req.body; // mobile always mirrors the account — see authController.updateBusinessProfile
        const service = await Service.findOneAndUpdate(
            { _id: req.params.id, vendor: req.user.id },
            updates,
            { new: true, runValidators: true }
        );
        if (!service) return res.status(404).json({ success: false, message: 'Service not found or unauthorized' });
        res.json({ success: true, message: 'Service updated!', service });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── UPLOAD photos for a service ──
router.post('/:id/upload-photos', protect, upload.array('photos', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }
        const photoUrls = req.files.map(f => `/uploads/${f.filename}`);
        const service = await Service.findOneAndUpdate(
            { _id: req.params.id, vendor: req.user.id },
            { $push: { photos: { $each: photoUrls } } },
            { new: true }
        );
        if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
        res.json({ success: true, message: `${req.files.length} photo(s) uploaded!`, photos: service.photos });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── DELETE a photo from service ──
router.delete('/:id/photos', protect, async (req, res) => {
    try {
        const { photoUrl } = req.body;
        const service = await Service.findOneAndUpdate(
            { _id: req.params.id, vendor: req.user.id },
            { $pull: { photos: photoUrl } },
            { new: true }
        );
        res.json({ success: true, message: 'Photo deleted!', photos: service.photos });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── GET availability ──
router.get('/:id/availability', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id).select('availability businessName');
        if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
        res.json({ success: true, availability: service.availability });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── UPDATE availability ──
router.put('/:id/availability', protect, async (req, res) => {
    try {
        const service = await Service.findOneAndUpdate(
            { _id: req.params.id, vendor: req.user.id },
            { availability: req.body.availability },
            { new: true }
        );
        if (!service) return res.status(404).json({ success: false, message: 'Service not found or unauthorized' });
        res.json({ success: true, message: 'Availability updated!', availability: service.availability });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── CHECK single date availability ──
router.post('/:id/check-availability', async (req, res) => {
    try {
        const { date } = req.body;
        if (!date) return res.status(400).json({ success: false, message: 'Date is required' });

        const service = await Service.findById(req.params.id).select('availability businessName');
        if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

        const checkDate = new Date(date);
        const entry = service.availability.find(a => {
            const d = new Date(a.date);
            return d.toDateString() === checkDate.toDateString();
        });

        const status = entry ? entry.status : 'available';
        res.json({
            success: true,
            date,
            status,
            isAvailable: status === 'available',
            message: status === 'available'
                ? 'Available on this date!'
                : status === 'booked'
                    ? 'Already booked on this date'
                    : 'Blocked on this date'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── ADD review ──
router.post('/:id/reviews', protect, async (req, res) => {
    try {
        const { comment, rating } = req.body;
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

        service.reviews.push({ user: req.user.id, comment, rating });
        const total = service.reviews.reduce((sum, r) => sum + r.rating, 0);
        service.rating = (total / service.reviews.length).toFixed(1);
        service.totalReviews = service.reviews.length;
        await service.save();

        res.json({ success: true, message: 'Review added!', rating: service.rating });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;