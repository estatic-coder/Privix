// ============================================================
// Anonymous — In-Memory Database Store
// ============================================================
// Models: Users, Tokens, Scans, Findings, Actions
// This simulates a real DB for the MVP. Swap for Mongo/Postgres later.
// ============================================================

const crypto = require('crypto');

const db = {
  users: [],
  tokens: [],
  scans: [],
  findings: [],
  actions: [],
};

// ── Helpers ──────────────────────────────────────────────────
function id() {
  return crypto.randomUUID();
}

function now() {
  return new Date().toISOString();
}

// ── Users ────────────────────────────────────────────────────
function createUser(name, email) {
  const user = { id: id(), name, email, createdAt: now() };
  db.users.push(user);
  return user;
}

function getUserById(userId) {
  return db.users.find((u) => u.id === userId) || null;
}

function getOrCreateUser(name, email) {
  let user = db.users.find((u) => u.email === email);
  if (!user) user = createUser(name, email);
  return user;
}

// ── Tokens ───────────────────────────────────────────────────
function storeTokens(userId, tokens) {
  const entry = { id: id(), userId, tokens, createdAt: now() };
  db.tokens.push(entry);
  return entry;
}

function getTokensByUserId(userId) {
  return db.tokens.filter((t) => t.userId === userId);
}

// ── Scans ────────────────────────────────────────────────────
function createScan(userId, tokenIds) {
  const scan = {
    id: id(),
    userId,
    tokenIds,
    status: 'pending', // pending → running → completed → failed
    createdAt: now(),
    completedAt: null,
  };
  db.scans.push(scan);
  return scan;
}

function updateScan(scanId, updates) {
  const scan = db.scans.find((s) => s.id === scanId);
  if (scan) Object.assign(scan, updates);
  return scan;
}

function getScanById(scanId) {
  return db.scans.find((s) => s.id === scanId) || null;
}

function getScansByUserId(userId) {
  return db.scans.filter((s) => s.userId === userId);
}

function getLatestScan() {
  if (db.scans.length === 0) return null;
  return db.scans[db.scans.length - 1] || null;
}

// ── Findings ─────────────────────────────────────────────────
function addFinding(scanId, userId, finding) {
  // Deduplicate: if a finding for this source already exists for this user,
  // update it in-place rather than inserting a duplicate.
  const existing = db.findings.find(
    (f) => f.userId === userId && f.source === finding.source
  );

  if (existing) {
    Object.assign(existing, {
      scanId,                                       // update to latest scan
      confidence: finding.confidence,
      risk: finding.risk || calculateRisk(finding.confidence),
      dataFound: finding.dataFound,
      rawData: finding.rawData || {},
      lastSeen: now(),
      // Keep original firstSeen and status unless status is 'active'
      status: existing.status === 'resolved' ? existing.status : 'active',
    });
    return existing;
  }

  // New finding — insert
  const entry = {
    id: id(),
    scanId,
    userId,
    source: finding.source,
    dataFound: finding.dataFound,
    confidence: finding.confidence,
    risk: finding.risk || calculateRisk(finding.confidence),
    status: 'active',
    firstSeen: now(),
    lastSeen: now(),
    rawData: finding.rawData || {},
  };
  db.findings.push(entry);
  return entry;
}

function getFindingsByScan(scanId) {
  return db.findings.filter((f) => f.scanId === scanId);
}

function getFindingsByUser(userId) {
  return db.findings.filter((f) => f.userId === userId);
}

function updateFinding(findingId, updates) {
  const finding = db.findings.find((f) => f.id === findingId);
  if (finding) Object.assign(finding, updates);
  return finding;
}

// ── Actions ──────────────────────────────────────────────────
function createAction(findingId, userId, type) {
  const action = {
    id: id(),
    findingId,
    userId,
    type, // 'deletion_request', 'opt_out', 'report'
    status: 'pending',
    createdAt: now(),
    completedAt: null,
  };
  db.actions.push(action);
  return action;
}

function getActionsByUser(userId) {
  return db.actions.filter((a) => a.userId === userId);
}

function updateAction(actionId, updates) {
  const action = db.actions.find((a) => a.id === actionId);
  if (action) Object.assign(action, updates);
  return action;
}

// ── Risk Calculation ─────────────────────────────────────────
function calculateRisk(confidence) {
  if (confidence >= 0.9) return 'critical';
  if (confidence >= 0.8) return 'high';
  if (confidence >= 0.7) return 'medium';
  return 'low';
}

// ── Stats ────────────────────────────────────────────────────
function getStats(userId) {
  const findings = getFindingsByUser(userId);
  const active = findings.filter((f) => f.status === 'active');
  return {
    totalFindings: findings.length,
    activeExposures: active.length,
    criticalCount: active.filter((f) => f.risk === 'critical').length,
    highCount: active.filter((f) => f.risk === 'high').length,
    mediumCount: active.filter((f) => f.risk === 'medium').length,
    lowCount: active.filter((f) => f.risk === 'low').length,
    resolvedCount: findings.filter((f) => f.status === 'resolved').length,
  };
}

// ── Debug ────────────────────────────────────────────────────
function dump() {
  return JSON.parse(JSON.stringify(db));
}

module.exports = {
  createUser,
  getUserById,
  getOrCreateUser,
  storeTokens,
  getTokensByUserId,
  createScan,
  updateScan,
  getScanById,
  getScansByUserId,
  getLatestScan,
  addFinding,
  getFindingsByScan,
  getFindingsByUser,
  updateFinding,
  createAction,
  getActionsByUser,
  updateAction,
  calculateRisk,
  getStats,
  dump,
};
