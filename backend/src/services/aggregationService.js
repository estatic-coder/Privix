// ============================================================
// Anonymous — Backend: Aggregation Service
// ============================================================
// Aggregates and formats results for the frontend dashboard.
// ============================================================

const store = require('../../../database/store');
const { getAlerts, getUnreadCount } = require('../../../scheduler/jobs/alertJob');

/**
 * Get full dashboard data for a user.
 *
 * @param {string} userId
 * @returns {Object} Dashboard payload
 */
function getDashboardData(userId) {
  const user = store.getUserById(userId);
  if (!user) return null;

  const findings = store.getFindingsByUser(userId);
  const scans = store.getScansByUserId(userId);
  const actions = store.getActionsByUser(userId);
  const alerts = getAlerts(userId);
  const stats = store.getStats(userId);

  // Group findings by source
  const bySource = {};
  for (const f of findings) {
    if (!bySource[f.source]) bySource[f.source] = [];
    bySource[f.source].push(f);
  }

  // Recent findings (last 10)
  const recentFindings = [...findings]
    .sort((a, b) => new Date(b.firstSeen) - new Date(a.firstSeen))
    .slice(0, 10);

  return {
    user: { id: user.id, name: user.name, email: user.email },
    stats,
    recentFindings,
    findingsBySource: bySource,
    totalScans: scans.length,
    lastScan: scans.length > 0 ? scans[scans.length - 1] : null,
    actions,
    alerts: alerts.slice(-20),
    unreadAlerts: getUnreadCount(userId),
  };
}

/**
 * Get all findings for a user, with optional filters.
 *
 * @param {string} userId
 * @param {Object} filters - { status, risk, source }
 * @returns {Array}
 */
function getFilteredFindings(userId, filters = {}) {
  let findings = store.getFindingsByUser(userId);

  if (filters.status) {
    findings = findings.filter((f) => f.status === filters.status);
  }
  if (filters.risk) {
    findings = findings.filter((f) => f.risk === filters.risk);
  }
  if (filters.source) {
    findings = findings.filter((f) =>
      f.source.toLowerCase().includes(filters.source.toLowerCase())
    );
  }

  // Sort by confidence descending
  findings.sort((a, b) => b.confidence - a.confidence);

  return findings;
}

module.exports = { getDashboardData, getFilteredFindings };
