import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /departments - List all departments
router.get('/', async (req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    
    res.json({
      success: true,
      data: departments,
      count: departments.length,
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch departments',
    });
  }
});

// GET /departments/:id - Get specific department
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const department = await prisma.department.findUnique({
      where: { id },
    });
    
    if (!department) {
      return res.status(404).json({
        success: false,
        error: 'Department not found',
      });
    }
    
    // Get agents in this department
    const agents = await prisma.agentStatus.findMany({
      where: {
        department: department.name,
      },
    });
    
    res.json({
      success: true,
      data: {
        ...department,
        agents,
      },
    });
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch department',
    });
  }
});

// POST /departments - Create new department
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, location, headAgentId } = req.body;
    
    if (!name || !location) {
      return res.status(400).json({
        success: false,
        error: 'Name and location are required',
      });
    }
    
    const department = await prisma.department.create({
      data: {
        name,
        description,
        location,
        headAgentId,
      },
    });
    
    res.status(201).json({
      success: true,
      data: department,
    });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create department',
    });
  }
});

// PATCH /departments/:id - Update department
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, location, headAgentId, agentCount } = req.body;
    
    const department = await prisma.department.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(location && { location }),
        ...(headAgentId !== undefined && { headAgentId }),
        ...(agentCount !== undefined && { agentCount }),
      },
    });
    
    res.json({
      success: true,
      data: department,
    });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update department',
    });
  }
});

// DELETE /departments/:id - Delete department
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.department.delete({
      where: { id },
    });
    
    res.json({
      success: true,
      message: 'Department deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete department',
    });
  }
});

export default router;
