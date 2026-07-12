import { NextRequest, NextResponse } from 'next/server';
import { getQueues, saveQueues, isQueueExpired } from '@/lib/route-db';
import type { MonitorResponse } from '@/types';

export async function GET(_req: NextRequest) {
  try {
    const data = getQueues();
    let changed = false;

    for (const q of data.queues) {
      if (isQueueExpired(q)) {
        q.status = 'hangus';
        q.calledExpired = true;
        changed = true;
      }
    }

    if (changed) {
      saveQueues(data);
    }

    const menunggu = data.queues.filter((q) => q.status === 'menunggu');
    const dipanggil = data.queues.filter((q) => q.status === 'dipanggil');
    const sedangBerobat = data.queues.filter((q) => q.status === 'sedang_berobat');
    const selesai = data.queues.filter((q) => q.status === 'selesai');

    const currentNumber =
      dipanggil.length > 0 ? dipanggil[0].nomor : menunggu.length > 0 ? menunggu[0].nomor : '-';

    const response: MonitorResponse = {
      date: data.date,
      totalQueue: data.queues.length,
      currentNumber,
      menunggu: menunggu.length,
      dipanggil: dipanggil.length,
      sedangBerobat: sedangBerobat.length,
      selesai: selesai.length,
      menungguList: menunggu.map((q) => ({
        id: q.id,
        nomor: q.nomor,
        nama: q.nama,
        createdAt: q.createdAt,
      })),
      dipanggilList: dipanggil.map((q) => ({
        id: q.id,
        nomor: q.nomor,
        nama: q.nama,
        calledAt: q.calledAt,
      })),
      sedangBerobatList: sedangBerobat.map((q) => ({
        id: q.id,
        nomor: q.nomor,
        nama: q.nama,
      })),
      selesaiList: selesai.map((q) => ({
        id: q.id,
        nomor: q.nomor,
        nama: q.nama,
      })),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
