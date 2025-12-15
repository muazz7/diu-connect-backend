import prisma from './lib/db';

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
