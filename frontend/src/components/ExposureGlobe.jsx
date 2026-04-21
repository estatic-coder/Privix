// ============================================================
// Privix — Component: ExposureGlobe (Polished)
// ============================================================
// 3D rotating globe with pulsing HTML markers at each data
// broker location. No arcs. Clean, premium cyber aesthetic.
// ============================================================

import { useEffect, useRef, useMemo, useState } from 'react';
import Globe from 'react-globe.gl';

const EARTH_TEXTURE = '//unpkg.com/three-globe/example/img/earth-night.jpg';
const BUMP_MAP      = '//unpkg.com/three-globe/example/img/earth-topology.png';
const NIGHT_SKY     = '//unpkg.com/three-globe/example/img/night-sky.png';

// ── Known data broker HQ locations ──────────────────────────
const BROKER_NODES = [
  { id: 'acxiom',       name: 'Acxiom',          lat: 35.09,  lng: -92.44,  country: 'USA',         risk: 'critical' },
  { id: 'lexisnexis',   name: 'LexisNexis',       lat: 34.07,  lng: -84.29,  country: 'USA',         risk: 'critical' },
  { id: 'spokeo',       name: 'Spokeo',            lat: 34.14,  lng: -118.14, country: 'USA',         risk: 'high'     },
  { id: 'whitepages',   name: 'Whitepages',        lat: 47.60,  lng: -122.33, country: 'USA',         risk: 'high'     },
  { id: 'beenverified', name: 'BeenVerified',      lat: 40.71,  lng: -74.00,  country: 'USA',         risk: 'high'     },
  { id: 'intelius',     name: 'Intelius',          lat: 47.61,  lng: -122.20, country: 'USA',         risk: 'medium'   },
  { id: 'mylife',       name: 'MyLife',            lat: 34.05,  lng: -118.24, country: 'USA',         risk: 'high'     },
  { id: 'radaris',      name: 'Radaris',           lat: 42.35,  lng: -71.06,  country: 'USA',         risk: 'medium'   },
  { id: 'peopledata',   name: 'PeopleDataLabs',    lat: 37.78,  lng: -122.41, country: 'USA',         risk: 'critical' },
  { id: 'dehashed',     name: 'DeHashed',          lat: 32.71,  lng: -117.16, country: 'USA',         risk: 'critical' },
  { id: 'databroker_eu',name: 'DataBroker EU',     lat: 52.37,  lng: 4.90,    country: 'Netherlands', risk: 'high'     },
  { id: 'bisnode',      name: 'Bisnode',            lat: 59.33,  lng: 18.07,   country: 'Sweden',      risk: 'medium'   },
  { id: 'dataprovider', name: 'DataProvider.com',  lat: 51.51,  lng: 0.12,    country: 'UK',          risk: 'high'     },
  { id: 'hibp',         name: 'HIBP Database',     lat: -33.86, lng: 151.21,  country: 'Australia',   risk: 'critical' },
  { id: 'crif',         name: 'CRIF',              lat: 44.49,  lng: 11.33,   country: 'Italy',       risk: 'medium'   },
  { id: 'snusbase',     name: 'Snusbase',          lat: 48.20,  lng: 16.37,   country: 'Austria',     risk: 'high'     },
  { id: 'clearbit',     name: 'Clearbit',          lat: 37.77,  lng: -122.43, country: 'USA',         risk: 'medium'   },
];

const RISK_COLOR = {
  critical: '#ff003c',
  high:     '#ff6b00',
  medium:   '#ffb86c',
  low:      '#00ff41',
};

const RISK_SIZE = { critical: 18, high: 14, medium: 11, low: 9 };

const SOURCE_MAP = {
  'DataBrokerX':          'acxiom',
  'PeopleFinderY':        'spokeo',
  'HaveIBeenPwned':       'hibp',
  'HIBP Pwned Passwords': 'dehashed',
  'Google':               'beenverified',
  'brokerA':              'lexisnexis',
  'brokerB':              'whitepages',
};

// Inject global keyframe once
let injected = false;
function injectStyles() {
  if (injected || typeof document === 'undefined') return;
  injected = true;
  const s = document.createElement('style');
  s.textContent = `
    @keyframes privix-ping {
      0%   { transform: scale(1);   opacity: 0.8; }
      70%  { transform: scale(2.4); opacity: 0;   }
      100% { transform: scale(2.4); opacity: 0;   }
    }
    @keyframes privix-pulse-ring {
      0%   { transform: scale(0.95); opacity: 1;   }
      50%  { transform: scale(1.05); opacity: 0.7; }
      100% { transform: scale(0.95); opacity: 1;   }
    }
    .privix-marker-wrap { position: relative; cursor: pointer; }
    .privix-marker-wrap:hover .privix-tooltip { opacity: 1; pointer-events: auto; transform: translateY(-4px); }
    .privix-tooltip {
      opacity: 0;
      pointer-events: none;
      transition: opacity .2s, transform .2s;
      transform: translateY(0px);
      position: absolute;
      bottom: calc(100% + 10px);
      left: 50%;
      transform-origin: bottom center;
      translate: -50% 0;
      white-space: nowrap;
      background: rgba(0,0,0,0.95);
      border: 1px solid;
      padding: 8px 12px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      z-index: 999;
      min-width: 160px;
    }
  `;
  document.head.appendChild(s);
}

// Build a DOM element for each broker marker
function makeMarkerEl(node, isExposed) {
  injectStyles();
  const color   = RISK_COLOR[node.risk] || '#00ff41';
  const size    = isExposed ? RISK_SIZE[node.risk] || 12 : 7;
  const opacity = isExposed ? 1 : 0.3;

  const wrap = document.createElement('div');
  wrap.className = 'privix-marker-wrap';
  wrap.style.cssText = `width:${size * 3}px; height:${size * 3}px; display:flex; align-items:center; justify-content:center; opacity:${opacity};`;

  // Ping ring (exposed only)
  if (isExposed) {
    const ping = document.createElement('div');
    ping.style.cssText = `
      position:absolute;
      width:${size}px; height:${size}px;
      border-radius:50%;
      background:${color};
      animation: privix-ping ${1.8 + Math.random() * 0.8}s ease-out infinite;
      opacity:.6;
    `;
    wrap.appendChild(ping);

    // Second ring offset
    const ping2 = document.createElement('div');
    ping2.style.cssText = `
      position:absolute;
      width:${size}px; height:${size}px;
      border-radius:50%;
      background:${color};
      animation: privix-ping ${1.8 + Math.random() * 0.8}s ease-out infinite;
      animation-delay: .6s;
      opacity:.4;
    `;
    wrap.appendChild(ping2);
  }

  // Core dot
  const dot = document.createElement('div');
  dot.style.cssText = `
    position:absolute;
    width:${size}px; height:${size}px;
    border-radius:50%;
    background:${color};
    box-shadow: 0 0 ${isExposed ? size * 1.5 : 3}px ${color};
    animation: ${isExposed ? 'privix-pulse-ring 2s ease-in-out infinite' : 'none'};
    z-index:2;
  `;
  wrap.appendChild(dot);

  // Tooltip
  const tip = document.createElement('div');
  tip.className = 'privix-tooltip';
  tip.style.borderColor = color;
  tip.innerHTML = `
    <div style="font-size:9px;color:rgba(0,255,65,.5);letter-spacing:.14em;text-transform:uppercase;margin-bottom:3px">${node.country}</div>
    <div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:5px">${node.name}</div>
    <div style="display:flex;align-items:center;gap:5px;">
      <span style="width:6px;height:6px;border-radius:50%;background:${color};display:inline-block;box-shadow:0 0 4px ${color}"></span>
      <span style="color:${color};font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">${node.risk}</span>
      ${isExposed ? `<span style="margin-left:6px;color:rgba(255,255,255,.35);font-size:9px">● EXPOSED</span>` : ''}
    </div>
  `;
  wrap.appendChild(tip);

  return wrap;
}

// ─────────────────────────────────────────────────────────────
export default function ExposureGlobe({ findings = [] }) {
  const globeRef     = useRef();
  const containerRef = useRef();
  const [width, setWidth] = useState(800);

  // Responsive width
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Globe controls after mount
  useEffect(() => {
    const g = globeRef.current;
    if (!g) return;
    g.controls().autoRotate      = true;
    g.controls().autoRotateSpeed = 0.6;
    g.controls().enableDamping   = true;
    g.controls().dampingFactor   = 0.07;
    g.controls().minDistance     = 180;
    g.controls().maxDistance     = 550;
    g.pointOfView({ lat: 25, lng: 0, altitude: 2.0 }, 0);

    const scene = g.scene();
    scene.children.forEach(obj => {
      if (obj.type === 'DirectionalLight') obj.intensity = 2.2;
      if (obj.type === 'AmbientLight')     obj.intensity = 0.1;
    });
  }, []);

  // Which broker ids are exposed from scan findings
  const exposedIds = useMemo(() => {
    const ids = new Set();
    findings.forEach(f => {
      const mapped = SOURCE_MAP[f.source];
      if (mapped) ids.add(mapped);
    });
    // Default demo exposure set
    if (ids.size === 0) {
      ['acxiom', 'hibp', 'beenverified', 'databroker_eu', 'dehashed', 'peopledata'].forEach(id => ids.add(id));
    }
    return ids;
  }, [findings]);

  const markerData = useMemo(() =>
    BROKER_NODES.map(node => ({
      ...node,
      isExposed: exposedIds.has(node.id),
      altitude:  exposedIds.has(node.id) ? 0.01 : 0.005,
    }))
  , [exposedIds]);

  const exposedCount = [...exposedIds].length;
  const height = Math.max(460, Math.round(width * 0.58));

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', overflow: 'hidden', background: '#000' }}>

      {/* ── Top-right badge ── */}
      <div style={{
        position: 'absolute', top: 14, right: 14, zIndex: 10,
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'rgba(255,0,60,0.1)', border: '1px solid rgba(255,0,60,0.4)',
        padding: '6px 14px',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.62rem', fontWeight: 700, color: '#ff003c',
        letterSpacing: '.12em', textTransform: 'uppercase',
      }}>
        <span style={{ fontSize: '0.7rem' }}>●</span>
        {exposedCount} broker{exposedCount !== 1 ? 's' : ''} hold your data
      </div>

      {/* ── Bottom-left legend ── */}
      <div style={{
        position: 'absolute', bottom: 18, left: 18, zIndex: 10,
        display: 'flex', flexDirection: 'column', gap: '6px',
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        {Object.entries(RISK_COLOR).map(([risk, color]) => (
          <div key={risk} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.58rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
            {risk}
          </div>
        ))}
      </div>

      {/* ── Globe ── */}
      <Globe
        ref={globeRef}
        width={width}
        height={height}
        globeImageUrl={EARTH_TEXTURE}
        bumpImageUrl={BUMP_MAP}
        backgroundImageUrl={NIGHT_SKY}
        showAtmosphere={true}
        atmosphereColor="#00ff41"
        atmosphereAltitude={0.16}

        // HTML markers only — no arcs, no points
        htmlElementsData={markerData}
        htmlElement={d => makeMarkerEl(d, d.isExposed)}
        htmlLat="lat"
        htmlLng="lng"
        htmlAltitude="altitude"
        htmlTransitionDuration={600}
      />
    </div>
  );
}
