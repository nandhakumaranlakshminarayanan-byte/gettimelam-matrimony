// One-off migration: fixes existing profiles whose maritalStatus was saved
// using the old Registration vocabulary ("Unmarried" / "Awaiting divorce")
// instead of the canonical one used everywhere else in the app
// ("Never Married" / "Separated"). This is what was silently breaking the
// Browse "Marital Status" filter for pre-existing profiles.
//
// SAFE BY DEFAULT: running this with no flags only PREVIEWS what would
// change — it makes no writes. Pass --apply to actually update the
// database.
//
// Usage (from the server/ directory, so it picks up server/.env):
//   node scripts/fixMaritalStatus.js            <- dry run, just prints
//   node scripts/fixMaritalStatus.js --apply     <- actually updates

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const Profile = require('../models/Profile');

const VALUE_MAP = {
    'Unmarried': 'Never Married',
    'Awaiting divorce': 'Separated',
};

const apply = process.argv.includes('--apply');

async function run() {
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI not found — run this from the server/ directory so it picks up server/.env');
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.\n');

    const oldValues = Object.keys(VALUE_MAP);
    const affected = await Profile.find({ maritalStatus: { $in: oldValues } })
        .select('name maritalStatus user')
        .populate('user', 'name mobile');

    if (affected.length === 0) {
        console.log('No profiles found with the old maritalStatus values. Nothing to do.');
        await mongoose.disconnect();
        return;
    }

    console.log(`Found ${affected.length} profile(s) to ${apply ? 'UPDATE' : 'preview'}:\n`);
    for (const p of affected) {
        const newValue = VALUE_MAP[p.maritalStatus];
        const label = p.name || p.user?.name || p._id;
        console.log(`  ${label}: "${p.maritalStatus}" -> "${newValue}"`);
    }

    if (!apply) {
        console.log('\nThis was a DRY RUN — no changes were made.');
        console.log('Re-run with --apply to actually update these profiles:');
        console.log('  node scripts/fixMaritalStatus.js --apply');
    } else {
        console.log('\nApplying updates...');
        for (const [oldVal, newVal] of Object.entries(VALUE_MAP)) {
            const result = await Profile.updateMany(
                { maritalStatus: oldVal },
                { $set: { maritalStatus: newVal } }
            );
            console.log(`  "${oldVal}" -> "${newVal}": ${result.modifiedCount} updated`);
        }
        console.log('\nDone.');
    }

    await mongoose.disconnect();
}

run().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
