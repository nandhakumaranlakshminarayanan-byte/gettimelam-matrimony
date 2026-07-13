import React from 'react';

/**
 * Futuristic line-icon set for the Gettimelam admin panel.
 * All icons are stroke-based and inherit color via `color` prop,
 * replacing the emoji icons used previously.
 */
const I = ({ children, size = 18, color = 'currentColor', sw = 1.7 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
        style={{ flexShrink: 0, display: 'block' }}>
        {children}
    </svg>
);

export const IconGrid = (p) => (<I {...p}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></I>);
export const IconUsers = (p) => (<I {...p}><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17" cy="9" r="2.5"/><path d="M17.5 14.5c2.4.4 4 2.2 4 5"/></I>);
export const IconIdCard = (p) => (<I {...p}><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><circle cx="8.5" cy="11" r="2"/><path d="M5.5 16.5c.5-1.6 1.7-2.5 3-2.5s2.5.9 3 2.5"/><path d="M14 9.5h5M14 12.5h5M14 15.5h3"/></I>);
export const IconCalendar = (p) => (<I {...p}><rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3 10h18"/></I>);
export const IconCard = (p) => (<I {...p}><rect x="2.5" y="5.5" width="19" height="13" rx="2.5"/><path d="M2.5 10h19M6 15h4"/></I>);
export const IconHeart = (p) => (<I {...p}><path d="M12 20.5C7 16.5 3.5 13.4 3.5 9.7 3.5 7 5.6 5 8.1 5c1.6 0 3 .8 3.9 2.1C12.9 5.8 14.3 5 15.9 5c2.5 0 4.6 2 4.6 4.7 0 3.7-3.5 6.8-8.5 10.8z"/></I>);
export const IconChart = (p) => (<I {...p}><path d="M3.5 20.5h17"/><path d="M6.5 16v-4M11 16V7.5M15.5 16v-6M20 16V5"/></I>);
export const IconBell = (p) => (<I {...p}><path d="M18 15.5v-5a6 6 0 10-12 0v5L4.5 18h15z"/><path d="M10 20.5a2 2 0 004 0"/></I>);
export const IconImage = (p) => (<I {...p}><rect x="3" y="4.5" width="18" height="15" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M3.5 17l5-5 4 4 3-3 5 5"/></I>);
export const IconLayers = (p) => (<I {...p}><path d="M12 3.5l9 4.5-9 4.5-9-4.5z"/><path d="M4 12.5l8 4 8-4"/><path d="M4 16.5l8 4 8-4"/></I>);
export const IconChat = (p) => (<I {...p}><path d="M21 12a8 8 0 01-8 8c-1.4 0-2.8-.3-4-.9L3.5 20.5l1.4-4.5A8 8 0 1121 12z"/></I>);
export const IconStore = (p) => (<I {...p}><path d="M4 9.5L5.5 4h13L20 9.5"/><path d="M4 9.5a2.6 2.6 0 005.3 0 2.6 2.6 0 005.4 0 2.6 2.6 0 005.3 0"/><path d="M5 12v8h14v-8"/><path d="M9.5 20v-5h5v5"/></I>);
export const IconShield = (p) => (<I {...p}><path d="M12 3l7.5 3v5.5c0 4.6-3.1 7.8-7.5 9.5-4.4-1.7-7.5-4.9-7.5-9.5V6z"/><path d="M9 12l2.2 2.2L15.5 10"/></I>);
export const IconGlobe = (p) => (<I {...p}><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.4 3.8 5.3 3.8 8.5s-1.3 6.1-3.8 8.5c-2.5-2.4-3.8-5.3-3.8-8.5s1.3-6.1 3.8-8.5z"/></I>);
export const IconLogout = (p) => (<I {...p}><path d="M9 4.5H6A2.5 2.5 0 003.5 7v10A2.5 2.5 0 006 19.5h3"/><path d="M15 8l4 4-4 4M19 12H9.5"/></I>);
export const IconCheck = (p) => (<I {...p}><path d="M4.5 12.5l5 5 10-11"/></I>);
export const IconX = (p) => (<I {...p}><path d="M5.5 5.5l13 13M18.5 5.5l-13 13"/></I>);
export const IconTrash = (p) => (<I {...p}><path d="M4 6.5h16M9.5 6V4.5A1.5 1.5 0 0111 3h2a1.5 1.5 0 011.5 1.5V6"/><path d="M6 6.5l1 13A2 2 0 009 21.5h6a2 2 0 002-2l1-13"/><path d="M10 10.5v7M14 10.5v7"/></I>);
export const IconClock = (p) => (<I {...p}><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3.5 2.5"/></I>);
export const IconBan = (p) => (<I {...p}><circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/></I>);
export const IconSliders = (p) => (<I {...p}><path d="M4 6.5h9M17 6.5h3M4 17.5h3M11 17.5h9"/><circle cx="15" cy="6.5" r="2"/><circle cx="7" cy="17.5" r="2"/></I>);

export default {
    IconGrid, IconUsers, IconIdCard, IconCalendar, IconCard, IconHeart,
    IconChart, IconBell, IconImage, IconLayers, IconChat, IconStore,
    IconShield, IconGlobe, IconLogout, IconCheck, IconX, IconTrash,
    IconClock, IconBan,
};
