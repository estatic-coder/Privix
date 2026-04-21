// ============================================================
// Privix — Component: ExposureCard (Polished v3)
// ============================================================

import { useState } from 'react';
import {
  Shield, ShieldAlert, ShieldCheck, ChevronDown, ChevronUp,
  Trash2, ExternalLink, Activity, Lock, Eye, AlertTriangle,
} from 'lucide-react';

const mono = { fontFamily: "'JetBrains Mono', monospace" };

const RISK_META = {
  critical: { color: '#ff003c', bg: 'rgba(255,0,60,0.08)',  border: 'rgba(255,0,60,0.35)',  bar: '#ff003c', label: 'CRITICAL' },
  high:     { color: '#ff6b00', bg: 'rgba(255,107,0,0.08)', border: 'rgba(255,107,0,0.35)', bar: '#ff6b00', label: 'HIGH'     },
  medium:   { color: '#ffb86c', bg: 'rgba(255,184,108,0.08)',border: 'rgba(255,184,108,0.35)',bar:'#ffb86c', label: 'MEDIUM'   },
  low:      { color: '#00ff41', bg: 'rgba(0,255,65,0.06)',  border: 'rgba(0,255,65,0.3)',   bar: '#00ff41', label: 'LOW'      },
};

const STATUS_META = {
  active:           { label: 'ACTIVE THREAT',  color: '#ff003c', icon: ShieldAlert },
  action_pending:   { label: 'REQUESTING...',  color: '#ffb86c', icon: Activity    },
  resolved:         { label: 'SECURED',        color: '#00ffff', icon: ShieldCheck },
  possibly_resolved:{ label: 'CHECKING...',    color: '#ffb86c', icon: Activity    },
  reappeared:       { label: 'RE-EMERGED',     color: '#ff003c', icon: AlertTriangle},
};

export default function ExposureCard({ finding, onRequestDeletion }) {
  const [expanded, setExpanded] = useState(false);
  const [hovered,  setHovered]  = useState(false);

  const risk      = RISK_META[finding.risk]   || RISK_META.low;
  const statusMeta= STATUS_META[finding.status] || STATUS_META.active;
  const StatusIcon= statusMeta.icon;
  const conf      = Math.round((finding.confidence || 0) * 100);
  const dataFields= finding.rawData?.hibpData?.DataClasses || finding.dataFound || [];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...mono,
        position: 'relative',
        background: hovered ? `rgba(0,0,0,0.85)` : 'rgba(0,0,0,0.7)',
        border: `1px solid ${hovered ? risk.color : risk.border}`,
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: hovered ? `0 0 24px ${risk.color}18, inset 0 0 40px rgba(0,0,0,0.4)` : 'none',
        overflow: 'hidden',
      }}
    >
      {/* Left accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: 3, height: '100%',
        background: `linear-gradient(180deg, ${risk.color}, transparent)`,
      }} />

      {/* Top scan-line accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${risk.color}80, transparent)`,
      }} />

      {/* ── Main content ── */}
      <div style={{ padding: '16px 20px 16px 24px' }}>

        {/* Row 1: icon + source + badges */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
          
          {/* Left: icon + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
            {/* Icon box */}
            <div style={{
              width: 42, height: 42, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: risk.bg, border: `1px solid ${risk.border}`,
            }}>
              {finding.rawData?.hibpData?.LogoPath ? (
                <img src={finding.rawData.hibpData.LogoPath} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} />
              ) : (
                <Shield size={20} style={{ color: risk.color }} />
              )}
            </div>

            {/* Title + date */}
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: '0.95rem', fontWeight: 800, color: '#fff',
                letterSpacing: '-0.01em', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
              }}>
                {finding.source}
                {finding.rawData?.hibpData && (
                  <span style={{
                    fontSize: '0.55rem', fontWeight: 700, letterSpacing: '.12em',
                    padding: '2px 7px', color: '#00ffff',
                    background: 'rgba(0,255,255,0.08)', border: '1px solid rgba(0,255,255,0.3)',
                    textTransform: 'uppercase',
                  }}>
                    VERIFIED
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginTop: 3, letterSpacing: '.1em', textTransform: 'uppercase' }}>
                DETECTED: {finding.rawData?.hibpData?.BreachDate || new Date(finding.firstSeen).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Right: risk + status badges */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
            {/* Risk badge */}
            <div style={{
              padding: '4px 10px',
              background: risk.bg, border: `1px solid ${risk.border}`,
              fontSize: '0.6rem', fontWeight: 800, color: risk.color,
              letterSpacing: '.14em', textTransform: 'uppercase',
            }}>
              {risk.label}
            </div>
            {/* Status badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '3px 9px',
              background: `${statusMeta.color}10`,
              border: `1px solid ${statusMeta.color}50`,
              fontSize: '0.55rem', fontWeight: 700, color: statusMeta.color,
              letterSpacing: '.12em', textTransform: 'uppercase',
            }}>
              <StatusIcon size={10} />
              {statusMeta.label}
            </div>
          </div>
        </div>

        {/* Row 2: confidence + last seen */}
        <div style={{
          display: 'flex', gap: 28, alignItems: 'center',
          paddingBottom: 14, marginBottom: 14,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          {/* Confidence */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '.14em', textTransform: 'uppercase' }}>
              CONFIDENCE
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 72, height: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', position: 'relative' }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, height: '100%',
                  width: `${conf}%`, background: risk.bar,
                  boxShadow: `0 0 6px ${risk.bar}`,
                  transition: 'width 0.6s ease',
                }} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: risk.color }}>{conf}%</span>
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.07)' }} />

          {/* Last seen */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '.14em', textTransform: 'uppercase' }}>
              LAST SEEN
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>
              {new Date(finding.lastSeen).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Row 3: data class tags */}
        {dataFields.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {dataFields.map((field) => (
              <span key={field} style={{
                padding: '3px 9px',
                fontSize: '0.58rem', fontWeight: 700,
                letterSpacing: '.1em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.55)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
                {field}
              </span>
            ))}
          </div>
        )}

        {/* Row 4: actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          {/* Expand */}
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: '0.6rem', fontWeight: 700, letterSpacing: '.12em',
              textTransform: 'uppercase', color: 'rgba(0,255,65,0.5)',
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: 0, ...mono, transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#00ff41'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(0,255,65,0.5)'}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? 'COLLAPSE' : 'SYSTEM DETAILS'}
          </button>

          {/* CTA */}
          {finding.status === 'active' && (
            <button
              onClick={() => onRequestDeletion && onRequestDeletion(finding.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '7px 14px',
                fontSize: '0.62rem', fontWeight: 800,
                letterSpacing: '.12em', textTransform: 'uppercase',
                color: '#ff003c',
                background: 'rgba(255,0,60,0.06)',
                border: '1px solid rgba(255,0,60,0.35)',
                cursor: 'pointer', ...mono, transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,0,60,0.14)'; e.currentTarget.style.borderColor = '#ff003c'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,0,60,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,0,60,0.35)'; }}
            >
              <Trash2 size={13} />
              REDACT RECORD
            </button>
          )}

          {finding.status === 'action_pending' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.6rem', color: '#ffb86c', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase' }}>
              <Activity size={12} style={{ animation: 'spin 1.5s linear infinite' }} />
              PROCESSING DELETION
            </div>
          )}

          {finding.status === 'resolved' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.6rem', color: '#00ffff', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase' }}>
              <Lock size={12} />
              VAULT SECURED
            </div>
          )}
        </div>
      </div>

      {/* ── Expanded panel ── */}
      {expanded && (
        <div style={{
          borderTop: `1px solid rgba(255,255,255,0.07)`,
          background: 'rgba(0,0,0,0.4)',
          padding: '16px 24px',
          ...mono, fontSize: '0.78rem',
          animation: 'fadeIn 0.2s ease',
        }}>
          {finding.rawData?.hibpData ? (
            <>
              <p
                style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, fontSize: '0.75rem', marginBottom: 16 }}
                dangerouslySetInnerHTML={{ __html: finding.rawData.hibpData.Description }}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {finding.rawData.hibpData.PwnCount && (
                  <div style={{ fontSize: '0.68rem' }}>
                    <span style={{ color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Est. Impact: </span>
                    <span style={{ color: '#ff003c', fontWeight: 800 }}>{finding.rawData.hibpData.PwnCount.toLocaleString()}</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}> accounts</span>
                  </div>
                )}
                {finding.rawData.hibpData.Domain && (
                  <div style={{ fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Domain: </span>
                    <a href={`https://${finding.rawData.hibpData.Domain}`} target="_blank" rel="noreferrer"
                      style={{ color: '#00ffff', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                      {finding.rawData.hibpData.Domain} <ExternalLink size={10} />
                    </a>
                  </div>
                )}
              </div>
              {finding.rawData.password && (
                <div style={{ marginTop: 14, padding: '12px 16px', background: 'rgba(255,0,60,0.07)', border: '1px solid rgba(255,0,60,0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#ff003c', fontSize: '0.62rem', fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                    <ShieldAlert size={13} /> CRITICAL: PASSWORD EXPOSED
                  </div>
                  <div style={{ color: '#fff', fontSize: '0.82rem', wordBreak: 'break-all' }}>{finding.rawData.password}</div>
                </div>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {Object.entries(finding.rawData || {}).map(([k, v]) => {
                if (!v || typeof v === 'object') return null;
                const isUrl = typeof v === 'string' && v.startsWith('http');
                return (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em' }}>
                      {k.replace(/_/g, ' ')}
                    </span>
                    {isUrl ? (
                      <a href={v} target="_blank" rel="noreferrer" style={{ color: '#00ffff', fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                        SOURCE <ExternalLink size={9} />
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: k === 'password' ? '#ff003c' : 'rgba(255,255,255,0.65)', fontWeight: k === 'password' ? 800 : 500 }}>
                        {String(v)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
