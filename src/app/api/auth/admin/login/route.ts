import { NextRequest, NextResponse } from 'next/server';
import { AuthError, SECRET } from '@/lib/route-auth';
import { verifyAdmin } from '@/lib/queries/admin';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { rateLimitByIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const { allowed } = rateLimitByIp(req, 'admin-login', 5, 60000);
    if (!allowed) {
      return NextResponse.json({ error: 'Terlalu banyak percobaan login. Coba lagi nanti.' }, { status: 429 });
    }

    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password wajib diisi' }, { status: 400 });
    }

    const valid = await verifyAdmin(username, password);

    if (!valid) {
      console.warn(`Admin login failed: invalid credentials for username="${username}"`);
      return NextResponse.json({ error: 'Username atau password admin salah' }, { status: 401 });
    }

    const token = jwt.sign({ username, nama: 'Admin', role: 'admin' }, SECRET, { expiresIn: '24h' });

    console.log(`Admin login success: username="${username}"`);
    return NextResponse.json({ message: 'Login admin berhasil', token }, { status: 200 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('Admin login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}