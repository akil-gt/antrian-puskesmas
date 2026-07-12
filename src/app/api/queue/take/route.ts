import { NextRequest, NextResponse } from 'next/server';
import { AuthError, verifyToken } from '@/lib/route-auth';
import { getQueues, createQueueEntry, getNextQueueNumber, getQueueByUserId } from '@/lib/queries/queues';
import type { QueueEntry } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const user = verifyToken(req);
    
    const existingQueue = await getQueueByUserId(user.id);
    if (existingQueue) {
      return NextResponse.json({ error: 'Anda sudah mengambil antrian hari ini. Hubungi admin jika ingin mengambil antrian lagi.' }, { status: 400 });
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