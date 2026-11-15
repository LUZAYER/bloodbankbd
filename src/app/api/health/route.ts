import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const divisionCount = await prisma.geographicDivision.count();

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'bloodbond-bangladesh',
        database: {
          status: 'connected',
          divisionsLoaded: divisionCount,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Health check database error:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        service: 'bloodbond-bangladesh',
        database: {
          status: 'disconnected',
          error: error?.message || 'Database connection error',
        },
      },
      { status: 503 }
    );
  }
}
