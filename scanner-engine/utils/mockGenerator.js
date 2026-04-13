// ============================================================
// Anonymous — Scanner Engine: Mock Generator Utilities
// ============================================================
// Produces deterministic synthetic data based on input hashes.
// ============================================================

const crypto = require('crypto');

let globalBreachesObj = [];

/**
 * Seed the generator with real-world HIBP breaches
 */
function seedRealBreaches(breachesList) {
  if (breachesList && breachesList.length > 0) {
    globalBreachesObj = breachesList;
  }
}

/**
 * Generate a deterministic hash from the input string.
 */
function hashInput(str) {
  if (!str) return 0;
  return parseInt(crypto.createHash('md5').update(str.toLowerCase()).digest('hex').substring(0, 8), 16);
}

/**
 * Returns a stable city based on a hash.
 */
function getCity(hash) {
  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'London', 'San Francisco', 'Toronto'];
  return cities[hash % cities.length];
}

/**
 * Returns a stable state based on a hash.
 */
function getState(hash) {
  const states = ['CA', 'NY', 'TX', 'FL', 'IL', 'UK', 'ON', 'WA'];
  return states[hash % states.length];
}

/**
 * Generates a realistic structured address based on a hash.
 */
function getAddress(hash) {
  const num = (hash % 8999) + 1000;
  const streets = ['Maple St', 'Oak Ave', 'Elm Rd', 'Park Blvd', 'Washington St', 'Main St', 'Madison Ave'];
  return `${num} ${streets[hash % streets.length]}`;
}

/**
 * Generates a realistic phone number based on a hash.
 */
function getPhone(hash) {
  const areaCode = (hash % 800) + 200;
  const central = ((hash * 2) % 800) + 200;
  const lastFour = ((hash * 3) % 9000) + 1000;
  return `+1 ${areaCode}-${central}-${lastFour}`;
}

/**
 * Assigns a specific breach scenario based on the input hash.
 */
function getBreachScenario(hash, moduleName) {
  const scenarios = {
    DataBrokerX: [
      { name: "Public Record Aggregator 2021", severity: "medium", type: "pii" },
      { name: "Global Marketing Lead List", severity: "low", type: "pii" }
    ],
    PeopleFinderY: [
      { name: "DarkWeb Contact List Archive", severity: "high", type: "pii_financial" },
      { name: "Exposed Telemarketing Database", severity: "medium", type: "pii" }
    ],
    GoogleSearch: [
      { name: "Pastebin Password Dump", severity: "critical", type: "credentials" },
      { name: "Public Forum Accidental Leak", severity: "medium", type: "credentials" }
    ]
  };

  // If we have actual HIBP data loaded, use that deterministically!
  if (globalBreachesObj && globalBreachesObj.length > 10) {
    // Offset the hash by the module name's length or a simple string hash to ensure variety
    let moduleOffset = 0;
    if (moduleName) {
      for (let i = 0; i < moduleName.length; i++) {
        moduleOffset += moduleName.charCodeAt(i);
      }
    }
    const finalHash = hash + moduleOffset;
    const breach = globalBreachesObj[finalHash % globalBreachesObj.length];
    
    return {
      name: breach.Title || breach.Name,
      severity: breach.DataClasses.includes('Passwords') || breach.DataClasses.includes('Bank account numbers') ? 'critical' : 'high',
      type: 'pii',
      hibpData: breach // Full original payload
    };
  }

  const pool = scenarios[moduleName] || scenarios.GoogleSearch;
  return pool[hash % pool.length];
}

module.exports = {
  hashInput,
  getCity,
  getState,
  getAddress,
  getPhone,
  getBreachScenario,
  seedRealBreaches
};
