// ============================================================
// Anonymous — Scanner Engine: Broker A (DataBrokerX)
// ============================================================
// Simulates scanning a people-search / data broker site.
// In production, this would use puppeteer or HTTP requests
// to scrape the actual site. For MVP, returns mock results.
// ============================================================

const MODULE_NAME = 'DataBrokerX';
const { isSuppressed } = require('../suppressionList');
const { hashInput, getCity, getState, getAddress, getPhone, getBreachScenario } = require('../utils/mockGenerator');

/**
 * Scan DataBrokerX for user token matches.
 *
 * @param {Object} tokens - { email, name, phone, ... }
 * @returns {Promise<Array>} Array of raw result objects
 */
async function scan(tokens) {
  console.log(`[${MODULE_NAME}] Scanning with tokens:`, Object.keys(tokens).join(', '));

  // Simulate network delay (800ms - 2s)
  await delay(800 + Math.random() * 1200);

  const results = [];

  // Create deterministic hash from input tokens
  const seed = tokens.email || tokens.name || 'anonymous';
  const hash = hashInput(seed);

  // Simulate: if user has email + name, this broker "finds" a profile
  if (tokens.email && tokens.name) {
    const scenario = getBreachScenario(hash, MODULE_NAME);
    results.push({
      source: scenario.name,
      severity: scenario.severity,
      hibpData: scenario.hibpData,
      data: {
        name: tokens.name,
        email: tokens.email,
        phone: tokens.phone || getPhone(hash),
        city: getCity(hash),
        state: getState(hash),
        address: getAddress(hash),
      },
    });
  }

  // Simulate: sometimes finds a second partial match
  if (tokens.name && hash % 2 === 0) {
    const scenario = getBreachScenario(hash + 1, MODULE_NAME);
    results.push({
      source: scenario.name,
      severity: scenario.severity,
      hibpData: scenario.hibpData,
      data: {
        name: tokens.name,
        email: null,
        phone: getPhone(hash + 1),
        city: getCity(hash + 1),
        state: getState(hash + 1),
      },
    });
  }

  // Filter out suppressed records
  const filteredResults = results.filter(r => !isSuppressed(MODULE_NAME, r.data));

  console.log(`[${MODULE_NAME}] Found ${filteredResults.length} result(s)`);
  return filteredResults;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { scan, MODULE_NAME };
