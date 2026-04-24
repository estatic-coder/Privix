# 🔐 Privix — Data Privacy Guardian
### Know where your data lives. Demand it back.

A full-stack Data Privacy Monitoring & Legal Enforcement system that finds your personal data across brokers, quantifies exposure risk, and automates legally-compliant deletion requests.

---

## 🏆 Google Solution Challenge Submission
Why this matters at global scale

- Problem relevance: Unregulated data brokerage and unauthorised profiling affect citizens worldwide — undermining privacy, safety, and trust in digital services.
- Why now: Rapid AI-driven data aggregation and large-scale re-identification increase both the speed and impact of exposure; legal frameworks are evolving but are hard to exercise at scale.
- Target users & impact: Individuals (students, low-income and vulnerable populations), civil society organizations, privacy advocates, and small businesses gain fast, affordable, and legally-sound control over their digital footprint.

What Privix delivers for judges to notice

- Rapid visibility: converts opaque broker listings into a clear risk profile in minutes.
- Actionable justice: reduces the time and expertise required to assert legal deletion rights.
- Scalable public good: designed to integrate with NGOs, consumer protection agencies, and government portals.

---

## 📌 Problem Statement

Every day, companies collect and trade detailed personal profiles — names, emails, phone numbers, addresses, and behavioral attributes — often without consent. For many people this means persistent exposure: unwanted marketing, targeted scams, or identity abuse. Legal rights exist, but exercising them is slow, confusing, and costly; as a result, most people never complete the removal process.

This is not an abstract privacy problem — it is a human one: students denied opportunities, survivors re-exposed online, elderly and low-literacy users blocked from justice. Privix reduces fear, restores control, and makes legal rights accessible.

---

## 💡 Solution Overview

Privix gives users three practical outcomes:

- See: discover where personal data appears across brokers and public search.
- Understand: a clear privacy risk score and confidence for each finding so users know what to act on.
- Act: one-click, legally-formatted deletion requests and an audit trail for accountability.

Core principles

- Modular scanning so new brokers can be added without redesign.
- Human-centered UX that minimizes technical barriers and cognitive load.
- Legal-first automation to produce compliant requests per jurisdiction.

---

## ✨ Key Benefits & Features (Benefit-driven)

- Visibility: Multi-field exposure scans (name, email, phone, username, password hash) turn opaque lists into a prioritized action list.
- Confidence: Results are scored (0–100%) so users focus on high-probability exposures first — reducing false alarms and wasted effort.
- Agency: Auto-generated GDPR/CCPA letters let users exercise rights without legal counsel, lowering cost and time to resolution.
- Accountability: All requests are tracked in a dashboard (Pending → Submitted → Resolved) to create an auditable enforcement trail.
- Usability: Clean state management and a focused UI keep scans, animations, and results synchronized — reducing confusion and repeat work.

Technical highlights (short)

- Modular scanner architecture in `scanner-engine/brokers/` (plug-and-play broker modules).
- Verification engine (dedup + confidence scoring) in `matcher-engine/`.
- One-click legal engine generates jurisdiction-aware templates (GDPR/CCPA) and stores request history.

---

## 🌍 Real-World Impact

Who benefits

- Individuals: students, elders, survivors of abuse, low-literacy users who need simple tools to reclaim their data.
- Civil society: NGOs and privacy advocates who need scalable tooling to support many cases.
- Regulators & researchers: aggregated, anonymized metrics can help monitor compliance trends.

What changes after using Privix

- Time to file a deletion request drops from hours/days of research to minutes of guided action.
- Users gain a persistent, auditable record of outreach to data brokers.
- Decreased friction results in more exercised rights and greater accountability for brokers.

Example use-case

Anna, a college student, finds her email and phone listed on multiple people-finder sites. She runs a Privix scan, reviews two high-confidence exposures, and sends two auto-generated GDPR/CCPA requests in under ten minutes. The dashboard tracks responses and sends an alert when a broker confirms removal — Anna now knows her exposure is reduced and has evidence she can share with campus IT or a legal advisor.

---

## 🕊️ SDG Alignment — Focus on SDG 16 (Peace, Justice & Strong Institutions)

Privix supports SDG 16 by increasing access to justice and strengthening accountability:

- Feature → Outcome mapping:
    - Auto-generated deletion requests → Increased access to legal remedies for individuals.
    - Request tracking dashboard → Transparent evidence trail for enforcement and advocacy.
    - Modular scanning + public search integration → Better detection of unlawful data trade and profiling.

- Measurable impact statements (how we measure progress):
    - Reduction in average time to file a deletion request per user (target: minutes vs. manual days).
    - Increase in completed deletion workflows per supported user cohort (tracked via dashboard metrics).
    - Number of organizations/NGOs adopting Privix integrations for bulk advocacy cases.

By lowering procedural barriers and creating verifiable records, Privix helps people exercise rights and enables institutions to respond faster and more transparently.

---

## 🧪 Innovation & Uniqueness

What makes Privix different

- AI + Legal automation: verification and prioritization use algorithmic scoring while the legal engine converts findings into jurisdiction-aware, enforceable letters.
- Modular scanner architecture: each broker is an independent module (add/remove without changing the core system), enabling rapid coverage expansion.
- Human-centered verification: confidence scoring and UI affordances keep humans in the loop and reduce false positives.

Why this matters

- Many tools focus only on discovery; Privix closes the loop by enabling legal action and tracking — turning awareness into enforceable outcomes.

---

## 📊 Scalability & Future Vision

Scaling strategy

- Modular scanners and a stateless worker pattern allow horizontal scaling to process many parallel scans across servers or cloud regions.
- Queue-based orchestration and lightweight storage (SQLite for demo, pluggable to Postgres/Cloud DB) enable migration to large-scale deployments.

Integration opportunities

- Partner with NGOs, consumer-protection agencies, or government privacy offices to provide bulk-scanning and campaign tooling.
- Offer an API layer for verified partners to submit requests in bulk while preserving user consent and audit trails.

AI & product roadmap

- Improve match accuracy with supervised ML / NLP models and active learning on verified request outcomes.
- Add automated follow-ups and suggestions based on broker responses to increase successful removals.

---

## 🎥 Demo & Pitch

- Demo video: (placeholder) https://example.com/demo
- Pitch deck: (placeholder) https://example.com/pitch-deck

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
│   Phone /    │ • Google      │   Data       │ • One-click        │
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

### 🔐 Environment Variables

Create a `.env` file in `backend/` and add your Gemini API key:

```bash
GEMINI_API_KEY=your_google_gemini_api_key
```

Without this key, the **Privacy Advice** feature (`/api/ai/advice`) will return an error.

> **Backend API** → `http://localhost:3001`  
> **Frontend UI** → `http://localhost:5173`

---

## 🎮 Demo Instructions

For hackathon judges and testers — fastest path to see Privix in action:

1. Run `npm run dev` from the root directory
2. Open `http://localhost:5173` in your browser
3. Click **Get Started** on the landing page
4. Navigate to **New Scan** in the navbar
5. Enter a name + email (e.g. `John Doe` / `test@example.com`) and click **Start Scan**
6. Watch the **scan progress animation** — modules complete sequentially
7. If breaches are found, the **Breach Reveal overlay** plays — click anywhere to skip
8. Review the **Results page** — view findings, confidence scores, risk levels, and data tags
9. Click **Request Deletion** on any finding to auto-generate a GDPR/CCPA letter
10. Check the **Dashboard** for request tracking and alert counts
11. Click **New Scan** in the navbar to reset everything cleanly and start over

---

## 👥 Contributors

| Name |
|---|
| **Blessy Mol Charls** | 
| **Samerath Kumar V M** | 
| **Karthik Vivek** | 
| **Annu Philip** | 

---

## 📋 Changelog

### v2.1 — Scan System Hardening *(April 2026)*

Fixed issues that caused duplicate results, stale data display, and de-synced animations. Key fixes include:

- `ScanSetup.jsx`: extracted constants, cancelled lingering timers, and deferred `onScanComplete` until animations finish.
- `App.jsx`: stronger deduplication key `${f.source}::${f.id}`.
- `Results.jsx`: no change required; upstream lifecycle fixes resolved symptoms.

---

### v2.0 — UX Overhaul *(April 2026)*

- Full-screen Breach Reveal animation, improved Landing, RiskChart, FilterPanel, `hasScanned` lifecycle, and glassmorphism UI.

---

### v1.0 — Initial Prototype *(April 2026)*

- Scaffolded full-stack project, modular scanner engine, deletion request generation, and basic dashboard.

---

## 📄 License

This project is built for academic and hackathon demonstration purposes. For licensing inquiries, please contact the project contributors.
