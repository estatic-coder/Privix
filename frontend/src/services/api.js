// ============================================================
// Anonymous — Frontend: API Service
// ============================================================

const API_BASE = 'http://localhost:3001/api';

export async function startScan(tokens) {
  const res = await fetch(`${API_BASE}/scans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tokens),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Scan failed');
  }
  return res.json();
}

export async function getScanStatus(scanId) {
  const res = await fetch(`${API_BASE}/scans/${scanId}`);
  return res.json();
}

export async function getDashboard(userId) {
  const res = await fetch(`${API_BASE}/results/dashboard/${userId}`);
  return res.json();
}

export async function getFindings(userId, filters = {}) {
  const params = new URLSearchParams(filters);
  const res = await fetch(`${API_BASE}/results/findings/${userId}?${params}`);
  return res.json();
}

export async function getStats(userId) {
  const res = await fetch(`${API_BASE}/results/stats/${userId}`);
  return res.json();
}

export async function getAlerts(userId) {
  const res = await fetch(`${API_BASE}/results/alerts/${userId}`);
  return res.json();
}

export async function requestDeletion(findingId, userId) {
  const res = await fetch(`${API_BASE}/results/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ findingId, userId, type: 'deletion_request' }),
  });
  return res.json();
}

export async function markAlertsRead(userId) {
  const res = await fetch(`${API_BASE}/results/alerts/read`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, all: true }),
  });
  return res.json();
}

export async function healthCheck() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}
