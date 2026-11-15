import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { calculateHaversineDistance } from '@/lib/matching-engine';
import { isRbcCompatible } from '@/lib/blood-compatibility';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bloodGroup = searchParams.get('bloodGroup');
    const divisionId = searchParams.get('divisionId');
    const districtId = searchParams.get('districtId');
    const status = searchParams.get('status'); // 'AVAILABLE' | 'ALL'
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');
    const radiusStr = searchParams.get('radius'); // in km
    const compatibleWith = searchParams.get('compatibleWith'); // e.g. "O+" recipient gets only compatible donors

    const centerLat = latStr ? parseFloat(latStr) : null;
    const centerLng = lngStr ? parseFloat(lngStr) : null;
    const radiusKm = radiusStr ? parseFloat(radiusStr) : null;

    const currentUser = await getCurrentUser();

    // Fetch active donors having coordinates
    const donors = await prisma.donorProfile.findMany({
      where: {
        user: { isActive: true },
        latitude: { not: null },
        longitude: { not: null },
        ...(divisionId && divisionId !== 'all' ? { divisionId } : {}),
        ...(districtId && districtId !== 'all' ? { districtId } : {}),
        ...(status && status !== 'ALL' ? { availabilityStatus: status } : {}),
        ...(bloodGroup && bloodGroup !== 'all' ? { bloodGroup } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            email: true,
          },
        },
        division: { select: { id: true, name: true, bnName: true } },
        district: { select: { id: true, name: true, bnName: true } },
        upazila: { select: { id: true, name: true, bnName: true } },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const now = new Date();

    // Process donors with compatibility, cooldown check, distance, and privacy masking
    let results = donors.map((d) => {
      // Cooldown check
      const isInCooldown = d.nextEligibleDate ? new Date(d.nextEligibleDate) > now : false;
      const isClinicallyAvailable = d.availabilityStatus === 'AVAILABLE' && !isInCooldown;

      // Distance calculation
      let distanceKm: number | null = null;
      if (centerLat !== null && centerLng !== null && d.latitude && d.longitude) {
        distanceKm = calculateHaversineDistance(centerLat, centerLng, d.latitude, d.longitude);
      }

      // Contact masking for privacy if not logged in
      const phone = currentUser
        ? d.user.phone
        : d.user.phone.replace(/(\d{5})\d{3}(\d{3})/, '$1***$2');

      return {
        id: d.id,
        userId: d.userId,
        fullName: d.fullName,
        bloodGroup: d.bloodGroup,
        divisionId: d.divisionId,
        divisionName: d.division?.name || '',
        divisionBnName: d.division?.bnName || '',
        districtId: d.districtId,
        districtName: d.district?.name || '',
        districtBnName: d.district?.bnName || '',
        upazilaId: d.upazilaId,
        upazilaName: d.upazila?.name || '',
        areaName: d.areaName,
        addressDetails: d.addressDetails,
        latitude: d.latitude,
        longitude: d.longitude,
        availabilityStatus: d.availabilityStatus,
        isInCooldown,
        isClinicallyAvailable,
        verificationStatus: d.verificationStatus,
        lastDonationDate: d.lastDonationDate,
        nextEligibleDate: d.nextEligibleDate,
        responseRate: d.responseRate,
        totalDonationsCount: d.totalDonationsCount,
        preferredContactMethod: d.preferredContactMethod,
        phone,
        isPhoneMasked: !currentUser,
        distanceKm,
      };
    });

    // Clinical compatibility filtering if compatibleWith is requested
    if (compatibleWith) {
      results = results.filter((donor) => isRbcCompatible(donor.bloodGroup, compatibleWith));
    }

    // Radius filtering if requested
    if (radiusKm && centerLat !== null && centerLng !== null) {
      results = results.filter(
        (donor) => donor.distanceKm !== null && donor.distanceKm <= radiusKm
      );
    }

    // Sort by distance if center is provided, else by availability and donation count
    if (centerLat !== null && centerLng !== null) {
      results.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    } else {
      results.sort((a, b) => {
        if (a.isClinicallyAvailable !== b.isClinicallyAvailable) {
          return a.isClinicallyAvailable ? -1 : 1;
        }
        return b.totalDonationsCount - a.totalDonationsCount;
      });
    }

    // Summary statistics for map HUD
    const summary = {
      totalFound: results.length,
      availableCount: results.filter((d) => d.isClinicallyAvailable).length,
      cooldownCount: results.filter((d) => d.isInCooldown).length,
      busyCount: results.filter((d) => d.availabilityStatus === 'TEMPORARILY_BUSY').length,
      bloodGroups: results.reduce((acc: Record<string, number>, curr) => {
        acc[curr.bloodGroup] = (acc[curr.bloodGroup] || 0) + 1;
        return acc;
      }, {}),
    };

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary,
      data: results,
    });
  } catch (error) {
    console.error('Live donors API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch live donors' },
      { status: 500 }
    );
  }
}
