// ============================================================
// Anonymous — Scheduler: Recheck Job
// ============================================================
// Periodically re-runs scans for all users to detect
// new exposures or confirm old ones are resolved.
// ============================================================

const scannerEngine = require('../../scanner-engine');
const { processResults } = require('../../matcher-engine/scoring');
const store = require('../../database/store');

let recheckInterval = null;
const MAX_TIMER_DELAY_MS = 2_147_483_647;

/**
 * Start the periodic recheck job.
 * @param {number} intervalMs - Interval in ms (default: 30 days)
 */
function start(intervalMs = 30 * 24 * 60 * 60 * 1000) {
  const devInterval = process.env.NODE_ENV === 'development' ? 5 * 60 * 1000 : intervalMs;
  const safeInterval = Math.min(devInterval, MAX_TIMER_DELAY_MS);

  console.log(`[Scheduler] Recheck job started (interval: ${safeInterval}ms)`);
  if (safeInterval !== devInterval) {
    console.warn(
      `[Scheduler] Requested interval ${devInterval}ms exceeds Node timer limit; using ${safeInterval}ms instead.`
    );
  }

  recheckInterval = setInterval(async () => {
    console.log(`\n[Scheduler] ──── Running periodic recheck ────`);
    await recheckAllUsers();
  }, safeInterval);
}

/**
 * Stop the recheck job.
 */
function stop() {
  if (recheckInterval) {
    clearInterval(recheckInterval);
    recheckInterval = null;
    console.log(`[Scheduler] Recheck job stopped`);
  }
}

/**
 * Re-scan all users who have existing tokens.
 */
async function recheckAllUsers() {
  const dbDump = store.dump();
  const users = dbDump.users;

  for (const user of users) {
    const tokenEntries = store.getTokensByUserId(user.id);
    if (tokenEntries.length === 0) continue;

    const latestTokens = tokenEntries[tokenEntries.length - 1].tokens;
    console.log(`[Scheduler] Re-scanning user: ${user.email}`);

    try {
      // Create a new scan record
      const scan = store.createScan(user.id, []);
      store.updateScan(scan.id, { status: 'running' });

      // Run scanners
      const rawResults = await scannerEngine.runAllScanners(latestTokens);

      // Score results
      const validFindings = processResults(latestTokens, rawResults);

      // Check for new exposures vs existing
      const existingFindings = store.getFindingsByUser(user.id);

      let newCount = 0;
      for (const finding of validFindings) {
        const exists = existingFindings.find(
          (ef) => ef.source === finding.source && ef.status === 'active'
        );
        if (!exists) {
          store.addFinding(scan.id, user.id, finding);
          newCount++;
        } else {
          // Update lastSeen
          store.updateFinding(exists.id, { lastSeen: new Date().toISOString() });
        }
      }

      // Mark findings not seen in this scan as potentially resolved
      for (const ef of existingFindings) {
        const stillActive = validFindings.find((vf) => vf.source === ef.source);
        if (!stillActive && ef.status === 'active') {
          store.updateFinding(ef.id, { status: 'possibly_resolved' });
        }
      }

      store.updateScan(scan.id, { status: 'completed', completedAt: new Date().toISOString() });
      console.log(`[Scheduler] User ${user.email}: ${newCount} new exposure(s) found`);
    } catch (err) {
      console.error(`[Scheduler] Error re-scanning ${user.email}:`, err.message);
    }
  }
}

module.exports = { start, stop, recheckAllUsers };
