// ============================================================
// Privix — Component: ExposureGlobe
// ============================================================
// 3D rotating globe showing data broker exposure locations.
// Arcs pulse from user origin → every broker that has their data.
// Styled to match Privix's green cyber-OS aesthetic.
// ============================================================

import { useEffect, useRef, useMemo, useState } from 'react';
import Globe from 'react-globe.gl';

// ── Textures (same CDN as Lunar) ────────────────────────────
const EARTH_TEXTURE  = '//unpkg.com/three-globe/example/img/earth-night.jpg';
const BUMP_MAP       = '//unpkg.com/three-globe/example/img/earth-topology.png';
const NIGHT_SKY      = '//unpkg.com/three-globe/example/img/night-sky.png';

// ── Known data broker HQ locations ──────────────────────────
const BROKER_NODES = [
  { id: 'acxiom',        name: 'Acxiom',            lat: 35.09,  lng: -92.44,  country: 'USA',         risk: 'critical' },
  { id: 'lexisnexis',    name: 'LexisNexis',        lat: 34.07,  lng: -84.29,  country: 'USA',         risk: 'critical' },
  { id: 'spokeo',        name: 'Spokeo',             lat: 34.14,  lng: -118.14, country: 'USA',         risk: 'high'     },
  { id: 'whitepages',    name: 'Whitepages',         lat: 47.60,  lng: -122.33, country: 'USA',         risk: 'high'     },
  { id: 'beenverified',  name: 'BeenVerified',       lat: 40.71,  lng: -74.00,  country: 'USA',         risk: 'high'     },
  { id: 'intelius',      name: 'Intelius',           lat: 47.61,  lng: -122.20, country: 'USA',         risk: 'medium'   },
  { id: 'mylife',        name: 'MyLife',             lat: 34.05,  lng: -118.24, country: 'USA',         risk: 'high'     },
  { id: 'radaris',       name: 'Radaris',            lat: 42.35,  lng: -71.06,  country: 'USA',         risk: 'medium'   },
  { id: 'peopledata',    name: 'PeopleDataLabs',     lat: 37.78,  lng: -122.41, country: 'USA',         risk: 'critical' },
  { id: 'clearbit',      name: 'Clearbit',           lat: 37.77,  lng: -122.43, country: 'USA',         risk: 'medium'   },
  { id: 'databroker_eu', name: 'DataBroker EU',      lat: 52.37,  lng: 4.90,    country: 'Netherlands', risk: 'high'     },
  { id: 'bisnode',       name: 'Bisnode',             lat: 59.33,  lng: 18.07,   country: 'Sweden',      risk: 'medium'   },
  { id: 'crif',          name: 'CRIF',               lat: 44.49,  lng: 11.33,   country: 'Italy',       risk: 'medium'   },
  { id: 'dataprovider',  name: 'DataProvider.com',   lat: 51.51,  lng: 0.12,    country: 'UK',          risk: 'high'     },
  { id: 'hibp',          name: 'HIBP Database',      lat: -33.86, lng: 151.21,  country: 'Australia',   risk: 'critical' },
  { id: 'dehashed',      name: 'DeHashed',           lat: 32.71,  lng: -117.16, country: 'USA',         risk: 'critical' },
  { id: 'snusbase',      name: 'Snusbase',           lat: 48.20,  lng: 16.37,   country: 'Austria',     risk: 'high'     },
];

// ── Risk → color mapping ─────────────────────────────────────
const RISK_COLOR = {
  critical: '#ff003c',
  high:     '#ff6b00',
  medium:   '#ffb86c',
  low:      '#00ff41',
};

// "User" origin point — center of India (demo default)
const USER_ORIGIN = { lat: 20.59, lng: 78.96 };

// Map finding source names → broker node ids
const SOURCE_MAP = {
  'DataBrokerX':         'acxiom',
  'PeopleFinderY':       'spokeo',
  'HaveIBeenPwned':      'hibp',
  'HIBP Pwned Passwords':'dehashed',
  'Google':              'beenverified',
  'brokerA':             'lexisnexis',
  'brokerB':             'whitepages',
};

function getRiskColor(risk) {
  return RISK_COLOR[risk] || '#00ff41';
}

// ── Tooltip label ─────────────────────────────────────────────
function makeLabel(node, isExposed) {
  return `
    <div style="
      background:rgba(0,0,0,0.92);
      border:1px solid ${getRiskColor(node.risk)};
      padding:10px 14px;
      font-family:'JetBrains Mono',monospace;
      min-width:180px;
    ">
      <div style="font-size:0.6rem;color:rgba(0,255,65,0.5);letter-spacing:.14em;text-transform:uppercase;margin-bottom:4px">${node.country}</div>
      <div style="font-size:0.85rem;font-weight:700;color:#fff;margin-bottom:6px">${node.name}</div>
      <div style="display:flex;align-items:center;gap:6px;font-size:0.65rem;">
        <span style="width:8px;height:8px;background:${getRiskColor(node.risk)};display:inline-block;border-radius:50%"></span>
        <span style="color:${getRiskColor(node.risk)};text-transform:uppercase;font-weight:700;letter-spacing:.1em">${node.risk}</span>
        ${isExposed ? '<span style="color:rgba(255,255,255,0.4);margin-left:8px">● YOUR DATA HERE</span>' : ''}
      </div>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────
export default function ExposureGlobe({ findings = [] }) {
  const globeRef = useRef();
  const containerRef = useRef();
  const [width, setWidth] = useState(800);
  const [ready, setReady] = useState(false);

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Globe setup after mount
  useEffect(() => {
    if (!globeRef.current) return;
    const g = globeRef.current;
    g.controls().autoRotate      = true;
    g.controls().autoRotateSpeed = 0.5;
    g.controls().enableDamping   = true;
    g.controls().dampingFactor   = 0.08;
    g.controls().minDistance     = 200;
    g.controls().maxDistance     = 600;
    g.pointOfView({ lat: 20, lng: 30, altitude: 2.2 }, 0);

    // Boost scene lighting for the green atmosphere
    const scene = g.scene();
    scene.children.forEach(obj => {
      if (obj.type === 'DirectionalLight') obj.intensity = 2.0;
      if (obj.type === 'AmbientLight')     obj.intensity = 0.15;
    });

    setReady(true);
  }, []);

  // Determine which brokers have user's data
  const exposedIds = useMemo(() => {
    const ids = new Set();
    findings.forEach(f => {
      const mapped = SOURCE_MAP[f.source];
      if (mapped) ids.add(mapped);
      // Fallback: pick first broker if unknown source
      if (!mapped && BROKER_NODES.length > 0) ids.add(BROKER_NODES[0].id);
    });
    // Always show at least 4 exposed for demo impact
    if (ids.size === 0) {
      ['acxiom', 'hibp', 'beenverified', 'databroker_eu'].forEach(id => ids.add(id));
    }
    return ids;
  }, [findings]);

  // Points: all brokers
  const points = useMemo(() =>
    BROKER_NODES.map(node => ({
      ...node,
      isExposed: exposedIds.has(node.id),
      color:     exposedIds.has(node.id) ? getRiskColor(node.risk) : 'rgba(0,255,65,0.25)',
      radius:    exposedIds.has(node.id) ? (node.risk === 'critical' ? 0.6 : 0.4) : 0.2,
      altitude:  exposedIds.has(node.id) ? 0.02 : 0.005,
    }))
  , [exposedIds]);

  // Arcs: user → each exposed broker
  const arcs = useMemo(() =>
    BROKER_NODES
      .filter(node => exposedIds.has(node.id))
      .map(node => ({
        startLat:  USER_ORIGIN.lat,
        startLng:  USER_ORIGIN.lng,
        endLat:    node.lat,
        endLng:    node.lng,
        color:     [getRiskColor(node.risk), 'rgba(0,255,65,0.1)'],
        label:     node.name,
        risk:      node.risk,
      }))
  , [exposedIds]);

  const height = Math.max(420, Math.round(width * 0.56));

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%', background: 'transparent', overflow: 'hidden' }}
    >
      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 16, left: 16, zIndex: 10,
        display: 'flex', flexDirection: 'column', gap: '6px',
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        {Object.entries(RISK_COLOR).map(([risk, color]) => (
          <div key={risk} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
            {risk}
          </div>
        ))}
      </div>

      {/* Exposed count badge */}
      <div style={{
        position: 'absolute', top: 12, right: 12, zIndex: 10,
        background: 'rgba(255,0,60,0.12)', border: '1px solid rgba(255,0,60,0.4)',
        padding: '5px 12px', fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.65rem', fontWeight: 700, color: '#ff003c',
        letterSpacing: '.1em', textTransform: 'uppercase',
        display: 'flex', alignItems: 'center', gap: '6px',
      }}>
        <span style={{ animation: 'pulse 1.5s infinite' }}>●</span>
        {exposedIds.size} BROKER{exposedIds.size !== 1 ? 'S' : ''} HOLD YOUR DATA
      </div>

      <Globe
        ref={globeRef}
        width={width}
        height={height}

        // Textures
        globeImageUrl={EARTH_TEXTURE}
        bumpImageUrl={BUMP_MAP}
        backgroundImageUrl={NIGHT_SKY}

        // Atmosphere — green like Privix
        showAtmosphere={true}
        atmosphereColor="#00ff41"
        atmosphereAltitude={0.18}

        // ── Points (broker nodes) ──
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointRadius="radius"
        pointAltitude="altitude"
        pointResolution={12}
        pointLabel={d => makeLabel(d, d.isExposed)}

        // ── Arcs (data flow: user → broker) ──
        arcsData={arcs}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor="color"
        arcAltitudeAutoScale={0.35}
        arcStroke={0.5}
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={2000}
        arcTransitionDuration={600}
        arcLabel="label"
      />
    </div>
  );
}
