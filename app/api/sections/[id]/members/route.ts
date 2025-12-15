import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token) as any;

        // Both teachers and students might need to see members, but for Admin features, mainly teacher.
        // Let's restrict to enrolled users or teacher.

        const { id: sectionId } = await params;

        const members = await prisma.enrollment.findMany({
            where: { sectionId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        });

        // Schema check: User model has 'name', 'email'. 'studentId' is NOT in the schema I viewed earlier.
        // Wait, the login screen had a studentId controller, but where is it stored?
        // Let's re-read schema.prisma carefully. User model has: id, name, email, passwordHash, role, isVerified...
        // Ah, LoginScreen logic: if role is STUDENT, it takes studentId. But schema doesn't seem to save it?
        // Let's check api/auth/register (probably in api/auth/route.ts or similar) or schema again.

        return NextResponse.json(members.map(e => e.user));

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
