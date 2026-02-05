import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { broadcastStatusUpdate } from '../index';

const router = Router();
const prisma = new PrismaClient();

// POST /api/status - Report agent status
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      agentId,
      name,
      role,
      emoji,
      department,
      location,
      status,
      currentTask,
      progress,
      blockers,
      metadata
    } = req.body;
    
    if (!agentId || !name || !role || !emoji || !location || !status) {
      return res.status(400).json({ 
        error: 'Missing required fields: agentId, name, role, emoji, location, status' 
      });
    }
    
    // Upsert agent status
    const agentStatus = await prisma.agentStatus.upsert({
      where: { agentId },
      update: {
        status,
        currentTask,
        progress,
        blockers: blockers || [],
        lastUpdate: new Date(),
        metadata: metadata || {}
      },
      create: {
        agentId,
        name,
        role,
        emoji,
        department,
        location,
        status,
        currentTask,
        progress,
        blockers: blockers || [],
        metadata: metadata || {}
      }
    });
    
    // Save to history
    await prisma.statusHistory.create({
      data: {
        agentStatusId: agentStatus.id,
        agentId,
        status,
        currentTask,
        progress,
        blockers: blockers || [],
        metadata: metadata || {}
      }
    });
    
    // Broadcast update to WebSocket clients
    broadcastStatusUpdate(agentStatus);
    
    res.json({
      success: true,
      status: agentStatus
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// GET /api/status - Get all agent statuses
router.get('/', async (req: Request, res: Response) => {
  try {
    const { department, status, location } = req.query;
    
    const where: any = {};
    if (department) where.department = String(department);
    if (status) where.status = String(status);
    if (location) where.location = String(location);
    
    const statuses = await prisma.agentStatus.findMany({
      where,
      orderBy: { lastUpdate: 'desc' }
    });
    
    // Group by department
    const byDepartment: Record<string, any[]> = {};
    statuses.forEach(s => {
      const dept = s.department || 'Unassigned';
      if (!byDepartment[dept]) byDepartment[dept] = [];
      byDepartment[dept].push(s);
    });
    
    res.json({
      success: true,
      total: statuses.length,
      statuses,
      byDepartment
    });
  } catch (error) {
    console.error('Error getting statuses:', error);
    res.status(500).json({ error: 'Failed to get statuses' });
  }
});

// GET /api/status/:agentId - Get specific agent status
router.get('/:agentId', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    
    const agentStatus = await prisma.agentStatus.findUnique({
      where: { agentId },
      include: {
        statusHistory: {
          take: 20,
          orderBy: { timestamp: 'desc' }
        }
      }
    });
    
    if (!agentStatus) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    res.json({
      success: true,
      status: agentStatus
    });
  } catch (error) {
    console.error('Error getting agent status:', error);
    res.status(500).json({ error: 'Failed to get agent status' });
  }
});

// GET /api/status/:agentId/history - Get agent status history
router.get('/:agentId/history', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const { limit = 50 } = req.query;
    
    const history = await prisma.statusHistory.findMany({
      where: { agentId },
      take: Number(limit),
      orderBy: { timestamp: 'desc' }
    });
    
    res.json({
      success: true,
      agentId,
      history
    });
  } catch (error) {
    console.error('Error getting status history:', error);
    res.status(500).json({ error: 'Failed to get status history' });
  }
});

export default router;
