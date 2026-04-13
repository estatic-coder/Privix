// ============================================================
// Anonymous — Backend: Scan Controller
// ============================================================

const { executeScan, getScanStatus } = require('../services/scanService');

/**
 * POST /api/scans — Start a new scan
 */
async function startScan(req, res) {
  try {
    const { name, email, phone, username, address, city, state, dob, password } = req.body;

    if (!email && !name) {
      return res.status(400).json({
        error: 'At least a name or email is required to start a scan.',
      });
    }

    const result = await executeScan({ name, email, phone, username, address, city, state, dob, password });

    res.status(200).json({
      success: true,
      message: `Scan completed. ${result.findings.length} exposure(s) found.`,
      data: result,
    });
  } catch (err) {
    console.error('[ScanController] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/scans/:scanId — Get scan status
 */
function getStatus(req, res) {
  const { scanId } = req.params;
  const status = getScanStatus(scanId);
  if (!status) {
    return res.status(404).json({ error: 'Scan not found' });
  }
  res.json({ success: true, data: status });
}

module.exports = { startScan, getStatus };
