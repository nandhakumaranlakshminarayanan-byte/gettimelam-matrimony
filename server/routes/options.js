const express = require('express');
const router = express.Router();
const { getOptions, suggestOption } = require('../controllers/masterOptionController');

router.get('/', getOptions);
router.post('/suggest', suggestOption);

module.exports = router;
