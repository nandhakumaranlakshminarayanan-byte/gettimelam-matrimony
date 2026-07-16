const express = require('express');
const router = express.Router();
const SupportChat = require('../models/SupportChat');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') next();
    else res.status(403).json({ success: false, message: 'Admin access only!' });
};

// ── User: get my own support thread (creates an empty one if none yet) ──
router.get('/my', protect, async (req, res) => {
    try {
        let chat = await SupportChat.findOne({ user: req.user.id });
        if (!chat) {
            chat = await SupportChat.create({ user: req.user.id, messages: [] });
        } else if (chat.unreadByUser) {
            chat.unreadByUser = false;
            await chat.save();
        }
        res.json({ success: true, chat });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── User: check for an unread admin reply WITHOUT clearing it — used to
// show a badge on the chat toggle button before the widget is opened ──
router.get('/my/unread-status', protect, async (req, res) => {
    try {
        const chat = await SupportChat.findOne({ user: req.user.id }).select('unreadByUser');
        res.json({ success: true, unread: chat?.unreadByUser || false });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── User: send a message to support ──
router.post('/my/send', protect, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text?.trim()) return res.status(400).json({ success: false, message: 'Message cannot be empty' });

        let chat = await SupportChat.findOne({ user: req.user.id });
        if (!chat) chat = await SupportChat.create({ user: req.user.id, messages: [] });

        chat.messages.push({ from: 'user', text: text.trim() });
        chat.status = 'open';
        chat.unreadByAdmin = true;
        chat.lastMessageAt = new Date();
        await chat.save();

        res.json({ success: true, chat });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Admin: list all support threads ──
router.get('/admin/all', protect, adminOnly, async (req, res) => {
    try {
        const chats = await SupportChat.find()
            .populate('user', 'name businessName mobile role')
            .populate('assignedTo', 'name')
            .sort({ lastMessageAt: -1 });
        res.json({ success: true, chats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Admin: count of threads with an unread user message (sidebar badge) ──
router.get('/admin/unread-count', protect, adminOnly, async (req, res) => {
    try {
        const count = await SupportChat.countDocuments({ unreadByAdmin: true });
        res.json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Admin: get one thread, marks it read for admin ──
router.get('/admin/:chatId', protect, adminOnly, async (req, res) => {
    try {
        const chat = await SupportChat.findById(req.params.chatId)
            .populate('user', 'name businessName mobile role')
            .populate('assignedTo', 'name');
        if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
        if (chat.unreadByAdmin) {
            chat.unreadByAdmin = false;
            await chat.save();
        }
        res.json({ success: true, chat });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Admin: reply ──
router.post('/admin/:chatId/reply', protect, adminOnly, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text?.trim()) return res.status(400).json({ success: false, message: 'Message cannot be empty' });

        const chat = await SupportChat.findById(req.params.chatId);
        if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

        chat.messages.push({ from: 'admin', text: text.trim(), sentBy: req.user.id });
        chat.unreadByUser = true;
        chat.lastMessageAt = new Date();
        await chat.save();

        res.json({ success: true, chat });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Admin: assign a thread to a specific support-enabled admin ──
router.put('/admin/:chatId/assign', protect, adminOnly, async (req, res) => {
    try {
        const { adminId } = req.body;
        if (adminId) {
            const target = await User.findById(adminId);
            if (!target || target.role !== 'admin') {
                return res.status(400).json({ success: false, message: 'Invalid admin' });
            }
        }
        const chat = await SupportChat.findByIdAndUpdate(
            req.params.chatId,
            { assignedTo: adminId || null },
            { new: true }
        ).populate('assignedTo', 'name');
        res.json({ success: true, message: adminId ? 'Assigned' : 'Unassigned', chat });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Admin: close a thread ──
router.put('/admin/:chatId/close', protect, adminOnly, async (req, res) => {
    try {
        await SupportChat.findByIdAndUpdate(req.params.chatId, { status: 'closed' });
        res.json({ success: true, message: 'Marked as resolved' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
