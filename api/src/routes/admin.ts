import { Router, Request, Response } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { PrismaClient } from '@prisma/client';

const router = Router();
const execAsync = promisify(exec);
const prisma = new PrismaClient();

// Admin endpoint to run migrations
router.post('/migrate', async (req: Request, res: Response) => {
  try {
    console.log('Running database migrations...');
    
    // Run prisma db push
    const pushResult = await execAsync('npx prisma db push --accept-data-loss', {
      cwd: __dirname + '/../..'
    });
    
    console.log('Migrations complete:', pushResult.stdout);
    
    res.json({
      success: true,
      message: 'Migrations completed',
      output: pushResult.stdout
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    res.status(500).json({
      error: 'Migration failed',
      message: error.message
    });
  }
});

// Admin endpoint to seed database
router.post('/seed', async (req: Request, res: Response) => {
  try {
    console.log('Seeding database...');
    
    const seedResult = await execAsync('npm run db:seed', {
      cwd: __dirname + '/../..'
    });
    
    console.log('Seed complete:', seedResult.stdout);
    
    res.json({
      success: true,
      message: 'Database seeded',
      output: seedResult.stdout
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    res.status(500).json({
      error: 'Seed failed',
      message: error.message
    });
  }
});

// Admin endpoint to delete projects by name
router.post('/delete-projects', async (req: Request, res: Response) => {
  try {
    const { projectNames } = req.body;
    
    if (!projectNames || !Array.isArray(projectNames)) {
      return res.status(400).json({
        error: 'projectNames array required'
      });
    }
    
    console.log('Deleting projects:', projectNames);
    
    const result = await prisma.project.deleteMany({
      where: {
        name: {
          in: projectNames
        }
      }
    });
    
    console.log(`Deleted ${result.count} projects`);
    
    res.json({
      success: true,
      message: `Deleted ${result.count} project(s)`,
      deletedCount: result.count,
      projectNames
    });
  } catch (error: any) {
    console.error('Delete projects error:', error);
    res.status(500).json({
      error: 'Delete failed',
      message: error.message
    });
  }
});

export default router;
