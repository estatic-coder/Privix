// ============================================================
// Anonymous — Component: Breach Reveal Animation
// A dramatic full-screen overlay that plays when breaches are
// detected, revealing breach count, severity breakdown, and
// exposed data categories before transitioning to results.
// ============================================================

import { useState, useEffect, useRef } from 'react';

export default function BreachReveal({ findings = [], onComplete }) {
  const [phase, setPhase] = useState('init');       // init → scanning → alert → stats → fadeout → done
  const [countUp, setCountUp] = useState(0);
  const [visibleStats, setVisibleStats] = useState(0);
  const [visibleTags, setVisibleTags] = useState(0);
  const containerRef = useRef(null);

  // Compute stats from findings
  const total = findings.length;
  const critical = findings.filter(f => f.risk === 'critical').length;
  const high = findings.filter(f => f.risk === 'high').length;
  const medium = findings.filter(f => f.risk === 'medium').length;
  const low = findings.filter(f => f.risk === 'low').length;

  const severityBars = [
    { label: 'CRITICAL', count: critical, color: '#ff003c', glow: 'rgba(255,0,60,0.6)' },
    { label: 'HIGH', count: high, color: '#ff6b35', glow: 'rgba(255,107,53,0.5)' },
    { label: 'MEDIUM', count: medium, color: '#ffd93d', glow: 'rgba(255,217,61,0.4)' },
    { label: 'LOW', count: low, color: '#50fa7b', glow: 'rgba(80,250,123,0.4)' },
  ].filter(s => s.count > 0);

  // Collect unique data classes
  const allDataClasses = [...new Set(
    findings.flatMap(f =>
      f.rawData?.hibpData?.DataClasses || f.dataFound || []
    )
  )].slice(0, 12);

  // Animation timeline
  useEffect(() => {
    const timers = [];

    // Phase 1: init → scanning (glitch lines)
    timers.push(setTimeout(() => setPhase('scanning'), 200));

    // Phase 2: scanning → alert (BREACHED text)
    timers.push(setTimeout(() => setPhase('alert'), 1200));

    // Phase 3: alert → stats (show numbers)
    timers.push(setTimeout(() => setPhase('stats'), 2800));

    // Phase 4: count up the breach number
    timers.push(setTimeout(() => {
      let current = 0;
      const step = Math.max(1, Math.floor(total / 20));
      const interval = setInterval(() => {
        current = Math.min(current + step, total);
        setCountUp(current);
        if (current >= total) clearInterval(interval);
      }, 50);
      timers.push(interval);
    }, 3000));

    // Phase 4b: stagger-reveal severity bars
    timers.push(setTimeout(() => {
      severityBars.forEach((_, i) => {
        timers.push(setTimeout(() => setVisibleStats(i + 1), i * 200));
      });
    }, 3400));

    // Phase 4c: stagger-reveal data tags
    timers.push(setTimeout(() => {
      allDataClasses.forEach((_, i) => {
        timers.push(setTimeout(() => setVisibleTags(i + 1), i * 80));
      });
    }, 4200));

    // Phase 5: fadeout
    timers.push(setTimeout(() => setPhase('fadeout'), 6000));

    // Phase 6: done → call onComplete
    timers.push(setTimeout(() => {
      setPhase('done');
      onComplete?.();
    }, 6800));

    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  // Allow skip on click
  function handleSkip() {
    setPhase('done');
    onComplete?.();
  }

  if (phase === 'done') return null;

  return (
    <div
      ref={containerRef}
      className={`breach-reveal ${phase}`}
      onClick={handleSkip}
    >
      {/* Background effects */}
      <div className="breach-reveal-scanlines" />
      <div className="breach-reveal-vignette" />
      <div className="breach-reveal-grid" />

      {/* Phase: scanning — digital rain / scan lines */}
      {(phase === 'scanning' || phase === 'init') && (
        <div className="breach-scan-phase">
          <div className="breach-scan-spinner" />
          <div className="breach-scan-text">SCANNING DATABASE...</div>
          <div className="breach-scan-bar">
            <div className="breach-scan-bar-fill" />
          </div>
        </div>
      )}

      {/* Phase: alert — big BREACHED text */}
      {(phase === 'alert' || phase === 'stats' || phase === 'fadeout') && (
        <div className="breach-alert-phase">
          <div className="breach-alert-icon">⚠</div>
          <h1 className="breach-alert-title" data-text="BREACHED">
            BREACHED
          </h1>
          <div className="breach-alert-subtitle">
            YOUR DATA HAS BEEN COMPROMISED
          </div>
        </div>
      )}

      {/* Phase: stats — breach count + severity */}
      {(phase === 'stats' || phase === 'fadeout') && (
        <div className="breach-stats-phase">
          <div className="breach-count-wrap">
            <div className="breach-count-number">{countUp}</div>
            <div className="breach-count-label">
              {total === 1 ? 'BREACH DETECTED' : 'BREACHES DETECTED'}
            </div>
          </div>

          <div className="breach-severity-bars">
            {severityBars.map((bar, i) => (
              <div
                key={bar.label}
                className={`breach-severity-row ${i < visibleStats ? 'visible' : ''}`}
                style={{ '--bar-color': bar.color, '--bar-glow': bar.glow }}
              >
                <span className="breach-severity-label">{bar.label}</span>
                <div className="breach-severity-track">
                  <div
                    className="breach-severity-fill"
                    style={{ width: i < visibleStats ? `${(bar.count / total) * 100}%` : '0%' }}
                  />
                </div>
                <span className="breach-severity-count">{bar.count}</span>
              </div>
            ))}
          </div>

          {allDataClasses.length > 0 && (
            <div className="breach-data-classes">
              <div className="breach-data-label">EXPOSED DATA CATEGORIES</div>
              <div className="breach-data-tags">
                {allDataClasses.map((dc, i) => (
                  <span
                    key={dc}
                    className={`breach-data-tag ${i < visibleTags ? 'visible' : ''}`}
                  >
                    {dc}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Skip hint */}
      <div className="breach-skip-hint">Click anywhere to skip</div>
    </div>
  );
}
