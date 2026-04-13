// ============================================================
// Anonymous — Page: Results
// ============================================================

import { useState, useEffect } from 'react';
import ExposureCard from '../components/ExposureCard';
import FilterPanel from '../components/FilterPanel';
import { getFindings, requestDeletion } from '../services/api';

export default function Results({ userId }) {
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    if (userId) {
      loadFindings(false);
      const interval = setInterval(() => loadFindings(true), 3000);
      return () => clearInterval(interval);
    }
  }, [userId, filters]);

  async function loadFindings(silent = false) {
    try {
      if (!silent) setLoading(true);
      const res = await getFindings(userId, filters);
      if (res.success) {
        setFindings(res.data);
      }
    } catch (err) {
      console.error('Failed to load findings:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeletion(findingId) {
    try {
      await requestDeletion(findingId, userId);
      loadFindings();
    } catch (err) {
      console.error('Deletion failed:', err);
    }
  }

  function handleFilterChange(newFilters) {
    setFilters(newFilters);
  }

  if (!userId) {
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
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          Scan <span className="highlight">Results</span>
        </h1>
        <p className="page-description">
          {findings.length} finding{findings.length !== 1 ? 's' : ''} across all scans.
        </p>
      </div>

      <FilterPanel onFilterChange={handleFilterChange} />

      {loading ? (
        <div className="loading-overlay">
          <div className="spinner spinner-lg"></div>
          <p>Loading results...</p>
        </div>
      ) : findings.length > 0 ? (
        <div className="results-grid">
          {findings.map((finding, index) => (
            <div key={finding.id} className="animate-in" style={{ animationDelay: `${index * 0.05}s` }}>
              <ExposureCard
                finding={finding}
                onRequestDeletion={handleDeletion}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🔎</div>
          <h3>No findings match your filters</h3>
          <p>Try adjusting the filters above or run a new scan.</p>
        </div>
      )}
    </div>
  );
}
