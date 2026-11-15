import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const districtId = searchParams.get('districtId');

    const where = districtId ? { districtId } : {};
    const upazilas = await prisma.geographicUpazila.findMany({
      where,
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, data: upazilas });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch upazilas' }, { status: 500 });
  }
}
