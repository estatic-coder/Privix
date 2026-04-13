// ============================================================
// Anonymous — Component: Navbar
// ============================================================

import { NavLink } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function Navbar({ alertCount = 0 }) {
  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-800/80 shadow-lg shadow-red-900/20">
            <ShieldAlert size={16} className="text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white font-mono" style={{ textShadow: '0 0 8px rgba(255, 0, 60, 0.6)', color: 'var(--accent-primary)' }}>
              PRIVIX
            </span>
          </div>
        </div>
      </NavLink>

      <ul className="navbar-nav">
        <li>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
          >
            📊 Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/scan"
            className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
          >
            🔍 New Scan
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/results"
            className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
          >
            📋 Results
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/settings"
            className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
          >
            ⚙️ Settings
          </NavLink>
        </li>
        {alertCount > 0 && (
          <li className="navbar-alert-badge">
            <NavLink to="/results" className="navbar-link">
              🔔
              <span className="alert-count">{alertCount > 9 ? '9+' : alertCount}</span>
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
}
