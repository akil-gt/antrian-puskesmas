import { NextRequest, NextResponse } from 'next/server';
import { AuthError } from '@/lib/route-auth';
import { getUsers, saveUsers } from '@/lib/route-db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { nama, nik, alamat, noHp, tanggalLahir, username, password } = await req.json();

    if (!nama || !nik || !alamat || !noHp || !tanggalLahir || !username || !password) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }

    if (password.length < 3) {
      return NextResponse.json({ error: 'Password minimal 3 karakter' }, { status: 400 });
    }

    if (nik.length < 8) {
      return NextResponse.json({ error: 'NIK minimal 8 karakter' }, { status: 400 });
    }

    const users = getUsers();

    if (users.some((u) => u.username === username)) {
      return NextResponse.json({ error: 'Username sudah terdaftar' }, { status: 400 });
    }

    if (users.some((u) => u.nik === nik)) {
      return NextResponse.json({ error: 'NIK sudah terdaftar' }, { status: 400 });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = {
      id: Date.now().toString(),
      nama,
      nik,
      alamat,
      noHp,
      tanggalLahir,
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    saveUsers([...users, newUser]);

    return NextResponse.json({ message: 'Registrasi berhasil' }, { status: 200 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
