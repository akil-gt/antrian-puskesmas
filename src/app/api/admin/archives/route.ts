import { AuthError, verifyAdmin } from '@/lib/route-auth';
import { getArchiveList } from '@/lib/queries/archives';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    verifyAdmin(request);
    const archives = await getArchiveList();
    return NextResponse.json({ archives }, { status: 200 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('Archive list error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}