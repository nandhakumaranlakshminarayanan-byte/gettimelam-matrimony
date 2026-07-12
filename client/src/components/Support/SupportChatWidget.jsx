import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API = 'http://localhost:5000';

// Chat bubble icon (replaces emoji)
const ChatIcon = ({ size = 20, color = '#fff' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a8 8 0 01-8 8c-1.4 0-2.8-.3-4-.9L3.5 20.5l1.4-4.5A8 8 0 1121 12z" />
    </svg>
);

const SupportChatWidget = ({ open, onClose }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const scrollRef = useRef(null);

    const fetchChat = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API}/api/support/my`, { headers: { Authorization: `Bearer ${token}` } });
            setMessages(res.data.chat?.messages || []);
        } catch (err) { }
    };

    useEffect(() => {
        if (open && user) {
            fetchChat();
            const interval = setInterval(fetchChat, 8000); // light polling for admin replies
            return () => clearInterval(interval);
        }
    }, [open, user]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const handleSend = async () => {
        if (!text.trim() || sending) return;
        setSending(true);
        const token = localStorage.getItem('token');
        try {
            const res = await axios.post(`${API}/api/support/my/send`,
                { text: text.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessages(res.data.chat.messages);
            setText('');
        } catch (err) { }
        setSending(false);
    };

    if (!open) return null;

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.panel} onClick={e => e.stopPropagation()}>
                <div style={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ChatIcon size={18} />
                        <div>
                            <div style={styles.headerTitle}>Chat with Support</div>
                            <div style={styles.headerSub}>We usually reply within a few hours</div>
                        </div>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div style={styles.messages} ref={scrollRef}>
                    {messages.length === 0 ? (
                        <div style={styles.emptyState}>
                            <ChatIcon size={30} color="#DDBB88" />
                            <p style={{ marginTop: '10px' }}>Have a question or facing an issue?<br />Send us a message below.</p>
                        </div>
                    ) : (
                        messages.map((m, i) => (
                            <div key={i} style={{
                                ...styles.bubble,
                                ...(m.from === 'user' ? styles.bubbleUser : styles.bubbleAdmin),
                            }}>
                                {m.text}
                                <div style={styles.bubbleTime}>
                                    {new Date(m.at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div style={styles.inputRow}>
                    <input
                        style={styles.input}
                        placeholder="Type your message..."
                        value={text}
                        onChange={e => setText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />
                    <button style={styles.sendBtn} onClick={handleSend} disabled={sending}>
                        {sending ? '...' : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: '24px' },
    panel: {
        width: '360px', height: '520px', background: '#fff', borderRadius: '16px', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
    },
    header: { background: 'linear-gradient(135deg, #8B1A1A, #5F0909)', padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { color: '#fff', fontWeight: '700', fontSize: '14.5px' },
    headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: '11.5px', marginTop: '2px' },
    closeBtn: { background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: '26px', height: '26px', borderRadius: '50%', cursor: 'pointer', fontSize: '13px' },
    messages: { flex: 1, overflowY: 'auto', padding: '16px', background: '#FFFDF6' },
    emptyState: { textAlign: 'center', color: '#B0987A', fontSize: '13px', marginTop: '60px', lineHeight: 1.6 },
    bubble: { maxWidth: '78%', padding: '10px 13px', borderRadius: '12px', fontSize: '13.5px', lineHeight: 1.5, marginBottom: '10px', position: 'relative' },
    bubbleUser: { background: '#8B1A1A', color: '#fff', marginLeft: 'auto', borderBottomRightRadius: '3px' },
    bubbleAdmin: { background: '#fff', color: '#3A2A20', border: '1px solid #F0E0C0', marginRight: 'auto', borderBottomLeftRadius: '3px' },
    bubbleTime: { fontSize: '9.5px', opacity: 0.6, marginTop: '4px' },
    inputRow: { display: 'flex', gap: '8px', padding: '12px', borderTop: '1px solid #F0E0C0', background: '#fff' },
    input: { flex: 1, padding: '10px 14px', border: '1.5px solid #E0D0B0', borderRadius: '999px', fontSize: '13px', outline: 'none' },
    sendBtn: { padding: '10px 18px', background: '#8B1A1A', color: '#fff', border: 'none', borderRadius: '999px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
};

export default SupportChatWidget;
