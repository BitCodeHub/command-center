import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /activity - Get activity feed
router.get('/', async (req: Request, res: Response) => {
  try {
    const { limit, agentId, type, since } = req.query;
    
    const where: any = {};
    if (agentId) where.agentId = agentId as string;
    if (type) where.type = type as string;
    if (since) {
      where.createdAt = {
        gte: new Date(since as string),
      };
    }
    
    const activities = await prisma.activityLog.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit ? parseInt(limit as string) : 50,
    });
    
    res.json({
      success: true,
      data: activities,
      count: activities.length,
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch activity',
    });
  }
});

// POST /activity - Create activity log entry
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      type,
      agentId,
      projectId,
      taskId,
      title,
      description,
      metadata,
    } = req.body;
    
    if (!type || !title) {
      return res.status(400).json({
        success: false,
        error: 'Type and title are required',
      });
    }
    
    const activity = await prisma.activityLog.create({
      data: {
        type,
        agentId,
        projectId,
        taskId,
        title,
        description,
        metadata: metadata || {},
      },
    });
    
    res.status(201).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create activity',
    });
  }
});

// DELETE /activity/:id - Delete activity log entry
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.activityLog.delete({
      where: { id },
    });
    
    res.json({
      success: true,
      message: 'Activity deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete activity',
    });
  }
});

export default router;
