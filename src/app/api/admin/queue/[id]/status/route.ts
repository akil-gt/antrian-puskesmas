import { AuthError, verifyAdmin } from '@/lib/route-auth';
import { getQueues, saveQueues } from '@/lib/route-db';
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

    const data = getQueues();
    const queue = data.queues.find((q) => q.id === id);

    if (!queue) {
      return NextResponse.json({ error: 'Antrian tidak ditemukan' }, { status: 404 });
    }

    queue.status = status;

    if (status === 'dipanggil') {
      queue.calledAt = new Date().toISOString();
    } else if (status === 'selesai' || status === 'hangus') {
      queue.calledAt = null;
    }

    saveQueues(data);

    return NextResponse.json({ message: 'Status berhasil diperbarui', queue }, { status: 200 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
