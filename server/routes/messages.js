const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const UserAlert = require('../models/UserAlert');
const { protect } = require('../middleware/authMiddleware');

// ── Get all conversations ──
router.get('/conversations', protect, async (req, res) => {
    try {
        const userId = req.user.id;

        const messages = await ChatMessage.find({
            $or: [{ sender: userId }, { receiver: userId }]
        })
            .populate('sender', 'name businessName ownerName role')
            .populate('receiver', 'name businessName ownerName role')
            .sort({ createdAt: -1 });

        const convMap = new Map();
        messages.forEach(msg => {
            const otherId = msg.sender._id.toString() === userId
                ? msg.receiver._id.toString()
                : msg.sender._id.toString();

            if (!convMap.has(otherId)) {
                const other = msg.sender._id.toString() === userId
                    ? msg.receiver : msg.sender;
                convMap.set(otherId, {
                    userId: otherId,
                    name: other.name || other.businessName || other.ownerName || 'User',
                    role: other.role,
                    lastMessage: msg.content,
                    lastTime: msg.createdAt,
                    unread: msg.receiver._id.toString() === userId && !msg.isRead ? 1 : 0,
                });
            } else {
                const conv = convMap.get(otherId);
                if (msg.receiver._id.toString() === userId && !msg.isRead) {
                    conv.unread += 1;
                }
            }
        });

        res.json({ success: true, conversations: Array.from(convMap.values()) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Get messages between two users ──
router.get('/:userId', protect, async (req, res) => {
    try {
        const myId = req.user.id;
        const otherId = req.params.userId;

        const messages = await ChatMessage.find({
            $or: [
                { sender: myId, receiver: otherId },
                { sender: otherId, receiver: myId }
            ]
        })
            .populate('sender', 'name businessName ownerName')
            .populate('receiver', 'name businessName ownerName')
            .sort({ createdAt: 1 });

        // Mark as read
        await ChatMessage.updateMany(
            { sender: otherId, receiver: myId, isRead: false },
            { isRead: true }
        );

        res.json({ success: true, messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Send message (REST fallback) ──
router.post('/send', protect, async (req, res) => {
    try {
        const { receiverId, content } = req.body;

        // Member-to-member chat requires Premium. Messaging a service
        // provider (wedding vendor etc.) stays free — only gated when
        // BOTH sides are matrimony members.
        const [sender, receiver] = await Promise.all([
            User.findById(req.user.id).select('role isPremium name businessName ownerName'),
            User.findById(receiverId).select('role'),
        ]);
        if (sender?.role === 'member' && receiver?.role === 'member' && !sender.isPremium) {
            return res.status(403).json({ success: false, message: 'Upgrade to Premium to message other members.' });
        }

        const message = await ChatMessage.create({
            sender: req.user.id,
            receiver: receiverId,
            content,
        });
        const populated = await message.populate('sender', 'name businessName ownerName');

        const senderName = sender?.name || sender?.businessName || sender?.ownerName || 'Someone';
        await UserAlert.create({
            user: receiverId,
            type: 'message',
            title: 'New Message',
            message: `${senderName} sent you a message.`,
            link: `/messages?with=${req.user.id}`,
            fromUser: req.user.id,
        });

        res.status(201).json({ success: true, message: populated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Unread count ──
router.get('/unread/count', protect, async (req, res) => {
    try {
        const count = await ChatMessage.countDocuments({
            receiver: req.user.id,
            isRead: false
        });
        res.json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
