import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'bloodbond-secret-bangladesh-key';
export const AUTH_COOKIE_NAME = 'bloodbond_session';

export interface AuthUser {
  id: string;
  phone: string;
  email?: string | null;
  role: 'DONOR' | 'SEEKER' | 'ADMIN';
  fullName?: string;
  donorProfileId?: string;
}

/**
 * Hashes a plain text password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compares plain password with hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Creates a signed JWT for the authenticated user
 */
export function signSessionToken(payload: AuthUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verifies JWT token
 */
export function verifySessionToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch (err) {
    return null;
  }
}

/**
 * Reads and verifies the current session from incoming request cookies
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    const decoded = verifySessionToken(token);
    if (!decoded || !decoded.id) return null;

    // Check user exists and is active in DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { donorProfile: true },
    });

    if (!user || !user.isActive) return null;

    return {
      id: user.id,
      phone: user.phone,
      email: user.email,
      role: user.role as any,
      fullName: user.donorProfile?.fullName,
      donorProfileId: user.donorProfile?.id,
    };
  } catch (error) {
    return null;
  }
}
