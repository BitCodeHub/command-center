import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

import statusRoutes from './routes/status';
import teamsRoutes from './routes/teams';
import projectsRoutes from './routes/projects';
import healthRoutes from './routes/health';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/status', statusRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/health', healthRoutes);

// Root
app.get('/', (req, res) => {
  res.json({
    name: 'Command Center API',
    version: '1.0.0',
    description: 'Internal operations dashboard for Lumen AI Solutions',
    docs: '/docs',
    health: '/health'
  });
});

// Create HTTP server
const server = createServer(app);

// WebSocket server for real-time updates
const wss = new WebSocketServer({ 
  server,
  path: '/api/status/stream'
});

// Store connected clients
const clients = new Set<any>();

wss.on('connection', (ws) => {
  console.log('✅ New WebSocket client connected');
  clients.add(ws);
  
  ws.on('close', () => {
    console.log('❌ WebSocket client disconnected');
    clients.delete(ws);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// Broadcast status update to all connected clients
export function broadcastStatusUpdate(status: any) {
  const message = JSON.stringify({
    type: 'status_update',
    data: status,
    timestamp: new Date().toISOString()
  });
  
  clients.forEach((client) => {
    if (client.readyState === 1) { // OPEN
      client.send(message);
    }
  });
}

server.listen(PORT, () => {
  console.log(`🎯 Command Center API running on port ${PORT}`);
  console.log(`📡 WebSocket server running on ws://localhost:${PORT}/api/status/stream`);
});

export default app;
