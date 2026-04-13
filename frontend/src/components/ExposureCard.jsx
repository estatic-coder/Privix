// ============================================================
// Anonymous — Component: ExposureCard
// ============================================================

import { useState } from 'react';
import RiskBadge from './RiskBadge';

export default function ExposureCard({ finding, onRequestDeletion }) {
  const [expanded, setExpanded] = useState(false);
  const confidencePercent = (finding.confidence * 100).toFixed(0);

  const statusLabel = {
    active: 'Active',
    action_pending: 'Pending',
    resolved: 'Resolved',
    possibly_resolved: 'Checking…',
    reappeared: 'Reappeared',
  };

  return (
    <div className={`exposure-card risk-${finding.risk} animate-in`}>
      <div className="exposure-header" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        {finding.rawData?.hibpData?.LogoPath && (
          <img 
            src={finding.rawData.hibpData.LogoPath} 
            alt={finding.rawData.hibpData.Title} 
            style={{ width: '48px', height: '48px', objectFit: 'contain', background: '#fff', borderRadius: '4px', padding: '4px' }}
          />
        )}
        <div style={{ flex: 1 }}>
          <div className="exposure-source" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {finding.source}
            {finding.rawData?.hibpData && (
              <span style={{ fontSize: '0.65rem', background: '#0d6efd', color: '#fff', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Verified Breach</span>
            )}
          </div>
          <div style={{ marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            First seen: {finding.rawData?.hibpData?.BreachDate || new Date(finding.firstSeen).toLocaleDateString()}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          <RiskBadge risk={finding.risk} />
          <span className={`status-badge ${finding.status}`}>
            {statusLabel[finding.status] || finding.status}
          </span>
        </div>
      </div>

      <div className="exposure-meta">
        <div className="exposure-meta-item">
          <span className="label">Confidence:</span>
          <strong>{confidencePercent}%</strong>
        </div>
        <div className="exposure-meta-item">
          <span className="label">Last Seen:</span>
          {new Date(finding.lastSeen).toLocaleDateString()}
        </div>
      </div>

      <div className="exposure-data-tags">
        {(finding.rawData?.hibpData?.DataClasses || finding.dataFound || []).map((field) => (
          <span key={field} className="data-tag">{field}</span>
        ))}
      </div>

      <div className="exposure-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button 
            className="btn btn-ghost btn-sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Hide Details' : 'View Details'}
          </button>
        </div>
        <div>
          {finding.status === 'active' && (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => onRequestDeletion && onRequestDeletion(finding.id)}
            >
              🗑️ Request Deletion
            </button>
          )}
        {finding.status === 'action_pending' && (
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-warning)' }}>
            ⏳ Deletion request submitted
          </span>
        )}
        {finding.status === 'resolved' && (
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-success)' }}>
            ✅ Resolved
          </span>
        )}
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
          {finding.rawData?.hibpData ? (
            <div>
              <p 
                style={{ color: 'var(--text-primary)', lineHeight: '1.6', marginBottom: '16px' }}
                dangerouslySetInnerHTML={{ __html: finding.rawData.hibpData.Description }}
              ></p>
              {finding.rawData.hibpData.PwnCount && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '8px' }}>
                  <strong>Impact:</strong> {finding.rawData.hibpData.PwnCount.toLocaleString()} impacted accounts
                </div>
              )}
              {finding.rawData.password && (
                <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,0,60,0.1)', border: '1px dashed var(--accent-danger)', borderRadius: '4px' }}>
                  <strong style={{ color: 'var(--accent-danger)' }}>PASSWORD EXPOSED:</strong> <span style={{ fontFamily: 'var(--font-mono)' }}>{finding.rawData.password}</span>
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontFamily: 'var(--font-mono)' }}>
              {Object.entries(finding.rawData || {}).map(([k, v]) => {
                if (!v) return null;
                const isUrl = typeof v === 'string' && (v.startsWith('http://') || v.startsWith('https://'));
                return (
                  <div key={k} style={{ marginBottom: '4px' }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>{k.toUpperCase()}:</strong>{' '}
                    {isUrl ? (
                      <a href={v} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-info)', textDecoration: 'underline' }}>{v}</a>
                    ) : (
                      <span style={{ color: k === 'password' ? 'var(--accent-danger)' : 'var(--text-primary)' }}>{v}</span>
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
