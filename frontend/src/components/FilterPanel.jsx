// ============================================================
// Anonymous — Component: FilterPanel
// ============================================================

import { useState } from 'react';

const RISK_FILTERS = ['all', 'critical', 'high', 'medium', 'low'];
const STATUS_FILTERS = ['all', 'active', 'action_pending', 'resolved'];

export default function FilterPanel({ onFilterChange }) {
  const [activeRisk, setActiveRisk] = useState('all');
  const [activeStatus, setActiveStatus] = useState('all');

  function handleRisk(risk) {
    setActiveRisk(risk);
    onFilterChange({
      risk: risk === 'all' ? '' : risk,
      status: activeStatus === 'all' ? '' : activeStatus,
    });
  }

  function handleStatus(status) {
    setActiveStatus(status);
    onFilterChange({
      risk: activeRisk === 'all' ? '' : activeRisk,
      status: status === 'all' ? '' : status,
    });
  }

  return (
    <div className="filter-panel">
      <div style={{ width: '100%', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Risk Level
        </span>
      </div>
      {RISK_FILTERS.map((r) => (
        <button
          key={r}
          className={`filter-chip ${activeRisk === r ? 'active' : ''}`}
          onClick={() => handleRisk(r)}
        >
          {r === 'all' ? '🔍 All' : r === 'critical' ? '🔴 Critical' : r === 'high' ? '🟠 High' : r === 'medium' ? '🟡 Medium' : '🟢 Low'}
        </button>
      ))}

      <div style={{ width: '100%', margin: '8px 0', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Status
        </span>
      </div>
      {STATUS_FILTERS.map((s) => (
        <button
          key={s}
          className={`filter-chip ${activeStatus === s ? 'active' : ''}`}
          onClick={() => handleStatus(s)}
        >
          {s === 'all' ? 'All' : s === 'action_pending' ? 'Pending' : s.charAt(0).toUpperCase() + s.slice(1)}
        </button>
      ))}
    </div>
  );
}
