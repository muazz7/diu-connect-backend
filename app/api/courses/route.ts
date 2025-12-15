import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token) as any;
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        let whereClause = {};

        if (decoded.role === 'TEACHER') {
            // Teachers see only their own courses
            whereClause = { teacherId: decoded.userId };
        } else if (decoded.role === 'STUDENT') {
            // Students see only courses they are enrolled in
            whereClause = {
                sections: {
                    some: {
                        enrollments: {
                            some: {
                                userId: decoded.userId
                            }
                        }
                    }
                }
            };
        }

        const courses = await prisma.course.findMany({
            where: whereClause,
            include: {
                teacher: {
                    select: { name: true }
                },
                sections: true // Include sections to show details
            }
        });

        return NextResponse.json(courses);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token) as any;
        if (!decoded || decoded.role !== 'TEACHER') {
            return NextResponse.json({ error: 'Only teachers can create courses' }, { status: 403 });
        }

        const body = await request.json();
        const { name, code, semester, chatRoomId, chatPassword } = body;

        if (!name || !code || !chatRoomId || !chatPassword) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Transaction to create Course AND Section
        const result = await prisma.$transaction(async (tx) => {
            const course = await tx.course.create({
                data: {
                    name,
                    code,
                    teacherId: decoded.userId
                }
            });

            const section = await tx.section.create({
                data: {
                    name: 'Section A', // Default name or could be input
                    semester: semester || 'Fall 2025',
                    chatRoomId,
                    chatPassword,
                    courseId: course.id
                }
            });

            return { course, section };
        });

        return NextResponse.json(result, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
