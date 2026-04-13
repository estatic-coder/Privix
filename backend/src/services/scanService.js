// ============================================================
// Anonymous — Backend: Scan Service
// ============================================================
// Core business logic for running scans.
// Orchestrates: scanner engine → matcher engine → database
// ============================================================

const scannerEngine = require('../../../scanner-engine');
const { processResults, calculateGlobalRisk } = require('../../../matcher-engine/scoring');
const { validateTokens, normalizeTokens } = require('../../../matcher-engine/validator');
const store = require('../../../database/store');
const { checkAndAlert } = require('../../../scheduler/jobs/alertJob');

/**
 * Execute a full scan for the given user tokens.
 *
 * @param {Object} params - { name, email, phone, ... }
 * @returns {Object} { scan, findings, alerts, stats }
 */
async function executeScan(params) {
  const { name, email, phone, username, address, city, state, dob, password } = params;

  // Build tokens object
  const tokens = {};
  if (email) tokens.email = email;
  if (name) tokens.name = name;
  if (phone) tokens.phone = phone;
  if (username) tokens.username = username;
  if (password) tokens.password = password;
  if (address) tokens.address = address;
  if (city) tokens.city = city;
  if (state) tokens.state = state;
  if (dob) tokens.dob = dob;

  // Validate
  const validation = validateTokens(tokens);
  if (!validation.valid) {
    throw new Error(`Invalid tokens: ${validation.errors.join(', ')}`);
  }

  // Get or create user
  const user = store.getOrCreateUser(name || 'Anonymous', email || `user_${Date.now()}@anonymous.local`);

  // Store tokens
  const tokenEntry = store.storeTokens(user.id, tokens);

  // Create scan record
  const scan = store.createScan(user.id, [tokenEntry.id]);
  store.updateScan(scan.id, { status: 'running' });

  console.log(`\n🔍 Scan ${scan.id} started for user ${user.email}`);

  try {
    // ── Phase 1: Run all scanner modules in parallel ──────────
    const rawResults = await scannerEngine.runAllScanners(tokens, (moduleName, status) => {
      console.log(`  [${moduleName}] → ${status}`);
    });

    // ── Phase 2: Score & filter results through matcher engine ─
    const validFindings = processResults(tokens, rawResults);
    const globalRiskScore = calculateGlobalRisk(validFindings);

    console.log(`\n📊 Matcher: ${rawResults.length} raw → ${validFindings.length} valid findings`);
    console.log(`⚠️ Calculated Global Risk Score: ${globalRiskScore}/100`);

    // ── Phase 3: Store valid findings ─────────────────────────
    const storedFindings = validFindings.map((f) =>
      store.addFinding(scan.id, user.id, f)
    );

    // ── Phase 4: Generate alerts ──────────────────────────────
    const alerts = checkAndAlert(user.id, storedFindings);

    // ── Phase 5: Complete scan ────────────────────────────────
    store.updateScan(scan.id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
    });

    const stats = store.getStats(user.id);

    console.log(`✅ Scan ${scan.id} completed — ${storedFindings.length} exposures found\n`);

    return {
      scan: store.getScanById(scan.id),
      findings: storedFindings,
      riskScore: globalRiskScore,
      alerts,
      stats,
      user: { id: user.id, name: user.name, email: user.email },
    };
  } catch (err) {
    store.updateScan(scan.id, { status: 'failed' });
    throw err;
  }
}

/**
 * Get scan status by ID.
 */
function getScanStatus(scanId) {
  const scan = store.getScanById(scanId);
  if (!scan) return null;
  const findings = store.getFindingsByScan(scanId);
  return { scan, findingsCount: findings.length };
}

module.exports = { executeScan, getScanStatus };
