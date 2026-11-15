import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { validateDonationDate, calculateNextEligibleDate } from '@/lib/eligibility';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'DONOR') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const donorProfile = await prisma.donorProfile.findUnique({
      where: { userId: user.id },
      include: {
        donationRecords: {
          orderBy: { donationDate: 'desc' },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: donorProfile?.donationRecords || [],
      profile: {
        lastDonationDate: donorProfile?.lastDonationDate,
        nextEligibleDate: donorProfile?.nextEligibleDate,
        totalDonationsCount: donorProfile?.totalDonationsCount,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch history' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'DONOR') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const donorProfile = await prisma.donorProfile.findUnique({
      where: { userId: user.id },
    });

    if (!donorProfile) {
      return NextResponse.json({ success: false, error: 'Donor profile not found' }, { status: 404 });
    }

    const { donationDate, hospitalName, units = 1, componentType = 'WHOLE_BLOOD', notes } = await request.json();

    if (!hospitalName || !donationDate) {
      return NextResponse.json(
        { success: false, error: 'Hospital/Center name and donation date are required.' },
        { status: 400 }
      );
    }

    // Safety validation: Prevent future dates
    const dateCheck = validateDonationDate(donationDate);
    if (!dateCheck.isValid || !dateCheck.date) {
      return NextResponse.json({ success: false, error: dateCheck.error }, { status: 400 });
    }

    const confirmedDate = dateCheck.date;

    // Get active policy
    const policy = await prisma.eligibilityPolicy.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    const intervalDays = policy?.intervalDays || 90;

    // Create donation record
    const record = await prisma.donationRecord.create({
      data: {
        donorProfileId: donorProfile.id,
        donationDate: confirmedDate,
        hospitalName,
        units: parseInt(units, 10) || 1,
        componentType,
        notes,
      },
    });

    // Determine if this is the newest donation date
    const shouldUpdateLastDate =
      !donorProfile.lastDonationDate || confirmedDate > donorProfile.lastDonationDate;

    let nextEligibleDate = donorProfile.nextEligibleDate;

    if (shouldUpdateLastDate) {
      nextEligibleDate = calculateNextEligibleDate(confirmedDate, intervalDays);

      await prisma.donorProfile.update({
        where: { id: donorProfile.id },
        data: {
          lastDonationDate: confirmedDate,
          nextEligibleDate,
          totalDonationsCount: { increment: 1 },
        },
      });
    } else {
      await prisma.donorProfile.update({
        where: { id: donorProfile.id },
        data: {
          totalDonationsCount: { increment: 1 },
        },
      });
    }

    // Create confirmation notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'ELIGIBILITY_UPDATE',
        title: 'Donation Recorded Successfully',
        message: `Your blood donation at ${hospitalName} has been logged. Estimated next eligible donation date: ${nextEligibleDate?.toISOString().split('T')[0]}.`,
        linkUrl: '/donor/history',
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'DONATION_RECORD_ADDED',
        resource: `DonationRecord:${record.id}`,
        details: JSON.stringify({
          hospital: hospitalName,
          date: confirmedDate,
          nextEligibleDate,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Donation recorded and next eligibility calculated.',
      data: record,
      nextEligibleDate,
    });
  } catch (error) {
    console.error('Record donation error:', error);
    return NextResponse.json({ success: false, error: 'Failed to record donation' }, { status: 500 });
  }
}
