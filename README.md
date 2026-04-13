# Privix

> Stay private, stay ahead: continuously discover and reduce your personal data exposure.

![Build](https://img.shields.io/badge/build-passing-brightgreen)
![Node.js](https://img.shields.io/badge/node-%3E%3D18-339933?logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/frontend-React%2019-61DAFB?logo=react&logoColor=black)
![Express](https://img.shields.io/badge/backend-Express-000000?logo=express&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

Privix is a personal data exposure monitoring and action platform that helps users find where their sensitive information appears across data brokers, public records, and breach-related surfaces.

It combines scanning, risk scoring, dashboard analytics, and remediation workflows in one experience so users can move from visibility to action quickly.

## Why This Project?

Personal data is scattered across broker sites, breach dumps, and public search surfaces. Most people do not know where they are exposed, how severe the exposure is, or what to do next.

Privix addresses this by offering:

- Proactive discovery of exposure points
- Prioritized risk scoring so users can focus on the highest-impact issues first
- Action workflows (like deletion requests) to reduce exposure over time

## Problem It Solves

Privix helps solve real-world privacy and identity risk issues:

- Hidden exposure: users cannot easily track where their PII appears
- Manual effort: checking multiple sources one by one is slow and inconsistent
- No prioritization: users need risk context, not just raw findings
- Weak follow-through: discovery without remediation does not improve privacy posture

## Target Users

- Privacy-conscious individuals
- Security-aware consumers and families
- Freelancers and professionals with strong digital footprints
- Early-stage teams building privacy tooling concepts

## Features

- Multi-source scan initiation (name, email, phone, username, password/hash signals)
- Exposure findings aggregation and dashboard summaries
- Risk visualization and alert tracking
- Deletion/remediation request workflow
- Background recheck and action jobs
- Health endpoint for service monitoring

## Tech Stack

### Frontend

- React 19
- React Router
- Recharts
- Vite
- Tailwind CSS (configured)

### Backend

- Node.js
- Express
- CORS middleware

### Engine/Platform Modules

- Custom scanner engine
- Matcher/risk scoring engine
- Scheduler jobs for rechecks and actions
- In-memory data store (local development)

## How It Works

1. User submits identifiers from the scan setup screen.
2. Backend scan controller triggers scanning services and broker/search modules.
3. Findings are validated, matched, and scored by the matcher engine.
4. Aggregation services generate dashboard stats, alerts, and risk summaries.
5. Users review findings and trigger actions (for example, deletion requests).
6. Scheduled jobs recheck exposure and keep results up to date.

## Folder Structure

```text
.
├── backend/
│   └── src/
│       ├── controllers/
│       ├── routes/
│       └── services/
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
├── scanner-engine/
├── matcher-engine/
├── scheduler/
├── database/
└── README.md
```

## Installation

### Prerequisites

- Node.js 18+
- npm 9+

### Steps

```bash
# 1) Clone the repository
git clone <your-repo-url>
cd Privix

# 2) Install all dependencies (root, backend, frontend)
npm run install:all

# 3) Start backend + frontend together
npm run dev
```

By default:

- Frontend runs on Vite default port (usually `http://localhost:5173`)
- Backend API runs on `http://localhost:3001`

## Usage

1. Open the frontend in your browser.
2. Go to the scan page and submit available personal identifiers.
3. Wait for scan progress to complete.
4. Review dashboard metrics, findings, and alerts.
5. Trigger action requests for exposed records.

### API Endpoints (Core)

```http
GET  /api/health
POST /api/scans
GET  /api/scans/:scanId

GET  /api/results/dashboard/:userId
GET  /api/results/findings/:userId
GET  /api/results/stats/:userId
GET  /api/results/alerts/:userId
POST /api/results/action
POST /api/results/alerts/read
```

## Future Enhancements

- Add persistent database support (PostgreSQL/MongoDB)
- Introduce authentication and user accounts
- Add source connectors for more broker/search providers
- Support email/SMS alert delivery channels
- Add PDF privacy reports and exportable remediation plans
- Containerize services with Docker and add CI pipelines

## Contributors

- V M Samerath Kumar
- Blessy Mol Charls
- Karthik Vivek
- Annu Philip

## License

This project is licensed under the MIT License.

See the LICENSE file for details.

