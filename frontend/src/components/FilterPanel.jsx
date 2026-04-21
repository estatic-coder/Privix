// ============================================================
// Privix — Component: FilterPanel (Polished v3)
// ============================================================

import { useState } from 'react';
import { Shield, Activity } from 'lucide-react';

const RISK_FILTERS = [
  { id: 'all',      label: 'ALL LEVELS',   color: '#00ffff' },
  { id: 'critical', label: 'CRITICAL',     color: '#ff003c' },
  { id: 'high',     label: 'HIGH',         color: '#ff6b00' },
  { id: 'medium',   label: 'MEDIUM',       color: '#ffb86c' },
  { id: 'low',      label: 'LOW',          color: '#00ff41' },
];

const STATUS_FILTERS = [
  { id: 'all',            label: 'TOTAL',     color: '#00ffff' },
  { id: 'active',         label: 'ACTIVE',    color: '#ff003c' },
  { id: 'action_pending', label: 'PENDING',   color: '#ffb86c' },
  { id: 'resolved',       label: 'SECURED',   color: '#00ffff' },
];

const mono = { fontFamily: "'JetBrains Mono', monospace" };

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

  const getChipStyle = (active, color) => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: '6px 14px',
    fontSize: '0.62rem', fontWeight: 800,
    letterSpacing: '0.12em', textTransform: 'uppercase',
    cursor: 'pointer', ...mono,
    background: active ? `${color}1A` : 'transparent',
    color: active ? color : 'rgba(255,255,255,0.4)',
    border: `1px solid ${active ? color : 'rgba(255,255,255,0.1)'}`,
    transition: 'all 0.15s ease',
    boxShadow: active ? `inset 0 0 10px ${color}10, 0 0 10px ${color}10` : 'none',
  });

  return (
    <div style={{
      background: 'rgba(0,0,0,0.85)',
      border: '1px solid rgba(0,255,65,0.3)',
      borderTop: '2px solid #00ff41',
      padding: '16px 24px',
      display: 'flex',
      flexDirection: 'row',
      gap: '32px',
      flexWrap: 'wrap',
      alignItems: 'center',
      ...mono,
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      position: 'relative',
    }}>
      {/* Decorative scan-line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, #00ff41, transparent)',
        opacity: 0.5
      }} />

      {/* Risk Level */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <span style={{ 
          fontSize: '0.6rem', color: 'rgba(0,255,65,0.6)', fontWeight: 700, 
          letterSpacing: '0.15em', textTransform: 'uppercase', 
          display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          <Shield size={12} style={{ color: '#00ff41' }} /> THREAT LEVEL
        </span>
        <div style={{ display: 'flex', gap: '6px' }}>
          {RISK_FILTERS.map((r) => (
            <button 
              key={r.id} 
              style={getChipStyle(activeRisk === r.id, r.color)} 
              onClick={() => handleRisk(r.id)}
              onMouseEnter={e => {
                if(activeRisk !== r.id) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                }
              }}
              onMouseLeave={e => {
                if(activeRisk !== r.id) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                }
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

      {/* Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <span style={{ 
          fontSize: '0.6rem', color: 'rgba(0,255,65,0.6)', fontWeight: 700, 
          letterSpacing: '0.15em', textTransform: 'uppercase', 
          display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          <Activity size={12} style={{ color: '#00ff41' }} /> STATUS
        </span>
        <div style={{ display: 'flex', gap: '6px' }}>
          {STATUS_FILTERS.map((s) => (
            <button 
              key={s.id} 
              style={getChipStyle(activeStatus === s.id, s.color)} 
              onClick={() => handleStatus(s.id)}
              onMouseEnter={e => {
                if(activeStatus !== s.id) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                }
              }}
              onMouseLeave={e => {
                if(activeStatus !== s.id) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                }
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
