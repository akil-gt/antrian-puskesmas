import { AuthError, verifyAdmin } from '@/lib/route-auth';
import { updateQueueStatus } from '@/lib/queries/queues';
import { NextRequest, NextResponse } from 'next/server';

const validStatuses = ['menunggu', 'dipanggil', 'sedang_berobat', 'selesai', 'hangus'];

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    verifyAdmin(request);
    const { id } = params;
    const { status } = await request.json();

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 });
    }

    const calledAt = status === 'dipanggil' ? new Date().toISOString() : null;
    
    const updated = await updateQueueStatus(id, status, calledAt);
    
    if (!updated) {
      return NextResponse.json({ error: 'Antrian tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Status berhasil diperbarui' }, { status: 200 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('Update status error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}