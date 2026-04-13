import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ScanSetup from './pages/ScanSetup';
import Results from './pages/Results';
import Settings from './pages/Settings';
import Landing from './pages/Landing';
import MatrixBackground from './components/MatrixBackground';
import { getDashboard, markAlertsRead } from './services/api';

function AppContent() {
  const [userId, setUserId] = useState(localStorage.getItem('anonymous_userid') || null);
  const [alertCount, setAlertCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Poll for alerts every 30 seconds if logged in
    if (userId) {
      loadUserData();
      const interval = setInterval(loadUserData, 30000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  const handleScanComplete = (data) => {
    if (data.user && data.user.id !== userId) {
      setUserId(data.user.id);
      localStorage.setItem('anonymous_userid', data.user.id);
    }
    loadUserData();
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

  // Keep track of cursor for the radial background glow
  useEffect(() => {
    const handleMouseMove = (e) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const isLanding = location.pathname === '/';

  // Landing page gets its own full-width layout (no navbar, no padding)
  if (isLanding) {
    return <Landing />;
  }

  return (
    <div className="app-layout">
      <MatrixBackground />
      <Navbar alertCount={alertCount} />
      <main className="app-content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard userId={userId} />} />
          <Route path="/scan" element={<ScanSetup onScanComplete={handleScanComplete} />} />
          <Route path="/results" element={<Results userId={userId} />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
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
