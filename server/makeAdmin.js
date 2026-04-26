const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb://localhost:27017/gettimelam';

const resetPassword = async () => {
    console.log('Starting...');
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB Connected!');

        const db = mongoose.connection.db;
        const users = db.collection('users');

        const newPassword = '9442395444';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const result = await users.updateOne(
            { mobile: '8667233235' },
            { $set: { password: hashedPassword, role: 'admin' } }
        );

        console.log(result.modifiedCount > 0 ? '✅ Password updated & Admin role set!' : '❌ User not found');

        await mongoose.disconnect();
        console.log('Done!');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
};

resetPassword();