import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Database, Server, Crosshair, ShieldAlert, Activity, Shield, Zap, Eye, Lock, Globe, AlertTriangle, Cpu, Wifi, RefreshCw } from 'lucide-react';

const mono = { fontFamily: "'JetBrains Mono', monospace" };

const BREACH_TICKER = [
  "RockYou2024 — 10B plaintext passwords",
  "AT&T — 73M SSNs on darknet forum",
  "LinkedIn — 700M profiles exposed",
  "23andMe — 6.9M genetic profiles",
  "Ticketmaster — 560M records for sale",
  "LastPass — vault keys compromised",
];

const MODULES = [
  { tag: "DATA_CRAWLER.sys",  color: "#00ff41", icon: Database,   desc: "Scraping .onion domains & leak repos in real-time" },
  { tag: "DMCA_STRIKE.exe",   color: "#00ffff", icon: Crosshair,  desc: "Automated takedown — 200+ broker targets" },
  { tag: "OBFUSCATOR.dll",    color: "#00ff41", icon: Lock,       desc: "AES-256 local encryption — zero server retention" },
  { tag: "THREAT_RADAR.sys",  color: "#ff003c", icon: ShieldAlert, desc: "0-day monitoring across tracked credentials" },
  { tag: "ID_ENGINE.sys",     color: "#ffb86c", icon: Eye,        desc: "Cross-refs 400+ breach databases simultaneously" },
  { tag: "VAULT.dll",         color: "#00ffff", icon: Server,     desc: "Encrypted local storage — PII never leaves device" },
];

const STATS = [
  { label: "Credentials Leaked", value: "47B+",  color: "#ff003c" },
  { label: "People Exposed",     value: "3.5B",  color: "#ffb86c" },
  { label: "Brokers Targeted",   value: "200+",  color: "#00ffff" },
  { label: "Detection Rate",     value: "99.1%", color: "#00ff41" },
];

const HELP_TEXT = [
  "AVAILABLE COMMANDS:",
  "  init       — Launch PRIVIX dashboard",
  "  sysinfo    — Display loaded modules",
  "  status     — Show system status",
  "  clear      — Clear terminal output",
  "",
];

const SYSINFO_TEXT = [
  "PRIVIX v2.1.0 — ACTIVE MODULES:",
  "  [✓] DATA_CRAWLER.sys   — RUNNING",
  "  [✓] DMCA_STRIKE.exe    — RUNNING",
  "  [✓] OBFUSCATOR.dll     — RUNNING",
  "  [✓] THREAT_RADAR.sys   — RUNNING",
  "  [✓] ID_ENGINE.sys      — RUNNING",
  "  [✓] VAULT.dll          — RUNNING",
  "",
];

const STATUS_TEXT = [
  "SYSTEM STATUS:",
  "  UPLINK        : SECURE [TLS 1.3]",
  "  CRAWLERS      : 847 ACTIVE THREADS",
  "  BREACH DB     : 47,000,000,000 RECORDS",
  "  BROKERS       : 214 NODES MONITORED",
  "  ENCRYPTION    : AES-256-GCM",
  "  LOG POLICY    : ZERO RETENTION",
  "",
];

export default function Landing() {
  const navigate = useNavigate();
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState([
    "PRIVIX Security System [Version 2.1.0]",
    "(c) 2026 PRIVIX. Ghost Protocol Active.",
    "",
    "Type 'help' for available commands.",
    "Type 'init' to launch the dashboard.",
    "",
  ]);
  const [isBooting, setIsBooting] = useState(false);
  const [bootLogs, setBootLogs] = useState([]);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [telemetry, setTelemetry] = useState([]);
  const [breachCount, setBreachCount] = useState(47000000000);
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [cpuLoad, setCpuLoad] = useState(42);
  const [recentBreaches, setRecentBreaches] = useState([
    { ts: '04:01:12', src: 'HaveIBeenPwned', type: 'EMAIL', sev: 'HIGH',     color: '#ffb86c' },
    { ts: '04:03:44', src: 'DarkWebMarket',  type: 'SSN',   sev: 'CRITICAL', color: '#ff003c' },
    { ts: '04:07:09', src: 'LeakForums',     type: 'PASS',  sev: 'HIGH',     color: '#ffb86c' },
    { ts: '04:11:55', src: 'BreachDir',      type: 'CC',    sev: 'CRITICAL', color: '#ff003c' },
    { ts: '04:15:33', src: 'DeHashed',       type: 'EMAIL', sev: 'MED',      color: '#00ffff' },
    { ts: '04:22:08', src: 'Combolist',      type: 'PASS',  sev: 'HIGH',     color: '#ffb86c' },
  ]);
  const [threatLevels] = useState([
    { label: 'DARKNET EXPOSURE',  pct: 78, color: '#ff003c' },
    { label: 'BROKER COVERAGE',   pct: 94, color: '#00ff41' },
    { label: 'CREDENTIAL RISK',   pct: 61, color: '#ffb86c' },
    { label: 'IDENTITY SURFACE',  pct: 83, color: '#ff003c' },
    { label: 'REMOVAL PROGRESS',  pct: 22, color: '#00ffff' },
  ]);
  const [threadCount, setThreadCount] = useState(847);

  const inputRef = useRef(null);
  const historyEndRef = useRef(null);
  const telemetryRef = useRef(null);

  useEffect(() => { historyEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history]);
  useEffect(() => { if (telemetryRef.current) { telemetryRef.current.scrollTop = telemetryRef.current.scrollHeight; } }, [telemetry]);

  // Clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(t);
  }, []);

  // Breach ticker
  useEffect(() => {
    const t = setInterval(() => setTickerIdx(p => (p + 1) % BREACH_TICKER.length), 3500);
    return () => clearInterval(t);
  }, []);

  // Telemetry stream
  useEffect(() => {
    if (isBooting) return;
    const t = setInterval(() => {
      const ip = Array.from({ length: 4 }, () => Math.floor(Math.random() * 255)).join('.');
      const port = Math.floor(Math.random() * 65535);
      const statuses = ['BLOCK', 'SECURE', 'WARN', 'SCAN', 'OK'];
      const s = statuses[Math.floor(Math.random() * statuses.length)];
      const sColor = s === 'BLOCK' ? '#ff003c' : s === 'WARN' ? '#ffb86c' : '#00ff41';
      setTelemetry(prev => [...prev, { ip, port, status: s, color: sColor, ts: new Date().toLocaleTimeString() }].slice(-30));
      setBreachCount(p => p + Math.floor(Math.random() * 300 + 100));
      setCpuLoad(Math.floor(Math.random() * 30 + 35));
      setThreadCount(p => p + Math.floor(Math.random() * 4 - 2));
      // Add a new breach event
      const SRCS = ['HaveIBeenPwned','DarkWebMarket','LeakForums','BreachDir','DeHashed','Combolist','0day.today','PasteBin'];
      const TYPES = ['EMAIL','SSN','PASS','CC','DOB','ADDR','PHONE'];
      const SEVS = [['CRITICAL','#ff003c'],['HIGH','#ffb86c'],['MED','#00ffff']];
      const [sev, sc] = SEVS[Math.floor(Math.random() * SEVS.length)];
      setRecentBreaches(prev => [{
        ts: new Date().toLocaleTimeString(),
        src: SRCS[Math.floor(Math.random()*SRCS.length)],
        type: TYPES[Math.floor(Math.random()*TYPES.length)],
        sev, color: sc
      }, ...prev].slice(0, 12));
    }, 900);
    return () => clearInterval(t);
  }, [isBooting]);

  const handleCommand = (e) => {
    e.preventDefault();
    const cmd = inputVal.trim().toLowerCase();
    setHistory(prev => [...prev, `root@privix:~$ ${inputVal}`]);
    setInputVal('');
    if (!cmd) return;

    if (cmd === 'init') {
      setIsBooting(true);
      
      // Fast scrolling hex generator
      const genHex = () => Array.from({length: 12}, () => Math.floor(Math.random()*16).toString(16).toUpperCase()).join(' ');
      
      let iters = 0;
      const t = setInterval(() => {
        iters++;
        if (iters < 40) {
          setBootLogs(p => [...p, `[${(Math.random()*9999).toFixed(4)}] ${genHex()} ${genHex()}`].slice(-35));
        } else if (iters === 40) {
          setBootLogs(p => [...p, "", ">> BYPASSING MAINFRAME SECURITY...", ">> OVERRIDING ENCRYPTION PROTOCOLS...", ">> ROOT ACCESS SECURED."]);
        } else if (iters === 50) {
          clearInterval(t);
          setTimeout(() => navigate('/dashboard'), 1500);
        }
      }, 40);

      return;
    }
    if (cmd === 'help')    { setHistory(p => [...p, ...HELP_TEXT]); return; }
    if (cmd === 'sysinfo') { setHistory(p => [...p, ...SYSINFO_TEXT]); return; }
    if (cmd === 'status')  { setHistory(p => [...p, ...STATUS_TEXT]); return; }
    if (cmd === 'clear')   { setHistory([]); return; }
    setHistory(p => [...p, `bash: ${cmd}: command not found`, ""]);
  };

  if (isBooting) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 9999, display: 'flex', flexDirection: 'column', padding: '20px', overflow: 'hidden', ...mono }}>
        {/* Fast scrolling hex stream */}
        <div style={{ flex: 1, color: 'rgba(0,255,65,0.4)', fontSize: '0.65rem', lineHeight: 1.2, whiteSpace: 'pre-wrap', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          {bootLogs.map((log, i) => <div key={i} style={{ color: log.startsWith('>>') ? '#00ff41' : 'inherit', fontWeight: log.startsWith('>>') ? 900 : 400 }}>{log}</div>)}
        </div>
        
        {/* Cinematic Overlay */}
        {bootLogs.some(l => l.includes("ROOT ACCESS SECURED")) && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}>
            <div style={{ color: '#00ff41', fontSize: '3rem', fontWeight: 900, letterSpacing: '0.2em', textShadow: '0 0 40px #00ff41', animation: 'pulse 1s infinite', textAlign: 'center' }}>
              ACCESS GRANTED
              <div style={{ fontSize: '1rem', color: 'rgba(0,255,65,0.6)', marginTop: '20px', letterSpacing: '0.4em', fontWeight: 400 }}>GHOST PROTOCOL INITIATED</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', background: '#000', color: '#00ff41', display: 'flex', flexDirection: 'column', ...mono }}>



      {/* ── Main 3-Column Layout ── */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '240px 1fr 280px', overflow: 'hidden' }}>

        {/* ── LEFT PANEL ── */}
        <div style={{ borderRight: '1px solid rgba(0,255,65,0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Telemetry header */}
          <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(0,255,65,0.12)', fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(0,255,65,0.5)', flexShrink: 0 }}>
            ◉ NETWORK TELEMETRY
          </div>

          {/* Live telemetry feed */}
          <div ref={telemetryRef} style={{ flex: 1, overflowY: 'auto', padding: '8px', fontSize: '0.55rem', color: 'rgba(0,255,65,0.7)', lineHeight: 1.7 }} className="terminal-scroll">
            {telemetry.map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '4px' }}>
                <span style={{ color: 'rgba(0,255,65,0.35)', flexShrink: 0 }}>{t.ts}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{t.ip}:{t.port}</span>
                <span style={{ color: t.color, flexShrink: 0, fontWeight: 700 }}>{t.status}</span>
              </div>
            ))}
          </div>

          {/* Live stats */}
          <div style={{ borderTop: '1px solid rgba(0,255,65,0.15)', padding: '8px', flexShrink: 0 }}>
            <div style={{ fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(0,255,65,0.4)', marginBottom: '8px' }}>LIVE INTEL</div>
            {STATS.map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px', gap: '4px' }}>
                <span style={{ fontSize: '0.55rem', color: 'rgba(0,255,65,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.label}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: s.color, flexShrink: 0 }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Network nodes */}
          <div style={{ borderTop: '1px solid rgba(0,255,65,0.12)', padding: '8px', flexShrink: 0 }}>
            <div style={{ fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(0,255,65,0.4)', marginBottom: '8px' }}>NETWORK NODES</div>
            {[['GLOBAL_NET', '#00ff41'], ['DARK_WEB', '#00ff41'], ['RELAY_7G', '#00ff41'], ['BROKER_NET', '#00ffff'], ['HIBP_API', '#ffb86c']].map(([name, c]) => (
              <div key={name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.6rem' }}>
                <span style={{ color: 'rgba(0,255,65,0.5)' }}>{name}</span>
                <span style={{ color: c, fontWeight: 700 }}>OK</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── CENTER PANEL ── */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* ASCII Logo */}
          <div style={{ flexShrink: 0, borderBottom: '1px solid rgba(0,255,65,0.12)', background: 'rgba(0,255,65,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 8px' }}>
            <pre style={{ fontSize: '14px', lineHeight: 1.15, color: '#00ff41', textShadow: '0 0 18px rgba(0,255,65,0.7)', margin: 0, textAlign: 'center', letterSpacing: '0.05em' }}>{`
██████╗ ██████╗ ██╗██╗   ██╗██╗██╗  ██╗
██╔══██╗██╔══██╗██║██║   ██║██║╚██╗██╔╝
██████╔╝██████╔╝██║██║   ██║██║ ╚███╔╝ 
██╔═══╝ ██╔══██╗██║╚██╗ ██╔╝██║ ██╔██╗ 
██║     ██║  ██║██║ ╚████╔╝ ██║██╔╝ ██╗
╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝╚═╝  ╚═╝`}</pre>
          </div>

          {/* Terminal history */}
          <div style={{ flex: 1, padding: '12px 20px 0', overflowY: 'auto', fontSize: '0.78rem', lineHeight: 1.8, color: '#00ff41' }} className="terminal-scroll">
            {history.map((line, i) => <div key={i} style={{ whiteSpace: 'pre-wrap', opacity: i < history.length - 3 ? 0.6 : 1 }}>{line || '\u00A0'}</div>)}
            <div ref={historyEndRef} />
          </div>

          {/* Live Breach Intel Feed */}
          <div style={{ flexShrink: 0, borderTop: '1px solid rgba(0,255,65,0.12)', background: 'rgba(0,0,0,0.6)' }}>
            <div style={{ padding: '6px 20px', borderBottom: '1px solid rgba(0,255,65,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(0,255,65,0.4)' }}>◉ LIVE BREACH INTEL</span>
              <span style={{ fontSize: '0.55rem', color: '#ff003c', letterSpacing: '0.08em' }}>● STREAMING</span>
            </div>
            <div style={{ maxHeight: '160px', overflowY: 'auto' }} className="terminal-scroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.6rem' }}>
                <thead>
                  <tr style={{ color: 'rgba(0,255,65,0.3)' }}>
                    {['TIME','SOURCE','TYPE','SEVERITY'].map(h => (
                      <td key={h} style={{ padding: '4px 20px 4px', letterSpacing: '0.1em' }}>{h}</td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentBreaches.map((b, i) => (
                    <tr key={i} style={{ borderTop: '1px solid rgba(0,255,65,0.06)', opacity: i === 0 ? 1 : 0.65 }}>
                      <td style={{ padding: '5px 20px', color: 'rgba(0,255,65,0.35)', whiteSpace: 'nowrap' }}>{b.ts}</td>
                      <td style={{ padding: '5px 20px', color: '#00ff41', whiteSpace: 'nowrap' }}>{b.src}</td>
                      <td style={{ padding: '5px 20px', color: 'rgba(0,255,65,0.6)', whiteSpace: 'nowrap' }}>{b.type}</td>
                      <td style={{ padding: '5px 20px', color: b.color, fontWeight: 700, whiteSpace: 'nowrap' }}>{b.sev}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Input prompt */}
          <form onSubmit={handleCommand} style={{ flexShrink: 0, padding: '12px 20px', borderTop: '1px solid rgba(0,255,65,0.2)', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,255,65,0.03)' }}>
            <span style={{ fontWeight: 700, whiteSpace: 'nowrap', fontSize: '0.8rem' }}>root@privix:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              autoFocus autoComplete="off" spellCheck="false"
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#00ff41', fontSize: '0.8rem', caretColor: '#00ff41', ...mono }}
            />
          </form>

        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ borderLeft: '1px solid rgba(0,255,65,0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Modules header */}
          <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(0,255,65,0.12)', fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(0,255,65,0.5)', flexShrink: 0 }}>
            ◉ LOADED MODULES [{MODULES.length}/6]
          </div>

          {/* Module list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }} className="terminal-scroll">
            {MODULES.map(m => (
              <div key={m.tag} style={{ border: '1px solid rgba(0,255,65,0.12)', padding: '10px', marginBottom: '6px', background: 'rgba(0,0,0,0.5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.6rem', fontWeight: 700, color: m.color, marginBottom: '4px' }}>
                  <m.icon size={10} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.tag}</span>
                </div>
                <div style={{ fontSize: '0.58rem', color: 'rgba(0,255,65,0.4)', lineHeight: 1.5 }}>{m.desc}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '5px', fontSize: '0.55rem', color: '#00ff41' }}>
                  <span style={{ width: '5px', height: '5px', background: '#00ff41', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                  RUNNING
                </div>
              </div>
            ))}
          </div>

          {/* Threat Level Matrix */}
          <div style={{ borderTop: '1px solid rgba(0,255,65,0.15)', padding: '10px 12px', flexShrink: 0, background: 'rgba(0,0,0,0.5)' }}>
            <div style={{ fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(0,255,65,0.4)', marginBottom: '10px' }}>◉ THREAT LEVEL MATRIX</div>
            {threatLevels.map(t => (
              <div key={t.label} style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontSize: '0.55rem', color: 'rgba(0,255,65,0.45)', letterSpacing: '0.05em' }}>{t.label}</span>
                  <span style={{ fontSize: '0.55rem', fontWeight: 700, color: t.color }}>{t.pct}%</span>
                </div>
                <div style={{ height: '3px', background: 'rgba(0,255,65,0.1)', width: '100%' }}>
                  <div style={{ height: '100%', width: `${t.pct}%`, background: t.color, boxShadow: `0 0 6px ${t.color}` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Live breach counter */}
          <div style={{ borderTop: '1px solid rgba(0,255,65,0.15)', padding: '10px 12px', flexShrink: 0, background: 'rgba(255,0,60,0.04)' }}>
            <div style={{ fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,0,60,0.5)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={9} /> LIVE BREACH COUNTER
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ff003c', letterSpacing: '-0.03em' }}>
              {breachCount.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.55rem', color: 'rgba(255,0,60,0.4)', marginTop: '2px' }}>credentials in the wild</div>
          </div>


        </div>
      </div>
    </div>
  );
}
