import { NavLink } from 'react-router-dom';
import { Terminal, LayoutDashboard, Settings, Activity } from 'lucide-react';

export default function Navbar({ alertCount = 0 }) {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', height: '48px',
      background: 'rgba(0,0,0,0.95)',
      borderBottom: '1px solid rgba(0,255,65,0.25)',
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      {/* Brand */}
      <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <Terminal size={16} style={{ color: '#00ff41' }} />
        <span style={{ fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.15em', color: '#00ff41', textTransform: 'uppercase' }}>
          PRIVIX
        </span>
      </NavLink>

      {/* Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {/* Live indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '12px', fontSize: '0.65rem', color: 'rgba(0,255,65,0.6)', letterSpacing: '0.1em' }}>
          <Activity size={10} />
          <span>UPLINK ACTIVE</span>
        </div>

        <NavLink
          to="/dashboard"
          style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '6px 14px',
            fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            fontFamily: "'JetBrains Mono', monospace",
            background: isActive ? 'rgba(0,255,65,0.12)' : 'transparent',
            color: isActive ? '#00ff41' : 'rgba(0,255,65,0.4)',
            border: isActive ? '1px solid rgba(0,255,65,0.4)' : '1px solid transparent',
          })}
        >
          <LayoutDashboard size={13} />
          <span className="hidden sm:inline">Dashboard</span>
        </NavLink>

        <NavLink
          to="/settings"
          style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '6px 14px',
            fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            fontFamily: "'JetBrains Mono', monospace",
            background: isActive ? 'rgba(0,255,65,0.12)' : 'transparent',
            color: isActive ? '#00ff41' : 'rgba(0,255,65,0.4)',
            border: isActive ? '1px solid rgba(0,255,65,0.4)' : '1px solid transparent',
          })}
        >
          <Settings size={13} />
          <span className="hidden sm:inline">Settings</span>
        </NavLink>

        {alertCount > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '20px', height: '20px',
            background: '#ff003c', color: '#000', 
            fontSize: '0.6rem', fontWeight: 900,
            marginLeft: '4px', fontFamily: "'JetBrains Mono', monospace",
          }}>
            {alertCount > 9 ? '9+' : alertCount}
          </div>
        )}
      </div>
    </nav>
  );
}
