import { useState } from 'react';
import { Shield, Activity, SlidersHorizontal, History } from 'lucide-react';

const RISK_FILTERS = [
  { id: 'all',      label: 'All Levels' },
  { id: 'critical', label: 'Critical' },
  { id: 'high',     label: 'High' },
  { id: 'medium',   label: 'Medium' },
  { id: 'low',      label: 'Low' },
];

const STATUS_FILTERS = [
  { id: 'all',            label: 'Total' },
  { id: 'active',         label: 'Active' },
  { id: 'action_pending', label: 'Pending' },
  { id: 'resolved',       label: 'Secured' },
];

export default function FilterPanel({ onFilterChange }) {
  const [activeRisk, setActiveRisk] = useState('all');
  const [activeStatus, setActiveStatus] = useState('all');

  function handleRisk(risk) {
    setActiveRisk(risk);
    onFilterChange({ risk: risk === 'all' ? '' : risk, status: activeStatus === 'all' ? '' : activeStatus });
  }

  function handleStatus(status) {
    setActiveStatus(status);
    onFilterChange({ risk: activeRisk === 'all' ? '' : activeRisk, status: status === 'all' ? '' : status });
  }

  const chipStyle = (active) => ({
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '5px 12px',
    fontSize: '0.65rem', fontWeight: 700,
    letterSpacing: '0.1em', textTransform: 'uppercase',
    fontFamily: "'JetBrains Mono', monospace",
    cursor: 'pointer',
    background: active ? 'rgba(0,255,65,0.12)' : 'transparent',
    color: active ? '#00ff41' : 'rgba(0,255,65,0.35)',
    border: active ? '1px solid rgba(0,255,65,0.45)' : '1px solid rgba(0,255,65,0.12)',
    transition: 'all 0.15s',
  });

  return (
    <div style={{
      background: 'rgba(0,0,0,0.6)',
      border: '1px solid rgba(0,255,65,0.2)',
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'row',
      gap: '24px',
      flexWrap: 'wrap',
      alignItems: 'center',
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      {/* Risk Level */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.6rem', color: 'rgba(0,255,65,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', marginRight: '4px' }}>
          <Shield size={10} style={{ display: 'inline', marginRight: '4px' }} />LEVEL:
        </span>
        {RISK_FILTERS.map((r) => (
          <button key={r.id} style={chipStyle(activeRisk === r.id)} onClick={() => handleRisk(r.id)}>
            {r.label}
          </button>
        ))}
      </div>

      <div style={{ width: '1px', height: '24px', background: 'rgba(0,255,65,0.15)', flexShrink: 0 }} />

      {/* Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.6rem', color: 'rgba(0,255,65,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', marginRight: '4px' }}>
          <Activity size={10} style={{ display: 'inline', marginRight: '4px' }} />STATUS:
        </span>
        {STATUS_FILTERS.map((s) => (
          <button key={s.id} style={chipStyle(activeStatus === s.id)} onClick={() => handleStatus(s.id)}>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
