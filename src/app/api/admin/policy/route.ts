import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const policy = await prisma.eligibilityPolicy.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: policy });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch policy' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { intervalDays, name, description } = await request.json();

    if (!intervalDays || intervalDays < 30 || intervalDays > 365) {
      return NextResponse.json(
        { success: false, error: 'Safety interval must be between 30 and 365 days.' },
        { status: 400 }
      );
    }

    // Version existing policy and create new active one
    await prisma.eligibilityPolicy.updateMany({
      data: { isActive: false },
    });

    const newPolicy = await prisma.eligibilityPolicy.create({
      data: {
        name: name || 'National Blood Safety Protocol',
        intervalDays: parseInt(intervalDays, 10),
        description,
        isActive: true,
        updatedBy: user.phone,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'POLICY_UPDATED',
        resource: `EligibilityPolicy:${newPolicy.id}`,
        details: JSON.stringify({ intervalDays }),
      },
    });

    return NextResponse.json({ success: true, message: 'Policy updated', data: newPolicy });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update policy' }, { status: 500 });
  }
}
