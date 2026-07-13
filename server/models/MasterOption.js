const mongoose = require('mongoose');

// One collection backs every admin-manageable dropdown in the app:
// Religion, Caste, Sub Caste, State, District, Job/Occupation, Rasi,
// Nakshatra, Dosham, Marital Status. Cascading fields (Caste under
// Religion, Sub Caste under Caste, District under State) use `parent` to
// scope which options apply to which parent selection.
//
// The same model doubles as the "Other" review queue: when a member types
// a custom value, it's saved here with isActive:false — invisible to every
// dropdown until an admin approves it, at which point it's live everywhere
// immediately (no separate "promote" step or data copy).
const masterOptionSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['religion', 'caste', 'subcaste', 'state', 'district', 'job', 'rasi', 'nakshatra', 'dosham', 'maritalstatus'],
    },
    value: { type: String, required: true, trim: true },
    // Cascading parent:
    //   caste     -> parent = religion name (e.g. "Hindu")
    //   subcaste  -> parent = "religion|caste" (e.g. "Hindu|Vanniyar") —
    //                needs both because caste names like "Other" repeat
    //                across multiple religions, so caste name alone would
    //                be ambiguous
    //   district  -> parent = state name (e.g. "Tamil Nadu")
    //   everything else (religion, state, job, rasi, nakshatra, dosham,
    //   maritalstatus) -> parent = null, flat list
    parent: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    source: { type: String, enum: ['seed', 'admin', 'user_suggested'], default: 'admin' },
    suggestedByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    // Snapshot of who suggested it, so admin still sees a name even if the
    // user account is later deleted.
    suggestedByName: { type: String, default: null },
}, { timestamps: true });

masterOptionSchema.index({ category: 1, parent: 1, value: 1 }, { unique: true });

module.exports = mongoose.model('MasterOption', masterOptionSchema);
