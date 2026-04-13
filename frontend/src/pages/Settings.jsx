// ============================================================
// Anonymous — Page: Settings
// ============================================================

import { useState } from 'react';

export default function Settings() {
  const [settings, setSettings] = useState({
    autoRescan: true,
    rescanInterval: 30,
    emailAlerts: true,
    pushAlerts: false,
    highRiskOnly: false,
    dataEncryption: true,
  });

  function toggleSetting(key) {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <span className="highlight">Settings</span>
        </h1>
        <p className="page-description">
          Configure your monitoring preferences and security options.
        </p>
      </div>

      <div className="settings-grid">
        {/* Monitoring Settings */}
        <div className="card animate-in animate-delay-1">
          <div className="card-header">
            <h3 className="card-title">🔁 Monitoring</h3>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h4>Auto Re-scan</h4>
              <p>Periodically re-check all data broker sources</p>
            </div>
            <div
              className={`toggle ${settings.autoRescan ? 'active' : ''}`}
              onClick={() => toggleSetting('autoRescan')}
            ></div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h4>Rescan Interval</h4>
              <p>Days between automatic re-scans</p>
            </div>
            <select
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-input)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                padding: '6px 12px',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.85rem',
              }}
              value={settings.rescanInterval}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, rescanInterval: parseInt(e.target.value) }))
              }
            >
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
            </select>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card animate-in animate-delay-2">
          <div className="card-header">
            <h3 className="card-title">🔔 Notifications</h3>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h4>Email Alerts</h4>
              <p>Receive email when new exposures are found</p>
            </div>
            <div
              className={`toggle ${settings.emailAlerts ? 'active' : ''}`}
              onClick={() => toggleSetting('emailAlerts')}
            ></div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h4>Push Notifications</h4>
              <p>Browser push notifications for alerts</p>
            </div>
            <div
              className={`toggle ${settings.pushAlerts ? 'active' : ''}`}
              onClick={() => toggleSetting('pushAlerts')}
            ></div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h4>High Risk Only</h4>
              <p>Only alert for high and critical risk findings</p>
            </div>
            <div
              className={`toggle ${settings.highRiskOnly ? 'active' : ''}`}
              onClick={() => toggleSetting('highRiskOnly')}
            ></div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="card animate-in animate-delay-3">
          <div className="card-header">
            <h3 className="card-title">🔐 Security</h3>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h4>Data Encryption</h4>
              <p>Encrypt all stored personal identifiers</p>
            </div>
            <div
              className={`toggle ${settings.dataEncryption ? 'active' : ''}`}
              onClick={() => toggleSetting('dataEncryption')}
            ></div>
          </div>

          <div className="setting-item" style={{ borderBottom: 'none' }}>
            <div className="setting-info">
              <h4>Delete All Data</h4>
              <p>Permanently remove all scans and findings</p>
            </div>
            <button className="btn btn-danger btn-sm">Delete</button>
          </div>
        </div>

        {/* About */}
        <div className="card animate-in animate-delay-4">
          <div className="card-header">
            <h3 className="card-title">ℹ️ About</h3>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <p><strong>Privix</strong> v1.0.0</p>
            <p style={{ marginTop: '8px', color: 'var(--text-muted)' }}>
              Personal Data Exposure Monitoring & Action Platform.
              Scans data brokers, search engines, and public records
              to find where your personal information is exposed.
            </p>
            <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Core Pillars: Discovery · Verification · Action · Monitoring
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
