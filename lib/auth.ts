import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.AUTH_SECRET || 'fep-software-license-intelligence-secure-jwt-secret-2026';
const TOKEN_NAME = 'auth_token';

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: Role;
  departmentId?: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function getUserFromRequest(req: NextRequest): TokenPayload | null {
  const tokenFromCookie = req.cookies.get(TOKEN_NAME)?.value;
  if (tokenFromCookie) {
    const verified = verifyToken(tokenFromCookie);
    if (verified) return verified;
  }

  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.substring(7);
    return verifyToken(bearerToken);
  }

  return null;
}

export function createAuthCookie(token: string): string {
  const isProd = process.env.NODE_ENV === 'production';
  return `${TOKEN_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${isProd ? '; Secure' : ''}`;
}

export function clearAuthCookie(): string {
  return `${TOKEN_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function requireAuth(
  req: NextRequest,
  allowedRoles?: Role[]
): { user: TokenPayload; errorResponse: null } | { user: null; errorResponse: NextResponse } {
  const user = getUserFromRequest(req);

  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required' },
        { status: 401 }
      ),
    };
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return {
        user: null,
        errorResponse: NextResponse.json(
          { success: false, error: `Forbidden: Insufficient permissions for role ${user.role}` },
          { status: 403 }
        ),
      };
    }
  }

  return { user, errorResponse: null };
}
