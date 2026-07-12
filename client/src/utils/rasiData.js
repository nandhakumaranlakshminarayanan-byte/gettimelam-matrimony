// The 12 Rasis (zodiac signs) in each language, in the exact order used by
// server/utils/astrology.js's RASI_NAMES. `name` is the canonical value
// already used throughout this app (it's a Tamil-style Roman spelling —
// "Mesham", not "Aries" or "Mesha") — never change `name`, only translations.
//
// NOTE: unlike nakshatraData.js, this translation table was NOT supplied by
// the user — these are standard/well-known zodiac names in each language,
// compiled as a best effort. Worth a quick native-speaker check before
// relying on it for anything user-facing at scale, the same way you'd want
// to double check the Kannada column in nakshatraData.js.

export const RASIS = [
    { name: 'Mesham', sa: 'Mesha', hi: 'मेष', te: 'మేషం', kn: 'ಮೇಷ', ta: 'மேஷம்', ml: 'മേടം' },
    { name: 'Rishabam', sa: 'Vrishabha', hi: 'वृषभ', te: 'వృషభం', kn: 'ವೃಷಭ', ta: 'ரிஷபம்', ml: 'ഇടവം' },
    { name: 'Mithunam', sa: 'Mithuna', hi: 'मिथुन', te: 'మిథునం', kn: 'ಮಿಥುನ', ta: 'மிதுனம்', ml: 'മിഥുനം' },
    { name: 'Kadagam', sa: 'Karka', hi: 'कर्क', te: 'కర్కాటకం', kn: 'ಕರ್ಕ', ta: 'கடகம்', ml: 'കർക്കടകം' },
    { name: 'Simmam', sa: 'Simha', hi: 'सिंह', te: 'సింహం', kn: 'ಸಿಂಹ', ta: 'சிம்மம்', ml: 'ചിങ്ങം' },
    { name: 'Kanni', sa: 'Kanya', hi: 'कन्या', te: 'కన్య', kn: 'ಕನ್ಯಾ', ta: 'கன்னி', ml: 'കന്നി' },
    { name: 'Thulam', sa: 'Tula', hi: 'तुला', te: 'తుల', kn: 'ತುಲಾ', ta: 'துலாம்', ml: 'തുലാം' },
    { name: 'Viruchigam', sa: 'Vrishchika', hi: 'वृश्चिक', te: 'వృశ్చికం', kn: 'ವೃಶ್ಚಿಕ', ta: 'விருச்சிகம்', ml: 'വൃശ്ചികം' },
    { name: 'Dhanusu', sa: 'Dhanu', hi: 'धनु', te: 'ధనుస్సు', kn: 'ಧನು', ta: 'தனுசு', ml: 'ധനു' },
    { name: 'Magaram', sa: 'Makara', hi: 'मकर', te: 'మకరం', kn: 'ಮಕರ', ta: 'மகரம்', ml: 'മകരം' },
    { name: 'Kumbam', sa: 'Kumbha', hi: 'कुम्भ', te: 'కుంభం', kn: 'ಕುಂಭ', ta: 'கும்பம்', ml: 'കുംഭം' },
    { name: 'Meenam', sa: 'Meena', hi: 'मीन', te: 'మీనం', kn: 'ಮೀನ', ta: 'மீனம்', ml: 'മീനം' },
];

export const RASI_NAMES = RASIS.map(r => r.name);

// Mother-tongue string (as stored on the profile, e.g. "Tamil") -> which
// translation column to use. Languages not in this map (English, Urdu,
// Bengali, Marathi, or anything unset) fall back to the app's canonical
// name, same as today.
const LANG_TO_KEY = { Tamil: 'ta', Telugu: 'te', Kannada: 'kn', Malayalam: 'ml', Hindi: 'hi' };

export const getLocalizedRasi = (name, motherTongue) => {
    const key = LANG_TO_KEY[motherTongue];
    if (!key) return name;
    const r = RASIS.find(x => x.name === name);
    return r ? r[key] : name;
};
