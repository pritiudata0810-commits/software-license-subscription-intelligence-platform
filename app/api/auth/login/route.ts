import { NextRequest, NextResponse } from 'next/server';
import prisma, { withPrismaRetry } from '@/lib/prisma';
import { comparePassword, signToken, createAuthCookie } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';
import { AuditAction } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON body in request',
        },
        { status: 400 }
      );
    }

    const email = body?.email;
    const password = body?.password;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email and password are required',
        },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).toLowerCase().trim();

    // Fetch user from PostgreSQL with automatic reconnection retry
    const user = await withPrismaRetry(() =>
      prisma.user.findUnique({
        where: {
          email: cleanEmail,
        },
        include: {
          department: true,
        },
      })
    );

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Check account status
    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        {
          success: false,
          error: 'Account is deactivated. Contact system administrator.',
        },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await comparePassword(
      String(password),
      user.passwordHash
    );

    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Create JWT
    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      departmentId: user.departmentId,
    });

    // Audit logging must never prevent successful login
    try {
      await recordAuditLog({
        userId: user.id,
        action: AuditAction.LOGIN,
        entity: 'User',
        entityId: user.id,
        details: {
          email: user.email,
          role: user.role,
        },
        ipAddress:
          req.headers.get('x-forwarded-for') ||
          req.headers.get('x-real-ip') ||
          '127.0.0.1',
      });
    } catch (auditError) {
      console.warn(
        'Audit log failed, continuing authentication:',
        auditError
      );
    }

    // Build successful response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        designation: user.designation,
        department: user.department
          ? {
              id: user.department.id,
              name: user.department.name,
              code: user.department.code,
            }
          : null,
      },
    });

    // Set HTTP-only authentication cookie
    response.headers.set('Set-Cookie', createAuthCookie(token));

    return response;
  } catch (error: any) {
    console.error('LOGIN AUTHENTICATION ERROR:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          process.env.NODE_ENV === 'development'
            ? `Authentication failed: ${
                error?.message || 'Unknown server error'
              }`
            : 'Internal server error during authentication',
      },
      { status: 500 }
    );
  }
}