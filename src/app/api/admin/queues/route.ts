import { AuthError, verifyAdmin } from '@/lib/route-auth';
import { getQueues } from '@/lib/queries/queues';
import { getUsers } from '@/lib/queries/users';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    verifyAdmin(request);
    const users = await getUsers();
    const userMap = new Map<string, typeof users[0]>();
    for (const user of users) {
      userMap.set(user.id, user);
    }

    const data = await getQueues();

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
    console.error('Admin queues error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}