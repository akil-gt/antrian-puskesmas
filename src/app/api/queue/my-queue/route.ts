import { NextRequest, NextResponse } from 'next/server';
import { AuthError, verifyToken } from '@/lib/route-auth';
import { getQueues, saveQueues, isQueueExpired } from '@/lib/route-db';

export async function GET(req: NextRequest) {
  try {
    const user = verifyToken(req);
    const data = getQueues();

    let myQueue = data.queues
      .filter((q) => q.userId === user.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] || null;

    if (myQueue && isQueueExpired(myQueue)) {
      myQueue.status = 'hangus';
      myQueue.calledExpired = true;
      const idx = data.queues.findIndex((q) => q.id === myQueue!.id);
      if (idx !== -1) {
        data.queues[idx] = myQueue;
      }
      saveQueues(data);
    }

    return NextResponse.json({ queue: myQueue }, { status: 200 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
