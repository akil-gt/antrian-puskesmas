import { NextRequest, NextResponse } from 'next/server';
import { AuthError, SECRET } from '@/lib/route-auth';
import { verifyAdmin } from '@/lib/queries/admin';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const valid = await verifyAdmin(username, password);

    if (!valid) {
      return NextResponse.json({ error: 'Username atau password admin salah' }, { status: 401 });
    }

    const token = jwt.sign({ username, nama: 'Admin', role: 'admin' }, SECRET, { expiresIn: '24h' });

    return NextResponse.json({ message: 'Login admin berhasil', token }, { status: 200 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}