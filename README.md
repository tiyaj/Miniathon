# Miniathon — PULSE Live Event Volunteer Coordination Platform

Centralized real-time command center and coordination system for large-scale events, managing volunteer shifts, zone coverage, incident dispatch, and telemetry.

---

## 🏗️ Repository Architecture

This repository contains both the frontend interface and backend service:

```
Miniathon/
├── Frontend/                 # React 19 + Vite frontend application
│   ├── src/                  # Application source (Pages, Components, Context, Hooks)
│   ├── public/               # Static assets & WebP hero photos
│   └── package.json          # Frontend dependencies & scripts
├── pulse/
│   └── Backend/              # Node.js + Express backend service
│       ├── src/              # Express API (Controllers, Models, Routes, Services)
│       ├── tests/            # Test suites (auth, incidents, simulation, etc.)
│       └── package.json      # Backend dependencies & scripts
└── .gitignore                # Unified monorepo gitignore
```

---

## 🚀 Quick Start

### 1. Backend (`pulse/Backend`)

```bash
cd pulse/Backend
npm install
npm run seed:demo    # Pre-populate demo events, users, and volunteers
npm run dev          # Starts Express server at http://localhost:5000
```

### 2. Frontend (`Frontend/`)

```bash
cd Frontend
npm install
npm run dev          # Starts Vite dev server at http://localhost:5173
```

---

## ✨ Features

- **Cinematic Landing Page**: 3D coordination orb, photographic zone sequence, and micro-interactions.
- **Live Command Center**: Real-time zone coverage heatmaps, active volunteers, and live incident stream.
- **Incident & Task Dispatch**: Instant marshaling and reassignment workflows.
- **Auth & RBAC**: Role-based access control for Coordinator, Admin, Super Admin, and Volunteers.
- **Resilience & Simulation Engine**: Built-in test harnesses for chaos and load scenarios.
