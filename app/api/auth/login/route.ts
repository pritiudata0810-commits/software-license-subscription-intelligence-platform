import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, signToken, createAuthCookie } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';
import { AuditAction } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { department: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Account is deactivated. Contact system administrator.' },
        { status: 403 }
      );
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      departmentId: user.departmentId,
    });

    await recordAuditLog({
      userId: user.id,
      action: AuditAction.LOGIN,
      entity: 'User',
      entityId: user.id,
      details: { email: user.email, role: user.role },
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        designation: user.designation,
        department: user.department ? { id: user.department.id, name: user.department.name, code: user.department.code } : null,
      },
      token,
    });

    response.headers.set('Set-Cookie', createAuthCookie(token));
    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during authentication' },
      { status: 500 }
    );
  }
}
