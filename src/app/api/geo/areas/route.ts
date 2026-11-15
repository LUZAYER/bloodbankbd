import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const upazilaId = searchParams.get('upazilaId');

    const where = upazilaId ? { upazilaId } : {};
    const areas = await prisma.geographicArea.findMany({
      where,
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, data: areas });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch areas' }, { status: 500 });
  }
}
