import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const divisionId = searchParams.get('divisionId');

    const where = divisionId ? { divisionId } : {};
    const districts = await prisma.geographicDistrict.findMany({
      where,
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, data: districts });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch districts' }, { status: 500 });
  }
}
