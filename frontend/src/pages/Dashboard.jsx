import { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ShieldAlert, Activity, Globe, History, Search, Terminal, AlertTriangle, CheckCircle2, RefreshCw, Zap } from 'lucide-react';
import ExposureCard from '../components/ExposureCard';
import { getDashboard, requestDeletion, startScan } from '../services/api';
import CyberTimeline from '../components/CyberTimeline';
import Heatmap from '../components/Heatmap';
import StatCounter from '../components/StatCounter';
import RadarScanner from '../components/RadarScanner';
import BreachReveal from '../components/BreachReveal';
import FilterPanel from '../components/FilterPanel';

const mono = { fontFamily: "'JetBrains Mono', monospace" };

const DEFAULT_MODULES = [
  { name: 'Identity Engine',  status: 'pending' },
  { name: 'Breach Database',  status: 'pending' },
  { name: 'Surface Mirror',   status: 'pending' },
  { name: 'Darknet Crawler',  status: 'pending' },
];

const MOCK_LOGS = [
  "Initializing scan sequence...",
  "CONNECTING_TO_IDENTITY_NODES...",
  "SEARCHING: Breach databases (HIBP, DeHashed)...",
  "QUERYING: Social engineering vectors...",
  "ANALYZING: Metadata footprint...",
  "ENCRYPTING: Local identifiers...",
  "FETCHING: Compromised credentials...",
  "DECODING: Encrypted data packets...",
  "MATCH FOUND: Critical exposure in database A...",
  "MATCH FOUND: High risk in data broker node...",
  "Finalizing analytical report...",
];

// ── Shared input style ───────────────────────────────────────────────────────
const inputStyle = {
  width: '100%',
  background: 'rgba(0,0,0,0.7)',
  border: '1px solid rgba(0,255,65,0.2)',
  padding: '10px 14px',
  color: '#00ff41',
  fontSize: '0.85rem',
  outline: 'none',
  ...mono,
  letterSpacing: '0.04em',
};
const inputFocus = { borderColor: 'rgba(0,255,65,0.6)', background: 'rgba(0,255,65,0.04)' };
const inputBlur  = { borderColor: 'rgba(0,255,65,0.2)', background: 'rgba(0,0,0,0.7)' };

// ── Label style ──────────────────────────────────────────────────────────────
const labelStyle = {
  display: 'block', fontSize: '0.6rem', fontWeight: 700,
  color: 'rgba(0,255,65,0.5)', textTransform: 'uppercase',
  letterSpacing: '0.12em', marginBottom: '6px', ...mono,
};

// ── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({ icon: Icon, label, color = '#00ff41', accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
      <div style={{ width: '3px', height: '20px', background: color, flexShrink: 0 }} />
      <Icon size={15} style={{ color }} />
      <span style={{ fontSize: '0.75rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.12em', ...mono }}>
        {label}
      </span>
      {accent && (
        <span style={{ fontSize: '0.6rem', color: 'rgba(0,255,65,0.35)', letterSpacing: '0.1em', ...mono }}>
          {accent}
        </span>
      )}
    </div>
  );
}

// ── Panel wrapper ────────────────────────────────────────────────────────────
function Panel({ children, style = {} }) {
  return (
    <div style={{
      background: 'rgba(0,0,0,0.6)',
      border: '1px solid rgba(0,255,65,0.18)',
      padding: '24px',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard({
  userId,
  hasScanned,
  findings,
  riskScore,
  onScanComplete,
  onNewScan,
  onFindingsUpdate,
}) {
  const [data, setData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', phone: '', username: '' });
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [moduleStatuses, setModuleStatuses] = useState(DEFAULT_MODULES);
  const [scanError, setScanError] = useState('');
  const [breachFindings, setBreachFindings] = useState(null);
  const [filters, setFilters] = useState({});
  const [currentLogs, setCurrentLogs] = useState([]);

  const activeTimersRef = useRef([]);
  const progressIntervalRef = useRef(null);
  const pendingScanDataRef = useRef(null);
  const terminalRef = useRef(null);

  useEffect(() => {
    if (userId && hasScanned) {
      loadDashboard(false);
      const interval = setInterval(() => loadDashboard(true), 30000);
      return () => clearInterval(interval);
    }
  }, [userId, hasScanned]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [currentLogs]);

  async function loadDashboard(silent = false) {
    try {
      if (!silent) setDashboardLoading(true);
      const res = await getDashboard(userId);
      if (res.success) setData(res.data);
    } catch (err) {
      console.error('Dashboard load failed:', err);
    } finally {
      setDashboardLoading(false);
    }
  }

  const filteredFindings = useMemo(() => {
    if (!findings) return [];
    let result = [...findings];
    if (filters.status) result = result.filter((f) => f.status === filters.status);
    if (filters.risk)   result = result.filter((f) => f.risk   === filters.risk);
    if (filters.source) result = result.filter((f) => f.source.toLowerCase().includes(filters.source.toLowerCase()));
    result.sort((a, b) => b.confidence - a.confidence);
    return result;
  }, [findings, filters]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function cancelActiveTimers() {
    activeTimersRef.current.forEach((id) => clearTimeout(id));
    activeTimersRef.current = [];
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }

  async function handleScanSubmit(e) {
    e.preventDefault();
    if (!form.name && !form.email) { setScanError('Identifier required: name or email.'); return; }

    cancelActiveTimers();
    setScanError('');
    setBreachFindings(null);
    pendingScanDataRef.current = null;
    setProgress(0);
    setCurrentLogs([MOCK_LOGS[0]]);
    setModuleStatuses(DEFAULT_MODULES.map((m) => ({ ...m, status: 'running' })));
    setScanning(true);
    if (onNewScan) onNewScan();

    MOCK_LOGS.slice(1).forEach((log, i) => {
      const t = setTimeout(() => setCurrentLogs((prev) => [...prev, log]), (i + 1) * 800);
      activeTimersRef.current.push(t);
    });

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) { clearInterval(progressIntervalRef.current); progressIntervalRef.current = null; return 92; }
        return prev + Math.random() * 8;
      });
    }, 500);

    const tM1 = setTimeout(() => setModuleStatuses((prev) => prev.map((m, i) => i === 0 ? { ...m, status: 'completed' } : m)), 1500);
    const tM2 = setTimeout(() => setModuleStatuses((prev) => prev.map((m, i) => i === 1 ? { ...m, status: 'completed' } : m)), 3500);
    activeTimersRef.current.push(tM1, tM2);

    try {
      const result = await startScan(form);
      cancelActiveTimers();
      setProgress(100);
      setModuleStatuses(DEFAULT_MODULES.map((m) => ({ ...m, status: 'completed' })));
      if (result.success && result.data) {
        const resultFindings = result.data.findings || [];
        if (resultFindings.length > 0) {
          pendingScanDataRef.current = result.data;
          const tReveal = setTimeout(() => setBreachFindings(resultFindings), 800);
          activeTimersRef.current.push(tReveal);
        } else {
          if (onScanComplete) onScanComplete(result.data);
          const tFinish = setTimeout(() => setScanning(false), 1000);
          activeTimersRef.current.push(tFinish);
        }
      } else {
        setScanError('Scan sequence aborted. No data returned.');
        setScanning(false);
      }
    } catch (err) {
      cancelActiveTimers();
      setScanError(err.message || 'Identity scan failed.');
      setScanning(false);
    }
  }

  function handleBreachRevealComplete() {
    setBreachFindings(null);
    setScanning(false);
    if (pendingScanDataRef.current && onScanComplete) {
      onScanComplete(pendingScanDataRef.current);
      pendingScanDataRef.current = null;
    }
  }

  async function handleDeletion(findingId) {
    if (!userId) return;
    try {
      await requestDeletion(findingId, userId);
      if (onFindingsUpdate) onFindingsUpdate((prev) => prev.map((f) => f.id === findingId ? { ...f, status: 'action_pending' } : f));
      loadDashboard(true);
    } catch (err) { console.error('Redaction failed:', err); }
  }

  function resetScan() {
    setScanning(false);
    setProgress(0);
    setScanError('');
    setForm({ name: '', email: '', phone: '', username: '' });
    if (onNewScan) onNewScan();
  }

  // ── 1. Initial scan form ─────────────────────────────────────────────────
  if (!hasScanned && !scanning && !breachFindings) {
    return (
      <div style={{ minHeight: 'calc(100vh - 48px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', ...mono }}>
        <div style={{ width: '100%', maxWidth: '560px' }}>

          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '0.6rem', color: 'rgba(0,255,65,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>
              root@privix:~/scan$
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px', color: '#00ff41' }}>
              Deep Exposure Scan
            </h1>
            <p style={{ color: 'rgba(0,255,65,0.45)', fontSize: '0.85rem', lineHeight: 1.7 }}>
              Target breach databases, data brokers, and dark web markets to locate exposed PII.
            </p>
          </div>

          {/* Form Panel */}
          <Panel>
            {/* Top accent line */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #00ff41, transparent)' }} />

            {scanError && (
              <div style={{ padding: '12px 16px', background: 'rgba(255,0,60,0.08)', border: '1px solid rgba(255,0,60,0.3)', display: 'flex', alignItems: 'center', gap: '10px', color: '#ff003c', fontSize: '0.8rem', fontWeight: 600, marginBottom: '20px', ...mono }}>
                <AlertTriangle size={14} /> {scanError}
              </div>
            )}

            <form onSubmit={handleScanSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input type="text" name="name" placeholder="John Doe" value={form.name} onChange={handleChange}
                    style={inputStyle}
                    onFocus={e => Object.assign(e.target.style, inputFocus)}
                    onBlur={e => Object.assign(e.target.style, inputBlur)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input type="email" name="email" placeholder="your@email.com" value={form.email} onChange={handleChange}
                    style={inputStyle}
                    onFocus={e => Object.assign(e.target.style, inputFocus)}
                    onBlur={e => Object.assign(e.target.style, inputBlur)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Phone <span style={{ opacity: 0.5 }}>(optional)</span></label>
                  <input type="tel" name="phone" placeholder="+1 555 000 0000" value={form.phone} onChange={handleChange}
                    style={inputStyle}
                    onFocus={e => Object.assign(e.target.style, inputFocus)}
                    onBlur={e => Object.assign(e.target.style, inputBlur)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Username <span style={{ opacity: 0.5 }}>(optional)</span></label>
                  <input type="text" name="username" placeholder="@handle" value={form.username} onChange={handleChange}
                    style={inputStyle}
                    onFocus={e => Object.assign(e.target.style, inputFocus)}
                    onBlur={e => Object.assign(e.target.style, inputBlur)}
                  />
                </div>
              </div>

              <button type="submit" style={{
                width: '100%', padding: '14px',
                background: '#00ff41', color: '#000',
                fontSize: '0.85rem', fontWeight: 900, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                letterSpacing: '0.12em', textTransform: 'uppercase', ...mono,
              }}>
                <Search size={16} /> Execute Deep Analysis
              </button>
            </form>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '28px', marginTop: '20px', flexWrap: 'wrap' }}>
              {[{ icon: Shield, text: 'AES-256 Encrypted' }, { icon: Terminal, text: 'Zero Log Retention' }].map(({ icon: Icon, text }) => (
                <span key={text} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', color: 'rgba(0,255,65,0.35)', fontWeight: 600, letterSpacing: '0.08em', ...mono }}>
                  <Icon size={12} style={{ color: 'rgba(0,255,65,0.4)' }} /> {text}
                </span>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    );
  }

  // ── 2. Scanning state ─────────────────────────────────────────────────────
  if (scanning || breachFindings) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px', ...mono }}>
        {breachFindings && <BreachReveal findings={breachFindings} onComplete={handleBreachRevealComplete} />}

        {scanning && !breachFindings && (
          <div style={{ paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <RadarScanner progress={progress} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Terminal stream */}
              <Panel style={{ padding: '0' }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(0,255,65,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(0,255,65,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Terminal size={11} /> Process Stream
                  </span>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {['#ff003c', '#ffb86c', '#00ff41'].map(c => <div key={c} style={{ width: '8px', height: '8px', background: c, opacity: 0.7 }} />)}
                  </div>
                </div>
                <div ref={terminalRef} style={{ padding: '14px', height: '200px', overflowY: 'auto', fontSize: '0.7rem', color: '#00ff41', display: 'flex', flexDirection: 'column', gap: '5px', ...mono }}>
                  {currentLogs.map((log, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', opacity: i === currentLogs.length - 1 ? 1 : 0.5 }}>
                      <span style={{ color: 'rgba(0,255,65,0.35)', whiteSpace: 'nowrap' }}>{new Date().toLocaleTimeString()}</span>
                      <span>{log}</span>
                    </div>
                  ))}
                  <div style={{ animation: 'pulse 1s infinite', color: '#00ff41' }}>_</div>
                </div>
              </Panel>

              {/* Module status */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(0,255,65,0.45)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '4px', ...mono }}>
                  Engine Integrity
                </div>
                {moduleStatuses.map((mod) => (
                  <div key={mod.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,255,65,0.15)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '7px', height: '7px', background: mod.status === 'completed' ? '#00ff41' : '#ffb86c', animation: mod.status === 'completed' ? 'none' : 'pulse 1.5s infinite' }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', ...mono }}>{mod.name}</span>
                    </div>
                    <span style={{ fontSize: '0.6rem', ...mono, color: mod.status === 'completed' ? '#00ff41' : '#ffb86c', background: mod.status === 'completed' ? 'rgba(0,255,65,0.08)' : 'rgba(255,184,108,0.08)', padding: '3px 8px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      {mod.status === 'completed' ? 'DONE' : 'SCANNING'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── 3. Loading ─────────────────────────────────────────────────────────────
  if (dashboardLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <RadarScanner progress={100} />
        <p style={{ ...mono, fontSize: '0.7rem', letterSpacing: '0.18em', color: '#00ff41', textTransform: 'uppercase' }}>
          Loading Dashboard...
        </p>
      </div>
    );
  }

  if (!data) return null;
  const { stats, recentFindings, totalScans, lastScan } = data;

  const statCards = [
    { label: 'Active Exposures', value: stats.activeExposures, icon: Shield,      color: '#00ff41' },
    { label: 'Critical Risk',    value: stats.criticalCount,   icon: ShieldAlert,  color: '#ff003c' },
    { label: 'Secured Vaults',   value: stats.resolvedCount,   icon: History,      color: '#00ffff' },
    { label: 'Total Scans',      value: totalScans,            icon: Globe,        color: '#ffb86c' },
  ];

  // ── 4. Main dashboard ─────────────────────────────────────────────────────
  return (
    <div style={{ paddingBottom: '80px', display: 'flex', flexDirection: 'column', gap: '24px', ...mono }}>

      {/* ── Header bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(0,255,65,0.2)', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '0.55rem', color: 'rgba(0,255,65,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '4px' }}>
            root@privix:~/dashboard$
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.01em', color: '#00ff41' }}>
            Exposure Dashboard
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.65rem', color: 'rgba(0,255,65,0.4)', marginTop: '4px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Activity size={11} /> Active Session</span>
            <span style={{ opacity: 0.3 }}>|</span>
            <span>ID: {userId?.slice(0, 12)}...</span>
          </div>
        </div>
        <button
          onClick={resetScan}
          style={{ padding: '9px 18px', background: 'transparent', border: '1px solid rgba(0,255,65,0.35)', color: '#00ff41', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', ...mono }}
        >
          <RefreshCw size={13} /> New Scan
        </button>
      </div>

      {/* ── Stats grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px' }}>
        {statCards.map((s) => (
          <div key={s.label} style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0,255,65,0.15)', padding: '20px', position: 'relative', overflow: 'hidden' }}>
            {/* left accent bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: s.color }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <s.icon size={15} style={{ color: s.color }} />
              <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, color: s.color }}>
              <StatCounter value={s.value} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Geo Map ── */}
      <Panel style={{ padding: '0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid rgba(0,255,65,0.15)' }}>
          <SectionHeading icon={Globe} label="Geospatial Exposure Map" style={{ marginBottom: 0 }} />
          <span style={{ padding: '3px 10px', background: 'rgba(0,255,65,0.08)', border: '1px solid rgba(0,255,65,0.25)', fontSize: '0.6rem', fontWeight: 700, color: '#00ff41', letterSpacing: '0.1em', ...mono }}>
            ● LIVE
          </span>
        </div>
        <div style={{ padding: '20px' }}><Heatmap /></div>
      </Panel>

      {/* ── Detections ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <SectionHeading icon={ShieldAlert} label="Detected Exposures" color="#ff003c" accent={`— ${filteredFindings.length} RECORDS`} />
        <FilterPanel onFilterChange={setFilters} />

        {filteredFindings.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredFindings.map((finding) => (
              <ExposureCard key={finding.id} finding={finding} onRequestDeletion={handleDeletion} />
            ))}
          </div>
        ) : (
          <Panel style={{ textAlign: 'center', padding: '48px 24px' }}>
            <CheckCircle2 size={32} style={{ color: '#00ff41', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#00ff41', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Vault Secured
            </h3>
            <p style={{ color: 'rgba(0,255,65,0.4)', fontSize: '0.8rem', maxWidth: '320px', margin: '0 auto' }}>
              No exposures detected under the current filter set.
            </p>
          </Panel>
        )}
      </div>

      {/* ── Timeline ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <SectionHeading icon={History} label="Incident Timeline" color="#00ffff" />
        <CyberTimeline findings={recentFindings} />
      </div>
    </div>
  );
}
