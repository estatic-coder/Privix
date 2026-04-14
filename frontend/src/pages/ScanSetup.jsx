// ============================================================
// Anonymous — Page: Scan Setup
// ============================================================

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { startScan } from '../services/api';
import BreachReveal from '../components/BreachReveal';

// Default module list — used to reset cleanly between scans
const DEFAULT_MODULES = [
  { name: 'DataBrokerX', status: 'pending' },
  { name: 'PeopleFinderY', status: 'pending' },
  { name: 'GoogleSearch', status: 'pending' },
];

export default function ScanSetup({ onScanComplete, onNewScan }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    username: '',
    password: '',
  });
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [moduleStatuses, setModuleStatuses] = useState(DEFAULT_MODULES);
  const [error, setError] = useState('');
  const [breachFindings, setBreachFindings] = useState(null); // holds findings for breach reveal animation
  const navigate = useNavigate();

  // Tracks active timers so they can be cancelled when a new scan starts,
  // preventing duplicate state updates from stale closures.
  const activeTimersRef = useRef([]);
  const progressIntervalRef = useRef(null);

  // Pending scan result — held until both API and animation (if any) are done
  const pendingScanDataRef = useRef(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // ── Helper: cancel all timers from the previous scan run ────────────
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
      setError('Please enter at least a name or email address.');
      return;
    }

    // ── 1. Cancel any lingering timers from a previous scan ──────────────
    cancelActiveTimers();

    // ── 2. Reset ALL local scan UI state before starting fresh ───────────
    setError('');
    setBreachFindings(null);
    pendingScanDataRef.current = null;
    setProgress(0);
    setModuleStatuses(DEFAULT_MODULES.map((m) => ({ ...m, status: 'running' })));
    setScanning(true);

    // ── 3. Notify App to reset global findings/riskScore/hasScanned ───────
    if (onNewScan) onNewScan();

    // ── 4. Start animated progress bar (caps at 90 until API resolves) ───
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 400);

    // Stagger module completion visuals
    const t1 = setTimeout(() => {
      setModuleStatuses((prev) =>
        prev.map((m, i) => (i === 0 ? { ...m, status: 'completed' } : m))
      );
    }, 1200);
    const t2 = setTimeout(() => {
      setModuleStatuses((prev) =>
        prev.map((m, i) => (i === 1 ? { ...m, status: 'completed' } : m))
      );
    }, 2000);
    activeTimersRef.current.push(t1, t2);

    try {
      // ── 5. Await API response ─────────────────────────────────────────
      const result = await startScan(form);

      // Clear progress animation
      cancelActiveTimers();
      setProgress(100);
      setModuleStatuses(DEFAULT_MODULES.map((m) => ({ ...m, status: 'completed' })));

      if (result.success && result.data) {
        const findings = result.data.findings || [];

        if (findings.length > 0) {
          // ── 6a. Store result and show BreachReveal — onScanComplete is
          //        called only AFTER the animation finishes (in
          //        handleBreachRevealComplete), so Results never receives
          //        data before the user reaches the page.
          pendingScanDataRef.current = result.data;
          const t3 = setTimeout(() => setBreachFindings(findings), 600);
          activeTimersRef.current.push(t3);
        } else {
          // ── 6b. No breaches — commit results now, navigate after a brief pause
          if (onScanComplete) onScanComplete(result.data);
          const t4 = setTimeout(() => navigate('/results'), 800);
          activeTimersRef.current.push(t4);
        }
      } else {
        // API returned success:false
        setError('Scan returned no data. Please try again.');
        setScanning(false);
        setProgress(0);
        setModuleStatuses(DEFAULT_MODULES);
      }
    } catch (err) {
      cancelActiveTimers();
      setError(err.message || 'Scan failed. Please try again.');
      setScanning(false);
      setProgress(0);
      setModuleStatuses(DEFAULT_MODULES);
    }
  }

  // Called by BreachReveal when its animation finishes (or user skips it)
  function handleBreachRevealComplete() {
    setBreachFindings(null);
    // Commit results to App state only now — Results page will have fresh data
    if (pendingScanDataRef.current && onScanComplete) {
      onScanComplete(pendingScanDataRef.current);
      pendingScanDataRef.current = null;
    }
    navigate('/results');
  }

  return (
    <div className="scan-setup-container">
      {/* Breach reveal overlay */}
      {breachFindings && (
        <BreachReveal
          findings={breachFindings}
          onComplete={handleBreachRevealComplete}
        />
      )}

      <div className="page-header" style={{ textAlign: 'center' }}>
        <h1 className="page-title">
          New <span className="highlight">Scan</span>
        </h1>
        <p className="page-description" style={{ margin: '0 auto' }}>
          Enter your personal identifiers to discover where your data is exposed.
        </p>
      </div>

      <div className="scan-form-card animate-in">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert-banner danger" style={{ marginBottom: '20px' }}>
              <span>❌</span>
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="scan-name">Full Name</label>
            <input
              id="scan-name"
              type="text"
              name="name"
              className="form-input"
              placeholder="e.g. John Doe"
              value={form.name}
              onChange={handleChange}
              disabled={scanning}
            />
            <div className="form-hint">Your full legal name as it might appear on data broker sites</div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="scan-email">Email Address</label>
            <input
              id="scan-email"
              type="email"
              name="email"
              className="form-input"
              placeholder="e.g. john@example.com"
              value={form.email}
              onChange={handleChange}
              disabled={scanning}
            />
            <div className="form-hint">Primary email to search for across data brokers and public records</div>
          </div>

          <div className="form-divider"></div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="scan-phone">Phone Number</label>
              <input
                id="scan-phone"
                type="tel"
                name="phone"
                className="form-input"
                placeholder="e.g. +1 555-123-4567"
                value={form.phone}
                onChange={handleChange}
                disabled={scanning}
              />
              <div className="form-hint">Optional</div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="scan-username">Username</label>
              <input
                id="scan-username"
                type="text"
                name="username"
                className="form-input"
                placeholder="e.g. johndoe92"
                value={form.username}
                onChange={handleChange}
                disabled={scanning}
              />
              <div className="form-hint">Optional</div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="scan-password">Password or Hash</label>
            <input
              id="scan-password"
              type="password"
              name="password"
              className="form-input"
              placeholder="e.g. MySecret123!"
              value={form.password}
              onChange={handleChange}
              disabled={scanning}
            />
            <div className="form-hint">Search database leaks and pastebins for an exposed password (secured, not saved)</div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={scanning}
          >
            {scanning ? (
              <>
                <div className="spinner"></div>
                Scanning...
              </>
            ) : (
              <>🔍 Start Scan</>
            )}
          </button>
        </form>

        {scanning && (
          <div className="scan-progress">
            <div className="scan-progress-bar">
              <div
                className="scan-progress-fill"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>

            <div className="scan-module-status">
              {moduleStatuses.map((mod) => (
                <div key={mod.name} className="scan-module-item">
                  <span className={`module-dot ${mod.status}`}></span>
                  <span style={{ flex: 1 }}>{mod.name}</span>
                  <span style={{
                    fontSize: '0.75rem',
                    color: mod.status === 'completed' ? 'var(--accent-success)' :
                      mod.status === 'running' ? 'var(--accent-warning)' :
                        'var(--text-muted)',
                    fontWeight: 600,
                  }}>
                    {mod.status === 'completed' ? '✓ Done' :
                      mod.status === 'running' ? 'Scanning...' :
                        'Waiting'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
