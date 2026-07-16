import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000';

// Polls whether the member has an unread admin reply in their support
// chat, for showing a badge on the "Chat with Support" toggle button.
// Read-only — unlike GET /api/support/my, this never clears the flag,
// since the point is to show the badge BEFORE the widget is opened.
export function useSupportUnread() {
    const { user } = useAuth();
    const [unread, setUnread] = useState(false);

    useEffect(() => {
        if (!user) { setUnread(false); return; }
        const check = () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            axios.get(`${API}/api/support/my/unread-status`, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setUnread(!!res.data.unread))
                .catch(() => { });
        };
        check();
        const interval = setInterval(check, 30000);
        return () => clearInterval(interval);
    }, [user]);

    // Call this right after opening the widget, so the badge clears
    // immediately instead of waiting for the next poll.
    const clear = () => setUnread(false);

    return { unread, clear };
}
