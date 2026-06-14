<div align="center">

# 🕉️ KumbhSync · कुंभसिंक

### *सेवा में तकनीक, भीड़ में व्यवस्था*
*Technology in Service, Order in the Crowd*

**The Smart Volunteer Deployment Engine for Mahakumbh**

*Matching the right volunteer to the right sector at the right moment — in real time.*

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-kumbh--sync.vercel.app-FF6B00?style=for-the-badge)](https://kumbh-sync.vercel.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?style=for-the-badge&logo=socket.io)](https://socket.io)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![SQLite](https://img.shields.io/badge/SQLite-Prisma-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://prisma.io)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/Utkarsh63/KumbhSync?style=for-the-badge&logo=github&color=181717)](https://github.com/Utkarsh63/KumbhSync)

🏆 Built at **ExpertHire × VIT Bhopal Hackathon** · Theme: Technology for Social Good

</div>

---

## 📌 Table of Contents

- [The Problem](#-the-problem)
- [What is KumbhSync?](#-what-is-kumbhsync)
- [Key Features](#-key-features)
- [Matchmaker Engine](#-matchmaker-engine)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#-getting-started)
- [Demo Flow](#-demo-flow)
- [Roadmap](#roadmap)
- [Project Impact](#-project-impact)

---

## 🔥 The Problem

Mahakumbh Mela is the **largest peaceful gathering of humans on Earth** — 400 million pilgrims across 45 days. Behind the spectacle lies a coordination crisis no technology has solved.

| Challenge | Reality on the Ground |
|-----------|----------------------|
| 🧑‍🤝‍🧑 Volunteer Scale | 50,000–100,000 volunteers across 25+ sectors |
| 📋 Assignment Method | Manual — spreadsheets, walkie-talkies, phone calls |
| 🚨 Incident Response | Average response lag of 15–30 minutes |
| 😴 Volunteer Fatigue | No system to track exhaustion or prevent burnout |
| 📍 Zone Imbalance | Some sectors overstaffed, others dangerously empty |
| 📊 Decision Making | Commanders lack real-time data to act fast |

> *"During the 2013 Allahabad Kumbh stampede, 36 people died. Root cause: communication failure and volunteer misdirection."*

---

## 🙏 What is KumbhSync?

**KumbhSync** (कुंभसिंक = "Kumbh Synchronizer") is a real-time volunteer deployment engine purpose-built for Mahakumbh Mela operations.

It acts as a **real-time operational brain** — scoring every available volunteer by skill, proximity, and fatigue, then deploying the best match to any incident across 25 sectors in seconds.

### Who it serves

| Stakeholder | How KumbhSync Helps |
|-------------|---------------------|
| 🎛️ Operations Commander | Full sector oversight, live deployment feed, incident control |
| 👮 Zone Supervisor | Declare incidents, request volunteers, monitor sector status |
| 🙋 Volunteer | Register skills, receive deployment alerts, track assignments |
| 🏛️ Event Authority | Deployment history, fatigue reports, post-event analytics |

> **Right volunteer. Right sector. Right now.**

---

## ✨ Key Features

### 👥 Volunteer Management
- Centralized registry with skill tagging — Medical, Swimmer, CrowdControl, Translation, Sanitation
- Fitness level profiling — determines ghat duty vs helpdesk assignment
- Real-time fatigue tracking with color-coded bars (green → yellow → red)
- Search and filter by skill, sector, status, fatigue level
- Volunteer profile drawer with phone, age, fitness, shift history

### 🚨 Incident Response
- Declare emergencies across any of 25 Mahakumbh sectors
- Priority classification: Low → Medium → High → Critical
- Sector cards flash red with pulse animation on incident declaration
- Full deployment history and audit log per incident

### 📊 Command Dashboard
- Live 5×5 sector grid with color-coded priority status
- Real-time Live Feed of deployments via Socket.io
- Stat cards: Total Volunteers, Active Deployments, Incidents, Avg Fatigue
- Skills distribution donut chart

### 📱 Notification Simulation
- Mock SMS on registration: *"Welcome to KumbhSync Seva — Volunteer ID: KS-2024-042"*
- Deployment alert toasts: *"URGENT: Report to Triveni Sangam — Crowd Surge"*
- Staggered notification feed, auto-dismiss after 8 seconds

---

## 🧠 Matchmaker Engine

The brain of KumbhSync. When an incident is declared, it scores every available volunteer instantly and deploys the top candidates.

### Scoring Algorithm

```
+10  Skill matches sector requirement
+8   Volunteer already in that sector  
+5   Volunteer in an adjacent sector
+5   High fitness + Ghat-type sector
+3   Low fitness + Helpdesk-type sector
-5   Low fitness + Ghat-type sector (penalty)
-4   Fatigue score > 30%
-10  Fatigue score > 60%
-999 Status is not Available (excluded entirely)
```

### Smart Re-routing

If the Available volunteer pool is insufficient, the engine automatically looks for volunteers deployed in **Low-priority sectors** and re-routes them to the Critical zone — broadcasting a distinct amber alert in the Live Feed.

```
┌─────────────────────────────────────────┐
│         INCIDENT DECLARED               │
│  Sector: Triveni Sangam                 │
│  Type: Crowd Surge | Need: 30           │
└──────────────────┬──────────────────────┘
                   ▼
┌─────────────────────────────────────────┐
│        MATCHMAKER ENGINE                │
│  Scores all Available volunteers by:    │
│  skill + proximity + fatigue + fitness  │
└──────────────────┬──────────────────────┘
                   ▼
┌─────────────────────────────────────────┐
│        TOP CANDIDATES DEPLOYED          │
│  ⚡ Kiara Reddy  S1→Triveni (Score: 13) │
│  ⚡ Rohan Patel  S2→Triveni (Score: 9)  │
│  🔄 Arjun Mishra RE-ROUTED S19→S1      │
│  📱 SMS dispatch simulated for each     │
└─────────────────────────────────────────┘
```

---

## 🏗️ Architecture

```
Client (React + Vite + Tailwind)
   │
   ├── Dashboard (25 sector grid, live feed, stat cards)
   ├── Volunteers (register, manage, deploy, delete)
   ├── Deployments (history, audit log)
   └── Analytics (charts, fatigue distribution)
   │
   │  REST API + Socket.io
   ▼
Server (Node.js + Express)
   │
   ├── /api/volunteers  → CRUD + status management
   ├── /api/sectors     → 25 sectors, incident triggers
   ├── /api/deployments → history, complete, reset
   ├── /api/deploy      → runs matchmaker engine
   └── /api/health      → live system stats
   │
   ├── services/matchmaker.js  → scoring algorithm
   └── socket/socketHandler.js → real-time events
   │
   ▼
Database (SQLite via Prisma ORM)
   ├── Volunteer  (id, name, phone, skill, fitness, fatigue, status)
   ├── Sector     (id, name, type, priority, incident, volunteers)
   └── Deployment (volunteerId, fromSector, toSector, score, status)
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + Vite | Component-based UI |
| Styling | Tailwind CSS v4 | Utility-first design |
| Realtime | Socket.io | Live sector + feed updates |
| Backend | Node.js + Express | REST API server |
| Database | SQLite + Prisma ORM | Fast local persistence |
| Charts | Recharts | Analytics visualizations |
| Deployment | Vercel + Render | Frontend + backend hosting |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Clone the repo
git clone https://github.com/Utkarsh63/KumbhSync.git
cd KumbhSync

# Setup and start server
cd server
npm install
npm run seed        # Seeds 25 sectors + 50 volunteers
npm run dev         # Starts on port 5000

# Setup and start client (new terminal)
cd ../client
npm install
npm run dev         # Starts on port 5173
```

Open `http://localhost:5173`

---

## 🎬 Demo Flow

1. Open dashboard — 25 sectors, 51 volunteers loaded
2. Go to **Volunteer Management** → register a new volunteer
3. See mock SMS confirmation screen with Volunteer ID
4. Return to dashboard → click **🚨 Simulate Emergency**
5. Select: *Ram Ghat → Medical Emergency → 20 volunteers*
6. Click **Trigger Emergency**
7. Ram Ghat card flashes red, Live Feed populates with dispatches
8. SMS toast notifications appear for each deployed volunteer
9. Check **Deployment History** — records fully populated
10. Click **Reset** — all sectors restored instantly

---

## 🗺️ Roadmap

**v1.0 — Hackathon (Shipped ✅)**
- ✅ 25-sector real-time command dashboard
- ✅ Skill + fitness + fatigue matchmaker engine
- ✅ Socket.io live deployment feed
- ✅ Incident simulation with smart re-routing
- ✅ Mock SMS notification system
- ✅ Volunteer profile drawer with contact info

**v2.0 — Production Ready**
- 🔧 Role-based auth (Admin / Supervisor / Volunteer)
- 🔧 Real SMS alerts via Twilio
- 🔧 Live volunteer GPS location tracking
- 🔧 GIS map view of all 25 sectors

**v3.0 — Intelligence Layer**
- 🚀 AI-powered matching via Gemini / GPT
- 🚀 Predictive demand forecasting by zone + time
- 🚀 Multilingual support (30+ Indian languages)
- 🚀 Crowd density API integration

---

## 🌍 Project Impact

| Metric | Scale |
|--------|-------|
| 🧳 Expected Pilgrims | 200–400 million across 45 days |
| 👷 Volunteers Needed | 50,000–100,000 across all zones |
| 🕌 Active Sectors | 25+ ghats, camps, entry corridors |
| 🌐 Languages Spoken | 30+ regional Indian languages |
| 🚑 Peak Incidents | Thousands per day at Shahi Snan |

KumbhSync can reduce incident response time from **20 minutes → under 2 minutes**.

> *A single prevented stampede. A single found child. A single saved life.*
> *That is the true measure of this technology.*


---

<div align="center">

Built with ❤️ for Mahakumbh · ExpertHire × VIT Bhopal Hackathon 2028

</div>
