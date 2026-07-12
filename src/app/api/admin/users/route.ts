import { AuthError, verifyAdmin } from '@/lib/route-auth';
import { getUsers } from '@/lib/route-db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    verifyAdmin(request);
    const users = getUsers().map(({ password, ...rest }) => rest);
    return NextResponse.json({ users }, { status: 200 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
