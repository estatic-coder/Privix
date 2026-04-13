// ============================================================
// Anonymous — Scanner Engine: Suppression List
// ============================================================
// Simulates actual dynamic DPDP deletions. If a record is 
// successfully opted-out/deleted, it gets added here so 
// the mock scanners stop "finding" it.
// ============================================================

const suppressedRecords = [];

/**
 * Add a record to the suppression list (simulate successful deletion).
 */
function suppress(source, rawData) {
  // We only track the primary identifiers to suppress, since 
  // mock data fields (like random addresses) change every scan.
  const record = {
    source,
    email: rawData.email || null,
    phone: rawData.phone || null,
    name: rawData.name || null,
    password: rawData.password || null,
  };
  suppressedRecords.push(record);
  console.log(`[Suppression] Added record to suppression list from ${source}`);
}

/**
 * Check if a record should be suppressed and not returned by a scanner.
 * Matches if the source and ANY of the identifying tokens match an existing suppression.
 */
function isSuppressed(source, data) {
  return suppressedRecords.some(r => {
    if (r.source !== source) return false;
    
    // Check if any primary identifier matches
    if (r.email && r.email === data.email) return true;
    if (r.phone && r.phone === data.phone) return true;
    if (r.name && r.name === data.name) return true;
    if (r.password && r.password === data.password) return true;
    
    return false;
  });
}

module.exports = { suppress, isSuppressed };
