// ============================================================
// Anonymous — Scheduler: Action Job (Deletion Engine)
// ============================================================
// Processes pending DPDP deletion and opt-out requests.
// Simulates workflow latency and marks them resolved, while
// adding the records to the scanner suppression list.
// ============================================================

const store = require('../../database/store');
const { suppress } = require('../../scanner-engine/suppressionList');

let actionInterval = null;

function start(intervalMs = 15000) { // Check every 15s in dev
  console.log(`[Scheduler] Action job started (interval: ${intervalMs}ms)`);
  
  actionInterval = setInterval(async () => {
    await processPendingActions();
  }, intervalMs);
}

function stop() {
  if (actionInterval) {
    clearInterval(actionInterval);
    actionInterval = null;
  }
}

async function processPendingActions() {
  const dbDump = store.dump();
  const pendingActions = dbDump.actions.filter(a => a.status === 'pending');

  for (const action of pendingActions) {
    console.log(`[Action Job] Processing deletion request for finding ID: ${action.findingId}`);
    
    // Simulate HTTP delay / DPDP portal processing time
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1500));

    const finding = store.dump().findings.find(f => f.id === action.findingId);
    if (!finding) continue;

    // Add to suppression list so mock scanners no longer "find" it
    suppress(finding.source, finding.rawData);

    // Update action to completed
    store.updateAction(action.id, { 
      status: 'completed', 
      completedAt: new Date().toISOString() 
    });

    // Update finding to resolved
    store.updateFinding(finding.id, {
      status: 'resolved'
    });

    console.log(`[Action Job] ✅ Finding ${finding.id} resolved and removed from ${finding.source}`);
  }
}

module.exports = { start, stop, processPendingActions };
