import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, signSessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Phone number or email, and password are required.' },
        { status: 400 }
      );
    }

    // Find user by phone or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ phone: identifier }, { email: identifier }],
      },
      include: {
        donorProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials. Please verify your phone/email and password.' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Account has been deactivated. Please contact BloodBond support.' },
        { status: 403 }
      );
    }

    const passwordMatch = await verifyPassword(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials. Please verify your phone/email and password.' },
        { status: 401 }
      );
    }

    // Role-based redirect target
    let redirectUrl = '/donor/dashboard';
    if (user.role === 'ADMIN') redirectUrl = '/admin';
    else if (user.role === 'SEEKER') redirectUrl = '/seeker/dashboard';

    // Sign JWT
    const token = signSessionToken({
      id: user.id,
      phone: user.phone,
      email: user.email,
      role: user.role as any,
      fullName: user.donorProfile?.fullName,
      donorProfileId: user.donorProfile?.id,
    });

    // Record login audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN_SUCCESS',
        resource: `User:${user.id}`,
        details: JSON.stringify({ role: user.role }),
      },
    });

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      redirectUrl,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        role: user.role,
        fullName: user.donorProfile?.fullName,
        donorProfileId: user.donorProfile?.id,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error during login' }, { status: 500 });
  }
}
