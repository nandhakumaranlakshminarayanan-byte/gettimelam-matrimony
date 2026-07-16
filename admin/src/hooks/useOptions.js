import { useState, useEffect } from 'react';
import API from '../utils/api';

// Same idea as the client app's useOptions hook — fetches live values from
// the admin-managed Profile Options system, so the admin Edit Profile
// modal only offers valid taxonomy values (preventing exactly the kind of
// mismatch that broke Browse filtering — e.g. someone's caste being
// hand-typed as "Naicker/Vanniya Kula Kshatriyar" instead of the real
// "Vanniyar" option).
//
//   Flat category: useOptions('religion')
//   Requires a parent to be selected first: useOptions('district', { parent: state, requireParent: true })
//   Falls back to "everything" when no parent chosen: useOptions('caste', { parent: religion, allowAllWhenNoParent: true })
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
        else if (!allowAllWhenNoParent) params.parent = '';

        API.get('/options', { params })
            .then(res => { if (!cancelled) setOptions(res.data.options || []); })
            .catch(() => { if (!cancelled) setOptions([]); })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [category, parent, requireParent, allowAllWhenNoParent]);

    return { options, loading };
}
