// ============================================================
// Anonymous — Backend: Scan Routes
// ============================================================

const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scanController');

// POST /api/scans — Start a new scan
router.post('/', scanController.startScan);

// GET /api/scans/:scanId — Get scan status
router.get('/:scanId', scanController.getStatus);

module.exports = router;
