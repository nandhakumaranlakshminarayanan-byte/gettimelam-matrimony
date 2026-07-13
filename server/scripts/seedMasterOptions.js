// Populates MasterOption with everything the app's dropdowns currently use
// (998 entries: religions, castes, sub-castes, all 36 states/UTs and their
// 762 districts, starter jobs, rasis, nakshatras, dosham, marital status).
//
// MUST be run once before the new admin-managed options system will have
// anything in it — without this, every dropdown in Register/Dashboard/
// Browse would be empty until an admin manually re-typed everything.
//
// Idempotent: safe to re-run — existing entries are left untouched
// (upsert with $setOnInsert), nothing is duplicated or overwritten.
//
// Usage (from the server/ directory, so it picks up server/.env):
//   node scripts/seedMasterOptions.js

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const MasterOption = require('../models/MasterOption');
const seedData = require('./seedData/masterOptionsSeed.json');

async function run() {
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI not found — run this from the server/ directory so it picks up server/.env');
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connected to MongoDB. Seeding ${seedData.length} options...\n`);

    let created = 0, alreadyExisted = 0;
    for (const entry of seedData) {
        const result = await MasterOption.updateOne(
            { category: entry.category, parent: entry.parent, value: entry.value },
            { $setOnInsert: { category: entry.category, parent: entry.parent, value: entry.value, isActive: true, source: 'seed' } },
            { upsert: true }
        );
        if (result.upsertedCount > 0) created++;
        else alreadyExisted++;
    }

    console.log(`Done. ${created} new option(s) created, ${alreadyExisted} already existed (left untouched).`);

    const byCategory = await MasterOption.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
    ]);
    console.log('\nActive options per category:');
    for (const row of byCategory) console.log(`  ${row._id}: ${row.count}`);

    await mongoose.disconnect();
}

run().catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
});
