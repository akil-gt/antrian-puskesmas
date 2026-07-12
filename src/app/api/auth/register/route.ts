import { NextRequest, NextResponse } from 'next/server';
import { AuthError } from '@/lib/route-auth';
import { getUserByUsername, getUserByNIK, createUser } from '@/lib/queries/users';
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

    const existingUsername = await getUserByUsername(username);
    if (existingUsername) {
      return NextResponse.json({ error: 'Username sudah terdaftar' }, { status: 400 });
    }

    const existingNIK = await getUserByNIK(nik);
    if (existingNIK) {
      return NextResponse.json({ error: 'NIK sudah terdaftar' }, { status: 400 });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = {
      nama,
      nik,
      alamat,
      noHp,
      tanggalLahir,
      username,
      password: hashedPassword,
    };

    await createUser(newUser);

    return NextResponse.json({ message: 'Registrasi berhasil' }, { status: 200 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}