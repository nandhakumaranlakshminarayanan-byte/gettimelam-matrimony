import React from 'react';

// Small hand-built line-icon set — avoids pulling in an icon library just
// for a dozen glyphs, and keeps the same "no new dependency" approach used
// for AvatarPlaceholder/BusinessPlaceholder. stroke="currentColor" so each
// icon just inherits color from its parent.
const PATHS = {
    grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
    briefcase: 'M4 8h16v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8zM8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M4 13h16',
    package: 'M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zM4 7.5l8 4.5 8-4.5M12 12v9',
    calendarCheck: 'M4 6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6zM4 10h16M8 3v4M16 3v4M9.5 15l1.8 1.8L15 13',
    clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3.5 2',
    settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 13a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V19a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.96 17.3a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 13a1.7 1.7 0 0 0-1.56-1.04H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 6.96a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 2.6a1.7 1.7 0 0 0 1.04-1.56V1a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15.04 2.6a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 7a1.7 1.7 0 0 0 1.56 1h.09a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1z',
    message: 'M4 5h16v11H8l-4 4V5z',
    logout: 'M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4M16 17l5-5-5-5M21 12H9',
    plus: 'M12 5v14M5 12h14',
    eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    star: 'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2z',
    gift: 'M4 9h16v11H4zM4 9V6a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v3M20 9V6a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v3M12 9v11M9 4c0-1.1.9-2 2-2 1.5 0 1 3 1 3s-.5-3 1-3c1.1 0 2 .9 2 2',
    edit: 'M4 20h4l11-11-4-4L4 16v4zM14 5l4 4',
    check: 'M4 12l6 6L20 6',
    store: 'M4 21V9M20 21V9M2 9l1.5-5h17L22 9M2 9h20M2 9v0a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0 3 3 3 3 0 0 0 3-3v0',
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.5-7 8-7s8 3 8 7',
    users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20c0-3.5 2.9-6 6.5-6s6.5 2.5 6.5 6M16.5 6a3 3 0 1 1 0 6M16.8 14c2.4.4 4.2 2.3 4.2 6',
    mapPin: 'M12 22s7-7.5 7-12a7 7 0 1 0-14 0c0 4.5 7 12 7 12zM12 13a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
};

const Icon = ({ name, size = 18, style = {} }) => {
    const d = PATHS[name];
    if (!d) return null;
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            style={{ display: 'block', flexShrink: 0, ...style }} aria-hidden="true">
            <path d={d} />
        </svg>
    );
};

export default Icon;
