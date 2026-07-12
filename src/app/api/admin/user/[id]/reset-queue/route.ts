import { AuthError, verifyAdmin } from '@/lib/route-auth';
import { deleteUserTodayQueue } from '@/lib/queries/queues';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    verifyAdmin(request);
    const { id } = params;
    const deleted = await deleteUserTodayQueue(id);
    
    if (!deleted) {
      return NextResponse.json({ error: 'Pasien tidak memiliki antrian hari ini' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Reset antrian berhasil. Pasien dapat mengambil antrian baru.' }, { status: 200 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('Reset queue error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}