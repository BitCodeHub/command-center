import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/projects - List all projects
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    
    const where = status ? { status: String(status) } : {};
    
    const projects = await prisma.project.findMany({
      where,
      orderBy: { updatedAt: 'desc' }
    });
    
    res.json({
      success: true,
      projects
    });
  } catch (error) {
    console.error('Error getting projects:', error);
    res.status(500).json({ error: 'Failed to get projects' });
  }
});

// GET /api/projects/:id - Get project details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const project = await prisma.project.findUnique({
      where: { id }
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Get owner status
    const owner = await prisma.agentStatus.findUnique({
      where: { agentId: project.owner }
    });
    
    res.json({
      success: true,
      project,
      owner
    });
  } catch (error) {
    console.error('Error getting project:', error);
    res.status(500).json({ error: 'Failed to get project' });
  }
});

// POST /api/projects - Create new project
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      name,
      owner,
      status,
      progress,
      nextMilestone,
      blockers,
      startDate,
      targetDate,
      metadata
    } = req.body;
    
    if (!name || !owner) {
      return res.status(400).json({ error: 'name and owner are required' });
    }
    
    const project = await prisma.project.create({
      data: {
        name,
        owner,
        status: status || 'planned',
        progress: progress || 0,
        nextMilestone,
        blockers: blockers || [],
        startDate: startDate ? new Date(startDate) : null,
        targetDate: targetDate ? new Date(targetDate) : null,
        metadata: metadata || {}
      }
    });
    
    res.status(201).json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// PATCH /api/projects/:id - Update project
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      status,
      progress,
      nextMilestone,
      blockers,
      targetDate,
      completedDate
    } = req.body;
    
    const data: any = {};
    if (status !== undefined) data.status = status;
    if (progress !== undefined) data.progress = progress;
    if (nextMilestone !== undefined) data.nextMilestone = nextMilestone;
    if (blockers !== undefined) data.blockers = blockers;
    if (targetDate !== undefined) data.targetDate = new Date(targetDate);
    if (completedDate !== undefined) data.completedDate = new Date(completedDate);
    
    const project = await prisma.project.update({
      where: { id },
      data
    });
    
    res.json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

export default router;
