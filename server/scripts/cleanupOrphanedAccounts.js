// Finds member accounts that exist in the User collection but have no
// matching Profile — these are orphans left behind by the registration bug
// where Profile creation could fail (e.g. an invalid familyType) AFTER the
// User account was already created, with no rollback. An orphaned account
// permanently blocks that email/mobile from ever registering again ("Account
// already exists"), even though the person never actually finished signing
// up.
//
// This is now fixed going forward (registration is atomic — a failed
// Profile creation rolls back the User too), but this script cleans up any
// orphans that were created before the fix.
//
// SAFE BY DEFAULT: no flags = preview only, no deletions.
//
// Usage (from the server/ directory, so it picks up server/.env):
//   node scripts/cleanupOrphanedAccounts.js            <- dry run
//   node scripts/cleanupOrphanedAccounts.js --apply     <- actually deletes

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const User = require('../models/User');
const Profile = require('../models/Profile');

const apply = process.argv.includes('--apply');

async function run() {
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI not found — run this from the server/ directory so it picks up server/.env');
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.\n');

    const memberUsers = await User.find({ role: 'member' }).select('name email mobile');
    const profileUserIds = new Set((await Profile.find().select('user')).map(p => String(p.user)));

    const orphaned = memberUsers.filter(u => !profileUserIds.has(String(u._id)));

    if (orphaned.length === 0) {
        console.log('No orphaned accounts found. Nothing to do.');
        await mongoose.disconnect();
        return;
    }

    console.log(`Found ${orphaned.length} orphaned account(s) to ${apply ? 'DELETE' : 'preview'}:\n`);
    for (const u of orphaned) {
        console.log(`  ${u.name || '(no name)'} — ${u.email} / ${u.mobile}`);
    }

    if (!apply) {
        console.log('\nThis was a DRY RUN — no changes were made.');
        console.log('Re-run with --apply to actually delete these accounts:');
        console.log('  node scripts/cleanupOrphanedAccounts.js --apply');
    } else {
        console.log('\nDeleting...');
        const ids = orphaned.map(u => u._id);
        const result = await User.deleteMany({ _id: { $in: ids } });
        console.log(`Deleted ${result.deletedCount} orphaned account(s). Those emails/mobiles are free to register again.`);
    }

    await mongoose.disconnect();
}

run().catch(err => {
    console.error('Cleanup failed:', err);
    process.exit(1);
});
