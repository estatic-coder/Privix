import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  Network,
  Search,
  Zap,
  Eye,
  Activity,
  ArrowRight,
  ChevronRight,
  Terminal,
  Lock,
  GitBranch,
  Cpu,
  Database,
  BarChart3,
  AlertTriangle,
  Globe,
  Code2,
  Layers,
  TrendingUp,
  Clock,
  Box,
  Link2,
  Hash,
  Scan,
  FileWarning,
  Trash2,
  Radio,
} from "lucide-react";

import MatrixBackground from "../components/MatrixBackground";

// ═══════════════════════════════════════════════════════════════════════
// Scroll-reveal hook — elements animate in when they enter the viewport
// ═══════════════════════════════════════════════════════════════════════

function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, visible];
}

// ═══════════════════════════════════════════════════════════════════════
// Terminal typing animation
// ═══════════════════════════════════════════════════════════════════════

const TERMINAL_LINES = [
  { text: "$ privix --init scan-engine", delay: 0 },
  { text: "[OK] Connecting to data broker APIs...", delay: 1200, color: "text-green-400" },
  { text: "[OK] Initializing deep web scrapers...", delay: 2400, color: "text-green-400" },
  { text: "[>>] Cross-referencing email databases...", delay: 3600, color: "text-cyan-400" },
  { text: "[!!] 3 instances found on DataBrokerX (Confidence: High)", delay: 4800, color: "text-amber-400" },
  { text: "[!!] Password hash exposed in breach DB", delay: 6000, color: "text-red-400" },
  { text: "[>>] Formatting deletion requests for dispatch...", delay: 7200, color: "text-cyan-400" },
  { text: "[OK] Opt-out requests successfully queued", delay: 8400, color: "text-green-400" },
  { text: "[OK] System ready — Background monitoring active", delay: 9600, color: "text-green-400" },
  { text: "$ _", delay: 10800, blink: true },
];

function TerminalAnimation({ onComplete }) {
  const [lines, setLines] = useState([]);
  const timersRef = useRef([]);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    const timers = timersRef.current;

    TERMINAL_LINES.forEach((line, lineIdx) => {
      const t = setTimeout(() => {
        setLines((prev) => [...prev, { ...line, typed: line.blink ? line.text : "" }]);

        if (line.blink) {
          onCompleteRef.current?.();
          return;
        }

        const typeChar = (ci) => {
          if (ci >= line.text.length) return;
          const id = setTimeout(() => {
            setLines((prev) => {
              const copy = [...prev];
              if (copy[lineIdx]) {
                copy[lineIdx] = { ...copy[lineIdx], typed: line.text.slice(0, ci + 1) };
              }
              return copy;
            });
            typeChar(ci + 1);
          }, 14 + Math.random() * 18);
          timers.push(id);
        };
        typeChar(0);
      }, line.delay);

      timers.push(t);
    });
  }, []);

  return (
    <div className="landing-terminal">
      <div className="landing-terminal-header">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
        </div>
        <span className="text-[10px] text-zinc-500 font-mono">privix@core:~</span>
      </div>
      <div className="landing-terminal-body">
        {lines.map((line, i) => (
          <div
            key={i}
            className={`font-mono text-xs leading-relaxed ${line.color || "text-zinc-400"} ${
              line.blink ? "landing-blink" : ""
            }`}
          >
            {line.blink ? line.text : line.typed}
            {i === lines.length - 1 && !line.blink && (
              <span className="landing-cursor">▎</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Live log feed (decorative)
// ═══════════════════════════════════════════════════════════════════════

const LOG_ENTRIES = [
  { ts: "14:32:07.213", msg: "Scanning broker directory...", level: "INFO" },
  { ts: "14:32:07.415", msg: "Record match found — name exposed", level: "ALERT" },
  { ts: "14:32:08.001", msg: "Initiating deletion wrapper script", level: "WARN" },
  { ts: "14:32:08.192", msg: "Request dispatched to central broker", level: "INFO" },
  { ts: "14:32:08.534", msg: "Verifying confirmation emails...", level: "INFO" },
  { ts: "14:32:09.117", msg: "Hash matched against known breaches", level: "ALERT" },
  { ts: "14:32:09.302", msg: "Generating security alert notification", level: "WARN" },
  { ts: "14:32:09.788", msg: "Adding record to suppression list", level: "INFO" },
  { ts: "14:32:10.044", msg: "Awaiting manual deletion confirmation", level: "WARN" },
  { ts: "14:32:10.331", msg: "Resolved: Entry successfully purged", level: "INFO" },
];

function LiveLogFeed() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      setEntries((prev) => {
        const next = [...prev, LOG_ENTRIES[idx % LOG_ENTRIES.length]];
        if (next.length > 6) next.shift();
        return next;
      });
      idx++;
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const levelColor = (l) =>
    l === "ALERT" ? "text-red-400" : l === "WARN" ? "text-amber-400" : "text-zinc-500";

  return (
    <div className="landing-log-feed">
      <div className="landing-log-header">
        <Activity size={12} className="text-green-400" />
        <span>LIVE ACTIVITY FEED</span>
        <span className="landing-log-dot" />
      </div>
      <div className="landing-log-body">
        {entries.map((e, i) => (
          <div key={i} className="landing-log-entry">
            <span className="text-zinc-600">{e.ts}</span>
            <span className={`font-semibold ${levelColor(e.level)}`}>[{e.level}]</span>
            <span className="text-zinc-400">{e.msg}</span>
          </div>
        ))}
        {entries.length === 0 && (
          <div className="text-zinc-600 text-xs font-mono">Awaiting data stream...</div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Animated counter
// ═══════════════════════════════════════════════════════════════════════

function AnimatedCounter({ target, duration = 2000, suffix = "" }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) setStarted(true);
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    const tick = () => {
      const elapsed = performance.now() - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, target, duration]);

  return (
    <span ref={ref}>
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Feature card
// ═══════════════════════════════════════════════════════════════════════

function FeatureCard({ icon: Icon, title, description, accent, delay = 0 }) {
  const [ref, visible] = useReveal(0.15);

  return (
    <div
      ref={ref}
      className="landing-feature-card group"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      <div className={`landing-feature-icon ${accent}`}>
        <Icon size={22} />
      </div>
      <h3 className="text-sm font-bold text-zinc-100 mt-4 mb-2 tracking-wide uppercase">
        {title}
      </h3>
      <p className="text-xs text-zinc-500 leading-relaxed">{description}</p>
      <div className={`landing-feature-glow ${accent}`} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Demo section — terminal + live feed
// ═══════════════════════════════════════════════════════════════════════

function DemoSection() {
  const [terminalDone, setTerminalDone] = useState(false);
  const handleComplete = useCallback(() => setTerminalDone(true), []);
  const [ref, visible] = useReveal(0.1);

  return (
    <section
      id="demo"
      className="landing-section"
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
      }}
    >
      <div className="landing-section-inner">
        <div className="text-center mb-12">
          <span className="landing-section-tag">
            <Cpu size={12} /> INTERACTIVE CONSOLE
          </span>
          <h2 className="landing-section-title">See It In Action</h2>
          <p className="landing-section-sub">
            Watch our exposure engine scan, detect, and queue deletion requests in real time.
          </p>
        </div>

        {/* Terminal + side panel grid */}
        <div className="landing-demo-grid">
          <div className="landing-demo-main">
            <TerminalAnimation onComplete={handleComplete} />
          </div>

          <div className="landing-demo-side">
            <LiveLogFeed />
            <div className="landing-mini-panel">
              <div className="landing-mini-panel-header">
                <BarChart3 size={12} className="text-red-500" />
                <span>SCAN METRICS</span>
              </div>
              <div className="landing-mini-panel-body">
                <div className="landing-mini-stat">
                  <span className="text-zinc-500">Brokers Scanned</span>
                  <span className="text-red-500 font-bold">
                    <AnimatedCounter target={1847} />
                  </span>
                </div>
                <div className="landing-mini-stat">
                  <span className="text-zinc-500">Records Checked</span>
                  <span className="text-red-500 font-bold">
                    <AnimatedCounter target={3214} />
                  </span>
                </div>
                <div className="landing-mini-stat">
                  <span className="text-zinc-500">Exposures Found</span>
                  <span className="text-red-400 font-bold">
                    <AnimatedCounter target={23} />
                  </span>
                </div>
                <div className="landing-mini-stat">
                  <span className="text-zinc-500">Deletions Queued</span>
                  <span className="text-cyan-400 font-bold">
                    <AnimatedCounter target={12} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Main Landing Page
// ═══════════════════════════════════════════════════════════════════════

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  // Reveal hooks for each section
  const [heroRef, heroVisible] = useReveal(0.1);
  const [pipelineRef, pipelineVisible] = useReveal(0.1);
  const [techRef, techVisible] = useReveal(0.1);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="landing-root">
      {/* ════════════ Full-screen matrix background ════════════ */}
      <div className="cyber-network-bg" aria-hidden="true">
        <MatrixBackground />
      </div>

      {/* ════════════════════ NAV ════════════════════ */}
      <nav
        className={`landing-nav ${scrollY > 50 ? "landing-nav-scrolled" : ""}`}
      >
        <div className="landing-nav-inner">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-800/80 shadow-lg shadow-red-900/20">
              <ShieldAlert size={16} className="text-white" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white font-mono">
                PRIVIX
              </span>
              <span className="hidden sm:inline text-[10px] text-zinc-500 ml-3 font-mono opacity-60">
                v2.0 // DATA EXPOSURE MONITORING
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="#features" className="hidden sm:inline text-xs text-zinc-400 hover:text-white transition-colors font-mono">
              FEATURES
            </a>
            <a href="#demo" className="hidden sm:inline text-xs text-zinc-400 hover:text-white transition-colors font-mono">
              DEMO
            </a>
            <a href="#pipeline" className="hidden sm:inline text-xs text-zinc-400 hover:text-white transition-colors font-mono">
              PIPELINE
            </a>
            <a href="#tech" className="hidden sm:inline text-xs text-zinc-400 hover:text-white transition-colors font-mono">
              TECH
            </a>
            <button
              onClick={() => navigate("/dashboard")}
              className="landing-btn-ghost"
            >
              Log In
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="landing-btn-primary"
            >
              Get Started <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* ════════════════════ HERO ════════════════════ */}
      <section className="landing-hero">
        <div
          ref={heroRef}
          className="relative z-10 landing-hero-content"
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "translateY(0)" : "translateY(40px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}
        >
          {/* Status badge */}
          <div className="landing-status-badge">
            <span className="landing-status-dot" />
            <span className="font-mono text-[11px] text-zinc-400">
              SYSTEM ONLINE — SCAN ENGINE ACTIVE
            </span>
          </div>

          {/* Headline */}
          <h1 className="landing-hero-title">
            <span className="landing-glitch whitespace-nowrap" data-text="Personal Data Exposure">
              Personal Data Exposure
            </span>
            <br />
            <span className="landing-hero-accent">
              Monitoring System
            </span>
          </h1>

          <p className="landing-hero-sub">
            Monitor the dark web. Detect rogue data brokers.
            <br className="hidden sm:block" />
            Protect your PII in real time with automated exposure tracking.
          </p>

          {/* CTA */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
            <button
              onClick={() => navigate("/dashboard")}
              className="landing-btn-hero"
            >
              <Terminal size={16} />
              Launch Console
              <ChevronRight size={16} className="ml-1" />
            </button>
            <a
              href="#demo"
              className="landing-btn-outline"
            >
              <Eye size={16} />
              Live Preview
            </a>
          </div>

          {/* Hero stats */}
          <div className="landing-hero-stats">
            <div className="landing-hero-stat">
              <span className="landing-hero-stat-value">
                <AnimatedCounter target={5} suffix="+" />
              </span>
              <span className="landing-hero-stat-label">Real-time Scanners</span>
            </div>
            <div className="landing-hero-stat-divider" />
            <div className="landing-hero-stat">
              <span className="landing-hero-stat-value">
                <AnimatedCounter target={45} suffix="+" />
              </span>
              <span className="landing-hero-stat-label">Brokers Monitored</span>
            </div>
            <div className="landing-hero-stat-divider" />
            <div className="landing-hero-stat">
              <span className="landing-hero-stat-value">
                <AnimatedCounter target={100} suffix="/100" />
              </span>
              <span className="landing-hero-stat-label">Threat Coverage</span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════ INTERACTIVE DEMO ════════════════════ */}
      <DemoSection />

      {/* ════════════════════ FEATURES ════════════════════ */}
      <section id="features" className="landing-section landing-section-alt">
        <div className="landing-section-inner">
          <div className="text-center mb-12">
            <span className="landing-section-tag">
              <Zap size={12} /> CAPABILITIES
            </span>
            <h2 className="landing-section-title">
              Built for Exposure Forensics
            </h2>
            <p className="landing-section-sub">
              Every tool you need to scan, analyze, and eliminate your
              personal data from vulnerable endpoints across the web.
            </p>
          </div>

          <div className="landing-features-grid">
            <FeatureCard
              icon={Scan}
              title="Deep Web Scraping"
              description="Continuous scanning of dark web forums and data broker marketplaces for stolen credentials and exposed session tokens."
              accent="text-red-500"
              delay={0}
            />
            <FeatureCard
              icon={ShieldAlert}
              title="Automated Opt-Outs"
              description="Auto-generate and dispatch CCPA and GDPR compliant data deletion requests directly to registered brokers."
              accent="text-red-400"
              delay={100}
            />
            <FeatureCard
              icon={Search}
              title="Breach Cross-Check"
              description="Cross-reference your email and password hashes against the largest compiled databases of historical data breaches."
              accent="text-amber-400"
              delay={200}
            />
            <FeatureCard
              icon={FileWarning}
              title="Exposure Risk Index"
              description="Live composite score rating your total PII exposure danger based on volume and severity of leaked details."
              accent="text-cyan-400"
              delay={300}
            />
            <FeatureCard
              icon={Trash2}
              title="Automated Deletion"
              description="One-click deletion request pipelines that track confirmation status and re-send when brokers fail to comply."
              accent="text-green-400"
              delay={400}
            />
            <FeatureCard
              icon={Radio}
              title="Real-time Alerts"
              description="Instant push notifications when new exposures are detected, with severity-rated alerts and actionable next steps."
              accent="text-purple-400"
              delay={500}
            />
          </div>
        </div>
      </section>

      {/* ════════════════════ HOW IT WORKS ════════════════════ */}
      <section
        id="pipeline"
        className="landing-section"
        ref={pipelineRef}
        style={{
          opacity: pipelineVisible ? 1 : 0,
          transform: pipelineVisible ? "translateY(0)" : "translateY(40px)",
          transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
        }}
      >
        <div className="landing-section-inner">
          <div className="text-center mb-12">
            <span className="landing-section-tag">
              <Globe size={12} /> PIPELINE
            </span>
            <h2 className="landing-section-title">
              From Raw Data to Actionable Intelligence
            </h2>
          </div>

          <div className="landing-pipeline">
            {[
              { step: "01", icon: Database, title: "INGEST", desc: "Input names, emails, or phone numbers. Our engine encrypts and hashes targets before querying external networks." },
              { step: "02", icon: Search, title: "SCAN", desc: "Deep web scrapers index breach databases and thousands of data brokers, mapping your PII against exposed data vectors." },
              { step: "03", icon: Cpu, title: "ANALYZE", desc: "The scoring engine compiles risk levels and auto-generates CCPA/GDPR opt-out payloads for each exposed broker." },
              { step: "04", icon: Eye, title: "TRACK", desc: "Live-track the delivery and confirmation status of automated data deletion requests in a secure dashboard." },
            ].map((item) => (
              <div key={item.step} className="landing-pipeline-step">
                <div className="landing-pipeline-num">{item.step}</div>
                <item.icon size={20} className="text-red-500 mb-3" />
                <h3 className="text-xs font-bold text-zinc-200 tracking-widest mb-2">
                  {item.title}
                </h3>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ TECH STACK ════════════════════ */}
      <section
        id="tech"
        className="landing-section landing-section-alt"
        ref={techRef}
        style={{
          opacity: techVisible ? 1 : 0,
          transform: techVisible ? "translateY(0)" : "translateY(40px)",
          transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
        }}
      >
        <div className="landing-section-inner">
          <div className="text-center mb-12">
            <span className="landing-section-tag">
              <Layers size={12} /> TECHNOLOGY STACK
            </span>
            <h2 className="landing-section-title">Built on Modern Infrastructure</h2>
            <p className="landing-section-sub">
              Purpose-selected tools forming a cohesive data exposure platform — from continuous broker scanning to proactive credential suppression.
            </p>
          </div>
          <div className="landing-tech-grid">
            {[
              { name: "React + Vite", category: "Frontend", desc: "High-performance SPA with hot-reload development, component-level code splitting, and optimized production builds via Rollup.", color: "text-blue-400", bg: "bg-blue-400/10", badge: "port 5173" },
              { name: "Node.js + Express", category: "Backend API", desc: "RESTful API server handling scan orchestration, queue management, and user session auth with JWT middleware on all protected routes.", color: "text-green-400", bg: "bg-green-400/10", badge: "port 3001" },
              { name: "MongoDB", category: "Database", desc: "Document-based persistence for user profiles, scan history, exposure records, and deletion request tracking with indexed queries.", color: "text-emerald-400", bg: "bg-emerald-400/10", badge: "Atlas cloud" },
              { name: "Puppeteer", category: "Web Scraping", desc: "Headless browser automation for navigating data broker opt-out forms, handling CAPTCHAs, and submitting deletion requests programmatically.", color: "text-amber-400", bg: "bg-amber-400/10", badge: "headless Chrome" },
              { name: "Bull + Redis", category: "Job Queue", desc: "Distributed task queue for parallel broker scanning with automatic retries, rate-limit backoff, and real-time progress tracking.", color: "text-red-500", bg: "bg-red-500/10", badge: "async workers" },
              { name: "JWT + bcrypt", category: "Auth & Security", desc: "Role-based access control with 24-hour expiring tokens. Passwords hashed with bcrypt. All PII encrypted at rest via AES-256.", color: "text-pink-400", bg: "bg-pink-400/10", badge: "AES-256" },
              { name: "CCPA / GDPR Engine", category: "Compliance", desc: "Auto-generates jurisdiction-specific data deletion requests with legal templates, tracks broker response deadlines, and escalates non-compliance.", color: "text-cyan-400", bg: "bg-cyan-400/10", badge: "auto-comply" },
              { name: "Tailwind CSS", category: "Styling", desc: "Utility-first CSS framework enabling rapid UI development with a custom dark theme, responsive breakpoints, and zero runtime overhead.", color: "text-purple-400", bg: "bg-purple-400/10", badge: "v4.0" },
            ].map((tech) => (
              <div key={tech.name} className="landing-tech-card">
                <span className={`landing-tech-badge ${tech.bg} ${tech.color}`}>{tech.category}</span>
                <h3 className={`text-sm font-bold mt-3 mb-1.5 ${tech.color} font-mono`}>{tech.name}</h3>
                <p className="text-[11px] text-zinc-500 leading-relaxed mb-3">{tech.desc}</p>
                <code className="text-[10px] text-zinc-600 font-mono">{tech.badge}</code>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ FOOTER ════════════════════ */}
      <footer className="relative z-10 py-16 border-t border-red-900/30 bg-black/90 text-center">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-60">
          <ShieldAlert size={18} className="text-red-500" />
          <span className="font-mono text-lg font-bold text-red-500">PRIVIX</span>
        </div>
        <p className="text-xs text-zinc-600 font-mono tracking-widest uppercase mb-6">
          SECURE PERSONAL DATA EXPOSURE MONITORING
        </p>
        <div className="flex items-center justify-center gap-6">
          <a href="#features" className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors font-mono uppercase">Features</a>
          <a href="#demo" className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors font-mono uppercase">Demo</a>
          <a href="#pipeline" className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors font-mono uppercase">Pipeline</a>
          <a href="#tech" className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors font-mono uppercase">Tech</a>
        </div>
        <p className="text-[10px] text-zinc-700 font-mono mt-6">
          © 2026 Privix. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
