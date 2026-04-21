import { ShieldAlert, Calendar } from 'lucide-react';

export default function CyberTimeline({ findings }) {
  if (!findings || findings.length === 0) return null;

  const sorted = [...findings]
    .sort((a, b) => new Date(b.firstSeen) - new Date(a.firstSeen))
    .slice(0, 5);

  const riskColor = {
    critical: '#ff003c',
    high: '#ff8c00',
    medium: '#ffb86c',
    low: '#00ff41',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', border: '1px solid rgba(0,255,65,0.2)', background: 'rgba(0,0,0,0.6)', fontFamily: "'JetBrains Mono', monospace" }}>
      {/* Header */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(0,255,65,0.15)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '0.6rem', color: 'rgba(0,255,65,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          INCIDENT LOG — LAST {sorted.length} EVENTS
        </span>
      </div>

      {sorted.map((item, i) => (
        <div
          key={item.id}
          style={{
            display: 'grid',
            gridTemplateColumns: '4px 1fr',
            borderBottom: i < sorted.length - 1 ? '1px solid rgba(0,255,65,0.08)' : 'none',
          }}
        >
          {/* Color bar */}
          <div style={{ background: riskColor[item.risk] || '#00ff41' }} />

          {/* Content */}
          <div style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {item.source}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'rgba(0,255,65,0.5)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={10} />
                {new Date(item.firstSeen).toLocaleDateString()}
              </span>
            </div>

            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
              Compromised data: <span style={{ color: 'rgba(255,255,255,0.8)' }}>{item.dataFound?.join(', ') || 'Multiple Identifiers'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: riskColor[item.risk] || '#00ff41', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldAlert size={10} /> {item.risk} RISK
              </span>
              <span style={{ fontSize: '0.6rem', color: 'rgba(0,255,65,0.4)', fontFamily: 'monospace', textTransform: 'uppercase' }}>
                {item.location || 'GLOBAL REACH'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
