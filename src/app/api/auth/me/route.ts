import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, user: null }, { status: 401 });
  }

  // Fetch full profile info
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      donorProfile: {
        include: {
          division: true,
          district: true,
          upazila: true,
        },
      },
    },
  });

  return NextResponse.json({
    success: true,
    user: {
      id: dbUser?.id,
      phone: dbUser?.phone,
      email: dbUser?.email,
      role: dbUser?.role,
      donorProfile: dbUser?.donorProfile,
    },
  });
}
