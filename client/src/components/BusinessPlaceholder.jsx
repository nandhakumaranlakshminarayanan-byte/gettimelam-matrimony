import React from 'react';

// Generic storefront icon shown when a service/business has no uploaded
// photo or logo — replaces the 🏪 emoji fallback that was showing on
// vendor cards and the dashboard sidebar.
//
// variant="card" (default): translucent white silhouette, no background —
// for the big dark gradient photo boxes (vendor teaser/browse cards),
// matching AvatarPlaceholder's card variant so vendor and member cards
// read as a consistent pair.
//
// variant="badge": small circle with a gold background — for compact
// contexts on light backgrounds, like the dashboard sidebar.
const BusinessPlaceholder = ({ size = 60, variant = 'card', style = {} }) => {
    if (variant === 'badge') {
        return (
            <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block', borderRadius: '50%', flexShrink: 0, ...style }}>
                <circle cx="50" cy="50" r="50" fill="#FFF3D0" />
                <path d="M22 45 L26 25 L74 25 L78 45 Z" fill="#C98F12" />
                <rect x="24" y="45" width="52" height="34" rx="3" fill="#E3AC2A" />
                <rect x="44" y="58" width="12" height="21" fill="#FFF3D0" />
                <rect x="30" y="52" width="10" height="10" fill="#FFF3D0" />
                <rect x="60" y="52" width="10" height="10" fill="#FFF3D0" />
            </svg>
        );
    }

    return (
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block', flexShrink: 0, ...style }}>
            <path d="M18 40 L23 16 L77 16 L82 40 Z" fill="rgba(255,255,255,0.22)" />
            <rect x="21" y="40" width="58" height="45" rx="3" fill="rgba(255,255,255,0.3)" />
            <rect x="44" y="56" width="12" height="29" fill="rgba(255,255,255,0.5)" />
            <rect x="27" y="48" width="12" height="12" fill="rgba(255,255,255,0.5)" />
            <rect x="61" y="48" width="12" height="12" fill="rgba(255,255,255,0.5)" />
        </svg>
    );
};

export default BusinessPlaceholder;
