import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Landing from './pages/Landing';
import { getDashboard } from './services/api';

// sessionStorage key — resets when the browser tab is closed (not across tabs)
const SESSION_SCANNED_KEY = 'privix_has_scanned';

function AppContent() {
  const [userId, setUserId] = useState(localStorage.getItem('anonymous_userid') || null);
  const [alertCount, setAlertCount] = useState(0);

  // hasScanned: true only after a scan has fully completed this session
  const [hasScanned, setHasScanned] = useState(
    () => sessionStorage.getItem(SESSION_SCANNED_KEY) === 'true'
  );

  // Store findings & risk score from the latest scan response
  const [latestFindings, setLatestFindings] = useState([]);
  const [latestRiskScore, setLatestRiskScore] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Reset all scan state when user navigates back to the Landing page
  // so "Get Started" always leads to a clean empty dashboard
  useEffect(() => {
    if (location.pathname === '/') {
      setHasScanned(false);
      setLatestFindings([]);
      setLatestRiskScore(null);
      sessionStorage.removeItem(SESSION_SCANNED_KEY);
    }
  }, [location.pathname]);

  // Only poll for alerts when the user has actually scanned
  useEffect(() => {
    if (userId && hasScanned) {
      loadUserData();
      const interval = setInterval(loadUserData, 30000);
      return () => clearInterval(interval);
    }
  }, [userId, hasScanned]);

  // Called by ScanSetup when a scan result arrives
  const handleScanComplete = (data) => {
    // Persist userId if it changed (new identity)
    if (data.user && data.user.id !== userId) {
      setUserId(data.user.id);
      localStorage.setItem('anonymous_userid', data.user.id);
    }

    // Deduplicate findings — use source+id combined key for robustness
    const raw = Array.isArray(data.findings) ? data.findings : [];
    const seen = new Set();
    const deduped = raw.filter((f) => {
      const key = `${f.source || ''}::${f.id || ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Replace — never merge with previous results
    setLatestFindings(deduped);
    setLatestRiskScore(data.riskScore ?? null);
    setHasScanned(true);
    sessionStorage.setItem(SESSION_SCANNED_KEY, 'true');

    loadUserData();
  };

  // Called by ScanSetup before starting a new scan — full reset
  const handleNewScan = () => {
    // Clear all scan state so Results shows empty/blocked if visited early
    setHasScanned(false);
    setLatestFindings([]);
    setLatestRiskScore(null);
    sessionStorage.removeItem(SESSION_SCANNED_KEY);
  };

  // Allow Results page to update individual finding statuses (e.g. after deletion request)
  const handleFindingsUpdate = (updater) => {
    setLatestFindings((prev) =>
      typeof updater === 'function' ? updater(prev) : updater
    );
  };

  const loadUserData = async () => {
    if (!userId) return;
    try {
      const res = await getDashboard(userId);
      if (res.success && res.data) {
        setAlertCount(res.data.unreadAlerts || 0);
      }
    } catch (err) {
      console.error('Failed to load user data', err);
    }
  };

  // Radial background glow follows cursor
  useEffect(() => {
    const handleMouseMove = (e) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const isLanding = location.pathname === '/';

  if (isLanding) {
    return <Landing />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#e4e4e7', fontFamily: "'JetBrains Mono', monospace" }}>
      <Navbar alertCount={alertCount} />
      <main style={{ paddingTop: '48px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px 60px' }}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <Dashboard
                  userId={userId}
                  hasScanned={hasScanned}
                  findings={latestFindings}
                  riskScore={latestRiskScore}
                  onScanComplete={handleScanComplete}
                  onNewScan={handleNewScan}
                  onFindingsUpdate={handleFindingsUpdate}
                />
              }
            />
            <Route path="/results" element={<Navigate to="/dashboard" replace />} />
            <Route path="/scan" element={<Navigate to="/dashboard" replace />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </main>
    </div>
  );

}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
