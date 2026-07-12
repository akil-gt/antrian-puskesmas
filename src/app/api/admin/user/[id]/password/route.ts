import bcrypt from 'bcryptjs';
import { AuthError, verifyAdmin } from '@/lib/route-auth';
import { getUsers, saveUsers } from '@/lib/route-db';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    verifyAdmin(request);
    const { id } = params;
    const { password } = await request.json();

    if (!password || password.length < 3) {
      return NextResponse.json({ error: 'Password minimal 3 karakter' }, { status: 400 });
    }

    const users = getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    users[index] = { ...users[index], password: bcrypt.hashSync(password, 10) };
    saveUsers(users);

    return NextResponse.json({ message: 'Password berhasil direset' }, { status: 200 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
