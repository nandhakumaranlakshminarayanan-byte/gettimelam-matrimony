import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000';

// Fetches option values for a given category (religion, caste, subcaste,
// state, district, job, rasi, nakshatra, dosham, maritalstatus) from the
// admin-managed MasterOption system, instead of a static hardcoded list —
// so anything an admin adds/edits/removes on the Profile Options page
// shows up here immediately, no code change or redeploy needed.
//
// Three modes, controlled by how you call it:
//
//   Flat category (no cascade) — Religion, State, Rasi, Nakshatra, Dosham,
//   Marital Status, Job:
//     useOptions('religion')
//
//   Cascading, REQUIRES a parent to be selected first (District needs
//   State; Sub Caste needs Religion+Caste) — shows nothing until then,
//   matching what the dropdown already does when disabled:
//     useOptions('district', { parent: selectedState, requireParent: true })
//     useOptions('subcaste', { parent: `${religion}|${caste}`, requireParent: true })
//
//   Cascading, but falls back to "everything across all parents" when no
//   parent is chosen yet (Caste under Religion, when Religion is "Any"):
//     useOptions('caste', { parent: selectedReligion, allowAllWhenNoParent: true })
export function useOptions(category, { parent, requireParent = false, allowAllWhenNoParent = false } = {}) {
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (requireParent && !parent) {
            setOptions([]);
            return;
        }
        let cancelled = false;
        setLoading(true);
        const params = { category };
        if (parent) params.parent = parent;
        else if (!allowAllWhenNoParent) params.parent = ''; // flat/top-level category
        // else: omit parent entirely -> server returns every value for this
        // category regardless of parent (used for "Any Religion" showing
        // every caste across all religions)

        axios.get(`${API}/api/options`, { params })
            .then(res => { if (!cancelled) setOptions(res.data.options || []); })
            .catch(() => { if (!cancelled) setOptions([]); })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [category, parent, requireParent, allowAllWhenNoParent]);

    return { options, loading };
}
