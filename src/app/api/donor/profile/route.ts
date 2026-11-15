import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'DONOR') {
      return NextResponse.json({ success: false, error: 'Unauthorized donor action' }, { status: 401 });
    }

    const body = await request.json();
    const {
      fullName,
      availabilityStatus,
      divisionId,
      districtId,
      upazilaId,
      areaName,
      addressDetails,
      latitude,
      longitude,
      preferredContactMethod,
    } = body;

    const updatedProfile = await prisma.donorProfile.update({
      where: { userId: user.id },
      data: {
        ...(fullName ? { fullName } : {}),
        ...(availabilityStatus ? { availabilityStatus } : {}),
        ...(divisionId ? { divisionId } : {}),
        ...(districtId ? { districtId } : {}),
        ...(upazilaId ? { upazilaId } : {}),
        ...(areaName ? { areaName } : {}),
        ...(addressDetails !== undefined ? { addressDetails } : {}),
        ...(latitude !== undefined ? { latitude: latitude === null ? null : parseFloat(latitude) } : {}),
        ...(longitude !== undefined ? { longitude: longitude === null ? null : parseFloat(longitude) } : {}),
        ...(preferredContactMethod ? { preferredContactMethod } : {}),
      },
      include: {
        division: true,
        district: true,
        upazila: true,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'DONOR_PROFILE_UPDATED',
        resource: `DonorProfile:${updatedProfile.id}`,
        details: JSON.stringify({ availabilityStatus }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile,
    });
  } catch (error) {
    console.error('Donor profile update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 });
  }
}
