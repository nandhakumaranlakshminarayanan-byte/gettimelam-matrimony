const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// ── Socket.io setup ──
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

// ── Online users map ──
const onlineUsers = new Map();

io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);

    socket.on('join', (userId) => {
        onlineUsers.set(userId, socket.id);
        socket.userId = userId;
        console.log('👤 User joined:', userId);
    });

    socket.on('sendMessage', async (data) => {
        try {
            const ChatMessage = require('./models/ChatMessage');
            const message = await ChatMessage.create({
                sender: data.senderId,
                receiver: data.receiverId,
                content: data.content,
            });
            const populated = await message.populate('sender', 'name businessName ownerName');
            const receiverSocket = onlineUsers.get(data.receiverId);
            if (receiverSocket) io.to(receiverSocket).emit('receiveMessage', populated);
            socket.emit('messageSent', populated);
        } catch (err) {
            console.error('Message error:', err);
        }
    });

    socket.on('typing', (data) => {
        const receiverSocket = onlineUsers.get(data.receiverId);
        if (receiverSocket) io.to(receiverSocket).emit('userTyping', { senderId: data.senderId });
    });

    socket.on('stopTyping', (data) => {
        const receiverSocket = onlineUsers.get(data.receiverId);
        if (receiverSocket) io.to(receiverSocket).emit('userStopTyping', { senderId: data.senderId });
    });

    socket.on('disconnect', () => {
        onlineUsers.delete(socket.userId);
        console.log('❌ User disconnected:', socket.id);
    });
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ──
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profiles', require('./routes/profiles'));
app.use('/api/services', require('./routes/services'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/banners', require('./routes/banners'));
app.use('/api/privacy', require('./routes/privacy'));         // ✅ new
app.use('/api/admin', require('./routes/admin'));

app.get('/', (req, res) => {
    res.json({ message: '🎉 Gettimelam API Running!', version: '1.0.0' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});