import { AuthError, verifyAdmin } from '@/lib/route-auth';
import { deleteQueue } from '@/lib/queries/queues';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    verifyAdmin(request);
    const { id } = params;
    const deleted = await deleteQueue(id);
    
    if (!deleted) {
      return NextResponse.json({ error: 'Antrian tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Antrian berhasil dihapus' }, { status: 200 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('Delete queue error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}