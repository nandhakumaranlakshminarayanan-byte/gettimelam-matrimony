const MasterOption = require('../models/MasterOption');

// ── Public: used by Register/Dashboard/Browse to populate dropdowns ──

// GET /api/options?category=caste&parent=Hindu
const getOptions = async (req, res) => {
    try {
        const { category, parent } = req.query;
        if (!category) return res.status(400).json({ success: false, message: 'category is required' });

        const filter = { category, isActive: true };
        // parent=null (as a literal string) is how the frontend asks for
        // top-level flat options; parent omitted entirely means "don't
        // filter by parent" — only used for categories that don't cascade.
        if (parent !== undefined) filter.parent = parent || null;

        const options = await MasterOption.find(filter).select('value -_id').sort('value');
        res.json({ success: true, options: options.map(o => o.value) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/options/suggest — a member picked "Other" and typed a value.
// No auth required (Register.jsx submits before the session is fully live
// in some flows), but accepts an optional name for admin's display.
const suggestOption = async (req, res) => {
    try {
        const { category, value, parent, suggestedByName } = req.body;
        if (!category || !value || !value.trim()) {
            return res.status(400).json({ success: false, message: 'category and value are required' });
        }
        const normalizedParent = parent || null;

        // Idempotent: if this exact suggestion (or an already-approved
        // option with the same value) exists, don't create a duplicate.
        const existing = await MasterOption.findOne({ category, parent: normalizedParent, value: value.trim() });
        if (existing) return res.json({ success: true, message: 'Already noted', duplicate: true });

        await MasterOption.create({
            category, value: value.trim(), parent: normalizedParent,
            isActive: false, source: 'user_suggested',
            suggestedByUser: req.user?.id || null,
            suggestedByName: suggestedByName || null,
        });
        res.status(201).json({ success: true, message: 'Suggestion recorded' });
    } catch (error) {
        // Duplicate key race (two people typing the same new value at once)
        // — not an error the member needs to see.
        if (error.code === 11000) return res.json({ success: true, message: 'Already noted', duplicate: true });
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── Admin ──

// GET /admin/options?category=caste&parent=Hindu&status=active|pending|all
const adminListOptions = async (req, res) => {
    try {
        const { category, parent, status = 'active' } = req.query;
        if (!category) return res.status(400).json({ success: false, message: 'category is required' });

        const filter = { category };
        if (parent !== undefined) filter.parent = parent || null;
        if (status === 'active') filter.isActive = true;
        else if (status === 'pending') filter.isActive = false;
        // status === 'all' -> no isActive filter

        const options = await MasterOption.find(filter).sort(status === 'pending' ? '-createdAt' : 'value');
        res.json({ success: true, options });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /admin/options/pending-count — small helper for a sidebar badge
const adminPendingCount = async (req, res) => {
    try {
        const count = await MasterOption.countDocuments({ isActive: false });
        res.json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /admin/options
const adminCreateOption = async (req, res) => {
    try {
        const { category, value, parent } = req.body;
        if (!category || !value || !value.trim()) {
            return res.status(400).json({ success: false, message: 'category and value are required' });
        }
        const option = await MasterOption.create({
            category, value: value.trim(), parent: parent || null, isActive: true, source: 'admin',
        });
        res.status(201).json({ success: true, option });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ success: false, message: 'That value already exists for this category/parent' });
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /admin/options/:id — rename an existing option
const adminUpdateOption = async (req, res) => {
    try {
        const { value } = req.body;
        const option = await MasterOption.findByIdAndUpdate(
            req.params.id, { value: value?.trim() }, { new: true }
        );
        if (!option) return res.status(404).json({ success: false, message: 'Option not found' });
        res.json({ success: true, option });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /admin/options/:id/approve — a pending "Other" suggestion becomes a
// real option, live in every dropdown immediately.
const adminApproveOption = async (req, res) => {
    try {
        const option = await MasterOption.findByIdAndUpdate(
            req.params.id, { isActive: true }, { new: true }
        );
        if (!option) return res.status(404).json({ success: false, message: 'Option not found' });
        res.json({ success: true, message: `"${option.value}" is now a live option`, option });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /admin/options/:id — removes an option entirely (used both to
// reject a pending suggestion and to delete an existing approved option).
const adminDeleteOption = async (req, res) => {
    try {
        const option = await MasterOption.findByIdAndDelete(req.params.id);
        if (!option) return res.status(404).json({ success: false, message: 'Option not found' });
        res.json({ success: true, message: 'Removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getOptions, suggestOption,
    adminListOptions, adminPendingCount, adminCreateOption, adminUpdateOption, adminApproveOption, adminDeleteOption,
};
