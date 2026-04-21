export default function RiskBadge({ risk }) {
  const config = {
    critical: { label: 'CRITICAL', color: '#ff003c', bg: 'rgba(255,0,60,0.1)', border: 'rgba(255,0,60,0.4)' },
    high:     { label: 'HIGH',     color: '#ff8c00', bg: 'rgba(255,140,0,0.1)', border: 'rgba(255,140,0,0.4)' },
    medium:   { label: 'MEDIUM',   color: '#ffb86c', bg: 'rgba(255,184,108,0.1)', border: 'rgba(255,184,108,0.4)' },
    low:      { label: 'LOW',      color: '#00ff41', bg: 'rgba(0,255,65,0.1)', border: 'rgba(0,255,65,0.4)' },
  };

  const c = config[risk] || { label: risk?.toUpperCase(), color: '#fff', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.2)' };

  return (
    <span style={{
      padding: '3px 8px',
      background: c.bg,
      border: `1px solid ${c.border}`,
      color: c.color,
      fontSize: '0.65rem',
      fontWeight: 700,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      {c.label}
    </span>
  );
}
