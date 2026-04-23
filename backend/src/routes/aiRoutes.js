const express = require('express');
const { generatePrivacyAdvice } = require('../services/aiAdvisorService');
const store = require('../../../database/store');
const { calculateGlobalRisk } = require('../../../matcher-engine/scoring');

const router = express.Router();

router.post('/advice', async (req, res) => {
  const { scanId, riskScore } = req.body || {};

  if (!scanId) {
    return res.status(400).json({ error: 'scanId is required' });
  }

  const scan = store.getScanById(scanId);
  if (!scan) {
    return res.status(404).json({ error: 'Scan not found' });
  }

  const findings = store.getFindingsByScan(scanId);
  const resolvedRiskScore =
    typeof riskScore === 'number' ? riskScore : calculateGlobalRisk(findings);

  try {
    const advice = await generatePrivacyAdvice(findings, resolvedRiskScore);
    return res.json({ success: true, data: advice });
  } catch (err) {
    console.error('[AI Route] Advice generation failed:', err.message);
    return res.status(500).json({ error: 'AI generation failed' });
  }
});

module.exports = router;