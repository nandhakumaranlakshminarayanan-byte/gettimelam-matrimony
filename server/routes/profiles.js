const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Tesseract = require('tesseract.js');
const Profile = require('../models/Profile');
const {
    createProfile, getProfiles, getProfileById,
    updateProfile, getMyProfile, getSuggestedMatches, submitAadhar,
} = require('../controllers/profileController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

// ── Storage config ──
const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, 'uploads/'); },
    filename: function (req, file, cb) {
        cb(null, `photo_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        const types = /jpeg|jpg|png|webp/;
        const valid = types.test(path.extname(file.originalname).toLowerCase());
        if (valid) cb(null, true);
        else cb(new Error('Only image files allowed!'));
    }
});

// Aadhar/Horoscope documents are commonly PDF scans, not just photos —
// separate multer instance so the profile-photo uploader stays image-only.
const docStorage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, 'uploads/'); },
    filename: function (req, file, cb) {
        cb(null, `doc_${Date.now()}${path.extname(file.originalname)}`);
    }
});
const uploadDoc = multer({
    storage: docStorage,
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        const types = /jpeg|jpg|png|webp|pdf/;
        const valid = types.test(path.extname(file.originalname).toLowerCase());
        if (valid) cb(null, true);
        else cb(new Error('Only image or PDF files allowed!'));
    }
});

// ── Profile routes ──
router.get('/', protect, getProfiles);
router.post('/', protect, createProfile);
router.get('/my', protect, getMyProfile);
router.get('/suggested', protect, getSuggestedMatches);
router.put('/aadhar', protect, submitAadhar);

// ✅ Upload routes BEFORE /:id
router.post('/upload-photo', protect, upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        const photoUrl = `/uploads/${req.file.filename}`;
        const updated = await Profile.findOneAndUpdate(
            { user: req.user.id },
            { photo: photoUrl },
            { new: true }
        );
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Profile not found — create your profile first' });
        }
        res.json({
            success: true,
            photoUrl,
            fullUrl: `http://localhost:5000${photoUrl}`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ Upload multiple photos (up to 15)
router.post('/upload-photos', protect, upload.array('photos', 15), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }
        const photoUrls = req.files.map(f => `/uploads/${f.filename}`);
        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile) {
            return res.status(404).json({ success: false, message: 'Create your profile first!' });
        }
        const existingPhotos = profile.photos || [];
        const totalPhotos = existingPhotos.length + photoUrls.length;
        if (totalPhotos > 15) {
            return res.status(400).json({
                success: false,
                message: `Max 15 photos. You have ${existingPhotos.length}. Can add ${15 - existingPhotos.length} more.`
            });
        }
        const updatedProfile = await Profile.findOneAndUpdate(
            { user: req.user.id },
            { $push: { photos: { $each: photoUrls } } },
            { new: true }
        );
        res.json({
            success: true,
            message: `${photoUrls.length} photo(s) uploaded! ✅`,
            photos: updatedProfile.photos,
            fullUrls: photoUrls.map(url => `http://localhost:5000${url}`)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ Upload Aadhar card document/photo (up to 2 — front & back)
// Renders page 1 of a PDF to a PNG buffer so Tesseract (which only reads
// images) can run OCR on it. Requires the 'canvas' package, which needs a
// native binary — it ships prebuilt binaries for common platforms
// (including Windows), but if that fails to install/load on a given
// machine, this throws and detectAadharNumber below just skips OCR for
// that file rather than crashing the upload.
async function pdfFirstPageToImageBuffer(pdfPath) {
    const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
    const { createCanvas } = require('canvas');
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');
    await page.render({ canvasContext: context, viewport }).promise;
    return canvas.toBuffer('image/png');
}

// Runs OCR on an Aadhar card image (or first page of a PDF) and pulls out
// a 12-digit number if one is found (Aadhar numbers are printed as
// "XXXX XXXX XXXX"). Returns null on failure or if no valid pattern is
// found — the caller always treats this as a suggestion for the member to
// confirm, never as a fact.
async function detectAadharNumber(filePath, isPdf) {
    try {
        const source = isPdf ? await pdfFirstPageToImageBuffer(filePath) : filePath;
        const { data } = await Tesseract.recognize(source, 'eng');
        const text = data.text || '';
        // Look for 3 groups of 4 digits, optionally separated by spaces/dashes
        const match = text.match(/(\d{4})[\s-]?(\d{4})[\s-]?(\d{4})/);
        if (!match) return null;
        const digits = match[1] + match[2] + match[3];
        return digits.length === 12 ? digits : null;
    } catch (err) {
        console.error(`[Aadhar OCR] failed (${isPdf ? 'PDF' : 'image'}):`, err.message);
        return null;
    }
}

router.post('/upload-aadhar-docs', protect, uploadDoc.array('documents', 2), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }
        const docUrls = req.files.map(f => `/uploads/${f.filename}`);
        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile) return res.status(404).json({ success: false, message: 'Create your profile first!' });

        const existing = profile.aadharDocuments || [];
        if (existing.length + docUrls.length > 2) {
            return res.status(400).json({ success: false, message: `Max 2 Aadhar documents. You have ${existing.length}.` });
        }
        const updated = await Profile.findOneAndUpdate(
            { user: req.user.id },
            { $push: { aadharDocuments: { $each: docUrls } } },
            { new: true }
        );

        // Best-effort OCR on the first uploaded file — images go straight
        // to Tesseract, PDFs get rendered to an image first. Never blocks
        // the upload response on failure; the detected number is only ever
        // a suggestion.
        let detectedNumber = null;
        const firstFile = req.files[0];
        if (firstFile) {
            const isPdf = firstFile.originalname.toLowerCase().endsWith('.pdf');
            detectedNumber = await detectAadharNumber(firstFile.path, isPdf);
        }

        res.json({
            success: true,
            message: 'Aadhar document(s) uploaded! ✅',
            aadharDocuments: updated.aadharDocuments,
            detectedNumber, // null if OCR found nothing usable — frontend should just skip pre-filling in that case
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ Upload Horoscope document/image (up to 2)
router.post('/upload-horoscope-docs', protect, uploadDoc.array('documents', 2), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }
        const docUrls = req.files.map(f => `/uploads/${f.filename}`);
        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile) return res.status(404).json({ success: false, message: 'Create your profile first!' });

        const existing = profile.horoscopeDocuments || [];
        if (existing.length + docUrls.length > 2) {
            return res.status(400).json({ success: false, message: `Max 2 horoscope documents. You have ${existing.length}.` });
        }
        const updated = await Profile.findOneAndUpdate(
            { user: req.user.id },
            { $push: { horoscopeDocuments: { $each: docUrls } } },
            { new: true }
        );
        res.json({ success: true, message: 'Horoscope document(s) uploaded! ✅', horoscopeDocuments: updated.horoscopeDocuments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ Delete a gallery photo
router.delete('/photos/:filename', protect, async (req, res) => {
    try {
        const photoUrl = `/uploads/${req.params.filename}`;
        await Profile.findOneAndUpdate(
            { user: req.user.id },
            { $pull: { photos: photoUrl } },
            { new: true }
        );
        res.json({ success: true, message: 'Photo deleted!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ Remove an uploaded Aadhar document (e.g. wrong file selected)
router.delete('/aadhar-docs/:filename', protect, async (req, res) => {
    try {
        const docUrl = `/uploads/${req.params.filename}`;
        const updated = await Profile.findOneAndUpdate(
            { user: req.user.id },
            { $pull: { aadharDocuments: docUrl } },
            { new: true }
        );
        if (!updated) return res.status(404).json({ success: false, message: 'Profile not found' });
        res.json({ success: true, message: 'Aadhar document removed', aadharDocuments: updated.aadharDocuments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ Remove an uploaded Horoscope document
router.delete('/horoscope-docs/:filename', protect, async (req, res) => {
    try {
        const docUrl = `/uploads/${req.params.filename}`;
        const updated = await Profile.findOneAndUpdate(
            { user: req.user.id },
            { $pull: { horoscopeDocuments: docUrl } },
            { new: true }
        );
        if (!updated) return res.status(404).json({ success: false, message: 'Profile not found' });
        res.json({ success: true, message: 'Horoscope document removed', horoscopeDocuments: updated.horoscopeDocuments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ /:id routes LAST
router.get('/:id', protect, getProfileById);
router.put('/:id', protect, updateProfile);

module.exports = router;