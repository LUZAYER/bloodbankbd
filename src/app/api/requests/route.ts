import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { isValidBloodGroup, getCompatibleDonorBloodGroups } from '@/lib/blood-compatibility';
import { sendNotification } from '@/lib/notifications';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const divisionId = searchParams.get('divisionId') || undefined;
    const bloodGroup = searchParams.get('bloodGroup') || undefined;

    const user = await getCurrentUser();

    // If seeker, they can see their own requests or all open requests
    const where: any = {};
    if (status) where.status = status;
    if (divisionId) where.divisionId = divisionId;
    if (bloodGroup) where.patientBloodGroup = bloodGroup;

    const requests = await prisma.bloodRequest.findMany({
      where,
      include: {
        division: { select: { name: true } },
        district: { select: { name: true } },
        upazila: { select: { name: true } },
        seeker: { select: { id: true, phone: true } },
        requestResponses: {
          include: {
            donorProfile: {
              select: {
                id: true,
                fullName: true,
                bloodGroup: true,
                user: { select: { phone: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch requests' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Please log in to submit an emergency blood request.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      patientBloodGroup,
      unitsNeeded = 1,
      hospitalName,
      divisionId,
      districtId,
      upazilaId,
      areaName,
      requiredDate,
      emergencyPriority = 'URGENT',
      contactPhone,
      preferredContact = 'PHONE',
      notes,
    } = body;

    if (!patientBloodGroup || !isValidBloodGroup(patientBloodGroup)) {
      return NextResponse.json(
        { success: false, error: 'A valid patient blood group is required.' },
        { status: 400 }
      );
    }

    if (!hospitalName || !divisionId || !districtId || !upazilaId || !contactPhone) {
      return NextResponse.json(
        { success: false, error: 'Hospital, location (division, district, upazila), and emergency contact phone are required.' },
        { status: 400 }
      );
    }

    const bloodReq = await prisma.bloodRequest.create({
      data: {
        seekerId: user.id,
        patientBloodGroup,
        unitsNeeded: parseInt(unitsNeeded, 10) || 1,
        hospitalName,
        divisionId,
        districtId,
        upazilaId,
        areaName: areaName || 'General Area',
        requiredDate: requiredDate ? new Date(requiredDate) : new Date(),
        emergencyPriority,
        contactPhone,
        preferredContact,
        notes,
        status: 'OPEN',
      },
      include: {
        division: true,
        district: true,
        upazila: true,
      },
    });

    // Progressive Notification Tier: Find available compatible donors in same thana first
    const compatibleGroups = getCompatibleDonorBloodGroups(patientBloodGroup);
    const nearbyDonors = await prisma.donorProfile.findMany({
      where: {
        bloodGroup: { in: compatibleGroups },
        districtId,
        availabilityStatus: 'AVAILABLE',
        user: { isActive: true },
      },
      include: { user: true },
      take: 20,
    });

    // Dispatch notification to compatible donors
    for (const d of nearbyDonors) {
      await sendNotification({
        userId: d.userId,
        type: 'EMERGENCY_REQUEST',
        title: `🚨 Emergency ${patientBloodGroup} Blood Needed`,
        message: `${unitsNeeded} unit(s) of ${patientBloodGroup} needed at ${hospitalName}, ${d.upazilaId === upazilaId ? 'in your immediate area' : d.districtId}.`,
        linkUrl: `/requests/${bloodReq.id}`,
        recipientPhone: d.user.phone,
        preferredMethod: d.preferredContactMethod,
      });
    }

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'EMERGENCY_REQUEST_CREATED',
        resource: `BloodRequest:${bloodReq.id}`,
        details: JSON.stringify({
          patientBloodGroup,
          hospital: hospitalName,
          notifiedDonorsCount: nearbyDonors.length,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Emergency request submitted and nearby compatible donors notified.',
      data: bloodReq,
      notifiedDonorsCount: nearbyDonors.length,
    });
  } catch (error) {
    console.error('Create blood request error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create blood request' }, { status: 500 });
  }
}
