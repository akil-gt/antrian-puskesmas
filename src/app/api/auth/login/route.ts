import { NextRequest, NextResponse } from 'next/server';
import { AuthError, SECRET } from '@/lib/route-auth';
import { getUserByUsername } from '@/lib/queries/users';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { rateLimitByIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const { allowed } = rateLimitByIp(req, 'login', 5, 60000);
    if (!allowed) {
      return NextResponse.json({ error: 'Terlalu banyak percobaan login. Coba lagi nanti.' }, { status: 429 });
    }

    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password wajib diisi' }, { status: 400 });
    }

    const user = await getUserByUsername(username);

    if (!user) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    }

    const valid = bcrypt.compareSync(password, user.password);

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
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}