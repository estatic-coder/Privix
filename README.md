# 🔐 Privix — Data Privacy Guardian
### *Know where your data lives. Demand it back.*

> A **full-stack Data Privacy Monitoring & Legal Enforcement System** that automatically detects personal data across data broker platforms, visualizes exposure risk in real-time, and generates legally-compliant deletion requests — so you don't have to.

![Privix Banner](image.png)

---

## 📌 Problem Statement

Every day, hundreds of **data broker companies** collect, compile, and sell your personal information — your name, address, phone number, email, financial history, and more — without your knowledge or consent.

| The Problem | Why It Matters |
|---|---|
| 🕵️ Data brokers profile millions without consent | Your identity is exposed to strangers & bad actors |
| 🌐 No visibility into where your data appears | Users can't protect what they can't see |
| ⚖️ Legal removal processes are complex & time-consuming | Most people give up before completing the process |

**Privix solves all three.**

---

## 💡 Solution Overview

Privix is a full-stack web application that gives users **complete visibility and control** over their personal data by:

- 🔍 **Scanning** multiple data broker platforms using your PII (name, email, phone, username, password hash) as the identity anchor
- 🧩 **Modular scanners** — each broker has a dedicated, plug-and-play scanner module
- ✅ **Confidence Scoring** — each finding is validated with a 0–100% confidence score before surfacing
- 🎬 **Breach Reveal Animation** — a full-screen cinematic overlay that reveals exposure severity with staggered data class tags
- ⚖️ **Legal Engine** — auto-drafts GDPR/CCPA-compliant deletion requests with one click
- 📊 **Real-time Dashboard** — tracks every submitted, pending, and resolved deletion request

---

## ✨ Features

- 🔍 **Multi-field Data Exposure Scan** — Accepts name, email, phone, username, and password hash as scan inputs
- ✅ **Confidence-Based Verification** — Results scored for accuracy to filter false positives before display
- 🎬 **Breach Reveal Animation** — Sequential, dramatic overlay reveals breach count, severity bars, and exposed data categories
- 📈 **Risk Score & Privacy Index** — Auto-calculates a 0–100 privacy risk score and visualizes criticality (LOW → CRITICAL)
- ⚖️ **Legal Deletion Request Generator** — One-click GDPR/CCPA draft letters via the Results page
- 📊 **Request Tracking Dashboard** — Centralized view of all requests: Pending → Submitted → Resolved
- 🔁 **Clean State Management** — Each new scan fully resets findings, progress, and animation state with zero stale data
- 🎨 **Glassmorphism Dark UI** — Matrix background, animated terminal, scroll-reveal sections, and hover micro-interactions on the Landing page
- 🌐 **Single-Page App with React Router** — Smooth navigation between Landing, Dashboard, Scan, Results, and Settings

---

## 🏗️ System Architecture

```text
┌──────────────────────────────────────────────────────────────────┐
│                         PRIVIX SYSTEM                           │
├──────────────┬───────────────┬──────────────┬────────────────────┤
│  Identity    │   Scanner     │ Verification │   Legal Engine     │
│    Layer     │   Modules     │    Engine    │                    │
│              │               │              │                    │
│ • Name /     │ • brokerA.js  │ • Confidence │ • GDPR/CCPA        │
│   Email /    │ • brokerB.js  │   Scoring    │   Templates        │
│   Phone /    │ • Google      │ • Data       │ • One-click        │
│   Username   │   Search      │   Matching   │   Request          │
│   Hash       │ • (Pluggable) │ • Threshold  │   Dispatch         │
│              │               │   Filtering  │                    │
├──────────────┴───────────────┴──────────────┴────────────────────┤
│                         TRACKING SYSTEM                         │
│             Status: Pending → Submitted → Resolved              │
└──────────────────────────────────────────────────────────────────┘
```

### Layer Breakdown

| Layer | Responsibility |
|---|---|
| **Identity Layer** | Normalizes and hashes scan input (name, email, phone, username, password) |
| **Scanner Modules** | Modular per-broker scrapers in `scanner-engine/brokers/` (brokerA, brokerB, Google) |
| **Verification Engine** | Confidence scoring (0–100%) — deduplication via `source::id` composite key |
| **Legal Engine** | Auto-generates formal deletion request letters per jurisdiction (GDPR / CCPA) |
| **Tracking System** | Persists request state in the dashboard; surfaces alerts for unread events |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Lucide Icons |
| **Styling** | TailwindCSS v4, Vanilla CSS (glassmorphism, matrix background, animations) |
| **Backend API** | Node.js, Express — RESTful JSON API on port `3001` |
| **Scanner Engine** | Node.js modular scrapers (`scanner-engine/brokers/`) |
| **Matcher Engine** | Custom identity matching and confidence scoring |
| **Scheduler** | Node.js Cron-based background re-scan workers |
| **Database** | SQLite / JSON (file-based for demo) via `database/` |
| **Dev Tooling** | `concurrently`, `npm workspaces`, Git |

---

## 📁 Project Structure

```
Privix/
├── frontend/               # React + Vite SPA
│   └── src/
│       ├── pages/          # Landing, Dashboard, ScanSetup, Results, Settings
│       ├── components/     # Navbar, BreachReveal, ExposureCard, RiskChart, …
│       └── services/       # api.js — all fetch calls to backend
│
├── backend/                # Express API server
│   └── src/
│       ├── controllers/    # Scan, results, alerts handlers
│       ├── routes/         # /api/scans, /api/results, /api/health
│       └── services/       # Business logic & scanner orchestration
│
├── scanner-engine/         # Modular broker scanner library
│   ├── brokers/            # brokerA.js, brokerB.js (plug-and-play)
│   ├── search/             # Google / web search integration
│   └── utils/              # Suppression list, normalization helpers
│
├── matcher-engine/         # Identity matching & confidence scoring
├── scheduler/              # Background cron re-scan workers
├── database/               # Persistent storage layer
└── package.json            # Root — runs both frontend & backend via concurrently
```

---

## 🔄 How It Works — User Flow

```text
1. 📧  User enters name, email, phone, username, or password hash
         ↓
2. 🔍  Modular broker scanners run in parallel (DataBrokerX, PeopleFinderY, Google)
         ↓
3. 🎬  Breach Reveal overlay plays (if exposures found) — shows severity & data classes
         ↓
4. 📊  Results page displays findings with confidence score, risk level, and data tags
         ↓
5. ⚖️  User clicks "Request Deletion" → GDPR/CCPA letter auto-generated
         ↓
6. 📬  Request tracked in Dashboard: Pending → Submitted → Resolved
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js v16+
- Git

### 🔧 Full-Stack Setup

```bash
# 1. Clone the repository
git clone https://github.com/estatic-coder/Privix
cd Privix

# 2. Install all dependencies (root + frontend + backend)
npm run install:all

# 3. Start both frontend and backend together
npm run dev
```

> **Backend API** → `http://localhost:3001`  
> **Frontend UI** → `http://localhost:5173`

---

## 🎮 Demo Instructions

> For **hackathon judges and testers** — fastest path to see Privix in action:

1. Run `npm run dev` from the root directory
2. Open `http://localhost:5173` in your browser
3. Click **Launch Console** or **Get Started** on the landing page
4. Navigate to **New Scan** in the navbar
5. Enter a name + email (e.g. `John Doe` / `test@example.com`) and click **Start Scan**
6. Watch the **scan progress animation** — modules complete sequentially
7. If breaches are found, the **Breach Reveal overlay** plays — click anywhere to skip
8. Review the **Results page** — view findings, confidence scores, risk levels, and data tags
9. Click **Request Deletion** on any finding to auto-generate a GDPR/CCPA letter
10. Check the **Dashboard** for request tracking and alert counts
11. Click **New Scan** in the navbar to reset everything cleanly and start over

---

## 🧠 State Management Design

Privix uses a deliberate, one-directional state flow to prevent stale data and duplicate results:

```
ScanSetup                App (root state)           Results
─────────────────────── ─────────────────────────── ────────────────
onNewScan() ──────────► hasScanned = false          shows empty state
                         findings = []
                         riskScore = null

[ API call runs ]

onScanComplete() ──────► hasScanned = true          shows fresh results
                          findings = deduped[]       (source::id key)
                          riskScore = N
```

**Key guarantees:**
- All lingering timers from previous scans are cancelled before a new scan starts
- `onScanComplete` is called **only after** the BreachReveal animation completes
- Results page always shows an empty state if `hasScanned` is false
- Findings are deduplicated using a `source::id` composite key before rendering

---

## 🌍 Alignment with UN SDGs

### 🕊️ SDG 16 — Peace, Justice & Strong Institutions

> *"Promote peaceful and inclusive societies, provide access to justice for all, and build effective, accountable institutions."*

Privix directly supports SDG 16 by:

- 🔓 **Empowering individuals** with tools to exercise their legal rights (GDPR, CCPA)
- ⚖️ **Lowering barriers to justice** — legal compliance without needing a lawyer
- 🏛️ **Holding data brokers accountable** through structured, formal deletion requests
- 🌐 **Promoting digital sovereignty** — your data, your rights, your control

---

## 🔮 Future Improvements

| Improvement | Description |
|---|---|
| 🌐 **More Broker Coverage** | Expand scanner modules to cover 50+ data brokers |
| 🤖 **AI-Powered Verification** | Use NLP/ML to more accurately identify personal data matches |
| 🔁 **Full Automation** | Auto-submit deletion requests without manual intervention |
| 🌍 **Multi-Jurisdiction Support** | Support GDPR (EU), CCPA (California), PDPB (India) & more |
| 📱 **Mobile App** | Native iOS & Android clients for on-the-go monitoring |
| 🔔 **Alert System** | Email/SMS push notifications when new exposures are detected |
| 🔐 **OAuth Login** | Secure multi-account management with SSO providers |
| 🗂️ **Export Reports** | Download your full exposure report as a PDF or CSV |

---
## 📋 Changelog

### v2.1 — Scan System Hardening *(April 2026)*

> Fixed three compounding issues that caused duplicate results, stale data display, and de-synced animations.

**`ScanSetup.jsx`**
- ✅ Extracted `DEFAULT_MODULES` constant — module list now resets cleanly to `pending` between runs
- ✅ Added `activeTimersRef` + `progressIntervalRef` — `cancelActiveTimers()` kills all lingering `setTimeout`/`setInterval` handles at the start of every new scan, preventing stale closure callbacks from corrupting state
- ✅ Added `pendingScanDataRef` — scan result is held in a ref until the BreachReveal animation fully completes; `onScanComplete` is no longer called immediately on API response
- ✅ All local UI state (`progress`, `moduleStatuses`, `breachFindings`, `error`) is explicitly reset **before** the API call fires
- ✅ `result.success === false` path now correctly resets UI instead of silently hanging
- ✅ Error path uses `cancelActiveTimers()` instead of a locally-scoped `clearInterval`

**`App.jsx`**
- ✅ Deduplication key upgraded from `f.source || f.id` → `` `${f.source}::${f.id}` `` — prevents composite-field findings from being incorrectly matched
- ✅ `handleNewScan` comment clarified — enforces empty state on Results if user navigates there before scan completes

**`Results.jsx`**
- ✅ No changes needed — `hasScanned` gate was already correctly blocking stale renders; the upstream fix to *when* `onScanComplete` fires is what resolved the symptom

---

### v2.0 — UX Overhaul *(April 2026)*

- 🎬 Added full-screen **Breach Reveal Animation** with severity bars, data class tags, and skip support
- 🌐 Rebuilt **Landing Page** with matrix background, terminal typing animation, live log feed, scroll-reveal sections, and animated counters
- 📊 Added **RiskChart** and **FilterPanel** components to the Results page
- 🔁 Introduced `hasScanned` session flag + `onNewScan` / `onScanComplete` callback pattern for clean state lifecycle
- 🧭 Added React Router navigation flow: Landing → Dashboard → Scan → Results → Settings
- 🎨 Applied glassmorphism card styles, cursor-following radial glow, and navbar alert badge

---

### v1.0 — Initial Prototype *(April 2026)*

- 🛠️ Scaffolded full-stack project: Express backend + Vite/React frontend with `concurrently`
- 🔍 Implemented modular scanner engine (`brokerA`, `brokerB`, Google Search)
- ⚖️ Legal deletion request generation (GDPR/CCPA templates)
- 📊 Basic dashboard with request tracking

---

## 📄 License

This project is built for academic and hackathon demonstration purposes.  
For licensing inquiries, please contact the project contributors.
