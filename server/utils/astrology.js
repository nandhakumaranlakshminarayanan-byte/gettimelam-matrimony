const Astronomy = require('astronomy-engine');

// Standard order used throughout this app's dropdowns — keep in sync with
// client/src/pages/Horoscope/Horoscope.jsx and the Dashboard's Rasi field.
const RASI_NAMES = [
    'Mesham', 'Rishabam', 'Mithunam', 'Kadagam', 'Simmam', 'Kanni',
    'Thulam', 'Viruchigam', 'Dhanusu', 'Magaram', 'Kumbam', 'Meenam',
];

const NAKSHATRA_NAMES = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni',
    'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha',
    'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha',
    'Shravana', 'Dhanishtha', 'Shatabhisha', 'Purva Bhadrapada',
    'Uttara Bhadrapada', 'Revati',
];

/**
 * Lahiri (Chitrapaksha) Ayanamsa — the standard correction Vedic astrology
 * uses to convert a tropical (Western) zodiac position into the sidereal
 * position actual Rasi/Nakshatra are based on. It increases by about
 * 50.24 arcseconds per year due to the precession of the equinoxes.
 * This linear approximation is accurate to within a few arcminutes across
 * the 1900–2026 range this app needs — far tighter than the ~13°20'
 * width of a single Nakshatra, so it's more than precise enough here.
 */
function lahiriAyanamsa(date) {
    const daysSinceJ2000 = (date.getTime() - Date.UTC(2000, 0, 1, 12, 0, 0)) / 86400000;
    const years = daysSinceJ2000 / 365.25;
    return 23.85 + years * (50.2388475 / 3600);
}

/**
 * Calculates Rasi, Nakshatra, and Pada from a date + time of birth.
 * Assumes the time given is Indian Standard Time (UTC+5:30) unless a
 * different offset (in minutes) is passed — reasonable default for a
 * Tamil Nadu matrimony platform.
 *
 * @param {string} dateOfBirth - 'YYYY-MM-DD'
 * @param {string} timeOfBirth - 'HH:MM' (24-hour)
 * @param {number} utcOffsetMinutes - default 330 (IST)
 */
function calculateRasiNakshatra(dateOfBirth, timeOfBirth, utcOffsetMinutes = 330) {
    if (!dateOfBirth || !timeOfBirth) {
        throw new Error('Date and time of birth are required');
    }

    const [hh, mm] = timeOfBirth.split(':').map(Number);
    if (Number.isNaN(hh) || Number.isNaN(mm)) {
        throw new Error('Invalid time of birth');
    }

    const offsetSign = utcOffsetMinutes >= 0 ? '+' : '-';
    const absOffset = Math.abs(utcOffsetMinutes);
    const offsetH = String(Math.floor(absOffset / 60)).padStart(2, '0');
    const offsetM = String(absOffset % 60).padStart(2, '0');
    const isoLocal = `${dateOfBirth}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00${offsetSign}${offsetH}:${offsetM}`;

    const localDate = new Date(isoLocal);
    if (isNaN(localDate.getTime())) {
        throw new Error('Could not parse date/time of birth');
    }

    const time = new Astronomy.AstroTime(localDate);
    const eclip = Astronomy.EclipticGeoMoon(time);
    const tropicalLon = ((eclip.lon % 360) + 360) % 360;

    const ayanamsa = lahiriAyanamsa(localDate);
    const siderealLon = ((tropicalLon - ayanamsa) % 360 + 360) % 360;

    const rasiIndex = Math.floor(siderealLon / 30);
    const nakshatraSpan = 360 / 27;
    const nakshatraIndex = Math.floor(siderealLon / nakshatraSpan);
    const padaSpan = nakshatraSpan / 4;
    const pada = Math.floor((siderealLon % nakshatraSpan) / padaSpan) + 1;

    return {
        rasi: RASI_NAMES[rasiIndex],
        nakshatra: NAKSHATRA_NAMES[nakshatraIndex],
        pada,
        // included for transparency/debugging, not required by the UI
        siderealLongitude: Number(siderealLon.toFixed(2)),
    };
}

module.exports = { calculateRasiNakshatra, RASI_NAMES, NAKSHATRA_NAMES };
