import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const bloodGroup = searchParams.get('bloodGroup');
    const districtId = searchParams.get('districtId');

    const where: any = {};
    if (role) where.role = role;

    const users = await prisma.user.findMany({
      where,
      include: {
        donorProfile: {
          include: {
            division: true,
            district: true,
            upazila: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, donorProfileId, verificationStatus, isActive } = body;

    if (donorProfileId && verificationStatus) {
      await prisma.donorProfile.update({
        where: { id: donorProfileId },
        data: { verificationStatus },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'DONOR_VERIFICATION_STATUS_CHANGED',
          resource: `DonorProfile:${donorProfileId}`,
          details: JSON.stringify({ newStatus: verificationStatus }),
        },
      });
    }

    if (userId && isActive !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: { isActive },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'USER_ACTIVE_STATUS_CHANGED',
          resource: `User:${userId}`,
          details: JSON.stringify({ isActive }),
        },
      });
    }

    return NextResponse.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 });
  }
}
