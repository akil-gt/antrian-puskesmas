import { NextRequest, NextResponse } from 'next/server';
import { AuthError, verifyToken } from '@/lib/route-auth';
import { getQueues, createQueueEntry, getNextQueueNumber, getQueueByUserId } from '@/lib/queries/queues';
import type { QueueEntry } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const user = verifyToken(req);
    
    const activeQueue = await getQueueByUserId(user.id);
    if (activeQueue && !['selesai', 'hangus'].includes(activeQueue.status)) {
      return NextResponse.json({ error: 'Anda masih memiliki antrian aktif' }, { status: 400 });
    }

    const nomor = await getNextQueueNumber();
    
    const newQueue = await createQueueEntry({
      userId: user.id,
      nama: user.nama,
      nomor,
      status: 'menunggu',
      calledAt: null,
    });

    return NextResponse.json(
      { message: 'Nomor antrian berhasil diambil', queue: newQueue },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('Take queue error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}