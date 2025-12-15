import { createMocks } from 'node-mocks-http';
import { POST as registerHandler } from '@/app/api/auth/register/route';
import { POST as loginHandler } from '@/app/api/auth/login/route';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
    },
}));

jest.mock('@/lib/auth', () => ({
    hashPassword: jest.fn().mockResolvedValue('hashed_password'),
    comparePassword: jest.fn().mockResolvedValue(true),
    signToken: jest.fn().mockReturnValue('mock_token'),
    validateStudentIdentity: jest.fn().mockReturnValue(true),
}));

describe('Auth API', () => {
    it('should register a student successfully', async () => {
        const { req } = createMocks({
            method: 'POST',
            json: async () => ({
                name: 'Test Student',
                email: 'test123456@diu.edu.bd',
                password: 'password',
                role: 'STUDENT',
                studentId: '242-35-456', // Mismatch for test? No, let's test success first.
            }),
        });

        // Mock validateStudentIdentity to return true for this test
        const auth = require('@/lib/auth');
        auth.validateStudentIdentity.mockReturnValue(true);

        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
        (prisma.user.create as jest.Mock).mockResolvedValue({ id: 'user_id' });

        const response = await registerHandler(req);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.message).toBe('User created successfully');
    });

    it('should fail registration if student ID does not match email', async () => {
        const { req } = createMocks({
            method: 'POST',
            json: async () => ({
                name: 'Test Student',
                email: 'test123456@diu.edu.bd',
                password: 'password',
                role: 'STUDENT',
                studentId: '242-35-999', // Mismatch
            }),
        });

        const auth = require('@/lib/auth');
        auth.validateStudentIdentity.mockReturnValue(false);

        const response = await registerHandler(req);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Student ID does not match Email');
    });
});
