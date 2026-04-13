# 🔐 Privix
### *Know where your data lives. Demand it back.*

> A **Data Privacy Monitoring & Legal Enforcement System** that automatically detects your personal data across data broker platforms and generates legally-compliant deletion requests — so you don't have to.

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

- 🔍 **Scanning** multiple data broker platforms using your email as the identity anchor
- 🧩 **Modular scanners** — each broker has a dedicated, plug-and-play scanner module
- ✅ **Verification Layer** — a confidence scoring engine validates each finding before surfacing it
- ⚖️ **Legal Engine** — automatically drafts GDPR/CCPA-compliant deletion request letters
- 📊 **Tracking System** — monitors the status of every submitted deletion request

---

## ✨ Features

- 🔍 **Data Exposure Detection** — Scan popular data broker sites for your personal information
- ✅ **Confidence-Based Verification** — Each result is scored for accuracy before being flagged
- ⚖️ **Legal Deletion Request Generator** — Auto-generates formal, jurisdiction-aware deletion letters
- 📊 **Request Tracking Dashboard** — A centralized view of all pending, sent, and resolved requests
- 🔁 **Continuous Monitoring** *(Simulated)* — Periodic re-scanning to detect new data exposures

---

## 🏗️ System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                        PRIVIX SYSTEM                        │
├──────────────┬──────────────┬──────────────┬────────────────┤
│  Identity    │   Scanner    │ Verification │  Legal Engine  │
│    Layer     │   Modules    │    Engine    │                │
│              │              │              │                │
│ • Email      │ • Broker 1   │ • Confidence │ • GDPR/CCPA    │
│   Normali-   │ • Broker 2   │   Scoring    │   Templates    │
│   zation     │ • Broker 3   │ • Data       │ • Auto-fill    │
│ • Identity   │ • (Modular   │   Matching   │ • PDF/Text     │
│   Hashing    │   + Pluggable│ • Threshold  │   Output       │
│              │   )          │   Filtering  │                │
├──────────────┴──────────────┴──────────────┴────────────────┤
│                    TRACKING SYSTEM                          │
│         Status: Pending → Submitted → Resolved              │
└─────────────────────────────────────────────────────────────┘
```

### Layer Breakdown

| Layer | Responsibility |
|---|---|
| **Identity Layer** | Normalizes and hashes input email; constructs search identity |
| **Scanner Modules** | Dedicated per-broker scrapers/API consumers (`broker_scanner_1`, `2`, `3`) |
| **Verification Engine** | Confidence scoring (0–100%) to filter false positives |
| **Legal Engine** | Generates formal deletion request letters per jurisdiction |
| **Tracking System** | Persists request state; surfaces status on the dashboard |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | FastAPI (Python) |
| **Frontend** | HTML5 / CSS3 / Vanilla JavaScript |
| **Database** | SQLite (via SQLAlchemy ORM) |
| **Schema Validation** | Pydantic (schemas.py) |
| **API Design** | RESTful JSON APIs |
| **Dev Tools** | Git, Uvicorn, Python `venv` |

---

## 🔄 How It Works — User Flow

```text
1. 📧  User enters their email address
         ↓
2. 🔍  System runs modular broker scanners in parallel
         ↓
3. 📊  Results returned with confidence scores (e.g., 87% match)
         ↓
4. ⚖️  User reviews findings & clicks "Request Deletion"
         ↓
5. 📝  Legal deletion letter auto-generated for each broker
         ↓
6. 📬  Request status tracked: Pending → Submitted → Resolved
```

---

## 🚀 Installation & Setup

### Prerequisites
- Python 3.9+
- Git

---

### 🔧 Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/privix.git
cd privix

# 2. Create and activate a virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start the FastAPI server
cd backend
uvicorn main:app --reload --port 8000
```

> The API will be live at `http://localhost:8000`
> Interactive docs at `http://localhost:8000/docs`

---

### 🖥️ Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Simply open in your browser
start index.html        # Windows
open index.html         # macOS
xdg-open index.html     # Linux
```

> Make sure the backend is running before interacting with the frontend.

---

## 🎮 Demo Instructions

> For **hackathon judges and testers** — here's the fastest path to see Privix in action:

1. **Start the backend** using the steps above
2. **Open `frontend/index.html`** in your browser
3. **Enter a test email** (e.g., `testuser@example.com`) in the scan field
4. Click **"Scan Now"** — the system will run all broker scanners
5. Review the **results panel** with confidence scores per broker
6. Click **"Generate Deletion Request"** on any positive finding
7. View and download the **auto-generated legal letter**
8. Navigate to the **Dashboard** tab to see the request tracking status

---

## 🌍 Alignment with the United Nations SDGs

### 🕊️ SDG 16 — Peace, Justice & Strong Institutions

> *"Promote peaceful and inclusive societies, provide access to justice for all, and build effective, accountable institutions."*

Privix directly supports SDG 16 by:

- 🔓 **Empowering individuals** with tools to exercise their legal rights (GDPR, CCPA)
- ⚖️ **Lowering barriers to justice** — legal compliance shouldn't require a lawyer
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
| 🔔 **Alert System** | Email/SMS notifications when new data exposures are found |
| 🔐 **OAuth Login** | Secure multi-account management with SSO providers |

---

## 👥 Contributors

| Name | Role |
|---|---|
| **Blessy Mol Charls** | |
| **Samerath Kumar V M** | |
| **Karthik Vivek** | |
| **Annu Philip** | |

---

## 📄 License

This project is built for academic and hackathon demonstration purposes.
For licensing inquiries, please contact the project contributors.
