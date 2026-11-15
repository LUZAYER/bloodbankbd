import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { sendNotification } from '@/lib/notifications';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'DONOR') {
      return NextResponse.json({ success: false, error: 'Only registered donors can respond to requests.' }, { status: 401 });
    }

    const { id: requestId } = params;
    const { status, message } = await request.json(); // ACCEPTED or DECLINED

    if (!['ACCEPTED', 'DECLINED'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid response status.' }, { status: 400 });
    }

    const donorProfile = await prisma.donorProfile.findUnique({
      where: { userId: user.id },
    });

    if (!donorProfile) {
      return NextResponse.json({ success: false, error: 'Donor profile not found' }, { status: 404 });
    }

    const bloodReq = await prisma.bloodRequest.findUnique({
      where: { id: requestId },
      include: { seeker: true },
    });

    if (!bloodReq) {
      return NextResponse.json({ success: false, error: 'Emergency request not found' }, { status: 404 });
    }

    // Upsert response
    const responseRecord = await prisma.requestResponse.upsert({
      where: {
        requestId_donorProfileId: {
          requestId,
          donorProfileId: donorProfile.id,
        },
      },
      update: {
        status,
        message,
        updatedAt: new Date(),
      },
      create: {
        requestId,
        donorProfileId: donorProfile.id,
        status,
        message,
      },
    });

    // If accepted, update blood request status to MATCHED if still OPEN
    if (status === 'ACCEPTED' && bloodReq.status === 'OPEN') {
      await prisma.bloodRequest.update({
        where: { id: requestId },
        data: { status: 'MATCHED' },
      });
    }

    // Notify seeker
    await sendNotification({
      userId: bloodReq.seekerId,
      type: 'REQUEST_STATUS',
      title: status === 'ACCEPTED' ? 'Donor Accepted Your Request!' : 'Donor Response Update',
      message: `${donorProfile.fullName} (${donorProfile.bloodGroup}) has ${status.toLowerCase()} your blood request for ${bloodReq.hospitalName}.`,
      linkUrl: `/requests/${requestId}`,
      recipientPhone: bloodReq.contactPhone,
    });

    return NextResponse.json({
      success: true,
      message: `You have ${status.toLowerCase()} this blood request.`,
      data: responseRecord,
    });
  } catch (error) {
    console.error('Request respond error:', error);
    return NextResponse.json({ success: false, error: 'Failed to record response' }, { status: 500 });
  }
}
