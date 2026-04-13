// ============================================================
// Anonymous — Matcher Engine: Rules
// ============================================================
// Defines what constitutes a match and the weight of each token type.
// ============================================================

const RULES = {
  // Token type → base confidence weight
  weights: {
    email: 0.95,
    phone: 0.90,
    name: 0.40,
    username: 0.75,
    address: 0.60,
    city: 0.30,
    state: 0.20,
    dob: 0.85,
    password: 0.95,
  },

  // Combination bonuses — when multiple tokens match together
  comboBonuses: {
    'name+email': 0.15,
    'name+phone': 0.12,
    'name+city': 0.10,
    'name+address': 0.20,
    'email+phone': 0.10,
    'name+dob': 0.15,
    'email+password': 0.20,
    'username+password': 0.20,
  },

  // Minimum confidence to keep a finding (below this = discard)
  minConfidence: 0.65,

  // Risk thresholds
  riskThresholds: {
    critical: 0.90,
    high: 0.80,
    medium: 0.70,
    low: 0.0,
  },
};

module.exports = RULES;
