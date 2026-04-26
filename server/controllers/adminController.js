const User = require('../models/User');
const Profile = require('../models/Profile');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Testimonial = require('../models/Testimonial');
const Banner = require('../models/Banner');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

// Get dashboard stats
const getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProfiles = await Profile.countDocuments();
        const totalServices = await Service.countDocuments();
        const totalBookings = await Booking.countDocuments();
        const premiumUsers = await User.countDocuments({ isPremium: true });
        const totalMessages = await Message.countDocuments();
        const unreadMessages = await Message.countDocuments({ isRead: false });
        const totalTestimonials = await Testimonial.countDocuments();
        const recentUsers = await User.find()
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalProfiles,
                totalServices,
                totalBookings,
                premiumUsers,
                freeUsers: totalUsers - premiumUsers,
                totalMessages,
                unreadMessages,
                totalTestimonials
            },
            recentUsers
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ success: true, count: users.length, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all profiles
const getAllProfiles = async (req, res) => {
    try {
        const profiles = await Profile.find()
            .populate('user', 'name email mobile')
            .sort({ createdAt: -1 });
        res.json({ success: true, count: profiles.length, profiles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Toggle premium
const togglePremium = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        user.isPremium = !user.isPremium;
        user.plan = user.isPremium ? 'premium' : 'free';
        await user.save();
        res.json({ success: true, message: `User ${user.isPremium ? 'upgraded to Premium' : 'downgraded to Free'}`, isPremium: user.isPremium });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        await Profile.findOneAndDelete({ user: req.params.id });
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Verify profile
const verifyProfile = async (req, res) => {
    try {
        const profile = await Profile.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
        res.json({ success: true, message: 'Profile verified!', profile });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all bookings
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'name mobile email')
            .populate('service', 'businessName category city')
            .sort({ createdAt: -1 });
        res.json({ success: true, count: bookings.length, bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        res.json({ success: true, message: 'Booking updated!', booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Testimonials CRUD
const getTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find().sort({ createdAt: -1 });
        res.json({ success: true, testimonials });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial.create(req.body);
        res.status(201).json({ success: true, message: 'Testimonial added!', testimonial });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteTestimonial = async (req, res) => {
    try {
        await Testimonial.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Testimonial deleted!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Banners CRUD
const getBanners = async (req, res) => {
    try {
        const banners = await Banner.find().sort({ createdAt: -1 });
        res.json({ success: true, banners });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createBanner = async (req, res) => {
    try {
        const banner = await Banner.create(req.body);
        res.status(201).json({ success: true, message: 'Banner created!', banner });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const toggleBanner = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        banner.isActive = !banner.isActive;
        await banner.save();
        res.json({ success: true, message: `Banner ${banner.isActive ? 'activated' : 'deactivated'}!` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteBanner = async (req, res) => {
    try {
        await Banner.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Banner deleted!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Messages
const getMessages = async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.json({ success: true, messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const replyMessage = async (req, res) => {
    try {
        const message = await Message.findByIdAndUpdate(
            req.params.id,
            { isRead: true, isReplied: true, reply: req.body.reply },
            { new: true }
        );
        res.json({ success: true, message: 'Reply sent!', data: message });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const markMessageRead = async (req, res) => {
    try {
        await Message.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ success: true, message: 'Marked as read!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteMessage = async (req, res) => {
    try {
        await Message.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Message deleted!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Notifications
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 });
        res.json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createNotification = async (req, res) => {
    try {
        const notification = await Notification.create(req.body);
        res.status(201).json({ success: true, message: 'Notification sent!', notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteNotification = async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Notification deleted!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Analytics
const getAnalytics = async (req, res) => {
    try {
        const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: last7Days } });
        const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: last30Days } });
        const newProfilesThisWeek = await Profile.countDocuments({ createdAt: { $gte: last7Days } });

        const genderStats = await User.aggregate([
            { $group: { _id: '$gender', count: { $sum: 1 } } }
        ]);

        const religionStats = await Profile.aggregate([
            { $group: { _id: '$religion', count: { $sum: 1 } } }
        ]);

        const districtStats = await Profile.aggregate([
            { $group: { _id: '$district', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        res.json({
            success: true,
            analytics: {
                newUsersThisWeek,
                newUsersThisMonth,
                newProfilesThisWeek,
                genderStats,
                religionStats,
                districtStats
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getStats, getAllUsers, getAllProfiles, togglePremium, deleteUser, verifyProfile,
    getAllBookings, updateBookingStatus,
    getTestimonials, createTestimonial, deleteTestimonial,
    getBanners, createBanner, toggleBanner, deleteBanner,
    getMessages, replyMessage, markMessageRead, deleteMessage,
    getNotifications, createNotification, deleteNotification,
    getAnalytics
};