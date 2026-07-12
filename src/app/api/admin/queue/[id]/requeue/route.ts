import { NextRequest, NextResponse } from 'next/server';
import { AuthError, verifyAdmin } from '@/lib/route-auth';
import { getQueueById, getQueueByUserId, createQueueEntry, getNextQueueNumber } from '@/lib/queries/queues';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    verifyAdmin(request);
    const { id } = params;

    const queue = await getQueueById(id);
    if (!queue) {
      return NextResponse.json({ error: 'Antrian tidak ditemukan' }, { status: 404 });
    }

    if (queue.status !== 'hangus') {
      return NextResponse.json({ error: 'Hanya antrian dengan status hangus yang bisa diambil ulang' }, { status: 400 });
    }

    const activeQueue = await getQueueByUserId(queue.userId);
    if (activeQueue && activeQueue.status !== 'hangus') {
      return NextResponse.json({ error: 'Pasien masih memiliki antrian aktif' }, { status: 400 });
    }

    const nomor = await getNextQueueNumber();
    const newQueue = await createQueueEntry({
      userId: queue.userId,
      nama: queue.nama,
      nomor,
      status: 'menunggu',
      calledAt: null,
    });

    return NextResponse.json({
      message: `Antrian baru ${nomor} untuk ${queue.nama}`,
      queue: newQueue,
    }, { status: 200 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('Requeue error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
