import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /agents - List all agents
router.get('/', async (req: Request, res: Response) => {
  try {
    const { department, status, location } = req.query;
    
    const where: any = {};
    if (department) where.department = department as string;
    if (status) where.status = status as string;
    if (location) where.location = location as string;
    
    const agents = await prisma.agentStatus.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });
    
    res.json({
      success: true,
      data: agents,
      count: agents.length,
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agents',
    });
  }
});

// GET /agents/:id - Get specific agent by UUID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const agent = await prisma.agentStatus.findUnique({
      where: { id },
      include: {
        statusHistory: {
          take: 10,
          orderBy: {
            timestamp: 'desc',
          },
        },
      },
    });
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
      });
    }
    
    res.json({
      success: true,
      data: agent,
    });
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agent',
    });
  }
});

// GET /agents/by-agent-id/:agentId - Get agent by agentId (e.g., "main", "lumi")
router.get('/by-agent-id/:agentId', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    
    const agent = await prisma.agentStatus.findUnique({
      where: { agentId },
      include: {
        statusHistory: {
          take: 10,
          orderBy: {
            timestamp: 'desc',
          },
        },
      },
    });
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
      });
    }
    
    res.json({
      success: true,
      data: agent,
    });
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agent',
    });
  }
});

// POST /agents - Create new agent
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
    
    if (!agentId || !name || !role || !location) {
      return res.status(400).json({
        success: false,
        error: 'agentId, name, role, and location are required',
      });
    }
    
    const agent = await prisma.agentStatus.create({
      data: {
        agentId,
        name,
        role,
        emoji: emoji || '🤖',
        department,
        location,
        status: status || 'idle',
        currentTask,
        progress: progress || 0,
        blockers: blockers || [],
        metadata: metadata || {},
      },
    });
    
    res.status(201).json({
      success: true,
      data: agent,
    });
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create agent',
    });
  }
});

// PATCH /agents/:id - Update agent status
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
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
    
    // Get current agent data
    const currentAgent = await prisma.agentStatus.findUnique({
      where: { id },
    });
    
    if (!currentAgent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
      });
    }
    
    // Update agent
    const agent = await prisma.agentStatus.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(role && { role }),
        ...(emoji !== undefined && { emoji }),
        ...(department !== undefined && { department }),
        ...(location && { location }),
        ...(status && { status }),
        ...(currentTask !== undefined && { currentTask }),
        ...(progress !== undefined && { progress }),
        ...(blockers !== undefined && { blockers }),
        ...(metadata !== undefined && { metadata }),
        lastUpdate: new Date(),
      },
    });
    
    // Create status history entry if status-related fields changed
    if (status || currentTask !== undefined || progress !== undefined || blockers !== undefined) {
      await prisma.statusHistory.create({
        data: {
          agentStatusId: agent.id,
          agentId: agent.agentId,
          status: status || currentAgent.status,
          currentTask: currentTask !== undefined ? currentTask : currentAgent.currentTask,
          progress: progress !== undefined ? progress : currentAgent.progress,
          blockers: blockers !== undefined ? blockers : currentAgent.blockers,
          metadata: metadata || {},
        },
      });
    }
    
    res.json({
      success: true,
      data: agent,
    });
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update agent',
    });
  }
});

// DELETE /agents/:id - Delete agent
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.agentStatus.delete({
      where: { id },
    });
    
    res.json({
      success: true,
      message: 'Agent deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete agent',
    });
  }
});

// GET /agents/:id/history - Get agent status history
router.get('/:id/history', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const history = await prisma.statusHistory.findMany({
      where: {
        agentStatusId: id,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });
    
    res.json({
      success: true,
      data: history,
      count: history.length,
    });
  } catch (error) {
    console.error('Error fetching agent history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agent history',
    });
  }
});

export default router;
