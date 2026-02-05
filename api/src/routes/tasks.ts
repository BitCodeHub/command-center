import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { broadcastStatusUpdate } from '../index';

const router = Router();
const prisma = new PrismaClient();

// GET /tasks - List all tasks with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, agentId, projectId, priority } = req.query;
    
    const where: any = {};
    if (status) where.status = status as string;
    if (agentId) where.agentId = agentId as string;
    if (projectId) where.projectId = projectId as string;
    if (priority) where.priority = priority as string;
    
    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: true,
      },
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' },
      ],
    });
    
    res.json({
      success: true,
      data: tasks,
      count: tasks.length,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tasks',
    });
  }
});

// GET /tasks/:id - Get specific task
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }
    
    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch task',
    });
  }
});

// POST /tasks - Create new task
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      agentId,
      projectId,
      cronJobId,
      createdBy,
      progress,
      dueDate,
      tags,
      metadata,
    } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required',
      });
    }
    
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'backlog',
        priority: priority || 'medium',
        agentId,
        projectId,
        cronJobId,
        createdBy,
        progress: progress || 0,
        dueDate: dueDate ? new Date(dueDate) : null,
        tags: tags || [],
        metadata: metadata || {},
      },
      include: {
        project: true,
      },
    });
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        type: 'task',
        agentId: createdBy || agentId,
        taskId: task.id,
        projectId,
        title: `Created task: ${title}`,
        description,
        metadata: { action: 'created' },
      },
    });
    
    // 📡 Broadcast new task via WebSocket
    broadcastStatusUpdate({
      type: 'task_update',
      taskId: task.id,
      task,
      action: 'created'
    });
    
    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create task',
    });
  }
});

// PATCH /tasks/:id - Update task
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      status,
      priority,
      agentId,
      projectId,
      progress,
      dueDate,
      completedAt,
      tags,
      metadata,
    } = req.body;
    
    const currentTask = await prisma.task.findUnique({
      where: { id },
    });
    
    if (!currentTask) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }
    
    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(agentId !== undefined && { agentId }),
        ...(projectId !== undefined && { projectId }),
        ...(progress !== undefined && { progress }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(completedAt !== undefined && { completedAt: completedAt ? new Date(completedAt) : null }),
        ...(tags && { tags }),
        ...(metadata && { metadata }),
      },
      include: {
        project: true,
      },
    });
    
    // Log activity if status changed
    if (status && status !== currentTask.status) {
      await prisma.activityLog.create({
        data: {
          type: 'task',
          agentId: task.agentId,
          taskId: task.id,
          projectId: task.projectId,
          title: `Task moved to ${status}`,
          description: task.title,
          metadata: { action: 'status_changed', from: currentTask.status, to: status },
        },
      });
    }
    
    // 📡 Broadcast task update via WebSocket
    broadcastStatusUpdate({
      type: 'task_update',
      taskId: task.id,
      task,
      action: 'updated',
      changes: { status, progress, agentId }
    });
    
    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update task',
    });
  }
});

// DELETE /tasks/:id - Delete task
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const task = await prisma.task.findUnique({
      where: { id },
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }
    
    await prisma.task.delete({
      where: { id },
    });
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        type: 'task',
        agentId: task.agentId,
        title: `Deleted task: ${task.title}`,
        metadata: { action: 'deleted' },
      },
    });
    
    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete task',
    });
  }
});

export default router;
