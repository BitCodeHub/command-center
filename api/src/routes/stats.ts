import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /stats/company - Company-wide statistics
router.get('/company', async (req: Request, res: Response) => {
  try {
    // Get current date and week start
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    
    // Tasks this week (created in last 7 days)
    const tasksThisWeek = await prisma.task.count({
      where: {
        createdAt: {
          gte: weekStart,
        },
      },
    });
    
    // In progress tasks
    const inProgress = await prisma.task.count({
      where: {
        status: 'progress',
      },
    });
    
    // Total tasks
    const total = await prisma.task.count();
    
    // Completed tasks
    const completed = await prisma.task.count({
      where: {
        status: 'done',
      },
    });
    
    // Completion percentage
    const completion = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Active agents (with recent activity)
    const activeAgents = await prisma.agentStatus.count({
      where: {
        status: {
          in: ['active', 'working'],
        },
      },
    });
    
    // Active projects
    const activeProjects = await prisma.project.count({
      where: {
        status: 'active',
      },
    });
    
    res.json({
      success: true,
      data: {
        tasksThisWeek,
        inProgress,
        total,
        completion,
        activeAgents,
        activeProjects,
        completed,
      },
    });
  } catch (error) {
    console.error('Error fetching company stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch company stats',
    });
  }
});

// GET /stats/agent/:id - Agent-specific statistics
router.get('/agent/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Tasks completed
    const tasksCompleted = await prisma.task.count({
      where: {
        agentId: id,
        status: 'done',
      },
    });
    
    // Tasks active
    const tasksActive = await prisma.task.count({
      where: {
        agentId: id,
        status: {
          in: ['backlog', 'progress'],
        },
      },
    });
    
    // Last activity
    const lastActivity = await prisma.activityLog.findFirst({
      where: {
        agentId: id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Projects owned
    const projectsOwned = await prisma.project.count({
      where: {
        owner: id,
      },
    });
    
    res.json({
      success: true,
      data: {
        tasksCompleted,
        tasksActive,
        lastActivity: lastActivity?.createdAt || null,
        projectsOwned,
      },
    });
  } catch (error) {
    console.error('Error fetching agent stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agent stats',
    });
  }
});

// GET /stats/project/:id - Project-specific statistics
router.get('/project/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Total tasks
    const totalTasks = await prisma.task.count({
      where: {
        projectId: id,
      },
    });
    
    // Completed tasks
    const completedTasks = await prisma.task.count({
      where: {
        projectId: id,
        status: 'done',
      },
    });
    
    // Active tasks
    const activeTasks = await prisma.task.count({
      where: {
        projectId: id,
        status: {
          in: ['backlog', 'progress'],
        },
      },
    });
    
    // Completion percentage
    const completion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    res.json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        activeTasks,
        completion,
      },
    });
  } catch (error) {
    console.error('Error fetching project stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project stats',
    });
  }
});

export default router;
