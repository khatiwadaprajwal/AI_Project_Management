import { PrismaClient, WorkspaceRole, ProjectStatus, TaskStatus, TaskPriority } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@sdlc.com';
  const password = 'password123';

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    console.log('Seed data already exists — skipping.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name: 'Demo User', email, passwordHash, isFirstLogin: false },
  });

  const workspace = await prisma.workspace.create({
    data: {
      name: 'My Studio',
      slug: 'my-studio',
      ownerId: user.id,
      members: { create: { userId: user.id, role: WorkspaceRole.OWNER } },
    },
  });

  const project1 = await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      name: 'E-Commerce Platform',
      clientName: 'TechStore Inc.',
      description: 'Full-stack e-commerce platform with payment integration, inventory management, and analytics dashboard.',
      status: ProjectStatus.ACTIVE,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      name: 'Mobile App Redesign',
      clientName: 'HealthApp',
      description: 'Complete UX/UI redesign of the mobile fitness tracking application.',
      status: ProjectStatus.ACTIVE,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      name: 'Internal Dashboard',
      clientName: null,
      description: 'Company-wide analytics and reporting dashboard for internal teams.',
      status: ProjectStatus.ON_HOLD,
    },
  });

  const feature1 = await prisma.feature.create({
    data: { projectId: project1.id, name: 'Authentication', order: 0 },
  });

  const feature2 = await prisma.feature.create({
    data: { projectId: project1.id, name: 'Payment Gateway', order: 1 },
  });

  const task1 = await prisma.task.create({
    data: {
      featureId: feature1.id,
      projectId: project1.id,
      title: 'Implement OAuth2 login with Google and GitHub',
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.HIGH,
      order: 0,
    },
  });

  await prisma.task.create({
    data: {
      featureId: feature1.id,
      projectId: project1.id,
      title: 'Build JWT refresh token rotation',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      order: 1,
      assigneeId: user.id,
    },
  });

  await prisma.task.create({
    data: {
      featureId: feature1.id,
      projectId: project1.id,
      title: 'Add rate limiting to login endpoint',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      order: 2,
    },
  });

  await prisma.task.create({
    data: {
      featureId: feature2.id,
      projectId: project1.id,
      title: 'Integrate Stripe payment checkout',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.URGENT,
      order: 0,
      assigneeId: user.id,
    },
  });

  await prisma.task.create({
    data: {
      featureId: feature2.id,
      projectId: project1.id,
      title: 'Handle webhook events for payment confirmations',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      order: 1,
    },
  });

  await prisma.task.create({
    data: {
      featureId: feature2.id,
      projectId: project1.id,
      title: 'Implement refund and dispute flow',
      status: TaskStatus.BLOCKED,
      priority: TaskPriority.MEDIUM,
      order: 2,
      blockedReason: 'Awaiting legal review on refund policy',
    },
  });

  const feature3 = await prisma.feature.create({
    data: { projectId: project2.id, name: 'Onboarding Flow', order: 0 },
  });

  await prisma.task.create({
    data: {
      featureId: feature3.id,
      projectId: project2.id,
      title: 'Design new user onboarding screens',
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.HIGH,
      order: 0,
    },
  });

  await prisma.task.create({
    data: {
      featureId: feature3.id,
      projectId: project2.id,
      title: 'Implement animated walkthrough',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      order: 1,
    },
  });

  await prisma.task.create({
    data: {
      featureId: feature3.id,
      projectId: project2.id,
      title: 'Add skip-and-resume functionality',
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      order: 2,
    },
  });

  const feature4 = await prisma.feature.create({
    data: { projectId: project3.id, name: 'Reports Module', order: 0 },
  });

  await prisma.task.create({
    data: {
      featureId: feature4.id,
      projectId: project3.id,
      title: 'Build CSV export for all data tables',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      order: 0,
    },
  });

  console.log(`\nSeed complete. Login with:`);
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log(`  Workspace: ${workspace.name}`);
  console.log(`  Projects: ${project1.name}, ${project2.name}, ${project3.name}\n`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
