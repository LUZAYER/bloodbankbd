import { NextRequest, NextResponse } from 'next/server';
import { parseEmergencySearchQuery } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ success: false, error: 'Query text is required.' }, { status: 400 });
    }

    const parsed = await parseEmergencySearchQuery(query);

    return NextResponse.json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    console.error('AI query parse error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process AI query' }, { status: 500 });
  }
}
