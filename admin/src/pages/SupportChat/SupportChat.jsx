import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const SupportChat = () => {
    const [chats, setChats] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [activeChat, setActiveChat] = useState(null);
    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);
    const [filter, setFilter] = useState('all');
    const scrollRef = useRef(null);

    useEffect(() => { fetchChats(); fetchAdmins(); }, []);
    useEffect(() => { if (selectedId) fetchOneChat(selectedId); }, [selectedId]);
    useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [activeChat]);

    const fetchChats = async () => {
        try {
            const res = await API.get('/support/admin/all');
            setChats(res.data.chats || []);
        } catch (err) { toast.error('Failed to load support chats'); }
    };

    const fetchAdmins = async () => {
        try {
            const res = await API.get('/admin/admins');
            setAdmins((res.data.admins || []).filter(a => a.canHandleSupport));
        } catch (err) { }
    };

    const fetchOneChat = async (id) => {
        try {
            const res = await API.get(`/support/admin/${id}`);
            setActiveChat(res.data.chat);
            fetchChats();
        } catch (err) { }
    };

    const handleReply = async () => {
        if (!reply.trim() || sending) return;
        setSending(true);
        try {
            const res = await API.post(`/support/admin/${selectedId}/reply`, { text: reply.trim() });
            setActiveChat(res.data.chat);
            setReply('');
            fetchChats();
        } catch (err) {
            toast.error('Failed to send');
        } finally {
            setSending(false);
        }
    };

    const handleAssign = async (adminId) => {
        try {
            const res = await API.put(`/support/admin/${selectedId}/assign`, { adminId: adminId || null });
            setActiveChat(res.data.chat);
            toast.success(res.data.message);
            fetchChats();
        } catch (err) { toast.error('Failed to assign'); }
    };

    const handleClose = async () => {
        try {
            await API.put(`/support/admin/${selectedId}/close`);
            toast.success('Marked as resolved');
            fetchChats();
            fetchOneChat(selectedId);
        } catch (err) { toast.error('Failed'); }
    };

    const visibleChats = chats.filter(c => {
        if (filter === 'unread') return c.unreadByAdmin;
        if (filter === 'assigned') return !!c.assignedTo;
        if (filter === 'unassigned') return !c.assignedTo;
        return true;
    });

    return (
        <div style={styles.layout}>
            <Sidebar />
            <div style={styles.content}>
                <Navbar title="💬 Support Chat" />
                <div style={styles.inner}>
                    <div style={styles.grid}>

                        <div style={styles.listPanel}>
                            <div style={styles.filterRow}>
                                {['all', 'unread', 'unassigned', 'assigned'].map(f => (
                                    <button key={f}
                                        style={{ ...styles.filterBtn, ...(filter === f ? styles.filterBtnActive : {}) }}
                                        onClick={() => setFilter(f)}>
                                        {f === 'all' ? 'All' : f === 'unread' ? 'Unread' : f === 'unassigned' ? 'Unassigned' : 'Assigned'}
                                    </button>
                                ))}
                            </div>
                            <div style={styles.list}>
                                {visibleChats.map(c => (
                                    <div key={c._id}
                                        style={{ ...styles.listItem, ...(selectedId === c._id ? styles.listItemActive : {}) }}
                                        onClick={() => setSelectedId(c._id)}>
                                        <div style={styles.listItemTop}>
                                            <span style={styles.listItemName}>
                                                {c.user?.name || c.user?.businessName || 'User'}
                                            </span>
                                            {c.unreadByAdmin && <span style={styles.unreadDot} />}
                                        </div>
                                        <div style={styles.listItemMeta}>
                                            {c.user?.role === 'service' ? '🏪 Service Provider' : '👤 Member'}
                                            {c.assignedTo && ` · Assigned: ${c.assignedTo.name}`}
                                        </div>
                                        <div style={styles.listItemPreview}>
                                            {c.messages[c.messages.length - 1]?.text || 'No messages yet'}
                                        </div>
                                    </div>
                                ))}
                                {visibleChats.length === 0 && (
                                    <div style={styles.emptyList}>No conversations here</div>
                                )}
                            </div>
                        </div>

                        <div style={styles.chatPanel}>
                            {!activeChat ? (
                                <div style={styles.noSelection}>Select a conversation to view</div>
                            ) : (
                                <>
                                    <div style={styles.chatHeader}>
                                        <div>
                                            <div style={styles.chatHeaderName}>
                                                {activeChat.user?.name || activeChat.user?.businessName}
                                            </div>
                                            <div style={styles.chatHeaderMeta}>
                                                {activeChat.user?.mobile} · {activeChat.user?.role === 'service' ? 'Service Provider' : 'Member'}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <select
                                                style={styles.assignSelect}
                                                value={activeChat.assignedTo?._id || ''}
                                                onChange={e => handleAssign(e.target.value)}>
                                                <option value="">Unassigned</option>
                                                {admins.map(a => (
                                                    <option key={a._id} value={a._id}>{a.name}</option>
                                                ))}
                                            </select>
                                            {activeChat.status === 'open' ? (
                                                <button style={styles.resolveBtn} onClick={handleClose}>✓ Resolve</button>
                                            ) : (
                                                <span style={styles.resolvedTag}>Resolved</span>
                                            )}
                                        </div>
                                    </div>

                                    <div style={styles.messages} ref={scrollRef}>
                                        {activeChat.messages.map((m, i) => (
                                            <div key={i} style={{
                                                ...styles.bubble,
                                                ...(m.from === 'admin' ? styles.bubbleAdmin : styles.bubbleUser),
                                            }}>
                                                {m.text}
                                                <div style={styles.bubbleTime}>
                                                    {new Date(m.at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={styles.inputRow}>
                                        <input
                                            style={styles.input}
                                            placeholder="Type a reply..."
                                            value={reply}
                                            onChange={e => setReply(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleReply()}
                                        />
                                        <button style={styles.sendBtn} onClick={handleReply} disabled={sending}>
                                            {sending ? '...' : 'Send'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
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
    grid: { display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px', height: 'calc(100vh - 150px)' },
    listPanel: { background: '#fff', borderRadius: '12px', border: '1px solid #E0E0E0', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    filterRow: { display: 'flex', gap: '6px', padding: '12px', borderBottom: '1px solid #F0F0F0' },
    filterBtn: { padding: '6px 12px', border: '1px solid #E0E0E0', borderRadius: '20px', fontSize: '11.5px', fontWeight: '600', cursor: 'pointer', background: '#fff', color: '#666' },
    filterBtnActive: { background: '#1A0A0A', color: '#fff', border: '1px solid #1A0A0A' },
    list: { flex: 1, overflowY: 'auto' },
    listItem: { padding: '14px 16px', borderBottom: '1px solid #F5F5F5', cursor: 'pointer' },
    listItemActive: { background: '#FFF3E0' },
    listItemTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    listItemName: { fontWeight: '700', fontSize: '13.5px', color: '#1A0A0A' },
    unreadDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#E53935' },
    listItemMeta: { fontSize: '11px', color: '#999', margin: '3px 0' },
    listItemPreview: { fontSize: '12.5px', color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    emptyList: { textAlign: 'center', padding: '40px 16px', color: '#999', fontSize: '13px' },
    chatPanel: { background: '#fff', borderRadius: '12px', border: '1px solid #E0E0E0', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    noSelection: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '14px' },
    chatHeader: { padding: '16px 20px', borderBottom: '1px solid #F0F0F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    chatHeaderName: { fontWeight: '700', fontSize: '15px', color: '#1A0A0A' },
    chatHeaderMeta: { fontSize: '12px', color: '#999', marginTop: '2px' },
    assignSelect: { padding: '7px 10px', border: '1px solid #E0E0E0', borderRadius: '8px', fontSize: '12px' },
    resolveBtn: { padding: '7px 14px', background: '#E8F5E9', color: '#2E7D32', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
    resolvedTag: { padding: '7px 14px', background: '#F5F5F5', color: '#999', borderRadius: '8px', fontSize: '12px', fontWeight: '700' },
    messages: { flex: 1, overflowY: 'auto', padding: '20px', background: '#FAFAFA' },
    bubble: { maxWidth: '65%', padding: '10px 14px', borderRadius: '12px', fontSize: '13.5px', lineHeight: 1.5, marginBottom: '12px' },
    bubbleUser: { background: '#fff', border: '1px solid #E0E0E0', marginRight: 'auto', borderBottomLeftRadius: '3px' },
    bubbleAdmin: { background: '#1A0A0A', color: '#fff', marginLeft: 'auto', borderBottomRightRadius: '3px' },
    bubbleTime: { fontSize: '10px', opacity: 0.55, marginTop: '5px' },
    inputRow: { display: 'flex', gap: '8px', padding: '14px', borderTop: '1px solid #F0F0F0' },
    input: { flex: 1, padding: '10px 14px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '13px', outline: 'none' },
    sendBtn: { padding: '10px 20px', background: '#1A0A0A', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
};

export default SupportChat;
