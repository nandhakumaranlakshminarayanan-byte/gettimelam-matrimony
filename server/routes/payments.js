const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Razorpay client — reads keys from environment, never hardcoded.
// If the keys aren't set yet, requests fail with a clear message instead
// of a confusing crash, so this is safe to deploy before .env is filled in.
const getRazorpayInstance = () => {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
        throw new Error('Razorpay keys are not configured on the server (.env)');
    }
    return new Razorpay({ key_id, key_secret });
};

// ── Step 1: create a Razorpay order for a plan ──
// The amount is taken from the Plan document on the SERVER, never trusted
// from the client, so nobody can tamper with the price in the browser.
router.post('/create-order', protect, async (req, res) => {
    try {
        const { planId } = req.body;
        const plan = await Plan.findById(planId);
        if (!plan || !plan.isActive) {
            return res.status(404).json({ success: false, message: 'Plan not found or no longer available' });
        }

        const user = await User.findById(req.user.id);
        const expectedRole = plan.targetType === 'member' ? 'member' : 'service';
        if (user.role !== expectedRole) {
            return res.status(400).json({ success: false, message: 'This plan is not available for your account type' });
        }

        const razorpay = getRazorpayInstance();
        const order = await razorpay.orders.create({
            amount: plan.price * 100, // Razorpay uses paise
            currency: 'INR',
            receipt: `rcpt_${plan._id.toString().slice(-8)}_${Date.now()}`, // Razorpay caps receipt at 40 chars
            notes: { planId: plan._id.toString(), userId: req.user.id },
        });

        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
            plan: { id: plan._id, name: plan.name, price: plan.price, features: plan.features },
        });
    } catch (error) {
        // The Razorpay SDK rejects with a plain object like
        // { statusCode, error: { description, code } } when the Razorpay
        // API itself refuses the request (bad key, test/live mismatch,
        // inactive account, amount too low, etc.) — NOT a real JS Error,
        // so error.message is undefined for those cases. Log the whole
        // thing server-side and dig the real description out of both shapes.
        console.error('[payments/create-order] failed:', JSON.stringify(error, null, 2));
        const razorpayMsg = error?.error?.description;
        res.status(500).json({ success: false, message: razorpayMsg || error.message || 'Payment gateway error — see server logs' });
    }
});

// ── Step 2: verify the payment after Razorpay's checkout completes ──
// This is the step that actually matters for security — the signature can
// only have been produced by Razorpay using the real Key Secret, so a
// successful verification here is proof the payment genuinely happened.
router.post('/verify', protect, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
            return res.status(400).json({ success: false, message: 'Missing payment details' });
        }

        const key_secret = process.env.RAZORPAY_KEY_SECRET;
        if (!key_secret) {
            return res.status(500).json({ success: false, message: 'Razorpay keys are not configured on the server (.env)' });
        }

        const expectedSignature = crypto
            .createHmac('sha256', key_secret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Payment verification failed — signature mismatch' });
        }

        // Signature is genuine — now create the subscription, snapshotting
        // the plan's current price/name/features, exactly like an admin
        // assignment does. Future plan edits never touch this record.
        const plan = await Plan.findById(planId);
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

        const purchasedAt = new Date();
        const expiresAt = new Date(purchasedAt);
        expiresAt.setMonth(expiresAt.getMonth() + (plan.durationMonths || 12));

        const subscription = await Subscription.create({
            user: req.user.id,
            plan: plan._id,
            planNameSnapshot: plan.name,
            priceSnapshot: plan.price,
            targetType: plan.targetType,
            featuresSnapshot: plan.features,
            durationMonths: plan.durationMonths || 12,
            purchasedAt,
            expiresAt,
            assignedBy: 'self',
        });

        const user = await User.findById(req.user.id);
        user.isPremium = true;
        user.plan = plan.name;
        await user.save();

        res.json({ success: true, message: 'Payment verified — welcome to ' + plan.name + '!', subscription });
    } catch (error) {
        console.error('[payments/verify] failed:', JSON.stringify(error, null, 2));
        const razorpayMsg = error?.error?.description;
        res.status(500).json({ success: false, message: razorpayMsg || error.message || 'Payment gateway error — see server logs' });
    }
});

module.exports = router;
