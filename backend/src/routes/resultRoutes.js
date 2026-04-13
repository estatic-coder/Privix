// ============================================================
// Anonymous — Backend: Result Routes
// ============================================================

const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');

// GET /api/results/dashboard/:userId
router.get('/dashboard/:userId', resultController.dashboard);

// GET /api/results/findings/:userId
router.get('/findings/:userId', resultController.findings);

// GET /api/results/stats/:userId
router.get('/stats/:userId', resultController.stats);

// GET /api/results/alerts/:userId
router.get('/alerts/:userId', resultController.alerts);

// POST /api/results/action — Request deletion
router.post('/action', resultController.requestAction);

// POST /api/results/alerts/read
router.post('/alerts/read', resultController.readAlerts);

module.exports = router;
