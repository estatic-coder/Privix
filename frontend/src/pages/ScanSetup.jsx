// ============================================================
// Privix — Page: Unified Scan & Results (Premium)
// ============================================================

import { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Search, Terminal, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { startScan, requestDeletion } from '../services/api';
import BreachReveal from '../components/BreachReveal';
import ExposureCard from '../components/ExposureCard';
import FilterPanel from '../components/FilterPanel';
import RadarScanner from '../components/RadarScanner';

const DEFAULT_MODULES = [
  { name: 'Identity Engine', status: 'pending' },
  { name: 'Breach Database', status: 'pending' },
  { name: 'Surface Mirror', status: 'pending' },
  { name: 'Darknet Crawler', status: 'pending' },
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

export default function ScanSetup({ 
  userId, 
  hasScanned, 
  findings, 
  riskScore, 
  onScanComplete, 
  onNewScan,
  onFindingsUpdate 
}) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', username: '', password: '' });
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [moduleStatuses, setModuleStatuses] = useState(DEFAULT_MODULES);
  const [error, setError] = useState('');
  const [breachFindings, setBreachFindings] = useState(null);
  const [filters, setFilters] = useState({});
  const [currentLogs, setCurrentLogs] = useState([]);
  
  const activeTimersRef = useRef([]);
  const progressIntervalRef = useRef(null);
  const pendingScanDataRef = useRef(null);
  const terminalRef = useRef(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [currentLogs]);

  const filtered = useMemo(() => {
    if (!findings) return [];
    let result = [...findings];
    if (filters.status) result = result.filter((f) => f.status === filters.status);
    if (filters.risk)   result = result.filter((f) => f.risk   === filters.risk);
    if (filters.source) result = result.filter((f) => f.source.toLowerCase().includes(filters.source.toLowerCase()));
    result.sort((a, b) => b.confidence - a.confidence);
    return result;
  }, [findings, filters]);

  // Tracks active timers so they can be cancelled when a new scan starts,
  // preventing duplicate state updates from stale closures.
  const activeTimersRef = useRef([]);
  const progressIntervalRef = useRef(null);

  // Pending scan result — held until both API and animation (if any) are done
  const pendingScanDataRef = useRef(null);

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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name && !form.email) {
      setError('Identifier required for deep scan.');
      return;
    }

    cancelActiveTimers();
    setError('');
    setBreachFindings(null);
    pendingScanDataRef.current = null;
    setProgress(0);
    setCurrentLogs([MOCK_LOGS[0]]);
    setModuleStatuses(DEFAULT_MODULES.map((m) => ({ ...m, status: 'running' })));
    setScanning(true);

    if (onNewScan) onNewScan();

    // Log Simulation
    MOCK_LOGS.slice(1).forEach((log, i) => {
      const t = setTimeout(() => {
        setCurrentLogs(prev => [...prev, log]);
      }, (i + 1) * 800);
      activeTimersRef.current.push(t);
    });

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
          return 92;
        }
        return prev + Math.random() * 8;
      });
    }, 500);

    const tModule1 = setTimeout(() => {
      setModuleStatuses(prev => prev.map((m, i) => i === 0 ? { ...m, status: 'completed' } : m));
    }, 1500);
    const tModule2 = setTimeout(() => {
      setModuleStatuses(prev => prev.map((m, i) => i === 1 ? { ...m, status: 'completed' } : m));
    }, 3500);
    activeTimersRef.current.push(tModule1, tModule2);

    try {
      // ── 5. Await API response ─────────────────────────────────────────
      const result = await startScan(form);
      cancelActiveTimers();
      setProgress(100);
      setModuleStatuses(DEFAULT_MODULES.map((m) => ({ ...m, status: 'completed' })));

      if (result.success && result.data) {
        const findings = result.data.findings || [];
        if (findings.length > 0) {
          pendingScanDataRef.current = result.data;
          const tReveal = setTimeout(() => setBreachFindings(findings), 800);
          activeTimersRef.current.push(tReveal);
        } else {
          if (onScanComplete) onScanComplete(result.data);
          const tFinish = setTimeout(() => setScanning(false), 1000);
          activeTimersRef.current.push(tFinish);
        }
      } else {
        setError('Scan sequence aborted. No data returned.');
        setScanning(false);
      }
    } catch (err) {
      cancelActiveTimers();
      setError(err.message || 'Identity scan failed.');
      setScanning(false);
    }
  }

  // Called by BreachReveal when its animation finishes (or user skips it)
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
      if (onFindingsUpdate) {
        onFindingsUpdate((prev) => prev.map((f) => f.id === findingId ? { ...f, status: 'action_pending' } : f));
      }
    } catch (err) {
      console.error('Redaction failed:', err);
    }
  }

  function resetScan() {
    setScanning(false);
    setProgress(0);
    setError('');
    setForm({ name: '', email: '', phone: '', username: '', password: '' });
    if (onNewScan) onNewScan();
  }

  if (hasScanned && !scanning && !breachFindings) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white mb-1">
              SCAN <span className="text-accent-primary">REPORTS</span>
            </h1>
            <div className="flex items-center gap-3 text-muted text-sm">
              <span className="flex items-center gap-1"><Shield size={14} /> {findings.length} Exposures</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="flex items-center gap-1 font-bold text-accent-primary">
                Risk Score: {riskScore}/100
              </span>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
            className="btn btn-outline flex items-center gap-2 px-6" 
            onClick={resetScan}
          >
            <RefreshCw size={16} /> New Analysis
          </motion.button>
        </div>

        <FilterPanel onFilterChange={setFilters} />

        {filtered.length > 0 ? (
          <motion.div 
            layout 
            className="results-grid"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((finding) => (
                <ExposureCard
                  key={finding.id}
                  finding={finding}
                  onRequestDeletion={handleDeletion}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="empty-state glass-morphism p-12 text-center">
            <div className="w-20 h-20 mx-auto bg-accent-success/10 rounded-full flex items-center justify-center mb-4 border border-accent-success/20">
              <CheckCircle2 size={40} className="text-accent-success" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Vault Secured</h3>
            <p className="text-muted max-w-sm mx-auto">No exposures detected under the current filter set. Your digital footprint appears safe.</p>
          </motion.div>
        )}
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      {breachFindings && (
        <BreachReveal
          findings={breachFindings}
          onComplete={handleBreachRevealComplete}
        />
      )}

      <AnimatePresence mode="wait">
        {!scanning ? (
          <motion.div 
            key="setup-form"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h1 className="text-4xl font-black tracking-[0.2em] text-white uppercase mb-4">
                INITIATE <span className="text-accent-primary">SCAN</span>
              </h1>
              <p className="text-muted text-sm max-w-lg mx-auto">
                Securely analyze global breach databases, dark web markets, and data brokers to discover your vulnerabilities.
              </p>
            </div>

            <div className="glass-morphism p-10 rounded-2xl relative overflow-hidden mesh-bg cyber-border shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                {error && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-4 bg-accent-danger/10 border border-accent-danger/30 rounded-lg flex items-center gap-3 text-accent-danger text-sm font-bold">
                    <AlertTriangle size={18} /> {error}
                  </motion.div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Target Identification</label>
                    <input type="text" name="name" className="form-input" placeholder="Full Name" value={form.name} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Primary Alias</label>
                    <input type="email" name="email" className="form-input" placeholder="Email Address" value={form.email} onChange={handleChange} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Comm. Frequency</label>
                    <input type="tel" name="phone" className="form-input" placeholder="Phone (Optional)" value={form.phone} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Network Username</label>
                    <input type="text" name="username" className="form-input" placeholder="Username (Optional)" value={form.username} onChange={handleChange} />
                  </div>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(255, 0, 60, 0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  className="btn btn-primary btn-lg w-full py-5 text-[10px] sm:text-sm tracking-widest sm:tracking-[0.4em] uppercase font-black ruby-glow flex items-center justify-center"
                >
                  <Search size={16} className="mr-2" /> Start Intelligence Op
                </motion.button>
              </form>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-8 text-[10px] text-muted font-bold uppercase tracking-widest px-4 opacity-50">
              <span className="flex items-center gap-2"><Shield size={12} /> Military-Grade Encryption</span>
              <span className="flex items-center gap-2"><Terminal size={12} /> No Log Retention</span>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="scanning-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-12 py-10"
          >
            <RadarScanner progress={progress} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Terminal View */}
              <div className="glass-morphism rounded-xl border border-white/10 overflow-hidden bg-black/60 shadow-2xl">
                <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-black text-muted tracking-widest flex items-center gap-2">
                    <Terminal size={12} /> SYSTEM_PROCESS_STREAM
                  </span>
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-accent-danger opacity-50" />
                    <div className="w-2 h-2 rounded-full bg-accent-warning opacity-50" />
                    <div className="w-2 h-2 rounded-full bg-accent-success opacity-50" />
                  </div>
                </div>
                <div 
                  ref={terminalRef}
                  className="p-4 h-48 overflow-y-auto font-mono text-[11px] text-accent-success space-y-1.5 scrollbar-hide"
                >
                  {currentLogs.map((log, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="opacity-40">{new Date().toLocaleTimeString()}</span>
                      <span className="flex-1">{log}</span>
                    </div>
                  ))}
                  <div className="animate-pulse">_</div>
                </div>
              </div>

              {/* Module Status */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-white tracking-[0.3em] uppercase opacity-70 mb-2">Engine Integrity</h3>
                {moduleStatuses.map((mod, i) => (
                  <motion.div 
                    key={mod.name} 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${mod.status === 'completed' ? 'bg-accent-success' : 'bg-accent-warning animate-pulse'}`} />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">{mod.name}</span>
                    </div>
                    <span className={`text-[10px] font-mono ${mod.status === 'completed' ? 'text-accent-success' : 'text-accent-warning'}`}>
                      {mod.status === 'completed' ? '[ONLINE]' : '[SCANNING]'}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


