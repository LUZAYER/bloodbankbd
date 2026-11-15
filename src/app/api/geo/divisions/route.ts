import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const divisions = await prisma.geographicDivision.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, data: divisions });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch divisions' }, { status: 500 });
  }
}
