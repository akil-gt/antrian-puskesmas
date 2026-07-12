import { NextRequest, NextResponse } from 'next/server';
import { AuthError, verifyToken } from '@/lib/route-auth';
import { getQueues, saveQueues, resetQueues } from '@/lib/route-db';
import type { QueueEntry } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const user = verifyToken(req);
    let data = getQueues();

    const today = new Date().toISOString().split('T')[0];
    if (data.date !== today) {
      resetQueues();
      data = getQueues();
    }

    const activeQueue = data.queues.find(
      (q) => q.userId === user.id && (q.status === 'menunggu' || q.status === 'dipanggil'),
    );
    if (activeQueue) {
      return NextResponse.json({ error: 'Anda masih memiliki antrian aktif' }, { status: 400 });
    }

    data.counter += 1;
    const newQueue: QueueEntry = {
      id: Date.now().toString(),
      userId: user.id,
      nama: user.nama,
      nomor: `A${String(data.counter).padStart(3, '0')}`,
      status: 'menunggu',
      createdAt: new Date().toISOString(),
      calledAt: null,
      calledExpired: false,
    };

    data.queues.push(newQueue);
    saveQueues(data);

    return NextResponse.json(
      { message: 'Nomor antrian berhasil diambil', queue: newQueue },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
