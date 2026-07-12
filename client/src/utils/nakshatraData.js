// The 27 Nakshatras with their name in each language, in the exact order
// used by server/utils/astrology.js's NAKSHATRA_NAMES (so `name` below is
// always the canonical value stored on the profile / returned by the
// horoscope calculator — never change `name`, only translations).
//
// Source: user-supplied reference table for sa/hi/te/kn/ta/ml. Note the
// Kannada column matches the Sanskrit (Roman) column as given — that's the
// source data, not a bug here.
//
// `taRoman` (Tamil-style Roman transliteration, e.g. "Visaakam" for
// Vishakha/விசாகம்) was added on top of that per user request and is
// Claude-compiled, not user-supplied — same "worth a native-speaker check"
// caveat as the rest of this file's translations.

export const NAKSHATRAS = [
    { name: 'Ashwini', sa: 'Ashwini', hi: 'अश्विनी', te: 'అశ్విని', kn: 'Ashwini', ta: 'அசுவினி', taRoman: 'Asuvini', ml: 'അശ്വதി' },
    { name: 'Bharani', sa: 'Bharani', hi: 'भरणी', te: 'భరణి', kn: 'Bharani', ta: 'பரணி', taRoman: 'Parani', ml: 'ഭരണി' },
    { name: 'Krittika', sa: 'Krittika', hi: 'कृत्तिका', te: 'కృత్తిక', kn: 'Krittika', ta: 'கார்த்திகை', taRoman: 'Karthigai', ml: 'കാർത്തിക' },
    { name: 'Rohini', sa: 'Rohini', hi: 'रोहिणी', te: 'రోహిణి', kn: 'Rohini', ta: 'ரோகிணி', taRoman: 'Rohini', ml: 'രോഹിണി' },
    { name: 'Mrigashira', sa: 'Mrigashira', hi: 'मृगशिरा', te: 'మృగశిరా', kn: 'Mrigashira', ta: 'மிருகசிரிஷம்', taRoman: 'Mirugasirisham', ml: 'മകயിരം' },
    { name: 'Ardra', sa: 'Ardra', hi: 'आर्द्रा', te: 'ఆరుద్ర', kn: 'Ardra', ta: 'திருவாதிரை', taRoman: 'Thiruvathirai', ml: 'തിരുവാതിര' },
    { name: 'Punarvasu', sa: 'Punarvasu', hi: 'पुनर्वसु', te: 'పునర్వసు', kn: 'Punarvasu', ta: 'புனர்பூசம்', taRoman: 'Punarpoosam', ml: 'പുണർതം' },
    { name: 'Pushya', sa: 'Pushya', hi: 'पुष्य', te: 'పుష్యమి', kn: 'Pushya', ta: 'பூசம்', taRoman: 'Poosam', ml: 'പൂയം' },
    { name: 'Ashlesha', sa: 'Ashlesha', hi: 'आश्लेषा', te: 'ఆశ్లేష', kn: 'Ashlesha', ta: 'ஆயில்யம்', taRoman: 'Ayilyam', ml: 'ആയില്യം' },
    { name: 'Magha', sa: 'Magha', hi: 'मघा', te: 'మఘ', kn: 'Magha', ta: 'மகம்', taRoman: 'Magam', ml: 'മകം' },
    { name: 'Purva Phalguni', sa: 'Purva Phalguni', hi: 'पूर्व फाल्गुनी', te: 'పూర్వ ఫల్గుని', kn: 'Purva Phalguni', ta: 'பூரம்', taRoman: 'Puram', ml: 'പൂരം' },
    { name: 'Uttara Phalguni', sa: 'Uttara Phalguni', hi: 'उत्तर फाल्गुनी', te: 'ఉత్తర ఫల్గుని', kn: 'Uttara Phalguni', ta: 'உத்திரம்', taRoman: 'Uthiram', ml: 'ഉത്രം' },
    { name: 'Hasta', sa: 'Hasta', hi: 'हस्त', te: 'హస్త', kn: 'Hasta', ta: 'ஹஸ்தம்', taRoman: 'Hastham', ml: 'അത്തം' },
    { name: 'Chitra', sa: 'Chitra', hi: 'चित्रा', te: 'చిత్ర', kn: 'Chitra', ta: 'சித்திரை', taRoman: 'Chithirai', ml: 'ചിത്തിര' },
    { name: 'Swati', sa: 'Swati', hi: 'स्वाती', te: 'స్వాతి', kn: 'Swati', ta: 'சுவாதி', taRoman: 'Suvathi', ml: 'ചോതി' },
    { name: 'Vishakha', sa: 'Vishakha', hi: 'विशाखा', te: 'విశాఖ', kn: 'Vishakha', ta: 'விசாகம்', taRoman: 'Visaakam', ml: 'വിശാഖം' },
    { name: 'Anuradha', sa: 'Anuradha', hi: 'अनुराधा', te: 'అనూరాధ', kn: 'Anuradha', ta: 'அனுஷம்', taRoman: 'Anusham', ml: 'അനിഴം' },
    { name: 'Jyeshtha', sa: 'Jyeshtha', hi: 'ज्येष्ठा', te: 'జ్యేష్ఠ', kn: 'Jyeshtha', ta: 'கேட்டை', taRoman: 'Kettai', ml: 'കേട്ട' },
    { name: 'Mula', sa: 'Mula', hi: 'मूला', te: 'మూల', kn: 'Mula', ta: 'மூலம்', taRoman: 'Moolam', ml: 'മൂലം' },
    { name: 'Purva Ashadha', sa: 'Purva Ashadha', hi: 'पूर्वाषाढा', te: 'పూర్వాషాఢ', kn: 'Purva Ashadha', ta: 'பூராடம்', taRoman: 'Pooradam', ml: 'പൂരാടം' },
    { name: 'Uttara Ashadha', sa: 'Uttara Ashadha', hi: 'उत्तराषाढा', te: 'ఉత్తరాషాఢ', kn: 'Uttara Ashadha', ta: 'உத்திராடம்', taRoman: 'Uthiradam', ml: 'ഉത്രാടം' },
    { name: 'Shravana', sa: 'Shravana', hi: 'श्रवण', te: 'శ్రవణ', kn: 'Shravana', ta: 'திருவோணம்', taRoman: 'Thiruvonam', ml: 'തിരുവോണം' },
    { name: 'Dhanishtha', sa: 'Dhanishtha', hi: 'धनिष्ठा', te: 'ధనిష్ఠ', kn: 'Dhanishtha', ta: 'அவிட்டம்', taRoman: 'Avittam', ml: 'അവിട്ടം' },
    { name: 'Shatabhisha', sa: 'Shatabhisha', hi: 'शतभिषा', te: 'శతభిష', kn: 'Shatabhisha', ta: 'சதயம்', taRoman: 'Sathayam', ml: 'ചതயം' },
    { name: 'Purva Bhadrapada', sa: 'Purva Bhadrapada', hi: 'पूर्वभाद्रपदा', te: 'పూర్వాభాద్ర', kn: 'Purva Bhadrapada', ta: 'பூரட்டாதி', taRoman: 'Poorattathi', ml: 'പൂരുരുട്ടாതി' },
    { name: 'Uttara Bhadrapada', sa: 'Uttara Bhadrapada', hi: 'उत्तरभाद्रपदा', te: 'ఉత్తరాభాద్ర', kn: 'Uttara Bhadrapada', ta: 'உத்திரட்டாதி', taRoman: 'Uthirattathi', ml: 'ഉത്രട்ടாதி' },
    { name: 'Revati', sa: 'Revati', hi: 'रेवती', te: 'రేవతి', kn: 'Revati', ta: 'ரேவதி', taRoman: 'Revathi', ml: 'രേവதி' },
];

// Plain English/canonical names, in order — this is the array the astrology
// calculator and the DB both use as the actual stored value.
export const NAKSHATRA_NAMES = NAKSHATRAS.map(n => n.name);

// Mother-tongue string (as stored on the profile, e.g. "Tamil") -> which
// translation column to use. Languages not in this map (English, Urdu,
// Bengali, Marathi, or anything unset) fall back to the plain canonical
// name.
const LANG_TO_KEY = { Tamil: 'ta', Telugu: 'te', Kannada: 'kn', Malayalam: 'ml', Hindi: 'hi' };

// Display format: English name is ALWAYS shown first (the default), and —
// only when a translation is available for the mother tongue — the
// language-style name is appended after a "/". For Tamil specifically this
// includes the Roman transliteration too, e.g.:
//   "Vishakha / Visaakam (விசாகம்)"
// For languages where only the native script is available (Telugu, Kannada,
// Malayalam, Hindi — no verified Roman transliteration for those yet):
//   "Ashwini (అశ్విని)"
// With no mother tongue set, or a language with no data (English, Urdu,
// Bengali, Marathi), it's just the plain English name.
export const getLocalizedNakshatra = (name, motherTongue) => {
    const n = NAKSHATRAS.find(x => x.name === name);
    if (!n) return name;
    const key = LANG_TO_KEY[motherTongue];
    if (!key) return n.name;
    if (key === 'ta') return `${n.name} / ${n.taRoman} (${n.ta})`;
    return `${n.name} (${n[key]})`;
};

// Dropdown option label — same "English default" rule applies here, so the
// stored value (n.name) stays obvious even while browsing the list.
export const getNakshatraDropdownLabel = (name) => {
    const n = NAKSHATRAS.find(x => x.name === name);
    return n ? `${n.name} / ${n.taRoman} (${n.ta})` : name;
};
