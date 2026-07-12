import { NextRequest, NextResponse } from 'next/server';
import { getMonitorData } from '@/lib/queries/queues';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const response = await getMonitorData();
    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error('Monitor error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}