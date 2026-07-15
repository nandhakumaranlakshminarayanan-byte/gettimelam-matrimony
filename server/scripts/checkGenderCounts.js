// READ-ONLY diagnostic — makes no changes. Prints how many profiles exist
// by gender and isActive status, since Browse's opposite-gender query
// depends on both.
//
// Usage (from the server/ directory, so it picks up server/.env):
//   node scripts/checkGenderCounts.js

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

    const rows = await Profile.aggregate([
        { $group: { _id: { gender: '$gender', isActive: '$isActive' }, count: { $sum: 1 } } },
        { $sort: { '_id.gender': 1 } },
    ]);
    console.log('Breakdown by gender + isActive:');
    for (const row of rows) {
        console.log(`  gender=${JSON.stringify(row._id.gender)} isActive=${JSON.stringify(row._id.isActive)} : ${row.count}`);
    }

    console.log('\nMale profiles (name, isActive, isVerified):');
    const males = await Profile.find({ gender: 'Male' }).select('name isActive isVerified');
    for (const m of males) {
        console.log(`  ${m.name} — isActive=${m.isActive}, isVerified=${m.isVerified}`);
    }

    await mongoose.disconnect();
}

run().catch(err => {
    console.error('Check failed:', err);
    process.exit(1);
});