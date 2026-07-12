import { AuthError, verifyAdmin } from '@/lib/route-auth';
import { getQueues, saveQueues } from '@/lib/route-db';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    verifyAdmin(request);
    const { id } = params;
    const data = getQueues();
    const index = data.queues.findIndex((q) => q.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Antrian tidak ditemukan' }, { status: 404 });
    }

    data.queues.splice(index, 1);
    saveQueues(data);

    return NextResponse.json({ message: 'Antrian berhasil dihapus' }, { status: 200 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
