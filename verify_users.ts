import db from './lib/db';

async function verifyAllUsers() {
    try {
        const result = await db.user.updateMany({
            data: {
                isVerified: true
            }
        });
        console.log(`Updated ${result.count} users to verified.`);
    } catch (error) {
        console.error('Error updating users:', error);
        process.exit(1);
    } finally {
        await db.$disconnect();
    }
}

verifyAllUsers();
