import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/teams - List all departments
router.get('/', async (req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' }
    });
    
    // Get agent counts per department
    const agentCounts = await prisma.agentStatus.groupBy({
      by: ['department'],
      _count: true
    });
    
    const countMap = Object.fromEntries(
      agentCounts.map(c => [c.department, c._count])
    );
    
    const departmentsWithCounts = departments.map(d => ({
      ...d,
      agentCount: countMap[d.name] || 0
    }));
    
    res.json({
      success: true,
      departments: departmentsWithCounts
    });
  } catch (error) {
    console.error('Error getting departments:', error);
    res.status(500).json({ error: 'Failed to get departments' });
  }
});

// GET /api/teams/:name - Get department details with agents
router.get('/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    
    const department = await prisma.department.findUnique({
      where: { name }
    });
    
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    const agents = await prisma.agentStatus.findMany({
      where: { department: name },
      orderBy: { name: 'asc' }
    });
    
    res.json({
      success: true,
      department,
      agents
    });
  } catch (error) {
    console.error('Error getting department:', error);
    res.status(500).json({ error: 'Failed to get department' });
  }
});

export default router;
