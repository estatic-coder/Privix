// ============================================================
// Anonymous — Scanner Engine: Orchestrator
// ============================================================
// Receives tokens, dispatches to all scanner modules in parallel,
// collects raw results, and returns them to the caller.
// ============================================================

const brokerA = require('./brokers/brokerA');
const brokerB = require('./brokers/brokerB');
const googleSearch = require('./search/googleSearch');
const hibp = require('./search/hibp');
const { seedRealBreaches } = require('./utils/mockGenerator');

// Registry of all active scanner modules
const MODULES = [brokerA, brokerB, googleSearch, hibp];

/**
 * Run all scanner modules in parallel against the given tokens.
 *
 * @param {Object} tokens - { email, name, phone, ... }
 * @param {Function} onProgress - Optional callback(moduleName, status)
 * @returns {Promise<Array>} Combined array of raw results from all modules
 */
async function runAllScanners(tokens, onProgress) {
  console.log(`\n═══════════════════════════════════════════════`);
  console.log(`  Scanner Engine — Dispatching ${MODULES.length} modules`);
  console.log(`═══════════════════════════════════════════════\n`);

  // Pre-fetch global breach data to seed realistic mapping
  const breachList = await hibp.fetchBreachDictionary();
  seedRealBreaches(breachList);

  const tasks = MODULES.map(async (mod) => {
    try {
      if (onProgress) onProgress(mod.MODULE_NAME, 'running');
      const results = await mod.scan(tokens);
      if (onProgress) onProgress(mod.MODULE_NAME, 'completed');
      return results;
    } catch (err) {
      console.error(`[Scanner] Module ${mod.MODULE_NAME} failed:`, err.message);
      if (onProgress) onProgress(mod.MODULE_NAME, 'failed');
      return [];
    }
  });

  const allResults = await Promise.all(tasks);

  // Flatten all module results into a single array
  const combined = allResults.flat();

  console.log(`\n[Scanner Engine] Total raw results: ${combined.length}`);
  return combined;
}

/**
 * Run a specific scanner module by name.
 *
 * @param {string} moduleName
 * @param {Object} tokens
 * @returns {Promise<Array>}
 */
async function runSingleScanner(moduleName, tokens) {
  const mod = MODULES.find((m) => m.MODULE_NAME === moduleName);
  if (!mod) throw new Error(`Scanner module "${moduleName}" not found`);
  return mod.scan(tokens);
}

/**
 * List all available scanner modules.
 */
function listModules() {
  return MODULES.map((m) => m.MODULE_NAME);
}

module.exports = { runAllScanners, runSingleScanner, listModules };
