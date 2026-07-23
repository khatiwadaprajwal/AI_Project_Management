import { PrismaClient } from '@prisma/client';
import { env } from './env';

const basePrisma = new PrismaClient({
  datasources: { db: { url: env.DATABASE_URL } },
  log: env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});


const SOFT_DELETE_MODELS = ['Project', 'Feature', 'Task'] as const;


const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async findMany({ model, args, query }) {
        if (SOFT_DELETE_MODELS.includes(model as any)) {
          (args as any).where = { ...(args as any).where, deletedAt: null };
        }
        return query(args);
      },
      async findFirst({ model, args, query }) {
        if (SOFT_DELETE_MODELS.includes(model as any)) {
          (args as any).where = { ...(args as any).where, deletedAt: null };
        }
        return query(args);
      },
      async findUnique({ model, args, query }) {
        if (SOFT_DELETE_MODELS.includes(model as any)) {
          const result = await query(args);
          if (result && (result as any).deletedAt) {
            return null;
          }
          return result;
        }
        return query(args);
      },
      async count({ model, args, query }) {
        if (SOFT_DELETE_MODELS.includes(model as any)) {
          (args as any).where = { ...(args as any).where, deletedAt: null };
        }
        return query(args);
      },
    },
  },
});


export const prismaAdmin = basePrisma;

export const connectDB = async () => {
  try {
    await basePrisma.$connect();
    console.log('✅ Prisma connected to PostgreSQL');
  } catch (err) {
    console.error('❌ DB connection error:', err);
    process.exit(1);
  }
};

export const closeDB = async () => {
  try {
    await basePrisma.$disconnect();
    console.log('🔌 Database connection closed');
  } catch (err) {
    console.error('❌ Error closing DB connection:', err);
  }
};

export default prisma;