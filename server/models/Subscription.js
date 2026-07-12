const mongoose = require('mongoose');

// A user's subscription to a plan. Deliberately stores a SNAPSHOT of the
// plan's name/price/features at the moment of purchase/assignment — not a
// live reference — so that if an admin edits or deletes the Plan later,
// everyone who already subscribed keeps exactly what they paid for.
// Only future purchases pick up the new price.
const subscriptionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' }, // reference only, for admin reporting

    // Snapshot — the source of truth for this subscription, frozen forever
    planNameSnapshot: { type: String, required: true },
    priceSnapshot: { type: Number, required: true },
    targetType: { type: String, enum: ['member', 'service'], required: true },
    featuresSnapshot: [{ type: String }],
    durationMonths: { type: Number, default: 12 },

    purchasedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    assignedBy: { type: String, enum: ['admin', 'self'], default: 'admin' },
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
