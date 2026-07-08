/**
 * One-time seed script for homepage Service Cards.
 *
 * 1. Existing cards without a category get one auto-assigned by keyword
 *    matching on their name (e.g. "DJ service" → "DJ & Entertainment").
 * 2. Any of the 19 service categories that still has no card gets a new
 *    card created with a default name, description, glow color, and order.
 *    Images are left empty — upload them later from the admin panel.
 *
 * Run from the server folder:   node seedServiceCards.js
 * Safe to run multiple times — it never duplicates.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const ServiceCard = require('./models/ServiceCard');

// Must match the category IDs on the client Services page exactly
const CATEGORIES = [
    { category: 'Wedding Hall/Venue', name: 'Wedding Hall', glow: '#DF9B08', desc: 'Premium marriage halls, mahals & venues with live availability' },
    { category: 'Photography', name: 'Photography', glow: '#C97B2E', desc: 'Top-rated wedding photographers for every budget' },
    { category: 'Videography', name: 'Videography', glow: '#7B5CC9', desc: 'Cinematic wedding films, drone shoots & live streaming' },
    { category: 'Catering', name: 'Catering', glow: '#8FAE5A', desc: 'Traditional & modern catering for all group sizes' },
    { category: 'Event Decoration', name: 'Decorations', glow: '#C9668E', desc: 'Floral, thematic & traditional stage decorations' },
    { category: 'Wedding Rentals', name: 'Wedding Rentals', glow: '#B5471B', desc: 'Chairs, lighting, furniture & everything on rent' },
    { category: 'DJ & Entertainment', name: 'DJ & Entertainment', glow: '#7B5CC9', desc: 'Live music, DJ & nadaswaram services for your big day' },
    { category: 'Choreography', name: 'Choreography', glow: '#C9668E', desc: 'Sangeet & reception dance choreography for families' },
    { category: 'Bridal Makeup & Hair', name: 'Bridal Makeup', glow: '#C9668E', desc: 'Professional bridal makeup & hair styling artists' },
    { category: 'Mehndi Artist', name: 'Mehndi Artist', glow: '#8FAE5A', desc: 'Traditional & designer mehndi for brides and families' },
    { category: 'Bridal Styling', name: 'Bridal Styling', glow: '#DF9B08', desc: 'Saree draping, costume & complete bridal styling' },
    { category: 'Wedding Planner', name: 'Event Organizer', glow: '#B5471B', desc: 'Complete event management & wedding planning' },
    { category: 'Travel & Accommodation', name: 'Travel & Stay', glow: '#DF9B08', desc: 'Bridal cars, guest transport & accommodation' },
    { category: 'Officiant/Priest', name: 'Priest Services', glow: '#C97B2E', desc: 'Experienced priests & officiants for all traditions' },
    { category: 'Security & Valet', name: 'Security & Valet', glow: '#B5471B', desc: 'Professional security & valet parking services' },
    { category: 'Wedding Cake', name: 'Wedding Cake', glow: '#C9668E', desc: 'Custom wedding cakes & dessert counters' },
    { category: 'Favors & Gifts', name: 'Favors & Gifts', glow: '#8FAE5A', desc: 'Return gifts & wedding favors for your guests' },
    { category: 'Stationery & Cards', name: 'Invitations & Cards', glow: '#C97B2E', desc: 'Wedding invitations, cards & stationery design' },
    { category: 'Other', name: 'More Services', glow: '#DF9B08', desc: 'Mehendi, honeymoon packages & much more' },
];

// Keywords for auto-assigning categories to existing cards (checked in order)
const KEYWORDS = [
    ['Mehndi Artist', ['mehndi', 'mehendi', 'henna']],
    ['Bridal Makeup & Hair', ['makeup', 'make up', 'make-up']],
    ['Bridal Styling', ['styling', 'stylist']],
    ['Videography', ['video']],
    ['Photography', ['photo']],
    ['Wedding Hall/Venue', ['hall', 'venue', 'mahal', 'mandapam']],
    ['Catering', ['cater', 'food', 'buffet']],
    ['Event Decoration', ['decor', 'flower', 'floral']],
    ['Wedding Rentals', ['rental', 'rent']],
    ['DJ & Entertainment', ['dj', 'entertain', 'band', 'music', 'orchestra']],
    ['Choreography', ['choreo', 'dance']],
    ['Wedding Planner', ['planner', 'organis', 'organiz', 'management']],
    ['Travel & Accommodation', ['travel', 'transport', 'car', 'bus', 'stay', 'accommodation']],
    ['Officiant/Priest', ['priest', 'officiant', 'purohit', 'iyer']],
    ['Security & Valet', ['security', 'valet']],
    ['Wedding Cake', ['cake', 'dessert']],
    ['Favors & Gifts', ['favor', 'favour', 'gift']],
    ['Stationery & Cards', ['invitation', 'card', 'stationery']],
];

const guessCategory = (name) => {
    const n = (name || '').toLowerCase();
    for (const [category, words] of KEYWORDS) {
        if (words.some(w => n.includes(w))) return category;
    }
    return '';
};

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // 1) Fix existing cards that have no category
        const existing = await ServiceCard.find();
        for (const card of existing) {
            if (!card.category) {
                const guess = guessCategory(card.name);
                if (guess) {
                    card.category = guess;
                    await card.save();
                    console.log(`🔗 "${card.name}" → linked to "${guess}"`);
                } else {
                    console.log(`⚠️  "${card.name}" — could not guess a category, set it manually in admin`);
                }
            }
        }

        // 2) Create cards for categories that don't have one yet
        const cardsNow = await ServiceCard.find();
        const covered = new Set(cardsNow.map(c => c.category).filter(Boolean));
        let created = 0;
        for (let i = 0; i < CATEGORIES.length; i++) {
            const c = CATEGORIES[i];
            if (!covered.has(c.category)) {
                await ServiceCard.create({
                    name: c.name,
                    description: c.desc,
                    glow: c.glow,
                    category: c.category,
                    order: i,
                    image: '',       // upload from admin panel later
                    isActive: true,
                });
                created++;
                console.log(`➕ Created "${c.name}" (${c.category})`);
            }
        }

        const total = await ServiceCard.countDocuments();
        console.log(`\n🎉 Done! ${created} new cards created, ${total} total service cards.`);
        console.log('   Upload images for each card from Admin → Service Cards.');
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
    } finally {
        await mongoose.disconnect();
    }
})();