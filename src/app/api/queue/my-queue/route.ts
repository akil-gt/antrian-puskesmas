import { NextRequest, NextResponse } from 'next/server';
import { AuthError, verifyToken } from '@/lib/route-auth';
import { getQueueByUserId, updateQueueStatus } from '@/lib/queries/queues';

export async function GET(req: NextRequest) {
  try {
    const user = verifyToken(req);
    const myQueue = await getQueueByUserId(user.id);

    if (myQueue && myQueue.status === 'dipanggil' && myQueue.calledAt) {
      const elapsed = (Date.now() - new Date(myQueue.calledAt).getTime()) / (1000 * 60);
      if (elapsed > 5) {
        await updateQueueStatus(myQueue.id, 'hangus', null);
        return NextResponse.json({ queue: { ...myQueue, status: 'hangus', calledExpired: true } }, { status: 200 });
      }
    }

    return NextResponse.json({ queue: myQueue }, { status: 200 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('My queue error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}