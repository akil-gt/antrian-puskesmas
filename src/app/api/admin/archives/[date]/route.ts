import { AuthError, verifyAdmin } from '@/lib/route-auth';
import { getArchive } from '@/lib/queries/archives';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { date: string } }) {
  try {
    verifyAdmin(request);
    const { date } = params;
    const archive = await getArchive(date);
    if (!archive) {
      return NextResponse.json({ error: 'Arsip tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ archive }, { status: 200 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('Archive detail error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}