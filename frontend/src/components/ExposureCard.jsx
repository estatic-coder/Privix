import { useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, ChevronDown, ChevronUp, Trash2, ExternalLink, Activity } from 'lucide-react';
import RiskBadge from './RiskBadge';

export default function ExposureCard({ finding, onRequestDeletion }) {
  const [expanded, setExpanded] = useState(false);
  const confidencePercent = (finding.confidence * 100).toFixed(0);

  const statusLabel = {
    active: 'Active Threat',
    action_pending: 'Requesting...',
    resolved: 'Secured',
    possibly_resolved: 'Checking...',
    reappeared: 'Re-emerged',
  };

  const statusIcons = {
    active: <ShieldAlert size={14} />,
    action_pending: <Activity size={14} className="animate-pulse" />,
    resolved: <ShieldCheck size={14} />,
  };

  return (
    <div className={`brutalist-card mb-4`}>
      <div className="flex items-start justify-between border-b border-[var(--accent-primary)] pb-4 mb-4 gap-4">
        <div className="flex items-start gap-4 flex-1">
          {finding.rawData?.hibpData?.LogoPath ? (
            <div className="w-12 h-12 flex items-center justify-center bg-black border border-[var(--accent-primary)] p-1">
              <img 
                src={finding.rawData.hibpData.LogoPath} 
                alt={finding.rawData.hibpData.Title} 
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-12 h-12 flex items-center justify-center bg-black border border-[var(--accent-primary)]">
              <Shield size={24} className="text-green-500" />
            </div>
          )}

          <div className="flex-1">
            <div className="font-bold text-lg text-green-500 uppercase font-mono tracking-wider">
              {finding.source}
              {finding.rawData?.hibpData && (
                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 border border-green-500 bg-green-500/20 text-green-500 text-[10px] font-bold uppercase tracking-widest">
                  Verified Breach
                </span>
              )}
            </div>
            <div className="text-[11px] text-green-500/60 mt-1 font-mono uppercase">
              DETECTED: {finding.rawData?.hibpData?.BreachDate || new Date(finding.firstSeen).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <RiskBadge risk={finding.risk} />
          <div className={`flex items-center gap-1 px-2 py-1 border text-xs font-bold uppercase ${finding.status === 'resolved' ? 'border-cyan-400 text-cyan-400' : 'border-red-500 text-red-500'}`}>
            {statusIcons[finding.status] || <Shield size={12} />}
            {statusLabel[finding.status] || finding.status}
          </div>
        </div>
      </div>

      <div className="flex gap-8 mb-4 border-b border-green-500/20 pb-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-green-500/60 uppercase font-mono tracking-widest">Confidence</span>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1 bg-green-500/20 overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: `${confidencePercent}%` }} />
            </div>
            <strong className="text-green-500 font-mono text-xs">{confidencePercent}%</strong>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-green-500/60 uppercase font-mono tracking-widest">Last Seen</span>
          <span className="font-mono text-[11px] text-green-500">{new Date(finding.lastSeen).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {(finding.rawData?.hibpData?.DataClasses || finding.dataFound || []).map((field) => (
          <span key={field} className="px-2 py-1 text-[10px] font-mono uppercase bg-green-500/10 border border-green-500/30 text-green-500">
            {field}
          </span>
        ))}
      </div>

      <div className="flex justify-between items-center mt-4">
        <button 
          className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-green-500/80 hover:text-green-500 transition-colors bg-transparent border-none cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {expanded ? 'Collapse' : 'System Details'}
        </button>

        <div className="flex items-center gap-3">
          {finding.status === 'active' && (
            <button
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-bold uppercase text-red-500 border border-red-500 hover:bg-red-500/10 transition-colors bg-transparent cursor-pointer"
              onClick={() => onRequestDeletion && onRequestDeletion(finding.id)}
            >
              <Trash2 size={14} />
              Redact Record
            </button>
          )}
          {finding.status === 'action_pending' && (
            <div className="flex items-center gap-2 text-[11px] text-yellow-500 font-bold uppercase tracking-widest">
              <Activity size={12} className="animate-spin" />
              Processing Deletion
            </div>
          )}
          {finding.status === 'resolved' && (
            <div className="flex items-center gap-2 text-[11px] text-cyan-400 font-bold uppercase tracking-widest">
              <ShieldCheck size={14} />
              Vault Secured
            </div>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-[var(--accent-primary)] font-mono text-sm">
          {finding.rawData?.hibpData ? (
            <div>
              <p 
                className="text-green-500/80 text-xs leading-relaxed"
                dangerouslySetInnerHTML={{ __html: finding.rawData.hibpData.Description }}
              ></p>
              
              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-green-500/20">
                {finding.rawData.hibpData.PwnCount && (
                  <div className="text-[11px] text-green-500">
                    <strong className="text-green-500/60 uppercase">Est. Impact:</strong> {finding.rawData.hibpData.PwnCount.toLocaleString()} ACCOUNTS
                  </div>
                )}
                {finding.rawData.hibpData.Domain && (
                  <div className="text-[11px] text-green-500 flex items-center gap-1">
                    <strong className="text-green-500/60 uppercase">Domain:</strong> 
                    <a href={`https://${finding.rawData.hibpData.Domain}`} target="_blank" rel="noreferrer" className="text-cyan-400 flex items-center gap-1 hover:underline">
                      {finding.rawData.hibpData.Domain} <ExternalLink size={10} />
                    </a>
                  </div>
                )}
              </div>

              {finding.rawData.password && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500">
                  <div className="flex items-center gap-2 text-red-500 font-bold text-[11px] tracking-widest uppercase mb-1">
                    <ShieldAlert size={14} />
                    Critical: Password Exposed
                  </div>
                  <div className="font-mono text-white text-sm break-all">
                    {finding.rawData.password}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 text-xs">
              {Object.entries(finding.rawData || {}).map(([k, v]) => {
                if (!v || typeof v === 'object') return null;
                const isUrl = typeof v === 'string' && (v.startsWith('http://') || v.startsWith('https://'));
                return (
                  <div key={k} className="flex justify-between items-center py-1 border-b border-green-500/10 last:border-0">
                    <span className="text-[10px] text-green-500/60 font-bold uppercase tracking-tight">{k.replace(/_/g, ' ')}</span>
                    <span className="text-[11px] font-mono text-green-500">
                      {isUrl ? (
                        <a href={v} target="_blank" rel="noreferrer" className="text-cyan-400 flex items-center gap-1 hover:underline">
                          SOURCE <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span className={k === 'password' ? 'text-red-500 font-bold' : ''}>
                          {String(v)}
                        </span>
                      )}
                    </span>
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
