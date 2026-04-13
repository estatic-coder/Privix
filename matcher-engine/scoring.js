// ============================================================
// Anonymous — Matcher Engine: Scoring
// ============================================================
// Takes user tokens + scraped data → produces a confidence score.
// Low confidence = discard. No false panic.
// ============================================================

const RULES = require('./rules');
const { normalizeTokens } = require('./validator');

/**
 * Score a single scraped result against user tokens.
 *
 * @param {Object} userTokens - { email, name, phone, ... }
 * @param {Object} scrapedData - { email, name, phone, ... } from a scanner module
 * @returns {{ confidence: number, matchedFields: string[], risk: string }}
 */
function scoreMatch(userTokens, scrapedData) {
  const normalizedUser = normalizeTokens(userTokens);
  const normalizedScraped = normalizeTokens(scrapedData);

  let totalWeight = 0;
  const matchedFields = [];

  // ── Direct field matching ──────────────────────────────────
  for (const [field, weight] of Object.entries(RULES.weights)) {
    if (!normalizedUser[field] || !normalizedScraped[field]) continue;

    if (field === 'name') {
      // Fuzzy name match: check if scraped contains user name tokens
      const userParts = normalizedUser.name.split(' ');
      const scrapedName = normalizedScraped.name;
      const partsMatched = userParts.filter((p) => scrapedName.includes(p));
      if (partsMatched.length > 0) {
        const ratio = partsMatched.length / userParts.length;
        totalWeight += weight * ratio;
        matchedFields.push('name');
      }
    } else if (normalizedUser[field] === normalizedScraped[field]) {
      totalWeight += weight;
      matchedFields.push(field);
    }
  }

  // ── Combination bonuses ────────────────────────────────────
  for (const [combo, bonus] of Object.entries(RULES.comboBonuses)) {
    const parts = combo.split('+');
    if (parts.every((p) => matchedFields.includes(p))) {
      totalWeight += bonus;
    }
  }

  // Cap at 1.0
  const confidence = Math.min(parseFloat(totalWeight.toFixed(3)), 1.0);

  // Determine risk level (fallback if scanner didn't provide one)
  let risk = scrapedData.severity || 'low';
  if (!scrapedData.severity) {
    if (confidence >= RULES.riskThresholds.critical) risk = 'critical';
    else if (confidence >= RULES.riskThresholds.high) risk = 'high';
    else if (confidence >= RULES.riskThresholds.medium) risk = 'medium';
  }

  return { confidence, matchedFields, risk };
}

/**
 * Process an array of raw scanner results and filter + score them.
 *
 * @param {Object} userTokens
 * @param {Array} rawResults - Array of { source, data: { email, name, ... } }
 * @returns {Array} Filtered & scored findings
 */
function processResults(userTokens, rawResults) {
  const scored = rawResults.map((result) => {
    const { confidence, matchedFields, risk } = scoreMatch(userTokens, result.data);
    return {
      source: result.source,
      dataFound: matchedFields,
      confidence,
      risk,
      rawData: result.data,
    };
  });

  // Discard low-confidence matches
  return scored.filter((r) => r.confidence >= RULES.minConfidence);
}

/**
 * Calculate an aggregated global risk score (0-100) based on all valid findings.
 */
function calculateGlobalRisk(findings) {
  if (!findings || findings.length === 0) return 0;
  
  const weights = { critical: 40, high: 25, medium: 10, low: 5 };
  let score = 0;
  
  for (const f of findings) {
    score += weights[f.risk] || 0;
  }
  
  // Base risk starts at 0, maxes at 99. 100 is impossible to guarantee.
  return Math.min(Math.round(score), 99);
}

module.exports = { scoreMatch, processResults, calculateGlobalRisk };
