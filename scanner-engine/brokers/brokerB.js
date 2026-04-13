// ============================================================
// Anonymous — Scanner Engine: Broker B (PeopleFinderY)
// ============================================================
// Simulates a second people-search data broker.
// Different data patterns to demonstrate modular design.
// ============================================================

const MODULE_NAME = 'PeopleFinderY';
const { isSuppressed } = require('../suppressionList');
const { hashInput, getCity, getBreachScenario } = require('../utils/mockGenerator');

/**
 * Scan PeopleFinderY for user token matches.
 *
 * @param {Object} tokens - { email, name, phone, ... }
 * @returns {Promise<Array>} Array of raw result objects
 */
async function scan(tokens) {
  console.log(`[${MODULE_NAME}] Scanning with tokens:`, Object.keys(tokens).join(', '));

  await delay(600 + Math.random() * 1500);

  const results = [];

  const seed = tokens.phone || tokens.email || tokens.name || 'anonymous';
  const hash = hashInput(seed);

  // This broker specializes in phone + name lookups
  if (tokens.phone && tokens.name) {
    const scenario = getBreachScenario(hash, MODULE_NAME);
    results.push({
      source: scenario.name,
      severity: scenario.severity,
      hibpData: scenario.hibpData,
      data: {
        name: tokens.name,
        phone: tokens.phone,
        email: generateRelatedEmail(tokens.name, hash),
        city: getCity(hash),
        dob: generateDOB(hash),
      },
    });
  }

  // Also checks email independently
  if (tokens.email) {
    const scenario = getBreachScenario(hash + 2, MODULE_NAME);
    results.push({
      source: scenario.name,
      severity: scenario.severity,
      hibpData: scenario.hibpData,
      data: {
        name: tokens.name || null,
        email: tokens.email,
        phone: null,
        username: extractUsername(tokens.email),
        city: getCity(hash + 1),
      },
    });
  }

  // Deterministic false-positive to test filtering
  if (hash % 3 === 0) {
    results.push({
      source: 'Background Check Aggregator',
      severity: 'low',
      data: {
        name: generateRandomName(hash),
        email: null,
        phone: null,
        city: getCity(hash + 2),
      },
    });
  }

  // Filter out suppressed records
  const filteredResults = results.filter(r => !isSuppressed(MODULE_NAME, r.data));

  console.log(`[${MODULE_NAME}] Found ${filteredResults.length} result(s)`);
  return filteredResults;
}

// ── Mock data generators ─────────────────────────────────────
function generateRelatedEmail(name, hash) {
  if (!name) return null;
  const clean = name.toLowerCase().replace(/\s+/g, '.');
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'proton.me'];
  return `${clean}@${domains[hash % domains.length]}`;
}

function extractUsername(email) {
  if (!email) return null;
  return email.split('@')[0];
}

function generateRandomName(hash) {
  const firsts = ['Alex', 'Jordan', 'Sam', 'Morgan', 'Riley', 'Priya', 'Arjun'];
  const lasts = ['Smith', 'Johnson', 'Lee', 'Patel', 'Garcia', 'Kumar', 'Singh'];
  return `${firsts[hash % firsts.length]} ${lasts[hash % lasts.length]}`;
}

function generateDOB(hash) {
  const year = 1970 + (hash % 35);
  const month = String((hash % 12) + 1).padStart(2, '0');
  const day = String((hash % 28) + 1).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { scan, MODULE_NAME };
