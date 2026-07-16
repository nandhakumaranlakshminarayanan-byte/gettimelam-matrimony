// READ-ONLY diagnostic — makes no changes. Finds every caste option whose
// value renders as (or close to) "Any Caste", showing the exact string
// (with quotes, so trailing/leading whitespace is visible) and its parent,
// to explain why the Browse dropdown shows what looks like a duplicate
// even though the query uses distinct().

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const MasterOption = require('../models/MasterOption');

async function run() {
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI not found — run this from the server/ directory so it picks up server/.env');
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.\n');

    const matches = await MasterOption.find({
        category: 'caste',
        value: { $regex: /any\s*caste/i },
    });

    console.log(`Found ${matches.length} caste option(s) matching "Any Caste":\n`);
    for (const m of matches) {
        console.log(`  value=${JSON.stringify(m.value)} (length ${m.value.length}) parent=${JSON.stringify(m.parent)} isActive=${m.isActive} source=${m.source} id=${m._id}`);
    }

    await mongoose.disconnect();
}

run().catch(err => {
    console.error('Check failed:', err);
    process.exit(1);
});