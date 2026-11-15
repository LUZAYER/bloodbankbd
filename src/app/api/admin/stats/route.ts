import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 403 });
    }

    const [
      totalUsers,
      totalDonors,
      totalSeekers,
      verifiedDonors,
      totalRequests,
      openRequests,
      totalDonationRecords,
      policy,
      recentAudits,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.donorProfile.count(),
      prisma.user.count({ where: { role: 'SEEKER' } }),
      prisma.donorProfile.count({ where: { verificationStatus: 'VERIFIED' } }),
      prisma.bloodRequest.count(),
      prisma.bloodRequest.count({ where: { status: 'OPEN' } }),
      prisma.donationRecord.count(),
      prisma.eligibilityPolicy.findFirst({ where: { isActive: true }, orderBy: { createdAt: 'desc' } }),
      prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
    ]);

    // Group donors by blood group
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const bloodGroupCounts: Record<string, number> = {};
    for (const bg of bloodGroups) {
      bloodGroupCounts[bg] = await prisma.donorProfile.count({ where: { bloodGroup: bg } });
    }

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalDonors,
        totalSeekers,
        verifiedDonors,
        totalRequests,
        openRequests,
        totalDonationRecords,
        bloodGroupCounts,
        policy,
        recentAudits,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
