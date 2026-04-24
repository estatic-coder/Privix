const express = require('express');
const { generatePrivacyChatAnswer } = require('../services/aiAdvisorService');
const store = require('../../../database/store');
const { calculateGlobalRisk } = require('../../../matcher-engine/scoring');

const router = express.Router();

router.post('/chat', async (req, res) => {
  const { question, scanId, riskScore, intent } = req.body || {};

  if (!question || typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({ error: 'question is required' });
  }

  const resolvedScan = scanId ? store.getScanById(scanId) : store.getLatestScan();
  const findings = resolvedScan ? store.getFindingsByScan(resolvedScan.id) : [];
  const resolvedRiskScore =
    typeof riskScore === 'number' ? riskScore : calculateGlobalRisk(findings);

  try {
    const chatPayload = await generatePrivacyChatAnswer(
      findings,
      resolvedRiskScore,
      question.trim(),
      intent || 'GENERAL'
    );
    return res.json(chatPayload);
  } catch (err) {
    console.error('[AI Advice Route] Chat generation failed:', err.message);
    return res.status(500).json({ error: 'AI chat generation failed' });
  }
});

module.exports = router;
