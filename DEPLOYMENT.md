# 🚀 Command Center Deployment Guide

## Quick Deploy to Render

### 1. Deploy API

**Repo:** https://github.com/BitCodeHub/command-center

1. Go to https://dashboard.render.com
2. Click "New +" → "Blueprint"
3. Connect GitHub repo: `BitCodeHub/command-center`
4. Select `/api/render.yaml`
5. Click "Apply"

**What this creates:**
- Web service: `command-center-api` (Node.js)
- PostgreSQL database: `command-center-db`
- Auto-generates: `DATABASE_URL`

**After deployment:**
- API will be at: `https://command-center-api.onrender.com`
- Run migrations: Dashboard → Shell → `npm run db:push && npm run db:seed`

### 2. Deploy Dashboard

**Same repo:** https://github.com/BitCodeHub/command-center

1. Click "New +" → "Blueprint"
2. Connect same repo: `BitCodeHub/command-center`
3. Select `/dashboard/render.yaml`
4. Click "Apply"

**What this creates:**
- Static site: `command-center-dashboard`
- Pre-configured env vars pointing to API

**After deployment:**
- Dashboard will be at: `https://command-center-dashboard.onrender.com`

### 3. Seed Database

After API is deployed and database is created:

```bash
# In Render dashboard → command-center-api → Shell
npm run db:push    # Push schema
npm run db:seed    # Seed initial data
```

**Seeds:**
- 13 departments
- 17 agent statuses (executives + department heads)
- 5 projects (AgentShield, MaxRewards, ExpenseAI, Hyundai, Command Center)

### 4. Deploy AgentShield API (Bonus)

**Repo:** https://github.com/BitCodeHub/agentshield-api

Same process:
1. New Blueprint
2. Connect `BitCodeHub/agentshield-api`
3. Select `/render.yaml`
4. Apply

---

## Manual Deployment (Alternative)

### API

```bash
cd api/

# 1. Set environment variables
DATABASE_URL="postgresql://..."

# 2. Install & build
npm install
npm run build

# 3. Deploy database
npx prisma db push
npm run db:seed

# 4. Start
npm start
```

### Dashboard

```bash
cd dashboard/

# 1. Set environment variables
NEXT_PUBLIC_API_URL=https://command-center-api.onrender.com
NEXT_PUBLIC_WS_URL=wss://command-center-api.onrender.com

# 2. Install & build
npm install
npm run build

# 3. Serve `out/` directory
```

---

## Environment Variables

### API
| Variable | Value | Source |
|----------|-------|--------|
| `DATABASE_URL` | `postgresql://...` | Auto (from Render DB) |
| `PORT` | `4000` | Default |
| `NODE_ENV` | `production` | Render |

### Dashboard
| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://command-center-api.onrender.com` |
| `NEXT_PUBLIC_WS_URL` | `wss://command-center-api.onrender.com` |

---

## Post-Deployment

### Test API
```bash
curl https://command-center-api.onrender.com/health
# Should return: {"status":"healthy",...}

curl https://command-center-api.onrender.com/api/status
# Should return: {"success":true,"total":17,"statuses":[...]}
```

### Test WebSocket
Open browser console on dashboard:
```javascript
// Should show:
// ✅ WebSocket connected
```

### Update Agent Status (Example)
```bash
curl -X POST https://command-center-api.onrender.com/api/status \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "main",
    "name": "Unc Lumen",
    "role": "CTO",
    "emoji": "💎",
    "department": "Executive",
    "location": "Mac Studio HQ",
    "status": "working",
    "currentTask": "Building Command Center",
    "progress": 100
  }'
```

Dashboard should update in real-time via WebSocket!

---

## URLs

**After deployment, you'll have:**

| Service | URL | Type |
|---------|-----|------|
| Command Center API | `https://command-center-api.onrender.com` | Node.js |
| Command Center Dashboard | `https://command-center-dashboard.onrender.com` | Static |
| AgentShield API | `https://agentshield-api.onrender.com` | Node.js |

---

## Troubleshooting

### WebSocket not connecting
- Check CORS settings in API
- Ensure using `wss://` (not `ws://`) for production
- Check browser console for errors

### Database not seeding
- Ensure `db:push` ran successfully first
- Check Render logs for errors
- Manually run: `npx ts-node prisma/seed.ts`

### Dashboard showing old data
- Check API_URL environment variables
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

---

*Built by Unc Lumen 💎*
*Lumen AI Solutions - February 5, 2026*
