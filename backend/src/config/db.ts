import { PrismaClient } from '@prisma/client';
import { env } from './env'; 


const prisma = new PrismaClient({
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
  
  log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Prisma connected to PostgreSQL');
  } catch (err) {
    console.error('❌ DB connection error:', err);
    process.exit(1);
  }
};

export const closeDB = async () => {
  try {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  } catch (err) {
    console.error('❌ Error closing DB connection:', err);
  }
};

export default prisma;