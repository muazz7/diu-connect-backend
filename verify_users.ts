import db from './lib/db';

try {
    const result = db.prepare('UPDATE User SET isVerified = 1').run();
    console.log(`Updated ${result.changes} users to verified.`);
} catch (error) {
    console.error('Error updating users:', error);
}
