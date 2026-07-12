import { AuthError, verifyAdmin } from '@/lib/route-auth';
import { updateQueueStatus } from '@/lib/queries/queues';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    verifyAdmin(request);
    const { id } = params;
    const calledAt = new Date().toISOString();
    
    const updated = await updateQueueStatus(id, 'dipanggil', calledAt);
    
    if (!updated) {
      return NextResponse.json({ error: 'Antrian tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Pasien berhasil dipanggil' }, { status: 200 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('Call patient error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}