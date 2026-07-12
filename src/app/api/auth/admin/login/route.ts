import { NextRequest, NextResponse } from 'next/server';
import { AuthError, SECRET } from '@/lib/route-auth';
import { getAdmin } from '@/lib/route-db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const admin = getAdmin();

    const valid = admin.password.startsWith('$2a$')
      ? bcrypt.compareSync(password, admin.password)
      : admin.password === password;

    if (!valid || admin.username !== username) {
      return NextResponse.json({ error: 'Username atau password admin salah' }, { status: 401 });
    }

    const token = jwt.sign({ username: admin.username, nama: 'Admin', role: 'admin' }, SECRET, { expiresIn: '24h' });

    return NextResponse.json({ message: 'Login admin berhasil', token }, { status: 200 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
