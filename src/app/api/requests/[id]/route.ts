import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const bloodReq = await prisma.bloodRequest.findUnique({
      where: { id },
      include: {
        division: true,
        district: true,
        upazila: true,
        seeker: { select: { id: true, phone: true, email: true } },
        requestResponses: {
          include: {
            donorProfile: {
              include: { user: { select: { phone: true, email: true } } },
            },
          },
        },
      },
    });

    if (!bloodReq) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: bloodReq });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to load request details' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { status } = await request.json();

    const existing = await prisma.bloodRequest.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    // Only seeker owner or admin can update status
    if (existing.seekerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const updated = await prisma.bloodRequest.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update request' }, { status: 500 });
  }
}
