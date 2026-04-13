// ============================================================
// Anonymous — Scheduler: Alert Job
// ============================================================
// Generates alerts when new exposures are detected or
// data reappears after being marked resolved.
// ============================================================

const store = require('../../database/store');

// In-memory alert queue (would be push notifications / email in prod)
const alertQueue = [];

/**
 * Check for conditions that warrant an alert and generate them.
 *
 * @param {string} userId
 * @param {Array} newFindings - Newly added findings from a scan
 * @returns {Array} Generated alerts
 */
function checkAndAlert(userId, newFindings) {
  const alerts = [];

  for (const finding of newFindings) {
    // New exposure alert
    if (finding.status === 'active' && finding.risk !== 'low') {
      const alert = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        userId,
        type: 'new_exposure',
        severity: finding.risk,
        message: `⚠️ New Exposure Detected on ${finding.source}`,
        details: `Data found: ${finding.dataFound.join(', ')} | Confidence: ${(finding.confidence * 100).toFixed(0)}%`,
        findingId: finding.id,
        createdAt: new Date().toISOString(),
        read: false,
      };
      alerts.push(alert);
      alertQueue.push(alert);
    }
  }

  // Check for reappearing data (previously resolved, now active again)
  const allFindings = store.getFindingsByUser(userId);
  const reappeared = allFindings.filter((f) => f.status === 'reappeared');
  for (const finding of reappeared) {
    const alert = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      userId,
      type: 'data_reappeared',
      severity: 'critical',
      message: `🔴 Data Reappeared on ${finding.source}`,
      details: `Previously resolved exposure has been detected again.`,
      findingId: finding.id,
      createdAt: new Date().toISOString(),
      read: false,
    };
    alerts.push(alert);
    alertQueue.push(alert);
  }

  if (alerts.length > 0) {
    console.log(`[Alert] Generated ${alerts.length} alert(s) for user ${userId}`);
  }

  return alerts;
}

/**
 * Get unread alerts for a user.
 */
function getAlerts(userId) {
  return alertQueue.filter((a) => a.userId === userId);
}

/**
 * Get unread alerts count.
 */
function getUnreadCount(userId) {
  return alertQueue.filter((a) => a.userId === userId && !a.read).length;
}

/**
 * Mark an alert as read.
 */
function markRead(alertId) {
  const alert = alertQueue.find((a) => a.id === alertId);
  if (alert) alert.read = true;
  return alert;
}

/**
 * Mark all alerts for a user as read.
 */
function markAllRead(userId) {
  alertQueue.filter((a) => a.userId === userId).forEach((a) => (a.read = true));
}

module.exports = { checkAndAlert, getAlerts, getUnreadCount, markRead, markAllRead };
