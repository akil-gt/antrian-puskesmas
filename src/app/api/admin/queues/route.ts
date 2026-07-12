import { AuthError, verifyAdmin } from '@/lib/route-auth';
import { getQueues, saveQueues, getUsers, isQueueExpired } from '@/lib/route-db';
import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@/types';

export async function GET(request: NextRequest) {
  try {
    verifyAdmin(request);
    const users = getUsers();
    const userMap = new Map<string, User>();
    for (const user of users) {
      userMap.set(user.id, user);
    }

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

    const all = data.queues.map((q) => {
      const user = userMap.get(q.userId);
      return {
        ...q,
        nik: user?.nik || '-',
        noHp: user?.noHp || '-',
      };
    });

    return NextResponse.json(
      {
        date: data.date,
        totalQueue: data.counter,
        all,
        menunggu: all.filter((q) => q.status === 'menunggu'),
        dipanggil: all.filter((q) => q.status === 'dipanggil'),
        sedangBerobat: all.filter((q) => q.status === 'sedang_berobat'),
        selesai: all.filter((q) => q.status === 'selesai'),
        hangus: all.filter((q) => q.status === 'hangus'),
      },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
