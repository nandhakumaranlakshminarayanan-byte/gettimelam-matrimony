import React from 'react';

/**
 * Custom flat-style SVG icons replacing the emoji previously used on the
 * homepage Services grid. Each icon mirrors the concept of the emoji it
 * replaces (🏛️ 📸 🍽️ 🚌 🎪 💐 🎵 ✨) but renders consistently across every
 * OS/browser and matches the site's maroon/gold palette instead of relying
 * on the system emoji font.
 *
 * `color` sets the accent stroke/fill so each icon can pick up the card's
 * existing background tint.
 */

const base = {
    width: 32,
    height: 32,
    viewBox: '0 0 32 32',
    fill: 'none',
};

export const WeddingHallIcon = ({ color = '#DF9B08' }) => (
    <svg {...base}>
        <path d="M16 3L27 10H5L16 3Z" fill={color} />
        <rect x="5" y="12" width="2.4" height="13" fill={color} />
        <rect x="10.3" y="12" width="2.4" height="13" fill={color} />
        <rect x="14.8" y="12" width="2.4" height="13" fill={color} />
        <rect x="19.3" y="12" width="2.4" height="13" fill={color} />
        <rect x="24.6" y="12" width="2.4" height="13" fill={color} />
        <rect x="4" y="26" width="24" height="2.4" fill={color} />
    </svg>
);

export const PhotographyIcon = ({ color = '#DF9B08' }) => (
    <svg {...base}>
        <rect x="4" y="9" width="24" height="17" rx="3" fill={color} />
        <path d="M11 9L13.2 5.5H18.8L21 9H11Z" fill={color} />
        <circle cx="16" cy="18" r="6" fill="#FFF8E1" />
        <circle cx="16" cy="18" r="3.2" fill={color} />
        <circle cx="23.5" cy="13" r="1.2" fill="#FFF8E1" />
    </svg>
);

export const CateringIcon = ({ color = '#DF9B08' }) => (
    <svg {...base}>
        <ellipse cx="16" cy="17" rx="12" ry="4.5" fill={color} />
        <ellipse cx="16" cy="16" rx="9.4" ry="3.4" fill="#F1F8E9" />
        <path d="M16 5C11.5 5 8.5 8.5 8.5 12.5H23.5C23.5 8.5 20.5 5 16 5Z" fill={color} />
        <rect x="14.6" y="1.5" width="2.8" height="4" rx="1.2" fill={color} />
        <rect x="4" y="24.5" width="24" height="2.4" rx="1.2" fill={color} />
    </svg>
);

export const TransportIcon = ({ color = '#DF9B08' }) => (
    <svg {...base}>
        <rect x="3" y="9" width="26" height="13" rx="3" fill={color} />
        <rect x="5.5" y="11.5" width="7" height="5" rx="1" fill="#FFF9E6" />
        <rect x="14" y="11.5" width="7" height="5" rx="1" fill="#FFF9E6" />
        <rect x="23" y="11.5" width="3.5" height="5" rx="1" fill="#FFF9E6" />
        <circle cx="9" cy="24" r="2.6" fill="#5F0909" />
        <circle cx="23" cy="24" r="2.6" fill="#5F0909" />
    </svg>
);

export const EventOrganizerIcon = ({ color = '#DF9B08' }) => (
    <svg {...base}>
        <path d="M16 3L27 14H5L16 3Z" fill={color} />
        <rect x="14.6" y="14" width="2.8" height="12" fill={color} />
        <path d="M8 26L14.6 20V26H8Z" fill={color} />
        <path d="M24 26L17.4 20V26H24Z" fill={color} />
        <rect x="4" y="26" width="24" height="2.2" fill={color} />
    </svg>
);

export const DecorationsIcon = ({ color = '#DF9B08' }) => (
    <svg {...base}>
        <circle cx="16" cy="10" r="5.2" fill={color} />
        <circle cx="8" cy="15" r="4.4" fill={color} opacity="0.85" />
        <circle cx="24" cy="15" r="4.4" fill={color} opacity="0.85" />
        <circle cx="16" cy="12.5" r="2.6" fill="#FFF3E0" />
        <path d="M16 17V28" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M16 22C13.5 22 12 23.4 12 25" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
);

export const MusicIcon = ({ color = '#DF9B08' }) => (
    <svg {...base}>
        <circle cx="9" cy="24" r="3.4" fill={color} />
        <circle cx="21" cy="21" r="3.4" fill={color} />
        <path d="M12 24V6.5L24 4V21" stroke={color} strokeWidth="2.4" strokeLinecap="round" fill="none" />
    </svg>
);

export const MoreServicesIcon = ({ color = '#DF9B08' }) => (
    <svg {...base}>
        <path d="M16 3L18.2 12.8L28 15L18.2 17.2L16 27L13.8 17.2L4 15L13.8 12.8L16 3Z" fill={color} />
        <path d="M25 3L25.9 6.6L29.5 7.5L25.9 8.4L25 12L24.1 8.4L20.5 7.5L24.1 6.6L25 3Z" fill={color} opacity="0.7" />
    </svg>
);

export default {
    WeddingHallIcon,
    PhotographyIcon,
    CateringIcon,
    TransportIcon,
    EventOrganizerIcon,
    DecorationsIcon,
    MusicIcon,
    MoreServicesIcon,
};
