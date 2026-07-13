// Tamil Nadu district list — now sourced from the full India dataset in
// indiaLocationData.js (which has the correct current 38 districts; this
// file previously had its own incomplete 18-district copy). Kept as a
// backward-compat re-export so anything still importing TN_DISTRICTS from
// here keeps working with the corrected list.
import { getDistrictsForState } from './indiaLocationData';

export const TN_DISTRICTS = getDistrictsForState('Tamil Nadu');
