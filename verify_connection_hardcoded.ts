import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres.clagkmtygyiqbtfosibk:vxgdsWGGcbBMjQX3@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?pgbouncer=true",
        },
    },
});

async function main() {
    try {
        const count = await prisma.user.count();
        console.log(`Successfully connected! User count: ${count}`);
    } catch (e) {
        console.error('Connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
