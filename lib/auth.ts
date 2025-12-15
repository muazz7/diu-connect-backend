import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export async function hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
}

export function signToken(payload: any) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

// Helper to validate Student ID and Email match
// ID: 242-35-123 -> Last 3: 123
// Email: something123@diu.edu.bd -> Last 3 before @: 123
export function validateStudentIdentity(studentId: string, email: string): boolean {
    if (!email.endsWith('@diu.edu.bd')) return false;

    const idParts = studentId.split('-');
    const last3Id = idParts[idParts.length - 1]; // "123"

    const emailUser = email.split('@')[0];
    const last3Email = emailUser.slice(-3); // "123"

    return last3Id === last3Email;
}
