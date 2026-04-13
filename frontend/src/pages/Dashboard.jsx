// ============================================================
// Anonymous — Page: Dashboard
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ExposureCard from '../components/ExposureCard';
import { getDashboard, requestDeletion } from '../services/api';
import { DashboardRiskChart, RiskGauge } from '../components/RiskChart';

export default function Dashboard({ userId, onDataUpdate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      loadDashboard(false);
      const interval = setInterval(() => loadDashboard(true), 3000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [userId]);

  async function loadDashboard(silent = false) {
    try {
      if (!silent) setLoading(true);
      const res = await getDashboard(userId);
      if (res.success) {
        setData(res.data);
        if (onDataUpdate) onDataUpdate(res.data);
      }
    } catch (err) {
      console.error('Dashboard load failed:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeletion(findingId) {
    try {
      await requestDeletion(findingId, userId);
      loadDashboard();
    } catch (err) {
      console.error('Deletion request failed:', err);
    }
  }

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner spinner-lg"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!userId || !data) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">
            <span className="highlight">Privix</span> Exposure Engine
          </h1>
          <p className="page-description">
            Your personal data exposure monitoring platform. Run a scan to populate your risk profile.
          </p>
        </div>
        <div className="empty-state">
          <div className="empty-icon">🛡️</div>
          <h3>No scans yet</h3>
          <p>Start your first scan to discover where your personal data might be exposed across the internet.</p>
          <button
            className="btn btn-primary btn-lg"
            style={{ marginTop: '24px' }}
            onClick={() => navigate('/scan')}
          >
            🔍 Start Your First Scan
          </button>
        </div>
      </div>
    );
  }

  const { stats, recentFindings, totalScans, lastScan, unreadAlerts } = data;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          Exposure <span className="highlight">Dashboard</span>
        </h1>
        <p className="page-description">
          Monitoring your digital footprint across {totalScans} scan{totalScans !== 1 ? 's' : ''}.
        </p>
      </div>

      {unreadAlerts > 0 && (
        <div className="alert-banner danger">
          <span>⚠️</span>
          <span><strong>{unreadAlerts} new alert{unreadAlerts !== 1 ? 's' : ''}</strong> — New exposures have been detected.</span>
        </div>
      )}

      {/* New Modern Chart Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '24px', marginBottom: '32px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: 0 }}>
          <h3 style={{ position: 'absolute', top: 20, left: 20, margin: 0, fontSize: '1rem', color: 'var(--text-secondary)' }}>Overall Risk</h3>
          <RiskGauge riskScore={lastScan?.riskScore || Math.min(Math.round(((stats.criticalCount || 0) * 25) + ((stats.activeExposures || 0) * 5)), 99)} />
        </div>
        <div className="card" style={{ position: 'relative', padding: 0 }}>
          <h3 style={{ position: 'absolute', top: 20, left: 20, margin: 0, fontSize: '1rem', color: 'var(--text-secondary)', zIndex: 10 }}>Exposure Vectors</h3>
          <DashboardRiskChart stats={{
            criticalAlerts: stats.criticalCount || 0,
            activeAlerts: stats.activeExposures || 0,
            totalExposures: stats.activeExposures || 0
          }} />
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card animate-in animate-delay-1">
          <div className="stat-icon purple">🔍</div>
          <div className="stat-value">{stats.activeExposures}</div>
          <div className="stat-label">Active Exposures</div>
          <div className="stat-bar purple"></div>
        </div>
        <div className="stat-card animate-in animate-delay-2">
          <div className="stat-icon red">🔴</div>
          <div className="stat-value">{stats.criticalCount + stats.highCount}</div>
          <div className="stat-label">High Risk</div>
          <div className="stat-bar red"></div>
        </div>
        <div className="stat-card animate-in animate-delay-3">
          <div className="stat-icon green">✅</div>
          <div className="stat-value">{stats.resolvedCount}</div>
          <div className="stat-label">Resolved</div>
          <div className="stat-bar green"></div>
        </div>
        <div className="stat-card animate-in animate-delay-4">
          <div className="stat-icon teal">📡</div>
          <div className="stat-value">{totalScans}</div>
          <div className="stat-label">Total Scans</div>
          <div className="stat-bar teal"></div>
        </div>
      </div>

      {lastScan && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Last scan: {new Date(lastScan.completedAt || lastScan.createdAt).toLocaleString()} — Status: <strong>{lastScan.status}</strong>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Exposures</h2>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/results')}>
          View All →
        </button>
      </div>

      {recentFindings.length > 0 ? (
        <div className="results-grid">
          {recentFindings.map((finding) => (
            <ExposureCard
              key={finding.id}
              finding={finding}
              onRequestDeletion={handleDeletion}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🎉</div>
          <h3>All clear!</h3>
          <p>No exposures found in your recent scans.</p>
        </div>
      )}
    </div>
  );
}
