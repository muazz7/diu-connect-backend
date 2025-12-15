import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://postgres.clagkmtygyiqbtfosibk:vxgdsWGGcbBMjQX3@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?pgbouncer=true",
      },
    },
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
