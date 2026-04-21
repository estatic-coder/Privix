import { useState } from 'react';
import { Bell, Shield, Info, RefreshCcw, Trash2, Activity } from 'lucide-react';

const mono = { fontFamily: "'JetBrains Mono', monospace" };

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
    <div style={{ paddingBottom: '80px', display: 'flex', flexDirection: 'column', gap: '32px', ...mono }}>

      {/* Page Header */}
      <div style={{ borderBottom: '1px solid rgba(0,255,65,0.2)', paddingBottom: '20px' }}>
        <div style={{ fontSize: '0.6rem', color: 'rgba(0,255,65,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>
          root@privix:~/settings$
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#00ff41', marginBottom: '6px' }}>
          System Configuration
        </h1>
        <p style={{ color: 'rgba(0,255,65,0.5)', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
          Manage monitoring preferences and security policies.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>

        {/* Monitoring */}
        <SettingCard icon={<RefreshCcw size={16} />} iconColor="#00ff41" title="Scan Monitoring" description="Control sweep frequency for new exposures.">
          <ToggleRow
            label="Auto-Rescan"
            desc="Continuously sweep broker networks for new matches."
            active={settings.autoRescan}
            onToggle={() => toggleSetting('autoRescan')}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderTop: '1px solid rgba(0,255,65,0.1)', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rescan Frequency</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(0,255,65,0.45)' }}>Interval for full identity sweeps.</div>
            </div>
            <select
              style={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(0,255,65,0.3)', color: '#00ff41', fontSize: '0.75rem', fontWeight: 700, padding: '8px 12px', outline: 'none', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}
              value={settings.rescanInterval}
              onChange={(e) => setSettings((prev) => ({ ...prev, rescanInterval: parseInt(e.target.value) }))}
            >
              <option value={7}>7 Days</option>
              <option value={14}>14 Days</option>
              <option value={30}>30 Days</option>
            </select>
          </div>
        </SettingCard>

        {/* Notifications */}
        <SettingCard icon={<Bell size={16} />} iconColor="#ffb86c" title="Notifications" description="Configure alert channels for new threats.">
          <ToggleRow label="Email Alerts" desc="Receive critical exposure alerts via email." active={settings.emailAlerts} onToggle={() => toggleSetting('emailAlerts')} />
          <ToggleRow label="Push Notifications" desc="Real-time alerts for active breaches." active={settings.pushAlerts} onToggle={() => toggleSetting('pushAlerts')} />
          <ToggleRow label="Critical Alerts Only" desc="Only notify for High and Critical severity." active={settings.highRiskOnly} onToggle={() => toggleSetting('highRiskOnly')} isLast />
        </SettingCard>

        {/* Security */}
        <SettingCard icon={<Shield size={16} />} iconColor="#00ffff" title="Security & Privacy" description="Manage encryption and data retention policies.">
          <ToggleRow label="Client-Side Encryption" desc="AES-256 encrypt all PII before transmission." active={settings.dataEncryption} onToggle={() => toggleSetting('dataEncryption')} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderTop: '1px solid rgba(0,255,65,0.1)', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Clear All Data</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(0,255,65,0.45)' }}>Permanently wipe all local scan data.</div>
            </div>
            <button
              style={{ padding: '7px 14px', background: 'rgba(255,0,60,0.08)', border: '1px solid rgba(255,0,60,0.35)', color: '#ff003c', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em', textTransform: 'uppercase' }}
            >
              <Trash2 size={12} /> Purge
            </button>
          </div>
        </SettingCard>

        {/* System Info */}
        <SettingCard icon={<Info size={16} />} iconColor="#8b5cf6" title="System Information" description="Current version and platform status.">
          <InfoRow label="VERSION" value="v2.1.0" />
          <InfoRow label="ENVIRONMENT" value="Production" />
          <InfoRow label="UPLINK STATUS">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00ff41', fontSize: '0.75rem', fontWeight: 700 }}>
              <Activity size={10} style={{ animation: 'pulse 2s infinite' }} />
              OPERATIONAL
            </span>
          </InfoRow>
          <InfoRow label="DATA POLICY" value="ZERO LOG — No PII retained" isLast />
        </SettingCard>

      </div>
    </div>
  );
}

function SettingCard({ icon, iconColor, title, description, children }) {
  return (
    <div style={{
      background: 'rgba(0,0,0,0.6)',
      border: '1px solid rgba(0,255,65,0.2)',
      padding: '24px',
      display: 'flex', flexDirection: 'column', gap: '4px',
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', paddingBottom: '16px', borderBottom: '1px solid rgba(0,255,65,0.1)' }}>
        <div style={{ width: '34px', height: '34px', background: `rgba(0,255,65,0.08)`, border: `1px solid ${iconColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor }}>
          {icon}
        </div>
        <div>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</h3>
          <p style={{ fontSize: '0.65rem', color: 'rgba(0,255,65,0.45)', letterSpacing: '0.04em' }}>{description}</p>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function ToggleRow({ label, desc, active, onToggle, isLast }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderTop: '1px solid rgba(0,255,65,0.1)', gap: '16px' }}>
      <div>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
        <div style={{ fontSize: '0.7rem', color: 'rgba(0,255,65,0.45)' }}>{desc}</div>
      </div>
      <button
        onClick={onToggle}
        style={{
          width: '44px', height: '22px',
          padding: '2px',
          cursor: 'pointer', flexShrink: 0,
          background: active ? 'rgba(0,255,65,0.2)' : 'rgba(255,255,255,0.05)',
          border: active ? '1px solid rgba(0,255,65,0.6)' : '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center',
          justifyContent: active ? 'flex-end' : 'flex-start',
          transition: 'all 0.2s',
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        <div style={{
          width: '16px', height: '16px',
          background: active ? '#00ff41' : 'rgba(255,255,255,0.3)',
          transition: 'all 0.2s',
        }} />
      </button>
    </div>
  );
}

function InfoRow({ label, value, children, isLast }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid rgba(0,255,65,0.1)', gap: '16px' }}>
      <span style={{ fontSize: '0.7rem', color: 'rgba(0,255,65,0.45)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
      {children || <span style={{ fontSize: '0.75rem', color: '#fff', fontWeight: 700 }}>{value}</span>}
    </div>
  );
}
