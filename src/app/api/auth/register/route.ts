import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, signSessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { calculateNextEligibleDate, validateDonationDate } from '@/lib/eligibility';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      phone,
      email,
      password,
      role = 'DONOR',
      fullName,
      bloodGroup,
      dateOfBirth,
      gender,
      divisionId,
      districtId,
      upazilaId,
      areaName,
      addressDetails,
      lastDonationDate,
      availabilityStatus = 'AVAILABLE',
      preferredContactMethod = 'PHONE',
      consentGiven = true,
    } = body;

    // Validate phone number (Bangladesh format e.g. 017xxxxxxxx)
    if (!phone || !/^01[3-9]\d{8}$/.test(phone)) {
      return NextResponse.json(
        { success: false, error: 'Valid Bangladesh mobile number (e.g., 01712345678) is required.' },
        { status: 400 }
      );
    }

    // Validate password
    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // Check if phone or email is already registered
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone },
          ...(email ? [{ email }] : []),
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this phone number or email already exists.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const assignedRole = role === 'SEEKER' ? 'SEEKER' : 'DONOR';

    // Create User
    const user = await prisma.user.create({
      data: {
        phone,
        email: email || null,
        passwordHash,
        role: assignedRole,
        isActive: true,
      },
    });

    // If Donor, create DonorProfile
    let donorProfileId: string | undefined;
    if (assignedRole === 'DONOR') {
      if (!fullName || !bloodGroup || !divisionId || !districtId || !upazilaId) {
        // Rollback user creation
        await prisma.user.delete({ where: { id: user.id } });
        return NextResponse.json(
          { success: false, error: 'Full name, blood group, division, district, and upazila are required for donors.' },
          { status: 400 }
        );
      }

      let parsedLastDonation: Date | null = null;
      let calculatedNextEligible: Date | null = null;

      if (lastDonationDate) {
        const dateCheck = validateDonationDate(lastDonationDate);
        if (!dateCheck.isValid || !dateCheck.date) {
          await prisma.user.delete({ where: { id: user.id } });
          return NextResponse.json({ success: false, error: dateCheck.error }, { status: 400 });
        }
        parsedLastDonation = dateCheck.date;
        calculatedNextEligible = calculateNextEligibleDate(parsedLastDonation, 90);
      }

      const profile = await prisma.donorProfile.create({
        data: {
          userId: user.id,
          fullName,
          bloodGroup,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          gender: gender || null,
          divisionId,
          districtId,
          upazilaId,
          areaName: areaName || 'General',
          addressDetails: addressDetails || null,
          availabilityStatus: availabilityStatus || 'AVAILABLE',
          verificationStatus: 'UNVERIFIED',
          lastDonationDate: parsedLastDonation,
          nextEligibleDate: calculatedNextEligible,
          preferredContactMethod,
          consentGiven: Boolean(consentGiven),
        },
      });

      donorProfileId = profile.id;
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTERED',
        resource: `User:${user.id}`,
        details: JSON.stringify({ role: assignedRole, phone }),
      },
    });

    // Create welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'VERIFICATION',
        title: 'Welcome to BloodBond Bangladesh',
        message: assignedRole === 'DONOR'
          ? 'Thank you for registering as a life saver. Keep your availability updated.'
          : 'Your blood seeker account is active. You can now post emergency requests.',
        linkUrl: assignedRole === 'DONOR' ? '/donor/dashboard' : '/seeker/dashboard',
      },
    });

    // Generate session JWT
    const token = signSessionToken({
      id: user.id,
      phone: user.phone,
      email: user.email,
      role: assignedRole,
      fullName: fullName || undefined,
      donorProfileId,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        role: assignedRole,
        fullName,
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, error: 'Registration failed. Please check inputs.' }, { status: 500 });
  }
}
