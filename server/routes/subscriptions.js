const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') next();
    else res.status(403).json({ success: false, message: 'Admin access only!' });
};

// Admin assigns a plan to a user. This is the one place a Subscription gets
// created — it freezes a snapshot of the plan's current price/name/features
// onto the subscription, so later edits to the Plan document never change
// what this user already has.
router.post('/assign', protect, adminOnly, async (req, res) => {
    try {
        const { userId, planId } = req.body;
        const [user, plan] = await Promise.all([
            User.findById(userId),
            Plan.findById(planId),
        ]);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

        const expectedRole = plan.targetType === 'member' ? 'member' : 'service';
        if (user.role !== expectedRole) {
            return res.status(400).json({
                success: false,
                message: `This is a ${plan.targetType} plan, but the selected user is a ${user.role}`
            });
        }

        const purchasedAt = new Date();
        const expiresAt = new Date(purchasedAt);
        expiresAt.setMonth(expiresAt.getMonth() + (plan.durationMonths || 12));

        const subscription = await Subscription.create({
            user: user._id,
            plan: plan._id,
            planNameSnapshot: plan.name,
            priceSnapshot: plan.price,
            targetType: plan.targetType,
            featuresSnapshot: plan.features,
            durationMonths: plan.durationMonths || 12,
            purchasedAt,
            expiresAt,
            assignedBy: 'admin',
        });

        // Keep the existing isPremium gating working across the app —
        // now `plan` holds the actual plan name instead of just "premium".
        user.isPremium = true;
        user.plan = plan.name;
        await user.save();

        res.status(201).json({ success: true, message: `${plan.name} assigned to ${user.name || user.businessName}!`, subscription });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// My own current subscription — for showing "Your Plan" in Dashboard
router.get('/my', protect, async (req, res) => {
    try {
        const subscription = await Subscription.findOne({ user: req.user.id })
            .sort({ createdAt: -1 });
        res.json({ success: true, subscription });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Admin — every subscription ever made, for the Recent Subscribers table
router.get('/admin/all', protect, adminOnly, async (req, res) => {
    try {
        const subscriptions = await Subscription.find()
            .populate('user', 'name businessName mobile role')
            .sort({ createdAt: -1 })
            .limit(100);
        res.json({ success: true, subscriptions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
