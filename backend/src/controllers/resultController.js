// ============================================================
// Anonymous — Backend: Result Controller
// ============================================================

const { getDashboardData, getFilteredFindings } = require('../services/aggregationService');
const store = require('../../../database/store');
const { getAlerts, markRead, markAllRead } = require('../../../scheduler/jobs/alertJob');

/**
 * GET /api/results/dashboard/:userId — Full dashboard data
 */
function dashboard(req, res) {
  const { userId } = req.params;
  const data = getDashboardData(userId);
  if (!data) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ success: true, data });
}

/**
 * GET /api/results/findings/:userId — Filtered findings
 */
function findings(req, res) {
  const { userId } = req.params;
  const { status, risk, source } = req.query;
  const data = getFilteredFindings(userId, { status, risk, source });
  res.json({ success: true, data, count: data.length });
}

/**
 * POST /api/results/action — Request deletion / take action
 */
function requestAction(req, res) {
  const { findingId, userId, type } = req.body;
  if (!findingId || !userId) {
    return res.status(400).json({ error: 'findingId and userId are required' });
  }

  const action = store.createAction(findingId, userId, type || 'deletion_request');

  // Update the finding status
  store.updateFinding(findingId, { status: 'action_pending' });

  res.json({
    success: true,
    message: 'Deletion request submitted.',
    data: action,
  });
}

/**
 * GET /api/results/alerts/:userId — Get alerts
 */
function alerts(req, res) {
  const { userId } = req.params;
  const data = getAlerts(userId);
  res.json({ success: true, data, count: data.length });
}

/**
 * POST /api/results/alerts/read — Mark alert(s) as read
 */
function readAlerts(req, res) {
  const { alertId, userId, all } = req.body;
  if (all && userId) {
    markAllRead(userId);
  } else if (alertId) {
    markRead(alertId);
  }
  res.json({ success: true });
}

/**
 * GET /api/results/stats/:userId — Quick stats
 */
function stats(req, res) {
  const { userId } = req.params;
  const data = store.getStats(userId);
  res.json({ success: true, data });
}

module.exports = { dashboard, findings, requestAction, alerts, readAlerts, stats };
