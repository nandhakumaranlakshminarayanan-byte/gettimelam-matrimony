import React from 'react';

// Generic silhouette icon shown when a profile has no uploaded photo —
// replaces the 👩/👨 emoji fallback that was showing everywhere.
//
// variant="badge" (default): small colored circle badge — for compact
// contexts like list rows and sidebars, on light backgrounds.
//
// variant="card": large, no background circle, translucent white
// silhouette — for the big dark gradient photo boxes on Home/Browse
// cards, where a small floating badge looked disconnected from the box.
const AvatarPlaceholder = ({ gender, size = 60, variant = 'badge', style = {} }) => {
    const isFemale = gender === 'Female';

    if (variant === 'card') {
        return (
            <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block', flexShrink: 0, ...style }}>
                <path d="M10 105 C10 72 28 55 50 55 C72 55 90 72 90 105 Z" fill="rgba(255,255,255,0.22)" />
                <circle cx="50" cy="40" r="24" fill="rgba(255,255,255,0.3)" />
            </svg>
        );
    }

    const bg = isFemale ? '#F6DCE4' : '#DCE6F2';
    const skin = '#E4E4E4';
    const hair = isFemale ? '#8B5E4A' : '#5A4A3A';
    const shoulders = isFemale ? '#C98CA0' : '#7C93AD';

    return (
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block', borderRadius: '50%', flexShrink: 0, ...style }}>
            <circle cx="50" cy="50" r="50" fill={bg} />
            <path d="M18 100 C18 76 32 62 50 62 C68 62 82 76 82 100 Z" fill={shoulders} />
            <circle cx="50" cy="42" r="20" fill={skin} />
            {isFemale ? (
                <>
                    <path d="M28 44 C28 25 37 14 50 14 C63 14 72 25 72 44 C68 35 62 32 56 31 C53 30 50 32 50 32 C50 32 47 30 44 31 C38 32 32 35 28 44 Z" fill={hair} />
                    <path d="M27 40 C24 48 25 58 30 64 L32 64 L32 40 Z" fill={hair} />
                    <path d="M73 40 C76 48 75 58 70 64 L68 64 L68 40 Z" fill={hair} />
                </>
            ) : (
                <path d="M30 38 C30 22 38 15 50 15 C62 15 70 24 69 36 C65 30 58 33 52 31 C46 29 40 32 34 37 C32 35 30 37 30 38 Z" fill={hair} />
            )}
        </svg>
    );
};

export default AvatarPlaceholder;
