import { NextRequest, NextResponse } from 'next/server';
import { AuthError, SECRET } from '@/lib/route-auth';
import { getUsers } from '@/lib/route-db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password wajib diisi' }, { status: 400 });
    }

    const users = getUsers();
    const user = users.find((u) => u.username === username);

    if (!user) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    }

    const valid = user.password.startsWith('$2a$')
      ? bcrypt.compareSync(password, user.password)
      : user.password === password;

    if (!valid) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, nama: user.nama, role: 'patient' },
      SECRET,
      { expiresIn: '24h' },
    );

    return NextResponse.json(
      { message: 'Login berhasil', token, user: { id: user.id, nama: user.nama, username: user.username } },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
