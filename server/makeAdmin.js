const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

const resetPassword = async () => {
    console.log('Starting...');
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB Connected!');

        const db = mongoose.connection.db;
        const users = db.collection('users');

        const newPassword = '9944355114';
        const newMobile = '9944355114';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const result = await users.updateOne(
            { mobile: '8667233235' },
            { $set: { mobile: newMobile, password: hashedPassword, role: 'admin' } }
        );

        console.log(result.modifiedCount > 0 ? '✅ Password updated & Admin role set!' : '❌ User not found');

        await mongoose.disconnect();
        console.log('Done!');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
};

resetPassword();