import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Command Center database...');
  
  // Create departments
  const departments = [
    { name: 'Executive', description: 'Executive leadership', headAgentId: 'main', location: 'Mac Studio HQ' },
    { name: 'HR', description: 'Human Resources', headAgentId: 'harper-hr', location: 'Mac Studio HQ' },
    { name: 'Research', description: 'Research & Development', headAgentId: 'reese-research', location: 'Mac Studio HQ' },
    { name: 'Finance', description: 'Finance & Accounting', headAgentId: 'finley-finance', location: 'Mac Studio HQ' },
    { name: 'Engineering', description: 'Software Engineering', headAgentId: 'ethan-engineering', location: 'Luna Labs VPS' },
    { name: 'Marketing', description: 'Marketing & Growth', headAgentId: 'morgan-marketing', location: 'Mac Studio HQ' },
    { name: 'DevOps', description: 'DevOps & Infrastructure', headAgentId: 'devon-devops', location: 'Luna Labs VPS' },
    { name: 'Partnerships', description: 'Partnerships & BD', headAgentId: 'sam-partnerships', location: 'Mac Studio HQ' },
    { name: 'QA', description: 'Quality Assurance', headAgentId: 'riley-qa', location: 'Luna Labs VPS' },
    { name: 'Security', description: 'Security & Compliance', headAgentId: 'casey-security', location: 'Luna Labs VPS' },
    { name: 'Design', description: 'Product Design', headAgentId: 'dana-design', location: 'Mac Studio HQ' },
    { name: 'Analytics', description: 'Data & Analytics', headAgentId: 'dakota-analytics', location: 'Mac Studio HQ' },
    { name: 'Release', description: 'Release Management', headAgentId: 'parker-release', location: 'Luna Labs VPS' }
  ];
  
  for (const dept of departments) {
    await prisma.department.upsert({
      where: { name: dept.name },
      update: dept,
      create: dept
    });
  }
  
  console.log('✅ Created departments');
  
  // Create initial agent statuses (executives + department heads)
  const executives = [
    { agentId: 'main', name: 'Unc Lumen', role: 'CTO', emoji: '💎', department: 'Executive', location: 'Mac Studio HQ', status: 'idle' },
    { agentId: 'luna-coo', name: 'Luna', role: 'Chief of Staff', emoji: '🌙', department: 'Executive', location: 'Mac Studio HQ', status: 'idle' },
    { agentId: 'maven-cpo', name: 'Maven', role: 'Chief Product Officer', emoji: '📋', department: 'Executive', location: 'Mac Studio HQ', status: 'idle' },
    { agentId: 'lumi', name: 'Lumi', role: 'Personal Assistant', emoji: '🌸', department: 'Executive', location: 'Mac Studio HQ', status: 'idle' }
  ];
  
  const departmentHeads = [
    { agentId: 'harper-hr', name: 'Harper', role: 'HR Director', emoji: '👔', department: 'HR', location: 'Mac Studio HQ', status: 'idle' },
    { agentId: 'reese-research', name: 'Reese', role: 'Research Director', emoji: '🔬', department: 'Research', location: 'Mac Studio HQ', status: 'idle' },
    { agentId: 'finley-finance', name: 'Finley', role: 'Finance Director', emoji: '💰', department: 'Finance', location: 'Mac Studio HQ', status: 'idle' },
    { agentId: 'ethan-engineering', name: 'Ethan', role: 'Engineering Director', emoji: '⚙️', department: 'Engineering', location: 'Luna Labs VPS', status: 'idle' },
    { agentId: 'morgan-marketing', name: 'Morgan', role: 'Marketing Director', emoji: '📣', department: 'Marketing', location: 'Mac Studio HQ', status: 'idle' },
    { agentId: 'devon-devops', name: 'Devon', role: 'DevOps Director', emoji: '🔧', department: 'DevOps', location: 'Luna Labs VPS', status: 'idle' },
    { agentId: 'sam-partnerships', name: 'Sam', role: 'Partnerships Director', emoji: '🤝', department: 'Partnerships', location: 'Mac Studio HQ', status: 'idle' },
    { agentId: 'riley-qa', name: 'Riley', role: 'QA Director', emoji: '🔍', department: 'QA', location: 'Luna Labs VPS', status: 'idle' },
    { agentId: 'casey-security', name: 'Casey', role: 'Security Director', emoji: '🛡️', department: 'Security', location: 'Luna Labs VPS', status: 'idle' },
    { agentId: 'avery-qa-lead', name: 'Avery', role: 'QA Lead', emoji: '✅', department: 'QA', location: 'Luna Labs VPS', status: 'idle' },
    { agentId: 'parker-release', name: 'Parker', role: 'Release Manager', emoji: '📦', department: 'Release', location: 'Luna Labs VPS', status: 'idle' },
    { agentId: 'dana-design', name: 'Dana', role: 'Design Director', emoji: '🎨', department: 'Design', location: 'Mac Studio HQ', status: 'idle' },
    { agentId: 'dakota-analytics', name: 'Dakota', role: 'Analytics Director', emoji: '📊', department: 'Analytics', location: 'Mac Studio HQ', status: 'idle' }
  ];
  
  const allAgents = [...executives, ...departmentHeads];
  
  for (const agent of allAgents) {
    await prisma.agentStatus.upsert({
      where: { agentId: agent.agentId },
      update: {
        status: agent.status,
        lastUpdate: new Date()
      },
      create: {
        agentId: agent.agentId,
        name: agent.name,
        role: agent.role,
        emoji: agent.emoji,
        department: agent.department,
        location: agent.location,
        status: agent.status
      }
    });
  }
  
  console.log('✅ Created agent statuses');
  
  // Create projects
  const projects = [
    {
      name: 'AgentShield',
      owner: 'main',
      status: 'in_progress',
      progress: 60,
      nextMilestone: 'Sprint 1 Complete',
      startDate: new Date('2026-02-01'),
      targetDate: new Date('2026-03-15')
    },
    {
      name: 'MaxRewards AI',
      owner: 'maven-cpo',
      status: 'planned',
      progress: 20,
      nextMilestone: 'Customer Interviews',
      blockers: ['Awaiting GO/NO-GO decision']
    },
    {
      name: 'ExpenseAI',
      owner: 'maven-cpo',
      status: 'planned',
      progress: 20,
      nextMilestone: 'Customer Interviews',
      blockers: ['Awaiting GO/NO-GO decision']
    },
    {
      name: 'Hyundai Dealership Agents',
      owner: 'maven-cpo',
      status: 'in_progress',
      progress: 40,
      nextMilestone: 'TBD'
    },
    {
      name: 'Command Center',
      owner: 'main',
      status: 'in_progress',
      progress: 0,
      nextMilestone: 'MVP Dashboard',
      startDate: new Date('2026-02-05')
    }
  ];
  
  for (const project of projects) {
    await prisma.project.upsert({
      where: { name: project.name },
      update: {
        status: project.status,
        progress: project.progress,
        nextMilestone: project.nextMilestone,
        blockers: project.blockers || []
      },
      create: project
    });
  }
  
  console.log('✅ Created projects');
  
  console.log('🌱 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
