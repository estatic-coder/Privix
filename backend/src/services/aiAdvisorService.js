const { GoogleGenerativeAI } = require('@google/generative-ai');

const RISK_LABELS = {
  critical: 'critical',
  high: 'high',
  medium: 'medium',
  low: 'low',
};

const DEFAULT_CHAT_FOLLOW_UPS = ['Secure accounts', 'Remove data', 'Show steps', 'Done'];

function normalizeFindings(findings) {
  return Array.isArray(findings) ? findings : [];
}

function severityWeight(risk) {
  if (risk === 'critical') return 4;
  if (risk === 'high') return 3;
  if (risk === 'medium') return 2;
  return 1;
}

function getRiskTier(riskScore) {
  const score = Number.isFinite(riskScore) ? riskScore : 0;
  if (score >= 70) return 'high';
  if (score >= 35) return 'medium';
  return 'low';
}

function buildTopRiskStatements(findings) {
  const topFindings = [...findings]
    .sort((a, b) => {
      const weightDiff = severityWeight(b.risk) - severityWeight(a.risk);
      if (weightDiff !== 0) return weightDiff;
      return (b.confidence || 0) - (a.confidence || 0);
    })
    .slice(0, 3);

  return topFindings.map((finding) => {
    const source = finding.source || 'Unknown source';
    const dataKinds = Array.isArray(finding.dataFound) && finding.dataFound.length > 0
      ? finding.dataFound.join(', ')
      : 'personal identifiers';
    const riskLabel = RISK_LABELS[finding.risk] || 'elevated';
    return `${source}: ${riskLabel} exposure of ${dataKinds}.`;
  });
}

function buildActionPlan(riskTier, findings) {
  const common = [
    'Enable multi-factor authentication on your primary email and critical accounts.',
    'Rotate passwords for accounts that reuse credentials exposed in old breaches.',
    'Submit data removal requests to brokers where your record appears.',
  ];

  if (riskTier === 'high') {
    return [
      'Freeze your credit and add fraud alerts with major bureaus today.',
      'Audit financial and email account activity for unfamiliar logins or transactions.',
      common[2],
    ];
  }

  if (riskTier === 'medium') {
    return [
      common[0],
      common[1],
      'Remove public profile details (address, phone, birthdate) from people-search sites.',
    ];
  }

  if (findings.length > 0) {
    return [common[0], common[2], 'Set a monthly reminder to re-scan and track new exposures.'];
  }

  return [
    'Keep account recovery details current and store backup codes securely.',
    'Use unique passwords for every account with a password manager.',
    'Run periodic scans to detect new leaks early.',
  ];
}

function buildFallbackAdvice(findings, riskScore, reason) {
  const safeFindings = normalizeFindings(findings);
  const riskTier = getRiskTier(riskScore);
  const bySeverity = safeFindings.reduce(
    (acc, finding) => {
      const key = RISK_LABELS[finding.risk] || 'low';
      acc[key] += 1;
      return acc;
    },
    { critical: 0, high: 0, medium: 0, low: 0 }
  );

  const total = safeFindings.length;
  const riskSummary =
    total > 0
      ? `${total} total exposures (${bySeverity.critical} critical, ${bySeverity.high} high, ${bySeverity.medium} medium).`
      : 'No confirmed exposures were found in this scan.';

  const summary =
    riskTier === 'high'
      ? `Your risk is elevated. ${riskSummary} Prioritize account hardening and identity-fraud safeguards now.`
      : riskTier === 'medium'
        ? `Your risk is moderate. ${riskSummary} You can reduce impact with password updates and broker removals.`
        : `Your immediate risk is lower. ${riskSummary} Keep monitoring and strengthen account protections.`;

  const risks = buildTopRiskStatements(safeFindings);
  const actions = buildActionPlan(riskTier, safeFindings);

  return {
    summary,
    risks: risks.length > 0 ? risks : ['No specific high-priority risks were identified from current findings.'],
    actions,
    source: 'local_fallback',
    note: reason || 'Generated without external AI provider.',
  };
}

function buildPrompt(findings, riskScore) {
  return `
You are a privacy expert.

User exposure findings:
${JSON.stringify(findings, null, 2)}

Risk score: ${riskScore}

Explain:
1. Why this is risky
2. Top 3 risks
3. What the user should do

Rules:
- Keep it simple
- Non-technical language
- Max 150 words
- Return ONLY valid JSON:
{
  "summary": "",
  "risks": [],
  "actions": []
}
`;
}

const INTENT_RULES = {
  RISK_SUMMARY:
    'Identify the SINGLE biggest risk from the findings and explain clearly why it matters. Be specific — name the source and data type exposed.',
  QUICK_FIX:
    'Give exactly 2–3 concrete, immediate actions the user can take TODAY to reduce their exposure. No theory — only actionable steps.',
  STEP_BY_STEP:
    'Provide a numbered step-by-step action plan (at least 4 steps). Each step must be a clear, distinct action with no duplication.',
  IDENTITY_RISK:
    'Start your answer with YES or NO depending on whether identity theft is a real risk. Then briefly explain why, referencing the findings.',
  GENERAL:
    'Give helpful, concise privacy advice tailored to the question and the findings.',
};

/**
 * Local fallback that returns a DIFFERENT answer for each intent.
 * Used when AI is unavailable OR returns an empty response.
 */
function buildIntentFallback(findings, riskScore, intent) {
  const safeFindings = normalizeFindings(findings);
  const riskTier = getRiskTier(riskScore);
  const topRisks = buildTopRiskStatements(safeFindings);
  const actions = buildActionPlan(riskTier, safeFindings);

  const topRisk = topRisks[0] || 'Unknown exposure detected.';
  const action1 = actions[0] || 'Enable multi-factor authentication on your primary accounts.';
  const action2 = actions[1] || 'Rotate any reused or weak passwords.';
  const action3 = actions[2] || 'Submit data removal requests to broker sites.';

  const criticalCount = safeFindings.filter((f) => f.risk === 'critical').length;
  const highCount = safeFindings.filter((f) => f.risk === 'high').length;

  switch (intent) {
    case 'RISK_SUMMARY':
      return topRisks.length > 0
        ? `Your biggest risk: ${topRisk} With a risk score of ${riskScore}, this is your most urgent concern and should be addressed immediately.`
        : `Your risk score is ${riskScore}. No specific critical exposures found yet, but keep monitoring for new leaks.`;

    case 'QUICK_FIX':
      return `Here are your top immediate actions:\n1. ${action1}\n2. ${action2}\n3. ${action3}`;

    case 'STEP_BY_STEP':
      return [
        '1. Log in to your primary email and enable two-factor authentication.',
        '2. Change passwords on any accounts linked to exposed email addresses.',
        `3. ${action3}`,
        '4. Set a Google Alert for your full name and email to monitor future leaks.',
        '5. Re-scan in 7 days to verify exposure is reduced.',
      ].join('\n');

    case 'IDENTITY_RISK': {
      const identityAtRisk = criticalCount > 0 || highCount > 0 || riskScore >= 50;
      return identityAtRisk
        ? `YES — your identity is at risk. You have ${criticalCount} critical and ${highCount} high-severity exposures with a risk score of ${riskScore}. Act now: freeze your credit and enable fraud alerts.`
        : `NO — your identity risk appears low right now (score: ${riskScore}). However, stay vigilant by enabling MFA and monitoring for new breaches.`;
    }

    default:
      return `Your privacy score is ${riskScore}. ${topRisk} Focus on enabling MFA and removing your data from broker sites.`;
  }
}

function buildChatPrompt(findings, riskScore, question, intent) {
  const rule = INTENT_RULES[intent] || INTENT_RULES.GENERAL;

  // Slim the findings to avoid overwhelming the prompt — send only the top 5
  // most severe items with just the fields Gemini needs.
  const slimFindings = normalizeFindings(findings)
    .sort((a, b) => severityWeight(b.risk) - severityWeight(a.risk))
    .slice(0, 5)
    .map((f) => ({
      source: f.source,
      risk: f.risk,
      dataFound: Array.isArray(f.dataFound) ? f.dataFound.slice(0, 4) : [],
    }));

  return `You are a cybersecurity privacy assistant for Privix.

User data:
- Risk score: ${riskScore}/100
- Top exposures (worst first): ${JSON.stringify(slimFindings)}

User intent: ${intent}
User question: "${question}"

STRICT RULES:
- Answer ONLY according to the INTENT RULE below. Do NOT give a generic privacy overview.
- Be concise and direct. Max 100 words.
- No filler phrases like "Great question" or "Certainly".

INTENT RULE: ${rule}

Return ONLY this JSON (no markdown, no extra text):
{"answer": "...", "followUps": ["...", "...", "...", "Done"]}`;
}


function extractJson(text) {
  if (!text || typeof text !== 'string') return null;

  const stripped = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  try {
    return JSON.parse(stripped);
  } catch {
    // Fall through to a best-effort extraction from the first JSON object.
  }

  const firstBrace = stripped.indexOf('{');
  const lastBrace = stripped.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }

  const candidate = stripped.slice(firstBrace, lastBrace + 1);
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

function normalizeAdvice(parsed, rawText) {
  if (!parsed || typeof parsed !== 'object') {
    return {
      summary: rawText || 'No advice available right now.',
      risks: [],
      actions: [],
    };
  }

  return {
    summary: typeof parsed.summary === 'string' ? parsed.summary : '',
    risks: Array.isArray(parsed.risks) ? parsed.risks : [],
    actions: Array.isArray(parsed.actions) ? parsed.actions : [],
  };
}

function extractUsableText(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const stripped = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  const parsedJson = extractJson(stripped);
  if (parsedJson) {
    if (typeof parsedJson.answer === 'string' && parsedJson.answer.trim()) {
      return parsedJson.answer.trim();
    }
    if (typeof parsedJson.summary === 'string' && parsedJson.summary.trim()) {
      return parsedJson.summary.trim();
    }
  }

  return stripped;
}

function uniqueNonEmptyStrings(values) {
  if (!Array.isArray(values)) return [];

  const output = [];
  const seen = new Set();

  for (const value of values) {
    if (typeof value !== 'string') continue;
    const cleaned = value.trim();
    if (!cleaned) continue;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(cleaned);
  }

  return output;
}

function normalizeFollowUps(followUps) {
  const cleaned = uniqueNonEmptyStrings(followUps).filter(
    (item) => item.toLowerCase() !== 'done'
  );

  const top = cleaned.slice(0, 4);
  return [...top, 'Done'];
}

function normalizeChatPayload(parsed, rawText) {
  const answerFromJson =
    parsed && typeof parsed === 'object' && typeof parsed.answer === 'string'
      ? parsed.answer.trim()
      : '';

  const answer = answerFromJson || extractUsableText(rawText) || 'I could not generate a useful response.';

  const jsonFollowUps =
    parsed && typeof parsed === 'object' && Array.isArray(parsed.followUps)
      ? parsed.followUps
      : [];

  const followUps = normalizeFollowUps(
    jsonFollowUps.length > 0 ? jsonFollowUps : DEFAULT_CHAT_FOLLOW_UPS
  );

  return { answer, followUps };
}

async function generatePrivacyAdvice(findings, riskScore) {
  const safeFindings = normalizeFindings(findings);
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return buildFallbackAdvice(safeFindings, riskScore, 'GEMINI_API_KEY is not configured.');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = buildPrompt(safeFindings, riskScore);

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = extractJson(text);
    const normalized = normalizeAdvice(parsed, text);

    const hasMeaningfulContent =
      (normalized.summary && normalized.summary.trim().length > 0) ||
      normalized.risks.length > 0 ||
      normalized.actions.length > 0;

    if (!hasMeaningfulContent) {
      return buildFallbackAdvice(safeFindings, riskScore, 'AI returned an empty response.');
    }

    return normalized;
  } catch (err) {
    return buildFallbackAdvice(
      safeFindings,
      riskScore,
      `AI provider error: ${err && err.message ? err.message : 'unknown error'}`
    );
  }
}

async function generatePrivacyChatAnswer(findings, riskScore, question, intent = 'GENERAL') {
  const safeFindings = normalizeFindings(findings);
  const safeQuestion = typeof question === 'string' ? question.trim() : '';
  const safeIntent = typeof intent === 'string' && INTENT_RULES[intent] ? intent : 'GENERAL';

  if (!safeQuestion) {
    return {
      answer: 'Please ask a question about your exposure risk or what to do next.',
      followUps: normalizeFollowUps(DEFAULT_CHAT_FOLLOW_UPS),
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      answer: buildIntentFallback(safeFindings, riskScore, safeIntent),
      followUps: normalizeFollowUps(DEFAULT_CHAT_FOLLOW_UPS),
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = buildChatPrompt(safeFindings, riskScore, safeQuestion, safeIntent);
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = extractJson(text);
    const payload = normalizeChatPayload(parsed, text);

    if (!payload.answer) {
      return {
        answer: buildIntentFallback(safeFindings, riskScore, safeIntent),
        followUps: normalizeFollowUps(DEFAULT_CHAT_FOLLOW_UPS),
      };
    }

    return payload;
  } catch (err) {
    console.error('[AI Chat] Gemini error:', err && err.message);
    return {
      answer: buildIntentFallback(safeFindings, riskScore, safeIntent),
      followUps: normalizeFollowUps(DEFAULT_CHAT_FOLLOW_UPS),
    };
  }
}

module.exports = { generatePrivacyAdvice, generatePrivacyChatAnswer };