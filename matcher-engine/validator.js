// ============================================================
// Anonymous — Matcher Engine: Validator
// ============================================================
// Validates and normalizes tokens before matching.
// ============================================================

function normalizeEmail(email) {
  if (!email || typeof email !== 'string') return null;
  return email.trim().toLowerCase();
}

function normalizePhone(phone) {
  if (!phone || typeof phone !== 'string') return null;
  // Strip everything except digits
  return phone.replace(/[^0-9]/g, '');
}

function normalizeName(name) {
  if (!name || typeof name !== 'string') return null;
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeGeneric(value) {
  if (!value || typeof value !== 'string') return null;
  return value.trim().toLowerCase();
}

function normalizeTokens(tokens) {
  const normalized = {};
  if (tokens.email) normalized.email = normalizeEmail(tokens.email);
  if (tokens.phone) normalized.phone = normalizePhone(tokens.phone);
  if (tokens.name) normalized.name = normalizeName(tokens.name);
  if (tokens.username) normalized.username = normalizeGeneric(tokens.username);
  if (tokens.address) normalized.address = normalizeGeneric(tokens.address);
  if (tokens.city) normalized.city = normalizeGeneric(tokens.city);
  if (tokens.state) normalized.state = normalizeGeneric(tokens.state);
  if (tokens.password) normalized.password = tokens.password; // keep case sensitive
  if (tokens.dob) normalized.dob = tokens.dob; // keep as-is (date string)
  return normalized;
}

function validateTokens(tokens) {
  const errors = [];
  if (!tokens || typeof tokens !== 'object') {
    return { valid: false, errors: ['Tokens must be an object'] };
  }

  const hasAtLeastOne = tokens.email || tokens.name || tokens.phone || tokens.password;
  if (!hasAtLeastOne) {
    errors.push('At least one of email, name, phone, or password is required');
  }

  if (tokens.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tokens.email.trim())) {
    errors.push('Invalid email format');
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { normalizeTokens, validateTokens, normalizeEmail, normalizePhone, normalizeName };
