// Religion → Major Caste → Sub-Caste reference data for Tamil Nadu matrimony.
// Shared by the registration form and the Dashboard profile editor so the
// two never drift apart.

export const RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Jain', 'Buddhist', 'Sikh', 'Other'];

export const CASTE_DATA = {
    Hindu: {
        'Vanniyar': ['Padayachi', 'Vannia Kula Kshatriya', 'Gounder (Vanniya)', 'Naicker', 'Palli'],
        'Vellalar': ['Kongu Vellala Gounder', 'Thuluva Vellala', 'Saiva Vellalar', 'Sozhia Vellalar', 'Karkathar Vellalar', 'Nanjil Vellalar', 'Kodikkal Vellalar', 'Veerakodi Vellalar'],
        'Mukkulathor / Thevar': ['Agamudayar', 'Kallar', 'Maravar'],
        'Mudaliar / Pillai': ['Arcot Mudaliar', 'Thuluva Vellala Mudaliar', 'Saiva Mudaliar', 'Sengunthar / Kaikolar', 'Agamudaya Mudaliar', 'Tirunelveli Pillai', 'Nanjil Pillai'],
        'Chettiar': ['Nattukottai Chettiar (Nagarathar)', '24 Manai Telugu Chettiar (16 Manai / 8 Manai)', 'Devanga Chettiar', 'Ayira Vaisyar', 'Vellan Chettiar', 'Elur Chettiar'],
        'Nadar': ['Hindu Nadar', 'Gramani', 'Shanar'],
        'Tamil Brahmin (Iyer)': ['Vadama', 'Brahacharanam', 'Ashtasahasram', 'Vathima', 'Choziyar', 'Gurukkal'],
        'Tamil Brahmin (Iyengar)': ['Vadakalai', 'Thenkalai'],
        'Scheduled Castes / Adi Dravida': ['Adi Dravidar', 'Paraiyar', 'Devendra Kula Vellalar (Pallar)', 'Arunthathiyar', 'Chakkiliyan'],
        'Naidu / Nayakar': ['Kamma Naidu', 'Balija Naidu', 'Gavara', 'Vadugan', 'Thottia Naicker'],
        'Viswakarma': ['Achari', 'Kammalar', 'Thattan (Goldsmith)', 'Karumar (Blacksmith)', 'Thachar (Carpenter)'],
        'Yadhava': ['Konar', 'Idaiyar', 'Vaduga Ayar'],
        'Udayar': ['Parkavakulam', 'Moopanar', 'Nayanar'],
        'Muthuraja / Muthiraiyar': ['Muthuacha', 'Ambalakarar'],
        'Saurashtra': ['Saurashtra (Linguistic Minority)'],
        'Any Caste': ['Caste No Bar / Inter-Caste'],
        'Other': ['Other'],
    },
    Christian: {
        'Denomination Base': ['Roman Catholic (R.C.)', 'Church of South India (CSI)', 'Pentecostal', 'Asembly of God (A.G.)', 'Born Again', 'Marthoma', 'Syrian Catholic'],
        'Christian Nadar': ['Nadar (Christian)'],
        'Christian Vellalar': ['Pillai / Vellalar (Christian)'],
        'Other': ['Other'],
    },
    Muslim: {
        'Subgroup Base': ['Sunni', 'Shia', 'Labbai', 'Rawthar', 'Marakayar', 'Deccani'],
        'Other': ['Other'],
    },
    Jain: {
        'Tamil Jain': ['Digambar'],
        'Other': ['Other'],
    },
    Buddhist: {
        'Neo-Buddhist / Others': ['General'],
        'Other': ['Other'],
    },
    Sikh: {
        'Other': ['Other'],
    },
    Other: {
        'Other': ['Other'],
    },
};

// { religion: [majorCaste, majorCaste, ...] } — for the Caste dropdown
export const CASTES = Object.fromEntries(
    Object.entries(CASTE_DATA).map(([religion, castes]) => [religion, Object.keys(castes)])
);

// Sub-castes available for a given religion + major caste
export const getSubCastes = (religion, caste) => {
    return CASTE_DATA[religion]?.[caste] || [];
};
