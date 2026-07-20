// Populates MasterOption with the starting set of wedding-service
// categories (category: 'servicecategory') — this is what the Category
// dropdown on business registration, the Add/Edit Service form, the
// Wedding Services filter, and Service Cards' "Links To Category" all now
// read from, instead of a hardcoded list in each file.
//
// Photography and Videography are merged into a single "Photography &
// Videography" category, as requested — any existing listing still under
// the old separate "Photography" or "Videography" values keeps working
// (categories are just a string on the Service document, not a strict
// enum anymore), but new listings and the filter dropdown will only
// offer the merged one going forward.
//
// Idempotent: safe to re-run — existing entries are left untouched.
//
// Usage (from the server/ directory, so it picks up server/.env):
//   node scripts/seedServiceCategories.js

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const MasterOption = require('../models/MasterOption');

const CATEGORIES = [
    'Wedding Hall/Venue',
    'Event Decoration',
    'Catering',
    'Wedding Rentals',
    'Stationery & Cards',
    'Photography & Videography',
    'DJ & Entertainment',
    'Choreography',
    'Bridal Makeup & Hair',
    'Mehndi Artist',
    'Bridal Styling',
    'Wedding Planner',
    'Travel & Accommodation',
    'Officiant/Priest',
    'Security & Valet',
    'Wedding Cake',
    'Favors & Gifts',
    'Other',
];

async function run() {
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI not found — run this from the server/ directory so it picks up server/.env');
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connected to MongoDB. Seeding ${CATEGORIES.length} service categories...\n`);

    let created = 0, alreadyExisted = 0;
    for (const value of CATEGORIES) {
        const result = await MasterOption.updateOne(
            { category: 'servicecategory', parent: null, value },
            { $setOnInsert: { category: 'servicecategory', parent: null, value, isActive: true, source: 'seed' } },
            { upsert: true }
        );
        if (result.upsertedCount > 0) created++;
        else alreadyExisted++;
    }

    console.log(`Done. ${created} created, ${alreadyExisted} already existed.`);
    await mongoose.disconnect();
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
