# Command Center API - Deploy to Render

## Quick Deploy (Blueprint Method)

### Step 1: Create New Web Service

1. Go to: https://dashboard.render.com/
2. Click **"New +"** → **"Blueprint"**
3. Select repo: **BitCodeHub/command-center**
4. Render will detect `/api/render.yaml`

### Step 2: Blueprint Will Create

- **Web Service:** command-center-api
  - Type: Web Service
  - Runtime: Node 20
  - Build: `npm install && npm run build`
  - Start: `npm start`
  - Port: 4000
  
- **PostgreSQL Database:** command-center-db
  - Plan: Free
  - Auto-linked to API

### Step 3: After Deploy

Run migration in API shell:
```bash
npm run db:push
npm run db:seed
```

### Step 4: Get URL

Your API will be at:
`https://command-center-api-XXXXX.onrender.com`

Copy this URL - you'll need it for dashboard config.

## Manual Alternative (If Blueprint Fails)

### Create Database First
1. New PostgreSQL (Free tier)
2. Name: command-center-db
3. Copy DATABASE_URL

### Create Web Service
1. New Web Service
2. Connect to: BitCodeHub/command-center
3. Root Directory: `/api`
4. Build Command: `npm install && npm run build`
5. Start Command: `npm start`
6. Add Environment Variables:
   - `DATABASE_URL` = [from database]
   - `PORT` = 4000
   - `NODE_ENV` = production

### Run Migration
After first deploy, open Shell:
```bash
npm run db:push
npm run db:seed
```

## Next: Update Dashboard

Once API is deployed, update dashboard:

1. Open `/Users/jimmysmacstudio/clawd/projects/lumen-dashboard/.env`
2. Add: `COMMAND_CENTER_API_URL=https://your-api-url.onrender.com`
3. Update `public/command-center.html`:
   - Replace `ws://localhost:4000` with `wss://your-api-url.onrender.com`
   - Replace `http://localhost:4000` with `https://your-api-url.onrender.com`
4. Commit and push (auto-deploys)

## Testing

After both deployed:
```bash
# Health check
curl https://your-api-url.onrender.com/health

# Get agent statuses
curl https://your-api-url.onrender.com/api/status
```

Dashboard People tab should now show live data!
