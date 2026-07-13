// READ-ONLY diagnostic — makes no changes. Prints every distinct
// maritalStatus value currently in the Profile collection, and how many
// profiles have each one, so we can see exactly what's stored instead of
// guessing.
//
// Usage (from the server/ directory, so it picks up server/.env):
//   node scripts/checkMaritalStatusValues.js

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const Profile = require('../models/Profile');

async function run() {
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI not found — run this from the server/ directory so it picks up server/.env');
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.\n');

    const total = await Profile.countDocuments();
    console.log(`Total profiles: ${total}\n`);

    const values = await Profile.distinct('maritalStatus');
    console.log('Distinct maritalStatus values currently stored:');
    for (const v of values) {
        const count = await Profile.countDocuments({ maritalStatus: v });
        console.log(`  ${JSON.stringify(v)} : ${count} profile(s)`);
    }

    const genderBreakdown = await Profile.aggregate([
        { $group: { _id: { gender: '$gender', maritalStatus: '$maritalStatus' }, count: { $sum: 1 } } },
        { $sort: { '_id.gender': 1 } },
    ]);
    console.log('\nBreakdown by gender + maritalStatus:');
    for (const row of genderBreakdown) {
        console.log(`  gender=${JSON.stringify(row._id.gender)} maritalStatus=${JSON.stringify(row._id.maritalStatus)} : ${row.count}`);
    }

    await mongoose.disconnect();
}

run().catch(err => {
    console.error('Check failed:', err);
    process.exit(1);
});
