// READ-ONLY diagnostic — makes no changes. Lists every profile whose caste
// value isn't in the standard CASTE_DATA taxonomy (e.g. "Naicker/Vanniya
// Kula Kshatriyar" instead of "Vanniyar"), so we can see how many profiles
// are affected before deciding on a fix.
//
// Usage (from the server/ directory, so it picks up server/.env):
//   node scripts/checkCasteValues.js

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const Profile = require('../models/Profile');

// Same taxonomy as client/src/utils/casteData.js's top-level caste names
const KNOWN_CASTES = [
    'Vanniyar', 'Vellalar', 'Mukkulathor / Thevar', 'Mudaliar / Pillai', 'Chettiar',
    'Nadar', 'Tamil Brahmin (Iyer)', 'Tamil Brahmin (Iyengar)', 'Scheduled Castes / Adi Dravida',
    'Naidu / Nayakar', 'Viswakarma', 'Yadhava', 'Udayar', 'Muthuraja / Muthiraiyar',
    'Saurashtra', 'Any Caste', 'Other',
    'Denomination Base', 'Christian Nadar', 'Christian Vellalar',
    'Subgroup Base', 'Tamil Jain', 'Neo-Buddhist / Others',
];

async function run() {
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI not found — run this from the server/ directory so it picks up server/.env');
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.\n');

    const profiles = await Profile.find({ caste: { $ne: null } }).select('name religion caste subCaste');
    const mismatched = profiles.filter(p => !KNOWN_CASTES.includes(p.caste));

    console.log(`Total profiles with a caste set: ${profiles.length}`);
    console.log(`Profiles with a caste NOT in the standard taxonomy: ${mismatched.length}\n`);

    if (mismatched.length > 0) {
        console.log('Mismatched profiles:');
        for (const p of mismatched) {
            console.log(`  ${p.name} — religion="${p.religion}" caste="${p.caste}" subCaste="${p.subCaste || ''}"`);
        }
    }

    await mongoose.disconnect();
}

run().catch(err => {
    console.error('Check failed:', err);
    process.exit(1);
});