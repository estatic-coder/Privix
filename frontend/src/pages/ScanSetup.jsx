// ============================================================
// Anonymous — Page: Scan Setup
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startScan } from '../services/api';
import BreachReveal from '../components/BreachReveal';

export default function ScanSetup({ onScanComplete }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    username: '',
    password: '',
  });
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [moduleStatuses, setModuleStatuses] = useState([
    { name: 'DataBrokerX', status: 'pending' },
    { name: 'PeopleFinderY', status: 'pending' },
    { name: 'GoogleSearch', status: 'pending' },
  ]);
  const [error, setError] = useState('');
  const [breachFindings, setBreachFindings] = useState(null); // holds findings for animation
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.name && !form.email) {
      setError('Please enter at least a name or email address.');
      return;
    }

    setScanning(true);
    setProgress(0);

    // Simulate progress animation
    setModuleStatuses((prev) =>
      prev.map((m) => ({ ...m, status: 'running' }))
    );

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 400);

    // Stagger module completion visuals
    setTimeout(() => {
      setModuleStatuses((prev) =>
        prev.map((m, i) => (i === 0 ? { ...m, status: 'completed' } : m))
      );
    }, 1200);

    setTimeout(() => {
      setModuleStatuses((prev) =>
        prev.map((m, i) => (i === 1 ? { ...m, status: 'completed' } : m))
      );
    }, 2000);

    try {
      const result = await startScan(form);

      clearInterval(progressInterval);
      setProgress(100);

      setModuleStatuses((prev) =>
        prev.map((m) => ({ ...m, status: 'completed' }))
      );

      if (result.success && result.data) {
        if (onScanComplete) {
          onScanComplete(result.data);
        }

        const findings = result.data.findings || [];

        if (findings.length > 0) {
          // Show breach reveal animation, then navigate
          setTimeout(() => {
            setBreachFindings(findings);
          }, 600);
        } else {
          // No breaches — navigate straight to results
          setTimeout(() => {
            navigate('/results');
          }, 800);
        }
      }
    } catch (err) {
      clearInterval(progressInterval);
      setError(err.message || 'Scan failed. Please try again.');
      setScanning(false);
      setProgress(0);
      setModuleStatuses((prev) =>
        prev.map((m) => ({ ...m, status: 'pending' }))
      );
    }
  }

  function handleBreachRevealComplete() {
    setBreachFindings(null);
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
