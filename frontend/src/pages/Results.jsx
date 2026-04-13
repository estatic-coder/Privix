// ============================================================
// Privix — Page: Scan Results
// ============================================================
// Shows findings from the latest completed scan only.
// Findings are passed as a prop from App (never fetched stale).
// Filtering is performed locally — no polling, no stale data.
// ============================================================

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ExposureCard from '../components/ExposureCard';
import FilterPanel from '../components/FilterPanel';
import { requestDeletion } from '../services/api';

export default function Results({ userId, hasScanned, findings, riskScore, onFindingsUpdate }) {
  const [filters, setFilters] = useState({});
  const navigate = useNavigate();

  // Filter findings locally — no API round-trip needed
  const filtered = useMemo(() => {
    let result = [...findings];
    if (filters.status) result = result.filter((f) => f.status === filters.status);
    if (filters.risk)   result = result.filter((f) => f.risk   === filters.risk);
    if (filters.source) result = result.filter((f) =>
      f.source.toLowerCase().includes(filters.source.toLowerCase())
    );
    // Sort by confidence descending
    result.sort((a, b) => b.confidence - a.confidence);
    return result;
  }, [findings, filters]);

  async function handleDeletion(findingId) {
    if (!userId) return;
    try {
      await requestDeletion(findingId, userId);
      // Optimistic local update — no re-fetch required
      onFindingsUpdate((prev) =>
        prev.map((f) => f.id === findingId ? { ...f, status: 'action_pending' } : f)
      );
    } catch (err) {
      console.error('Deletion failed:', err);
    }
  }

  // ── Empty state: no scan has been run this session ────────────────────
  if (!hasScanned) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">
            Scan <span className="highlight">Results</span>
          </h1>
        </div>
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No results yet</h3>
          <p>Run a scan first to see your exposure results here.</p>
          <button
            className="btn btn-primary btn-lg"
            style={{ marginTop: '24px' }}
            onClick={() => navigate('/scan')}
          >
            🔍 Start a Scan
          </button>
        </div>
      </div>
    );
  }

  // ── Results view ──────────────────────────────────────────────────────
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          Scan <span className="highlight">Results</span>
        </h1>
        <p className="page-description">
          {findings.length} finding{findings.length !== 1 ? 's' : ''} from your latest scan.
          {riskScore !== null && (
            <span style={{ marginLeft: '12px', fontWeight: 600 }}>
              Risk Score: <span className="highlight">{riskScore}/100</span>
            </span>
          )}
        </p>
      </div>

      <FilterPanel onFilterChange={setFilters} />

      {filtered.length > 0 ? (
        <div className="results-grid">
          {filtered.map((finding, index) => (
            <div
              key={finding.id || finding.source}
              className="animate-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <ExposureCard
                finding={finding}
                onRequestDeletion={handleDeletion}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            {findings.length === 0 ? '🎉' : '🔎'}
          </div>
          <h3>
            {findings.length === 0
              ? 'No exposures found!'
              : 'No findings match your filters'}
          </h3>
          <p>
            {findings.length === 0
              ? 'Great news — no data exposures were detected in this scan.'
              : 'Try adjusting the filters above or run a new scan.'}
          </p>
        </div>
      )}
    </div>
  );
}
