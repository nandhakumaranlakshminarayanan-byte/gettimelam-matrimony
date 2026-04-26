import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const Messages = () => {
    const [messages, setMessages] = useState([]);
    const [selected, setSelected] = useState(null);
    const [reply, setReply] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => { fetchMessages(); }, []);

    const fetchMessages = async () => {
        try {
            const res = await API.get('/admin/messages');
            setMessages(res.data.messages);
        } catch (err) {
            toast.error('Failed to load messages');
        }
    };

    const handleRead = async (id) => {
        try {
            await API.put(`/admin/messages/${id}/read`);
            fetchMessages();
        } catch (err) { }
    };

    const handleReply = async (id) => {
        if (!reply.trim()) return;
        try {
            await API.put(`/admin/messages/${id}/reply`, { reply });
            toast.success('Reply sent!');
            setReply('');
            setSelected(null);
            fetchMessages();
        } catch (err) {
            toast.error('Failed!');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this message?')) return;
        try {
            await API.delete(`/admin/messages/${id}`);
            toast.success('Deleted!');
            setSelected(null);
            fetchMessages();
        } catch (err) {
            toast.error('Failed!');
        }
    };

    const filtered = filter === 'all' ? messages
        : filter === 'unread' ? messages.filter(m => !m.isRead)
            : messages.filter(m => m.isReplied);

    return (
        <div style={styles.layout}>
            <Sidebar />
            <div style={styles.content}>
                <Navbar title="💬 Contact Messages" />
                <div style={styles.inner}>

                    {/* Stats */}
                    <div style={styles.statsRow}>
                        {[
                            { label: 'Total', value: messages.length, color: '#E3F2FD' },
                            { label: 'Unread', value: messages.filter(m => !m.isRead).length, color: '#FFEBEE' },
                            { label: 'Replied', value: messages.filter(m => m.isReplied).length, color: '#E8F5E9' },
                        ].map(s => (
                            <div key={s.label} style={{ ...styles.statCard, background: s.color }}>
                                <div style={styles.statValue}>{s.value}</div>
                                <div style={styles.statLabel}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Filter */}
                    <div style={styles.filterRow}>
                        {['all', 'unread', 'replied'].map(f => (
                            <button key={f} style={{ ...styles.filterBtn, ...(filter === f ? styles.filterActive : {}) }}
                                onClick={() => setFilter(f)}>
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div style={styles.messagesLayout}>
                        {/* Messages List */}
                        <div style={styles.messagesList}>
                            {filtered.map(m => (
                                <div
                                    key={m._id}
                                    style={{
                                        ...styles.messageItem,
                                        background: selected?._id === m._id ? '#FDF0F0' : '#fff',
                                        borderLeft: !m.isRead ? '3px solid #8B1A1A' : '3px solid transparent'
                                    }}
                                    onClick={() => { setSelected(m); if (!m.isRead) handleRead(m._id); }}
                                >
                                    <div style={styles.msgName}>{m.name}</div>
                                    <div style={styles.msgSubject}>{m.subject || 'No subject'}</div>
                                    <div style={styles.msgPreview}>{m.message.substring(0, 60)}...</div>
                                    <div style={styles.msgMeta}>
                                        <span style={{ fontSize: '11px', color: '#999' }}>
                                            {new Date(m.createdAt).toLocaleDateString('en-IN')}
                                        </span>
                                        {!m.isRead && <span style={styles.unreadDot} />}
                                        {m.isReplied && <span style={{ fontSize: '11px', color: '#2E7D32' }}>✅ Replied</span>}
                                    </div>
                                </div>
                            ))}
                            {filtered.length === 0 && (
                                <div style={styles.empty}>
                                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>💬</div>
                                    <p style={{ color: '#999' }}>No messages</p>
                                </div>
                            )}
                        </div>

                        {/* Message Detail */}
                        {selected ? (
                            <div style={styles.messageDetail}>
                                <div style={styles.detailHeader}>
                                    <div>
                                        <div style={styles.detailName}>{selected.name}</div>
                                        <div style={styles.detailMeta}>{selected.email} • {selected.mobile}</div>
                                    </div>
                                    <button style={styles.deleteBtn} onClick={() => handleDelete(selected._id)}>🗑️ Delete</button>
                                </div>

                                {selected.subject && <div style={styles.detailSubject}>📌 {selected.subject}</div>}
                                <div style={styles.detailMsg}>{selected.message}</div>
                                <div style={styles.detailDate}>{new Date(selected.createdAt).toLocaleString('en-IN')}</div>

                                {selected.reply && (
                                    <div style={styles.replySection}>
                                        <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#2E7D32', marginBottom: '8px' }}>✅ Your Reply:</h4>
                                        <p style={{ fontSize: '13px', color: '#555' }}>{selected.reply}</p>
                                    </div>
                                )}

                                {!selected.isReplied && (
                                    <div style={styles.replyBox}>
                                        <h4 style={styles.replyTitle}>Reply to {selected.name}</h4>
                                        <textarea
                                            style={styles.replyInput}
                                            placeholder="Type your reply..."
                                            value={reply}
                                            onChange={e => setReply(e.target.value)}
                                            rows={4}
                                        />
                                        <button style={styles.replyBtn} onClick={() => handleReply(selected._id)}>
                                            📤 Send Reply
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={styles.noSelect}>
                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>💬</div>
                                <p style={{ color: '#999' }}>Select a message to view</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    layout: { display: 'flex', minHeight: '100vh', background: '#F5F5F5' },
    content: { marginLeft: '240px', flex: 1 },
    inner: { padding: '28px' },
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' },
    statCard: { borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    statValue: { fontFamily: "'Georgia', serif", fontSize: '32px', fontWeight: '700', color: '#1A0A0A', marginBottom: '4px' },
    statLabel: { fontSize: '13px', color: '#757575' },
    filterRow: { display: 'flex', gap: '8px', marginBottom: '20px' },
    filterBtn: { padding: '8px 18px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', background: '#fff', color: '#555' },
    filterActive: { background: '#1A0A0A', color: '#fff', border: '1.5px solid #1A0A0A' },
    messagesLayout: { display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', height: '600px' },
    messagesList: { background: '#fff', borderRadius: '12px', overflow: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    messageItem: { padding: '14px 16px', borderBottom: '1px solid #F0F0F0', cursor: 'pointer' },
    msgName: { fontSize: '14px', fontWeight: '700', color: '#1A0A0A', marginBottom: '2px' },
    msgSubject: { fontSize: '12px', fontWeight: '600', color: '#555', marginBottom: '2px' },
    msgPreview: { fontSize: '12px', color: '#999', marginBottom: '6px' },
    msgMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    unreadDot: { width: '8px', height: '8px', background: '#8B1A1A', borderRadius: '50%' },
    messageDetail: { background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'auto' },
    detailHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
    detailName: { fontSize: '18px', fontWeight: '700', color: '#1A0A0A', marginBottom: '4px' },
    detailMeta: { fontSize: '13px', color: '#999' },
    deleteBtn: { background: '#FFEBEE', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#C62828' },
    detailSubject: { fontSize: '14px', fontWeight: '600', color: '#555', marginBottom: '12px', padding: '8px 12px', background: '#F5F5F5', borderRadius: '8px' },
    detailMsg: { fontSize: '14px', color: '#333', lineHeight: 1.7, marginBottom: '8px' },
    detailDate: { fontSize: '12px', color: '#999', marginBottom: '16px' },
    replySection: { background: '#F0FFF4', border: '1px solid #C3E6CB', borderRadius: '8px', padding: '14px', marginBottom: '16px' },
    replyBox: { borderTop: '1px solid #F0F0F0', paddingTop: '16px' },
    replyTitle: { fontSize: '14px', fontWeight: '700', color: '#1A0A0A', marginBottom: '10px' },
    replyInput: { width: '100%', padding: '10px 14px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', outline: 'none', fontFamily: 'sans-serif', boxSizing: 'border-box', resize: 'vertical', marginBottom: '10px' },
    replyBtn: { padding: '10px 24px', background: '#1A0A0A', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
    noSelect: { background: '#fff', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    empty: { textAlign: 'center', padding: '60px' }
};

export default Messages;