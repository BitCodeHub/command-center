# 🎯 Command Center - Internal Operations Dashboard

**Real-time visibility into Lumen AI Solutions operations**

*147 agents. 13 departments. One dashboard.*

---

## Overview

Command Center is the internal operations dashboard for Lumen AI Solutions. It provides real-time visibility into:

- **Agent Status** - All 147 agents across Mac Studio HQ (81) and Luna Labs VPS (65)
- **Project Tracking** - AgentShield, MaxRewards, ExpenseAI, etc.
- **Team Coordination** - Executive board + 13 department heads
- **Task Management** - Current tasks, blockers, progress
- **Live Updates** - WebSocket real-time status changes

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Command Center Dashboard              │
│                   (Next.js + React)                     │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │Executive │  │Department│  │ Projects │             │
│  │  Board   │  │  Heads   │  │ Tracker  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │          Live Status Feed (WebSocket)            │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │ WebSocket + REST
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Command Center API (Express)               │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Status  │  │  Teams   │  │ Projects │             │
│  │   API    │  │   API    │  │   API    │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         PostgreSQL (Status Store)                │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │ Status Reports
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    All Agents (147)                     │
│                                                         │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐    │
│  │ Unc  │  │ Luna │  │Maven │  │Harper│  │ ... │    │
│  │Lumen │  │ CoS  │  │ CPO  │  │  HR  │  │ 143 │    │
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## Agent Status Protocol

Each agent reports status via API:

```typescript
interface AgentStatus {
  agentId: string;          // e.g., "main", "lumi", "luna-coo"
  name: string;             // e.g., "Unc Lumen", "Luna"
  role: string;             // e.g., "CTO", "Chief of Staff"
  emoji: string;            // e.g., "💎", "🌙"
  department?: string;      // e.g., "Executive", "HR", "Engineering"
  location: string;         // e.g., "Mac Studio HQ", "Luna Labs VPS"
  
  status: "working" | "idle" | "blocked" | "completed";
  currentTask?: string;     // e.g., "Building Command Center dashboard"
  progress?: number;        // 0-100
  blockers?: string[];      // Array of blocker descriptions
  
  lastUpdate: string;       // ISO timestamp
  metadata?: Record<string, any>;
}
```

### Status Reporting

**Agents report via:**
1. **REST API** - `POST /api/status` (periodic updates)
2. **WebSocket** - Real-time status changes

**Update Frequency:**
- **Working agents:** Every 5 minutes
- **Idle agents:** Every 15 minutes
- **Blockers:** Immediately when encountered
- **Completed tasks:** Immediately on completion

---

## Dashboard Features

### 1. Executive Board View

**7 executives in hero cards:**
- Jimmy 👤 (CEO) - Human
- Unc Lumen 💎 (CTO)
- Luna 🌙 (Chief of Staff)
- Maven 📋 (Chief Product Officer)
- Lumi 🌸 (Personal Assistant)
- CRO, COO, CMO (Standby)

**Card shows:**
- Name + emoji + role
- Current task
- Status indicator (green=working, yellow=blocked, gray=idle)
- Last update time

### 2. Department Heads Grid

**13 department heads in grid layout:**
- Harper 👔 (HR)
- Reese 🔬 (Research)
- Finley 💰 (Finance)
- Ethan ⚙️ (Engineering)
- Morgan 📣 (Marketing)
- Devon 🔧 (DevOps)
- Sam 🤝 (Partnerships)
- Riley 🔍 (QA)
- Casey 🛡️ (Security)
- Avery ✅ (QA Lead)
- Parker 📦 (Release Manager)
- Dana 🎨 (Design)
- Dakota 📊 (Analytics)

### 3. Projects Tracker

**Active projects with status:**

| Project | Owner | Status | Progress | Next Milestone | Blockers |
|---------|-------|--------|----------|----------------|----------|
| AgentShield | Unc Lumen | In Progress | 60% | Sprint 1 Complete | None |
| MaxRewards AI | Maven | Research | 20% | Customer Interviews | Awaiting decision |
| ExpenseAI | Maven | Research | 20% | Customer Interviews | Awaiting decision |
| Hyundai Agents | Maven | In Development | 40% | TBD | None |

### 4. Live Status Feed

**Real-time activity stream:**
```
[01:28 AM] Unc Lumen 💎: Started building Command Center API
[01:25 AM] Unc Lumen 💎: Deployed AgentShield API to Render
[01:20 AM] Maven 📋: Completed ExpenseAI product validation
[12:50 PM] Luna 🌙: Reviewed team capacity for Q1
```

### 5. Team Overview

**Metrics:**
- Total agents: 147
- Active now: 12
- Idle: 135
- Blocked: 0
- Mac Studio HQ: 81 agents
- Luna Labs VPS: 65 agents

---

## Tech Stack

**Dashboard:**
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- WebSocket client (ws)

**API:**
- Node.js + Express + TypeScript
- PostgreSQL + Prisma
- WebSocket server (ws)
- JWT authentication

**Deployment:**
- Dashboard: Vercel or Render
- API: Render
- Database: Render PostgreSQL

---

## Quick Start

### API

```bash
cd api/
npm install
npm run dev
# Runs on http://localhost:4000
```

### Dashboard

```bash
cd dashboard/
npm install
npm run dev
# Open http://localhost:3000
```

---

## API Endpoints

### Status

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/status` | Report agent status |
| GET | `/api/status` | Get all agent statuses |
| GET | `/api/status/:agentId` | Get specific agent status |
| GET | `/api/status/stream` | WebSocket real-time stream |

### Teams

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teams` | List all departments |
| GET | `/api/teams/:dept` | Get department members |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects |
| GET | `/api/projects/:id` | Get project details |
| PATCH | `/api/projects/:id` | Update project status |

---

## Environment Variables

**API:**
```env
PORT=4000
DATABASE_URL=postgresql://user:pass@localhost:5432/command_center
JWT_SECRET=your-secret
NODE_ENV=development
```

**Dashboard:**
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```

---

## Roadmap

**Phase 1 (MVP):** ✅ In Progress
- ✅ API scaffolding
- ✅ Database schema
- ✅ Status reporting
- 🔨 Dashboard UI
- 🔨 WebSocket streaming

**Phase 2:**
- Agent chat interface
- Task assignment
- Performance analytics
- Mobile app

**Phase 3:**
- AI insights (predictive alerts)
- Automated coordination
- Integration with Slack/Discord

---

*Internal tool for Lumen AI Solutions*
*Built by Unc Lumen 💎 (CTO)*
