// ============================================================
// Anonymous — Scanner Engine: Google Search Module
// ============================================================
// Simulates searching Google for exposed personal data.
// In production: use Google Custom Search API or Serper API.
// ============================================================

const MODULE_NAME = 'GoogleSearch';
const { isSuppressed } = require('../suppressionList');
const { hashInput, getBreachScenario } = require('../utils/mockGenerator');

/**
 * Scan Google search results for exposed personal data.
 *
 * @param {Object} tokens - { email, name, phone, ... }
 * @returns {Promise<Array>} Array of raw result objects
 */
async function scan(tokens) {
  console.log(`[${MODULE_NAME}] Scanning with tokens:`, Object.keys(tokens).join(', '));

  await delay(1000 + Math.random() * 2000);

  const results = [];

  const seed = tokens.email || tokens.password || tokens.name || 'anonymous';
  const hash = hashInput(seed);

  // Simulate Google finding the email in a public paste/leak/forum
  if (tokens.email) {
    const scenario = getBreachScenario(hash, MODULE_NAME);
    results.push({
      source: scenario.name,
      severity: scenario.severity,
      hibpData: scenario.hibpData,
      data: {
        email: tokens.email,
        name: null,
        phone: null,
        url: `https://pastebin.com/example/${randomId(hash)}`,
      },
    });

    // Maybe found on a forum
    if (hash % 2 === 0) {
      results.push({
        source: 'Public Hacker Forum',
        severity: 'medium',
        data: {
          email: tokens.email,
          name: tokens.name || null,
          username: tokens.email.split('@')[0],
          url: `https://forum.example.com/user/${tokens.email.split('@')[0]}`,
        },
      });
    }
  }

  // Simulate finding name + phone in public records
  if (tokens.name && tokens.phone) {
    results.push({
      source: 'Google Search — Public Records',
      severity: 'low',
      data: {
        name: tokens.name,
        phone: tokens.phone,
        email: null,
        url: `https://publicrecords.example.com/profile/${randomId(hash + 1)}`,
      },
    });
  }

  // Simulate GitHub code search finding email in a repo
  if (tokens.email && hash % 3 === 0) {
    results.push({
      source: 'GitHub Code Search',
      severity: 'high',
      data: {
        email: tokens.email,
        name: tokens.name || null,
        username: tokens.email.split('@')[0],
        url: `https://github.com/search?q=${encodeURIComponent(tokens.email)}`,
      },
    });
  }

  // Simulate finding an exposed password in a database dump
  if (tokens.password && tokens.email) {
    results.push({
      source: 'DarkWeb Database Dump',
      severity: 'critical',
      data: {
        email: tokens.email,
        password: tokens.password,
        url: `https://leak.example.com/dump/${randomId(hash + 2)}`,
      },
    });
  } else if (tokens.password) {
    results.push({
      source: 'Underground Hash Directory',
      severity: 'critical',
      data: {
        password: tokens.password,
        url: `https://hashes.example.com/search?q=${encodeURIComponent(tokens.password)}`,
      },
    });
  }

  // Filter out suppressed records
  const filteredResults = results.filter(r => !isSuppressed(MODULE_NAME, r.data));

  console.log(`[${MODULE_NAME}] Found ${filteredResults.length} result(s)`);
  return filteredResults;
}

function randomId(hash) {
  return hash.toString(36).substring(0, 8);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { scan, MODULE_NAME };
