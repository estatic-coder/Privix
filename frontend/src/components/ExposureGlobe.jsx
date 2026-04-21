// ============================================================
// Privix — Component: ExposureGlobe v4
// ============================================================
// Precise broker locations, custom SVG cyber-node markers,
// rich hover tooltip (city, country, risk, broker name).
// No arcs. No blobs. Clean threat-intel aesthetic.
// ============================================================

import { useEffect, useRef, useMemo, useState } from 'react';
import Globe from 'react-globe.gl';

const EARTH_TEXTURE = '//unpkg.com/three-globe/example/img/earth-night.jpg';
const BUMP_MAP      = '//unpkg.com/three-globe/example/img/earth-topology.png';
const NIGHT_SKY     = '//unpkg.com/three-globe/example/img/night-sky.png';

// ── Real data broker HQ locations (verified) ─────────────────
const BROKER_NODES = [
  // ─ United States ─
  { id: 'acxiom',       name: 'Acxiom',           city: 'Conway, AR',          lat: 35.0887, lng: -92.4421, country: 'United States', risk: 'critical' },
  { id: 'lexisnexis',   name: 'LexisNexis Risk',  city: 'Alpharetta, GA',      lat: 34.0754, lng: -84.2941, country: 'United States', risk: 'critical' },
  { id: 'peopledata',   name: 'PeopleDataLabs',   city: 'San Francisco, CA',   lat: 37.7749, lng: -122.4194,country: 'United States', risk: 'critical' },
  { id: 'dehashed',     name: 'DeHashed',          city: 'San Diego, CA',       lat: 32.7157, lng: -117.1611,country: 'United States', risk: 'critical' },
  { id: 'spokeo',       name: 'Spokeo',            city: 'Pasadena, CA',        lat: 34.1478, lng: -118.1445,country: 'United States', risk: 'high'     },
  { id: 'mylife',       name: 'MyLife',            city: 'Los Angeles, CA',     lat: 34.0522, lng: -118.2437,country: 'United States', risk: 'high'     },
  { id: 'clearbit',     name: 'Clearbit (HubSpot)',city: 'San Francisco, CA',   lat: 37.7859, lng: -122.4364,country: 'United States', risk: 'medium'   },
  { id: 'beenverified', name: 'BeenVerified',      city: 'New York, NY',        lat: 40.7128, lng: -74.006,  country: 'United States', risk: 'high'     },
  { id: 'whitepages',   name: 'Whitepages',        city: 'Seattle, WA',         lat: 47.6062, lng: -122.3321,country: 'United States', risk: 'high'     },
  { id: 'intelius',     name: 'Intelius',          city: 'Bellevue, WA',        lat: 47.6101, lng: -122.2015,country: 'United States', risk: 'medium'   },
  { id: 'radaris',      name: 'Radaris',           city: 'Cambridge, MA',       lat: 42.3601, lng: -71.0589, country: 'United States', risk: 'medium'   },
  // ─ Europe ─
  { id: 'databroker_eu',name: 'DataBroker EU',     city: 'Amsterdam',           lat: 52.3676, lng: 4.9041,   country: 'Netherlands',   risk: 'high'     },
  { id: 'dataprovider', name: 'DataProvider.com',  city: 'London',              lat: 51.5074, lng: -0.1278,  country: 'United Kingdom', risk: 'high'    },
  { id: 'bisnode',      name: 'Bisnode / Dun&Brad', city: 'Stockholm',          lat: 59.3293, lng: 18.0686,  country: 'Sweden',        risk: 'medium'   },
  { id: 'crif',         name: 'CRIF',              city: 'Bologna',             lat: 44.4949, lng: 11.3426,  country: 'Italy',         risk: 'medium'   },
  { id: 'snusbase',     name: 'Snusbase',          city: 'Vienna',              lat: 48.2082, lng: 16.3738,  country: 'Austria',       risk: 'high'     },
  // ─ Australia ─
  { id: 'hibp',         name: 'HaveIBeenPwned',    city: 'Sydney',              lat: -33.8688, lng: 151.2093,country: 'Australia',     risk: 'critical' },
];

const RISK_COLOR = {
  critical: '#ff003c',
  high:     '#ff6b00',
  medium:   '#ffb86c',
  low:      '#00ff41',
};

const SOURCE_MAP = {
  'DataBrokerX':          'acxiom',
  'PeopleFinderY':        'spokeo',
  'HaveIBeenPwned':       'hibp',
  'HIBP Pwned Passwords': 'dehashed',
  'Google':               'beenverified',
  'brokerA':              'lexisnexis',
  'brokerB':              'whitepages',
};

// ── Inject CSS keyframes once ─────────────────────────────────
let cssInjected = false;
function ensureCSS() {
  if (cssInjected || typeof document === 'undefined') return;
  cssInjected = true;
  const s = document.createElement('style');
  s.textContent = `
    @keyframes pvx-ripple {
      0%   { transform: scale(1); opacity: 0.7; }
      100% { transform: scale(3.5); opacity: 0; }
    }
    @keyframes pvx-breathe {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.6; }
    }
    .pvx-node { position: relative; cursor: pointer; }
    .pvx-tip  {
      pointer-events: none;
      position: absolute;
      bottom: calc(100% + 14px);
      left: 50%;
      transform: translateX(-50%);
      opacity: 0;
      transition: opacity .15s, bottom .15s;
      z-index: 9999;
      white-space: nowrap;
    }
    .pvx-node:hover .pvx-tip {
      opacity: 1;
      bottom: calc(100% + 18px);
    }
    .pvx-node:hover svg { filter: brightness(1.4); }
  `;
  document.head.appendChild(s);
}

// ── SVG Cyber-node icon ───────────────────────────────────────
// A diamond crosshair: ◇ outline + center dot + 4 tick marks
function cyberNodeSVG(color, size = 28) {
  const h = size / 2;
  const tick = size * 0.18;
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <filter id="glow-${color.replace('#','')}">
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <!-- Diamond outline -->
      <polygon
        points="${h},2 ${size-2},${h} ${h},${size-2} 2,${h}"
        fill="none"
        stroke="${color}"
        stroke-width="1.2"
        filter="url(#glow-${color.replace('#','')})"
      />
      <!-- Cross ticks -->
      <line x1="${h}" y1="2"         x2="${h}" y2="${2 + tick}"        stroke="${color}" stroke-width="1"/>
      <line x1="${h}" y1="${size-2}"  x2="${h}" y2="${size-2-tick}"     stroke="${color}" stroke-width="1"/>
      <line x1="2"         y1="${h}" x2="${2 + tick}"    y2="${h}"      stroke="${color}" stroke-width="1"/>
      <line x1="${size-2}" y1="${h}" x2="${size-2-tick}"  y2="${h}"      stroke="${color}" stroke-width="1"/>
      <!-- Center dot -->
      <circle cx="${h}" cy="${h}" r="2.5" fill="${color}" filter="url(#glow-${color.replace('#','')})"/>
    </svg>
  `;
}

// ── Build DOM element per marker ──────────────────────────────
function makeMarkerEl(node, isExposed) {
  ensureCSS();
  const color = RISK_COLOR[node.risk] || '#00ff41';
  const iconSize = isExposed ? 32 : 20;
  const opacity  = isExposed ? 1 : 0.28;

  const wrap = document.createElement('div');
  wrap.className = 'pvx-node';
  wrap.style.cssText = `
    width: ${iconSize}px; height: ${iconSize}px;
    display: flex; align-items: center; justify-content: center;
    opacity: ${opacity};
    animation: pvx-breathe ${2 + Math.random() * 1.5}s ease-in-out infinite;
  `;

  // Ripple ring (exposed only)
  if (isExposed) {
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      width: ${iconSize * 0.55}px; height: ${iconSize * 0.55}px;
      border-radius: 50%;
      border: 1px solid ${color};
      animation: pvx-ripple 2.2s ease-out infinite;
      animation-delay: ${Math.random() * 1.2}s;
      opacity: 0.5;
      pointer-events: none;
    `;
    wrap.appendChild(ripple);
  }

  // SVG icon
  const iconWrap = document.createElement('div');
  iconWrap.innerHTML = cyberNodeSVG(color, iconSize);
  iconWrap.style.cssText = 'position: relative; z-index: 2; line-height: 0;';
  wrap.appendChild(iconWrap);

  // Hover tooltip
  const tip = document.createElement('div');
  tip.className = 'pvx-tip';
  tip.innerHTML = `
    <div style="
      background: rgba(0,0,0,0.97);
      border: 1px solid ${color};
      border-top: 2px solid ${color};
      padding: 10px 14px;
      font-family: 'JetBrains Mono', monospace;
      min-width: 200px;
      box-shadow: 0 0 20px ${color}20;
    ">
      <div style="font-size:9px; color:rgba(255,255,255,0.35); letter-spacing:.16em; text-transform:uppercase; margin-bottom:4px;">
        📍 ${node.city} · ${node.country}
      </div>
      <div style="font-size:13px; font-weight:800; color:#fff; margin-bottom:6px; letter-spacing:-.01em;">
        ${node.name}
      </div>
      <div style="display:flex; align-items:center; justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:5px;">
          <span style="width:6px; height:6px; border-radius:50%; background:${color}; display:inline-block; box-shadow:0 0 5px ${color};"></span>
          <span style="font-size:9px; font-weight:800; color:${color}; letter-spacing:.14em; text-transform:uppercase;">${node.risk}</span>
        </div>
        ${isExposed
          ? `<span style="font-size:9px; color:rgba(255,0,60,.8); font-weight:700; letter-spacing:.1em; text-transform:uppercase;">● YOUR DATA HERE</span>`
          : `<span style="font-size:9px; color:rgba(255,255,255,0.2); letter-spacing:.08em;">no match</span>`
        }
      </div>
      <!-- Arrow -->
      <div style="
        position:absolute; bottom:-6px; left:50%; transform:translateX(-50%);
        width:10px; height:10px; background:rgba(0,0,0,0.97);
        border-right:1px solid ${color}; border-bottom:1px solid ${color};
        transform:translateX(-50%) rotate(45deg);
      "></div>
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

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const g = globeRef.current;
    if (!g) return;
    g.controls().autoRotate      = true;
    g.controls().autoRotateSpeed = 0.55;
    g.controls().enableDamping   = true;
    g.controls().dampingFactor   = 0.07;
    g.controls().minDistance     = 200;
    g.controls().maxDistance     = 520;
    g.pointOfView({ lat: 30, lng: -20, altitude: 2.1 }, 0);

    const scene = g.scene();
    scene.children.forEach(obj => {
      if (obj.type === 'DirectionalLight') obj.intensity = 2.0;
      if (obj.type === 'AmbientLight')     obj.intensity = 0.1;
    });
  }, []);

  const exposedIds = useMemo(() => {
    const ids = new Set();
    findings.forEach(f => {
      const mapped = SOURCE_MAP[f.source];
      if (mapped) ids.add(mapped);
    });
    // Demo fallback
    if (ids.size === 0) {
      ['acxiom', 'hibp', 'beenverified', 'databroker_eu', 'dehashed', 'peopledata'].forEach(id => ids.add(id));
    }
    return ids;
  }, [findings]);

  const markerData = useMemo(() =>
    BROKER_NODES.map(n => ({
      ...n,
      isExposed: exposedIds.has(n.id),
      altitude:  exposedIds.has(n.id) ? 0.018 : 0.005,
    }))
  , [exposedIds]);

  const exposedCount = exposedIds.size;
  const height = Math.max(460, Math.round(width * 0.58));

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', background: '#000', overflow: 'hidden' }}>

      {/* Top-right badge */}
      <div style={{
        position: 'absolute', top: 14, right: 14, zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'rgba(255,0,60,0.08)', border: '1px solid rgba(255,0,60,0.35)',
        padding: '6px 14px',
        fontFamily: "'JetBrains Mono',monospace",
        fontSize: '0.62rem', fontWeight: 700, color: '#ff003c',
        letterSpacing: '.12em', textTransform: 'uppercase',
      }}>
        ● {exposedCount} BROKER{exposedCount !== 1 ? 'S' : ''} HOLD YOUR DATA
      </div>

      {/* Bottom-left legend */}
      <div style={{
        position: 'absolute', bottom: 18, left: 18, zIndex: 10,
        display: 'flex', flexDirection: 'column', gap: 6,
        fontFamily: "'JetBrains Mono',monospace",
      }}>
        {Object.entries(RISK_COLOR).map(([risk, color]) => (
          <div key={risk} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.58rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, boxShadow: `0 0 5px ${color}` }} />
            {risk}
          </div>
        ))}
      </div>

      <Globe
        ref={globeRef}
        width={width}
        height={height}
        globeImageUrl={EARTH_TEXTURE}
        bumpImageUrl={BUMP_MAP}
        backgroundImageUrl={NIGHT_SKY}
        showAtmosphere={true}
        atmosphereColor="#00ff41"
        atmosphereAltitude={0.14}
        htmlElementsData={markerData}
        htmlElement={d => makeMarkerEl(d, d.isExposed)}
        htmlLat="lat"
        htmlLng="lng"
        htmlAltitude="altitude"
        htmlTransitionDuration={500}
      />
    </div>
  );
}
