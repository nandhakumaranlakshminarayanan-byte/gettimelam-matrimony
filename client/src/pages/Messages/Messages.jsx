import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import axios from 'axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const API = 'http://localhost:5000';

const Messages = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [socket, setSocket] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeConv, setActiveConv] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeout = useRef(null);

    useEffect(() => {
        if (!user) { navigate('/'); return; }

        // ── Connect socket ──
        const s = io(API);
        s.emit('join', user.id);
        setSocket(s);

        s.on('receiveMessage', (msg) => {
            setMessages(prev => [...prev, msg]);
            fetchConversations();
        });

        s.on('messageSent', (msg) => {
            setMessages(prev => [...prev, msg]);
        });

        s.on('userTyping', () => setIsTyping(true));
        s.on('userStopTyping', () => setIsTyping(false));

        fetchConversations();

        // Open chat with specific user if ?with=userId in URL
        const withUser = searchParams.get('with');
        if (withUser) {
            openConversation({ userId: withUser, name: 'User' });
        }

        return () => s.disconnect();
    }, [user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/messages/conversations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConversations(res.data.conversations || []);
        } catch (err) {
            console.log('No conversations yet');
        }
    };

    const openConversation = async (conv) => {
        setActiveConv(conv);
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/messages/${conv.userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(res.data.messages || []);
            fetchConversations();
        } catch (err) {
            setMessages([]);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = () => {
        if (!newMessage.trim() || !activeConv || !socket) return;

        socket.emit('sendMessage', {
            senderId: user.id,
            receiverId: activeConv.userId,
            content: newMessage.trim(),
        });

        setNewMessage('');
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        socket.emit('stopTyping', { senderId: user.id, receiverId: activeConv.userId });
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        if (!socket || !activeConv) return;
        socket.emit('typing', { senderId: user.id, receiverId: activeConv.userId });
        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
            socket.emit('stopTyping', { senderId: user.id, receiverId: activeConv.userId });
        }, 1500);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (d.toDateString() === today.toDateString()) return 'Today';
        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return d.toLocaleDateString('en-IN');
    };

    const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';

    const isMine = (msg) => {
        const senderId = msg.sender?._id || msg.sender;
        return senderId?.toString() === user?.id?.toString();
    };

    return (
        <div style={{ background: '#FFFDF9', minHeight: '100vh' }}>
            <Navbar onLoginClick={() => { }} onRegisterClick={() => { }} />

            <div style={styles.container}>
                <div style={styles.chatLayout}>

                    {/* ── LEFT: Conversations ── */}
                    <div style={styles.convList}>
                        <div style={styles.convHeader}>
                            <h2 style={styles.convTitle}>💬 Messages</h2>
                            <span style={styles.convCount}>{conversations.length}</span>
                        </div>

                        <div style={{ overflowY: 'auto', flex: 1 }}>
                            {conversations.length === 0 ? (
                                <div style={styles.emptyConv}>
                                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>💬</div>
                                    <p style={{ color: '#7A6055', fontSize: '13px', textAlign: 'center', lineHeight: 1.6 }}>
                                        No conversations yet.<br />
                                        Browse profiles and send interest to start chatting!
                                    </p>
                                    <button style={styles.browseBtn} onClick={() => navigate('/browse')}>
                                        Browse Profiles →
                                    </button>
                                </div>
                            ) : (
                                conversations.map(conv => (
                                    <div key={conv.userId}
                                        style={{
                                            ...styles.convItem,
                                            background: activeConv?.userId === conv.userId ? '#FDF0F0' : '#fff',
                                            borderLeft: activeConv?.userId === conv.userId ? '3px solid #8B1A1A' : '3px solid transparent',
                                        }}
                                        onClick={() => openConversation(conv)}>
                                        <div style={styles.convAvatar}>
                                            {getInitial(conv.name)}
                                        </div>
                                        <div style={styles.convInfo}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={styles.convName}>{conv.name}</div>
                                                {conv.lastTime && (
                                                    <div style={{ fontSize: '10px', color: '#7A6055' }}>
                                                        {formatTime(conv.lastTime)}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={styles.convLast}>
                                                {conv.lastMessage?.substring(0, 35)}{conv.lastMessage?.length > 35 ? '...' : ''}
                                            </div>
                                        </div>
                                        {conv.unread > 0 && (
                                            <div style={styles.unreadBadge}>{conv.unread}</div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* ── RIGHT: Chat Window ── */}
                    <div style={styles.chatWindow}>
                        {!activeConv ? (
                            <div style={styles.noChatSelected}>
                                <div style={{ fontSize: '64px', marginBottom: '16px' }}>💬</div>
                                <h3 style={{ color: '#1A0A0A', marginBottom: '8px', fontFamily: "'Playfair Display', serif" }}>
                                    Select a conversation
                                </h3>
                                <p style={{ color: '#7A6055', fontSize: '14px' }}>
                                    Choose a conversation from the left to start chatting
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Chat Header */}
                                <div style={styles.chatHeader}>
                                    <div style={styles.chatAvatar}>
                                        {getInitial(activeConv.name)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={styles.chatName}>{activeConv.name}</div>
                                        <div style={styles.chatStatus}>
                                            {isTyping ? '✍️ typing...' : '🟢 Active'}
                                        </div>
                                    </div>
                                    <button style={styles.whatsappBtn}
                                        onClick={() => window.open(`https://wa.me/91${activeConv.mobile}`, '_blank')}>
                                        💬 WhatsApp
                                    </button>
                                </div>

                                {/* Messages Area */}
                                <div style={styles.messagesArea}>
                                    {loading ? (
                                        <div style={{ textAlign: 'center', padding: '40px', color: '#7A6055' }}>
                                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏳</div>
                                            Loading messages...
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '40px', color: '#7A6055' }}>
                                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>👋</div>
                                            <p>Start the conversation with {activeConv.name}!</p>
                                        </div>
                                    ) : (
                                        messages.map((msg, i) => {
                                            const mine = isMine(msg);
                                            const showDate = i === 0 || formatDate(msg.createdAt) !== formatDate(messages[i - 1].createdAt);
                                            return (
                                                <div key={msg._id || i}>
                                                    {showDate && (
                                                        <div style={styles.dateDivider}>
                                                            <span style={styles.dateDividerText}>
                                                                {formatDate(msg.createdAt)}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div style={{
                                                        ...styles.msgRow,
                                                        justifyContent: mine ? 'flex-end' : 'flex-start'
                                                    }}>
                                                        {!mine && (
                                                            <div style={styles.msgAvatar}>
                                                                {getInitial(activeConv.name)}
                                                            </div>
                                                        )}
                                                        <div style={{
                                                            ...styles.msgBubble,
                                                            background: mine ? '#8B1A1A' : '#fff',
                                                            color: mine ? '#fff' : '#2C1810',
                                                            borderRadius: mine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                                            boxShadow: mine ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
                                                        }}>
                                                            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>
                                                                {msg.content}
                                                            </p>
                                                            <div style={{
                                                                fontSize: '10px',
                                                                marginTop: '4px',
                                                                color: mine ? 'rgba(255,255,255,0.7)' : '#7A6055',
                                                                textAlign: 'right'
                                                            }}>
                                                                {formatTime(msg.createdAt)}
                                                                {mine && (msg.isRead ? ' ✓✓' : ' ✓')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}

                                    {/* Typing indicator */}
                                    {isTyping && (
                                        <div style={{ ...styles.msgRow, justifyContent: 'flex-start' }}>
                                            <div style={styles.msgAvatar}>{getInitial(activeConv.name)}</div>
                                            <div style={{ ...styles.msgBubble, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '4px 0' }}>
                                                    {[0, 1, 2].map(i => (
                                                        <div key={i} style={{
                                                            width: '6px', height: '6px',
                                                            borderRadius: '50%', background: '#7A6055',
                                                            animation: `bounce 1s infinite ${i * 0.2}s`
                                                        }} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div style={styles.inputArea}>
                                    <textarea
                                        style={styles.messageInput}
                                        placeholder={`Message ${activeConv.name}...`}
                                        value={newMessage}
                                        onChange={handleTyping}
                                        onKeyPress={handleKeyPress}
                                        rows={1}
                                    />
                                    <button
                                        style={{
                                            ...styles.sendBtn,
                                            opacity: newMessage.trim() ? 1 : 0.5,
                                            background: newMessage.trim() ? '#8B1A1A' : '#ccc',
                                        }}
                                        onClick={sendMessage}
                                        disabled={!newMessage.trim()}
                                    >
                                        ➤
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

const styles = {
    container: { maxWidth: '1200px', margin: '0 auto', padding: '24px' },
    chatLayout: { display: 'grid', gridTemplateColumns: '320px 1fr', height: '78vh', background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(139,26,26,0.1)' },
    convList: { borderRight: '1px solid #E8D5C4', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    convHeader: { padding: '20px', borderBottom: '1px solid #E8D5C4', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
    convTitle: { fontFamily: "'Playfair Display', serif", fontSize: '18px', color: '#1A0A0A', margin: 0 },
    convCount: { background: '#8B1A1A', color: '#fff', borderRadius: '50px', padding: '2px 10px', fontSize: '12px', fontWeight: '700' },
    emptyConv: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' },
    browseBtn: { padding: '8px 16px', background: '#8B1A1A', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginTop: '12px' },
    convItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #F5EAE0', transition: 'all 0.15s' },
    convAvatar: { width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #8B1A1A, #C0392B)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', flexShrink: 0 },
    convInfo: { flex: 1, overflow: 'hidden' },
    convName: { fontWeight: '700', color: '#1A0A0A', fontSize: '13px', marginBottom: '2px' },
    convLast: { fontSize: '11px', color: '#7A6055', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    unreadBadge: { background: '#8B1A1A', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', flexShrink: 0 },
    chatWindow: { display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    noChatSelected: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', background: '#FFFDF9' },
    chatHeader: { padding: '14px 20px', borderBottom: '1px solid #E8D5C4', display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', flexShrink: 0 },
    chatAvatar: { width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #8B1A1A, #C0392B)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', flexShrink: 0 },
    chatName: { fontWeight: '700', color: '#1A0A0A', fontSize: '15px' },
    chatStatus: { fontSize: '11px', color: '#7A6055' },
    whatsappBtn: { padding: '7px 12px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' },
    messagesArea: { flex: 1, overflowY: 'auto', padding: '16px 20px', background: '#FFFDF9' },
    dateDivider: { textAlign: 'center', margin: '12px 0' },
    dateDividerText: { background: '#E8D5C4', color: '#7A6055', fontSize: '11px', padding: '3px 12px', borderRadius: '50px' },
    msgRow: { display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '8px' },
    msgAvatar: { width: '26px', height: '26px', borderRadius: '50%', background: '#E8D5C4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#8B1A1A', flexShrink: 0 },
    msgBubble: { maxWidth: '60%', padding: '10px 14px', borderRadius: '18px' },
    inputArea: { padding: '12px 16px', borderTop: '1px solid #E8D5C4', display: 'flex', gap: '10px', alignItems: 'flex-end', background: '#fff', flexShrink: 0 },
    messageInput: { flex: 1, padding: '10px 16px', border: '1.5px solid #E8D5C4', borderRadius: '24px', fontSize: '14px', color: '#2C1810', outline: 'none', resize: 'none', fontFamily: "'DM Sans', sans-serif", maxHeight: '100px', lineHeight: 1.5 },
    sendBtn: { width: '42px', height: '42px', borderRadius: '50%', color: '#fff', border: 'none', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' },
};

export default Messages;