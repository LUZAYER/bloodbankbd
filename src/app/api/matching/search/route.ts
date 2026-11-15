import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { filterEligibleCandidates, rankDonorMatches, MatchingCriteria, DonorCandidate } from '@/lib/matching-engine';
import { isValidBloodGroup } from '@/lib/blood-compatibility';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bloodGroup,
      divisionId,
      districtId,
      upazilaId,
      areaName,
      latitude,
      longitude,
      searchRadiusKm,
      requiredDate,
      emergencyPriority,
    } = body;

    if (!bloodGroup || !isValidBloodGroup(bloodGroup)) {
      return NextResponse.json(
        { success: false, error: 'A valid patient blood group (e.g. O+, A+, B+, etc.) is required.' },
        { status: 400 }
      );
    }

    // Get active safety interval policy
    const activePolicy = await prisma.eligibilityPolicy.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    const safetyIntervalDays = activePolicy?.intervalDays || 90;

    // Fetch candidate donors from database (active users only)
    const donorRecords = await prisma.donorProfile.findMany({
      where: {
        user: { isActive: true },
        // Do not return hard unavailable profiles
        availabilityStatus: { not: 'UNAVAILABLE' },
      },
      include: {
        user: {
          select: { id: true, phone: true, email: true },
        },
        division: { select: { name: true } },
        district: { select: { name: true } },
        upazila: { select: { name: true } },
      },
    });

    // Check if the current searcher is logged in (to decide whether to show contact actions)
    const currentUser = await getCurrentUser();

    // Map to DonorCandidate format
    const candidatePool: DonorCandidate[] = donorRecords.map((d) => ({
      id: d.id,
      userId: d.userId,
      fullName: d.fullName,
      bloodGroup: d.bloodGroup,
      divisionId: d.divisionId,
      divisionName: d.division?.name,
      districtId: d.districtId,
      districtName: d.district?.name,
      upazilaId: d.upazilaId,
      upazilaName: d.upazila?.name,
      areaName: d.areaName,
      addressDetails: d.addressDetails,
      latitude: d.latitude,
      longitude: d.longitude,
      availabilityStatus: d.availabilityStatus,
      verificationStatus: d.verificationStatus,
      lastDonationDate: d.lastDonationDate,
      nextEligibleDate: d.nextEligibleDate,
      responseRate: d.responseRate,
      totalDonationsCount: d.totalDonationsCount,
      // For anonymous users, protect privacy: mask phone numbers (e.g. 01711***111)
      phone: currentUser ? d.user.phone : d.user.phone.replace(/(\d{5})\d{3}(\d{3})/, '$1***$2'),
      email: currentUser ? d.user.email : null,
    }));

    const criteria: MatchingCriteria = {
      patientBloodGroup: bloodGroup,
      divisionId,
      districtId,
      upazilaId,
      areaName,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      searchRadiusKm: searchRadiusKm ? parseFloat(searchRadiusKm) : undefined,
      requiredDate: requiredDate ? new Date(requiredDate) : new Date(),
      emergencyPriority: emergencyPriority || 'URGENT',
      safetyIntervalDays,
    };

    // Stage 1: Deterministic filter (clinical compatibility + cooldown safety)
    const eligibleDonors = filterEligibleCandidates(candidatePool, criteria);

    // Stage 2: Match ranking & proximity scoring
    const searchResults = rankDonorMatches(eligibleDonors, criteria);

    return NextResponse.json({
      success: true,
      data: searchResults,
      meta: {
        policyIntervalDays: safetyIntervalDays,
        isAuthenticatedSearch: Boolean(currentUser),
        searchedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Matching search error:', error);
    return NextResponse.json({ success: false, error: 'Internal matching search failure' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bloodGroup = searchParams.get('bloodGroup');
  const divisionId = searchParams.get('divisionId') || undefined;
  const districtId = searchParams.get('districtId') || undefined;
  const upazilaId = searchParams.get('upazilaId') || undefined;
  const areaName = searchParams.get('areaName') || undefined;

  if (!bloodGroup) {
    return NextResponse.json({ success: false, error: 'Missing bloodGroup query param' }, { status: 400 });
  }

  // Delegate to POST handler logic
  return POST(
    new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify({ bloodGroup, divisionId, districtId, upazilaId, areaName }),
    })
  );
}
